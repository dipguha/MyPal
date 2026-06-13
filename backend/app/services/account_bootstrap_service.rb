# Creates the full account graph for a freshly-signed-up Owner, in one
# transaction (spec §10): account + settings + user + owner member + settings +
# HMG group with the owner as its first member (access-control G-01).
#
# Called AFTER CognitoService.sign_up returns a sub. If the transaction fails,
# the caller deletes the orphaned Cognito user (best-effort).
class AccountBootstrapService
  OWNER_ROLE_ID = 1 # member_roles.code = 'owner' (see reseed migration)

  def self.call(sub:, email:, first_name:, last_name:, account_type:, phone: nil, marketing_opt_in: false)
    ActiveRecord::Base.transaction do
      account = Account.create!(plan: account_type)
      AccountSetting.create!(account: account)

      user = User.create!(
        account: account,
        cognito_sub: sub,
        email: email,
        phone: phone,
        marketing_opt_in: marketing_opt_in
      )

      member = Member.create!(
        account: account,
        user: user,
        role_id: OWNER_ROLE_ID,
        display_name: first_name,
        first_name: first_name,
        last_name: last_name,
        is_admin: true
      )
      MemberSetting.create!(member: member)

      hmg = Group.create!(account: account, type: 'hmg')
      GroupMember.create!(group: hmg, member: member, added_by: member)

      account
    end
  end
end
