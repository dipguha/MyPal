module Api
  module V1
    # Per-member onboarding flow (spec platform--onboarding). Every member may
    # submit their own briefing/interests and complete onboarding; only Owner and
    # Admin on a Family plan may add family members (OnboardingPolicy).
    class OnboardingController < ApplicationController
      ALLOWED_ROLES = %w[admin adult grandparent teenager child].freeze

      # GET /api/v1/onboarding/status
      def status
        render json: OnboardingStatusSerializer.render(OnboardingStatusService.call(current_member))
      end

      # POST /api/v1/onboarding/family_members
      def family_members
        authorize :onboarding, :family_members?
        rows = family_member_params
        return render_error('Account is at capacity (max 6 members)', 'member_cap') if over_capacity?(rows)
        return render_error('Invalid member role', 'invalid_role') unless valid_roles?(rows)

        result = FamilyMemberInvitationService.call(owner: current_member, members: rows)
        render json: { created: result.created, invited: result.invited, invitation_failures: result.failures },
               status: :created
      end

      # PATCH /api/v1/onboarding/briefing
      def briefing
        p = params.permit(:home_postcode, :work_address, :commute_mode, news_topics: [])
        OnboardingService.briefing(
          current_member,
          home_postcode: p[:home_postcode],
          work_address: p[:work_address],
          commute_mode: p[:commute_mode],
          news_topics: p[:news_topics] || []
        )
        head :no_content
      end

      # PATCH /api/v1/onboarding/interests
      def interests
        OnboardingService.interests(current_member, interests: params.permit(interests: []).fetch(:interests, []))
        head :no_content
      end

      # PATCH /api/v1/onboarding/complete
      def complete
        OnboardingService.complete(current_member)
        head :no_content
      end

      private

      def family_member_params
        params.permit(members: %i[name role email]).fetch(:members, []).map { |m| m.to_h.symbolize_keys }
      end

      def over_capacity?(rows)
        current_member.account.members.count + rows.size > 6
      end

      def valid_roles?(rows)
        rows.all? { |r| ALLOWED_ROLES.include?(r[:role]) }
      end

      def render_error(message, code)
        render json: { error: message, code: code }, status: :unprocessable_content
      end
    end
  end
end
