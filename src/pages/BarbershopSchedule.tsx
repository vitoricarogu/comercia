import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';

interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  datetime: string;
  service: string;
  price: number;
  payment_status: 'pending' | 'paid';
  payment_method: 'pix' | 'money' | 'card';
  status: 'confirmed' | 'completed' | 'cancelled';
  created_by_ai: boolean;
  notes?: string;
  created_at: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export const BarbershopSchedule: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    client_name: '',
    client_phone: '',
    datetime: '',
    service: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [appointmentsRes, servicesRes] = await Promise.all([
        apiService.get(`/barbershop/appointments?date=${selectedDate}`),
        apiService.get('/barbershop/services')
      ]);

      if (appointmentsRes.success) {
        setAppointments(appointmentsRes.data.appointments || []);
      }

      if (servicesRes.success) {
        setServices(servicesRes.data.services || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro', 'Não foi possível carregar os dados da agenda');
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async () => {
    if (!newAppointment.client_name || !newAppointment.client_phone || !newAppointment.datetime || !newAppointment.service) {
      showError('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const selectedService = services.find(s => s.id === newAppointment.service);
      
      const response = await apiService.post('/barbershop/appointments', {
        ...newAppointment,
        price: selectedService?.price || 0,
        created_by_ai: false
      });

      if (response.success) {
        setAppointments(prev => [...prev, response.data.appointment]);
        setShowCreateModal(false);
        setNewAppointment({
          client_name: '',
          client_phone: '',
          datetime: '',
          service: '',
          notes: '',
        });
        showSuccess('Agendamento criado!', 'Novo agendamento adicionado à agenda');
      } else {
        showError('Erro', response.error || 'Erro ao criar agendamento');
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      showError('Erro', 'Não foi possível criar o agendamento');
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const response = await apiService.put(`/barbershop/appointments/${appointmentId}`, { status });
      
      if (response.success) {
        setAppointments(prev => prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: status as any } : apt
        ));
        showSuccess('Status atualizado!', `Agendamento ${status} com sucesso`);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showError('Erro', 'Não foi possível atualizar o status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600">Gerencie os agendamentos da barbearia</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Carregando agenda...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Agendamentos - {new Date(selectedDate).toLocaleDateString('pt-BR')}
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {appointments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento</h3>
                <p className="text-gray-500 mb-6">Não há agendamentos para esta data.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Criar Agendamento
                </button>
              </div>
            ) : (
              appointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{appointment.client_name}</h4>
                          {appointment.created_by_ai && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              IA
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{appointment.client_phone}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {new Date(appointment.datetime).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          <span>{appointment.service}</span>
                          <span className="flex items-center">
                            <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                            R$ {appointment.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(appointment.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status === 'confirmed' ? 'Confirmado' :
                             appointment.status === 'completed' ? 'Concluído' : 'Cancelado'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {appointment.payment_status === 'paid' ? '✅ Pago' : '❌ Pendente'}
                        </p>
                      </div>

                      {appointment.status === 'confirmed' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Concluir
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Novo Agendamento</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={newAppointment.client_name}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="Nome completo"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={newAppointment.client_phone}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, client_phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data e Horário *
                </label>
                <input
                  type="datetime-local"
                  value={newAppointment.datetime}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, datetime: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serviço *
                </label>
                <select
                  value={newAppointment.service}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, service: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um serviço</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações adicionais..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createAppointment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criar Agendamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarbershopSchedule;