# Verifies a Cognito access token against the user pool's JWKS endpoint.
# Returns the decoded payload hash on success; raises JWT::DecodeError on any
# failure (expired, bad signature, wrong issuer/token_use/client). See ADR-010.
require 'net/http'
require 'json'

class CognitoJwtVerifier
  class << self
    def issuer
      "https://cognito-idp.#{ENV.fetch('AWS_REGION')}.amazonaws.com/#{ENV.fetch('COGNITO_USER_POOL_ID')}"
    end

    def jwks_url
      "#{issuer}/.well-known/jwks.json"
    end

    # @return [Hash] decoded token claims
    # @raise [JWT::DecodeError]
    def verify(token)
      payload, _header = JWT.decode(
        token,
        nil,
        true,
        algorithms: ['RS256'],
        jwks: jwks,
        iss: issuer,
        verify_iss: true
      )
      validate_claims!(payload)
      payload
    rescue JWT::DecodeError
      raise
    rescue StandardError => e
      raise JWT::DecodeError, e.message
    end

    private

    def validate_claims!(payload)
      raise JWT::DecodeError, 'Unexpected token_use' unless payload['token_use'] == 'access'

      expected_client = ENV.fetch('COGNITO_CLIENT_ID', nil)
      return unless expected_client && payload['client_id'] && payload['client_id'] != expected_client

      raise JWT::DecodeError, 'client_id mismatch'
    end

    # JWKS memoised for the life of the process. Cognito rotates keys rarely;
    # restart (or a future TTL cache) picks up new keys.
    def jwks
      @jwks ||= JWT::JWK::Set.new(JSON.parse(Net::HTTP.get(URI(jwks_url))))
    end
  end
end
