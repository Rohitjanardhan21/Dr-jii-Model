from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import logging
from pathlib import Path
from database import engine, Base
from config import get_settings
from api import doctor_routes, patient_routes, admin_routes
from api.auth_routes import router as auth_router

settings = get_settings()
logging.basicConfig(level=logging.INFO)

Base.metadata.create_all(bind=engine)

# Get absolute path to frontend build directories
import os
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_BUILD_PATH = BASE_DIR / "frontend" / "dist"
EXPERT_BUILD_PATH = BASE_DIR / "frontend-expert" / "build"

# Log paths for debugging
print(f"BASE_DIR: {BASE_DIR}")
print(f"FRONTEND_BUILD_PATH: {FRONTEND_BUILD_PATH}")
print(f"FRONTEND_BUILD_PATH exists: {FRONTEND_BUILD_PATH.exists()}")
print(f"EXPERT_BUILD_PATH: {EXPERT_BUILD_PATH}")
print(f"EXPERT_BUILD_PATH exists: {EXPERT_BUILD_PATH.exists()}")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI-powered Doctor Assistant Platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(doctor_routes.router)
app.include_router(patient_routes.router)
app.include_router(admin_routes.router)

# Expert Frontend Authentication Endpoints
from fastapi import Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from database import get_db
from models import User, Patient, UserRole
from auth import verify_password, create_access_token
from datetime import timedelta

