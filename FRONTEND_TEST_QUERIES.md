# 🏥 Dr. Jii Frontend Test Queries

## 🚀 Open Frontend
**URL**: http://localhost:8000/frontend/index.html

## 🔐 Login Credentials
- **Username**: `suryanshDr`
- **Password**: `surudr`

---

## 📋 Test Queries for Medical Reports Mode

### 1. Patient Count & Overview
```
How many patients do we have?
```
**Expected**: "We have **13** patients registered in the system."

### 2. Indian Patient Information
```
Show me information about Rajesh Kumar
```
**Expected**: Patient details and available reports

```
Tell me about Priya Sharma
```
**Expected**: Patient information

```
Find patient Amit Patel
```
**Expected**: Patient search results

### 3. Medical Report Summaries
```
Summarize Rajesh Kumar's latest report
```
**Expected**: AI summary of the most recent medical report

```
Show me Priya Sharma's blood test results
```
**Expected**: Blood test report details

```
What are Amit Patel's recent medical findings?
```
**Expected**: Recent report summaries

### 4. Lab Value Searches
```
Which patients have high cholesterol?
```
**Expected**: List of patients with cholesterol > 200 mg/dL

```
Find patients with diabetes
```
**Expected**: Patients with high blood sugar or HbA1c

```
Show patients with low hemoglobin
```
**Expected**: Patients with Hb < 12 g/dL

```
Which patients have high blood pressure indicators?
```
**Expected**: Patients with cardiovascular risk factors

### 5. Report Type Queries
```
Show me all blood test reports
```
**Expected**: List of blood test reports from all patients

```
Find ECG reports from this month
```
**Expected**: Recent ECG reports

```
Show X-ray reports
```
**Expected**: Available X-ray reports

### 6. Specific Medical Conditions
```
Find patients with thyroid problems
```
**Expected**: Patients with abnormal TSH levels

```
Which patients have kidney issues?
```
**Expected**: Patients with high creatinine or BUN

```
Show patients with liver function abnormalities
```
**Expected**: Patients with elevated SGPT/SGOT

---

## 🧠 Test Queries for Medical Knowledge Mode

### 1. Disease Information
```
What are the symptoms of diabetes?
```
**Expected**: Comprehensive diabetes symptoms list

```
Tell me about hypertension treatment
```
**Expected**: Blood pressure management information

```
What causes thyroid disorders?
```
**Expected**: Thyroid condition causes and types

### 2. Medication Information
```
What are the side effects of metformin?
```
**Expected**: Metformin side effects and precautions

```
Tell me about blood pressure medications
```
**Expected**: Antihypertensive drug classes

```
What medications treat diabetes?
```
**Expected**: Diabetes medication options

### 3. Diagnostic Information
```
How to interpret blood test results?
```
**Expected**: Blood test interpretation guide

```
What do ECG abnormalities mean?
```
**Expected**: ECG interpretation information

```
How to read chest X-rays?
```
**Expected**: Chest X-ray reading guide

### 4. Emergency Medicine
```
What are signs of heart attack?
```
**Expected**: Cardiac emergency symptoms

```
How to recognize stroke symptoms?
```
**Expected**: Stroke warning signs

```
What are diabetic emergency signs?
```
**Expected**: Diabetic ketoacidosis and hypoglycemia signs

---

## 🎯 Expected User Experience

### Login Flow
1. ✅ Login page loads properly
2. ✅ Enter credentials: `suryanshDr` / `surudr`
3. ✅ Successful login redirects to dashboard
4. ✅ Welcome message shows "Dr. Suryansh Singh"

### Chat Interface
1. ✅ Two modes visible: "Medical Reports" and "Medical Knowledge"
2. ✅ Mode switching works smoothly
3. ✅ Chat input accepts text
4. ✅ Send button is functional
5. ✅ Loading indicators appear during processing

### Medical Reports Mode Results
1. ✅ Patient count returns correct number (13)
2. ✅ Patient searches find Indian patients by name
3. ✅ Report summaries show actual medical data
4. ✅ Lab value searches return relevant patients
5. ✅ Medical condition queries work with real data

### Medical Knowledge Mode Results
1. ✅ Disease queries return comprehensive information
2. ✅ Medication queries provide drug information
3. ✅ Diagnostic queries give interpretation help
4. ✅ Emergency queries show urgent care info
5. ✅ Confidence levels and related topics appear

### UI/UX Validation
1. ✅ No JavaScript errors in console (F12)
2. ✅ Responsive design works on different screen sizes
3. ✅ Chat history is maintained during session
4. ✅ Error messages are user-friendly
5. ✅ Loading states provide good user feedback

---

## 🐛 Troubleshooting

### If Patient Queries Don't Work:
- Make sure you're in "Medical Reports" mode
- Check that patient names are spelled correctly
- Try variations: "Rajesh Kumar", "rajesh", "Kumar"

### If Medical Knowledge Queries Are Slow:
- OpenAI API calls can take 5-10 seconds
- Look for loading indicators
- Check browser console for API errors

### If No Results Appear:
- Verify backend server is running on port 8000
- Check browser network tab for failed requests
- Ensure database has patient and report data

---

## ✅ Success Criteria

**Your frontend is working perfectly if:**
- [ ] Login works with doctor credentials
- [ ] Patient count shows 13 patients
- [ ] Indian patient names are searchable
- [ ] Medical reports contain realistic Indian hospital data
- [ ] Lab values can be queried (cholesterol, diabetes, etc.)
- [ ] Medical knowledge queries return informative responses
- [ ] UI is responsive and error-free
- [ ] Chat history is maintained
- [ ] Both modes work seamlessly

**🎉 Once all tests pass, your Dr. Jii Medical Assistant is production-ready!**