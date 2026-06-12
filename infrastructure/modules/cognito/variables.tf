variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "from_email_address" {
  type        = string
  description = "Sender address. Used only when ses_source_arn is set; otherwise Cognito's default (no-reply@verificationemail.com) is used."
  default     = null
}

variable "reply_to_email_address" {
  type        = string
  description = "Reply-to address for Cognito emails. Defaults to the sender."
  default     = null
}

variable "ses_source_arn" {
  type        = string
  description = "ARN of the verified SES email identity. If null, Cognito's default email sender is used (50/day limit)."
  default     = null
}

variable "callback_urls" {
  type        = list(string)
  description = "Allowed OAuth callback URLs for the web (BFF) app client."
}

variable "logout_urls" {
  type        = list(string)
  description = "Allowed OAuth logout URLs for the web (BFF) app client."
}

variable "password_min_length" {
  type    = number
  default = 8
}
