"""
kube-bench scanner integration for Kubernetes CIS Benchmark
"""
from typing import List, Dict, Any
import subprocess
import json
import asyncio
from .base import BaseScanner, ScanResult


class KubeBenchScanner(BaseScanner):
    """kube-bench scanner for CIS Kubernetes Benchmark"""

    def _get_version(self) -> str:
        """Get kube-bench version"""
        try:
            result = subprocess.run(
                ["kube-bench", "version"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            return result.stdout.strip() or "0.7.0"
        except Exception:
            return "0.7.0"

    async def scan(self, target: Dict[str, Any]) -> List[ScanResult]:
        """
        Execute kube-bench scan on Kubernetes cluster

        Args:
            target: {
                "type": "kubernetes",
                "context": "my-cluster",  # kubectl context
                "namespace": "default",   # optional
                "benchmark": "cis-1.8"    # optional
            }
        """
        context = target.get("context", "")
        benchmark = target.get("benchmark", "cis-1.8")

        # Build kube-bench command
        cmd = ["kube-bench", "run", "--json"]

        if context:
            cmd.extend(["--context", context])

        if benchmark:
            cmd.extend(["--benchmark", benchmark])

        try:
            # Run kube-bench asynchronously
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                raise Exception(f"kube-bench failed: {stderr.decode()}")

            # Parse JSON output
            results_data = json.loads(stdout.decode())

            # Convert to ScanResult objects
            findings = []
            for control in results_data.get("Controls", []):
                for test in control.get("tests", []):
                    for result in test.get("results", []):
                        if result.get("status") == "FAIL":
                            findings.append(
                                ScanResult(
                                    scanner="kube-bench",
                                    check_id=result.get("test_number", "unknown"),
                                    title=result.get("test_desc", "Unknown check"),
                                    description=result.get("reason", "Check failed"),
                                    severity=self._map_kube_bench_severity(
                                        result.get("scored", True)
                                    ),
                                    resource_type="Kubernetes",
                                    resource_id=f"{context or 'default'}",
                                    remediation=result.get("remediation", ""),
                                    raw_data=result,
                                )
                            )

            return findings

        except Exception as e:
            # Return error as finding for visibility
            return [
                ScanResult(
                    scanner="kube-bench",
                    check_id="ERROR",
                    title="Scanner execution failed",
                    description=f"Error running kube-bench: {str(e)}",
                    severity="high",
                    raw_data={"error": str(e)},
                )
            ]

    def _map_kube_bench_severity(self, scored: bool) -> str:
        """Map kube-bench scored status to severity"""
        return "high" if scored else "medium"