@app.post("/doctor/doctorLogin")
async def expert_doctor_login(request: Request, response: Response, db: Session = Depends(get_db)):
    """Expert frontend login endpoint"""
    try:
        data = await request.json()
        
        # Extract credentials
        email = data.get("email")
        mobile = data.get("mobileNumber")
        doctor_id = data.get("doctorId")
        password = data.get("password")
        role = data.get("role", "expert")
        
        # Find user by email, username, or id
        user = None
        if email:
            # Check if it's an email or username
            if "@" in email:
                user = db.query(User).filter(User.email == email).first()
            else:
                user = db.query(User).filter(User.username == email).first()
        elif mobile:
            # Try to find by username (since we don't have phone field)
            user = db.query(User).filter(User.username == mobile).first()
        elif doctor_id:
            try:
                user = db.query(User).filter(User.id == int(doctor_id)).first()
            except ValueError:
                user = db.query(User).filter(User.username == doctor_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Accept any password for testing/development
        # In production, uncomment the password verification below:
        # if not verify_password(password, user.hashed_password):
        #     raise HTTPException(
        #         status_code=status.HTTP_401_UNAUTHORIZED,
        #         detail="Invalid password"
        #     )
        
        # For now, accept any password
        if not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is required"
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id},
            expires_delta=timedelta(days=30)
        )
        
        # Set cookie
        response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            max_age=30*24*60*60,  # 30 days
            samesite="lax"
        )
        
        return {
            "success": True,
            "statusCode": 200,
            "message": "Login successful",
            "data": {
                "_id": str(user.id),
                "fullName": user.full_name or user.username,
                "emailId": user.email,
                "mobileNumber": user.username,  # Use username as mobile fallback
                "role": user.role,
                "docRefId": str(user.id),
                "token": access_token,
                "specialization": user.specialization,
                "hospital": user.hospital_affiliation
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/doctor/doctorLoginGet")
async def expert_get_doctor_data(request: Request, db: Session = Depends(get_db)):
    """Get authenticated doctor data - returns success:false if not logged in"""
    try:
        # Get token from cookie or header
        token = request.cookies.get("access_token")
        if token and token.startswith("Bearer "):
            token = token[7:]
        
        if not token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header[7:]
        
        # If no token, return success:false (not an error, just not logged in)
        if not token:
            return {
                "success": False,
                "message": "Not authenticated"
            }
        
        # Verify token and get user
        from jose import jwt, JWTError
        from config import get_settings
        settings = get_settings()
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("user_id")
            
            if not user_id:
                return {"success": False, "message": "Invalid token"}
            
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"success": False, "message": "User not found"}
            
            return {
                "success": True,
                "data": {
                    "_id": str(user.id),
                    "fullName": user.full_name or user.username,
                    "emailId": user.email,
                    "mobileNumber": user.username,  # Use username as mobile fallback
                    "role": user.role,
                    "docRefId": str(user.id),
                    "specialization": user.specialization,
                    "hospital": user.hospital_affiliation,
                    "personalDetails": {
                        "fullName": user.full_name or user.username,
                        "emailId": user.email,
                        "mobileNumber": user.username
                    },
                    "addressPerKyc": {
                        "address": "",
                        "pincode": "",
                        "state": "",
                        "district": "",
                        "country": ""
                    }
                }
            }
        except JWTError as e:
            print(f"JWT Error: {e}")
            return {"success": False, "message": "Invalid token"}
            
    except Exception as e:
        print(f"Get doctor data error: {e}")
        # Return success:false instead of raising error
        return {"success": False, "message": "Authentication check failed"}

@app.put("/doctor/logout")
async def expert_doctor_logout(response: Response):
    """Logout endpoint"""
    response.delete_cookie("access_token")
    return {
        "success": True,
        "message": "Logged out successfully"
    }

@app.post("/doctor/send-otp")
async def expert_send_otp(request: Request):
    """Send OTP for login"""
    return {
        "success": False,
        "message": "OTP login not implemented yet. Please use password login."
    }

@app.post("/doctor/forgetPassword")
async def expert_forgot_password(request: Request):
    """Forgot password endpoint"""
    return {
        "success": False,
        "message": "Password reset not implemented yet. Please contact support."
    }

# Dashboard API endpoints
@app.get("/doctor/unique/patients")
async def get_unique_patients(db: Session = Depends(get_db)):
    """Get unique patient count"""
    from models import User
    patient_count = db.query(User).filter(User.role == 'patient').count()
    return {
        "success": True,
        "data": patient_count
    }

@app.get("/doctor/appointments")
async def get_appointments(start: str = None, end: str = None, db: Session = Depends(get_db)):
    """Get appointments for date range - returns array directly"""
    from models import Consultation
    appointments = db.query(Consultation).limit(10).all()
    # Return array directly
    return [
        {
            "id": apt.id,
            "patientName": f"Patient {apt.patient_id}",
            "date": apt.created_at.isoformat() if apt.created_at else None,
            "status": "scheduled"
        } for apt in appointments
    ]

@app.get("/doctor/stats/yearly")
async def get_yearly_stats(db: Session = Depends(get_db)):
    """Get yearly statistics - returns monthly data for the year"""
    from models import User, Consultation, MedicalReport
    
    total_patients = db.query(User).filter(User.role == 'patient').count()
    total_consultations = db.query(Consultation).count()
    total_reports = db.query(MedicalReport).count()
    
    # Return monthly stats array (12 months)
    # Distribute the totals across months for visualization
    monthly_stats = []
    for month in range(1, 13):
        monthly_stats.append({
            "month": month,
            "uniquePatientCount": total_patients // 12 + (month % 3),  # Distribute patients
            "appointmentCount": total_consultations // 12 + (month % 2),  # Distribute appointments
            "totalEarnings": 0,  # Earnings disabled
            "prescriptionCount": 50 + (month * 5)  # Mock prescription data
        })
    
    return monthly_stats

@app.get("/doctor/payments")
async def get_payments(db: Session = Depends(get_db)):
    """Get payment records"""
    from models import User
    from datetime import datetime
    
    # Get some sample patients for mock payments
    patients = db.query(User).filter(User.role == 'patient').limit(10).all()
    
    # Create mock payment data
    payments = []
    for i, patient in enumerate(patients):
        payments.append({
            "_id": f"payment_{i+1}",
            "patient": {
                "userImage": "/expert/images/user1.png",
                "fullName": patient.full_name or patient.username,
                "contactDetails": {
                    "primaryContact": patient.username
                }
            },
            "date": datetime.now().strftime("%Y-%m-%d"),
            "status": ["Approved", "Pending", "Cancelled"][i % 3],
            "amount": 500 + (i * 100),
            "method": ["Cash", "Card", "UPI", "Insurance"][i % 4]
        })
    
    return {
        "success": True,
        "data": payments
    }

@app.get("/doctor/patients")
async def get_doctor_patients(db: Session = Depends(get_db)):
    """Get all patients - returns array directly"""
    from models import User
    from datetime import datetime
    patients = db.query(User).filter(User.role == 'patient').limit(50).all()
    # Return array directly with fields matching frontend expectations
    return [
        {
            "_id": str(p.id),
            "title": p.full_name or p.username,  # Frontend expects 'title' not 'fullName'
            "fullName": p.full_name or p.username,  # Keep for compatibility
            "email": p.email,
            "phone": p.username,
            "image": "/expert/images/user1.png",  # Default avatar
            "date": p.created_at.strftime("%Y-%m-%d") if p.created_at else datetime.now().strftime("%Y-%m-%d"),
            "gender": "Male",  # Default, can be updated when we add gender field
            "blood": "O+",  # Default blood type
            "age": 30,  # Default age
            "abdmHealthId": p.abdm_health_id
        } for p in patients
    ]

@app.get("/doctor/patients/stats")
async def get_patients_stats(db: Session = Depends(get_db)):
    """Get patient statistics"""
    from models import User
    total = db.query(User).filter(User.role == 'patient').count()
    return {
        "success": True,
        "data": {
            "total": total,
            "active": total,
            "inactive": 0
        }
    }

@app.get("/doctor/patients/filter")
async def filter_patients(db: Session = Depends(get_db)):
    """Filter patients - returns array directly"""
    from models import User
    from datetime import datetime
    patients = db.query(User).filter(User.role == 'patient').limit(50).all()
    # Return array directly with fields matching frontend expectations
    return [
        {
            "_id": str(p.id),
            "title": p.full_name or p.username,  # Frontend expects 'title' not 'fullName'
            "fullName": p.full_name or p.username,  # Keep for compatibility
            "email": p.email,
            "phone": p.username,
            "image": "/expert/images/user1.png",  # Default avatar
            "date": p.created_at.strftime("%Y-%m-%d") if p.created_at else datetime.now().strftime("%Y-%m-%d"),
            "gender": "Male",  # Default, can be updated when we add gender field
            "blood": "O+",  # Default blood type
            "age": 30,  # Default age
            "abdmHealthId": p.abdm_health_id
        } for p in patients
    ]

@app.post("/doctor/patients/create")
async def create_patient(request: Request, db: Session = Depends(get_db)):
    """Create a new patient"""
    try:
        data = await request.json()
        
        # Log the incoming data for debugging
        print(f"[DEBUG] Create patient request data: {data}")
        
        # Extract patient data
        full_name = data.get("fullName")
        email = data.get("email")
        mobile = data.get("mobileNumner") or data.get("contactDetails", {}).get("primaryContact")
        uhid = data.get("uhid")
        aadhar_id = data.get("aadharId")
        date_of_birth = data.get("dateOfBirth")
        gender = data.get("gender")
        blood_group = data.get("bloodGroup")
        age = data.get("age")
        
        print(f"[DEBUG] Extracted - fullName: {full_name}, mobile: {mobile}, email: {email}")
        
        # Validate required fields
        if not full_name:
            print("[DEBUG] Validation failed: Full name is required")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full name is required"
            )
        
        if not mobile:
            print("[DEBUG] Validation failed: Contact number is required")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Contact number is required"
            )
        
        # Check if patient already exists by email or mobile
        existing_user = None
        if email:
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                print(f"[DEBUG] Patient exists with email: {email}")
        if not existing_user and mobile:
            existing_user = db.query(User).filter(User.username == mobile).first()
            if existing_user:
                print(f"[DEBUG] Patient exists with mobile: {mobile}")
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Patient with this email or mobile number already exists"
            )
        
        # Create user account for patient
        from auth import get_password_hash
        import secrets
        
        # Generate a random password for the patient
        temp_password = secrets.token_urlsafe(12)
        
        print(f"[DEBUG] Creating user with email: {email or f'{mobile}@temp.com'}, username: {mobile}")
        
        new_user = User(
            email=email or f"{mobile}@temp.com",  # Use temp email if not provided
            username=mobile,
            hashed_password=get_password_hash(temp_password),
            full_name=full_name,
            role=UserRole.PATIENT,
            abdm_health_id=uhid or aadhar_id,
            is_active=True,
            is_verified=False
        )
        
        db.add(new_user)
        db.flush()  # Get the user ID
        
        print(f"[DEBUG] User created with ID: {new_user.id}")
        
        # Create patient profile with additional details
        from datetime import datetime as dt
        
        # Parse date of birth
        dob = None
        if date_of_birth:
            try:
                if isinstance(date_of_birth, str):
                    dob = dt.fromisoformat(date_of_birth.replace('Z', '+00:00'))
                else:
                    dob = date_of_birth
                print(f"[DEBUG] Parsed DOB: {dob}")
            except Exception as e:
                print(f"[DEBUG] Failed to parse DOB: {e}")
        
        new_patient = Patient(
            user_id=new_user.id,
            date_of_birth=dob,
            gender=gender,
            blood_group=blood_group,
            phone=mobile,
            emergency_contact=data.get("contactDetails", {}).get("secondaryContact"),
            address=str(data.get("address", {})) if data.get("address") else None,
            allergies=data.get("patientMedicalHistory", []),
            chronic_conditions=[],
            current_medications=[]
        )
        
        db.add(new_patient)
        db.commit()
        db.refresh(new_user)
        
        print(f"[DEBUG] Patient profile created successfully")
        
        return {
            "success": True,
            "message": "Patient created successfully!",
            "data": {
                "_id": str(new_user.id),
                "title": new_user.full_name,
                "fullName": new_user.full_name,
                "email": new_user.email,
                "phone": mobile,
                "image": "/expert/images/user1.png",
                "date": new_user.created_at.strftime("%Y-%m-%d") if new_user.created_at else dt.now().strftime("%Y-%m-%d"),
                "gender": gender or "Male",
                "blood": blood_group or "O+",
                "age": age or 30,
                "abdmHealthId": new_user.abdm_health_id,
                "uhid": uhid
            }
        }
        
    except HTTPException as he:
        print(f"[DEBUG] HTTPException: {he.detail}")
        raise he
    except Exception as e:
        print(f"[DEBUG] Create patient error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create patient: {str(e)}"
        )

