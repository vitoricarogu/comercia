const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  token?: string;
  user?: any;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    this.token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          window.location.href = '/login';
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Não foi possível conectar com o servidor. Verifique se o backend está rodando na porta 3001.');
      }
      
      throw error;
    }
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async register(userData: any): Promise<ApiResponse> {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async getProfile(): Promise<ApiResponse> {
    return this.request('/auth/me');
  }

  async updateProfile(userData: any): Promise<ApiResponse> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(passwordData: any): Promise<ApiResponse> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  // Agent methods
  async getAgents(): Promise<ApiResponse> {
    return this.request('/agents');
  }

  async createAgent(agentData: any): Promise<ApiResponse> {
    return this.request('/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  }

  async updateAgent(id: string, agentData: any): Promise<ApiResponse> {
    return this.request(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agentData),
    });
  }

  async deleteAgent(id: string): Promise<ApiResponse> {
    return this.request(`/agents/${id}`, {
      method: 'DELETE',
    });
  }

  async getAgentStats(): Promise<ApiResponse> {
    return this.request('/agents/stats');
  }

  // Conversation methods
  async getConversations(filters: any = {}): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) queryParams.append(key, filters[key]);
    });
    
    return this.request(`/conversations?${queryParams}`);
  }

  async getConversation(id: string): Promise<ApiResponse> {
    return this.request(`/conversations/${id}`);
  }

  async createConversation(conversationData: any): Promise<ApiResponse> {
    return this.request('/conversations', {
      method: 'POST',
      body: JSON.stringify(conversationData),
    });
  }

  async getConversationStats(): Promise<ApiResponse> {
    return this.request('/conversations/stats');
  }

  async getConversationMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<ApiResponse> {
    return this.request(`/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`);
  }

  async sendMessage(conversationId: string, message: string, agentId?: string): Promise<ApiResponse> {
    return this.request('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ 
        conversationId, 
        message,
        agentId 
      })
    });
  }

  // Utility methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  isAuthenticated(): boolean {
    this.token = localStorage.getItem('token');
    return !!this.token;
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export const apiService = new ApiService();
export default apiService;