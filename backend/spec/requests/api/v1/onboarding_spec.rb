require 'rails_helper'

# Covers the onboarding Gherkin scenarios from platform--onboarding.md §5b/§7
# that are backend behaviour. Cognito is stubbed — these specs never call AWS.
# Pure-UI scenarios (stepper rendering, disabled buttons, back navigation) belong
# in a frontend suite. There is no Profile step (spec v1.3) and Child mirrors
# Teenager, so both are absent here by design.
RSpec.describe 'Api::V1::Onboarding', type: :request do
  let(:json) { response.parsed_body }
  let(:account) { create(:account) } # family plan by default

  # A member who can sign in (has a user). The :child trait nils the user, so
  # child sign-in scenarios pass an explicit user.
  def member_for(*traits, **attrs)
    user = create(:user, account: account)
    create(:member, *traits, account: account, user: user, **attrs)
  end

  describe 'GET /api/v1/onboarding/status' do
    # F-01: stepper adapts to role and plan
    it 'gives Owner on Family plan the 5-step set including Family' do
      # Given an Owner on a Family plan / When status is requested
      owner = member_for
      get '/api/v1/onboarding/status', headers: auth_headers_for(owner.user)

      # Then the step set includes the Family step
      expect(response).to have_http_status(:ok)
      expect(json['steps']).to eq(%w[welcome family briefing interests done])
      expect(json['role']).to eq('owner')
      expect(json['plan']).to eq('family')
    end

    it 'gives Admin on Family plan the Family step too' do
      admin = member_for(:admin)
      get '/api/v1/onboarding/status', headers: auth_headers_for(admin.user)

      expect(json['steps']).to include('family')
      expect(json['steps'].size).to eq(5)
    end

    it 'gives Owner on Individual plan the 4-step set with no Family step' do
      # Given an Owner on a solo plan
      solo = create(:account, :solo)
      owner = create(:member, account: solo, user: create(:user, account: solo))
      get '/api/v1/onboarding/status', headers: auth_headers_for(owner.user)

      expect(json['steps']).to eq(%w[welcome briefing interests done])
    end

    it 'gives non-managing members the 4-step set (Child same as Teenager)' do
      # Given each non-Owner/Admin role / Then none see the Family step
      %i[adult grandparent teenager child].each do |trait|
        member = member_for(trait)
        get '/api/v1/onboarding/status', headers: auth_headers_for(member.user)
        expect(json['steps']).to eq(%w[welcome briefing interests done]), "#{trait} should see 4 steps"
      end
    end
  end

  describe 'POST /api/v1/onboarding/family_members' do
    before { allow(CognitoService).to receive(:admin_create_user) { |email:, **| "sub-#{email}" } }

    # F-03: Owner/Admin can add members
    it 'lets an Owner add a member and creates the row' do
      owner = member_for
      expect do
        post '/api/v1/onboarding/family_members',
             params: { members: [{ name: 'Alex', role: 'adult', email: 'alex@example.com' }] },
             headers: auth_headers_for(owner.user), as: :json
      end.to change(Member, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json['created']).to eq(1)
      expect(account.members.find_by(display_name: 'Alex').role_code).to eq('adult')
    end

    it 'lets an Admin add a member' do
      admin = member_for(:admin)
      post '/api/v1/onboarding/family_members',
           params: { members: [{ name: 'Sam', role: 'teenager', email: 'sam@example.com' }] },
           headers: auth_headers_for(admin.user), as: :json
      expect(response).to have_http_status(:created)
    end

    # F-03: non-Owner/Admin rejected server-side (NF-04)
    it 'rejects non-Owner/Admin roles with 403 and creates nothing' do
      %i[adult grandparent teenager child].each do |trait|
        member = member_for(trait)
        expect do
          post '/api/v1/onboarding/family_members',
               params: { members: [{ name: 'X', role: 'adult', email: 'x@example.com' }] },
               headers: auth_headers_for(member.user), as: :json
        end.not_to change(Member, :count)
        expect(response).to have_http_status(:forbidden), "#{trait} should be forbidden"
      end
    end

    # F-03: member cap (6 including the Owner)
    it 'rejects a member that would exceed the 6-member cap with 422' do
      owner = member_for
      create_list(:member, 5, :adult, account: account) # account now at 6 incl. owner
      expect do
        post '/api/v1/onboarding/family_members',
             params: { members: [{ name: 'One Too Many', role: 'adult', email: 'over@example.com' }] },
             headers: auth_headers_for(owner.user), as: :json
      end.not_to change(Member, :count)
      expect(response).to have_http_status(:unprocessable_content)
      expect(json['code']).to eq('member_cap')
    end

    # F-04: invitations fire on Continue — one per member with an email
    it 'sends exactly one invitation per member with an email (Child without email gets none)' do
      owner = member_for
      post '/api/v1/onboarding/family_members',
           params: { members: [
             { name: 'Adult A', role: 'adult', email: 'a@example.com' },
             { name: 'Adult B', role: 'adult', email: 'b@example.com' },
             { name: 'Kid With', role: 'child', email: 'kid@example.com' },
             { name: 'Kid Without', role: 'child', email: '' }
           ] },
           headers: auth_headers_for(owner.user), as: :json

      expect(response).to have_http_status(:created)
      expect(json['created']).to eq(4)
      expect(json['invited']).to eq(3)
      expect(CognitoService).to have_received(:admin_create_user).exactly(3).times
      expect(CognitoService).not_to have_received(:admin_create_user).with(email: '', name: 'Kid Without')
      # The login-less child still has a member row but no user
      expect(account.members.find_by(display_name: 'Kid Without').user).to be_nil
    end

    # F-04 / NF-06: a delivery failure does not block onboarding
    it 'continues and reports invitation_failures when one email fails' do
      owner = member_for
      allow(CognitoService).to receive(:admin_create_user) do |email:, **|
        raise StandardError, 'delivery failed' if email == 'b@example.com'

        "sub-#{email}"
      end

      post '/api/v1/onboarding/family_members',
           params: { members: [
             { name: 'Adult A', role: 'adult', email: 'a@example.com' },
             { name: 'Adult B', role: 'adult', email: 'b@example.com' }
           ] },
           headers: auth_headers_for(owner.user), as: :json

      expect(response).to have_http_status(:created)
      expect(json['created']).to eq(2)
      expect(json['invited']).to eq(1)
      expect(json['invitation_failures']).to eq(1)
    end
  end

  describe 'PATCH /api/v1/onboarding/briefing' do
    # F-05: every role (incl. Child) can save the briefing
    it 'saves briefing data for every role' do
      %i[admin adult grandparent teenager child].each do |trait|
        member = member_for(trait)
        patch '/api/v1/onboarding/briefing',
              params: { home_postcode: 'NR32 1AA', work_address: 'Norwich',
                        commute_mode: 'transit', news_topics: %w[General Sport] },
              headers: auth_headers_for(member.user), as: :json

        expect(response).to have_http_status(:no_content), "#{trait} should save briefing"
        settings = member.reload.member_setting
        expect(settings.home_postcode).to eq('NR32 1AA')
        expect(settings.commute_mode).to eq('transit')
        expect(settings.news_topics).to eq(%w[General Sport])
      end
    end

    it 'skips cleanly with an empty body and persists nothing' do
      member = member_for(:adult)
      patch '/api/v1/onboarding/briefing', params: {}, headers: auth_headers_for(member.user), as: :json
      expect(response).to have_http_status(:no_content)
      expect(member.reload.member_setting&.home_postcode).to be_blank
    end
  end

  describe 'PATCH /api/v1/onboarding/interests' do
    # F-06: select tags
    it 'saves selected interests' do
      member = member_for(:adult)
      patch '/api/v1/onboarding/interests',
            params: { interests: ['📸 Photography', '⚽ Football', '🚴 Cycling'] },
            headers: auth_headers_for(member.user), as: :json
      expect(response).to have_http_status(:no_content)
      expect(member.reload.member_setting.interests.size).to eq(3)
    end

    # F-06: cap at 5 — extra tags are dropped, not rejected
    it 'caps interests at 5' do
      member = member_for(:adult)
      patch '/api/v1/onboarding/interests',
            params: { interests: %w[a b c d e f] },
            headers: auth_headers_for(member.user), as: :json
      expect(response).to have_http_status(:no_content)
      expect(member.reload.member_setting.interests.size).to eq(5)
    end

    # F-06: Child is allowed (no longer a special case)
    it 'allows a Child to save interests' do
      child = member_for(:child)
      patch '/api/v1/onboarding/interests',
            params: { interests: %w[a b] },
            headers: auth_headers_for(child.user), as: :json
      expect(response).to have_http_status(:no_content)
    end
  end

  describe 'PATCH /api/v1/onboarding/complete' do
    # F-09: flag set server-side
    it 'sets onboarding_complete on the member' do
      member = member_for(:adult, onboarding_complete: false)
      patch '/api/v1/onboarding/complete', headers: auth_headers_for(member.user), as: :json
      expect(response).to have_http_status(:no_content)
      expect(member.reload.onboarding_complete).to be(true)
    end

    # F-09: unauthenticated is rejected and nothing changes
    it 'returns 401 without a token and leaves the flag unchanged' do
      member = member_for(:adult, onboarding_complete: false)
      patch '/api/v1/onboarding/complete', as: :json
      expect(response).to have_http_status(:unauthorized)
      expect(member.reload.onboarding_complete).to be(false)
    end
  end
end
