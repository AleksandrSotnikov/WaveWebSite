-- Wave Studio Database Schema
-- PostgreSQL 14+
-- Timezone: UTC+6

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Admin Users Table
-- =====================================================
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'manager')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- =====================================================
-- Trainers Table
-- =====================================================
CREATE TABLE trainers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    specialization VARCHAR(100),
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trainers_full_name ON trainers(full_name);
CREATE INDEX idx_trainers_is_active ON trainers(is_active);

-- =====================================================
-- Clients Table
-- =====================================================
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    messenger_link VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_full_name ON clients(full_name);
CREATE INDEX idx_clients_phone_number ON clients(phone_number);

-- =====================================================
-- Subscriptions Table
-- =====================================================
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('limited', 'unlimited')),
    price DECIMAL(10, 2) NOT NULL,
    total_sessions INTEGER,
    sessions_used INTEGER DEFAULT 0,
    start_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expiration_date ON subscriptions(expiration_date);

-- =====================================================
-- Sessions Table (Trainings)
-- =====================================================
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC+6',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_trainer_id ON sessions(trainer_id);
CREATE INDEX idx_sessions_date_time ON sessions(date_time);
CREATE INDEX idx_sessions_date ON sessions(DATE(date_time AT TIME ZONE 'UTC+6'));

