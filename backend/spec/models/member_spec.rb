require 'rails_helper'

RSpec.describe Member do
  describe 'role predicates' do
    it 'identifies an owner' do
      expect(build(:member).owner?).to be(true)
    end

    it 'identifies an admin' do
      expect(build(:member, :admin).admin?).to be(true)
    end

    it 'is not owner for an adult member' do
      expect(build(:member, :adult).owner?).to be(false)
    end
  end

  describe '#is_hmg?' do
    let(:account) { create(:account) }
    let(:member)  { create(:member, account: account) }

    it 'is false when an HMG group exists but the member is not in it' do
      Group.create!(account: account, type: 'hmg') # group exists; member not added
      expect(member.is_hmg?).to be(false)
    end

    it 'is true once the member is added to the HMG group' do
      group = Group.create!(account: account, type: 'hmg')
      GroupMember.create!(group: group, member: member, added_by: member)
      expect(member.is_hmg?).to be(true)
    end

    it 'is false when no HMG group exists for the account' do
      expect(member.is_hmg?).to be(false)
    end
  end
end
