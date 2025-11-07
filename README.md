# 🚀 Compliance Radar

<div align="center">

**The Revolutionary Open-Source Multi-Cloud Compliance Platform**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/react-19.1-blue.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

*The first unified platform to audit AWS, Azure, GCP, and Kubernetes compliance with AI-powered remediation, test environments included, and complete regulatory mapping.*

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Screenshots](#-screenshots) • [Contributing](#-contributing)

</div>

---

## 🌟 Why Compliance Radar?

### The Problem
- 🔴 **Fragmented tools**: Prowler (AWS only), kube-bench (K8s only), no unified view
- 💸 **Expensive solutions**: Commercial platforms cost $50K-500K/year
- 📊 **Complex regulations**: NIS2, DORA, ISO27001 - hard to map to technical controls
- 🔧 **No test environments**: Can't demo or test without real infrastructure

### Our Solution
```
┌────────────────────────────────────────────────────────────────┐
│  🎯 ONE PLATFORM      🤖 AI-POWERED       🆓 OPEN SOURCE       │
│  Multi-cloud + K8s    Auto-remediation    $0 vs $500K/year     │
│                                                                 │
│  📊 REGULATORY MAPPING          🧪 TEST ENVIRONMENTS           │
│  NIS2, ISO27001, DORA, RGPD    LocalStack, Vulnerable K8s     │
└────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🔍 **Multi-Cloud Security Scanning**
- ☁️ **AWS** - via Prowler (400+ security checks)
- ☸️ **Kubernetes** - via kube-bench (CIS Benchmark)
- 🐳 **Containers** - via Trivy (CVE detection)
- 🌐 **Azure & GCP** - via ScoutSuite (coming soon)

### 🤖 **AI-Powered Intelligence**
- 💡 **Auto-remediation generation** - Terraform/Helm code suggestions
- 🔮 **Risk prediction** - ML-based severity scoring
- 💬 **Interactive chatbot** - Ask compliance questions in plain language
- 📊 **Smart analysis** - Prioritize fixes by business impact

### 📜 **Complete Regulatory Mapping**
```
Technical Finding  →  Multiple Regulations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"S3 Bucket Public"  →  NIS2 Art.21.2.a
                    →  ISO27001 A.13.1.3
                    →  RGPD Art.32
                    →  DORA Art.16.1
```

**Supported Frameworks:**
- 🇪🇺 **NIS2** (Network and Information Security Directive 2)
- 🔒 **ISO 27001** (Information Security Management)
- 🏦 **DORA** (Digital Operational Resilience Act)
- 🛡️ **RGPD/GDPR** (Data Protection)
- 🇫🇷 **HDS** (French Health Data Hosting)
- ☁️ **SecNumCloud** (French Secure Cloud)
- 🏛️ **NIST** (National Institute of Standards)

### 🎨 **Modern Dashboard**
- 📈 **Real-time updates** via WebSocket
- 📊 **Interactive charts** - Trend analysis, compliance scores
- 🌙 **Dark/Light mode** - Eye-friendly interface
- 📱 **Responsive design** - Mobile-ready
- 🎯 **Drill-down views** - From overview to technical details

### 🧪 **Test Environments Included**
Never deploy to production to test! We include:
- 🐳 **LocalStack** - Full AWS cloud simulation
- ☸️ **Vulnerable Kubernetes** - Intentionally misconfigured cluster
- ☁️ **Azure Emulator** - Azurite for Azure Storage
- 🔧 **Pre-configured vulnerabilities** - Realistic test scenarios

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- 8GB RAM minimum (16GB recommended for AI features)
- Port availability: 3000, 8000, 5432, 6379, 11434

### 1. Clone & Setup

```bash
# Clone the repository
git clone https://github.com/Z3ROX-lab/compliance-radar.git
cd compliance-radar

# Copy environment file
cp backend/.env.example backend/.env

# (Optional) Edit configuration
nano backend/.env
```

### 2. Start All Services

```bash
# Launch the entire stack (15 services!)
docker-compose up -d

# Watch the logs
docker-compose logs -f
```

### 3. Initialize Test Environments

```bash
# Create vulnerable AWS resources in LocalStack
docker-compose exec localstack /etc/localstack/init/ready.d/init-aws-test-resources.sh

# (Optional) Deploy vulnerable K8s manifests
# kubectl apply -f test-environments/k8s-vulnerable/manifests/
```

### 4. Download AI Model

```bash
# Download Llama 3.1 model (first time only, ~4GB)
docker-compose exec ollama ollama pull llama3.1:8b

# Verify model is ready
curl http://localhost:11434/api/tags
```

### 5. Access the Platform

```
🌐 Frontend Dashboard:  http://localhost:3000
📚 API Documentation:    http://localhost:8000/docs
📊 Prometheus Metrics:   http://localhost:9090
📈 Grafana Dashboards:   http://localhost:3001  (admin/admin)
🌸 Celery Flower:        http://localhost:5555
🗄️ MinIO Console:        http://localhost:9001  (minioadmin/minioadmin)
```

### 6. Run Your First Scan

**Via UI:**
1. Go to http://localhost:3000
2. Click "Run Audit"
3. Watch real-time results appear!

**Via API:**
```bash
curl -X POST http://localhost:8000/api/v1/scans \
  -H "Content-Type: application/json" \
  -d '{
    "environment_id": 1,
    "scanners": ["prowler", "kube-bench", "trivy"]
  }'
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      REACT FRONTEND                              │
│  Material-UI + Chart.js + WebSocket + React Query               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST + WebSocket
┌──────────────────────────┴──────────────────────────────────────┐
│                    FASTAPI BACKEND                               │
│  Async API + Prometheus Metrics + JWT Auth                      │
└────┬──────────────┬──────────────┬─────────────────────────────┘
     │              │              │
