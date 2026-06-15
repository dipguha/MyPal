# infrastructure/CLAUDE.md

| | |
|---|---|
| **File** | `infrastructure/CLAUDE.md` |
| **Purpose** | Terraform **conventions** for MyPal — module/environment layout, state, tags, naming, module-authoring rules, OIDC. For *what* we deploy see `infrastructure/deployment-architecture.md`; for *why* see `docs/adrs.md` (ADR-016). For global rules see the root `CLAUDE.md`. |
| **Version** | 1.0 |
| **Updated by** | Claude Code |
| **Last updated** | 14/06/2026 17:12 UTC |

**Maintaining this file.** Every edit must: (1) bump the **Version** (patch wording, minor new rule, major restructure), (2) update **Last updated** to the current UTC time (`date -u +"%d/%m/%Y %H:%M UTC"`), (3) set **Updated by**, (4) append a revision-history row. This file owns Terraform **conventions only** — never the topology (that's `deployment-architecture.md`) or decision rationale (that's an ADR).

---

## Layout

```
infrastructure/
├── modules/         reusable, environment-agnostic building blocks
│   └── <name>/      main.tf · variables.tf · outputs.tf
└── environments/    per-environment stacks that compose modules
    ├── dev-base/    persistent stack  (network, ACM cert, ECR, secrets)
    ├── dev/         ephemeral stack   (NAT, ALB, ECS, RDS, DNS)
    └── prod/        (later)
```

**Base vs ephemeral split (ADR-016).** Each deployable environment is two stacks with separate state:
- **base** — persistent, ~free, created once: network skeleton, ACM cert, ECR repos, Secrets Manager.
- **ephemeral** — the hourly-billed resources (NAT, ALB, ECS, RDS, DNS record); `apply`/`destroy` per session.

The ephemeral stack reads the base via `data "terraform_remote_state" "base"`. Keep that the **only** cross-stack coupling.

---

## Remote state

S3 backend with a DynamoDB lock (one bucket, one key per stack):

- Bucket `mypal-tfstate-dev`, lock table `mypal-tfstate-lock`, region `eu-west-1`, `encrypt = true`.
- Keys: `dev-base/terraform.tfstate`, `dev/terraform.tfstate`, etc.
- The bucket + lock table are bootstrapped **once** (out of band); never managed by the stacks that use them.

---

## Mandatory default tags

Every environment's `provider "aws"` sets `default_tags`:

```hcl
default_tags {
  tags = {
    Project     = "MyPal"        # NOT "MyDigitalPal"
    Environment = var.environment # dev | uat | prod
    ManagedBy   = "Terraform"
  }
}
```

Do not hand-tag individual resources with these — rely on `default_tags`.

---

## Naming & versions

- Resource names are prefixed **`${project}-${environment}-`** (e.g. `mypal-dev-alb`, `mypal-dev-rds`).
- Pin: `required_version >= 1.7`; AWS provider `~> 5.70`.
- Region comes from `var.region` (default `eu-west-1`); never hardcode it in modules.

---

## Module-authoring rules

- Three files per module: `main.tf`, `variables.tf`, `outputs.tf`.
- Every module takes `project` and `environment` plus its specific inputs; it must be **environment-agnostic** — no `terraform_remote_state`, no env-specific literals, no account IDs inside modules. Wiring between modules happens in the **environment root**.
- Expose IDs/ARNs/endpoints other stacks need as **outputs**; never reach into another module's internals.
- No secrets or account/region literals in code or committed `*.tfvars`. Provide a `terraform.tfvars.example`; keep real `*.tfvars` gitignored.
- Security-group *rules* that reference other SGs live in the environment root (to avoid circular module deps); a module may create its own SG and accept peer SG ids as inputs.

---

## Secrets & identity

- Secrets live in **AWS Secrets Manager / SSM** and are injected into ECS task definitions by ARN — never baked into images, code, or state-visible variables.
- Task roles are **least-privilege** (e.g. `secretsmanager:GetSecretValue` on named secrets; `cognito-idp:AdminDeleteUser` on the pool only).
- The **Cognito user pool is reused, not managed here** (`mypal-dev-users`, `eu-west-1_nCIdduU2J`) — reference it via variables/`data`, do not create it in these stacks.

---

## CI/CD (OIDC) — intended, deferred

GitHub Actions authenticates to AWS via **OIDC federation** (an IAM role assumed by the workflow — no long-lived access keys). The `modules/ci` module owns that role and the ECR/ECS deploy permissions. Not built for the first manual deploy.

---

## How to add a new module

1. Create `modules/<name>/{main.tf,variables.tf,outputs.tf}` following the authoring rules above.
2. Add `project`/`environment` variables; expose outputs.
3. Compose it in the relevant environment root (`dev-base/` or `dev/`), wiring inputs from other modules' outputs or `terraform_remote_state`.
4. `terraform fmt`, `terraform validate`, then `terraform plan` before any `apply`.

---

## Revision history

| Version | Updated by | Last updated (UTC) | Summary |
|---|---|---|---|
| 1.0 | Claude Code | 14/06/2026 17:12 UTC | Initial version. Terraform conventions: module/environment layout, base/ephemeral split (ADR-016), S3+DynamoDB state, mandatory default tags (Project=MyPal), naming/versions, module-authoring rules, secrets/identity (reuse Cognito), OIDC CI intent, how-to-add-a-module. |
