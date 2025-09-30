import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';

interface ERPConfig {
  erp_endpoint: string;
  erp_token: string;
  erp_username: string;
  erp_password: string;
  pix_key: string;
  pix_merchant_name: string;
  pix_merchant_city: string;
  delivery_fee: number;
  min_order_value: number;
}

export const SupermarketERPConfig: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [config, setConfig] = useState<ERPConfig>({
    erp_endpoint: '',
    erp_token: '',
    erp_username: '',
    erp_password: '',
    pix_key: '',
    pix_merchant_name: '',
    pix_merchant_city: '',
    delivery_fee: 5.00,
    min_order_value: 20.00,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/supermarket/erp-config');
      
      if (response.success) {
        setConfig(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      showError('Erro', 'Não foi possível carregar as configurações');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      
      const response = await apiService.post('/supermarket/erp-config', config);
      
      if (response.success) {
        showSuccess('Configurações salvas!', 'ERP configurado com sucesso');
      } else {
        showError('Erro', response.error || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      showError('Erro', 'Não foi possível salvar as configurações');
    } finally {
      setSaving(false);
    }
  };

  const testERPConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      
      const response = await apiService.post('/supermarket/test-erp', {
        erp_endpoint: config.erp_endpoint,
        erp_token: config.erp_token,
        erp_username: config.erp_username,
        erp_password: config.erp_password,
      });
      
      setTestResult({
        success: response.success,
        message: response.success ? 'Conexão ERP funcionando!' : response.error || 'Erro na conexão'
      });
      
      if (response.success) {
        showSuccess('Teste bem-sucedido!', 'ERP conectado com sucesso');
      } else {
        showError('Teste falhou', response.error || 'Erro na conexão com ERP');
      }
    } catch (error) {
      console.error('Erro ao testar ERP:', error);
      setTestResult({
        success: false,
        message: 'Erro ao testar conexão'
      });
      showError('Erro', 'Não foi possível testar a conexão');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Configuração ERP
          </h1>
          <p className="text-gray-600 mt-2">Configure a integração com o sistema ERP do seu supermercado</p>
        </div>
      </div>

      {/* ERP Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <LinkIcon className="h-6 w-6 mr-3 text-blue-600" />
              Conexão com ERP
            </h2>
            <p className="text-gray-600 mt-1">Configure a API do seu sistema ERP para consultas de estoque e vendas</p>
          </div>
          <button
            onClick={testERPConnection}
            disabled={testing || !config.erp_endpoint || !config.erp_token}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {testing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testando...
              </div>
            ) : (
              'Testar Conexão'
            )}
          </button>
        </div>

        {testResult && (
          <div className={`mb-6 p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center">
              {testResult.success ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className={testResult.success ? 'text-green-700' : 'text-red-700'}>
                {testResult.message}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endpoint da API ERP *
            </label>
            <input
              type="url"
              value={config.erp_endpoint}
              onChange={(e) => setConfig(prev => ({ ...prev, erp_endpoint: e.target.value }))}
              placeholder="https://api.seuerp.com/v1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token de Acesso *
            </label>
            <input
              type="password"
              value={config.erp_token}
              onChange={(e) => setConfig(prev => ({ ...prev, erp_token: e.target.value }))}
              placeholder="Bearer token ou API key"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuário ERP
            </label>
            <input
              type="text"
              value={config.erp_username}
              onChange={(e) => setConfig(prev => ({ ...prev, erp_username: e.target.value }))}
              placeholder="usuário do sistema ERP"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha ERP
            </label>
            <input
              type="password"
              value={config.erp_password}
              onChange={(e) => setConfig(prev => ({ ...prev, erp_password: e.target.value }))}
              placeholder="senha do sistema ERP"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </motion.div>

      {/* PIX Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
          <CurrencyDollarIcon className="h-6 w-6 mr-3 text-green-600" />
          Configuração PIX
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chave PIX *
            </label>
            <input
              type="text"
              value={config.pix_key}
              onChange={(e) => setConfig(prev => ({ ...prev, pix_key: e.target.value }))}
              placeholder="CPF, CNPJ, email ou chave aleatória"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Estabelecimento *
            </label>
            <input
              type="text"
              value={config.pix_merchant_name}
              onChange={(e) => setConfig(prev => ({ ...prev, pix_merchant_name: e.target.value }))}
              placeholder="Nome que aparece no PIX"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade *
            </label>
            <input
              type="text"
              value={config.pix_merchant_city}
              onChange={(e) => setConfig(prev => ({ ...prev, pix_merchant_city: e.target.value }))}
              placeholder="Cidade do estabelecimento"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxa de Entrega (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={config.delivery_fee}
              onChange={(e) => setConfig(prev => ({ ...prev, delivery_fee: parseFloat(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor Mínimo do Pedido (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={config.min_order_value}
              onChange={(e) => setConfig(prev => ({ ...prev, min_order_value: parseFloat(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={saveConfig}
            disabled={saving}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              'Salvar Configurações'
            )}
          </button>
        </div>
      </motion.div>

      {/* Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
      >
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">Informações Importantes</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• O agente usará essas configurações para consultar estoque e processar vendas</p>
              <p>• Teste sempre a conexão após configurar o ERP</p>
              <p>• A chave PIX será usada para gerar QR codes de pagamento</p>
              <p>• Configure valores mínimos e taxas de acordo com sua política</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SupermarketERPConfig;