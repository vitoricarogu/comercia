import AIService from '../services/aiService.js';
import { db } from '../config/supabase.js';

const chatController = {
  async sendMessage(req, res) {
    try {
      const { conversationId, message, agentId } = req.body;
      const userId = req.userId;

      if (!message || !agentId || !conversationId) {
        return res.status(400).json({
          success: false,
          error: 'Mensagem, agente e conversa são obrigatórios'
        });
      }

      // Verificar se a conversa existe e pertence ao usuário
      const conversations = await db.conversations.findByUserId(userId);
      const conversation = conversations.find(c => c.id === conversationId);
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversa não encontrada'
        });
      }

      // Buscar agente
      const agents = await db.agents.findByUserId(userId);
      const agent = agents.find(a => a.id === agentId && a.is_active);

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agente não encontrado ou inativo'
        });
      }

      // Salvar mensagem do usuário
      const userMessage = await db.messages.create({
        conversation_id: conversationId,
        content: message,
        sender: 'user',
        message_type: 'text',
        timestamp: new Date().toISOString()
      });

      // Gerar resposta da IA com RAG
      const startTime = Date.now();
      const aiResponse = await AIService.generateWithRAG(
        userId,
        agent.ai_provider,
        agent.model,
        message,
        agent,
        agent.temperature,
        agent.max_tokens
      );
      const responseTime = (Date.now() - startTime) / 1000;

      // Salvar resposta da IA
      const aiMessage = await db.messages.create({
        conversation_id: conversationId,
        content: aiResponse,
        sender: 'agent',
        message_type: 'text',
        response_time: responseTime,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        data: {
          userMessage,
          aiMessage
        }
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  },

  async getMessages(req, res) {
    try {
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const messages = await db.messages.findByConversationId(id);

      res.json({
        success: true,
        data: { messages }
      });

    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  },

  async createConversation(req, res) {
    try {
      const conversationData = req.body;
      const userId = req.userId;

      const conversation = await db.conversations.create(userId, conversationData);

      res.json({
        success: true,
        data: { conversation }
      });

    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  },

  async searchKnowledge(req, res) {
    try {
      const { query, limit = 10 } = req.query;

      if (!query) {
        return res.json({
          success: true,
          data: { results: [] }
        });
      }

      // Implementar busca na base de conhecimento se necessário
      res.json({
        success: true,
        data: { results: [] }
      });

    } catch (error) {
      console.error('Erro ao buscar conhecimento:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  },

  async addKnowledge(req, res) {
    try {
      const { title, content, category, tags } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          error: 'Título e conteúdo são obrigatórios'
        });
      }

      // Implementar adição à base de conhecimento se necessário
      res.json({
        success: true,
        data: {
          id: Date.now().toString(),
          title,
          content,
          category,
          tags
        }
      });

    } catch (error) {
      console.error('Erro ao adicionar conhecimento:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  }
};

export default chatController;