from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from models import UserRole, TriageLevel


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.PATIENT


class UserCreate(UserBase):
    password: str
    medical_license_number: Optional[str] = None
    specialization: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# Patient Schemas
class PatientCreate(BaseModel):
    date_of_birth: datetime
    gender: str
    blood_group: Optional[str] = None
    phone: str
    allergies: Optional[List[str]] = []
    chronic_conditions: Optional[List[str]] = []


class PatientResponse(BaseModel):
    id: int
    date_of_birth: datetime
    gender: str
    blood_group: Optional[str]
    allergies: List[str]
    chronic_conditions: List[str]
    current_medications: List[Dict[str, Any]]
    
    class Config:
        from_attributes = True


# Consultation Schemas
class SymptomInput(BaseModel):
    name: str
    duration: Optional[str] = None
    severity: Optional[str] = None  # mild, moderate, severe
    description: Optional[str] = None


class ConsultationCreate(BaseModel):
    patient_id: int
    chief_complaint: str
    symptoms: List[SymptomInput]


class DifferentialDiagnosis(BaseModel):
    condition: str
    icd_code: Optional[str]
    probability: float
    reasoning: str
    recommended_tests: List[str]


class AIAssessment(BaseModel):
    triage_level: TriageLevel
    red_flags: List[str]
    differential_diagnoses: List[DifferentialDiagnosis]
    recommended_tests: List[str]
    similar_cases: List[Dict[str, Any]]
    knowledge_references: List[Dict[str, Any]]


class ConsultationResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    chief_complaint: str
    symptoms: List[Dict[str, Any]]
    ai_assessment: Optional[AIAssessment] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    status: str
    consultation_date: datetime
    medicine_suggestions: Optional[List[Dict[str, Any]]] = None
    
    class Config:
        from_attributes = True


# Report Schemas
class ReportUpload(BaseModel):
    report_type: str
    report_name: str
    report_date: datetime


class ReportSummary(BaseModel):
    summary: str
    key_findings: List[str]
    abnormal_values: List[Dict[str, Any]]
    recommendations: List[str]


class ReportResponse(BaseModel):
    id: int
    report_type: str
    report_name: str
    report_date: datetime
    ai_summary: Optional[str]
    ai_key_findings: Optional[List[str]]
    parsed_data: Optional[Dict[str, Any]] = None
    uploaded_at: datetime
    
    class Config:
        from_attributes = True


# Prescription Schema
class MedicationItem(BaseModel):
    medicine_name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None
    route: Optional[str] = "oral"


class PrescriptionCreate(BaseModel):
    consultation_id: int
    medications: List[MedicationItem]
    general_instructions: Optional[str] = None


class PrescriptionResponse(BaseModel):
    id: int
    consultation_id: int
    medications: List[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Medical Information Query
class MedicalQuery(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None


class ChatQuery(BaseModel):
    query: str
    mode: Optional[str] = None  # 'medical_report' or 'medical_knowledge'
    last_patient_id: Optional[int] = None  # Context: last patient discussed
    last_patient_name: Optional[str] = None  # Context: last patient name discussed


class MedicalInfoResponse(BaseModel):
    answer: str
    sources: List[Dict[str, str]]
    confidence: float
    related_topics: List[str]


# Task Schemas
class TaskCreate(BaseModel):
    consultation_id: Optional[int] = None
    patient_id: Optional[int] = None
    task_type: str
    title: str
    description: str
    priority: str = "medium"
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: int
    task_type: str
    title: str
    description: str
    priority: str
    status: str
    due_date: Optional[datetime]
    ai_generated: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class DuplicateUploadConfirm(BaseModel):
    file_hash: str
    filename: str
    patient_id: Optional[int] = None
    report_type: str = "lab"
    report_name: Optional[str] = None