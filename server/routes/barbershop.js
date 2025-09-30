import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { db } from '../config/supabase.js';

const router = express.Router();

// Middleware para verificar se é usuário da barbearia
const verificarUsuarioBarbearia = (req, res, next) => {
  if (req.user.role !== 'barbearia') {
    return res.status(403).json({ 
      success: false, 
      error: 'Acesso negado. Apenas usuários da barbearia podem acessar esta funcionalidade.' 
    });
  }
  next();
};

// Aplicar middleware de autenticação e verificação
router.use(authMiddleware);
router.use(verificarUsuarioBarbearia);

// ==================== AGENDAMENTOS ====================

// GET /api/barbershop/appointments - Listar agendamentos
router.get('/appointments', async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, status } = req.query;
    
    const filters = {};
    if (date) filters.date = date;
    if (status) filters.status = status;
    
    const appointments = await db.appointments.findByUserId(userId, filters);
    
    res.json({
      success: true,
      data: { appointments }
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// POST /api/barbershop/appointments - Criar agendamento
router.post('/appointments', async (req, res) => {
  try {
    const userId = req.user.id;
    const { client_name, client_phone, datetime, service, price, notes, created_by_ai = false } = req.body;
    
    if (!client_name || !client_phone || !datetime || !service) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: client_name, client_phone, datetime, service'
      });
    }

    // Verificar conflito de horário (cada serviço dura 30 minutos)
    const appointmentDate = new Date(datetime);
    const endTime = new Date(appointmentDate.getTime() + 30 * 60000); // +30 minutos
    
    const existingAppointments = await db.appointments.findByUserId(userId, {
      date: appointmentDate.toISOString().split('T')[0]
    });
    
    const conflict = existingAppointments.find(apt => {
      const aptStart = new Date(apt.datetime);
      const aptEnd = new Date(aptStart.getTime() + 30 * 60000);
      
      return (appointmentDate >= aptStart && appointmentDate < aptEnd) ||
             (endTime > aptStart && endTime <= aptEnd) ||
             (appointmentDate <= aptStart && endTime >= aptEnd);
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        error: 'Horário já ocupado. Escolha outro horário.'
      });
    }

    const appointment = await db.appointments.create(userId, {
      client_name,
      client_phone,
      datetime,
      service,
      price: price || 0,
      payment_status: 'pending',
      payment_method: 'money',
      status: 'confirmed',
      notes,
      created_by_ai
    });
    
    res.json({
      success: true,
      data: { appointment },
      message: 'Agendamento criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// PUT /api/barbershop/appointments/:id - Atualizar agendamento
router.put('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const appointment = await db.appointments.update(id, updates);
    
    res.json({
      success: true,
      data: { appointment },
      message: 'Agendamento atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// ==================== SERVIÇOS ====================

// GET /api/barbershop/services - Listar serviços
router.get('/services', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Serviços padrão da barbearia
    const defaultServices = [
      { id: '1', name: 'Corte Masculino', duration: 30, price: 25.00 },
      { id: '2', name: 'Barba', duration: 30, price: 15.00 },
      { id: '3', name: 'Cabelo + Barba', duration: 30, price: 35.00 },
      { id: '4', name: 'Sobrancelha', duration: 30, price: 10.00 },
    ];
    
    res.json({
      success: true,
      data: { services: defaultServices }
    });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

export default router;