-- 006_service_definition_system.sql
-- Service Definition System (SDS), resource pools, queues, and appointment enrichments

ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'routine',
    ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(50) NOT NULL DEFAULT 'in-person',
    ADD COLUMN IF NOT EXISTS service_type VARCHAR(120),
    ADD COLUMN IF NOT EXISTS service_category VARCHAR(120),
    ADD COLUMN IF NOT EXISTS facility_id UUID,
    ADD COLUMN IF NOT EXISTS facility_name TEXT,
    ADD COLUMN IF NOT EXISTS facility_address TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS assigned_staff_type TEXT,
    ADD COLUMN IF NOT EXISTS assigned_room TEXT,
    ADD COLUMN IF NOT EXISTS assigned_equipment TEXT;

UPDATE appointments
SET description = COALESCE(description, reason)
WHERE description IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_service_type ON appointments(service_type);
CREATE INDEX IF NOT EXISTS idx_appointments_service_category ON appointments(service_category);
CREATE INDEX IF NOT EXISTS idx_appointments_priority ON appointments(priority);

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    service_category VARCHAR(120) NOT NULL,
    service_type VARCHAR(120) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    duration_minutes INT NOT NULL DEFAULT 15,
    buffer_before_minutes INT NOT NULL DEFAULT 0,
    buffer_after_minutes INT NOT NULL DEFAULT 0,
    requires_appointment BOOLEAN NOT NULL DEFAULT TRUE,
    allows_walkin BOOLEAN NOT NULL DEFAULT TRUE,
    requires_checkin BOOLEAN NOT NULL DEFAULT TRUE,
    supports_recurrence BOOLEAN NOT NULL DEFAULT FALSE,
    allowed_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
    max_occurrences INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, service_type)
);

CREATE TABLE IF NOT EXISTS service_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    resource_scope VARCHAR(20) NOT NULL CHECK (resource_scope IN ('staff', 'room', 'equipment')),
    resource_type VARCHAR(120) NOT NULL,
    required_count INT NOT NULL DEFAULT 1,
    mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    facility_id UUID,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INT NOT NULL DEFAULT 15,
    capacity_per_slot INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    rule_type VARCHAR(120) NOT NULL,
    rule_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    next_service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(service_id, next_service_id)
);

CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('staff', 'room', 'equipment')),
    category VARCHAR(120) NOT NULL,
    label TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    facility_id UUID,
    availability_schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resource_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    role VARCHAR(80),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(appointment_id, resource_id)
);

CREATE TABLE IF NOT EXISTS queues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_type VARCHAR(120) NOT NULL,
    facility TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(service_type, facility)
);

CREATE TABLE IF NOT EXISTS queue_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    queue_id UUID NOT NULL REFERENCES queues(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    position INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting',
    estimated_wait_minutes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(queue_id, appointment_id)
);

-- Seed baseline services and resources for local/dev
WITH tenant AS (
    SELECT id FROM tenants WHERE slug = 'default' LIMIT 1
), inserted_services AS (
    INSERT INTO services (
        tenant_id, name, description, service_category, service_type, active,
        duration_minutes, buffer_before_minutes, buffer_after_minutes,
        requires_appointment, allows_walkin, requires_checkin,
        supports_recurrence, allowed_patterns, max_occurrences
    )
    SELECT tenant.id, s.name, s.description, s.service_category, s.service_type, TRUE,
           s.duration_minutes, s.buffer_before_minutes, s.buffer_after_minutes,
           TRUE, s.allows_walkin, TRUE,
           TRUE, '["weekly","monthly"]'::jsonb, 10
    FROM tenant
    CROSS JOIN (
        VALUES
        ('General Consultation', 'Outpatient consultation', 'consultation', 'general_consultation', 20, 5, 5, TRUE),
        ('Blood Test', 'Laboratory blood collection and analysis', 'laboratory', 'blood_test', 15, 5, 5, TRUE),
        ('X-Ray', 'Radiology imaging service', 'imaging', 'xray', 30, 5, 10, FALSE)
    ) AS s(name, description, service_category, service_type, duration_minutes, buffer_before_minutes, buffer_after_minutes, allows_walkin)
    ON CONFLICT (tenant_id, service_type) DO NOTHING
    RETURNING id, service_type
)
INSERT INTO resources (tenant_id, type, category, label, status)
SELECT (SELECT id FROM tenants WHERE slug='default'), type, category, label, status
FROM (
    VALUES
    ('staff', 'clinician', 'Clinician Pool A', 'available'),
    ('staff', 'lab_technician', 'Lab Technician Pool', 'available'),
    ('staff', 'radiology_technician', 'Radiology Technician Pool', 'available'),
    ('room', 'consultation_room', 'Consultation Room 1', 'available'),
    ('room', 'lab_room', 'Lab Room 1', 'available'),
    ('room', 'imaging_room', 'Imaging Room 1', 'busy'),
    ('equipment', 'blood_analyzer', 'Analyzer A', 'available'),
    ('equipment', 'xray_machine', 'X-Ray Unit 1', 'available')
) AS r(type, category, label, status)
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE label = r.label);
