import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { db } from '../config/supabase.js';

const router = express.Router();

// Aplicar middleware de autenticação
router.use(authMiddleware);

// ==================== WHATSAPP CONFIGURATIONS ====================

// GET /api/config/whatsapp - Listar configurações WhatsApp
router.get('/whatsapp', async (req, res) => {
  try {
    const userId = req.userId;
    
    const configs = await db.whatsapp.findByUserId(userId);
    
    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('Erro ao buscar configurações WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// POST /api/config/whatsapp - Adicionar configuração WhatsApp
router.post('/whatsapp', async (req, res) => {
  try {
    const userId = req.userId;
    const { name, access_token, phone_number_id, webhook_verify_token, business_account_id } = req.body;
    
    if (!name || !access_token || !phone_number_id) {
      return res.status(400).json({
        success: false,
        error: 'Nome, access token e phone number ID são obrigatórios'
      });
    }

    // Verificar limite de WhatsApps por usuário
    const existingConfigs = await db.whatsapp.findByUserId(userId);
    const maxWhatsApp = 3; // Limite padrão
    
    if (existingConfigs.length >= maxWhatsApp) {
      return res.status(400).json({
        success: false,
        error: `Limite máximo de ${maxWhatsApp} WhatsApps por usuário atingido`
      });
    }

    const newConfig = await db.whatsapp.create(userId, {
      name,
      access_token,
      phone_number_id,
      webhook_verify_token,
      business_account_id
    });

    res.json({
      success: true,
      data: newConfig,
      message: 'Configuração WhatsApp adicionada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao adicionar WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// DELETE /api/config/whatsapp/:id - Remover configuração WhatsApp
router.delete('/whatsapp/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.whatsapp.delete(id);

    res.json({
      success: true,
      message: 'Configuração WhatsApp removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// POST /api/config/test-whatsapp - Testar conexão WhatsApp
router.post('/test-whatsapp', async (req, res) => {
  try {
    const { access_token, phone_number_id } = req.body;

    if (!access_token || !phone_number_id) {
      return res.status(400).json({
        success: false,
        error: 'Access token e phone number ID são obrigatórios'
      });
    }

    // Testar conexão com WhatsApp Business API
    const testResponse = await fetch(`https://graph.facebook.com/v18.0/${phone_number_id}`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (testResponse.ok) {
      const data = await testResponse.json();
      res.json({
        success: true,
        message: 'WhatsApp conectado com sucesso',
        data: {
          phone_number: data.display_phone_number,
          verified_name: data.verified_name
        }
      });
    } else {
      res.json({
        success: false,
        error: 'Erro na conexão com WhatsApp. Verifique suas credenciais.'
      });
    }
  } catch (error) {
    console.error('Erro ao testar WhatsApp:', error);
    res.json({
      success: false,
      error: 'Erro ao testar conexão WhatsApp'
    });
  }
});

// ==================== EMAIL CONFIGURATIONS ====================

// GET /api/config/email - Obter configurações de email
router.get('/email', async (req, res) => {
  try {
    const userId = req.userId;
    
    const emailConfig = {};
    const configKeys = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'from_name', 'from_email'];
    
    for (const key of configKeys) {
      const value = await db.configs.get(userId, `email_${key}`);
      if (value) {
        emailConfig[key] = value;
      }
    }
    
    res.json({
      success: true,
      data: emailConfig
    });
  } catch (error) {
    console.error('Erro ao buscar configurações de email:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// POST /api/config/email - Salvar configurações de email
router.post('/email', async (req, res) => {
  try {
    const userId = req.userId;
    const { smtp_host, smtp_port, smtp_user, smtp_pass, from_name, from_email } = req.body;

    const emailConfigs = [
      { key: 'email_smtp_host', value: smtp_host },
      { key: 'email_smtp_port', value: smtp_port },
      { key: 'email_smtp_user', value: smtp_user },
      { key: 'email_smtp_pass', value: smtp_pass },
      { key: 'email_from_name', value: from_name },
      { key: 'email_from_email', value: from_email },
    ];

    for (const config of emailConfigs) {
      if (config.value) {
        await db.configs.set(userId, config.key, config.value);
      }
    }

    res.json({
      success: true,
      message: 'Configurações de email salvas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao salvar configurações de email:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

export default router;