require 'rails_helper'

# Covers the sign-up Gherkin scenarios from platform--sign-up.md §5b/§7 that are
# backend behaviour. Cognito is stubbed — these specs never call AWS. Pure-UI
# scenarios (plan cards, strength meter, etc.) belong in a frontend E2E suite.
RSpec.describe 'Api::V1::Auth sign-up', type: :request do
  let(:json) { response.parsed_body }

  let(:valid_payload) do
    {
      first_name: 'James', last_name: 'Smith',
      email: 'james@example.com', password: 'Test1234!',
      account_type: 'solo', marketing_opt_in: true
    }
  end

  describe 'POST /api/v1/auth/sign-up' do
    # F-09 / §7: Happy path — Individual email/password sign-up
    it 'creates the account, owner member, and HMG group for an Individual plan' do
      # Given Cognito creates the user
      allow(CognitoService).to receive(:sign_up).and_return('cognito-sub-1')

      # When the visitor submits the details form
      post '/api/v1/auth/sign-up', params: valid_payload, as: :json

      # Then an account + owner member + HMG are created and 201 is returned
      expect(response).to have_http_status(:created)
      expect(json['email']).to eq('james@example.com')

      account = Account.last
      expect(account.plan).to eq('solo')
      member = account.members.sole
      expect(member.owner?).to be(true)
      expect(member.is_admin).to be(true)
      expect(member.user.cognito_sub).to eq('cognito-sub-1')
      expect(member.user.marketing_opt_in).to be(true)
      expect(account.account_setting).to be_present
      expect(member.member_setting).to be_present
      expect(account.hmg_group).to be_present
      expect(account.hmg_group.members).to contain_exactly(member)
    end

    # §7: Happy path — Family email/password sign-up
    it 'creates a Family account when account_type is family' do
      # Given a Family plan selection
      allow(CognitoService).to receive(:sign_up).and_return('cognito-sub-2')

      # When the form is submitted
      post '/api/v1/auth/sign-up', params: valid_payload.merge(account_type: 'family'), as: :json

      # Then the account plan is family
      expect(response).to have_http_status(:created)
      expect(Account.last.plan).to eq('family')
    end

    # F-04 / §5b: Server rejects duplicate email
    it 'rejects a duplicate email with email_taken and creates nothing' do
      # Given Cognito reports the user already exists
      allow(CognitoService).to receive(:sign_up)
        .and_raise(CognitoService::Error.new('exists', cognito_code: 'UsernameExistsException'))

      # When a visitor submits with that email
      expect do
        post '/api/v1/auth/sign-up', params: valid_payload, as: :json
      end.not_to change(Account, :count)

      # Then a 422 with an inline-friendly error is returned
      expect(response).to have_http_status(:unprocessable_content)
      expect(json.dig('detail', 'code')).to eq('email_taken')
    end

    # F-05 (server side): weak password rejected by Cognito policy
    it 'surfaces a weak password as weak_password' do
      # Given Cognito rejects the password
      allow(CognitoService).to receive(:sign_up)
        .and_raise(CognitoService::Error.new('Password not long enough', cognito_code: 'InvalidPasswordException'))

      # When submitted
      post '/api/v1/auth/sign-up', params: valid_payload.merge(password: 'weak'), as: :json

      # Then 422 weak_password
      expect(response).to have_http_status(:unprocessable_content)
      expect(json.dig('detail', 'code')).to eq('weak_password')
    end

    # F-06 / §5b: Form submits without a phone number
    it 'succeeds when no phone number is provided' do
      # Given a payload with no phone
      allow(CognitoService).to receive(:sign_up).and_return('cognito-sub-3')

      # When submitted
      post '/api/v1/auth/sign-up', params: valid_payload.except(:marketing_opt_in), as: :json

      # Then the account is created and the user has no phone
      expect(response).to have_http_status(:created)
      expect(Account.last.users.sole.phone).to be_nil
    end

    # §12 DoD: partial failures roll back cleanly + Cognito user removed
    it 'deletes the orphaned Cognito user and creates nothing when the bootstrap fails' do
      # Given Cognito creates the user but the DB write fails
      allow(CognitoService).to receive(:sign_up).and_return('cognito-sub-4')
      allow(CognitoService).to receive(:admin_delete)
      allow(AccountBootstrapService).to receive(:call)
        .and_raise(ActiveRecord::RecordNotUnique.new('dup'))

      # When the form is submitted
      expect do
        post '/api/v1/auth/sign-up', params: valid_payload, as: :json
      end.not_to change(Account, :count)

      # Then the Cognito user is cleaned up
      expect(CognitoService).to have_received(:admin_delete).with(email: 'james@example.com')
    end
  end

  describe 'POST /api/v1/auth/confirm' do
    # F-09 / §7: verification confirms the account
    it 'confirms a valid code' do
      # Given Cognito accepts the code
      allow(CognitoService).to receive(:confirm).and_return(true)

      # When the code is submitted
      post '/api/v1/auth/confirm', params: { email: 'james@example.com', code: '123456' }, as: :json

      # Then 200
      expect(response).to have_http_status(:ok)
    end

    # §7: Error — wrong code
    it 'rejects an invalid code with invalid_code' do
      # Given Cognito reports a code mismatch
      allow(CognitoService).to receive(:confirm)
        .and_raise(CognitoService::Error.new('bad code', cognito_code: 'CodeMismatchException'))

      # When submitted
      post '/api/v1/auth/confirm', params: { email: 'james@example.com', code: '000000' }, as: :json

      # Then 422 invalid_code
      expect(response).to have_http_status(:unprocessable_content)
      expect(json.dig('detail', 'code')).to eq('invalid_code')
    end
  end

  describe 'POST /api/v1/auth/resend-verification' do
    # F-08 / §7: Resend triggers a new verification email
    it 'resends the verification email' do
      # Given Cognito will resend
      allow(CognitoService).to receive(:resend).and_return(true)

      # When the visitor asks to resend
      post '/api/v1/auth/resend-verification', params: { email: 'james@example.com' }, as: :json

      # Then 200 and Cognito was asked to resend
      expect(response).to have_http_status(:ok)
      expect(CognitoService).to have_received(:resend).with(email: 'james@example.com')
    end
  end

  describe 'GET /api/v1/auth/me' do
    # Drives NextAuth's onboarding routing
    it 'returns onboarding state and plan for the authenticated member' do
      # Given an authenticated owner whose onboarding is incomplete
      account = create(:account, :solo)
      member = create(:member, account: account, onboarding_complete: false)

      # When /me is requested with a valid token
      get '/api/v1/auth/me', headers: auth_headers_for(member.user)

      # Then it reports the onboarding flag and plan
      expect(response).to have_http_status(:ok)
      expect(json['onboarding_complete']).to be(false)
      expect(json['account_type']).to eq('solo')
    end

    it 'returns 401 without a token' do
      # When /me is requested unauthenticated
      get '/api/v1/auth/me'

      # Then it is rejected
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
