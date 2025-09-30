import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'normal' | 'barbearia' | 'admin';
  phone: string;
  gemini_api_key: string;
  is_blocked: boolean;
  created_at: string;
  last_login?: string;
  metrics?: {
    conversations: number;
    orders?: number;
    appointments?: number;
    revenue?: number;
  };
}

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: 'normal' | 'barbearia' | 'admin';
  phone: string;
  gemini_api_key: string;
}

export const AdminUsers: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userConversations, setUserConversations] = useState<any[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    name: '',
    email: '',
    password: '',
    role: 'normal',
    phone: '',
    gemini_api_key: '',
  });

  const [editForm, setEditForm] = useState<Partial<User>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/users');
      
      if (response.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      showError('Erro', 'Não foi possível carregar os usuários');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      showError('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setCreateLoading(true);
      
      const response = await apiService.post('/admin/users', createForm);
      
      if (response.success) {
        setUsers(prev => [...prev, response.data.user]);
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          email: '',
          password: '',
          role: 'normal',
          phone: '',
          gemini_api_key: '',
        });
        showSuccess('Usuário criado!', 'Novo usuário adicionado ao sistema');
      } else {
        showError('Erro', response.error || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      showError('Erro', 'Não foi possível criar o usuário');
    } finally {
      setCreateLoading(false);
    }
  };

  const viewUserDetails = async (user: User) => {
    try {
      setSelectedUser(user);
      setEditForm({ ...user });
      
      // Carregar métricas e conversas do usuário
      const [metricsRes, conversationsRes] = await Promise.all([
        apiService.get(`/admin/users/${user.id}/metrics`),
        apiService.get(`/admin/users/${user.id}/conversations`)
      ]);

      if (metricsRes.success) {
        setSelectedUser(prev => prev ? { ...prev, metrics: metricsRes.data.metrics } : null);
      }

      if (conversationsRes.success) {
        setUserConversations(conversationsRes.data.conversations || []);
      }

      setShowDetailsModal(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      showError('Erro', 'Não foi possível carregar os detalhes do usuário');
    }
  };

  const updateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await apiService.put(`/admin/users/${selectedUser.id}`, editForm);
      
      if (response.success) {
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id ? { ...u, ...editForm } : u
        ));
        setShowDetailsModal(false);
        showSuccess('Usuário atualizado!', 'Dados salvos com sucesso');
      } else {
        showError('Erro', response.error || 'Erro ao atualizar usuário');
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      showError('Erro', 'Não foi possível atualizar o usuário');
    }
  };

  const toggleUserBlock = async (userId: string, currentBlocked: boolean) => {
    try {
      const response = await apiService.put(`/admin/users/${userId}`, {
        is_blocked: !currentBlocked
      });
      
      if (response.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, is_blocked: !currentBlocked } : u
        ));
        showSuccess(
          `Usuário ${!currentBlocked ? 'bloqueado' : 'desbloqueado'}!`,
          'Status atualizado com sucesso'
        );
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      showError('Erro', 'Não foi possível alterar o status do usuário');
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) {
      return;
    }

    try {
      const response = await apiService.delete(`/admin/users/${userId}`);
      
      if (response.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        showSuccess('Usuário excluído!', 'Usuário removido do sistema');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      showError('Erro', 'Não foi possível excluir o usuário');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'barbearia':
        return 'bg-purple-100 text-purple-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'barbearia':
        return '💈';
      case 'normal':
        return '🛒';
      default:
        return '👤';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-gray-600">Gerencie todos os usuários da plataforma</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Criar Usuário
        </button>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Carregando usuários...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getRoleIcon(user.role)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                  <div className={`w-3 h-3 rounded-full ${user.is_blocked ? 'bg-red-400' : 'bg-green-400'}`}></div>
                </div>
              </div>

              {/* User Metrics */}
              {user.metrics && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-sm font-bold text-blue-600">{user.metrics.conversations}</p>
                    <p className="text-xs text-gray-500">Conversas</p>
                  </div>
                  {user.role === 'normal' && user.metrics.orders !== undefined && (
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-sm font-bold text-green-600">{user.metrics.orders}</p>
                      <p className="text-xs text-gray-500">Pedidos</p>
                    </div>
                  )}
                  {user.role === 'barbearia' && user.metrics.appointments !== undefined && (
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <p className="text-sm font-bold text-purple-600">{user.metrics.appointments}</p>
                      <p className="text-xs text-gray-500">Agendamentos</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => viewUserDetails(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver detalhes"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => toggleUserBlock(user.id, user.is_blocked)}
                    className={`p-2 rounded-lg transition-colors ${
                      user.is_blocked 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title={user.is_blocked ? 'Desbloquear' : 'Bloquear'}
                  >
                    {user.is_blocked ? <LockOpenIcon className="w-4 h-4" /> : <LockClosedIcon className="w-4 h-4" />}
                  </button>
                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => deleteUser(user.id, user.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir usuário"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {user.last_login ? new Date(user.last_login).toLocaleDateString('pt-BR') : 'Nunca'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Criar Usuário</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do usuário"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Senha do usuário"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuário *
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="normal">Supermercado</option>
                  <option value="barbearia">Barbearia</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key Gemini
                </label>
                <input
                  type="password"
                  value={createForm.gemini_api_key}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, gemini_api_key: e.target.value }))}
                  placeholder="AIza..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createUser}
                disabled={createLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {createLoading ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Detalhes do Usuário - {selectedUser.name}
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key Gemini</label>
                    <input
                      type="password"
                      value={editForm.gemini_api_key || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, gemini_api_key: e.target.value }))}
                      placeholder="AIza..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={updateUser}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Salvar Alterações
                  </button>
                </div>

                {/* Metrics and Conversations */}
                <div className="space-y-6">
                  {/* Metrics */}
                  {selectedUser.metrics && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-600">{selectedUser.metrics.conversations}</p>
                          <p className="text-sm text-gray-600">Conversas</p>
                        </div>
                        {selectedUser.role === 'normal' && selectedUser.metrics.orders !== undefined && (
                          <>
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                              <p className="text-2xl font-bold text-green-600">{selectedUser.metrics.orders}</p>
                              <p className="text-sm text-gray-600">Pedidos</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg text-center col-span-2">
                              <p className="text-2xl font-bold text-purple-600">R$ {selectedUser.metrics.revenue?.toFixed(2) || '0.00'}</p>
                              <p className="text-sm text-gray-600">Faturamento</p>
                            </div>
                          </>
                        )}
                        {selectedUser.role === 'barbearia' && selectedUser.metrics.appointments !== undefined && (
                          <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <p className="text-2xl font-bold text-purple-600">{selectedUser.metrics.appointments}</p>
                            <p className="text-sm text-gray-600">Agendamentos</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recent Conversations */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversas Recentes</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {userConversations.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Nenhuma conversa encontrada</p>
                      ) : (
                        userConversations.map((conversation) => (
                          <div key={conversation.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{conversation.customer_name}</p>
                                <p className="text-sm text-gray-500">
                                  {conversation.channel_type} • {conversation.message_count} msgs
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${
                                conversation.status === 'active' ? 'bg-green-100 text-green-800' :
                                conversation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {conversation.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;