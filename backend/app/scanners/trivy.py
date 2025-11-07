"""
Trivy scanner integration for container and IaC security
"""
from typing import List, Dict, Any
import subprocess
import json
import asyncio
from .base import BaseScanner, ScanResult


class TrivyScanner(BaseScanner):
    """Trivy scanner for container and infrastructure-as-code scanning"""

    def _get_version(self) -> str:
        """Get Trivy version"""
        try:
            result = subprocess.run(
                ["trivy", "--version"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            # Parse version from output
            lines = result.stdout.strip().split("\n")
            for line in lines:
                if "Version:" in line:
                    return line.split(":")[-1].strip()
            return "0.50.0"
        except Exception:
            return "0.50.0"

    async def scan(self, target: Dict[str, Any]) -> List[ScanResult]:
        """
        Execute Trivy scan

        Args:
            target: {
                "type": "trivy",
                "scan_type": "image" | "filesystem" | "config",
                "target": "nginx:latest" | "/path/to/scan",
                "severity": ["CRITICAL", "HIGH"]  # optional
            }
        """
        scan_type = target.get("scan_type", "image")
        scan_target = target.get("target", "")
        severities = target.get("severity", ["CRITICAL", "HIGH", "MEDIUM"])

        if not scan_target:
            raise ValueError("Target is required for Trivy scan")

        # Build trivy command
        cmd = [
            "trivy",
            scan_type,
            "--format", "json",
            "--severity", ",".join(severities),
            scan_target,
        ]

        try:
            # Run trivy asynchronously
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await process.communicate()

            if process.returncode != 0 and not stdout:
                raise Exception(f"Trivy failed: {stderr.decode()}")

            # Parse JSON output
            results_data = json.loads(stdout.decode())

            # Convert to ScanResult objects
            findings = []

            # Handle different output formats
            results_list = results_data.get("Results", [])
            if not results_list and isinstance(results_data, list):
                results_list = results_data

            for result in results_list:
                target_name = result.get("Target", scan_target)
                vulns = result.get("Vulnerabilities", [])
                misconfigs = result.get("Misconfigurations", [])

                # Process vulnerabilities
                for vuln in vulns or []:
                    findings.append(
                        ScanResult(
                            scanner="trivy",
                            check_id=vuln.get("VulnerabilityID", "unknown"),
                            title=f"{vuln.get('PkgName', 'Unknown')} - {vuln.get('VulnerabilityID', '')}",
                            description=vuln.get("Description", vuln.get("Title", "")),
                            severity=self.normalize_severity(vuln.get("Severity", "medium")),
                            resource_type="Package",
                            resource_id=f"{vuln.get('PkgName', '')}@{vuln.get('InstalledVersion', '')}",
                            remediation=f"Upgrade to version {vuln.get('FixedVersion', 'latest')}"
                            if vuln.get("FixedVersion")
                            else "No fix available",
                            raw_data=vuln,
                        )
                    )

                # Process misconfigurations
                for misconfig in misconfigs or []:
                    findings.append(
                        ScanResult(
                            scanner="trivy",
                            check_id=misconfig.get("ID", "unknown"),
                            title=misconfig.get("Title", "Unknown misconfiguration"),
                            description=misconfig.get("Description", ""),
                            severity=self.normalize_severity(
                                misconfig.get("Severity", "medium")
                            ),
                            resource_type="Configuration",
                            resource_id=target_name,
                            remediation=misconfig.get("Resolution", ""),
                            raw_data=misconfig,
                        )
                    )

            return findings

        except Exception as e:
            return [
                ScanResult(
                    scanner="trivy",
                    check_id="ERROR",
                    title="Scanner execution failed",
                    description=f"Error running Trivy: {str(e)}",
                    severity="high",
                    raw_data={"error": str(e)},
                )
            ]
