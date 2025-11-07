# Kubernetes Vulnerable Test Environment

This directory contains manifests for creating an **intentionally misconfigured** Kubernetes cluster for testing kube-bench and other security scanners.

## ⚠️ WARNING

**NEVER deploy these manifests to production!** These configurations contain intentional security vulnerabilities for testing purposes only.

## Vulnerabilities Included

### 1. Privileged Pods (CRITICAL)
- Pods running with `privileged: true`
- Container escape possible

### 2. Host Path Mounts (HIGH)
- Direct access to host filesystem
- `/var/run/docker.sock` mounted

### 3. RBAC Misconfigurations (HIGH)
- ClusterRole with `*` permissions
- Anonymous authentication enabled

### 4. No Network Policies (MEDIUM)
- All pods can communicate freely
- No segmentation

### 5. Secrets in Plain Text (HIGH)
- Secrets stored as plaintext ConfigMaps
- No encryption at rest

### 6. No Resource Limits (MEDIUM)
- Pods without CPU/memory limits
- DoS risk

### 7. Root Containers (HIGH)
- Containers running as root user
- No runAsNonRoot enforcement

## Setup with Kind

```bash
# Create vulnerable cluster
kind create cluster --name vulnerable --config kind-config.yaml

# Apply vulnerable manifests
kubectl apply -f manifests/

# Run kube-bench
kube-bench run --targets master,node --json > results.json
```

## Expected kube-bench Findings

- 50+ failing checks
- CIS Kubernetes Benchmark score: ~40%
- Critical issues in:
  - API Server configuration
  - Kubelet settings
  - RBAC policies
  - Pod Security Standards

## Remediation Guide

See `REMEDIATION.md` for step-by-step fixes for each vulnerability.
