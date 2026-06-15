# Server-side AWS Cognito calls for the sign-up flow.
#
# SignUp / ConfirmSignUp / ResendConfirmationCode are unauthenticated operations
# called over plain REST (mirrors frontend/src/lib/cognito-auth.ts) — they only
# need the app client id/secret + a computed SECRET_HASH (the dev client is
# confidential). AdminDeleteUser is an admin op and goes through the AWS SDK
# (needs IAM creds); used best-effort for bootstrap rollback cleanup.
require 'net/http'
require 'json'
require 'base64'
require 'openssl'

class CognitoService
  class Error < StandardError
    attr_reader :cognito_code

    def initialize(message, cognito_code: nil)
      super(message)
      @cognito_code = cognito_code
    end
  end

  class << self
    # @return [String] the new user's Cognito sub
    # `name` is required by the user pool schema (standard OIDC `name` claim).
    def sign_up(email:, password:, name:, phone: nil)
      attributes = [
        { 'Name' => 'email', 'Value' => email },
        { 'Name' => 'name',  'Value' => name }
      ]
      attributes << { 'Name' => 'phone_number', 'Value' => phone } if phone.present?

      response = call('SignUp', {
                        'ClientId' => client_id,
                        'SecretHash' => secret_hash(email),
                        'Username' => email,
                        'Password' => password,
                        'UserAttributes' => attributes
                      })
      response['UserSub']
    end

    def confirm(email:, code:)
      call('ConfirmSignUp', {
             'ClientId' => client_id,
             'SecretHash' => secret_hash(email),
             'Username' => email,
             'ConfirmationCode' => code
           })
      true
    end

    def resend(email:)
      call('ResendConfirmationCode', {
             'ClientId' => client_id,
             'SecretHash' => secret_hash(email),
             'Username' => email
           })
      true
    end

    # Best-effort rollback cleanup. Requires IAM creds; logs and returns false
    # if unavailable (the unconfirmed user then expires per pool policy).
    def admin_delete(email:)
      admin_client.admin_delete_user(
        user_pool_id: ENV.fetch('COGNITO_USER_POOL_ID'),
        username: email
      )
      true
    rescue StandardError => e
      Rails.logger.warn("[CognitoService] admin_delete failed for #{email}: #{e.message}")
      false
    end

    def secret_hash(username)
      Base64.strict_encode64(
        OpenSSL::HMAC.digest('SHA256', client_secret, username + client_id)
      )
    end

    # Creates a Cognito user and sends the built-in invitation email (with a
    # temporary password). Used for family-member invitations during onboarding.
    # Admin op — requires IAM creds (like admin_delete).
    # @return [String] the new user's Cognito sub
    def admin_create_user(email:, name:)
      response = admin_client.admin_create_user(
        user_pool_id: ENV.fetch('COGNITO_USER_POOL_ID'),
        username: email,
        user_attributes: [
          { name: 'email', value: email },
          { name: 'email_verified', value: 'true' },
          { name: 'name', value: name }
        ],
        desired_delivery_mediums: ['EMAIL']
      )
      response.user.attributes.find { |a| a.name == 'sub' }&.value
    end

    private

    def client_id = ENV.fetch('COGNITO_CLIENT_ID')
    def client_secret = ENV.fetch('COGNITO_CLIENT_SECRET')

    def endpoint
      URI("https://cognito-idp.#{ENV.fetch('AWS_REGION')}.amazonaws.com/")
    end

    def admin_client
      Aws::CognitoIdentityProvider::Client.new(region: ENV.fetch('AWS_REGION'))
    end

    def call(action, body)
      request = Net::HTTP::Post.new(endpoint)
      request['Content-Type'] = 'application/x-amz-json-1.1'
      request['X-Amz-Target'] = "AWSCognitoIdentityProviderService.#{action}"
      request.body = JSON.generate(body)

      response = Net::HTTP.start(endpoint.host, endpoint.port, use_ssl: true) do |http|
        http.request(request)
      end

      json = JSON.parse(response.body.presence || '{}')
      return json if response.is_a?(Net::HTTPSuccess)

      code = json['__type'].to_s.split('#').last
      raise Error.new(json['message'].presence || 'Cognito request failed', cognito_code: code)
    end
  end
end
