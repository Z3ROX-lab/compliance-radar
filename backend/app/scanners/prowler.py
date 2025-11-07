"""
Prowler scanner integration for AWS security assessment
"""
from typing import List, Dict, Any
import subprocess
import json
import asyncio
import tempfile
import os
from pathlib import Path
from .base import BaseScanner, ScanResult


class ProwlerScanner(BaseScanner):
    """Prowler scanner for AWS security assessment"""

    def _get_version(self) -> str:
        """Get Prowler version"""
        try:
            result = subprocess.run(
                ["prowler", "--version"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            return result.stdout.strip() or "4.0.0"
        except Exception:
            return "4.0.0"

    async def scan(self, target: Dict[str, Any]) -> List[ScanResult]:
        """
        Execute Prowler scan on AWS account

        Args:
            target: {
                "type": "aws",
                "profile": "default",           # AWS profile
                "regions": ["us-east-1"],       # optional
                "services": ["s3", "ec2"],      # optional, specific services
                "severity": ["critical", "high"] # optional, filter by severity
            }
        """
        profile = target.get("profile", "default")
        regions = target.get("regions", [])
        services = target.get("services", [])

        # Create temp directory for output
        with tempfile.TemporaryDirectory() as temp_dir:
            output_file = Path(temp_dir) / "prowler-output.json"

            # Build prowler command
            cmd = [
                "prowler",
                "aws",
                "--output-modes", "json",
                "--output-filename", "prowler-output",
                "--output-directory", temp_dir,
                "--profile", profile,
            ]

            if regions:
                cmd.extend(["--regions", ",".join(regions)])

            if services:
                cmd.extend(["--services", ",".join(services)])

            # Add quiet mode to reduce output
            cmd.append("--no-banner")

            try:
                # Run prowler asynchronously
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )

                stdout, stderr = await process.communicate()

                # Read JSON output
                if not output_file.exists():
                    # Find any JSON file in output directory
                    json_files = list(Path(temp_dir).glob("*.json"))
                    if json_files:
                        output_file = json_files[0]
                    else:
                        raise Exception("No output file generated")

                with open(output_file, "r") as f:
                    results_data = json.load(f)

                # Convert to ScanResult objects
                findings = []
                for check in results_data:
                    if check.get("Status") == "FAIL":
                        findings.append(
                            ScanResult(
                                scanner="prowler",
                                check_id=check.get("CheckID", "unknown"),
                                title=check.get("CheckTitle", "Unknown check"),
                                description=check.get("Description", ""),
                                severity=self.normalize_severity(
                                    check.get("Severity", "medium")
                                ),
                                resource_type=check.get("ResourceType", "AWS"),
                                resource_id=check.get("ResourceId", ""),
                                resource_region=check.get("Region", ""),
                                remediation=check.get("Remediation", {}).get(
                                    "Recommendation", ""
                                ),
                                raw_data=check,
                            )
                        )

                return findings

            except Exception as e:
                return [
                    ScanResult(
                        scanner="prowler",
                        check_id="ERROR",
                        title="Scanner execution failed",
                        description=f"Error running Prowler: {str(e)}",
                        severity="high",
                        raw_data={"error": str(e)},
                    )
                ]
