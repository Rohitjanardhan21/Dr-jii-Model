#!/usr/bin/env python3
"""
Generate sample medical reports as PDF files
"""
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from database import SessionLocal
from models import MedicalReport, Patient, User
from datetime import datetime
import time

def create_sample_text_reports():
    """Create sample text-based medical reports"""
    
    # Create uploads directory
    uploads_dir = Path("uploads/reports")
    uploads_dir.mkdir(parents=True, exist_ok=True)
    
    db = SessionLocal()
    
    try:
        # Get some patients
        patients = db.query(User).filter(User.role == "patient").limit(10).all()
        
        if not patients:
            print("❌ No patients found in database. Run seed_data.py first.")
            return
        
        sample_reports = [
            {
                "type": "Blood Test Report",
                "content": """BLOOD TEST REPORT
                
Patient: {patient_name}
Date: {date}
Lab ID: LAB-{timestamp}

COMPLETE BLOOD COUNT:
- Hemoglobin: 12.5 g/dL (Normal: 12-16)
- RBC Count: 4.2 million/μL (Normal: 4.0-5.5)
- WBC Count: 7,500/μL (Normal: 4,000-11,000)
- Platelet Count: 250,000/μL (Normal: 150,000-450,000)

LIPID PROFILE:
- Total Cholesterol: 180 mg/dL (Normal: <200)
- HDL Cholesterol: 45 mg/dL (Normal: >40)
- LDL Cholesterol: 110 mg/dL (Normal: <100)
- Triglycerides: 125 mg/dL (Normal: <150)

LIVER FUNCTION:
- SGPT/ALT: 25 U/L (Normal: 7-56)
- SGOT/AST: 30 U/L (Normal: 10-40)
- Bilirubin Total: 0.8 mg/dL (Normal: 0.3-1.2)

KIDNEY FUNCTION:
- Creatinine: 0.9 mg/dL (Normal: 0.6-1.2)
- BUN: 15 mg/dL (Normal: 7-20)

REMARKS: All values within normal limits. Continue current medication.
"""
            },
            {
                "type": "X-Ray Report", 
                "content": """CHEST X-RAY REPORT

Patient: {patient_name}
Date: {date}
Study: Chest X-Ray PA View

CLINICAL HISTORY:
Cough and fever for 3 days

FINDINGS:
- Heart size and shape: Normal
- Lung fields: Clear, no consolidation
- Costophrenic angles: Sharp
- Mediastinum: Normal width
- Bones: No abnormality detected

IMPRESSION:
Normal chest X-ray. No evidence of pneumonia or other pulmonary pathology.

RECOMMENDATION:
Clinical correlation advised. Follow-up if symptoms persist.
"""
            },
            {
                "type": "ECG Report",
                "content": """ELECTROCARDIOGRAM REPORT

Patient: {patient_name}
Date: {date}
Time: {time}

TECHNICAL DATA:
- Heart Rate: 72 bpm
- PR Interval: 160 ms
- QRS Duration: 90 ms
- QT/QTc: 400/420 ms

RHYTHM: Normal sinus rhythm

AXIS: Normal axis

INTERVALS: Normal

ST-T CHANGES: None

IMPRESSION:
Normal ECG. No evidence of ischemia, arrhythmia, or conduction abnormalities.

CLINICAL CORRELATION:
ECG findings are within normal limits for age and gender.
"""
            }
        ]
        
        created_count = 0
        
        for i, patient in enumerate(patients):
            for j, report_template in enumerate(sample_reports):
                timestamp = int(time.time() * 1000000) + (i * 1000) + j
                
                # Create text content
                content = report_template["content"].format(
                    patient_name=patient.full_name,
                    date=datetime.now().strftime("%Y-%m-%d"),
                    time=datetime.now().strftime("%H:%M:%S"),
                    timestamp=timestamp
                )
                
                # Save as text file (simulating PDF)
                filename = f"{timestamp}_report_{patient.id}_{report_template['type'].lower().replace(' ', '_')}.txt"
                filepath = uploads_dir / filename
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                # Create database entry
                medical_report = MedicalReport(
                    patient_id=patient.id,
                    report_type=report_template["type"],
                    report_name=f"{report_template['type']}_{patient.full_name}",
                    file_path=str(filepath),
                    file_type="txt",
                    extracted_text=content,
                    ai_summary=f"Summary of {report_template['type']} for {patient.full_name}: All parameters within normal limits.",
                    report_date=datetime.now()
                )
                
                db.add(medical_report)
                created_count += 1
        
        db.commit()
        
        print(f"✅ Generated {created_count} sample medical reports")
        print(f"📁 Reports saved in: {uploads_dir.absolute()}")
        print(f"📊 Database updated with report entries")
        
        return created_count
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        return 0
    finally:
        db.close()

if __name__ == "__main__":
    print("🏥 Generating Sample Medical Reports...")
    print("=" * 50)
    
    count = create_sample_text_reports()
    
    if count > 0:
        print("\n🎉 Sample reports generated successfully!")
        print("\nYou can now:")
        print("1. Upload these to your deployment")
        print("2. Test the medical report features")
        print("3. Generate more reports as needed")
    else:
        print("\n❌ Failed to generate reports")
        print("Make sure to run seed_data.py first to create patients")