-- =====================================================
-- Session Attendees Table (Junction)
-- =====================================================
CREATE TABLE session_attendees (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_session_attendees_unique ON session_attendees(session_id, client_id);
CREATE INDEX idx_session_attendees_subscription_id ON session_attendees(subscription_id);

-- =====================================================
-- Income Calculations Table (Cache)
-- =====================================================
CREATE TABLE income_calculations (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    total_income DECIMAL(10, 2) NOT NULL,
    income_per_session DECIMAL(10, 2) NOT NULL,
    commission_rate DECIMAL(3, 2) DEFAULT 0.45,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_income_calculations_trainer_id ON income_calculations(trainer_id);
CREATE INDEX idx_income_calculations_session_id ON income_calculations(session_id);
CREATE INDEX idx_income_calculations_date ON income_calculations(DATE(created_at AT TIME ZONE 'UTC+6'));

-- =====================================================
-- Audit Log Table
-- =====================================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    changes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_admin_user_id ON audit_logs(admin_user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- =====================================================
-- Views
-- =====================================================

-- Активные абонементы клиента
CREATE VIEW active_subscriptions AS
SELECT 
    s.id,
    s.client_id,
    c.full_name,
    s.type,
    s.price,
    s.total_sessions,
    s.sessions_used,
    (s.total_sessions - s.sessions_used) as remaining_sessions,
    s.start_date,
    s.expiration_date,
    s.status,
    CASE 
        WHEN s.expiration_date < CURRENT_DATE THEN 'expired'
        WHEN s.expiration_date = CURRENT_DATE THEN 'expiring_today'
        WHEN s.expiration_date < CURRENT_DATE + INTERVAL '7 days' THEN 'expiring_soon'
        ELSE 'active'
    END as display_status
FROM subscriptions s
JOIN clients c ON s.client_id = c.id
WHERE s.status = 'active' AND s.expiration_date >= CURRENT_DATE;

-- Доход тренера за период
CREATE VIEW trainer_income_view AS
SELECT 
    t.id as trainer_id,
    t.full_name,
    DATE(s.date_time AT TIME ZONE 'UTC+6') as session_date,
    COUNT(DISTINCT s.id) as sessions_count,
    COUNT(DISTINCT sa.client_id) as clients_count,
    COALESCE(SUM(ic.income_per_session), 0) as total_income
FROM trainers t
LEFT JOIN sessions s ON t.id = s.trainer_id
LEFT JOIN session_attendees sa ON s.id = sa.session_id
LEFT JOIN income_calculations ic ON s.id = ic.session_id AND t.id = ic.trainer_id
WHERE s.date_time IS NOT NULL
GROUP BY t.id, t.full_name, DATE(s.date_time AT TIME ZONE 'UTC+6')
ORDER BY t.id, session_date DESC;

-- =====================================================
-- Functions
-- =====================================================

-- Функция для обновления статуса абонемента
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expiration_date < CURRENT_DATE THEN
        NEW.status := 'expired';
    ELSE
        NEW.status := 'active';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления статуса абонемента
CREATE TRIGGER trigger_update_subscription_status
BEFORE INSERT OR UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscription_status();

-- Функция для расчета дохода тренера
CREATE OR REPLACE FUNCTION calculate_trainer_income(
    p_trainer_id INTEGER,
    p_session_id INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
    v_total_income DECIMAL;
    v_clients_count INTEGER;
    v_session_count INTEGER;
    v_commission_rate DECIMAL := 0.45;
BEGIN
    -- Получаем количество клиентов на тренировке
    SELECT COUNT(*) INTO v_clients_count
    FROM session_attendees
    WHERE session_id = p_session_id;

    -- Получаем общую стоимость абонементов клиентов
    SELECT COALESCE(SUM(s.price), 0) INTO v_total_income
    FROM session_attendees sa
    JOIN subscriptions s ON sa.subscription_id = s.id
    WHERE sa.session_id = p_session_id;

    -- Расчет дохода тренера (45% делим на количество клиентов)
    IF v_clients_count > 0 THEN
        v_total_income := (v_total_income * v_commission_rate) / v_clients_count;
    END IF;

    RETURN v_total_income;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Seed Data (Example)
-- =====================================================

-- Default Admin User (password: Admin123456, hashed with bcrypt)
INSERT INTO admin_users (username, password_hash, email, role, is_active)
VALUES (
    'admin',
    '$2a$10$YXq1Bvd.5Pu1l4ZP.K1FkOyXIBYvFyA5u3L0Y9q.H5ZJ2qK1L2X0G',  -- Admin123456
    'admin@wavestudio.local',
    'admin',
    true
);

-- Sample Trainers
INSERT INTO trainers (full_name, specialization, phone_number, is_active)
VALUES 
    ('Иван Сидоров', 'Современный танец', '+79991234567', true),
    ('Мария Петрова', 'Классический балет', '+79991234568', true),
    ('Алексей Кулаков', 'Хип-хоп', '+79991234569', true);

-- Sample Clients
INSERT INTO clients (full_name, phone_number, messenger_link)
VALUES 
    ('Александра Павлова', '+78001111111', 'https://vk.com/alexandra.pavlova'),
    ('Кристина Смирнова', '+78001111112', 'https://vk.com/kristina.smirnova'),
    ('Евгения Иванова', '+78001111113', 'https://vk.com/evgenia.ivanova');

-- Sample Subscriptions
INSERT INTO subscriptions (client_id, type, price, total_sessions, sessions_used, start_date, expiration_date, status)
VALUES 
    (1, 'limited', 3000, 8, 0, '2025-12-16', '2026-01-16', 'active'),
    (1, 'unlimited', 5000, NULL, 0, '2025-12-01', '2026-01-01', 'active'),
    (2, 'limited', 3000, 8, 0, '2025-12-15', '2026-01-15', 'active'),
    (3, 'limited', 3000, 4, 0, '2025-12-10', '2026-01-10', 'active');

-- =====================================================
-- Permissions & Security
-- =====================================================

-- Создание роли для приложения
CREATE ROLE wave_app WITH LOGIN PASSWORD 'wave_password';

-- Предоставляем разрешения
GRANT USAGE ON SCHEMA public TO wave_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO wave_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO wave_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO wave_app;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE admin_users IS 'Таблица администраторов системы';
COMMENT ON TABLE trainers IS 'Таблица тренеров студии';
COMMENT ON TABLE clients IS 'Таблица клиентов студии';
COMMENT ON TABLE subscriptions IS 'Таблица абонементов клиентов (лимитированные и безлимитные)';
COMMENT ON TABLE sessions IS 'Таблица тренировок';
COMMENT ON TABLE session_attendees IS 'Таблица участников тренировок (связь)';
COMMENT ON TABLE income_calculations IS 'Таблица расчитанного дохода тренеров';
COMMENT ON TABLE audit_logs IS 'Таблица логов всех действий в системе';
