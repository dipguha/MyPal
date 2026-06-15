# Creates family-member rows and fires Cognito invitation emails on the Family
# step "Continue" (spec F-03 / F-04). Members with an email (including a Child)
# receive an invitation; a Child without an email is created with no login.
#
# Invitations are sent per-member, not in a transaction, so one delivery failure
# does not roll back the others — failures are counted and surfaced as a
# non-blocking warning, never raised (spec NF-06).
class FamilyMemberInvitationService
  ROLE_IDS = { 'admin' => 2, 'adult' => 3, 'grandparent' => 4, 'teenager' => 5, 'child' => 6 }.freeze

  Result = Struct.new(:created, :invited, :failures, keyword_init: true)

  def self.call(owner:, members:)
    created = invited = failures = 0

    members.each do |m|
      role = m[:role].to_s
      member = Member.create!(
        account: owner.account,
        role_id: ROLE_IDS.fetch(role),
        display_name: m[:name],
        first_name: m[:name],
        is_admin: role == 'admin',
        onboarding_complete: false
      )
      MemberSetting.create!(member: member)
      # An added Admin is a Household Managers Group member by default
      # (access-control G-01). Other roles are added to HMG manually (G-02).
      add_to_hmg(owner, member) if role == 'admin'
      created += 1

      email = m[:email].presence
      next if email.nil? # Child without email → no invitation (F-04)

      begin
        sub = CognitoService.admin_create_user(email: email, name: m[:name])
        user = User.create!(account: owner.account, cognito_sub: sub, email: email)
        member.update!(user: user)
        invited += 1
      rescue StandardError => e
        Rails.logger.warn("[Onboarding] invite failed for #{email}: #{e.message}")
        failures += 1
      end
    end

    Result.new(created: created, invited: invited, failures: failures)
  end

  # Adds an added Admin to the account's Household Managers Group (G-01). The HMG
  # is created at sign-up (AccountBootstrapService); guard in case it is absent.
  def self.add_to_hmg(owner, member)
    hmg = owner.account.hmg_group
    GroupMember.create!(group: hmg, member: member, added_by: owner) if hmg
  end
  private_class_method :add_to_hmg
end
