// Script de detecção automática de módulo baseado no role do usuário
// Este script será executado no login para redirecionar automaticamente
export const detectUserModule = (user) => {
  if (user.role === 'barbearia') return '/dashboard/barber';
  if (user.role === 'normal') return '/dashboard/user';
  if (user.role === 'admin') return '/admin';
  return '/dashboard';
};