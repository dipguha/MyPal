# Allow the Next.js frontend origin(s) to call the API. Origins come from
# ALLOWED_ORIGINS (comma-separated). See frontend BFF contract + ADR-010.
allowed = ENV.fetch("ALLOWED_ORIGINS", "").split(",").map(&:strip).reject(&:empty?)

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*allowed)
    resource "*",
             headers: :any,
             methods: %i[get post put patch delete options head]
  end
end
