"""
Compliance Radar - Revolutionary Multi-Cloud Compliance Platform
Main FastAPI application with modern async architecture
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from typing import Dict, List, Any
import asyncio
from datetime import datetime

from .core.config import settings

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Revolutionary open-source compliance platform for multi-cloud and Kubernetes",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
Instrumentator().instrument(app).expose(app)


# ============================================================================
# CORE ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Welcome endpoint with API information"""
    return {
        "message": f"🚀 Welcome to {settings.APP_NAME} API v{settings.APP_VERSION}",
        "description": "Revolutionary open-source compliance platform",
        "features": [
            "Multi-cloud scanning (AWS, Azure, GCP)",
            "Kubernetes CIS Benchmark",
            "AI-powered remediation",
            "Compliance mapping (NIS2, ISO27001, DORA, RGPD, HDS, SecNumCloud)",
            "Real-time WebSocket updates",
            "Test environments included"
        ],
        "docs": "/docs",
        "health": "/health",
        "metrics": "/metrics"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint with detailed status"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.APP_VERSION,
        "services": {
            "api": "operational",
            "database": "operational",  # TODO: Add real DB check
            "redis": "operational",     # TODO: Add real Redis check
            "ai": "operational"          # TODO: Add real Ollama check
        }
    }


# ============================================================================
# SCAN ENDPOINTS
# ============================================================================

@app.post("/api/v1/scans")
async def create_scan(scan_config: Dict[str, Any], background_tasks: BackgroundTasks):
    """
    Create and execute a new security scan

    Body:
    {
        "environment_id": 1,
        "scanners": ["prowler", "kube-bench", "trivy"],
        "targets": [
            {"type": "aws", "profile": "default"},
            {"type": "kubernetes", "context": "my-cluster"}
        ]
    }
    """
    # For now, return enhanced mock data with multiple findings
    scan_id = 1

    # Simulate async scan execution
    return {
        "status": "success",
        "scan_id": scan_id,
        "message": "Scan initiated successfully",
        "data": {
            "id": scan_id,
            "status": "running",
            "environment": scan_config.get("environment_id", "test-env"),
            "scanners": scan_config.get("scanners", ["prowler", "kube-bench"]),
            "started_at": datetime.utcnow().isoformat(),
            "estimated_duration": "5-10 minutes"
        }
    }


@app.get("/api/v1/scans")
async def list_scans(limit: int = 20, offset: int = 0):
    """List all scans with pagination"""
    # Mock data for now
    return {
        "total": 1,
        "limit": limit,
        "offset": offset,
        "scans": [
            {
                "id": 1,
                "environment": "Production AWS",
                "status": "completed",
                "overall_score": 0.87,
                "critical_findings": 3,
                "high_findings": 12,
                "medium_findings": 28,
                "started_at": "2025-11-07T10:00:00Z",
                "completed_at": "2025-11-07T10:08:32Z",
            }
        ]
    }


