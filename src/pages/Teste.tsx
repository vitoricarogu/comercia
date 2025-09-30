import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CubeIcon,               // substitui DatabaseIcon
  ServerIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  WifiIcon,
} from '@heroicons/react/24/outline';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
}

export const Teste: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Conexão com Banco de Dados', status: 'pending', message: 'Aguardando teste...' },
    { name: 'API Backend', status: 'pending', message: 'Aguardando teste...' },
    { name: 'Autenticação JWT', status: 'pending', message: 'Aguardando teste...' },
    { name: 'WebSocket', status: 'pending', message: 'Aguardando teste...' },
    { name: 'CRUD Usuários', status: 'pending', message: 'Aguardando teste...' },
    { name: 'CRUD Agentes', status: 'pending', message: 'Aguardando teste...' },
    { name: 'Sistema de Chat', status: 'pending', message: 'Aguardando teste...' },
    { name: 'Módulo Barbearia', status: 'pending', message: 'Aguardando teste...' },
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (index: number, status: 'success' | 'error', message: string, details?: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, details } : test
    ));
  };

  const runTest = async (testName: string, testFunction: () => Promise<{ success: boolean; message: string; details?: string }>) => {
    const index = tests.findIndex(t => t.name === testName);
    try {
      const result = await testFunction();
      updateTest(index, result.success ? 'success' : 'error', result.message, result.details);
    } catch (error) {
      updateTest(index, 'error', `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // ---------- Funções de teste ----------
  const testDatabase = async () => {
    const response = await fetch('/api/health');
    const data = await response.json();
    return response.ok && data.status === 'OK'
      ? { success: true, message: 'Banco conectado com sucesso' }
      : { success: false, message: 'Falha na conexão com banco' };
  };

  const testBackendAPI = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      if (response.ok) {
        return { success: true, message: 'API funcionando', details: `Versão: ${data.version}, Ambiente: ${data.environment}` };
      } else {
        return { success: false, message: 'API não responde' };
      }
    } catch {
      return { success: false, message: 'Erro de conexão com API' };
    }
  };

  const testAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'teste@dinamica.com', password: 'teste123' })
      });
      const data = await response.json();
      return response.ok && data.success && data.token
        ? { success: true, message: 'Autenticação funcionando', details: 'Token JWT gerado' }
        : { success: false, message: 'Falha na autenticação' };
    } catch {
      return { success: false, message: 'Erro no teste de autenticação' };
    }
  };

  const testWebSocket = async () => {
    return new Promise<{ success: boolean; message: string }>((resolve) => {
      try {
        const socket = new WebSocket('ws://localhost:3001');
        socket.onopen = () => { socket.close(); resolve({ success: true, message: 'WebSocket conectado' }); };
        socket.onerror = () => resolve({ success: false, message: 'Erro na conexão WebSocket' });
        setTimeout(() => { socket.close(); resolve({ success: false, message: 'Timeout na conexão WebSocket' }); }, 5000);
      } catch {
        resolve({ success: false, message: 'Erro ao testar WebSocket' });
      }
    });
  };

  const testUsersCRUD = async () => {
    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@dinamica.com', password: 'admin123' })
      });
      const loginData = await loginResponse.json();
      if (!loginData.success) return { success: false, message: 'Falha no login para teste' };

      const profileResponse = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${loginData.token}` } });
      const profileData = await profileResponse.json();

      return profileResponse.ok && profileData.success
        ? { success: true, message: 'CRUD usuários funcionando', details: `Usuário: ${profileData.user.name}` }
        : { success: false, message: 'Erro no CRUD usuários' };
    } catch {
      return { success: false, message: 'Erro no teste CRUD usuários' };
    }
  };

  const testAgentsCRUD = async () => {
    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'teste@dinamica.com', password: 'teste123' })
      });
      const loginData = await loginResponse.json();
      if (!loginData.success) return { success: false, message: 'Falha no login para teste' };

      const agentsResponse = await fetch('/api/agents', { headers: { 'Authorization': `Bearer ${loginData.token}` } });
      const agentsData = await agentsResponse.json();

      return agentsResponse.ok && agentsData.success
        ? { success: true, message: 'CRUD agentes funcionando', details: `${agentsData.data.agents.length} agentes encontrados` }
        : { success: false, message: 'Erro no CRUD agentes' };
    } catch {
      return { success: false, message: 'Erro no teste CRUD agentes' };
    }
  };

  const testChatSystem = async () => {
    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'teste@dinamica.com', password: 'teste123' })
      });
      const loginData = await loginResponse.json();
      if (!loginData.success) return { success: false, message: 'Falha no login para teste' };

      const convResponse = await fetch('/api/conversations', { headers: { 'Authorization': `Bearer ${loginData.token}` } });
      const convData = await convResponse.json();

      return convResponse.ok && convData.success
        ? { success: true, message: 'Sistema de chat funcionando', details: `${convData.data.conversations.length} conversas encontradas` }
        : { success: false, message: 'Erro no sistema de chat' };
    } catch {
      return { success: false, message: 'Erro no teste do chat' };
    }
  };

  const testBarbeariaModule = async () => {
    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'barbearia@dinamica.com', password: 'barbearia123' })
      });
      const loginData = await loginResponse.json();
      if (!loginData.success) return { success: false, message: 'Falha no login barbearia' };

      const agendResponse = await fetch('/api/barbearia/agendamentos', { headers: { 'Authorization': `Bearer ${loginData.token}` } });
      const agendData = await agendResponse.json();

      return agendResponse.ok && agendData.success
        ? { success: true, message: 'Módulo barbearia funcionando', details: `${agendData.data.length} agendamentos encontrados` }
        : { success: false, message: 'Erro no módulo barbearia' };
    } catch {
      return { success: false, message: 'Erro no teste barbearia' };
    }
  };

  // ---------- Rodar todos os testes ----------
  const runAllTests = async () => {
    setIsRunning(true);
    setTests(prev => prev.map(test => ({ ...test, status: 'pending', message: 'Executando...' })));

    await runTest('Conexão com Banco de Dados', testDatabase);
    await runTest('API Backend', testBackendAPI);
    await runTest('Autenticação JWT', testAuthentication);
    await runTest('WebSocket', testWebSocket);
    await runTest('CRUD Usuários', testUsersCRUD);
    await runTest('CRUD Agentes', testAgentsCRUD);
    await runTest('Sistema de Chat', testChatSystem);
    await runTest('Módulo Barbearia', testBarbeariaModule);

    setIsRunning(false);
  };

  // ---------- Funções de ícones ----------
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'error
