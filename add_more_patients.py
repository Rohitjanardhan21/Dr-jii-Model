#!/usr/bin/env python3
"""
Add 20 more Indian patients with diverse medical conditions and reports
"""
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from database import SessionLocal
from models import MedicalReport, User, UserRole
from datetime import datetime, timedelta
import time
import random

def add_diverse_indian_patients():
    """Add 20 more Indian patients with varying medical conditions"""
    
    db = SessionLocal()
    
    try:
        # 20 more Indian patients with diverse names from different regions
        new_patients = [
            # North India
            {"name": "Arjun Verma", "email": "arjun.verma@gmail.com", "username": "arjun_verma"},
            {"name": "Deepika Malhotra", "email": "deepika.malhotra@gmail.com", "username": "deepika_malhotra"},
            {"name": "Rohit Kapoor", "email": "rohit.kapoor@gmail.com", "username": "rohit_kapoor"},
            {"name": "Simran Kaur", "email": "simran.kaur@gmail.com", "username": "simran_kaur"},
            {"name": "Manish Agarwal", "email": "manish.agarwal@gmail.com", "username": "manish_agarwal"},
            
            # South India
            {"name": "Lakshmi Iyer", "email": "lakshmi.iyer@gmail.com", "username": "lakshmi_iyer"},
            {"name": "Karthik Reddy", "email": "karthik.reddy@gmail.com", "username": "karthik_reddy"},
            {"name": "Meera Nair", "email": "meera.nair@gmail.com", "username": "meera_nair"},
            {"name": "Srinivas Rao", "email": "srinivas.rao@gmail.com", "username": "srinivas_rao"},
            {"name": "Divya Krishnan", "email": "divya.krishnan@gmail.com", "username": "divya_krishnan"},
            
            # West India
            {"name": "Rahul Desai", "email": "rahul.desai@gmail.com", "username": "rahul_desai"},
            {"name": "Pooja Jain", "email": "pooja.jain@gmail.com", "username": "pooja_jain"},
            {"name": "Nikhil Shah", "email": "nikhil.shah@gmail.com", "username": "nikhil_shah"},
            {"name": "Shreya Patel", "email": "shreya.patel@gmail.com", "username": "shreya_patel"},
            {"name": "Varun Modi", "email": "varun.modi@gmail.com", "username": "varun_modi"},
            
            # East India
            {"name": "Ananya Banerjee", "email": "ananya.banerjee@gmail.com", "username": "ananya_banerjee"},
            {"name": "Sourav Das", "email": "sourav.das@gmail.com", "username": "sourav_das"},
            {"name": "Riya Chatterjee", "email": "riya.chatterjee@gmail.com", "username": "riya_chatterjee"},
            {"name": "Debashish Roy", "email": "debashish.roy@gmail.com", "username": "debashish_roy"},
            {"name": "Tanvi Mukherjee", "email": "tanvi.mukherjee@gmail.com", "username": "tanvi_mukherjee"}
        ]
        
        # Add patients to database
        patient_ids = []
        for patient_data in new_patients:
            user = User(
                email=patient_data["email"],
                username=patient_data["username"],
                hashed_password="hash_placeholder",
                full_name=patient_data["name"],
                role=UserRole.PATIENT,
                is_active=True,
                is_verified=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            patient_ids.append(user.id)
            print(f"✅ Added patient: {patient_data['name']}")
        
        print(f"\n📊 Successfully added {len(new_patients)} new patients!")
        return patient_ids
        
    except Exception as e:
        print(f"❌ Error adding patients: {e}")
        db.rollback()
        return []
    finally:
        db.close()

def generate_diverse_medical_reports():
    """Generate medical reports with diverse conditions for new patients"""
    
    # Create uploads directory
    uploads_dir = Path("uploads/reports")
    uploads_dir.mkdir(parents=True, exist_ok=True)
    
    db = SessionLocal()
    
    try:
        # Get the newly added patients (last 20)
        patients = db.query(User).filter(User.role == "PATIENT").order_by(User.id.desc()).limit(20).all()
        
        if not patients:
            print("❌ No patients found for report generation")
            return
        
        # Diverse medical conditions with realistic Indian health patterns
        medical_conditions = [
            {
                "condition": "Type 2 Diabetes Mellitus",
                "prevalence": "high",  # Common in India
                "data": {
                    "fbs": (140, 250), "hba1c": (7.0, 11.0), "cholesterol": (220, 300),
                    "triglycerides": (180, 400), "creatinine": (1.0, 2.0),
                    "remarks": "Type 2 Diabetes Mellitus with poor glycemic control. Requires medication adjustment and lifestyle modification."
                }
            },
            {
                "condition": "Hypertension with Cardiovascular Risk",
                "prevalence": "high",
                "data": {
                    "fbs": (90, 120), "hba1c": (5.5, 6.5), "cholesterol": (200, 280),
                    "triglycerides": (150, 250), "creatinine": (0.9, 1.4),
                    "remarks": "Essential hypertension with cardiovascular risk factors. Blood pressure monitoring required."
                }
            },
            {
                "condition": "Hypothyroidism",
                "prevalence": "medium",
                "data": {
                    "tsh": (8.0, 25.0), "t3": (60, 90), "t4": (3.0, 6.0),
                    "cholesterol": (180, 240), "vit_d": (10, 25),
                    "remarks": "Primary hypothyroidism. Thyroid hormone replacement therapy indicated."
                }
            },
            {
                "condition": "Iron Deficiency Anemia",
                "prevalence": "high",  # Very common in Indian women
                "data": {
                    "hb": (7.5, 10.5), "rbc": (3.2, 4.0), "iron": (30, 60),
                    "ferritin": (8, 25), "vit_b12": (150, 300),
                    "remarks": "Iron deficiency anemia. Iron supplementation and dietary counseling recommended."
                }
            },
            {
                "condition": "Vitamin D Deficiency",
                "prevalence": "very_high",  # Extremely common in India
                "data": {
                    "vit_d": (8, 20), "calcium": (8.5, 9.2), "phosphorus": (2.5, 4.0),
                    "alkaline_phosphatase": (120, 200),
                    "remarks": "Severe Vitamin D deficiency. High-dose supplementation required."
                }
            },
            {
                "condition": "Fatty Liver Disease",
                "prevalence": "medium",
                "data": {
                    "sgpt": (60, 150), "sgot": (55, 120), "ggt": (80, 200),
                    "cholesterol": (200, 280), "triglycerides": (200, 400),
                    "remarks": "Non-alcoholic fatty liver disease. Weight reduction and dietary modification advised."
                }
            },
            {
                "condition": "Chronic Kidney Disease",
                "prevalence": "medium",
                "data": {
                    "creatinine": (1.5, 3.5), "bun": (25, 60), "uric_acid": (7.0, 12.0),
                    "hemoglobin": (8.5, 11.0), "phosphorus": (4.5, 7.0),
                    "remarks": "Chronic kidney disease stage 3-4. Nephrology consultation recommended."
                }
            },
            {
                "condition": "Polycystic Ovary Syndrome (PCOS)",
                "prevalence": "medium",  # Common in young Indian women
                "data": {
                    "fbs": (100, 140), "insulin": (15, 35), "testosterone": (0.8, 2.0),
                    "cholesterol": (180, 250), "triglycerides": (120, 200),
                    "remarks": "PCOS with insulin resistance. Metformin and lifestyle modification recommended."
                }
            },
            {
                "condition": "Rheumatoid Arthritis",
                "prevalence": "low",
                "data": {
                    "esr": (40, 80), "crp": (15, 50), "ra_factor": (25, 100),
                    "hemoglobin": (9.5, 12.0), "uric_acid": (4.0, 8.0),
                    "remarks": "Active rheumatoid arthritis. Disease-modifying therapy indicated."
                }
            },
            {
                "condition": "Normal Healthy Individual",
                "prevalence": "medium",
                "data": {
                    "fbs": (80, 95), "hba1c": (4.8, 5.5), "cholesterol": (150, 190),
                    "triglycerides": (80, 140), "creatinine": (0.7, 1.0),
                    "remarks": "All parameters within normal limits. Continue healthy lifestyle."
                }
            }
        ]
        
        # Indian hospital templates with regional diversity
        hospital_templates = [
            {
                "type": "Blood Test Report",
                "hospitals": [
                    "AIIMS New Delhi", "Apollo Hospitals Chennai", "Fortis Healthcare Mumbai",
                    "Max Healthcare Gurgaon", "Manipal Hospitals Bangalore", "Narayana Health Kolkata",
                    "Kokilaben Hospital Mumbai", "Medanta Gurgaon", "Christian Medical College Vellore"
                ],
                "content": """🏥 {hospital} - COMPREHENSIVE BLOOD TEST REPORT

Patient: {patient_name}
Date: {date}
Lab ID: LAB-{timestamp}
Consulting Physician: Dr. Suryansh Singh

COMPLETE BLOOD COUNT:
- Hemoglobin: {hb} g/dL (Normal: 12-16)
- RBC Count: {rbc} million/μL (Normal: 4.0-5.5)
- WBC Count: {wbc}/μL (Normal: 4,000-11,000)
- Platelet Count: {platelets}/μL (Normal: 150,000-450,000)
- ESR: {esr} mm/hr (Normal: 0-20)
- Hematocrit: {hematocrit}% (Normal: 36-46)

DIABETES PROFILE:
- Fasting Blood Sugar: {fbs} mg/dL (Normal: 70-100)
- Post Prandial Sugar: {ppbs} mg/dL (Normal: <140)
- HbA1c: {hba1c}% (Normal: <5.7)
- Fasting Insulin: {insulin} μU/mL (Normal: 2-25)

LIPID PROFILE:
- Total Cholesterol: {cholesterol} mg/dL (Normal: <200)
- HDL Cholesterol: {hdl} mg/dL (Normal: >40 M, >50 F)
- LDL Cholesterol: {ldl} mg/dL (Normal: <100)
- VLDL Cholesterol: {vldl} mg/dL (Normal: <30)
- Triglycerides: {triglycerides} mg/dL (Normal: <150)
- Cholesterol/HDL Ratio: {chol_hdl_ratio} (Normal: <4.5)

LIVER FUNCTION TESTS:
- SGPT/ALT: {sgpt} U/L (Normal: 7-56)
- SGOT/AST: {sgot} U/L (Normal: 10-40)
- Alkaline Phosphatase: {alp} U/L (Normal: 44-147)
- Gamma GT: {ggt} U/L (Normal: 9-48)
- Total Bilirubin: {bilirubin_total} mg/dL (Normal: 0.3-1.2)
- Direct Bilirubin: {bilirubin_direct} mg/dL (Normal: 0.0-0.3)
- Total Protein: {total_protein} g/dL (Normal: 6.3-8.2)
- Albumin: {albumin} g/dL (Normal: 3.5-5.0)

KIDNEY FUNCTION TESTS:
- Creatinine: {creatinine} mg/dL (Normal: 0.6-1.2)
- Blood Urea Nitrogen: {bun} mg/dL (Normal: 7-20)
- Uric Acid: {uric_acid} mg/dL (Normal: 3.5-7.2)
- Sodium: {sodium} mEq/L (Normal: 136-145)
- Potassium: {potassium} mEq/L (Normal: 3.5-5.1)
- Chloride: {chloride} mEq/L (Normal: 98-107)

THYROID FUNCTION:
- TSH: {tsh} mIU/L (Normal: 0.4-4.0)
- Free T3: {t3} pg/mL (Normal: 2.3-4.2)
- Free T4: {t4} ng/dL (Normal: 0.8-1.8)

VITAMIN & MINERAL PROFILE:
- Vitamin D (25-OH): {vit_d} ng/mL (Normal: 30-100)
- Vitamin B12: {vit_b12} pg/mL (Normal: 200-900)
- Folate: {folate} ng/mL (Normal: 2.7-17.0)
- Iron: {iron} μg/dL (Normal: 60-170)
- Ferritin: {ferritin} ng/mL (Normal: 15-150)
- Calcium: {calcium} mg/dL (Normal: 8.5-10.5)
- Phosphorus: {phosphorus} mg/dL (Normal: 2.5-4.5)

INFLAMMATORY MARKERS:
- C-Reactive Protein: {crp} mg/L (Normal: <3.0)
- Rheumatoid Factor: {ra_factor} IU/mL (Normal: <14)

CARDIAC MARKERS:
- Troponin I: {troponin} ng/mL (Normal: <0.04)
- CK-MB: {ckmb} ng/mL (Normal: <6.3)

CLINICAL INTERPRETATION:
{remarks}

RECOMMENDATIONS:
{recommendations}

Report Verified By: Dr. Suryansh Singh, MBBS, MD (Pathology)
{hospital}
License: MH-DOC-2024-1234
Contact: +91-98765-43210
"""
            },
            {
                "type": "Chest X-Ray Report",
                "hospitals": [
                    "PGIMER Chandigarh", "JIPMER Puducherry", "SGPGIMS Lucknow",
                    "King George Medical College", "Grant Medical College Mumbai"
                ],
                "content": """🏥 {hospital} - CHEST X-RAY REPORT

Patient: {patient_name}
Age/Sex: {age}/{gender}
Date: {date}
Study ID: CXR-{timestamp}
Radiologist: Dr. Suryansh Singh

CLINICAL INDICATION:
{clinical_indication}

TECHNIQUE:
Digital chest radiography in PA and lateral projections
kVp: 120, mAs: 10, Grid: Yes

COMPARISON:
{comparison}

FINDINGS:

LUNGS:
- Right lung: {right_lung_finding}
- Left lung: {left_lung_finding}
- Lung volumes: {lung_volumes}
- Pleural spaces: {pleural_finding}

HEART & MEDIASTINUM:
- Cardiac silhouette: {cardiac_finding}
- Cardiothoracic ratio: {ctr}
- Mediastinal contours: {mediastinum_finding}
- Hilar structures: {hilar_finding}

BONES & SOFT TISSUES:
- Ribs: {rib_finding}
- Spine: {spine_finding}
- Soft tissues: {soft_tissue_finding}

IMPRESSION:
{impression}

RECOMMENDATIONS:
{recommendations}

Report Date: {date}
Dr. Suryansh Singh, MBBS, MD (Radiodiagnosis)
{hospital}
License: MH-DOC-2024-1234
"""
            }
        ]
        
        created_count = 0
        
        for i, patient in enumerate(patients):
            # Assign a medical condition based on Indian health patterns
            condition = random.choices(
                medical_conditions,
                weights=[15, 12, 8, 20, 25, 10, 5, 6, 3, 8],  # Weighted by prevalence in India
                k=1
            )[0]
            
            # Generate 2-4 reports per patient
            num_reports = random.randint(2, 4)
            
            for j in range(num_reports):
                report_template = random.choice(hospital_templates)
                hospital = random.choice(report_template["hospitals"])
                timestamp = int(time.time() * 1000000) + (i * 1000) + j
                
                # Generate condition-specific medical data
                medical_data = generate_condition_data(condition)
                
                if report_template["type"] == "Blood Test Report":
                    content = report_template["content"].format(
                        hospital=hospital,
                        patient_name=patient.full_name,
                        date=datetime.now().strftime("%Y-%m-%d"),
                        timestamp=timestamp,
                        age=random.randint(25, 70),
                        gender=random.choice(["Male", "Female"]),
                        **medical_data
                    )
                else:  # X-Ray Report
                    xray_data = generate_xray_data(condition)
                    content = report_template["content"].format(
                        hospital=hospital,
                        patient_name=patient.full_name,
                        date=datetime.now().strftime("%Y-%m-%d"),
                        timestamp=timestamp,
                        age=random.randint(25, 70),
                        gender=random.choice(["Male", "Female"]),
                        **xray_data
                    )
                
                # Save report file
                filename = f"{timestamp}_report_{patient.id}_{report_template['type'].lower().replace(' ', '_').replace('-', '_')}.txt"
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
                    ai_summary=f"{report_template['type']} for {patient.full_name}: {condition['condition']} - {condition['data']['remarks']}",
                    report_date=datetime.now() - timedelta(days=random.randint(1, 90))
                )
                
                db.add(medical_report)
                created_count += 1
        
        db.commit()
        
        print(f"✅ Generated {created_count} diverse medical reports")
        print(f"📁 Reports saved in: {uploads_dir.absolute()}")
        
        return created_count
        
    except Exception as e:
        print(f"❌ Error generating reports: {e}")
        db.rollback()
        return 0
    finally:
        db.close()

