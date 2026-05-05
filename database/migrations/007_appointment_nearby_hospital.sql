-- 007_appointment_nearby_hospital.sql
-- Persist structured nearby hospital references on appointments.

ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS nearby_hospital_id TEXT,
    ADD COLUMN IF NOT EXISTS nearby_hospital_name TEXT,
    ADD COLUMN IF NOT EXISTS nearby_hospital_address TEXT,
    ADD COLUMN IF NOT EXISTS nearby_hospital_distance_km DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_appointments_nearby_hospital_id ON appointments(nearby_hospital_id);
