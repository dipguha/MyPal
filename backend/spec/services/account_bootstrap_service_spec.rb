require 'rails_helper'

RSpec.describe AccountBootstrapService do
  let(:args) do
    {
      sub: 'cognito-sub-boot', email: 'owner@example.com',
      first_name: 'Sarah', last_name: 'Smith', account_type: 'family',
      phone: nil, marketing_opt_in: true
    }
  end

  it 'creates the full account graph with the owner in the HMG' do
    account = described_class.call(**args)

    member = account.members.sole
    expect(account.plan).to eq('family')
    expect(member.owner?).to be(true)
    expect(member.is_admin).to be(true)
    expect(member.display_name).to eq('Sarah')
    expect(member.user.cognito_sub).to eq('cognito-sub-boot')
    expect(member.user.marketing_opt_in).to be(true)
    expect(account.account_setting).to be_present
    expect(member.member_setting).to be_present
    expect(account.hmg_group.type).to eq('hmg')
    expect(account.hmg_group.members).to contain_exactly(member)
  end

  it 'rolls back entirely when a record is invalid' do
    # An invalid plan fails the Account validation mid-transaction.
    expect do
      described_class.call(**args, account_type: 'bogus')
    end.to raise_error(ActiveRecord::RecordInvalid)

    expect(Account.count).to eq(0)
    expect(User.count).to eq(0)
    expect(Member.count).to eq(0)
  end
end
