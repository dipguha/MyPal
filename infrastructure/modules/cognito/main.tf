# Cognito user pool + confidential app client for the Next.js BFF.
# Per ADR-010: web auth uses a confidential client whose secret lives in
# Secrets Manager; mobile (future) will have a separate public client.

locals {
  name = "${var.project}-${var.environment}"
}

resource "aws_cognito_user_pool" "main" {
  name = "${local.name}-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length                   = var.password_min_length
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 7
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  dynamic "email_configuration" {
    for_each = var.ses_source_arn == null ? [1] : []
    content {
      email_sending_account = "COGNITO_DEFAULT"
    }
  }

  dynamic "email_configuration" {
    for_each = var.ses_source_arn == null ? [] : [1]
    content {
      email_sending_account  = "DEVELOPER"
      from_email_address     = var.from_email_address
      reply_to_email_address = coalesce(var.reply_to_email_address, var.from_email_address)
      source_arn             = var.ses_source_arn
    }
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your MyDigitalPal verification code"
    email_message        = "Welcome to MyDigitalPal! Your verification code is {####}."
  }

  schema {
    name                     = "email"
    attribute_data_type      = "String"
    required                 = true
    mutable                  = true
    developer_only_attribute = false
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    name                     = "name"
    attribute_data_type      = "String"
    required                 = true
    mutable                  = true
    developer_only_attribute = false
    string_attribute_constraints {
      min_length = 1
      max_length = 100
    }
  }

  tags = {
    Name = "${local.name}-users"
  }
}

resource "aws_cognito_user_pool_client" "web_bff" {
  name         = "${local.name}-web-bff"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = true

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  allowed_oauth_flows_user_pool_client = true
  supported_identity_providers         = ["COGNITO"]

  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  prevent_user_existence_errors = "ENABLED"

  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30
  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
}

resource "aws_secretsmanager_secret" "cognito_web_client" {
  name        = "${local.name}/cognito/web-bff"
  description = "Cognito web-BFF app client credentials (id, secret, issuer)."
}

resource "aws_secretsmanager_secret_version" "cognito_web_client" {
  secret_id = aws_secretsmanager_secret.cognito_web_client.id
  secret_string = jsonencode({
    client_id     = aws_cognito_user_pool_client.web_bff.id
    client_secret = aws_cognito_user_pool_client.web_bff.client_secret
    issuer        = "https://cognito-idp.${data.aws_region.current.name}.amazonaws.com/${aws_cognito_user_pool.main.id}"
    user_pool_id  = aws_cognito_user_pool.main.id
  })
}

data "aws_region" "current" {}
