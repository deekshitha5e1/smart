-- Enable the UUID extension (just in case you still want UUIDs elsewhere)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =======================================================
-- 1. USERS TABLE
-- Stores shared authentication and profile details.
-- Using VARCHAR(255) for the primary key (uid) to support Firebase UIDs.
-- =======================================================
CREATE TABLE users (
    uid VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'patient', -- 'patient', 'doctor', or 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =======================================================
-- 2. PATIENTS TABLE
-- Stores specific details only relevant to patients.
-- =======================================================
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    blood_group VARCHAR(10),
    allergies TEXT,
    emergency_contact VARCHAR(20)
);

-- =======================================================
-- 3. DOCTORS TABLE
-- Stores specific details only relevant to medical professionals.
-- =======================================================
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    hospital_id VARCHAR(100) NOT NULL,
    specialisation VARCHAR(150),
    shift VARCHAR(50) DEFAULT 'day', -- 'day' or 'night'
    free_time VARCHAR(100),
    patients_consulted INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' -- 'pending', 'active'
);

-- =======================================================
-- 4. APPOINTMENTS TABLE
-- Links a patient to a doctor for an appointment.
-- =======================================================
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    doctor_id VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =======================================================
-- 5. INDEXES FOR SPEED
-- =======================================================
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_doctors_specialisation ON doctors(specialisation);