@app.get("/api/v1/scans/{scan_id}")
async def get_scan_details(scan_id: int):
    """Get detailed scan results"""

    # Enhanced mock data with realistic findings
    return {
        "status": "success",
        "data": {
            "id": scan_id,
            "environment": "Production AWS + K8s",
            "status": "completed",
            "overall_score": 0.87,
            "conformity_scores": {
                "NIS2": 0.85,
                "ISO27001": 0.89,
                "DORA": 0.82,
                "RGPD": 0.91,
                "HDS": 0.86,
                "SecNumCloud": 0.84
            },
            "summary": {
                "total_checks": 450,
                "passed": 392,
                "failed": 58,
                "by_severity": {
                    "critical": 3,
                    "high": 12,
                    "medium": 28,
                    "low": 15
                }
            },
            "findings": [
                {
                    "id": 1,
                    "scanner": "prowler",
                    "check_id": "s3_bucket_public_access",
                    "title": "S3 Bucket allows public access",
                    "description": "The S3 bucket 'prod-data-backups' is configured to allow public access, exposing sensitive data.",
                    "severity": "critical",
                    "resource_type": "AWS::S3::Bucket",
                    "resource_id": "prod-data-backups",
                    "resource_region": "us-east-1",
                    "remediation": "Disable public access using bucket policies and ACLs",
                    "regulations": ["NIS2", "RGPD", "ISO27001"],
                    "cve": None
                },
                {
                    "id": 2,
                    "scanner": "prowler",
                    "check_id": "iam_mfa_not_enabled",
                    "title": "IAM user without MFA enabled",
                    "description": "IAM user 'admin-user' does not have MFA enabled, creating a security risk.",
                    "severity": "high",
                    "resource_type": "AWS::IAM::User",
                    "resource_id": "admin-user",
                    "resource_region": "global",
                    "remediation": "Enable MFA for all IAM users, especially those with admin privileges",
                    "regulations": ["NIS2", "DORA", "ISO27001"],
                    "cve": None
                },
                {
                    "id": 3,
                    "scanner": "kube-bench",
                    "check_id": "1.2.3",
                    "title": "Ensure that the --authorization-mode argument is not set to AlwaysAllow",
                    "description": "The Kubernetes API server is configured with AlwaysAllow authorization mode.",
                    "severity": "high",
                    "resource_type": "Kubernetes::APIServer",
                    "resource_id": "kube-apiserver",
                    "resource_region": "eu-west-1",
                    "remediation": "Set --authorization-mode to Node,RBAC",
                    "regulations": ["ISO27001", "SecNumCloud"],
                    "cve": None
                },
                {
                    "id": 4,
                    "scanner": "trivy",
                    "check_id": "CVE-2024-1234",
                    "title": "Critical vulnerability in nginx container",
                    "description": "nginx:1.20 contains CVE-2024-1234 allowing remote code execution",
                    "severity": "critical",
                    "resource_type": "Container::Image",
                    "resource_id": "nginx:1.20",
                    "resource_region": "eu-west-1",
                    "remediation": "Upgrade nginx to version 1.25 or later",
                    "regulations": ["NIS2", "DORA"],
                    "cve": "CVE-2024-1234"
                },
                {
                    "id": 5,
                    "scanner": "prowler",
                    "check_id": "cloudtrail_not_enabled",
                    "title": "CloudTrail is not enabled",
                    "description": "AWS CloudTrail logging is not enabled, preventing audit trail analysis.",
                    "severity": "high",
                    "resource_type": "AWS::CloudTrail",
                    "resource_id": "N/A",
                    "resource_region": "us-east-1",
                    "remediation": "Enable CloudTrail for all regions and configure log file validation",
                    "regulations": ["NIS2", "ISO27001", "DORA"],
                    "cve": None
                }
            ],
            "started_at": "2025-11-07T10:00:00Z",
            "completed_at": "2025-11-07T10:08:32Z",
            "scan_duration_seconds": 512,
            "scanner_versions": {
                "prowler": "4.0.0",
                "kube-bench": "0.7.0",
                "trivy": "0.50.0"
            }
        }
    }


# ============================================================================
# AI ENDPOINTS
# ============================================================================

@app.post("/api/v1/ai/remediation")
async def generate_remediation(finding_id: int):
    """Generate AI-powered remediation for a specific finding"""

    # Mock AI response
    return {
        "status": "success",
        "finding_id": finding_id,
        "remediation": {
            "automated": {
                "available": True,
                "type": "terraform",
                "code": """resource "aws_s3_bucket_public_access_block" "prod_data" {
  bucket = "prod-data-backups"

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}""",
                "description": "Apply this Terraform code to block public access"
            },
            "manual": {
                "steps": [
                    "1. Navigate to AWS Console → S3",
                    "2. Select bucket 'prod-data-backups'",
                    "3. Go to Permissions tab",
                    "4. Click 'Block public access'",
                    "5. Enable all 4 block settings",
                    "6. Save changes"
                ]
            },
            "risk_if_ignored": "Public data exposure, potential GDPR violation, data breach",
            "estimated_fix_time": "5 minutes",
            "confidence": 0.95
        }
    }


@app.post("/api/v1/ai/chat")
async def ai_chat(message: str):
    """Interactive AI chat for compliance questions"""

    # Mock AI response
    return {
        "status": "success",
        "response": f"Based on your question about '{message}', I recommend reviewing NIS2 Article 21 requirements for security measures. Would you like me to generate a compliance checklist?",
        "model": "llama3.1:8b",
        "suggested_actions": [
            "Generate NIS2 compliance checklist",
            "Run full security audit",
            "View related findings"
        ]
    }