@app.get("/doctor/patient/{patient_id}")
async def get_patient_details(patient_id: int, db: Session = Depends(get_db)):
    """Get detailed patient information"""
    try:
        from datetime import datetime
        
        # Get user
        user = db.query(User).filter(User.id == patient_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        # Get patient profile
        patient = db.query(Patient).filter(Patient.user_id == patient_id).first()
        
        # Calculate age from date of birth
        age = 30  # Default
        if patient and patient.date_of_birth:
            today = datetime.now()
            age = today.year - patient.date_of_birth.year
            if today.month < patient.date_of_birth.month or (today.month == patient.date_of_birth.month and today.day < patient.date_of_birth.day):
                age -= 1
        
        return {
            "_id": str(user.id),
            "fullName": user.full_name or user.username,
            "email": user.email,
            "phone": patient.phone if patient else user.username,
            "image": "/expert/images/user1.png",
            "dateOfBirth": patient.date_of_birth.isoformat() if patient and patient.date_of_birth else None,
            "gender": patient.gender if patient else "Male",
            "bloodGroup": patient.blood_group if patient else "O+",
            "age": age,
            "abdmHealthId": user.abdm_health_id,
            "uhid": user.abdm_health_id,
            "aadharId": user.abdm_health_id,
            "address": patient.address if patient else "",
            "emergencyContact": patient.emergency_contact if patient else "",
            "allergies": patient.allergies if patient else [],
            "chronicConditions": patient.chronic_conditions if patient else [],
            "currentMedications": patient.current_medications if patient else [],
            "createdAt": user.created_at.isoformat() if user.created_at else None
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Get patient error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.delete("/doctor/patient/{patient_id}")
async def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    """Delete a patient"""
    try:
        # Get user
        user = db.query(User).filter(User.id == patient_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        # Delete patient profile first (foreign key constraint)
        patient = db.query(Patient).filter(Patient.user_id == patient_id).first()
        if patient:
            db.delete(patient)
        
        # Delete user
        db.delete(user)
        db.commit()
        
        return {
            "success": True,
            "message": "Patient deleted successfully"
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Delete patient error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/doctor/medical-records/{patient_id}")
async def get_patient_medical_records(patient_id: int, db: Session = Depends(get_db)):
    """Get medical records for a patient"""
    try:
        from models import MedicalReport
        
        records = db.query(MedicalReport).filter(MedicalReport.patient_id == patient_id).order_by(MedicalReport.report_date.desc()).all()
        
        return {
            "success": True,
            "data": [
                {
                    "_id": str(r.id),
                    "reportType": r.report_type,
                    "reportName": r.report_name,
                    "reportDate": r.report_date.isoformat() if r.report_date else None,
                    "filePath": r.file_path,
                    "fileType": r.file_type,
                    "summary": r.ai_summary,
                    "keyFindings": r.ai_key_findings,
                    "uploadedAt": r.uploaded_at.isoformat() if r.uploaded_at else None
                } for r in records
            ]
        }
    except Exception as e:
        print(f"Get medical records error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/doctor/getDoctorProfile/{doctor_id}")
async def get_doctor_profile(doctor_id: int, db: Session = Depends(get_db)):
    """Get doctor profile"""
    try:
        user = db.query(User).filter(User.id == doctor_id, User.role == UserRole.DOCTOR).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )
        
        return {
            "success": True,
            "data": {
                "_id": str(user.id),
                "fullName": user.full_name or user.username,
                "email": user.email,
                "specialization": user.specialization,
                "hospital": user.hospital_affiliation,
                "licenseNumber": user.medical_license_number,
                "role": user.role
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Get doctor profile error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/doctor/services")
async def get_services():
    """Get medical services"""
    return {
        "success": True,
        "data": [
            {"id": 1, "name": "Consultation", "price": 500, "status": True},
            {"id": 2, "name": "Blood Test", "price": 1000, "status": True},
            {"id": 3, "name": "X-Ray", "price": 1500, "status": True},
            {"id": 4, "name": "ECG", "price": 800, "status": True},
            {"id": 5, "name": "Ultrasound", "price": 2000, "status": True},
        ]
    }

@app.get("/facility/getAll/facilityProfile")
async def get_facilities():
    """Get facility profiles"""
    return {
        "success": True,
        "data": []
    }

@app.get("/doctor/medical-orders")
async def get_medical_orders():
    """Get medical orders"""
    return {
        "success": True,
        "data": []
    }

@app.get("/doctor/payment-summary")
async def get_payment_summary(db: Session = Depends(get_db)):
    """Get payment summary"""
    # Mock payment summary data
    return {
        "success": True,
        "todayTotal": 5000,
        "monthTotal": 150000,
        "yearTotal": 1800000,
        "data": {
            "total": 1800000,
            "paid": 1500000,
            "pending": 200000,
            "cancelled": 100000
        }
    }

# Catch-all for other doctor endpoints
@app.get("/doctor/{path:path}")
async def expert_doctor_endpoints(path: str):
    """Catch-all for expert frontend doctor endpoints"""
    return {
        "success": False,
        "message": f"Endpoint /doctor/{path} not implemented yet.",
        "redirect": "/frontend/"
    }

@app.post("/doctor/{path:path}")
async def expert_doctor_endpoints_post(path: str):
    """Catch-all for expert frontend doctor POST endpoints"""
    return {
        "success": False,
        "message": f"Endpoint /doctor/{path} not implemented yet.",
        "redirect": "/frontend/"
    }

@app.get("/")
async def root():
    # Redirect to expert dashboard as primary frontend
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/expert/")

@app.get("/expert")
async def expert_dashboard_redirect():
    """Redirect /expert to /expert/ with trailing slash"""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/expert/")

@app.get("/expert/")
async def expert_dashboard_root():
    """Serve expert dashboard root"""
    print(f"[DEBUG] /expert/ route hit")
    print(f"[DEBUG] EXPERT_BUILD_PATH: {EXPERT_BUILD_PATH}")
    print(f"[DEBUG] EXPERT_BUILD_PATH.exists(): {EXPERT_BUILD_PATH.exists()}")
    
    if EXPERT_BUILD_PATH.exists():
        index_file = EXPERT_BUILD_PATH / "index.html"
        print(f"[DEBUG] index_file: {index_file}")
        print(f"[DEBUG] index_file.exists(): {index_file.exists()}")
        
        if index_file.exists():
            print(f"[DEBUG] Serving index.html from {index_file}")
            return FileResponse(index_file)
        else:
            print(f"[DEBUG] index.html NOT FOUND at {index_file}")
            # List directory contents
            try:
                contents = list(EXPERT_BUILD_PATH.iterdir())
                print(f"[DEBUG] Directory contents: {[str(p.name) for p in contents]}")
            except Exception as e:
                print(f"[DEBUG] Error listing directory: {e}")
    else:
        print(f"[DEBUG] EXPERT_BUILD_PATH does NOT exist")
        # Try to list parent directory
        try:
            parent = EXPERT_BUILD_PATH.parent
            print(f"[DEBUG] Parent directory: {parent}")
            print(f"[DEBUG] Parent exists: {parent.exists()}")
            if parent.exists():
                contents = list(parent.iterdir())
                print(f"[DEBUG] Parent contents: {[str(p.name) for p in contents]}")
        except Exception as e:
            print(f"[DEBUG] Error checking parent: {e}")
    
    return {"error": "Expert dashboard not found", "path": str(EXPERT_BUILD_PATH), "exists": EXPERT_BUILD_PATH.exists()}

@app.get("/api")
async def api_root():
    return {
        "message": "Dr. Jii API is running",
        "version": settings.VERSION,
        "docs": "/docs",
        "chat_frontend": "/frontend/",
        "expert_dashboard": "/expert/"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Dr. Jii API"}

@app.get("/debug/paths")
async def debug_paths():
    """Debug endpoint to check file paths on Render"""
    import os
    return {
        "BASE_DIR": str(BASE_DIR),
        "BASE_DIR_exists": BASE_DIR.exists(),
        "FRONTEND_BUILD_PATH": str(FRONTEND_BUILD_PATH),
        "FRONTEND_BUILD_PATH_exists": FRONTEND_BUILD_PATH.exists(),
        "EXPERT_BUILD_PATH": str(EXPERT_BUILD_PATH),
        "EXPERT_BUILD_PATH_exists": EXPERT_BUILD_PATH.exists(),
        "expert_index_exists": (EXPERT_BUILD_PATH / "index.html").exists(),
        "frontend_index_exists": (FRONTEND_BUILD_PATH / "index.html").exists(),
        "cwd": os.getcwd(),
        "BASE_DIR_contents": [str(p.name) for p in BASE_DIR.iterdir()] if BASE_DIR.exists() else [],
        "EXPERT_BUILD_contents": [str(p.name) for p in EXPERT_BUILD_PATH.iterdir()] if EXPERT_BUILD_PATH.exists() else []
    }

# Serve React frontend
if FRONTEND_BUILD_PATH.exists():
    # Production: serve built React app
    app.mount("/frontend", StaticFiles(directory=str(FRONTEND_BUILD_PATH), html=True), name="frontend")
    
    # Serve assets directly
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_BUILD_PATH / "assets")), name="assets")
    
    @app.get("/frontend/{path:path}")
    async def serve_react_app(path: str):
        file_path = FRONTEND_BUILD_PATH / path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        # For React Router, return index.html for unknown routes
        return FileResponse(FRONTEND_BUILD_PATH / "index.html")
else:
    # Development: serve message about building frontend
    @app.get("/frontend/")
    async def frontend_build_required():
        return {
            "message": "Frontend build not found. Please run 'npm run build' in the frontend directory.",
            "build_path": str(FRONTEND_BUILD_PATH),
            "instructions": [
                "cd frontend",
                "npm install",
                "npm run build"
            ]
        }

# Serve Expert Dashboard Frontend at /expert/
if EXPERT_BUILD_PATH.exists():
    # Serve static files FIRST (before catch-all)
    expert_static_path = EXPERT_BUILD_PATH / "static"
    if expert_static_path.exists():
        app.mount("/expert/static", StaticFiles(directory=str(expert_static_path)), name="expert-static")
    
    # Serve images directory
    expert_images_path = EXPERT_BUILD_PATH / "images"
    if expert_images_path.exists():
        app.mount("/expert/images", StaticFiles(directory=str(expert_images_path)), name="expert-images")
    
    # Serve manifest.json and other root files
    @app.get("/expert/manifest.json")
    async def serve_manifest():
        manifest_path = EXPERT_BUILD_PATH / "manifest.json"
        if manifest_path.exists():
            return FileResponse(manifest_path)
        return {"error": "manifest.json not found"}
    
    @app.get("/expert/avijoexpert.png")
    async def serve_logo():
        logo_path = EXPERT_BUILD_PATH / "avijoexpert.png"
        if logo_path.exists():
            return FileResponse(logo_path)
        return {"error": "logo not found"}
    
    @app.get("/expert/favicon.png")
    async def serve_favicon():
        favicon_path = EXPERT_BUILD_PATH / "favicon.png"
        if favicon_path.exists():
            return FileResponse(favicon_path)
        return {"error": "favicon not found"}
    
    # Catch-all for expert frontend routes (React Router) - MUST BE LAST
    @app.get("/expert/{full_path:path}")
    async def serve_expert_spa(full_path: str):
        """Catch-all route to serve React SPA for client-side routing"""
        # Always return index.html for React Router to handle
        index_file = EXPERT_BUILD_PATH / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"error": "Expert dashboard not found", "path": str(EXPERT_BUILD_PATH)}
else:
    # Development: serve message about building expert frontend
    @app.get("/expert/")
    async def expert_build_required():
        return {
            "message": "Expert Dashboard build not found. Please run 'npm run build' in the frontend-expert directory.",
            "build_path": str(EXPERT_BUILD_PATH),
            "instructions": [
                "cd frontend-expert",
                "npm install",
                "npm run build"
            ]
        }

if __name__ == "__main__":
    import uvicorn
    print(f"\n🚀 Starting Dr. Jii Medical Assistant on http://localhost:{settings.PORT}")
    print(f"🏠 Landing Page: http://localhost:{settings.PORT}/")
    print(f"👨‍⚕️ Expert Dashboard: http://localhost:{settings.PORT}/expert/")
    print(f"💬 Chat Frontend: http://localhost:{settings.PORT}/frontend/")
    print(f"📚 API Docs: http://localhost:{settings.PORT}/docs\n")
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)