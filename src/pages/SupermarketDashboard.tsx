import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '../contexts/AppContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';

interface SupermarketStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  activeConversations: number;
  avgOrderValue: number;
}

export const SupermarketDashboard: React.FC = () => {
  const { state } = useApp();
  const { showError } = useNotification();
  const [stats, setStats] = useState<SupermarketStats>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    activeConversations: 0,
    avgOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, ordersRes] = await Promise.all([
        apiService.get('/supermarket/stats'),
        apiService.get('/supermarket/orders?limit=5')
      ]);

      if (statsRes.success) {
        setStats(statsRes.data.stats || {});
      }

      if (ordersRes.success) {
        setRecentOrders(ordersRes.data.orders || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro', 'Não foi possível carregar os dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            🛒 Dashboard Supermercado
          </h1>
          <p className="text-gray-600 mt-1">Visão geral das vendas e atendimentos automatizados</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Bem-vindo, {state.user?.name}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-sm text-green-600">{stats.completedOrders} finalizados</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCartIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faturamento</p>
              <p className="text-2xl font-bold text-gray-900">R$ {stats.totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Ticket médio: R$ {stats.avgOrderValue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversas Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeConversations}</p>
              <p className="text-sm text-yellow-600">{stats.pendingOrders} pedidos pendentes</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido ainda</h3>
              <p className="text-gray-500">Os pedidos dos clientes aparecerão aqui</p>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{order.customer_name}</p>
                    <p className="text-sm text-gray-500">
                      {order.items_count} itens • R$ {order.total_value.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'completed' ? 'Finalizado' :
                       order.status === 'pending' ? 'Pendente' : 'Cancelado'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{order.payment_method}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
            <UserGroupIcon className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Criar Agente</span>
          </button>
          <button className="p-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg">
            <ChartBarIcon className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Ver Relatórios</span>
          </button>
          <button className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg">
            <CogIcon className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Configurações</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SupermarketDashboard;