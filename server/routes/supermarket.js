import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { db } from '../config/supabase.js';
import AIService from '../services/aiService.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configurar multer para upload de arquivos RAG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/rag/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.txt', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Middleware para verificar se é usuário normal (supermercado)
const verificarUsuarioNormal = (req, res, next) => {
  if (req.user.role !== 'normal') {
    return res.status(403).json({ 
      success: false, 
      error: 'Acesso negado. Apenas usuários de supermercado podem acessar esta funcionalidade.' 
    });
  }
  next();
};

// Aplicar middleware de autenticação e verificação
router.use(authMiddleware);
router.use(verificarUsuarioNormal);

// ==================== DASHBOARD STATS ====================

// GET /api/supermarket/stats - Estatísticas do supermercado
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar pedidos do usuário
    const orders = await db.orders.findByUserId(userId);
    const conversations = await db.conversations.findByUserId(userId);
    
    const stats = {
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total_value, 0),
      activeConversations: conversations.filter(c => c.status === 'active').length,
      avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total_value, 0) / orders.length : 0
    };
    
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// GET /api/supermarket/orders - Listar pedidos
router.get('/orders', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, status } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    
    const orders = await db.orders.findByUserId(userId, filters, parseInt(limit));
    
    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// ==================== AGENTES ====================

// GET /api/supermarket/agents - Listar agentes
router.get('/agents', async (req, res) => {
  try {
    const userId = req.user.id;
    const agents = await db.agents.findByUserId(userId);
    
    // Adicionar métricas para cada agente
    for (const agent of agents) {
      const conversations = await db.conversations.findByUserId(userId, { agent_id: agent.id });
      const orders = await db.orders.findByUserId(userId, { agent_id: agent.id });
      
      agent.total_conversations = conversations.length;
      agent.total_orders = orders.length;
      agent.total_revenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total_value, 0);
    }
    
    res.json({
      success: true,
      data: { agents }
    });
  } catch (error) {
    console.error('Erro ao buscar agentes:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// POST /api/supermarket/agents - Criar agente
router.post('/agents', upload.single('rag_file'), async (req, res) => {
  try {
    const userId = req.user.id;
    const agentData = req.body;
    
    // Configuração WhatsApp
    const whatsappConfig = {
      phone: agentData.whatsapp_phone,
      token: agentData.whatsapp_token,
      phone_id: agentData.whatsapp_phone_id
    };
    
    const agent = await db.agents.create(userId, {
      name: agentData.name,
      description: agentData.description,
      objective: agentData.objective,
      personality: agentData.personality,
      system_prompt: agentData.system_prompt,
      temperature: parseFloat(agentData.temperature),
      ai_provider: 'gemini',
      model: 'gemini-1.5-flash',
      whatsapp_config: JSON.stringify(whatsappConfig),
      rag_file: req.file ? req.file.path : null
    });
    
    res.json({
      success: true,
      data: { agent },
      message: 'Agente criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar agente:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// GET /api/supermarket/agents/:id/conversations - Conversas do agente
router.get('/agents/:id/conversations', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const conversations = await db.conversations.findByUserId(userId, { agent_id: id });
    
    res.json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// DELETE /api/supermarket/agents/:id - Excluir agente
router.delete('/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.agents.delete(id);
    
    res.json({
      success: true,
      message: 'Agente excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir agente:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// ==================== CONFIGURAÇÃO ERP ====================

// GET /api/supermarket/erp-config - Obter configurações ERP
router.get('/erp-config', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const configKeys = [
      'erp_endpoint', 'erp_token', 'erp_username', 'erp_password',
      'pix_key', 'pix_merchant_name', 'pix_merchant_city',
      'delivery_fee', 'min_order_value'
    ];
    
    const config = {};
    for (const key of configKeys) {
      const value = await db.configs.get(userId, key);
      if (value) {
        config[key] = key.includes('password') || key.includes('token') || key.includes('key') 
          ? '***' // Mascarar dados sensíveis
          : value;
      }
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Erro ao buscar configuração ERP:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// POST /api/supermarket/erp-config - Salvar configurações ERP
router.post('/erp-config', async (req, res) => {
  try {
    const userId = req.user.id;
    const config = req.body;
    
    // Salvar cada configuração
    for (const [key, value] of Object.entries(config)) {
      if (value) {
        await db.configs.set(userId, key, value);
      }
    }
    
    res.json({
      success: true,
      message: 'Configurações ERP salvas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao salvar configuração ERP:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// POST /api/supermarket/test-erp - Testar conexão ERP
router.post('/test-erp', async (req, res) => {
  try {
    const { erp_endpoint, erp_token, erp_username, erp_password } = req.body;
    
    if (!erp_endpoint || !erp_token) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint e token são obrigatórios'
      });
    }
    
    // Testar conexão com ERP
    const testResponse = await fetch(`${erp_endpoint}/health`, {
      headers: {
        'Authorization': `Bearer ${erp_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (testResponse.ok) {
      res.json({
        success: true,
        message: 'Conexão ERP funcionando!'
      });
    } else {
      res.json({
        success: false,
        error: 'Erro na conexão com ERP. Verifique suas credenciais.'
      });
    }
  } catch (error) {
    console.error('Erro ao testar ERP:', error);
    res.json({
      success: false,
      error: 'Erro ao testar conexão ERP'
    });
  }
});

export default router;