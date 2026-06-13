Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post "auth/sign-up",             to: "auth#sign_up"
      post "auth/confirm",             to: "auth#confirm"
      post "auth/resend-verification", to: "auth#resend"
      get  "auth/me",                  to: "auth#me"
      get  "ping",                     to: "health#ping"
    end
  end

  get "/healthz", to: "api/v1/health#healthz"

  # Rails' built-in boot check.
  get "up" => "rails/health#show", as: :rails_health_check
end