┌────▼────┐  ┌─────▼─────┐  ┌────▼─────┐
│ CELERY  │  │  OLLAMA   │  │ POSTGRES │
│ Workers │  │ (AI LLM)  │  │ TimescaleDB
└────┬────┘  └───────────┘  └──────────┘
     │
┌────▼──────────────────────────────────────────────────────────┐
│              SCANNER ORCHESTRATOR                              │
│  Manages parallel execution of security scanners              │
└────┬────┬────┬────┬────────────────────────────────────────────┘
     │    │    │    │
  ┌──▼─┐ ┌▼──┐ ┌▼──┐ ┌▼──────┐
  │Prowler│Trivy│kube│Scout   │
  │  AWS  │CVE │bench│ Suite  │
  └───────┴────┴────┴────────┘
     │    │    │    │
  ┌──▼────▼────▼────▼──────────────┐
  │   TARGET ENVIRONMENTS          │
  │  - Real AWS/Azure/GCP          │
  │  - LocalStack (AWS Emulator)   │
  │  - Vulnerable K8s Cluster      │
  └────────────────────────────────┘
```

**Key Components:**
- **Frontend**: React 19 + TypeScript + Material-UI
- **Backend**: FastAPI (Python) with async support
- **Task Queue**: Celery + Redis for async scanning
- **Database**: PostgreSQL + TimescaleDB for time-series
- **AI Engine**: Ollama (local LLM) for remediation
- **Storage**: MinIO (S3-compatible) for reports
- **Monitoring**: Prometheus + Grafana

**Data Flow:**
1. User requests scan via UI/API
2. Backend creates Celery task
3. Worker executes scanners in parallel
4. Results stored in PostgreSQL
5. AI analyzes and generates remediations
6. WebSocket pushes updates to frontend
7. User sees real-time results

---

## 📊 Screenshots

### Dashboard Overview
```
┌──────────────────────────────────────────────────────────────┐
│ 🔍 Compliance Radar          [Prod AWS ▼]   👤 Admin    ☰   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 📊 Score │  │ 🎯 Crit  │  │ 🔄 Scans │  │ ✅ Fixed │   │
│  │   87%    │  │    3     │  │ Running  │  │    8     │   │
│  │  ▲ +3%   │  │  ⚠️ +2  │  │   1/5    │  │  (7 days)│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  Compliance Trend (6 months)                                 │
│  ██████████████████████████████▓▓▓▓▓▓▓░░░░░░                │
│  NIS2 ████████████████████ 85%                              │
│  ISO  ███████████████████████ 89%                           │
│  DORA ██████████████████ 82%                                │
│                                                               │
│  Top Failing Controls          │  Resource Heatmap          │
│  1. ❌ S3 Public Access        │  [Interactive D3.js map]   │
│  2. ❌ MFA Not Enabled         │  Red = Critical            │
│  3. ⚠️  Logging Disabled       │  Orange = High             │
│                                                               │
│  [🤖 AI] "3 S3 buckets expose PII data - GDPR violation"    │
│  [Fix Now] [Schedule] [AI Remediation]                      │
└──────────────────────────────────────────────────────────────┘
```

*(Real screenshots coming soon!)*

---

## 🎯 Use Cases

### 1. **Continuous Compliance Monitoring**
```bash
# Schedule daily scans
0 2 * * * docker-compose exec backend python -m app.cli scan --all
```

### 2. **Pre-Deployment Validation**
```bash
# Scan Terraform before apply
trivy config ./terraform/ --format json | \
  curl -X POST http://localhost:8000/api/v1/scans/import
