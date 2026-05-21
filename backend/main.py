import os
from dotenv import load_dotenv

# Load .env file from parent directory (since backend is inside hosp/backend)
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(parent_dir, '.env')
load_dotenv(dotenv_path, override=True)

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Date, Time, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import Optional, List
import datetime

# --- Load Environment Variables ---
# Fallback to local SQLite if DATABASE_URL is not set. 
# In production or Supabase, set DATABASE_URL in your .env or environment variables.
# Format: postgresql://postgres:[password]@db.laqrobzmpqkjmjulnhat.supabase.co:5432/postgres
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres.laqrobzmpqkjmjulnhat:Deekshitha123%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
)

# Force pg8000 driver so we don't get C-compilation errors (pg_config missing)
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+pg8000://", 1)
elif DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)

# If they don't have PostgreSQL set up yet, fallback gracefully to SQLite so it doesn't crash
if "pg8000" not in DATABASE_URL and "postgresql" not in DATABASE_URL:
    print("WARNING: DATABASE_URL not set to PostgreSQL. Falling back to local SQLite database.")
    DATABASE_URL = "sqlite:///./hospital.db"
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

# --- Database Setup ---
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SQLAlchemy Models matching Supabase Schema ---

class UserDB(Base):
    __tablename__ = "users"
    
    uid = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="patient") # 'patient', 'doctor', 'admin'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    doctor_profile = relationship("DoctorDB", back_populates="user", uselist=False, cascade="all, delete-orphan")
    patient_profile = relationship("PatientDB", back_populates="user", uselist=False, cascade="all, delete-orphan")

