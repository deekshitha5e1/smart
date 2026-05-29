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

-- =======================================================
-- 6. PRESCRIPTIONS TABLE
-- Stores digital prescriptions issued by doctors.
-- =======================================================
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    doctor_id VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    patient_id VARCHAR(255) REFERENCES users(uid) ON DELETE SET NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_email VARCHAR(255),
    diagnosis TEXT NOT NULL,
    medicines TEXT NOT NULL, -- Serialized JSON array of medicine objects (name, dosage, duration)
    additional_recommendations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);

-- =======================================================
-- 7. REVIEWS TABLE
-- Stores patient reviews and ratings for appointments.
-- =======================================================
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    doctor_id VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_doctor ON reviews(doctor_id);
CREATE INDEX idx_reviews_patient ON reviews(patient_id);
CREATE INDEX idx_reviews_appointment ON reviews(appointment_id);


