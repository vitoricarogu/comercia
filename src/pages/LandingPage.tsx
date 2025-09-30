import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowDownIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export const LandingPage: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dinâmica
                </h1>
                <p className="text-sm text-gray-500">Plataforma de Agentes IA</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => scrollToSection('about')}
                className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                CONHEÇA MAIS
              </button>
              <Link
                to="/login"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                FAZER LOGIN
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Automatize seu Atendimento com
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Agentes de IA
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Plataforma SaaS completa para criar, configurar e gerenciar agentes de inteligência artificial 
              que automatizam vendas, agendamentos e atendimento 24/7 via WhatsApp.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={() => scrollToSection('about')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center"
              >
                CONHEÇA MAIS
                <ArrowDownIcon className="ml-2 h-5 w-5" />
              </button>
              <Link
                to="/login"
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center"
              >
                FAZER LOGIN
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que é a Plataforma Dinâmica?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma solução SaaS completa que permite criar agentes de IA personalizados para automatizar 
              vendas, agendamentos e atendimento ao cliente via WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Supermercados</h3>
              <p className="text-gray-600">
                Agentes que atendem clientes, consultam estoque via ERP, processam pedidos e 
                enviam PIX para pagamento automático.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl"
            >
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Barbearias</h3>
              <p className="text-gray-600">
                Agentes especializados em agendamentos automáticos, gerenciamento de horários 
                e confirmação de serviços via WhatsApp.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl"
            >
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CogIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Administração</h3>
              <p className="text-gray-600">
                Painel completo para gerenciar usuários, monitorar métricas do sistema 
                e controlar todas as funcionalidades da plataforma.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa para automatizar seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: SparklesIcon,
                title: 'IA Avançada',
                description: 'Powered by Google Gemini para conversas naturais e inteligentes'
              },
              {
                icon: ChatBubbleLeftRightIcon,
                title: 'WhatsApp Business',
                description: 'Integração completa com WhatsApp Business API'
              },
              {
                icon: ChartBarIcon,
                title: 'Analytics em Tempo Real',
                description: 'Métricas detalhadas de conversas, vendas e agendamentos'
              },
              {
                icon: ShieldCheckIcon,
                title: 'Multi-Tenant Seguro',
                description: 'Isolamento completo de dados entre usuários'
              },
              {
                icon: CogIcon,
                title: 'Configuração Flexível',
                description: 'Personalize agentes, prompts e integrações'
              },
              {
                icon: UserGroupIcon,
                title: 'Gestão Completa',
                description: 'Painel administrativo para controle total'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600">
              Em 3 passos simples você automatiza seu atendimento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Crie sua Conta',
                description: 'Registre-se escolhendo o tipo de negócio (Supermercado ou Barbearia)'
              },
              {
                step: '02',
                title: 'Configure seu Agente',
                description: 'Personalize a IA com prompts, conecte ao WhatsApp e configure integrações'
              },
              {
                step: '03',
                title: 'Automatize Tudo',
                description: 'Seu agente atende clientes 24/7, processa vendas e agenda serviços automaticamente'
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Por que escolher a Dinâmica?
              </h2>
              <div className="space-y-4">
                {[
                  'Atendimento 24/7 automatizado',
                  'Integração completa com WhatsApp Business',
                  'Processamento de pagamentos via PIX',
                  'Agenda inteligente sem conflitos',
                  'Métricas detalhadas em tempo real',
                  'Segurança e isolamento de dados',
                  'Configuração simples e intuitiva',
                  'Suporte técnico especializado'
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center"
                  >
                    <CheckIcon className="h-6 w-6 text-green-600 mr-3" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ChartBarIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Resultados Comprovados
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">95%</p>
                      <p className="text-sm text-gray-600">Redução no tempo de atendimento</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-600">24/7</p>
                      <p className="text-sm text-gray-600">Disponibilidade total</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-purple-600">80%</p>
                      <p className="text-sm text-gray-600">Aumento nas vendas</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-yellow-600">100%</p>
                      <p className="text-sm text-gray-600">Automação de agendamentos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para Automatizar seu Negócio?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de empresas que já automatizaram seu atendimento com nossa plataforma.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all shadow-lg font-medium"
          >
            Começar Agora - É Grátis
            <SparklesIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h3 className="text-xl font-bold">Dinâmica</h3>
                <p className="text-sm text-gray-400">Plataforma de Agentes IA</p>
              </div>
            </div>
            <p className="text-gray-400">
              © 2025 Dinâmica. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;