# ============================================================================
# REGULATION MAPPING ENDPOINTS
# ============================================================================

@app.get("/api/v1/regulations")
async def list_regulations():
    """List all supported regulatory frameworks"""
    return {
        "regulations": [
            {
                "code": "NIS2",
                "name": "Network and Information Security Directive 2",
                "version": "2024",
                "mandatory_for": ["EU", "Critical Infrastructure"],
                "controls_count": 150
            },
            {
                "code": "ISO27001",
                "name": "ISO/IEC 27001 Information Security",
                "version": "2022",
                "mandatory_for": ["Certification"],
                "controls_count": 114
            },
            {
                "code": "DORA",
                "name": "Digital Operational Resilience Act",
                "version": "2025",
                "mandatory_for": ["EU", "Financial Services"],
                "controls_count": 95
            },
            {
                "code": "RGPD",
                "name": "Règlement Général sur la Protection des Données",
                "version": "2018",
                "mandatory_for": ["EU", "Data Processing"],
                "controls_count": 78
            },
            {
                "code": "HDS",
                "name": "Hébergement de Données de Santé",
                "version": "2024",
                "mandatory_for": ["France", "Health Data"],
                "controls_count": 65
            },
            {
                "code": "SecNumCloud",
                "name": "SecNumCloud",
                "version": "3.2",
                "mandatory_for": ["France", "Sensitive Cloud"],
                "controls_count": 142
            }
        ]
    }


@app.get("/api/v1/regulations/{regulation_code}/controls")
async def get_regulation_controls(regulation_code: str):
    """Get all controls for a specific regulation"""

    if regulation_code == "NIS2":
        return {
            "regulation": "NIS2",
            "controls": [
                {
                    "control_id": "Art.21.2.a",
                    "title": "Risk analysis and information system security policies",
                    "category": "Security Policies",
                    "priority": "critical",
                    "mapped_checks": ["s3_encryption", "ebs_encryption", "rds_encryption"]
                },
                {
                    "control_id": "Art.21.2.b",
                    "title": "Incident handling",
                    "category": "Incident Management",
                    "priority": "high",
                    "mapped_checks": ["cloudtrail_enabled", "guardduty_enabled"]
                }
            ]
        }

    raise HTTPException(status_code=404, detail="Regulation not found")


# ============================================================================
# ENVIRONMENT MANAGEMENT
# ============================================================================

@app.get("/api/v1/environments")
async def list_environments():
    """List all configured environments"""
    return {
        "environments": [
            {
                "id": 1,
                "name": "Production AWS",
                "type": "aws",
                "description": "Production AWS account",
                "last_scan": "2025-11-07T10:00:00Z",
                "compliance_score": 0.87
            },
            {
                "id": 2,
                "name": "K8s Cluster (Vulnerable - Test)",
                "type": "kubernetes",
                "description": "Test Kubernetes cluster with intentional misconfigurations",
                "last_scan": "2025-11-07T09:00:00Z",
                "compliance_score": 0.45
            },
            {
                "id": 3,
                "name": "LocalStack (AWS Emulator)",
                "type": "aws",
                "description": "Local AWS emulation for testing",
                "last_scan": None,
                "compliance_score": None
            }
        ]
    }


# ============================================================================
# STATISTICS & DASHBOARD
# ============================================================================

@app.get("/api/v1/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    return {
        "overall_compliance": 0.87,
        "trend_7d": +0.03,
        "total_environments": 3,
        "total_scans_last_30d": 45,
        "active_critical_findings": 3,
        "active_high_findings": 12,
        "findings_fixed_last_7d": 8,
        "top_failing_regulations": [
            {"code": "DORA", "score": 0.82},
            {"code": "SecNumCloud", "score": 0.84}
        ],
        "scan_coverage": {
            "aws": 0.95,
            "kubernetes": 0.90,
            "azure": 0.0,
            "gcp": 0.0
        }
    }


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"status": "error", "message": "Resource not found"}
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Internal server error"}
    )


# ============================================================================
# STARTUP / SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    print(f"📚 API Documentation: http://localhost:8000/docs")
    print(f"💚 Health Check: http://localhost:8000/health")
    print(f"📊 Metrics: http://localhost:8000/metrics")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print(f"👋 {settings.APP_NAME} shutting down...")
