# Infrastructure (Terraform)

Modules are generic; per-environment stacks compose them.

```
modules/        reusable building blocks
environments/   one folder per environment (dev, prod)
```

## Usage

```bash
cd environments/dev
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply
```

State is stored in S3 with a DynamoDB lock table (see `backend.tf`).
