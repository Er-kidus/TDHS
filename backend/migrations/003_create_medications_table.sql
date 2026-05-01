-- Create medications table
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ndc_code VARCHAR(20) UNIQUE NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    dosage_form VARCHAR(100),
    strength VARCHAR(50),
    manufacturer VARCHAR(255),
    description TEXT,
    is_controlled_substance BOOLEAN DEFAULT false,
    schedule_level INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medications_ndc ON medications(ndc_code);
CREATE INDEX idx_medications_brand_name ON medications(brand_name);
CREATE INDEX idx_medications_generic_name ON medications(generic_name);
CREATE INDEX idx_medications_controlled ON medications(is_controlled_substance);
