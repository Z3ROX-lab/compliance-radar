"""
Base scanner class for all security scanners
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib
import json


class ScanResult:
    """Standardized scan result"""

    def __init__(
        self,
        scanner: str,
        check_id: str,
        title: str,
        description: str,
        severity: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        resource_region: Optional[str] = None,
        remediation: Optional[str] = None,
        raw_data: Optional[Dict] = None,
    ):
        self.scanner = scanner
        self.check_id = check_id
        self.title = title
        self.description = description
        self.severity = severity.lower()
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.resource_region = resource_region
        self.remediation = remediation
        self.raw_data = raw_data or {}

        # Generate unique hash for deduplication
        self.finding_hash = self._generate_hash()

    def _generate_hash(self) -> str:
        """Generate unique hash for this finding"""
        unique_str = f"{self.scanner}:{self.check_id}:{self.resource_id}:{self.title}"
        return hashlib.sha256(unique_str.encode()).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "scanner": self.scanner,
            "check_id": self.check_id,
            "title": self.title,
            "description": self.description,
            "severity": self.severity,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "resource_region": self.resource_region,
            "remediation": self.remediation,
            "finding_hash": self.finding_hash,
            "raw_data": self.raw_data,
        }


class BaseScanner(ABC):
    """Base class for all security scanners"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.scanner_name = self.__class__.__name__
        self.version = self._get_version()

    @abstractmethod
    def _get_version(self) -> str:
        """Get scanner version"""
        pass

    @abstractmethod
    async def scan(self, target: Dict[str, Any]) -> List[ScanResult]:
        """
        Execute scan on target

        Args:
            target: Dictionary containing target configuration
                    Example: {"type": "aws", "region": "us-east-1", ...}

        Returns:
            List of ScanResult objects
        """
        pass

    def normalize_severity(self, severity: str) -> str:
        """Normalize severity levels across scanners"""
        severity_lower = severity.lower()

        # Map various severity levels to standard levels
        severity_map = {
            "critical": "critical",
            "high": "high",
            "medium": "medium",
            "low": "low",
            "info": "info",
            "informational": "info",
            "warning": "medium",
            "error": "high",
        }

        return severity_map.get(severity_lower, "medium")

    async def pre_scan_check(self, target: Dict[str, Any]) -> bool:
        """
        Check if scanner can run on target

        Returns:
            True if scanner is available and target is compatible
        """
        return True

    async def post_scan_process(self, results: List[ScanResult]) -> List[ScanResult]:
        """Post-process scan results"""
        return results
