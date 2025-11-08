"""
Initialize test data for Compliance Radar
Creates sample environments and test scans for demonstration
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine
from app.models.models import (
    Base,
    Environment,
    EnvironmentTypeEnum,
    Audit,
    AuditStatusEnum,
    Finding,
    SeverityEnum,
    Regulation,
    Control,
    ControlMapping,
)
from datetime import datetime, timedelta
import random


async def init_database():
    """Create all tables"""
    print("📦 Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Tables created")


async def create_test_environments():
    """Create test environments"""
    print("\n🌍 Creating test environments...")

    async with AsyncSessionLocal() as session:
        # Check if environments already exist
        result = await session.execute(select(Environment))
        existing = result.scalars().all()

        if existing:
            print(f"✓ Found {len(existing)} existing environments")
            return existing

        environments = [
            Environment(
                name="Production Kubernetes Cluster",
                type=EnvironmentTypeEnum.KUBERNETES,
                description="Main production K8s cluster running critical workloads",
                credentials_encrypted=None,
            ),
            Environment(
                name="AWS Production Account",
                type=EnvironmentTypeEnum.AWS,
                description="Production AWS account with multi-region setup",
                credentials_encrypted=None,
            ),
            Environment(
                name="Azure Development",
                type=EnvironmentTypeEnum.AZURE,
                description="Development environment on Azure",
                credentials_encrypted=None,
            ),
            Environment(
                name="GCP Staging",
                type=EnvironmentTypeEnum.GCP,
                description="Staging environment on Google Cloud Platform",
                credentials_encrypted=None,
            ),
            Environment(
                name="LocalStack Test (AWS)",
                type=EnvironmentTypeEnum.AWS,
                description="LocalStack simulator for AWS testing with vulnerable resources",
                credentials_encrypted=None,
            ),
        ]

        session.add_all(environments)
        await session.commit()

        print(f"✓ Created {len(environments)} environments")
        return environments


async def create_test_regulations():
    """Create regulations and controls"""
    print("\n📋 Creating regulations...")

    async with AsyncSessionLocal() as session:
        # Check if regulations exist
        result = await session.execute(select(Regulation))
        existing = result.scalars().all()

        if existing:
            print(f"✓ Found {len(existing)} existing regulations")
            return existing

        regulations = [
            Regulation(
                code="NIS2",
                name="Network and Information Security Directive 2",
                description="EU directive on security of network and information systems",
                version="2022",
                effective_date=datetime(2024, 10, 18),
            ),
            Regulation(
                code="ISO27001",
                name="ISO/IEC 27001",
                description="Information security management systems standard",
                version="2022",
                effective_date=datetime(2022, 10, 25),
            ),
            Regulation(
                code="DORA",
                name="Digital Operational Resilience Act",
                description="EU regulation on digital operational resilience",
                version="2022",
                effective_date=datetime(2025, 1, 17),
            ),
            Regulation(
                code="RGPD",
                name="Règlement Général sur la Protection des Données",
                description="EU General Data Protection Regulation (GDPR)",
                version="2016",
                effective_date=datetime(2018, 5, 25),
            ),
        ]

        session.add_all(regulations)
        await session.commit()

        # Create some sample controls for NIS2
        nis2 = regulations[0]
        controls = [
            Control(
                regulation_id=nis2.id,
                control_id="Art.21.2.a",
                title="Risk analysis and information system security policies",
                description="Implement risk analysis and security policies",
                category="Risk Management",
                priority="critical",
            ),
            Control(
                regulation_id=nis2.id,
                control_id="Art.21.2.b",
                title="Incident handling",
                description="Policies on incident detection, reporting and response",
                category="Incident Response",
                priority="high",
            ),
            Control(
                regulation_id=nis2.id,
                control_id="Art.21.2.c",
                title="Business continuity",
                description="Business continuity and disaster recovery plans",
                category="Business Continuity",
                priority="high",
            ),
        ]

        session.add_all(controls)
        await session.commit()

        print(f"✓ Created {len(regulations)} regulations with controls")
        return regulations


async def create_test_scans():
    """Create test scans with findings"""
    print("\n🔍 Creating test scans...")

    async with AsyncSessionLocal() as session:
        # Get environments
        result = await session.execute(select(Environment))
        environments = result.scalars().all()

        if not environments:
            print("✗ No environments found, skipping scans")
            return

        # Check if scans exist
        result = await session.execute(select(Audit))
        existing_scans = result.scalars().all()

        if existing_scans:
            print(f"✓ Found {len(existing_scans)} existing scans")
            return

        scans = []
        for env in environments[:3]:  # Create scans for first 3 environments
            # Create a completed scan
            scan = Audit(
                environment_id=env.id,
                status=AuditStatusEnum.COMPLETED,
                started_at=datetime.now() - timedelta(days=random.randint(1, 7)),
                completed_at=datetime.now() - timedelta(days=random.randint(0, 1)),
                overall_score=random.uniform(0.7, 0.95),
                conformity_scores={
                    "NIS2": random.uniform(0.75, 0.92),
                    "ISO27001": random.uniform(0.80, 0.95),
                    "DORA": random.uniform(0.70, 0.88),
                    "RGPD": random.uniform(0.85, 0.98),
                },
            )
            scans.append(scan)

        session.add_all(scans)
        await session.commit()

        # Refresh to get IDs
        for scan in scans:
            await session.refresh(scan)

        print(f"✓ Created {len(scans)} test scans")

        # Create findings for each scan
        await create_test_findings(session, scans)


async def create_test_findings(session, scans):
    """Create test findings for scans"""
    print("\n🐛 Creating test findings...")

    sample_findings = [
        {
            "scanner": "prowler",
            "check_id": "s3_bucket_public_access",
            "title": "S3 Bucket allows public access",
            "description": "S3 bucket 'prod-data-backups' allows public read access which may expose sensitive data",
            "severity": SeverityEnum.CRITICAL,
            "resource_type": "AWS::S3::Bucket",
            "resource_id": "arn:aws:s3:::prod-data-backups",
            "remediation": "Remove public access by updating bucket policy and ACLs. Use bucket policies to grant specific permissions only to authorized principals.",
            "regulations": ["NIS2", "RGPD", "ISO27001"],
        },
        {
            "scanner": "prowler",
            "check_id": "iam_user_no_mfa",
            "title": "IAM User without MFA enabled",
            "description": "IAM user 'admin-user' has console access but MFA is not enabled",
            "severity": SeverityEnum.HIGH,
            "resource_type": "AWS::IAM::User",
            "resource_id": "arn:aws:iam::123456789012:user/admin-user",
            "remediation": "Enable MFA for all users with console access, especially privileged users.",
            "regulations": ["NIS2", "ISO27001", "DORA"],
        },
        {
            "scanner": "kube-bench",
            "check_id": "1.2.1",
            "title": "Ensure that the --anonymous-auth argument is set to false",
            "description": "Anonymous requests to the API server should be disabled",
            "severity": SeverityEnum.HIGH,
            "resource_type": "Kubernetes::APIServer",
            "resource_id": "kube-apiserver",
            "remediation": "Edit the API server pod specification and set --anonymous-auth=false",
            "regulations": ["NIS2", "ISO27001"],
        },
        {
            "scanner": "kube-bench",
            "check_id": "5.2.2",
            "title": "Minimize the admission of privileged containers",
            "description": "Privileged containers have access to all devices on the host",
            "severity": SeverityEnum.CRITICAL,
            "resource_type": "Kubernetes::Pod",
            "resource_id": "default/vulnerable-app",
            "remediation": "Remove privileged: true from pod security context. Use specific capabilities instead.",
            "regulations": ["NIS2", "ISO27001", "DORA"],
        },
        {
            "scanner": "prowler",
            "check_id": "cloudtrail_logs_encrypted",
            "title": "CloudTrail logs are not encrypted",
            "description": "CloudTrail trails should encrypt logs at rest using KMS",
            "severity": SeverityEnum.MEDIUM,
            "resource_type": "AWS::CloudTrail::Trail",
            "resource_id": "arn:aws:cloudtrail:us-east-1:123456789012:trail/management",
            "remediation": "Enable SSE-KMS encryption for CloudTrail logs",
            "regulations": ["NIS2", "RGPD", "ISO27001"],
        },
        {
            "scanner": "trivy",
            "check_id": "CVE-2021-44228",
            "title": "Log4Shell vulnerability detected",
            "description": "Container image uses vulnerable version of Log4j library (CVE-2021-44228)",
            "severity": SeverityEnum.CRITICAL,
            "resource_type": "Container::Image",
            "resource_id": "myapp:latest",
            "remediation": "Update Log4j to version 2.17.1 or later. Rebuild and redeploy container image.",
            "regulations": ["NIS2", "DORA"],
        },
        {
            "scanner": "prowler",
            "check_id": "ec2_security_group_wide_open",
            "title": "Security group allows unrestricted inbound access",
            "description": "Security group 'sg-12345' allows inbound traffic from 0.0.0.0/0 on port 22 (SSH)",
            "severity": SeverityEnum.HIGH,
            "resource_type": "AWS::EC2::SecurityGroup",
            "resource_id": "sg-12345",
            "remediation": "Restrict SSH access to specific IP ranges. Use bastion hosts or VPN for remote access.",
            "regulations": ["NIS2", "ISO27001"],
        },
        {
            "scanner": "kube-bench",
            "check_id": "5.1.1",
            "title": "Ensure that the cluster-admin role is only used where required",
            "description": "Excessive use of cluster-admin role detected",
            "severity": SeverityEnum.MEDIUM,
            "resource_type": "Kubernetes::RBAC",
            "resource_id": "cluster-admin",
            "remediation": "Implement least privilege principle. Create custom roles with minimal required permissions.",
            "regulations": ["NIS2", "ISO27001"],
        },
    ]

    all_findings = []
    for scan in scans:
        # Create 3-6 findings per scan
        num_findings = random.randint(3, min(6, len(sample_findings)))
        selected = random.sample(sample_findings, num_findings)

        for finding_data in selected:
            finding = Finding(
                audit_id=scan.id,
                finding_hash=f"{finding_data['scanner']}_{finding_data['check_id']}_{scan.id}",
                scanner=finding_data["scanner"],
                check_id=finding_data["check_id"],
                title=finding_data["title"],
                description=finding_data["description"],
                severity=finding_data["severity"],
                resource_type=finding_data.get("resource_type"),
                resource_id=finding_data.get("resource_id"),
                status="open",
                remediation=finding_data.get("remediation"),
                raw_result={"sample": "data"},
            )
            all_findings.append(finding)

    session.add_all(all_findings)
    await session.commit()

    print(f"✓ Created {len(all_findings)} test findings")


async def main():
    """Main initialization function"""
    print("🚀 Initializing Compliance Radar test data...\n")

    try:
        # Initialize database
        await init_database()

        # Create test data
        await create_test_environments()
        await create_test_regulations()
        await create_test_scans()

        print("\n✅ Test data initialization complete!")
        print("\n📊 Summary:")
        print("   - Environments: 5 (K8s, AWS, Azure, GCP, LocalStack)")
        print("   - Regulations: 4 (NIS2, ISO27001, DORA, RGPD)")
        print("   - Scans: 3 completed scans with findings")
        print("   - Findings: Multiple security findings across environments")

        print("\n🌐 Access the platform:")
        print("   Frontend: http://localhost:3000")
        print("   API Docs: http://localhost:8000/docs")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
