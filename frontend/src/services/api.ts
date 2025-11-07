import axios, { AxiosInstance } from 'axios';
import type {
  Environment,
  Scan,
  Finding,
  DashboardMetrics,
  AIRemediationRequest,
  AIRemediationResponse,
  AIQuestion,
  AIResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ComplianceRadarAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Health & Status
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }

  async getSystemStatus() {
    const response = await this.client.get('/api/v1/status');
    return response.data;
  }

  // Dashboard
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await this.client.get('/api/v1/dashboard');
    return response.data;
  }

  // Environments
  async getEnvironments(): Promise<Environment[]> {
    const response = await this.client.get('/api/v1/environments');
    return response.data;
  }

  async getEnvironment(id: number): Promise<Environment> {
    const response = await this.client.get(`/api/v1/environments/${id}`);
    return response.data;
  }

  async createEnvironment(data: Partial<Environment>): Promise<Environment> {
    const response = await this.client.post('/api/v1/environments', data);
    return response.data;
  }

  async updateEnvironment(id: number, data: Partial<Environment>): Promise<Environment> {
    const response = await this.client.put(`/api/v1/environments/${id}`, data);
    return response.data;
  }

  async deleteEnvironment(id: number): Promise<void> {
    await this.client.delete(`/api/v1/environments/${id}`);
  }

  // Scans
  async getScans(params?: { environment_id?: number; status?: string }): Promise<Scan[]> {
    const response = await this.client.get('/api/v1/scans', { params });
    return response.data;
  }

  async getScan(id: number): Promise<Scan> {
    const response = await this.client.get(`/api/v1/scans/${id}`);
    return response.data;
  }

  async createScan(data: { environment_id: number; scanners?: string[] }): Promise<{ scan_id: number; task_id: string }> {
    const response = await this.client.post('/api/v1/scans', data);
    return response.data;
  }

  async getScanStatus(taskId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/scans/status/${taskId}`);
    return response.data;
  }

  async retryFailedScan(scanId: number): Promise<{ task_id: string }> {
    const response = await this.client.post(`/api/v1/scans/${scanId}/retry`);
    return response.data;
  }

  // Findings
  async getFindings(params?: {
    scan_id?: number;
    severity?: string;
    scanner?: string;
    status?: string;
  }): Promise<Finding[]> {
    const response = await this.client.get('/api/v1/findings', { params });
    return response.data;
  }

  async getFinding(id: number): Promise<Finding> {
    const response = await this.client.get(`/api/v1/findings/${id}`);
    return response.data;
  }

  async updateFindingStatus(id: number, status: string): Promise<Finding> {
    const response = await this.client.patch(`/api/v1/findings/${id}/status`, { status });
    return response.data;
  }

  async bulkUpdateFindings(findingIds: number[], status: string): Promise<void> {
    await this.client.post('/api/v1/findings/bulk-update', {
      finding_ids: findingIds,
      status,
    });
  }

  // AI Integration
  async generateRemediation(request: AIRemediationRequest): Promise<AIRemediationResponse> {
    const response = await this.client.post('/api/v1/ai/remediation', request);
    return response.data;
  }

  async askAI(question: AIQuestion): Promise<AIResponse> {
    const response = await this.client.post('/api/v1/ai/ask', question);
    return response.data;
  }

  async analyzeCompliance(scanId: number): Promise<any> {
    const response = await this.client.post(`/api/v1/ai/analyze/${scanId}`);
    return response.data;
  }

  // Reports
  async generateReport(scanId: number, format: 'json' | 'pdf' | 'html' = 'json'): Promise<any> {
    const response = await this.client.get(`/api/v1/reports/${scanId}`, {
      params: { format },
      responseType: format === 'json' ? 'json' : 'blob',
    });
    return response.data;
  }

  // Regulations
  async getRegulations(): Promise<any[]> {
    const response = await this.client.get('/api/v1/regulations');
    return response.data;
  }

  async getRegulationControls(regulationId: number): Promise<any[]> {
    const response = await this.client.get(`/api/v1/regulations/${regulationId}/controls`);
    return response.data;
  }

  // Statistics
  async getComplianceTrend(params?: { days?: number; regulation?: string }): Promise<any> {
    const response = await this.client.get('/api/v1/statistics/compliance-trend', { params });
    return response.data;
  }

  async getFindingsByResource(): Promise<any> {
    const response = await this.client.get('/api/v1/statistics/findings-by-resource');
    return response.data;
  }
}

export const api = new ComplianceRadarAPI();
export default api;
