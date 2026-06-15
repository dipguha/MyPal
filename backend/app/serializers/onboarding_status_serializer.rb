# Renders the OnboardingStatusService hash for GET /api/v1/onboarding/status.
class OnboardingStatusSerializer < Blueprinter::Base
  fields :role, :plan, :steps,
         :family_complete, :briefing_complete, :interests_complete,
         :onboarding_complete, :invitation_warning
end
