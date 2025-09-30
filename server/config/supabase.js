import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('✅ Supabase configurado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao configurar Supabase:', error.message);
  }
} else {
  console.log('⚠️  Supabase não configurado - Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
}

// Função para testar conexão
export const testConnection = async () => {
  if (!supabase) {
    console.log('⚠️  Supabase não configurado');
    return false;
  }

  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro de conexão Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Supabase conectado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Falha na conexão Supabase:', error.message);
    return false;
  }
};

// Operações do banco de dados
export const db = {
  // Usuários
  users: {
    async create(userData) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw new Error(`Erro ao criar usuário: ${error.message}`);
      return data;
    },
    
    async findByEmail(email) {
      if (!supabase) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw new Error(`Erro ao buscar usuário: ${error.message}`);
      }
      return data;
    },
    
    async findById(id) {
      if (!supabase) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw new Error(`Erro ao buscar usuário: ${error.message}`);
      }
      return data;
    },
    
    async update(id, updates) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Erro ao atualizar usuário: ${error.message}`);
      return data;
    },
    
    async getAll(limit = 50, offset = 0, filters = {}) {
      if (!supabase) return [];
      
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      
      const { data, error } = await query.range(offset, offset + limit - 1);
      
      if (error) throw new Error(`Erro ao buscar usuários: ${error.message}`);
      return data || [];
    },
    
    async delete(id) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(`Erro ao excluir usuário: ${error.message}`);
      return true;
    }
  },
  
  // Agentes
  agents: {
    async create(userId, agentData) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { data, error } = await supabase
        .from('agents')
        .insert({
          ...agentData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw new Error(`Erro ao criar agente: ${error.message}`);
      return data;
    },
    
    async findByUserId(userId) {
      if (!supabase) return [];
      
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(`Erro ao buscar agentes: ${error.message}`);
      return data || [];
    },
    
    async update(id, updates) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { data, error } = await supabase
        .from('agents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Erro ao atualizar agente: ${error.message}`);
      return data;
    },
    
    async delete(id) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(`Erro ao excluir agente: ${error.message}`);
      return true;
    }
  },
  
  // Conversas
  conversations: {
    async create(userId, conversationData) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          ...conversationData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw new Error(`Erro ao criar conversa: ${error.message}`);
      return data;
    },
    
    async findByUserId(userId, filters = {}) {
      if (!supabase) return [];
      
      let query = supabase
        .from('conversations')
        .select(`
          *,
          agents(name)
        `)
        .eq('user_id', userId);
      
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.agent_id) query = query.eq('agent_id', filters.agent_id);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw new Error(`Erro ao buscar conversas: ${error.message}`);
      return data || [];
    }
  },
  
  // Mensagens
  messages: {
    async create(messageData) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...messageData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw new Error(`Erro ao criar mensagem: ${error.message}`);
      return data;
    },
    
    async findByConversationId(conversationId) {
      if (!supabase) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });
      
      if (error) throw new Error(`Erro ao buscar mensagens: ${error.message}`);
      return data || [];
    }
  },
  
  // Configurações
  configs: {
    async get(userId, configKey) {
      if (!supabase) return null;
      
      const { data, error } = await supabase
        .from('configuracoes')
        .select('valor')
        .eq('user_id', userId)
        .eq('chave', configKey)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw new Error(`Erro ao buscar configuração: ${error.message}`);
      }
      return data?.valor;
    },
    
    async set(userId, configKey, configValue) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { data, error } = await supabase
        .from('configuracoes')
        .upsert({ 
          user_id: userId, 
          chave: configKey, 
          valor: configValue,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw new Error(`Erro ao salvar configuração: ${error.message}`);
      return data;
    }
  },
  
  // Configurações globais
  globalConfigs: {
    async get(configKey) {
      if (!supabase) return null;
      
      const { data, error } = await supabase
        .from('global_configs')
        .select('config_value')
        .eq('config_key', configKey)
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw new Error(`Erro ao buscar configuração global: ${error.message}`);
      }
      return data?.config_value;
    },
    
    async set(configKey, configValue) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { data, error } = await supabase
        .from('global_configs')
        .upsert({ 
          config_key: configKey, 
          config_value: configValue,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw new Error(`Erro ao salvar configuração global: ${error.message}`);
      return data;
    },
    
    async getAll() {
      if (!supabase) return {};
      
      const { data, error } = await supabase
        .from('global_configs')
        .select('config_key, config_value')
        .eq('is_active', true);
      
      if (error) throw new Error(`Erro ao buscar configurações globais: ${error.message}`);
      
      const configs = {};
      (data || []).forEach(config => {
        configs[config.config_key] = config.config_value;
      });
      
      return configs;
    }
  },

  // WhatsApp configs
  whatsapp: {
    async create(userId, configData) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { data, error } = await supabase
        .from('whatsapp_configs')
        .insert({
          ...configData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw new Error(`Erro ao criar configuração WhatsApp: ${error.message}`);
      return data;
    },
    
    async findByUserId(userId) {
      if (!supabase) return [];
      
      const { data, error } = await supabase
        .from('whatsapp_configs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(`Erro ao buscar configurações WhatsApp: ${error.message}`);
      return data || [];
    },
    
    async delete(id) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { error } = await supabase
        .from('whatsapp_configs')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(`Erro ao excluir configuração WhatsApp: ${error.message}`);
      return true;
    }
  },

  // Barbearia - Agendamentos
  agendamentos: {
    async create(userId, agendamentoData) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { data, error } = await supabase
        .from('agendamentos')
        .insert({
          ...agendamentoData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw new Error(`Erro ao criar agendamento: ${error.message}`);
      return data;
    },
    
    async findByUserId(userId, filters = {}) {
      if (!supabase) return [];
      
      let query = supabase
        .from('agendamentos')
        .select('*')
        .eq('user_id', userId);
      
      if (filters.data) query = query.eq('data', filters.data);
      if (filters.status) query = query.eq('status', filters.status);
      
      const { data, error } = await query.order('data', { ascending: true });
      
      if (error) throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
      return data || [];
    },
    
    async update(id, updates) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { data, error } = await supabase
        .from('agendamentos')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
      return data;
    }
  },

  // Pedidos (Supermercado)
  orders: {
    async create(userId, orderData) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw new Error(`Erro ao criar pedido: ${error.message}`);
      return data;
    },
    
    async findByUserId(userId, filters = {}, limit = 50) {
      if (!supabase) return [];
      
      let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId);
      
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.agent_id) query = query.eq('agent_id', filters.agent_id);
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw new Error(`Erro ao buscar pedidos: ${error.message}`);
      return data || [];
    }
  },

  // Agendamentos (Barbearia)
  appointments: {
    async create(userId, appointmentData) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw new Error(`Erro ao criar agendamento: ${error.message}`);
      return data;
    },
    
    async findByUserId(userId, filters = {}) {
      if (!supabase) return [];
      
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId);
      
      if (filters.date) {
        const startDate = `${filters.date}T00:00:00`;
        const endDate = `${filters.date}T23:59:59`;
        query = query.gte('datetime', startDate).lte('datetime', endDate);
      }
      
      if (filters.status) query = query.eq('status', filters.status);
      
      const { data, error } = await query.order('datetime', { ascending: true });
      
      if (error) throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
      return data || [];
    },
    
    async update(id, updates) {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
      return data;
    }
  },

  // Barbearia - Serviços
  servicos: {
    async findByUserId(userId) {
      if (!supabase) return [];
      
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('nome', { ascending: true });
      
      if (error) throw new Error(`Erro ao buscar serviços: ${error.message}`);
      return data || [];
    }
  },

  // Barbearia - Clientes
  clientes: {
    async findByUserId(userId) {
      if (!supabase) return [];
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('nome', { ascending: true });
      
      if (error) throw new Error(`Erro ao buscar clientes: ${error.message}`);
      return data || [];
    }
  }
};

export { supabase };