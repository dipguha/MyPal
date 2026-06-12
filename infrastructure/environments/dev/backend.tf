terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.70"
    }
  }

  backend "s3" {
    bucket         = "mypal-tfstate-dev"
    key            = "dev/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "mypal-tfstate-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Project     = "MyDigitalPal"
      Environment = "dev"
      ManagedBy   = "Terraform"
    }
  }
}