```

### 3. **Audit Report Generation**
```bash
# Generate PDF report for auditors
curl http://localhost:8000/api/v1/reports/1/pdf > audit-report.pdf
```

### 4. **CI/CD Integration**
```yaml
# .github/workflows/compliance.yml
- name: Compliance Check
  run: |
    docker run compliance-radar/cli scan --fail-on critical
```

---

## 🤝 Contributing

We welcome contributions! This project aims to **democratize compliance** for all organizations.

### How to Contribute
1. 🍴 Fork the repository
2. 🔧 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. ✅ Add tests for your changes
4. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
5. 📤 Push to the branch (`git push origin feature/amazing-feature`)
6. 🎉 Open a Pull Request

### Areas We Need Help
- 🔌 **Scanner integrations**: ScoutSuite, Checkov, Terrascan
- 📜 **Regulation mappings**: Complete NIST, add SOC2, PCI-DSS
- 🌐 **Translations**: French, German, Spanish interfaces
- 🎨 **UI/UX improvements**: Make it even more beautiful!
- 📚 **Documentation**: Tutorials, videos, blog posts
- 🧪 **Testing**: Unit tests, integration tests, E2E tests

---

## 🗺️ Roadmap

### v1.0 (Current - POC) ✅
- [x] Multi-cloud scanner integration
- [x] Basic UI dashboard
- [x] Regulatory mapping (NIS2, ISO27001)
- [x] Docker Compose setup
- [x] Test environments

### v1.1 (Q1 2025) 🚧
- [ ] AI remediation engine
- [ ] WebSocket real-time updates
- [ ] Advanced filtering and search
- [ ] Report generation (PDF, Excel)
- [ ] User authentication

### v1.2 (Q2 2025) 📅
- [ ] ScoutSuite integration (Azure, GCP)
- [ ] Compliance-as-Code (IaC scanning)
- [ ] Timeline and trending analysis
- [ ] Multi-tenancy support
- [ ] API rate limiting

### v2.0 (Q3 2025) 🚀
- [ ] ML-based risk prediction
- [ ] Automated remediation execution
- [ ] Integration with ticketing systems (Jira, ServiceNow)
- [ ] Mobile app (React Native)
- [ ] Enterprise SSO (SAML, OAuth)

---

## 📖 Documentation

- [📐 Architecture](ARCHITECTURE.md) - Deep dive into system design
- [🔧 Installation Guide](docs/INSTALLATION.md) - Detailed setup instructions
- [🚀 User Guide](docs/USER_GUIDE.md) - How to use the platform
- [🧪 Testing Guide](docs/TESTING.md) - Run tests and contribute
- [🔌 Scanner Integration](docs/SCANNER_INTEGRATION.md) - Add new scanners
- [📜 Regulation Mapping](docs/REGULATION_MAPPING.md) - Add new frameworks
- [🐛 Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues

---

## 🙏 Acknowledgments

This project builds on the amazing work of:
- [Prowler](https://github.com/prowler-cloud/prowler) - AWS security assessment
- [kube-bench](https://github.com/aquasecurity/kube-bench) - Kubernetes CIS Benchmark
- [Trivy](https://github.com/aquasecurity/trivy) - Container security scanner
- [LocalStack](https://github.com/localstack/localstack) - AWS cloud emulator
- [Ollama](https://github.com/ollama/ollama) - Local LLM inference

Special thanks to the open-source security community! 💙

---

## 📜 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

```
Copyright 2025 Compliance Radar Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
```

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐!

---

## 📞 Contact & Community

- 💬 **Discussions**: [GitHub Discussions](https://github.com/Z3ROX-lab/compliance-radar/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Z3ROX-lab/compliance-radar/issues)
- 📧 **Email**: contact@compliance-radar.io
- 🐦 **Twitter**: [@ComplianceRadar](https://twitter.com/ComplianceRadar)
- 💼 **LinkedIn**: [Compliance Radar](https://linkedin.com/company/compliance-radar)

---

<div align="center">

**Made with ❤️ by security professionals, for security professionals**

*Democratizing compliance, one scan at a time*

[⭐ Star us on GitHub](https://github.com/Z3ROX-lab/compliance-radar) • [🐦 Follow on Twitter](https://twitter.com/ComplianceRadar)

</div>
