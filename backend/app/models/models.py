"""
SQLAlchemy models for Compliance Radar
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from ..core.database import Base


class SeverityEnum(str, enum.Enum):
    """Severity levels for findings"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class ScanStatusEnum(str, enum.Enum):
    """Status of scan execution"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class EnvironmentTypeEnum(str, enum.Enum):
    """Types of environments"""
    KUBERNETES = "kubernetes"
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"
    MULTI = "multi"


class Environment(Base):
    """Cloud/K8s environment to scan"""
    __tablename__ = "environments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    type = Column(Enum(EnvironmentTypeEnum), nullable=False)
    description = Column(Text, nullable=True)
    credentials_encrypted = Column(Text, nullable=True)  # Encrypted JSON
    config = Column(JSON, nullable=True)  # Additional configuration
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    audits = relationship("Audit", back_populates="environment")


class Audit(Base):
    """An audit scan execution"""
    __tablename__ = "audits"

    id = Column(Integer, primary_key=True, index=True)
    environment_id = Column(Integer, ForeignKey("environments.id"), nullable=False)
    status = Column(Enum(ScanStatusEnum), default=ScanStatusEnum.PENDING, nullable=False)

    # Scores
    overall_score = Column(Float, nullable=True)  # 0.0 to 1.0
    conformity_scores = Column(JSON, nullable=True)  # {"NIS2": 0.85, "ISO27001": 0.92}

    # Metadata
    scanner_versions = Column(JSON, nullable=True)  # {"prowler": "3.0.0", "kube-bench": "0.6.0"}
    scan_duration_seconds = Column(Integer, nullable=True)
    total_checks = Column(Integer, default=0)

    # Timestamps
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    environment = relationship("Environment", back_populates="audits")
    findings = relationship("Finding", back_populates="audit", cascade="all, delete-orphan")


class Finding(Base):
    """Individual security finding from scanners"""
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(Integer, ForeignKey("audits.id"), nullable=False)

    # Finding details
    finding_hash = Column(String(64), nullable=False, index=True)  # For deduplication
    scanner = Column(String(50), nullable=False, index=True)  # prowler, kube-bench, etc.
    check_id = Column(String(255), nullable=False)  # Scanner-specific check ID
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(Enum(SeverityEnum), nullable=False, index=True)

    # Resource information
    resource_type = Column(String(100), nullable=True)  # S3Bucket, Pod, VM, etc.
    resource_id = Column(String(500), nullable=True)
    resource_region = Column(String(50), nullable=True)

    # Remediation
    remediation = Column(Text, nullable=True)
    ai_remediation = Column(Text, nullable=True)  # AI-generated remediation
    remediation_code = Column(Text, nullable=True)  # Terraform/K8s code

    # Status tracking
    status = Column(String(50), default="open")  # open, fixed, accepted, false_positive
    assigned_to = Column(String(255), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)

    # Additional data
    raw_data = Column(JSON, nullable=True)  # Full scanner output

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    audit = relationship("Audit", back_populates="findings")
    control_mappings = relationship("ControlMapping", back_populates="finding")


class Regulation(Base):
    """Regulatory frameworks (NIS2, ISO27001, etc.)"""
    __tablename__ = "regulations"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)  # NIS2, ISO27001
    name = Column(String(255), nullable=False)
    version = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    framework_type = Column(String(50), nullable=True)  # security, privacy, quality
    mandatory_for = Column(JSON, nullable=True)  # ["EU", "finance", "health"]

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    controls = relationship("Control", back_populates="regulation")


class Control(Base):
    """Individual control within a regulation"""
    __tablename__ = "controls"

    id = Column(Integer, primary_key=True, index=True)
    regulation_id = Column(Integer, ForeignKey("regulations.id"), nullable=False)

    control_id = Column(String(100), nullable=False)  # Article 21.2.a, A.10.1.1
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)  # Access Control, Encryption, etc.

    # Metadata
    priority = Column(String(20), nullable=True)  # critical, high, medium, low
    evidence_required = Column(JSON, nullable=True)  # List of evidence types

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    regulation = relationship("Regulation", back_populates="controls")
    mappings = relationship("ControlMapping", back_populates="control")


class ControlMapping(Base):
    """Mapping between findings and regulatory controls"""
    __tablename__ = "control_mappings"

    id = Column(Integer, primary_key=True, index=True)
    finding_id = Column(Integer, ForeignKey("findings.id"), nullable=False)
    control_id = Column(Integer, ForeignKey("controls.id"), nullable=False)

    # Mapping confidence
    confidence_score = Column(Float, nullable=False, default=1.0)  # 0.0 to 1.0
    mapping_source = Column(String(50), nullable=False)  # manual, ai, rules

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    finding = relationship("Finding", back_populates="control_mappings")
    control = relationship("Control", back_populates="mappings")


class Report(Base):
    """Generated compliance reports"""
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(Integer, ForeignKey("audits.id"), nullable=False)

    title = Column(String(500), nullable=False)
    report_type = Column(String(50), nullable=False)  # executive, technical, audit
    format = Column(String(20), nullable=False)  # pdf, html, json, xlsx

    # Storage
    file_path = Column(String(1000), nullable=True)  # Path in MinIO/S3
    file_size_bytes = Column(Integer, nullable=True)

    # Metadata
    generated_by = Column(String(255), nullable=True)
    template_used = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AIAnalysis(Base):
    """AI-generated analysis and recommendations"""
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(Integer, ForeignKey("audits.id"), nullable=True)
    finding_id = Column(Integer, ForeignKey("findings.id"), nullable=True)

    analysis_type = Column(String(50), nullable=False)  # remediation, risk_assessment, summary

    # AI output
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    model_used = Column(String(100), nullable=False)

    # Quality metrics
    confidence = Column(Float, nullable=True)
    tokens_used = Column(Integer, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)

    # Feedback
    user_rating = Column(Integer, nullable=True)  # 1-5 stars
    user_feedback = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
