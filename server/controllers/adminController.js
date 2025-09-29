```javascript
import { db } from '../config/supabase.js';

const adminController = {
  // Dashboard com estatísticas gerais do sistema
  async getDashboard(req, res) {
    try {
      // Estatísticas básicas de usuários
      const allUsers = await db.users.getAll(1000, 0); // Fetch all users for aggregation
      
      const userStats = {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.is_active).length,
        adminUsers: allUsers.filter(u => u.role === 'admin').length,
        barbeariaUsers: allUsers.filter(u => u.role === 'barbearia').length
      };

      let totalAgents = 0;
      let totalConversations = 0;
      let totalMessages = 0;
      let totalSatisfaction = 0;
      let satisfactionCount = 0;

      for (const user of allUsers.filter(u => u.role !== 'admin')) { // Exclude admin from agent/conversation stats
        try {
          const userAgents = await db.agents.findByUserId(user.id);
          totalAgents += userAgents.length;

          const userConversations = await db.conversations.findByUserId(user.id);
          totalConversations += userConversations.length;

          for (const conv of userConversations) {
            const messages = await db.messages.findByConversationId(conv.id);
            totalMessages += messages.length;
            if (conv.satisfaction_rating) {
              totalSatisfaction += conv.satisfaction_rating;
              satisfactionCount++;
            }
          }
        } catch (error) {
          console.warn(`Could not fetch data for user ${user.id}: ${error.message}`);
          // Continue processing other users even if one fails
        }
      }

      const avgSatisfaction = satisfactionCount > 0 ? (totalSatisfaction / satisfactionCount) : 0;

      res.json({
        success: true,
        data: {
          overview: {
            totalUsers: userStats.totalUsers,
            activeUsers: userStats.activeUsers,
            adminUsers: userStats.adminUsers,
            totalAgents,
            totalConversations,
            totalMessages,
            avgSatisfaction: parseFloat(avgSatisfaction.toFixed(1))
          }
        }
      });
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao carregar dashboard administrativo'
      });
    }
  },

  // Obter todos os usuários do sistema
  async getUsers(req, res) {
    try {
      const { limit = 50, offset = 0, search, role, plan, is_active } = req.query;
      
      const filters = {};
      if (search) filters.search = search;
      if (role) filters.role = role;
      if (plan) filters.plan = plan;
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      const users = await db.users.getAll(parseInt(limit), parseInt(offset), filters);
      // Supabase's getAll already handles pagination and filtering, so we don't need a separate total count query here
      // If a total count is needed for frontend pagination, db.users.getAll would need to return it.
      // For now, assuming the frontend can handle pagination based on the returned array length or a separate endpoint for total count.

      res.json({
        success: true,
        data: {
          users,
          // pagination: { total: users.length, limit: parseInt(limit), offset: parseInt(offset) } // This would require a separate count from Supabase
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar usuários'
      });
    }
  },

  // Excluir usuário
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

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

      const success = await db.users.delete(id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado ou erro ao excluir'
        });
      }

      res.json({
        success: true,
        message: 'Usuário excluído com sucesso'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao excluir usuário'
      });
    }
  }
};

export default adminController;
```