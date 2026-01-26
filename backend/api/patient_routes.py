from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_active_user
from models import User, Patient, Consultation
from schemas import PatientCreate, PatientResponse, ConsultationResponse
import logging

router = APIRouter(prefix="/api/patient", tags=["Patient"])
logger = logging.getLogger(__name__)

@router.post("/profile", response_model=PatientResponse)
async def create_patient_profile(
    patient_data: PatientCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    existing_patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if existing_patient:
        raise HTTPException(status_code=400, detail="Patient profile already exists")
    
    patient = Patient(
        user_id=current_user.id,
        date_of_birth=patient_data.date_of_birth,
        gender=patient_data.gender,
        blood_group=patient_data.blood_group,
        phone=patient_data.phone,
        allergies=patient_data.allergies,
        chronic_conditions=patient_data.chronic_conditions
    )
    
    db.add(patient)
    db.commit()
    db.refresh(patient)
    
    return patient

@router.get("/profile", response_model=PatientResponse)
async def get_patient_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    return patient

@router.get("/consultations", response_model=List[ConsultationResponse])
async def get_my_consultations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    consultations = db.query(Consultation).filter(
        Consultation.patient_id == current_user.id
    ).order_by(Consultation.consultation_date.desc()).all()
    
    return consultations

@router.get("/consultations/{consultation_id}", response_model=ConsultationResponse)
async def get_consultation_detail(
    consultation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id,
        Consultation.patient_id == current_user.id
    ).first()
    
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    return consultation