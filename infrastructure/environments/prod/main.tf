# Prod environment composition.
#
# Domain & TLS (to be wired in Phase 1):
#   - Route 53 hosted zone for mydigitalpals.com (lives in this account)
#   - Apex + www: mydigitalpals.com, www.mydigitalpals.com → ALB
#   - ACM certificate (DNS-validated) for both names
#   - ALB listeners:
#       - HTTPS:443 with the ACM cert
#       - HTTP:80   redirects to HTTPS
#   - ALB listener rules:
#       - path_pattern /api/*  → api target group (FastAPI on Fargate)
#       - default              → web target group (Next.js on Fargate)
#
# Modules will be wired here as they are implemented in Phase 1.