def generate_condition_data(condition):
    """Generate medical data based on specific condition"""
    base_data = {
        "hb": round(random.uniform(12.0, 15.0), 1),
        "rbc": round(random.uniform(4.0, 5.2), 1),
        "wbc": random.randint(5000, 9000),
        "platelets": random.randint(200000, 400000),
        "esr": random.randint(5, 20),
        "hematocrit": round(random.uniform(36, 46), 1),
        "fbs": random.randint(80, 100),
        "ppbs": random.randint(120, 160),
        "hba1c": round(random.uniform(4.8, 5.5), 1),
        "insulin": round(random.uniform(5, 20), 1),
        "cholesterol": random.randint(160, 200),
        "hdl": random.randint(40, 60),
        "ldl": random.randint(90, 130),
        "vldl": random.randint(15, 35),
        "triglycerides": random.randint(80, 150),
        "chol_hdl_ratio": round(random.uniform(3.0, 4.5), 1),
        "sgpt": random.randint(15, 40),
        "sgot": random.randint(20, 45),
        "alp": random.randint(50, 120),
        "ggt": random.randint(10, 45),
        "bilirubin_total": round(random.uniform(0.3, 1.2), 1),
        "bilirubin_direct": round(random.uniform(0.0, 0.3), 1),
        "total_protein": round(random.uniform(6.5, 8.0), 1),
        "albumin": round(random.uniform(3.5, 5.0), 1),
        "creatinine": round(random.uniform(0.7, 1.1), 1),
        "bun": random.randint(8, 18),
        "uric_acid": round(random.uniform(3.5, 6.5), 1),
        "sodium": random.randint(136, 145),
        "potassium": round(random.uniform(3.5, 5.1), 1),
        "chloride": random.randint(98, 107),
        "tsh": round(random.uniform(0.8, 3.5), 2),
        "t3": round(random.uniform(2.5, 4.0), 1),
        "t4": round(random.uniform(0.9, 1.7), 1),
        "vit_d": random.randint(25, 50),
        "vit_b12": random.randint(300, 700),
        "folate": round(random.uniform(3, 15), 1),
        "iron": random.randint(60, 150),
        "ferritin": random.randint(20, 120),
        "calcium": round(random.uniform(8.5, 10.5), 1),
        "phosphorus": round(random.uniform(2.5, 4.5), 1),
        "crp": round(random.uniform(0.5, 3.0), 1),
        "ra_factor": random.randint(5, 12),
        "troponin": round(random.uniform(0.01, 0.03), 3),
        "ckmb": round(random.uniform(1, 5), 1),
        "remarks": "All parameters within normal limits. Continue healthy lifestyle."
    }
    
    # Override with condition-specific values
    condition_data = condition["data"]
    for key, value_range in condition_data.items():
        if isinstance(value_range, tuple):
            if isinstance(value_range[0], float):
                base_data[key] = round(random.uniform(value_range[0], value_range[1]), 1)
            else:
                base_data[key] = random.randint(value_range[0], value_range[1])
        else:
            base_data[key] = value_range
    
    # Calculate derived values
    if "cholesterol" in base_data and "hdl" in base_data and "triglycerides" in base_data:
        base_data["ldl"] = base_data["cholesterol"] - base_data["hdl"] - (base_data["triglycerides"] // 5)
        base_data["chol_hdl_ratio"] = round(base_data["cholesterol"] / base_data["hdl"], 1)
    
    # Add recommendations based on condition
    recommendations = generate_recommendations(condition)
    base_data["recommendations"] = recommendations
    
    return base_data

def generate_xray_data(condition):
    """Generate X-ray specific data"""
    normal_findings = {
        "clinical_indication": random.choice([
            "Routine health checkup", "Cough and fever", "Chest pain evaluation",
            "Pre-operative assessment", "Follow-up examination"
        ]),
        "comparison": "No prior studies available for comparison",
        "right_lung_finding": "Clear lung fields with normal bronchovascular markings",
        "left_lung_finding": "Clear lung fields with normal bronchovascular markings", 
        "lung_volumes": "Normal lung volumes",
        "pleural_finding": "No pleural effusion or pneumothorax",
        "cardiac_finding": "Normal cardiac silhouette",
        "ctr": "0.45 (Normal)",
        "mediastinum_finding": "Normal mediastinal contours",
        "hilar_finding": "Normal hilar structures bilaterally",
        "rib_finding": "No rib fractures or abnormalities",
        "spine_finding": "Visualized spine appears normal",
        "soft_tissue_finding": "Normal soft tissue shadows",
        "impression": "Normal chest X-ray study",
        "recommendations": "No further imaging required. Clinical correlation advised."
    }
    
    # Modify findings based on condition
    if condition["condition"] in ["Chronic Kidney Disease", "Hypertension with Cardiovascular Risk"]:
        normal_findings["cardiac_finding"] = "Mild cardiomegaly noted"
        normal_findings["ctr"] = "0.52 (Mildly enlarged)"
        normal_findings["impression"] = "Mild cardiomegaly, likely related to hypertensive heart disease"
        normal_findings["recommendations"] = "Echocardiography recommended for further evaluation"
    
    return normal_findings

def generate_recommendations(condition):
    """Generate condition-specific recommendations"""
    recommendations_map = {
        "Type 2 Diabetes Mellitus": [
            "Strict glycemic control with medication adjustment",
            "Dietary counseling with diabetic diet plan",
            "Regular blood sugar monitoring",
            "HbA1c follow-up in 3 months",
            "Ophthalmology screening for diabetic retinopathy",
            "Nephrology consultation if creatinine elevated"
        ],
        "Hypertension with Cardiovascular Risk": [
            "Blood pressure monitoring and medication optimization",
            "Low sodium diet and regular exercise",
            "Lipid profile monitoring",
            "Echocardiography if indicated",
            "Cardiology consultation for risk stratification"
        ],
        "Hypothyroidism": [
            "Thyroid hormone replacement therapy",
            "TSH monitoring in 6-8 weeks",
            "Endocrinology consultation",
            "Lipid profile monitoring"
        ],
        "Iron Deficiency Anemia": [
            "Iron supplementation therapy",
            "Dietary counseling for iron-rich foods",
            "Investigation for source of iron loss",
            "Hemoglobin monitoring in 4-6 weeks"
        ],
        "Vitamin D Deficiency": [
            "High-dose Vitamin D supplementation",
            "Calcium supplementation if indicated",
            "Sun exposure and dietary counseling",
            "Repeat Vitamin D levels in 3 months"
        ]
    }
    
    condition_name = condition["condition"]
    if condition_name in recommendations_map:
        selected_recommendations = random.sample(
            recommendations_map[condition_name], 
            k=min(4, len(recommendations_map[condition_name]))
        )
        return "\n".join([f"• {rec}" for rec in selected_recommendations])
    else:
        return "• Continue current management\n• Regular follow-up as advised\n• Lifestyle modification counseling"

if __name__ == "__main__":
    print("🏥 Adding 20 More Diverse Indian Patients...")
    print("=" * 60)
    
    # Add patients
    patient_ids = add_diverse_indian_patients()
    
    if patient_ids:
        print(f"\n📊 Generating medical reports for {len(patient_ids)} patients...")
        report_count = generate_diverse_medical_reports()
        
        if report_count > 0:
            print(f"\n🎉 Successfully created {report_count} diverse medical reports!")
            print("\n📋 New patients include conditions like:")
            print("• Type 2 Diabetes Mellitus")
            print("• Hypertension with Cardiovascular Risk") 
            print("• Hypothyroidism")
            print("• Iron Deficiency Anemia")
            print("• Vitamin D Deficiency")
            print("• Fatty Liver Disease")
            print("• Chronic Kidney Disease")
            print("• PCOS")
            print("• Rheumatoid Arthritis")
            print("• Normal Healthy Individuals")
            
            print("\n🔍 Sample queries to try:")
            print("• 'How many patients do we have?'")
            print("• 'Which patients have diabetes?'")
            print("• 'Find patients with high cholesterol'")
            print("• 'Show me Ananya Banerjee reports'")
            print("• 'Which patients have thyroid problems?'")
            print("• 'Find patients with anemia'")
        else:
            print("\n❌ Failed to generate medical reports")
    else:
        print("\n❌ Failed to add patients")