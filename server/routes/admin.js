import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { db } from '../config/supabase.js';

const router = express.Router();

// Aplicar middleware de autenticação e admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard administrativo
router.get('/dashboard', async (req, res) => {
  try {
    const users = await db.users.getAll(1000, 0);
    
    const userStats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.is_active).length,
      adminUsers: users.filter(u => u.role === 'admin').length,
      barbeariaUsers: users.filter(u => u.role === 'barbearia').length
    };

    res.json({
      success: true,
      data: {
        overview: userStats
      }
    });
  } catch (error) {
    console.error('Erro no dashboard admin:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// Gerenciamento de usuários
router.get('/users', async (req, res) => {
  try {
    const { limit = 50, offset = 0, search, role, is_active } = req.query;
    
    const filters = {};
    if (search) filters.search = search;
    if (role) filters.role = role;
    if (is_active !== undefined) filters.is_active = is_active === 'true';

    const users = await db.users.getAll(parseInt(limit), parseInt(offset), filters);

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// Atualizar usuário
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    await db.users.update(id, updates);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// Excluir usuário
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se não é admin
    const user = await db.users.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Não é possível excluir usuário administrador'
      });
    }

    await db.users.delete(id);

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// Configurações globais
router.get('/configs', async (req, res) => {
  try {
    const configs = await db.globalConfigs.getAll();

    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// Salvar configuração global
router.post('/configs', async (req, res) => {
  try {
    const { config_key, config_value } = req.body;

    if (!config_key) {
      return res.status(400).json({
        success: false,
        error: 'Chave de configuração é obrigatória'
      });
    }

    await db.globalConfigs.set(config_key, config_value);

    res.json({
      success: true,
      message: 'Configuração salva com sucesso'
    });
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

export default router;