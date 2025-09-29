import { db } from '../config/supabase.js';

const agentController = {
  async create(req, res) {
    try {
      const agentData = req.body;
      const userId = req.userId;

      const agent = await db.agents.create(userId, agentData);
      
      res.status(201).json({
        success: true,
        message: 'Agente criado com sucesso',
        data: { agent }
      });
    } catch (error) {
      console.error('Create agent error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  },

  async getAll(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const userId = req.userId;
      
      const agents = await db.agents.findByUserId(userId);

      res.json({ 
        success: true,
        data: { agents }
      });
    } catch (error) {
      console.error('Get agents error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      const agents = await db.agents.findByUserId(userId);
      const agent = agents.find(a => a.id === id);
      
      if (!agent) {
        return res.status(404).json({ 
          success: false, 
          error: 'Agente não encontrado' 
        });
      }

      res.json({ 
        success: true,
        data: { agent }
      });
    } catch (error) {
      console.error('Get agent error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const agent = await db.agents.update(id, updates);
      
      if (!agent) {
        return res.status(404).json({ 
          success: false, 
          error: 'Agente não encontrado' 
        });
      }

      res.json({
        success: true,
        message: 'Agente atualizado com sucesso',
        data: { agent }
      });
    } catch (error) {
      console.error('Update agent error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const success = await db.agents.delete(id);
      
      if (!success) {
        return res.status(404).json({ 
          success: false, 
          error: 'Agente não encontrado' 
        });
      }

      res.json({ 
        success: true,
        message: 'Agente excluído com sucesso' 
      });
    } catch (error) {
      console.error('Delete agent error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  },

  async getStats(req, res) {
    try {
      const userId = req.userId;
      const agents = await db.agents.findByUserId(userId);
      
      const stats = {
        total: agents.length,
        active: agents.filter(a => a.is_active).length,
        dailyCreated: [] // Implementar se necessário
      };
      
      res.json({ 
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Get agent stats error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  }
};

export default agentController;