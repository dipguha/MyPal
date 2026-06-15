require 'rails_helper'

RSpec.describe FamilyMemberInvitationService do
  let(:account) { create(:account) }
  let(:owner) { create(:member, account: account) }

  before { allow(CognitoService).to receive(:admin_create_user) { |email:, **| "sub-#{email}" } }

  it 'creates a member and a member_setting per entry' do
    result = described_class.call(owner: owner, members: [{ name: 'Alex', role: 'adult', email: 'alex@example.com' }])

    expect(result.created).to eq(1)
    member = account.members.find_by(display_name: 'Alex')
    expect(member.member_setting).to be_present
    expect(member.role_code).to eq('adult')
  end

  it 'sets is_admin for an added Admin' do
    described_class.call(owner: owner, members: [{ name: 'Adm', role: 'admin', email: 'adm@example.com' }])
    expect(account.members.find_by(display_name: 'Adm').is_admin).to be(true)
  end

  it 'links a user only when an invitation is sent' do
    result = described_class.call(owner: owner, members: [{ name: 'Kid', role: 'child', email: '' }])

    expect(result.invited).to eq(0)
    expect(account.members.find_by(display_name: 'Kid').user).to be_nil
  end

  it 'isolates a single invitation failure' do
    allow(CognitoService).to receive(:admin_create_user) do |email:, **|
      raise StandardError, 'boom' if email == 'b@example.com'

      "sub-#{email}"
    end

    result = described_class.call(owner: owner, members: [
                                    { name: 'A', role: 'adult', email: 'a@example.com' },
                                    { name: 'B', role: 'adult', email: 'b@example.com' }
                                  ])

    expect(result.created).to eq(2)
    expect(result.invited).to eq(1)
    expect(result.failures).to eq(1)
  end
end
