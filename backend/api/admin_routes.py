from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_active_user
from models import User, Consultation, AuditLog, UserRole
from typing import List, Dict, Any
import logging

router = APIRouter(prefix="/api/admin", tags=["Admin"])
logger = logging.getLogger(__name__)

async def get_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/stats")
async def get_system_stats(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_doctors = db.query(User).filter(User.role == UserRole.DOCTOR).count()
    total_patients = db.query(User).filter(User.role == UserRole.PATIENT).count()
    total_consultations = db.query(Consultation).count()
    
    return {
        "total_users": total_users,
        "total_doctors": total_doctors,
        "total_patients": total_patients,
        "total_consultations": total_consultations
    }

@router.get("/users")
async def list_users(
    skip: int = 0,
    limit: int = 50,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/audit-logs")
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    return logs