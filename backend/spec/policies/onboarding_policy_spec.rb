require 'rails_helper'

RSpec.describe OnboardingPolicy do
  describe '#family_members?' do
    context 'on a Family plan' do
      let(:account) { create(:account) }

      it 'permits an Owner' do
        member = create(:member, account: account)
        expect(described_class.new(member, :onboarding).family_members?).to be(true)
      end

      it 'permits an Admin' do
        member = create(:member, :admin, account: account)
        expect(described_class.new(member, :onboarding).family_members?).to be(true)
      end

      %i[adult grandparent teenager child].each do |trait|
        it "forbids a #{trait}" do
          member = create(:member, trait, account: account)
          expect(described_class.new(member, :onboarding).family_members?).to be(false)
        end
      end
    end

    context 'on an Individual plan' do
      it 'forbids the Owner — no family management on solo' do
        account = create(:account, :solo)
        member = create(:member, account: account)
        expect(described_class.new(member, :onboarding).family_members?).to be(false)
      end
    end
  end
end
