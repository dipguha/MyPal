# Headless Pundit policy for onboarding (record is the symbol :onboarding).
# Family invitations are the only role-gated step (spec F-03 / NF-04); briefing
# and interests are open to every authenticated member.
class OnboardingPolicy < ApplicationPolicy
  def family_members?
    current_member.can_manage_family? && current_member.account.plan == 'family'
  end
end
