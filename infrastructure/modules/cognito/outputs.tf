output "user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "user_pool_arn" {
  value = aws_cognito_user_pool.main.arn
}

output "app_client_id" {
  value = aws_cognito_user_pool_client.web_bff.id
}

output "app_client_secret" {
  value     = aws_cognito_user_pool_client.web_bff.client_secret
  sensitive = true
}

output "issuer_url" {
  value = "https://cognito-idp.${data.aws_region.current.name}.amazonaws.com/${aws_cognito_user_pool.main.id}"
}

output "web_bff_secret_arn" {
  value = aws_secretsmanager_secret.cognito_web_client.arn
}

output "cognito_idp_actions_for_task_role" {
  description = "List of cognito-idp actions the FastAPI task role needs (use in an IAM policy scoped to user_pool_arn)."
  value = [
    "cognito-idp:SignUp",
    "cognito-idp:ConfirmSignUp",
    "cognito-idp:ResendConfirmationCode",
    "cognito-idp:AdminDeleteUser",
    "cognito-idp:AdminGetUser",
    "cognito-idp:InitiateAuth",
  ]
}
