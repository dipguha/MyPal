module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_request!, only: %i[sign_up confirm resend]

      # POST /api/v1/auth/sign-up
      def sign_up
        p = sign_up_params
        full_name = [p[:first_name], p[:last_name]].compact_blank.join(' ')
        sub = CognitoService.sign_up(
          email: p[:email],
          password: p[:password],
          name: full_name,
          phone: p[:phone].presence
        )

        begin
          AccountBootstrapService.call(
            sub: sub,
            email: p[:email],
            first_name: p[:first_name],
            last_name: p[:last_name],
            account_type: p[:account_type],
            phone: p[:phone].presence,
            marketing_opt_in: ActiveModel::Type::Boolean.new.cast(p[:marketing_opt_in]) || false
          )
        rescue StandardError => e
          # DB write failed after the Cognito user was created — remove the
          # orphaned (unconfirmed) Cognito user so the email can be retried.
          CognitoService.admin_delete(email: p[:email])
          raise e
        end

        render json: { email: p[:email] }, status: :created
      rescue CognitoService::Error => e
        render json: { detail: cognito_error(e) }, status: :unprocessable_content
      rescue ActiveRecord::RecordNotUnique
        render json: { detail: email_taken_error }, status: :unprocessable_content
      end

      # POST /api/v1/auth/confirm
      def confirm
        CognitoService.confirm(email: params[:email], code: params[:code])
        render json: { ok: true }, status: :ok
      rescue CognitoService::Error => e
        render json: { detail: cognito_error(e) }, status: :unprocessable_content
      end

      # POST /api/v1/auth/resend-verification
      def resend
        CognitoService.resend(email: params[:email])
        render json: { ok: true }, status: :ok
      rescue CognitoService::Error => e
        render json: { detail: cognito_error(e) }, status: :unprocessable_content
      end

      # GET /api/v1/auth/me  (authenticated — read by NextAuth jwt callback)
      def me
        render json: {
          onboarding_complete: current_member&.onboarding_complete || false,
          account_type: current_member&.account&.plan
        }
      end

      private

      def sign_up_params
        params.permit(:first_name, :last_name, :email, :password, :phone, :marketing_opt_in, :account_type)
      end

      def email_taken_error
        { code: 'email_taken', detail: 'An account with this email already exists — sign in instead' }
      end

      def cognito_error(err)
        case err.cognito_code
        when 'UsernameExistsException'
          email_taken_error
        when 'InvalidPasswordException'
          { code: 'weak_password', detail: err.message }
        when 'CodeMismatchException', 'ExpiredCodeException'
          { code: 'invalid_code', detail: 'That code is invalid or has expired. Please try again.' }
        when 'LimitExceededException', 'TooManyRequestsException'
          { code: 'rate_limited', detail: 'Too many attempts. Please wait a moment and try again.' }
        else
          { code: 'cognito_error', detail: err.message }
        end
      end
    end
  end
end
