module Api
  module V1
    class HealthController < ApplicationController
      skip_before_action :authenticate_request!, only: %i[ping healthz]

      def ping = render(json: { status: 'ok' })

      def healthz = render(json: { status: 'ok' })
    end
  end
end
