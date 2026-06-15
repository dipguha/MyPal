# Self-serve onboarding steps (briefing, interests, completion). Each persists
# server-side on the step's "Continue" so partial progress survives re-entry
# (spec NF-05). Family invitations are handled by FamilyMemberInvitationService.
class OnboardingService
  def self.briefing(member, home_postcode:, work_address:, commute_mode:, news_topics:)
    settings_for(member).update!(
      home_postcode: home_postcode,
      work_address: work_address,
      commute_mode: commute_mode,
      news_topics: Array(news_topics)
    )
  end

  def self.interests(member, interests:)
    settings_for(member).update!(interests: Array(interests).first(5)) # hard cap per F-06
  end

  def self.complete(member)
    member.update!(onboarding_complete: true)
  end

  # Every member is bootstrapped with a member_setting, but build defensively.
  def self.settings_for(member)
    member.member_setting || member.create_member_setting!
  end
  private_class_method :settings_for
end
