#!/usr/bin/env python3
"""
Generate reports for the newly added patients
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from database import SessionLocal
from models import MedicalReport, User
from datetime import datetime, timedelta
import time
import random
from pathlib import Path

def generate_reports_for_new_patients():
    """Generate medical reports for the 20 newly added patients"""
    
    # Create uploads directory
    uploads_dir = Path("uploads/reports")
    uploads_dir.mkdir(parents=True, exist_ok=True)
    
    db = SessionLocal()
    
    try:
        # Get the last 20 patients (newly added)
        patients = db.query(User).filter(User.role == "PATIENT").order_by(User.id.desc()).limit(20).all()
        
        print(f"Found {len(patients)} patients to generate reports for")
        
        created_count = 0
        
        for i, patient in enumerate(patients):
            # Generate 2-3 reports per patient
            num_reports = random.randint(2, 3)
            
            for j in range(num_reports):
                timestamp = int(time.time() * 1000000) + (i * 1000) + j
                
                # Simple blood test report
                content = f"""🏥 APOLLO HOSPITALS - BLOOD TEST REPORT

Patient: {patient.full_name}
Date: {datetime.now().strftime("%Y-%m-%d")}
Lab ID: LAB-{timestamp}
Doctor: Dr. Suryansh Singh

COMPLETE BLOOD COUNT:
- Hemoglobin: {round(random.uniform(10.0, 15.0), 1)} g/dL (Normal: 12-16)
- RBC Count: {round(random.uniform(3.8, 5.2), 1)} million/μL (Normal: 4.0-5.5)
- WBC Count: {random.randint(5000, 12000)}/μL (Normal: 4,000-11,000)
- Platelet Count: {random.randint(180000, 400000)}/μL (Normal: 150,000-450,000)

DIABETES PROFILE:
- Fasting Blood Sugar: {random.randint(80, 180)} mg/dL (Normal: 70-100)
- HbA1c: {round(random.uniform(5.0, 8.5), 1)}% (Normal: <5.7)

LIPID PROFILE:
- Total Cholesterol: {random.randint(160, 280)} mg/dL (Normal: <200)
- HDL Cholesterol: {random.randint(35, 65)} mg/dL (Normal: >40)
- LDL Cholesterol: {random.randint(90, 180)} mg/dL (Normal: <100)
- Triglycerides: {random.randint(80, 300)} mg/dL (Normal: <150)

LIVER FUNCTION:
- SGPT/ALT: {random.randint(15, 80)} U/L (Normal: 7-56)
- SGOT/AST: {random.randint(20, 70)} U/L (Normal: 10-40)
- Bilirubin Total: {round(random.uniform(0.3, 1.5), 1)} mg/dL (Normal: 0.3-1.2)

KIDNEY FUNCTION:
- Creatinine: {round(random.uniform(0.7, 1.8), 1)} mg/dL (Normal: 0.6-1.2)
- BUN: {random.randint(8, 30)} mg/dL (Normal: 7-20)
- Uric Acid: {round(random.uniform(3.0, 8.5), 1)} mg/dL (Normal: 3.5-7.2)

THYROID FUNCTION:
- TSH: {round(random.uniform(0.5, 8.0), 2)} mIU/L (Normal: 0.4-4.0)
- T3: {random.randint(80, 200)} ng/dL (Normal: 80-200)
- T4: {round(random.uniform(5, 12), 1)} μg/dL (Normal: 5-12)

VITAMIN LEVELS:
- Vitamin D: {random.randint(10, 50)} ng/mL (Normal: 30-100)
- Vitamin B12: {random.randint(150, 800)} pg/mL (Normal: 200-900)

REMARKS: {random.choice([
    "All parameters within normal limits. Continue healthy lifestyle.",
    "Diabetes mellitus detected. Medication and lifestyle modification recommended.",
    "Thyroid dysfunction noted. Endocrinology consultation advised.",
    "Vitamin D deficiency. Supplementation recommended.",
    "Lipid abnormalities present. Dietary modification suggested.",
    "Mild anemia detected. Iron supplementation may be needed."
])}

Dr. Suryansh Singh, MBBS, MD
Apollo Hospitals, Mumbai
License: MH-DOC-2024-1234
"""
                
                # Save report file
                filename = f"{timestamp}_report_{patient.id}_blood_test_report.txt"
                filepath = uploads_dir / filename
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                # Create database entry
                medical_report = MedicalReport(
                    patient_id=patient.id,
                    report_type="Blood Test Report",
                    report_name=f"Blood Test Report - {patient.full_name}",
                    file_path=str(filepath),
                    file_type="txt",
                    extracted_text=content,
                    ai_summary=f"Blood test report for {patient.full_name} showing various lab parameters and health indicators.",
                    report_date=datetime.now() - timedelta(days=random.randint(1, 60))
                )
                
                db.add(medical_report)
                created_count += 1
        
        db.commit()
        
        print(f"✅ Generated {created_count} medical reports")
        return created_count
        
    except Exception as e:
        print(f"❌ Error generating reports: {e}")
        db.rollback()
        return 0
    finally:
        db.close()

if __name__ == "__main__":
    print("🏥 Generating Reports for New Patients...")
    print("=" * 50)
    
    count = generate_reports_for_new_patients()
    
    if count > 0:
        print(f"\n🎉 Successfully generated {count} medical reports!")
        print("\n🔍 You can now test queries like:")
        print("• 'How many patients do we have?'")
        print("• 'Show me Ananya Banerjee reports'")
        print("• 'Which patients have diabetes?'")
        print("• 'Find patients with high cholesterol'")
    else:
        print("\n❌ Failed to generate reports")