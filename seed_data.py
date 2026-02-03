import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from datetime import datetime, timedelta
import random

# Import after path is set
from database import SessionLocal, engine, Base
from models import User, Patient, Consultation, MedicalReport, Task, AuditLog, UserRole, TriageLevel
from auth import get_password_hash

# Clear any existing table definitions
Base.metadata.clear()

# Create all tables fresh
Base.metadata.create_all(bind=engine)

db = SessionLocal()

print("🌱 Seeding database with test data...")

try:
    # Create all tables first
    Base.metadata.create_all(bind=engine)
    
    # Check if data already exists
    try:
        existing_doctor = db.query(User).filter(User.username == "suryanshDr").first()
        if existing_doctor:
            print("⚠️  Data already exists. Clearing and re-seeding...")
            # Drop all tables and recreate
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
    except Exception:
        # Tables don't exist yet, that's fine
        print("📋 Creating fresh database...")
        Base.metadata.create_all(bind=engine)

    # Create Doctor
    doctor = User(
        username="suryanshDr",
        email="doc@drjii.com",
        full_name="Dr. Suryansh Singh",
        role=UserRole.DOCTOR,
        hashed_password=get_password_hash("surudr"),
        is_active=True,
        is_verified=True,
        medical_license_number="MH-DOC-2024-1234",
        specialization="General Physician",
        hospital_affiliation="Avijo Medical Center"
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    print(f"✅ Created doctor: suryanshDr / surudr")

    # Create Admin
    admin = User(
        username="admin",
        email="admin@drjii.com",
        full_name="System Administrator",
        role=UserRole.ADMIN,
        hashed_password=get_password_hash("admin123"),
        is_active=True,
        is_verified=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print(f"✅ Created admin: admin / admin123")

    # Create Patients
    patients = []
    patient_names = [
        "Ram Kumar", "Sita Devi", "Rajesh Sharma", "Priya Singh", "Amit Patel",
        "Neha Gupta", "Vikram Rao", "Anjali Mehta", "Suresh Reddy", "Kavita Joshi",
        "Arjun Verma", "Pooja Nair", "Ravi Kumar", "Meera Shah", "Kiran Desai",
        "Anil Kapoor", "Sunita Malhotra", "Manoj Tiwari", "Rekha Iyer", "Deepak Agarwal"
    ]
    
    for i, name in enumerate(patient_names):
        patient_user = User(
            username=f"patient{i+1}",
            email=f"patient{i+1}@test.com",
            full_name=name,
            role=UserRole.PATIENT,
            hashed_password=get_password_hash("test123"),
            is_active=True,
            is_verified=True
        )
        db.add(patient_user)
        db.commit()
        db.refresh(patient_user)
        
        patient_profile = Patient(
            user_id=patient_user.id,
            date_of_birth=datetime.now() - timedelta(days=random.randint(18*365, 70*365)),
            gender=random.choice(["Male", "Female"]),
            blood_group=random.choice(["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"]),
            height=random.randint(150, 185),
            weight=random.randint(50, 90),
            phone=f"+91{random.randint(7000000000, 9999999999)}",
            allergies=random.choice([[], ["Penicillin"], ["Sulfa drugs"], ["Aspirin"]]),
            chronic_conditions=random.choice([[], ["Diabetes"], ["Hypertension"], ["Asthma"]]),
            current_medications=[]
        )
        db.add(patient_profile)
        db.commit()
        patients.append(patient_user)
    
    print(f"✅ Created {len(patients)} patients")

    # Symptom sets for consultations
    symptom_sets = [
        {
            "complaint": "Severe chest pain radiating to left arm and jaw",
            "symptoms": [
                {"name": "chest pain", "severity": "severe", "duration": "30 minutes", "description": "crushing sensation, radiating to left arm"},
                {"name": "sweating", "severity": "severe", "duration": "30 minutes", "description": "profuse cold sweats"},
                {"name": "shortness of breath", "severity": "moderate", "duration": "30 minutes", "description": "difficulty breathing"}
            ],
            "triage": TriageLevel.EMERGENCY,
            "red_flags": ["Cardiac emergency - possible myocardial infarction"]
        },
        {
            "complaint": "High fever with body ache and cough",
            "symptoms": [
                {"name": "fever", "severity": "moderate", "duration": "3 days", "description": "temperature 102°F"},
                {"name": "body ache", "severity": "moderate", "duration": "3 days", "description": "generalized pain"},
                {"name": "cough", "severity": "mild", "duration": "3 days", "description": "dry cough"}
            ],
            "triage": TriageLevel.SEE_GP,
            "red_flags": []
        },
        {
            "complaint": "Severe headache with vomiting",
            "symptoms": [
                {"name": "severe headache", "severity": "severe", "duration": "2 hours", "description": "worst headache ever"},
                {"name": "vomiting", "severity": "moderate", "duration": "1 hour", "description": "multiple episodes"},
                {"name": "sensitivity to light", "severity": "moderate", "duration": "2 hours", "description": "photophobia"}
            ],
            "triage": TriageLevel.URGENT,
            "red_flags": ["Possible neurological emergency"]
        },
        {
            "complaint": "Abdominal pain and diarrhea",
            "symptoms": [
                {"name": "abdominal pain", "severity": "moderate", "duration": "1 day", "description": "cramping pain"},
                {"name": "diarrhea", "severity": "moderate", "duration": "1 day", "description": "watery stools"},
                {"name": "nausea", "severity": "mild", "duration": "1 day", "description": "feeling sick"}
            ],
            "triage": TriageLevel.SEE_GP,
            "red_flags": []
        },
        {
            "complaint": "Persistent cough and fatigue",
            "symptoms": [
                {"name": "cough", "severity": "mild", "duration": "2 weeks", "description": "persistent dry cough"},
                {"name": "fatigue", "severity": "moderate", "duration": "2 weeks", "description": "tiredness"},
                {"name": "mild fever", "severity": "mild", "duration": "1 week", "description": "low grade fever"}
            ],
            "triage": TriageLevel.SEE_GP,
            "red_flags": []
        },
        {
            "complaint": "Difficulty breathing and wheezing",
            "symptoms": [
                {"name": "shortness of breath", "severity": "severe", "duration": "2 hours", "description": "severe dyspnea"},
                {"name": "wheezing", "severity": "moderate", "duration": "2 hours", "description": "audible wheeze"},
                {"name": "chest tightness", "severity": "moderate", "duration": "2 hours", "description": "tight chest"}
            ],
            "triage": TriageLevel.EMERGENCY,
            "red_flags": ["Respiratory emergency - possible asthma attack"]
        }
    ]

    # Create Consultations
    consultation_count = 0
    task_count = 0
    
    for i in range(60):
        patient = random.choice(patients)
        symptom_set = random.choice(symptom_sets)
        
        # Determine diagnosis based on symptoms
        if "chest pain" in symptom_set["complaint"].lower():
            diagnosis = "Acute Coronary Syndrome - requires immediate intervention"
            condition = "Acute Myocardial Infarction"
            icd_code = "I21.9"
        elif "fever" in symptom_set["complaint"].lower():
            diagnosis = "Viral fever - symptomatic treatment advised"
            condition = "Viral Infection"
            icd_code = "B34.9"
        elif "headache" in symptom_set["complaint"].lower():
            diagnosis = "Severe headache - neurological evaluation needed"
            condition = "Migraine"
            icd_code = "G43.9"
        elif "breathing" in symptom_set["complaint"].lower():
            diagnosis = "Acute respiratory distress - immediate bronchodilator therapy"
            condition = "Acute Asthma Exacerbation"
            icd_code = "J45.901"
        else:
            diagnosis = "Under observation - follow-up required"
            condition = "Gastroenteritis"
            icd_code = "K52.9"
        
        consultation = Consultation(
            doctor_id=doctor.id,
            patient_id=patient.id,
            chief_complaint=symptom_set["complaint"],
            symptoms=symptom_set["symptoms"],
            ai_triage_level=symptom_set["triage"],
            ai_red_flags=symptom_set["red_flags"],
            ai_suggested_diagnoses=[
                {
                    "condition": condition,
                    "probability": "high" if symptom_set["triage"] == TriageLevel.EMERGENCY else "medium",
                    "icd_code": icd_code,
                    "reasoning": f"Based on symptoms: {symptom_set['complaint']}",
                    "recommended_tests": ["Blood test", "ECG"] if "chest" in symptom_set["complaint"].lower() else ["Blood test"]
                }
            ],
            status=random.choice(["pending", "in_progress", "completed"]),
            consultation_date=datetime.now() - timedelta(days=random.randint(0, 30)),
            diagnosis=diagnosis,
            treatment_plan=f"Treatment initiated for {condition}" if symptom_set["triage"] == TriageLevel.EMERGENCY else "Observation and symptomatic treatment"
        )
        db.add(consultation)
        db.commit()
        db.refresh(consultation)
        consultation_count += 1

        # Create tasks for some consultations
        if random.choice([True, False, True]):  # 66% chance
            task_types_priorities = [
                ("follow_up_appointment", "medium", "Schedule follow-up appointment"),
                ("test_review", "high", "Review test results"),
                ("prescription_refill", "low", "Process prescription refill"),
                ("emergency_follow_up", "high", "Emergency follow-up required")
            ]
            
            task_type, priority, title_prefix = random.choice(task_types_priorities)
            
            # Emergency consultations get high priority tasks
            if symptom_set["triage"] == TriageLevel.EMERGENCY:
                task_type = "emergency_follow_up"
                priority = "high"
            
            task = Task(
                doctor_id=doctor.id,
                patient_id=patient.id,
                consultation_id=consultation.id,
                task_type=task_type,
                title=f"{title_prefix} - {patient.full_name}",
                description=f"Review consultation #{consultation.id}: {symptom_set['complaint']}",
                priority=priority,
                status=random.choice(["pending", "pending", "pending", "completed"]),  # 75% pending
                due_date=datetime.now() + timedelta(days=random.randint(1, 14)),
                ai_generated=True
            )
            db.add(task)
            task_count += 1

        # Create audit log
        audit = AuditLog(
            user_id=doctor.id,
            action="create_consultation",
            resource_type="consultation",
            resource_id=consultation.id,
            ip_address="127.0.0.1",
            user_agent="Dr. Jii WebApp"
        )
        db.add(audit)

    db.commit()
    print(f"✅ Created {consultation_count} consultations with symptoms")
    print(f"✅ Created {task_count} tasks")

    # Print summary
    print("\n" + "="*70)
    print("🎉 DATABASE SEEDED SUCCESSFULLY!")
    print("="*70)
    print("\n📊 Login Credentials:")
    print("   👨‍⚕️  Doctor: suryanshDr / surudr")
    print("   🔧 Admin:  admin / admin123")
    print(f"   👤 Patients: patient1 to patient{len(patients)} / test123")
    print(f"\n📈 Data Created:")
    print(f"   • 1 Doctor (Dr. Suryansh Singh)")
    print(f"   • 1 Admin")
    print(f"   • {len(patients)} Patients")
    print(f"   • {consultation_count} Consultations (includes emergencies)")
    print(f"   • {task_count} Tasks (automated & manual)")
    print(f"   • {consultation_count} Audit logs")
    
    # Count emergency cases
    emergency_count = db.query(Consultation).filter(
        Consultation.ai_triage_level == TriageLevel.EMERGENCY
    ).count()
    urgent_count = db.query(Consultation).filter(
        Consultation.ai_triage_level == TriageLevel.URGENT
    ).count()
    
    print(f"\n⚡ Triage Statistics:")
    print(f"   🚨 Emergency: {emergency_count} cases")
    print(f"   ⚠️  Urgent: {urgent_count} cases")
    print(f"   📋 See GP: {consultation_count - emergency_count - urgent_count} cases")
    
    print("\n🚀 Next Steps:")
    print("   1. Start server: cd backend && python main.py")
    print("   2. Open browser: http://localhost:8000/frontend/index.html")
    print("   3. Or use start-test.bat for auto-login")
    print("="*70 + "\n")

except Exception as e:
    print(f"\n❌ Error occurred: {str(e)}")
    print(f"Error type: {type(e).__name__}")
    import traceback
    traceback.print_exc()
    db.rollback()
    print("\n⚠️  Database rolled back. Please check the error and try again.")
finally:
    db.close()
    print("✅ Database connection closed.")