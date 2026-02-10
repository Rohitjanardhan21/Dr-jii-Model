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
FRONTEND_BUILD_PATH = Path(__file__).parent.parent / "frontend" / "dist"
EXPERT_BUILD_PATH = Path(__file__).parent.parent / "frontend-expert" / "build"

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
from models import User
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
    if EXPERT_BUILD_PATH.exists():
        index_file = EXPERT_BUILD_PATH / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
    return {"error": "Expert dashboard not found"}

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
        return {"error": "Expert dashboard not found"}
else:
    # Development: serve message about building expert frontend
    @app.get("/")
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