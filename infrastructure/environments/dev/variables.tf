variable "region" {
  type    = string
  default = "eu-west-1"
}

variable "project" {
  type    = string
  default = "mypal"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "ses_from_identity_arn" {
  type        = string
  description = "ARN of the verified SES email identity used as the Cognito sender. Null = use Cognito's default email sender (50/day cap)."
  default     = null
}
