# Dev environment composition.
#
# ALB — Phase 1 (HTTP only, ADR-008):
#   - HTTP:80 listener only, served on the ALB's auto-generated DNS name
#   - No custom domain, no ACM cert yet
#   - Path rules (same for HTTP and HTTPS):
#       - path_pattern /api/*  → api target group (FastAPI on Fargate)
#       - default              → web target group (Next.js on Fargate)
#
# ALB — HTTPS migration (follow-up PR, ADR-008):
#   - Request ACM cert for dev.mydigitalpals.com (DNS-validated)
#   - Add HTTPS:443 listener with the cert + existing path rules
#   - Change HTTP:80 listener to redirect → HTTPS
#   - Add Route 53 A-record (alias) → ALB
#   - Update Cognito app client callback URLs from http:// to https://

# ── Cognito (user sign-up / sign-in) ─────────────────────────────
#
# The SES identity for "YourDigitalPal@mydigitals" must be verified
# out-of-band before `terraform apply` (Cognito uses SES in DEVELOPER mode).
# In dev, while SES is in the sandbox, only verified recipient addresses
# will receive the verification email.
module "cognito" {
  source         = "../../modules/cognito"
  project        = var.project
  environment    = var.environment
  # Leaving ses_source_arn unset uses Cognito's default sender (50/day cap),
  # which is fine for dev. Swap to a verified SES identity ARN for prod.
  ses_source_arn = var.ses_from_identity_arn

  # Dev: ALB DNS is unknown until ALB exists, so we accept localhost +
  # a placeholder. Update once the ALB is wired and we know its hostname.
  callback_urls = [
    "http://localhost:3000/api/auth/callback/cognito",
  ]
  logout_urls = [
    "http://localhost:3000/",
  ]
}

# Modules below will be wired here as they are implemented in Phase 1.
#
# module "network" {
#   source      = "../../modules/network"
#   project     = var.project
#   environment = var.environment
# }
#
# module "database" {
#   source      = "../../modules/database"
#   project     = var.project
#   environment = var.environment
#   vpc_id      = module.network.vpc_id
#   subnet_ids  = module.network.private_subnet_ids
# }
#
# module "alb" {
#   source            = "../../modules/alb"
#   project           = var.project
#   environment       = var.environment
#   vpc_id            = module.network.vpc_id
#   public_subnet_ids = module.network.public_subnet_ids
#   enable_https      = false   # set to true when adding TLS (ADR-008)
# }
