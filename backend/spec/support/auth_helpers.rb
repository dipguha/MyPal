# Stubs Cognito JWT verification so request specs can authenticate as a member
# without a real token. Returns headers to attach to the request.
module AuthHelpers
  def auth_headers_for(user)
    allow(CognitoJwtVerifier).to receive(:verify)
      .and_return({ 'sub' => user.cognito_sub, 'token_use' => 'access' })
    { 'Authorization' => 'Bearer test-token' }
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :request
end
