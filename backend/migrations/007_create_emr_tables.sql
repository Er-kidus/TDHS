-- Create emr_systems table
CREATE TABLE emr_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    api_endpoint VARCHAR(500) NOT NULL,
    api_key_encrypted TEXT,
    oauth_config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create emr_integration_logs table
CREATE TABLE emr_integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emr_system_id UUID NOT NULL REFERENCES emr_systems(id),
    prescription_id UUID REFERENCES prescriptions(id),
    request_type VARCHAR(50), -- 'sync', 'create', 'update'
    request_payload JSONB,
    response_payload JSONB,
    status VARCHAR(20), -- 'success', 'error', 'pending'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emr_systems_active ON emr_systems(is_active);
CREATE INDEX idx_emr_logs_system ON emr_integration_logs(emr_system_id);
CREATE INDEX idx_emr_logs_prescription ON emr_integration_logs(prescription_id);
CREATE INDEX idx_emr_logs_status ON emr_integration_logs(status);
CREATE INDEX idx_emr_logs_created ON emr_integration_logs(created_at);
