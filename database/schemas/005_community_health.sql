-- ============================================================
-- 005_community_health.sql
-- Community Health Agent (CHA) module tables
-- ============================================================

-- ── Community Areas ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_areas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID REFERENCES tenants(id),
    organization_id UUID NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    region_code     VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_areas_org ON community_areas(organization_id);

-- ── Health Agents (CHAs) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_agents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id),
    organization_id UUID NOT NULL,
    area_id         UUID REFERENCES community_areas(id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_health_agents_org ON health_agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_health_agents_area ON health_agents(area_id);

-- ── Households ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS households (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID REFERENCES tenants(id),
    organization_id     UUID NOT NULL,
    area_id             UUID REFERENCES community_areas(id),
    head_name           VARCHAR(255) NOT NULL,
    contact_number      VARCHAR(50),
    address             TEXT,
    gps_coordinates     JSONB, -- {"lat": 1.23, "lng": 4.56}
    risk_level          VARCHAR(20) NOT NULL DEFAULT 'green' CHECK (risk_level IN ('green','yellow','red','critical')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_households_org ON households(organization_id);
CREATE INDEX IF NOT EXISTS idx_households_area ON households(area_id);

-- ── Household Members ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS household_members (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id    UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    patient_id      UUID, -- Can be NULL if not yet fully registered as a portal patient
    full_name       VARCHAR(255) NOT NULL,
    date_of_birth   DATE,
    gender          VARCHAR(20),
    relationship    VARCHAR(50),
    is_pregnant     BOOLEAN NOT NULL DEFAULT FALSE,
    has_chronic     BOOLEAN NOT NULL DEFAULT FALSE,
    risk_level      VARCHAR(20) NOT NULL DEFAULT 'green' CHECK (risk_level IN ('green','yellow','red','critical')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_household_members_hh ON household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_patient ON household_members(patient_id);

-- ── Community Visits ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_visits (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID REFERENCES tenants(id),
    organization_id UUID NOT NULL,
    agent_id        UUID NOT NULL REFERENCES health_agents(id),
    household_id    UUID NOT NULL REFERENCES households(id),
    member_id       UUID REFERENCES household_members(id), -- NULL if it's a general household visit
    visit_date      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    visit_type      VARCHAR(50) NOT NULL DEFAULT 'routine' CHECK (visit_type IN ('routine','follow_up','emergency','maternal','chronic')),
    vitals_logged   JSONB NOT NULL DEFAULT '{}', -- E.g. {"bp": "120/80", "hr": 75}
    symptoms        JSONB NOT NULL DEFAULT '[]',
    notes           TEXT,
    triage_escalated BOOLEAN NOT NULL DEFAULT FALSE,
    triage_reason    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_visits_hh ON community_visits(household_id);
CREATE INDEX IF NOT EXISTS idx_community_visits_member ON community_visits(member_id);
CREATE INDEX IF NOT EXISTS idx_community_visits_agent ON community_visits(agent_id);
CREATE INDEX IF NOT EXISTS idx_community_visits_org ON community_visits(organization_id);
