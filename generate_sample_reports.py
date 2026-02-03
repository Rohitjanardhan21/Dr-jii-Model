#!/usr/bin/env python3
"""
Generate sample medical reports as PDF files for Indian patients
"""
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from database import SessionLocal
from models import MedicalReport, Patient, User
from datetime import datetime, timedelta
import time
import random

def create_indian_patient_reports():
    """Create sample text-based medical reports for Indian patients"""
    
    # Create uploads directory
    uploads_dir = Path("uploads/reports")
    uploads_dir.mkdir(parents=True, exist_ok=True)
    
    db = SessionLocal()
    
    try:
        # Get Indian patients (excluding the doctor)
        patients = db.query(User).filter(
            User.role == "PATIENT"
        ).all()
        
        if not patients:
            print("❌ No patients found in database.")
            return
        
        # Indian-specific medical report templates
        indian_report_templates = [
            {
                "type": "Blood Test Report",
                "content": """🏥 APOLLO HOSPITALS - BLOOD TEST REPORT

Patient: {patient_name}
Date: {date}
Lab ID: LAB-{timestamp}
Doctor: Dr. Suryansh Singh

COMPLETE BLOOD COUNT:
- Hemoglobin: {hb} g/dL (Normal: 12-16)
- RBC Count: {rbc} million/μL (Normal: 4.0-5.5)
- WBC Count: {wbc}/μL (Normal: 4,000-11,000)
- Platelet Count: {platelets}/μL (Normal: 150,000-450,000)
- ESR: {esr} mm/hr (Normal: 0-20)

LIPID PROFILE:
- Total Cholesterol: {cholesterol} mg/dL (Normal: <200)
- HDL Cholesterol: {hdl} mg/dL (Normal: >40)
- LDL Cholesterol: {ldl} mg/dL (Normal: <100)
- Triglycerides: {triglycerides} mg/dL (Normal: <150)

DIABETES SCREENING:
- Fasting Blood Sugar: {fbs} mg/dL (Normal: 70-100)
- HbA1c: {hba1c}% (Normal: <5.7)

LIVER FUNCTION:
- SGPT/ALT: {sgpt} U/L (Normal: 7-56)
- SGOT/AST: {sgot} U/L (Normal: 10-40)
- Bilirubin Total: {bilirubin} mg/dL (Normal: 0.3-1.2)

KIDNEY FUNCTION:
- Creatinine: {creatinine} mg/dL (Normal: 0.6-1.2)
- BUN: {bun} mg/dL (Normal: 7-20)
- Uric Acid: {uric_acid} mg/dL (Normal: 3.5-7.2)

THYROID FUNCTION:
- TSH: {tsh} mIU/L (Normal: 0.4-4.0)
- T3: {t3} ng/dL (Normal: 80-200)
- T4: {t4} μg/dL (Normal: 5-12)

VITAMIN LEVELS:
- Vitamin D: {vit_d} ng/mL (Normal: 30-100)
- Vitamin B12: {vit_b12} pg/mL (Normal: 200-900)

REMARKS: {remarks}

Dr. Suryansh Singh, MBBS, MD
Apollo Hospitals, Mumbai
License: MH-DOC-2024-1234
"""
            },
            {
                "type": "X-Ray Report", 
                "content": """🏥 FORTIS HEALTHCARE - CHEST X-RAY REPORT

Patient: {patient_name}
Date: {date}
Study: Chest X-Ray PA & Lateral View
Radiologist: Dr. Suryansh Singh

CLINICAL HISTORY:
{clinical_history}

TECHNIQUE:
Digital chest radiography in PA and lateral projections

FINDINGS:
- Heart: {heart_finding}
- Lungs: {lung_finding}
- Pleura: {pleura_finding}
- Mediastinum: {mediastinum_finding}
- Bones: {bone_finding}
- Soft tissues: Normal

IMPRESSION:
{impression}

RECOMMENDATION:
{recommendation}

Dr. Suryansh Singh, MBBS, MD (Radiology)
Fortis Healthcare, Delhi
License: MH-DOC-2024-1234
"""
            },
            {
                "type": "ECG Report",
                "content": """🏥 MAX HEALTHCARE - ELECTROCARDIOGRAM REPORT

Patient: {patient_name}
Date: {date}
Time: {time}
Cardiologist: Dr. Suryansh Singh

TECHNICAL DATA:
- Heart Rate: {heart_rate} bpm
- PR Interval: {pr_interval} ms
- QRS Duration: {qrs_duration} ms
- QT/QTc: {qt_interval}/{qtc_interval} ms
- Axis: {axis}

RHYTHM ANALYSIS:
- Rhythm: {rhythm}
- Rate: {rate_analysis}

MORPHOLOGY:
- P waves: {p_waves}
- QRS complexes: {qrs_complexes}
- ST segments: {st_segments}
- T waves: {t_waves}

INTERPRETATION:
{interpretation}

CLINICAL CORRELATION:
{clinical_correlation}

RECOMMENDATIONS:
{recommendations}

Dr. Suryansh Singh, MBBS, DM (Cardiology)
Max Healthcare, Gurgaon
License: MH-DOC-2024-1234
"""
            },
            {
                "type": "Ultrasound Report",
                "content": """🏥 MEDANTA HOSPITAL - ULTRASOUND REPORT

Patient: {patient_name}
Date: {date}
Study: {ultrasound_type}
Sonologist: Dr. Suryansh Singh

CLINICAL INDICATION:
{clinical_indication}

TECHNIQUE:
Real-time ultrasound examination using {probe_frequency} MHz transducer

FINDINGS:

{organ_system}:
{findings}

MEASUREMENTS:
{measurements}

IMPRESSION:
{impression}

RECOMMENDATIONS:
{recommendations}

Dr. Suryansh Singh, MBBS, MD (Radiology)
Medanta Hospital, Gurgaon  
License: MH-DOC-2024-1234
"""
            }
        ]
        
        created_count = 0
        
        # Generate varied medical data for Indian population
        def generate_indian_medical_data():
            # Common conditions in Indian population
            conditions = [
                "diabetes", "hypertension", "thyroid_disorder", "vitamin_d_deficiency", 
                "anemia", "normal", "mild_fatty_liver", "kidney_stones"
            ]
            condition = random.choice(conditions)
            
            if condition == "diabetes":
                return {
                    "hb": round(random.uniform(10.5, 13.5), 1),
                    "rbc": round(random.uniform(3.8, 4.8), 1),
                    "wbc": random.randint(6000, 12000),
                    "platelets": random.randint(200000, 400000),
                    "esr": random.randint(15, 35),
                    "cholesterol": random.randint(220, 280),
                    "hdl": random.randint(35, 45),
                    "ldl": random.randint(130, 180),
                    "triglycerides": random.randint(180, 300),
                    "fbs": random.randint(140, 200),
                    "hba1c": round(random.uniform(7.0, 9.5), 1),
                    "sgpt": random.randint(25, 60),
                    "sgot": random.randint(30, 65),
                    "bilirubin": round(random.uniform(0.8, 1.5), 1),
                    "creatinine": round(random.uniform(0.9, 1.4), 1),
                    "bun": random.randint(15, 25),
                    "uric_acid": round(random.uniform(4.5, 8.0), 1),
                    "tsh": round(random.uniform(1.5, 4.5), 2),
                    "t3": random.randint(90, 180),
                    "t4": round(random.uniform(6, 11), 1),
                    "vit_d": random.randint(15, 25),
                    "vit_b12": random.randint(180, 350),
                    "remarks": "Diabetes mellitus detected. Recommend dietary modification and medication."
                }
            elif condition == "hypertension":
                return {
                    "hb": round(random.uniform(12.0, 15.0), 1),
                    "rbc": round(random.uniform(4.0, 5.2), 1),
                    "wbc": random.randint(5000, 9000),
                    "platelets": random.randint(180000, 350000),
                    "esr": random.randint(8, 20),
                    "cholesterol": random.randint(200, 240),
                    "hdl": random.randint(38, 48),
                    "ldl": random.randint(120, 160),
                    "triglycerides": random.randint(150, 220),
                    "fbs": random.randint(85, 110),
                    "hba1c": round(random.uniform(5.2, 6.0), 1),
                    "sgpt": random.randint(20, 45),
                    "sgot": random.randint(25, 50),
                    "bilirubin": round(random.uniform(0.5, 1.0), 1),
                    "creatinine": round(random.uniform(0.8, 1.2), 1),
                    "bun": random.randint(12, 20),
                    "uric_acid": round(random.uniform(5.0, 7.5), 1),
                    "tsh": round(random.uniform(1.0, 3.5), 2),
                    "t3": random.randint(100, 190),
                    "t4": round(random.uniform(7, 12), 1),
                    "vit_d": random.randint(20, 35),
                    "vit_b12": random.randint(250, 500),
                    "remarks": "Cardiovascular risk factors present. Monitor blood pressure regularly."
                }
            else:  # normal
                return {
                    "hb": round(random.uniform(12.5, 15.5), 1),
                    "rbc": round(random.uniform(4.2, 5.0), 1),
                    "wbc": random.randint(5000, 8000),
                    "platelets": random.randint(200000, 350000),
                    "esr": random.randint(5, 15),
                    "cholesterol": random.randint(160, 190),
                    "hdl": random.randint(45, 60),
                    "ldl": random.randint(90, 120),
                    "triglycerides": random.randint(80, 140),
                    "fbs": random.randint(80, 95),
                    "hba1c": round(random.uniform(4.8, 5.5), 1),
                    "sgpt": random.randint(15, 35),
                    "sgot": random.randint(20, 40),
                    "bilirubin": round(random.uniform(0.4, 0.9), 1),
                    "creatinine": round(random.uniform(0.7, 1.0), 1),
                    "bun": random.randint(8, 18),
                    "uric_acid": round(random.uniform(3.5, 6.5), 1),
                    "tsh": round(random.uniform(0.8, 3.0), 2),
                    "t3": random.randint(110, 180),
                    "t4": round(random.uniform(8, 11), 1),
                    "vit_d": random.randint(25, 45),
                    "vit_b12": random.randint(300, 700),
                    "remarks": "All parameters within normal limits. Maintain healthy lifestyle."
                }
        
        for patient in patients:
            # Generate 2-3 reports per patient
            num_reports = random.randint(2, 3)
            
            for i in range(num_reports):
                report_template = random.choice(indian_report_templates)
                timestamp = int(time.time() * 1000000) + (patient.id * 1000) + i
                
                # Generate medical data
                medical_data = generate_indian_medical_data()
                
                # Create specific content based on report type
                if report_template["type"] == "Blood Test Report":
                    content = report_template["content"].format(
                        patient_name=patient.full_name,
                        date=datetime.now().strftime("%Y-%m-%d"),
                        timestamp=timestamp,
                        **medical_data
                    )
                elif report_template["type"] == "X-Ray Report":
                    clinical_histories = [
                        "Cough and fever for 5 days",
                        "Chest pain and shortness of breath",
                        "Routine health checkup",
                        "Follow-up for respiratory symptoms"
                    ]
                    content = report_template["content"].format(
                        patient_name=patient.full_name,
                        date=datetime.now().strftime("%Y-%m-%d"),
                        clinical_history=random.choice(clinical_histories),
                        heart_finding="Normal size and shape",
                        lung_finding="Clear lung fields bilaterally",
                        pleura_finding="No pleural effusion",
                        mediastinum_finding="Normal mediastinal contours",
                        bone_finding="No bony abnormality",
                        impression="Normal chest X-ray",
                        recommendation="No further imaging required at this time"
                    )
                elif report_template["type"] == "ECG Report":
                    content = report_template["content"].format(
                        patient_name=patient.full_name,
                        date=datetime.now().strftime("%Y-%m-%d"),
                        time=datetime.now().strftime("%H:%M:%S"),
                        heart_rate=random.randint(60, 100),
                        pr_interval=random.randint(120, 200),
                        qrs_duration=random.randint(80, 120),
                        qt_interval=random.randint(350, 450),
                        qtc_interval=random.randint(380, 460),
                        axis="Normal",
                        rhythm="Normal sinus rhythm",
                        rate_analysis="Normal rate",
                        p_waves="Normal",
                        qrs_complexes="Normal",
                        st_segments="No significant ST changes",
                        t_waves="Normal T waves",
                        interpretation="Normal ECG",
                        clinical_correlation="ECG findings correlate with clinical presentation",
                        recommendations="Continue current management"
                    )
                else:  # Ultrasound
                    ultrasound_types = [
                        "Abdominal Ultrasound",
                        "Pelvic Ultrasound", 
                        "Thyroid Ultrasound",
                        "Renal Ultrasound"
                    ]
                    content = report_template["content"].format(
                        patient_name=patient.full_name,
                        date=datetime.now().strftime("%Y-%m-%d"),
                        ultrasound_type=random.choice(ultrasound_types),
                        clinical_indication="Routine screening",
                        probe_frequency="3.5-5.0",
                        organ_system="Abdomen",
                        findings="Normal echotexture and size of visualized organs",
                        measurements="Within normal limits",
                        impression="Normal ultrasound study",
                        recommendations="No follow-up required"
                    )
                
                # Save as text file
                filename = f"{timestamp}_report_{patient.id}_{report_template['type'].lower().replace(' ', '_')}.txt"
                filepath = uploads_dir / filename
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                # Create database entry
                medical_report = MedicalReport(
                    patient_id=patient.id,
                    report_type=report_template["type"],
                    report_name=f"{report_template['type']} - {patient.full_name}",
                    file_path=str(filepath),
                    file_type="txt",
                    extracted_text=content,
                    ai_summary=f"Medical {report_template['type'].lower()} for {patient.full_name} showing {medical_data.get('remarks', 'normal findings')}",
                    report_date=datetime.now() - timedelta(days=random.randint(1, 30))
                )
                
                db.add(medical_report)
                created_count += 1
        
        db.commit()
        
        print(f"✅ Generated {created_count} Indian patient medical reports")
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
    print("🏥 Generating Indian Patient Medical Reports...")
    print("=" * 60)
    
    count = create_indian_patient_reports()
    
    if count > 0:
        print("\n🎉 Indian patient reports generated successfully!")
        print("\nSample queries you can try:")
        print("• 'How many patients do we have?'")
        print("• 'Show me Rajesh Kumar's reports'")
        print("• 'Which patients have diabetes?'")
        print("• 'Summarize Priya Sharma's latest report'")
        print("• 'Find patients with high cholesterol'")
    else:
        print("\n❌ Failed to generate reports")