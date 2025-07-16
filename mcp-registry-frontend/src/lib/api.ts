import axios from 'axios';
import { ServerListResponse, ServerDetail, HealthResponse, SearchFilters, Repository } from './types';

// API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response interceptors for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions
export const api = {
  // Health check
  async getHealth(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>('/v0/health');
    return response.data;
  },

  // Get servers with pagination and filtering
  async getServers(filters: SearchFilters = {}): Promise<ServerListResponse> {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.cursor) params.append('cursor', filters.cursor);
    
    const response = await apiClient.get<ServerListResponse>(`/v0/servers?${params}`);
    return response.data;
  },

  // Get server details by ID
  async getServerById(id: string): Promise<ServerDetail> {
    const response = await apiClient.get<ServerDetail>(`/v0/servers/${id}`);
    return response.data;
  },

  // Search servers (client-side filtering for now)
  async searchServers(query: string, filters: SearchFilters = {}): Promise<ServerListResponse> {
    // For now, we'll get all servers and filter client-side
    // In a production app, you'd want server-side search
    const allServers = await this.getServers({ limit: 100, ...filters });
    
    if (!query.trim()) {
      return allServers;
    }

    const filteredServers = allServers.servers.filter(server => 
      server.name.toLowerCase().includes(query.toLowerCase()) ||
      server.description.toLowerCase().includes(query.toLowerCase())
    );

    return {
      servers: filteredServers,
      metadata: {
        ...allServers.metadata,
        count: filteredServers.length,
      },
    };
  },
};

// Utility functions for data processing
export const utils = {
  // Extract technology from server name (e.g., "io.github.user/repo-name" -> infer from repo)
  extractTechnology(server: { name: string; repository: Repository }): string {
    const name = server.name.toLowerCase();
    
    if (name.includes('python') || name.includes('py-')) return 'Python';
    if (name.includes('typescript') || name.includes('ts-')) return 'TypeScript';
    if (name.includes('javascript') || name.includes('js-')) return 'JavaScript';
    if (name.includes('go-') || name.includes('golang')) return 'Go';
    if (name.includes('database') || name.includes('db-') || name.includes('sql')) return 'Database';
    if (name.includes('ai') || name.includes('ml') || name.includes('llm')) return 'AI/ML';
    if (name.includes('web') || name.includes('http') || name.includes('api')) return 'Web';
    
    return 'Other';
  },

  // Extract category from server name and description
  extractCategory(server: { name: string; description: string }): string {
    const text = `${server.name} ${server.description}`.toLowerCase();
    
    if (text.includes('database') || text.includes('sql') || text.includes('mongodb') || text.includes('postgres')) return 'Database';
    if (text.includes('web') || text.includes('http') || text.includes('api') || text.includes('rest')) return 'Web API';
    if (text.includes('ai') || text.includes('ml') || text.includes('llm') || text.includes('openai')) return 'AI/ML';
    if (text.includes('file') || text.includes('filesystem') || text.includes('storage')) return 'File System';
    if (text.includes('dev') || text.includes('development') || text.includes('tool')) return 'Developer Tools';
    if (text.includes('integration') || text.includes('service') || text.includes('platform')) return 'Integration';
    
    return 'Other';
  },

  // Get color for technology
  getTechnologyColor(tech: string): string {
    const colors: Record<string, string> = {
      'Python': 'bg-python text-white',
      'TypeScript': 'bg-typescript text-white',
      'JavaScript': 'bg-javascript text-black',
      'Go': 'bg-go text-white',
      'Database': 'bg-database text-white',
      'AI/ML': 'bg-ai-ml text-white',
      'Web': 'bg-web text-white',
      'Other': 'bg-secondary text-secondary-foreground',
    };
    return colors[tech] || colors['Other'];
  },

  // Format relative time
  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  },

  // Extract GitHub info from repository URL
  getGitHubInfo(repoUrl: string) {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', ''),
        url: repoUrl,
      };
    }
    return null;
  },

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  },
};