class PatientDB(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.uid", ondelete="CASCADE"), unique=True, nullable=False)
    blood_group = Column(String(10), nullable=True)
    allergies = Column(String, nullable=True)
    emergency_contact = Column(String(20), nullable=True)

    user = relationship("UserDB", back_populates="patient_profile")

class DoctorDB(Base):
    __tablename__ = "doctors"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.uid", ondelete="CASCADE"), unique=True, nullable=False)
    hospital_id = Column(String(100), nullable=False)
    specialisation = Column(String(150), nullable=True)
    shift = Column(String(50), default="day") # 'day' or 'night'
    free_time = Column(String(100), nullable=True)
    patients_consulted = Column(Integer, default=0)
    status = Column(String(50), default="pending")

    user = relationship("UserDB", back_populates="doctor_profile")

class AppointmentDB(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("users.uid", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(String, ForeignKey("users.uid", ondelete="CASCADE"), nullable=False)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    status = Column(String(50), default="pending") # 'pending', 'accepted', 'rejected', 'completed'
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# Create tables in Database (if they don't exist yet)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Error creating tables: {e}. If this is Supabase, make sure your connection credentials are correct.")

# --- Pydantic Schemas ---

class UserBase(BaseModel):
    uid: str
    email: str
    full_name: str
    role: str = "patient"

class DoctorProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    hospital_id: str
    specialisation: Optional[str] = None
    shift: str = "day"
    free_time: Optional[str] = None
    patients_consulted: int = 0

class DoctorResponse(BaseModel):
    uid: str
    email: str
    full_name: str
    hospital_id: str
    specialisation: Optional[str] = None
    shift: str = "day"
    free_time: Optional[str] = None
    patients_consulted: int = 0
    status: str

class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_id: str
    appointment_date: str # format: YYYY-MM-DD
    appointment_time: str # format: HH:MM

class AppointmentResponse(BaseModel):
    id: int
    patient_id: str
    patient_name: str
    patient_email: str
    doctor_id: str
    doctor_name: str
    appointment_date: datetime.date
    appointment_time: datetime.time
    status: str

    class Config:
        from_attributes = True

# --- FastAPI App Setup ---
app = FastAPI(title="Hospital Backend API (Supabase & PostgreSQL)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API Routes ---

@app.get("/")
def home():
    return {"message": "Hospital API connected to PostgreSQL/Supabase DB is active!"}

# 1. Get Base User Profile
@app.get("/api/users/{uid}", response_model=UserBase)
def get_user_profile(uid: str, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserBase(
        uid=user.uid,
        email=user.email,
        full_name=user.full_name,
        role=user.role
    )

# 2. Signup / Create User
@app.post("/api/users/signup")
def signup_user(user_data: UserBase, hospital_id: Optional[str] = None, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(UserDB).filter(UserDB.uid == user_data.uid).first()
    if existing_user:
        return {"message": "User already exists", "uid": existing_user.uid}
    
    # Create Base User
    new_user = UserDB(
        uid=user_data.uid,
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role
    )
    db.add(new_user)
    db.flush() # Flush to lock ID and relationships
    
    # Create respective sub-profiles
    if user_data.role == "doctor":
        if not hospital_id:
            raise HTTPException(status_code=400, detail="Hospital ID required for Doctor role")
        new_doctor = DoctorDB(
            user_id=new_user.uid,
            hospital_id=hospital_id,
            status="pending"
        )
        db.add(new_doctor)
    else:
        new_patient = PatientDB(user_id=new_user.uid)
        db.add(new_patient)
        
    db.commit()
    return {"message": "User and profile successfully created", "uid": new_user.uid}

# 2. Get Doctor Profile
@app.get("/api/doctor/profile/{uid}", response_model=DoctorResponse)
def get_doctor_profile(uid: str, db: Session = Depends(get_db)):
    doctor = db.query(DoctorDB).filter(DoctorDB.user_id == uid).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    user = db.query(UserDB).filter(UserDB.uid == uid).first()
    return DoctorResponse(
        uid=user.uid,
        email=user.email,
        full_name=user.full_name,
        hospital_id=doctor.hospital_id,
        specialisation=doctor.specialisation,
        shift=doctor.shift,
        free_time=doctor.free_time,
        patients_consulted=doctor.patients_consulted,
        status=doctor.status
    )

# 3. Save / Update Doctor Profile
@app.put("/api/doctor/profile/{uid}")
def update_doctor_profile(uid: str, profile_update: DoctorProfileUpdate, db: Session = Depends(get_db)):
    # 1. Ensure user exists in base users table
    user = db.query(UserDB).filter(UserDB.uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update full name if provided
    if profile_update.full_name:
        user.full_name = profile_update.full_name

    # 2. Upsert Doctor Profile
    doctor = db.query(DoctorDB).filter(DoctorDB.user_id == uid).first()
    if not doctor:
        # Create a new doctor profile row
        doctor = DoctorDB(
            user_id=uid,
            hospital_id=profile_update.hospital_id,
            specialisation=profile_update.specialisation,
            shift=profile_update.shift,
            free_time=profile_update.free_time,
            patients_consulted=profile_update.patients_consulted,
            status="active"
        )
        db.add(doctor)
    else:
        # Update existing doctor profile row
        doctor.hospital_id = profile_update.hospital_id
        doctor.specialisation = profile_update.specialisation
        doctor.shift = profile_update.shift
        doctor.free_time = profile_update.free_time
        doctor.patients_consulted = profile_update.patients_consulted
    
    db.commit()
    return {"message": "Profile updated successfully"}

# 4. Search Doctors
@app.get("/api/doctors/search", response_model=List[DoctorResponse])
def search_doctors(specialisation: Optional[str] = None, db: Session = Depends(get_db)):
    query_builder = db.query(DoctorDB).join(UserDB)
    if specialisation:
        query_builder = query_builder.filter(DoctorDB.specialisation.ilike(f"%{specialisation}%"))
    doctors = query_builder.all()
    
    results = []
    for doc in doctors:
        user = db.query(UserDB).filter(UserDB.uid == doc.user_id).first()
        results.append(DoctorResponse(
            uid=user.uid,
            email=user.email,
            full_name=user.full_name,
            hospital_id=doc.hospital_id,
            specialisation=doc.specialisation,
            shift=doc.shift,
            free_time=doc.free_time,
            patients_consulted=doc.patients_consulted,
            status=doc.status
        ))
    return results

# 5. Request Appointment
@app.post("/api/patient/appointment")
def request_appointment(req: AppointmentCreate, db: Session = Depends(get_db)):
    # Parse date and time
    try:
        app_date = datetime.datetime.strptime(req.appointment_date, "%Y-%m-%d").date()
        app_time = datetime.datetime.strptime(req.appointment_time, "%H:%M").time()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date or time format. Use YYYY-MM-DD and HH:MM.")

    new_appointment = AppointmentDB(
        patient_id=req.patient_id,
        doctor_id=req.doctor_id,
        appointment_date=app_date,
        appointment_time=app_time,
        status="pending"
    )
    db.add(new_appointment)
    db.commit()
    return {"message": "Appointment request submitted successfully", "appointment_id": new_appointment.id}

# 5. Fetch Doctor's Appointment Requests
@app.get("/api/doctor/{doctor_uid}/appointments", response_model=List[AppointmentResponse])
def get_doctor_appointments(doctor_uid: str, db: Session = Depends(get_db)):
    # Query appointments joining users to fetch doctor and patient names/emails
    results = db.query(AppointmentDB).filter(AppointmentDB.doctor_id == doctor_uid).all()
    
    appointments_list = []
    for appt in results:
        patient = db.query(UserDB).filter(UserDB.uid == appt.patient_id).first()
        doctor = db.query(UserDB).filter(UserDB.uid == appt.doctor_id).first()
        
        if patient and doctor:
            appointments_list.append(AppointmentResponse(
                id=appt.id,
                patient_id=appt.patient_id,
                patient_name=patient.full_name,
                patient_email=patient.email,
                doctor_id=appt.doctor_id,
                doctor_name=doctor.full_name,
                appointment_date=appt.appointment_date,
                appointment_time=appt.appointment_time,
                status=appt.status
            ))
            
    return appointments_list

# 6. Accept / Decline Appointment
@app.put("/api/appointment/{appointment_id}/status")
def update_appointment_status(appointment_id: int, status: str, db: Session = Depends(get_db)):
    if status not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'accepted' or 'rejected'")
        
    appt = db.query(AppointmentDB).filter(AppointmentDB.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    appt.status = status
    db.commit()
    return {"message": f"Appointment status updated to {status}"}
