-- ============================================================
-- 006_pharmacy.sql
-- Pharmacy Inventory & Fulfillment module tables
-- ============================================================

-- ── Medications Catalog ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS medications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID REFERENCES tenants(id),
    name            VARCHAR(255) NOT NULL,
    generic_name    VARCHAR(255),
    rx_norm_code    VARCHAR(100),
    dosage_form     VARCHAR(100), -- e.g., 'Tablet', 'Syrup'
    strength        VARCHAR(100), -- e.g., '500mg'
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Pharmacy Inventory ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pharmacy_inventories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID REFERENCES tenants(id),
    organization_id UUID NOT NULL, -- The pharmacy organization
    medication_id   UUID NOT NULL REFERENCES medications(id),
    stock_level     INTEGER NOT NULL DEFAULT 0,
    reorder_level   INTEGER NOT NULL DEFAULT 0,
    unit_price      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status          VARCHAR(50) NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock', 'discontinued')),
    last_restocked  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, medication_id)
);

CREATE INDEX IF NOT EXISTS idx_pharm_inv_org ON pharmacy_inventories(organization_id);
CREATE INDEX IF NOT EXISTS idx_pharm_inv_med ON pharmacy_inventories(medication_id);

-- ── Prescription Fulfillments ─────────────────────────────────
CREATE TABLE IF NOT EXISTS prescription_fulfillments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID REFERENCES tenants(id),
    organization_id UUID NOT NULL, -- The pharmacy organization dispensing it
    patient_id      UUID NOT NULL REFERENCES users(id), -- Patient receiving it
    prescription_id UUID NOT NULL, -- Reference to the clinical prescription
    pharmacist_id   UUID NOT NULL REFERENCES users(id), -- Who dispensed it
    medication_id   UUID NOT NULL REFERENCES medications(id),
    quantity_dispensed INTEGER NOT NULL,
    notes           TEXT,
    fulfilled_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_presc_ful_org ON prescription_fulfillments(organization_id);
CREATE INDEX IF NOT EXISTS idx_presc_ful_pat ON prescription_fulfillments(patient_id);
CREATE INDEX IF NOT EXISTS idx_presc_ful_rx ON prescription_fulfillments(prescription_id);
