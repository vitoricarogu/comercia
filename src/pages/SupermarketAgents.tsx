import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '../contexts/AppContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';

interface Agent {
  id: string;
  name: string;
  description: string;
  objective: string;
  personality: string;
  system_prompt: string;
  temperature: number;
  whatsapp_config: any;
  rag_file?: string;
  is_active: boolean;
  total_conversations: number;
  total_orders: number;
  total_revenue: number;
  created_at: string;
}

interface AgentFormData {
  name: string;
  description: string;
  objective: string;
  personality: 'professional' | 'friendly' | 'casual' | 'formal';
  system_prompt: string;
  temperature: number;
  whatsapp_phone: string;
  whatsapp_token: string;
  whatsapp_phone_id: string;
}

export const SupermarketAgents: React.FC = () => {
  const { state } = useApp();
  const { showSuccess, showError } = useNotification();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConversationsModal, setShowConversationsModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [ragFile, setRagFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    description: '',
    objective: '',
    personality: 'professional',
    system_prompt: `Você é um assistente virtual de vendas para supermercado.

SUAS FUNÇÕES:
1. Atender clientes de forma cordial e profissional
2. Consultar disponibilidade e preços no ERP
3. Processar pedidos completos
4. Gerar PIX para pagamento
5. Confirmar entrega

FLUXO DE ATENDIMENTO:
1. Cumprimente o cliente
2. Pergunte o que ele deseja comprar
3. Consulte estoque e preços no ERP
4. Monte o pedido com valores
5. Confirme forma de pagamento (PIX, dinheiro, cartão)
6. Se PIX: gere a chave e valor
7. Confirme dados de entrega
8. Finalize o pedido

REGRAS:
- Sempre confirme disponibilidade antes de adicionar ao pedido
- Calcule o total corretamente
- Seja claro sobre prazos de entrega
- Mantenha tom profissional mas amigável`,
    temperature: 0.7,
    whatsapp_phone: '',
    whatsapp_token: '',
    whatsapp_phone_id: '',
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/supermarket/agents');
      
      if (response.success) {
        setAgents(response.data.agents || []);
      }
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
      showError('Erro', 'Não foi possível carregar os agentes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.objective) {
      showError('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setCreateLoading(true);
    
    try {
      const agentData = new FormData();
      Object.keys(formData).forEach(key => {
        agentData.append(key, formData[key as keyof AgentFormData] as string);
      });
      
      if (ragFile) {
        agentData.append('rag_file', ragFile);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/supermarket/agents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: agentData
      });

      const result = await response.json();

      if (result.success) {
        setAgents(prev => [...prev, result.data.agent]);
        setShowCreateModal(false);
        resetForm();
        showSuccess('Agente criado!', 'Agente de vendas criado com sucesso');
      } else {
        showError('Erro', result.error || 'Erro ao criar agente');
      }
    } catch (error) {
      console.error('Erro ao criar agente:', error);
      showError('Erro', 'Não foi possível criar o agente');
    } finally {
      setCreateLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      objective: '',
      personality: 'professional',
      system_prompt: formData.system_prompt, // Manter prompt padrão
      temperature: 0.7,
      whatsapp_phone: '',
      whatsapp_token: '',
      whatsapp_phone_id: '',
    });
    setRagFile(null);
  };

  const viewConversations = async (agent: Agent) => {
    try {
      setSelectedAgent(agent);
      const response = await apiService.get(`/supermarket/agents/${agent.id}/conversations`);
      
      if (response.success) {
        setConversations(response.data.conversations || []);
        setShowConversationsModal(true);
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      showError('Erro', 'Não foi possível carregar as conversas');
    }
  };

  const deleteAgent = async (agentId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este agente?')) {
      return;
    }

    try {
      const response = await apiService.delete(`/supermarket/agents/${agentId}`);
      
      if (response.success) {
        setAgents(prev => prev.filter(a => a.id !== agentId));
        showSuccess('Agente excluído!', 'Agente removido com sucesso');
      }
    } catch (error) {
      console.error('Erro ao excluir agente:', error);
      showError('Erro', 'Não foi possível excluir o agente');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agentes de Vendas</h1>
          <p className="text-gray-600">Gerencie seus agentes de IA para atendimento e vendas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Criar Agente
        </button>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Carregando agentes...</span>
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum agente criado</h3>
          <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro agente de vendas.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Criar Agente
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{agent.description}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${agent.is_active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">{agent.total_conversations}</p>
                  <p className="text-xs text-gray-500">Conversas</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{agent.total_orders}</p>
                  <p className="text-xs text-gray-500">Pedidos</p>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <p className="text-lg font-bold text-purple-600">R$ {agent.total_revenue.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">Vendas</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => viewConversations(agent)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver conversas"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Editar agente"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteAgent(agent.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir agente"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {agent.whatsapp_config?.phone || 'WhatsApp não configurado'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Criar Agente de Vendas</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAgent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Agente *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Assistente de Vendas"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personalidade
                    </label>
                    <select
                      value={formData.personality}
                      onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="professional">Profissional</option>
                      <option value="friendly">Amigável</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva brevemente o que este agente faz..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objetivo *
                  </label>
                  <textarea
                    value={formData.objective}
                    onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                    placeholder="Qual é o objetivo principal deste agente?"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt do Sistema *
                  </label>
                  <textarea
                    value={formData.system_prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                    placeholder="Instruções detalhadas sobre como o agente deve se comportar..."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload RAG (Base de Conhecimento)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="rag-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          {ragFile ? ragFile.name : 'Clique para fazer upload'}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          PDF, TXT, DOCX até 10MB
                        </span>
                      </label>
                      <input
                        id="rag-upload"
                        type="file"
                        accept=".pdf,.txt,.docx"
                        onChange={(e) => setRagFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperatura ({formData.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Conservador</span>
                    <span>Criativo</span>
                  </div>
                </div>

                {/* WhatsApp Configuration */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configuração WhatsApp</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número do WhatsApp *
                      </label>
                      <input
                        type="text"
                        value={formData.whatsapp_phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_phone: e.target.value }))}
                        placeholder="5511999999999"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Access Token *
                      </label>
                      <input
                        type="password"
                        value={formData.whatsapp_token}
                        onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_token: e.target.value }))}
                        placeholder="EAAx..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number ID *
                      </label>
                      <input
                        type="text"
                        value={formData.whatsapp_phone_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_phone_id: e.target.value }))}
                        placeholder="123456789"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {createLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Criando...
                      </>
                    ) : (
                      'Criar Agente'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Conversations Modal */}
      {showConversationsModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Conversas - {selectedAgent.name}
                </h2>
                <button
                  onClick={() => setShowConversationsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Nenhuma conversa encontrada</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div key={conversation.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{conversation.customer_name}</h4>
                          <p className="text-sm text-gray-500">
                            {conversation.channel_type} • {conversation.message_count} mensagens
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(conversation.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            conversation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            conversation.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {conversation.status}
                          </span>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                            Interferir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupermarketAgents;