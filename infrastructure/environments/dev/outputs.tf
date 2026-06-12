output "cognito_user_pool_id" {
  value = module.cognito.user_pool_id
}

output "cognito_issuer_url" {
  value = module.cognito.issuer_url
}

output "cognito_web_bff_client_id" {
  value = module.cognito.app_client_id
}

output "cognito_web_bff_secret_arn" {
  value = module.cognito.web_bff_secret_arn
}
