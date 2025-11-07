# 🚀 Getting Started with Compliance Radar

Complete guide to get Compliance Radar running on your machine in under 10 minutes!

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [First Scan](#first-scan)
4. [Understanding Results](#understanding-results)
5. [Next Steps](#next-steps)

---

## System Requirements

### Minimum Requirements
- **OS**: Linux, macOS, or Windows 11 with WSL2
- **RAM**: 8GB (16GB recommended for AI features)
- **Disk**: 20GB free space
- **Docker**: Version 20.10+ with Docker Compose v2
- **Ports**: 3000, 8000, 5432, 6379, 9000, 11434 available

### Recommended Setup
- 16GB RAM
- SSD storage
- NVIDIA GPU (optional, for faster AI inference)
- Stable internet connection (for downloading AI models)

---

## Installation

### Step 1: Install Prerequisites

**On Ubuntu/Debian:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

**On macOS:**
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
# Or use Homebrew:
brew install --cask docker
```

**On Windows 11:**
```powershell
# Install WSL2 and Docker Desktop
wsl --install
# Download and install Docker Desktop from docker.com
```

### Step 2: Clone the Repository

```bash
git clone https://github.com/Z3ROX-lab/compliance-radar.git
cd compliance-radar
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp backend/.env.example backend/.env

# (Optional) Edit configuration
nano backend/.env
```

**Key configuration options:**
- `DEBUG=true` - Enable development mode
- `SECRET_KEY` - Change this in production!
- `OLLAMA_MODEL` - AI model to use (llama3.1:8b recommended)

### Step 4: Start the Platform

```bash
# Launch all services (this will download Docker images on first run)
docker-compose up -d

# Expected output:
# ✅ Creating network "compliance-network"
# ✅ Creating compliance-radar-postgres
# ✅ Creating compliance-radar-redis
# ✅ Creating compliance-radar-ollama
# ... (15 services total)
```

### Step 5: Wait for Services to Start

```bash
# Watch the logs
docker-compose logs -f backend

# Wait for:
# "🚀 Compliance Radar v1.0.0 starting..."
# "📚 API Documentation: http://localhost:8000/docs"
# Press Ctrl+C to stop watching
```

**Check service health:**
```bash
docker-compose ps

# All services should show "Up" status
```

### Step 6: Initialize Test Environments

```bash
# Create vulnerable AWS resources in LocalStack
docker-compose exec localstack bash /etc/localstack/init/ready.d/init-aws-test-resources.sh

# Expected output:
# 📦 Creating S3 buckets (with vulnerabilities)...
# 👤 Creating IAM users (with vulnerabilities)...
# 🔓 Creating Security Groups (with vulnerabilities)...
# ✅ LocalStack initialization complete!
```

### Step 7: Download AI Model

```bash
# Download Llama 3.1 model (~4GB, first time only)
docker-compose exec ollama ollama pull llama3.1:8b

# This will take 5-15 minutes depending on your connection
# Expected output:
# pulling manifest
# pulling 8daa9615cce3... 100%
# pulling 8ab4849b038c... 100%
# success
```

### Step 8: Verify Installation

```bash
# Test backend API
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","timestamp":"2025-11-07T...","version":"1.0.0"}

# Test frontend
curl -I http://localhost:3000

# Expected: HTTP/1.1 200 OK
```

---

## First Scan

### Via Web Interface

1. **Open your browser** and go to http://localhost:3000

2. **You should see the dashboard:**
   - Top: "Compliance Radar" title
   - Cards showing "Backend Status" and "Lancer un Audit"

3. **Test backend connectivity:**
   - Click "Tester le Backend"
   - Wait for green success message: "Backend OK: healthy"

4. **Run your first scan:**
   - Click "Lancer l'Audit"
   - Watch the audit execute (using mock data for now)
   - See results appear with:
     - Compliance score
     - Bar chart of findings by severity
     - Pie chart of severity distribution

### Via API

```bash
# Create a new scan
curl -X POST http://localhost:8000/api/v1/scans \
  -H "Content-Type: application/json" \
  -d '{
    "environment_id": 1,
    "scanners": ["prowler", "kube-bench", "trivy"],
    "targets": [
      {"type": "aws", "profile": "default"},
      {"type": "kubernetes", "context": "kind-vulnerable"}
    ]
  }'

# Response:
# {
#   "status": "success",
#   "scan_id": 1,
#   "message": "Scan initiated successfully"
# }

# Get scan results
curl http://localhost:8000/api/v1/scans/1

# See detailed findings
```

### Via CLI (Coming Soon)

```bash
docker-compose exec backend compliance-radar scan \
  --environment aws-prod \
  --scanners prowler,trivy \
  --output json
```

---

## Understanding Results

### Compliance Score

```
Overall Score: 87%
━━━━━━━━━━━━━━━━━━━━━━━━━
█████████████████░░░  87%

Interpretation:
• 90-100%: Excellent ✅
• 75-89%:  Good ⚠️
• 60-74%:  Needs improvement 🔶
• <60%:    Critical issues ❌
```

### Severity Levels

- **🔴 CRITICAL** (0 tolerance)
  - Public S3 buckets with sensitive data
  - Root access without MFA
  - Known CVEs with active exploits

- **🟠 HIGH** (Fix within 7 days)
  - Missing encryption
  - Overly permissive IAM policies
  - Disabled logging/monitoring

- **🟡 MEDIUM** (Fix within 30 days)
  - Missing backups
  - Weak password policies
  - Unused resources

- **🔵 LOW** (Fix within 90 days)
  - Missing tags
  - Documentation gaps
  - Best practice recommendations

### Regulatory Mapping

Each finding is mapped to relevant regulations:

```
Finding: "S3 Bucket allows public access"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Regulations:
  • NIS2 Art.21.2.a (Risk analysis and security policies)
  • ISO27001 A.13.1.3 (Segregation in networks)
  • RGPD Art.32 (Security of processing)
  • DORA Art.16.1 (ICT risk management)

Why it matters:
  • Non-compliance can result in fines up to 10M€ or 2% of global revenue
  • Potential data breach leading to reputational damage
  • Auditors will flag this as a critical finding
```

---

## Next Steps

### 1. Scan Your Real Infrastructure

```bash
# Configure AWS credentials
export AWS_PROFILE=your-production-profile

# Run real Prowler scan
docker-compose exec backend prowler aws --profile $AWS_PROFILE
```

### 2. Enable AI Remediations

The AI is already running! Try:

```bash
# Get AI-powered remediation for a finding
curl -X POST http://localhost:8000/api/v1/ai/remediation?finding_id=1

# Response will include:
# - Terraform code to fix the issue
# - Manual step-by-step guide
# - Risk assessment if ignored
```

### 3. Generate Compliance Reports

```bash
# Generate PDF report for auditors
curl http://localhost:8000/api/v1/reports/1/pdf > compliance-report.pdf

# Generate Excel export
curl http://localhost:8000/api/v1/reports/1/xlsx > compliance-data.xlsx
```

### 4. Set Up Continuous Monitoring

Add to your crontab:
```bash
# Run daily scans at 2 AM
0 2 * * * cd /path/to/compliance-radar && docker-compose exec -T backend python -m app.cli scan --all
```

### 5. Integrate with CI/CD

Add to your GitHub Actions:
```yaml
name: Compliance Check
on: [push, pull_request]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Compliance Radar
        run: |
          docker run ghcr.io/z3rox-lab/compliance-radar:latest \
            scan --fail-on critical
```

### 6. Explore the API

Visit http://localhost:8000/docs for interactive API documentation

Try these endpoints:
- `GET /api/v1/regulations` - List all supported frameworks
- `GET /api/v1/environments` - List configured environments
- `GET /api/v1/dashboard/stats` - Get compliance statistics
- `POST /api/v1/ai/chat` - Chat with compliance AI

### 7. Join the Community

- ⭐ Star the repo on GitHub
- 💬 Join discussions
- 🐛 Report issues or suggest features
- 🤝 Contribute code or documentation

---

## Troubleshooting

### Services won't start

```bash
# Check Docker resources
docker system df

# Prune old data if needed
docker system prune -a

# Check port availability
netstat -tuln | grep -E '3000|8000|5432|6379'
```

### AI model download fails

```bash
# Manually download model
docker-compose exec ollama ollama pull llama3.1:8b

# If still failing, try smaller model:
docker-compose exec ollama ollama pull llama3.1:3b
```

### Scans return no data

```bash
# Check scanner tools are available
docker-compose exec backend which prowler
docker-compose exec backend which kube-bench
docker-compose exec backend which trivy

# Check logs for errors
docker-compose logs backend | grep ERROR
```

### Frontend shows connection error

```bash
# Verify backend is running
curl http://localhost:8000/health

# Check CORS settings in backend/.env
# Ensure frontend URL is in CORS_ORIGINS
```

---

## Support

Need help? We're here!

- 📚 Documentation: [docs/](docs/)
- 💬 GitHub Discussions: [Ask a question](https://github.com/Z3ROX-lab/compliance-radar/discussions)
- 🐛 Report bugs: [Open an issue](https://github.com/Z3ROX-lab/compliance-radar/issues)

---

**Congratulations! You're now ready to audit your infrastructure for compliance! 🎉**

Remember: Security and compliance are continuous journeys, not destinations. Run regular scans, fix findings promptly, and stay compliant!
