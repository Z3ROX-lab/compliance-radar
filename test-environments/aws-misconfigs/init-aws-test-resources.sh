#!/bin/bash
# Initialize LocalStack with intentionally misconfigured AWS resources for testing

echo "🚀 Initializing LocalStack with vulnerable AWS resources..."

# Wait for LocalStack to be ready
echo "⏳ Waiting for LocalStack..."
sleep 5

# Set AWS CLI to use LocalStack
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

# Create S3 buckets with misconfigurations
echo "📦 Creating S3 buckets (with vulnerabilities)..."

# Public bucket (CRITICAL)
aws --endpoint-url=$AWS_ENDPOINT_URL s3 mb s3://prod-data-backups
aws --endpoint-url=$AWS_ENDPOINT_URL s3api put-bucket-acl --bucket prod-data-backups --acl public-read
echo "Created: prod-data-backups (PUBLIC - CRITICAL)"

# Bucket without encryption (HIGH)
aws --endpoint-url=$AWS_ENDPOINT_URL s3 mb s3://app-logs-unencrypted
echo "Created: app-logs-unencrypted (NO ENCRYPTION - HIGH)"

# Bucket without versioning (MEDIUM)
aws --endpoint-url=$AWS_ENDPOINT_URL s3 mb s3://documents-no-versioning
echo "Created: documents-no-versioning (NO VERSIONING - MEDIUM)"

# Create IAM users with misconfigurations
echo "👤 Creating IAM users (with vulnerabilities)..."

# User without MFA (HIGH)
aws --endpoint-url=$AWS_ENDPOINT_URL iam create-user --user-name admin-user
aws --endpoint-url=$AWS_ENDPOINT_URL iam attach-user-policy --user-name admin-user --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
echo "Created: admin-user (NO MFA - HIGH)"

# User with overly permissive policy (MEDIUM)
aws --endpoint-url=$AWS_ENDPOINT_URL iam create-user --user-name dev-user
aws --endpoint-url=$AWS_ENDPOINT_URL iam attach-user-policy --user-name dev-user --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
echo "Created: dev-user (OVERLY PERMISSIVE - MEDIUM)"

# Create EC2 security groups with open ports
echo "🔓 Creating Security Groups (with vulnerabilities)..."

# Security group with 0.0.0.0/0 SSH access (CRITICAL)
aws --endpoint-url=$AWS_ENDPOINT_URL ec2 create-security-group \
  --group-name allow-all-ssh \
  --description "Security group with SSH open to world"

aws --endpoint-url=$AWS_ENDPOINT_URL ec2 authorize-security-group-ingress \
  --group-name allow-all-ssh \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0
echo "Created: allow-all-ssh (SSH OPEN TO WORLD - CRITICAL)"

# Verify CloudTrail is NOT enabled (HIGH)
echo "🔍 Verifying CloudTrail is disabled (vulnerability)..."
aws --endpoint-url=$AWS_ENDPOINT_URL cloudtrail describe-trails || echo "CloudTrail NOT enabled (HIGH)"

echo "✅ LocalStack initialization complete!"
echo ""
echo "📊 Summary of intentional misconfigurations:"
echo "  🔴 CRITICAL: 2 (Public S3 bucket, SSH open to world)"
echo "  🟠 HIGH: 3 (No encryption, No MFA, No CloudTrail)"
echo "  🟡 MEDIUM: 2 (No versioning, Overly permissive IAM)"
echo ""
echo "💡 Run Prowler to detect these issues:"
echo "   prowler aws --profile default --services s3,iam,ec2"
