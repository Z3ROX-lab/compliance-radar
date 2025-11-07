// TypeScript interfaces for Compliance Radar

export enum SeverityLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

export enum ScanStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum EnvironmentType {
  KUBERNETES = 'kubernetes',
  AWS = 'aws',
  AZURE = 'azure',
  GCP = 'gcp',
}

export interface Environment {
  id: number;
  name: string;
  type: EnvironmentType;
  description?: string;
  last_scan?: string;
}

export interface ConformityScores {
  NIS2?: number;
  ISO27001?: number;
  DORA?: number;
  RGPD?: number;
  HDS?: number;
  SecNumCloud?: number;
  NIST?: number;
}

export interface Scan {
  id: number;
  environment_id: number;
  environment_name?: string;
  environment_type?: EnvironmentType;
  status: ScanStatus;
  started_at: string;
  completed_at?: string;
  duration?: number;
  overall_score?: number;
  conformity_scores?: ConformityScores;
  total_findings?: number;
  critical_count?: number;
  high_count?: number;
  medium_count?: number;
  low_count?: number;
}

export interface Finding {
  id: number;
  scan_id: number;
  finding_hash: string;
  scanner: string;
  check_id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  resource_type?: string;
  resource_id?: string;
  status: string;
  remediation?: string;
  ai_remediation?: string;
  regulations?: string[];
  raw_result?: any;
  created_at: string;
}

export interface DashboardMetrics {
  total_environments: number;
  total_scans: number;
  active_scans: number;
  average_conformity_score: number;
  critical_findings: number;
  high_findings: number;
  medium_findings: number;
  low_findings: number;
  recent_scans: Scan[];
  conformity_trend: {
    date: string;
    scores: ConformityScores;
  }[];
  findings_by_resource: {
    resource_type: string;
    count: number;
    severity_breakdown: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  }[];
}

export interface AIRemediationRequest {
  finding_id: number;
  include_context?: boolean;
}

export interface AIRemediationResponse {
  finding_id: number;
  remediation_plan: string;
  terraform_code?: string;
  helm_code?: string;
  manual_steps?: string[];
  risk_assessment: string;
  estimated_effort: string;
  ai_confidence: number;
}

export interface AIQuestion {
  question: string;
  context?: string;
}

export interface AIResponse {
  answer: string;
  related_findings?: Finding[];
  suggestions?: string[];
}
