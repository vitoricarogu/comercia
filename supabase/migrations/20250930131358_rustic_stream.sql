-- =====================================================
-- TABELAS ADICIONAIS PARA MÓDULOS ESPECÍFICOS
-- =====================================================

-- =====================================================
-- TABELA ORDERS (SUPERMERCADO)
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT,
  items_json TEXT NOT NULL, -- JSON com itens do pedido
  items_count INTEGER DEFAULT 0,
  total_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  delivery_fee DECIMAL(10,2) DEFAULT 0.00,
  payment_method VARCHAR(20) DEFAULT 'pix' CHECK (payment_method IN ('pix','money','card')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','cancelled')),
  pix_code TEXT, -- Código PIX gerado
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','delivering','completed','cancelled')),
  delivery_datetime TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_agent ON orders(agent_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own orders" ON orders;
CREATE POLICY "Users can manage own orders" ON orders
  FOR ALL USING (user_id = uid());

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA APPOINTMENTS (BARBEARIA)
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  client_name VARCHAR(255) NOT NULL,
  client_phone VARCHAR(20) NOT NULL,
  datetime TIMESTAMP NOT NULL,
  service VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending','paid')),
  payment_method VARCHAR(20) DEFAULT 'money' CHECK (payment_method IN ('pix','money','card')),
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed','completed','cancelled')),
  notes TEXT,
  created_by_ai BOOLEAN DEFAULT false,
  whatsapp_message_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_agent ON appointments(agent_id);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(datetime);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own appointments" ON appointments;
CREATE POLICY "Users can manage own appointments" ON appointments
  FOR ALL USING (user_id = uid());

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA RAG_FILES (ARQUIVOS DE CONHECIMENTO)
-- =====================================================
CREATE TABLE IF NOT EXISTS rag_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(50),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_files_agent ON rag_files(agent_id);

-- RLS
ALTER TABLE rag_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage rag files from own agents" ON rag_files;
CREATE POLICY "Users can manage rag files from own agents" ON rag_files
  FOR ALL USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = uid()
    )
  );

-- =====================================================
-- INSERIR DADOS INICIAIS
-- =====================================================

-- Usuários de teste (senhas: admin123, super123, barber123)
INSERT INTO users (id, name, email, password, role, phone, is_active) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin Sistema', 'admin@dinamica.com', '$2a$12$LQv3c1yqBwlVHpPjrPyFUOeCaFHXPReVlVXVb4FwELfxvQjLw/oRq', 'admin', '(11) 99999-0001', true),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Supermercado Teste', 'super@dinamica.com', '$2a$12$LQv3c1yqBwlVHpPjrPyFUOeCaFHXPReVlVXVb4FwELfxvQjLw/oRq', 'normal', '(11) 99999-0002', true),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Barbearia Teste', 'barber@dinamica.com', '$2a$12$LQv3c1yqBwlVHpPjrPyFUOeCaFHXPReVlVXVb4FwELfxvQjLw/oRq', 'barbearia', '(11) 99999-0003', true)
ON CONFLICT (email) DO NOTHING;

-- Configurações globais padrão
INSERT INTO global_configs (config_key, config_value, description) VALUES
('system_name', 'Dinâmica SaaS', 'Nome do sistema'),
('max_agents_per_user', '10', 'Máximo de agentes por usuário'),
('max_whatsapp_per_user', '3', 'Máximo de WhatsApps por usuário')
ON CONFLICT (config_key) DO NOTHING;