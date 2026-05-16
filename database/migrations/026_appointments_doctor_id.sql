-- 026_appointments_doctor_id.sql
-- Add doctor_id column to appointments table and org_admin constraint fix

-- Add doctor_id to appointments so doctors can be assigned
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);

-- Fix: Ensure the org_staff_profiles organization_id is correctly set
-- when a user is registered as staff (organization_id should come from the assigned org, not default)
-- This is handled by the LEFT JOIN fix in the repository layer already done.
