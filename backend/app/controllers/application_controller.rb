class ApplicationController < ActionController::API
  include Pundit::Authorization

  before_action :authenticate_request!

  rescue_from Pundit::NotAuthorizedError, with: :forbidden
  rescue_from JWT::DecodeError,           with: :unauthorised

  private

  # Verifies the Cognito JWT and resolves the current member. Public endpoints
  # (sign-up, confirm, resend) skip this via `skip_before_action`.
  def authenticate_request!
    token = request.headers['Authorization']&.split&.last
    raise JWT::DecodeError, 'Missing token' unless token

    payload = CognitoJwtVerifier.verify(token)
    @current_user = User.find_by(cognito_sub: payload['sub'])
    raise JWT::DecodeError, 'Unknown user' unless @current_user

    @current_member = @current_user.member
  end

  attr_reader :current_user, :current_member

  # Pundit policies always receive the member, never the user (ADR-002).
  def pundit_user = current_member

  def forbidden
    render json: { error: 'Forbidden', code: 'forbidden' }, status: :forbidden
  end

  def unauthorised
    render json: { error: 'Unauthorised', code: 'unauthorised' }, status: :unauthorized
  end
end
