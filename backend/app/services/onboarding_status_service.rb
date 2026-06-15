# Computes the onboarding step set + per-step completion for a member. Single
# source of truth for which steps a role/plan sees (mirrored on the frontend).
# Returns a plain hash rendered by OnboardingStatusSerializer.
#
# Completion is derived from data presence — skipped optional steps save nothing,
# so "no data ⇒ dash, data ⇒ checkmark" satisfies the Done screen (spec F-07).
class OnboardingStatusService
  def self.call(member)
    settings = member.member_setting
    {
      role: member.role_code,
      plan: member.account.plan,
      steps: steps_for(member),
      family_complete: member.account.members.where.not(id: member.id).exists?,
      briefing_complete: briefing_complete?(settings),
      interests_complete: settings.present? && settings.interests.any?,
      onboarding_complete: member.onboarding_complete,
      invitation_warning: false
    }
  end

  # Owner/Admin on a Family plan get the Family step; every member gets Briefing
  # and Interests (Child included). There is no Profile step (spec v1.3).
  def self.steps_for(member)
    steps = %w[welcome]
    steps << 'family' if member.can_manage_family? && member.account.plan == 'family'
    steps += %w[briefing interests]
    steps << 'done'
    steps
  end

  def self.briefing_complete?(settings)
    return false if settings.blank?

    settings.home_postcode.present? || settings.work_address.present? ||
      settings.commute_mode.present? || settings.news_topics.any?
  end
end
