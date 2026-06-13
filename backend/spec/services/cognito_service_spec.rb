require 'rails_helper'

RSpec.describe CognitoService do
  def http_response(klass, body)
    klass.new('1.1', klass == Net::HTTPOK ? '200' : '400', 'msg').tap do |res|
      allow(res).to receive(:body).and_return(body.to_json)
    end
  end

  describe '.secret_hash' do
    it 'is the base64 HMAC-SHA256 of username+client_id keyed by the secret' do
      expected = Base64.strict_encode64(
        OpenSSL::HMAC.digest('SHA256', ENV.fetch('COGNITO_CLIENT_SECRET'),
                             "user@example.com#{ENV.fetch('COGNITO_CLIENT_ID')}")
      )
      expect(described_class.secret_hash('user@example.com')).to eq(expected)
    end
  end

  describe '.sign_up' do
    it 'returns the UserSub on success' do
      allow(Net::HTTP).to receive(:start).and_return(http_response(Net::HTTPOK, { 'UserSub' => 'sub-123' }))

      sub = described_class.sign_up(email: 'a@b.com', password: 'Test1234!', name: 'A B')
      expect(sub).to eq('sub-123')
    end

    it 'raises CognitoService::Error carrying the parsed cognito_code on failure' do
      body = { '__type' => 'com.amazonaws.cognito#UsernameExistsException', 'message' => 'exists' }
      allow(Net::HTTP).to receive(:start).and_return(http_response(Net::HTTPBadRequest, body))

      expect { described_class.sign_up(email: 'a@b.com', password: 'x', name: 'A') }
        .to raise_error(an_instance_of(CognitoService::Error)
          .and(having_attributes(cognito_code: 'UsernameExistsException')))
    end
  end
end
