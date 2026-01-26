from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    DOCTOR = "doctor"
    PATIENT = "patient"
    ADMIN = "admin"


class TriageLevel(str, enum.Enum):
    SELF_CARE = "self_care"
    SEE_GP = "see_gp"
    URGENT = "urgent"
    EMERGENCY = "emergency"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(SQLEnum(UserRole), default=UserRole.PATIENT)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Medical Professional Info (for doctors)
    medical_license_number = Column(String, unique=True, nullable=True)
    specialization = Column(String, nullable=True)
    hospital_affiliation = Column(String, nullable=True)
    
    # ABDM Integration
    abdm_health_id = Column(String, unique=True, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    consultations = relationship("Consultation", back_populates="doctor", foreign_keys="Consultation.doctor_id")
    patient_consultations = relationship("Consultation", back_populates="patient", foreign_keys="Consultation.patient_id")
    medical_reports = relationship("MedicalReport", back_populates="patient")


class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Demographics
    date_of_birth = Column(DateTime)
    gender = Column(String)
    blood_group = Column(String)
    height = Column(Integer)  # in cm
    weight = Column(Integer)  # in kg
    
    # Contact
    phone = Column(String)
    emergency_contact = Column(String)
    address = Column(Text)
    
    # Medical History
    allergies = Column(JSON)  # List of allergies
    chronic_conditions = Column(JSON)  # List of conditions
    current_medications = Column(JSON)  # List of medications
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Consultation(Base):
    __tablename__ = "consultations"
    
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"))
    patient_id = Column(Integer, ForeignKey("users.id"))
    
    # Consultation Details
    chief_complaint = Column(Text)
    symptoms = Column(JSON)  # List of symptoms with metadata
    medical_history_summary = Column(Text)
    
    # AI Assistance
    ai_suggested_diagnoses = Column(JSON)  # List of differential diagnoses
    ai_triage_level = Column(SQLEnum(TriageLevel))
    ai_red_flags = Column(JSON)  # List of emergency symptoms detected
    ai_recommended_tests = Column(JSON)  # List of suggested tests
    
    # Doctor's Assessment
    diagnosis = Column(Text)
    treatment_plan = Column(Text)
    prescription = Column(JSON)  # Structured prescription data
    follow_up_date = Column(DateTime)
    
    # Status
    status = Column(String, default="pending")  # pending, in_progress, completed
    consultation_date = Column(DateTime(timezone=True), server_default=func.now())
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    doctor = relationship("User", back_populates="consultations", foreign_keys=[doctor_id])
    patient = relationship("User", back_populates="patient_consultations", foreign_keys=[patient_id])
    reports = relationship("MedicalReport", back_populates="consultation")


class MedicalReport(Base):
    __tablename__ = "medical_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"))
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=True)
    
    # Report Details
    report_type = Column(String)  # lab, radiology, pathology, etc.
    report_name = Column(String)
    report_date = Column(DateTime)
    
    # File Storage
    file_path = Column(String)
    file_type = Column(String)  # pdf, image, etc.
    file_hash = Column(String, index=True)  # MD5 hash for duplicate detection
    
    # AI Processing
    extracted_text = Column(Text)
    ai_summary = Column(Text)
    ai_key_findings = Column(JSON)
    ai_abnormal_values = Column(JSON)
    
    # Parsed Report Data (Structured)
    parsed_data = Column(JSON)  # Structured data: patient_info, cbc_hemogram, urine_re, infection_screens, liver_function, inflammation_marker, key_highlights
    
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    patient = relationship("User", back_populates="medical_reports")
    consultation = relationship("Consultation", back_populates="reports")


class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Source Information
    source_type = Column(String)  # guideline, research, clinical_trial
    source_name = Column(String)
    source_url = Column(String, nullable=True)
    
    # Content
    title = Column(String)
    content = Column(Text)
    section = Column(String, nullable=True)
    
    # Metadata
    icd_codes = Column(JSON)  # Related ICD-10 codes
    medical_terms = Column(JSON)  # Extracted medical entities
    
    # Embedding
    embedding_id = Column(String, unique=True)  # Reference to vector DB
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"))
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=True)
    
    # Task Details
    task_type = Column(String)  # follow_up, prescription_refill, test_review
    title = Column(String)
    description = Column(Text)
    priority = Column(String, default="medium")  # low, medium, high
    
    # Status
    status = Column(String, default="pending")  # pending, in_progress, completed
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # AI Generated
    ai_generated = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    action = Column(String)  # view_report, create_prescription, access_phi
    resource_type = Column(String)  # consultation, report, patient
    resource_id = Column(Integer)
    
    ip_address = Column(String)
    user_agent = Column(String)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())