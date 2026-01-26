# How Patient Medical Report Search and System Features Work

## Overview
This document explains how the Dr. Jii Doctor Assistant system works, including patient search, medical report management, AI-powered analysis, duplicate detection, and all other features. The system uses natural language processing to understand doctor queries and provides intelligent responses with context awareness.

---

## Complete System Architecture

### Query Flow Overview
```
Doctor Query → Frontend → Backend API → Query Understanding → Intent Recognition → Action Handler → Response
```

---

## Step 1: Query Understanding (Frontend → Backend)
**Location:** `frontend/js/main.js` → `backend/api/doctor_routes.py`

1. Doctor types a query in the chat interface
2. Frontend sends query to: `POST /api/doctor/chat/query`
3. Query includes:
   - `query`: The text query
   - `mode`: "medical_report" or "medical_knowledge" (optional)
   - `last_patient_id`: Context from previous query (if available)
   - `last_patient_name`: Context from previous query (if available)
4. Backend receives query and processes it

### Context Tracking
**Location:** `frontend/js/main.js` (lines 323-330, 390-397)

The frontend maintains context about the last discussed patient:
- `lastPatientId`: Stores the ID of the last patient discussed
- `lastPatientName`: Stores the name of the last patient discussed
- This context is sent with each query to enable context-aware responses

---

## Step 2: Intent Recognition
**Location:** `backend/services/query_understanding_service.py`

The system uses **OpenAI GPT-3.5-turbo** to understand queries with fallback pattern matching.

### Complete Intent List

1. **`get_patient_report`**: Get medical report for a specific patient
   - Example: "What is the medical report of Mr. Rahul?" or "Do you have Mayank Ahmed medical report?"

2. **`count_reports`**: Count total reports in database
   - Example: "How many reports do we have in our database?"

3. **`list_reports`**: List all medical reports
   - Example: "List all reports" or "Show all medical reports"

4. **`get_all_patient_names`**: Get all patient names
   - Example: "What are the names of all my patients?"

5. **`search_patient`**: Search for a patient
   - Example: "Find patient John Doe"

6. **`analyze_patient`**: Analyze what's wrong with a patient
   - Example: "What is wrong with Rahul?"

7. **`analyze_medical_report`**: Get AI-powered medical analysis
   - Example: "Please provide me a medical analysis of this Mr. Rahul" or "Medical analysis of him"

8. **`find_patients_by_lab_value`**: Find patients by lab test abnormalities
   - Example: "What patient have less RBC?" or "Which patients have high WBC?"

9. **`upload_medical_reports`**: Upload medical reports
   - Example: "i want to upload medical reports" or "upload medical reports"

10. **`get_pending_tasks`**: Get pending tasks
    - Example: "Show pending tasks"

11. **`get_all_tasks`**: Get all tasks with filter options
    - Example: "Tell me all tasks"

12. **`create_task`**: Create a new task
    - Example: "I want to add a task"

13. **`search_task`**: Search for a specific task
    - Example: Task description or name

14. **`cleanup_reports`**: Remove invalid reports
    - Example: "cleanup invalid reports"

15. **`remove_duplicates`**: Remove duplicate medical reports
    - Example: "remove duplicates" or "delete duplicate reports"

16. **`summarize_report`**: Summarize a patient's report
    - Example: "Summarize Rahul's report"

17. **`suggest_prescription`**: Get prescription suggestions
    - Example: "What prescription can we give to John?"

### Intent Recognition Process

1. **Pre-check**: First checks for special patterns:
   - "all people/patients" → `list_reports`
   - "how many" + "report" → `count_reports`

2. **OpenAI Analysis**: Sends query to OpenAI GPT-3.5-turbo with system prompt that:
   - Extracts intent from the list above
   - Extracts patient name (if applicable)
   - Detects title (Mr., Mrs., Dr., etc.)
   - Extracts lab test and condition (for lab value queries)
   - Returns JSON: `{"intent": "...", "patient_name": "...", ...}`

3. **Fallback**: If OpenAI unavailable, uses regex patterns to extract:
   - Title (Mr., Mrs., Dr., etc.)
   - Patient name from patterns like: `Mr\.?\s+([A-Z][a-zA-Z\s]+)`
   - Lab tests and conditions

---

## Step 3: Multi-Level Patient Search
**Location:** `backend/api/doctor_routes.py` (lines 233-423)

When intent is `get_patient_report`, the system performs a **3-step search strategy**:

### STEP 1: Search WITH Title (if title present)

#### 1a. Exact Match with Title
```python
# Search for: "Mr. Suryansh Singh"
exact_patients = db.query(User).filter(
    User.full_name.ilike(f"%Mr. Suryansh Singh%")
).all()
```

#### 1b. Partial Match with Title (First Name Only)
```python
# Search for: "Mr. Suryansh" (if full name not found)
first_name_only = "Mr. Suryansh"
partial_patients = db.query(User).filter(
    User.full_name.ilike(f"%Mr. Suryansh%")
).all()
```

#### 1c. Search in Report Extracted Text with Title
```python
# Search through all medical reports' extracted_text
# Extract patient names from report content
# Match if extracted name contains "Mr. Suryansh Singh" or "Suryansh Singh"
```

### STEP 2: Fallback Search (Without Title)
If no results found WITH title, search WITHOUT title:

```python
# Search for: "Suryansh Singh" or "Suryansh" (without title)
fallback_patients = db.query(User).filter(
    (User.full_name.ilike(f"%Suryansh Singh%")) | 
    (User.username.ilike(f"%Suryansh Singh%"))
).all()

# Also search in report extracted_text without title
```

### STEP 3: Search Without Title (if no title provided)
If query has no title, search normally without title from the start.

---

## Step 4: Report Retrieval
**Location:** `backend/api/doctor_routes.py` (lines 369-373)

Once patients are found:
```python
# Get all patient IDs
patient_ids = [p.id for p in all_matching_patients]

# Query all reports for these patients
all_reports = db.query(MedicalReport).filter(
    MedicalReport.patient_id.in_(patient_ids)
).order_by(MedicalReport.report_date.desc()).all()
```

---

## Step 5: Response Formatting with Context Tracking
**Location:** `backend/api/doctor_routes.py` (lines 386-423)

The system:
1. Groups reports by patient
2. Formats response showing:
   - Patient name
   - Number of reports per patient
   - Report details (name, type, date)
3. **Stores context** for future queries:
   - `last_patient_id`: ID of the first matching patient
   - `last_patient_name`: Name of the first matching patient
4. Returns structured data:
   - `action: "show_report_cards"`: Signals frontend to display report cards
   - `reports`: Array of report objects with details
   - `patients`: Array of patient objects

### Report Cards Display
**Location:** `frontend/js/main.js` (lines 774-795)

When `action: "show_report_cards"` is received:
- Frontend creates visual report cards
- Each card shows: Patient name, Report type, Report date
- Cards are clickable and call `viewReportDetails(reportId)`

---

## Step 6: Report Viewing (New Tab)
**Location:** `frontend/js/main.js` (lines 796-807) and `backend/api/doctor_routes.py` (lines 1522-1560)

### Frontend: Click Handler
When a report card is clicked:
```javascript
async function viewReportDetails(reportId) {
    const fileUrl = `${baseURL}/api/doctor/reports/${reportId}/file`;
    window.open(fileUrl, '_blank');  // Opens in new browser tab
}
```

### Backend: File Serving Endpoint
**Endpoint:** `GET /api/doctor/reports/{report_id}/file`

**Location:** `backend/api/doctor_routes.py` (lines 1522-1560)

1. Retrieves report from database
2. Verifies file exists on disk
3. Determines media type (PDF, JPEG, PNG)
4. Returns `FileResponse` with:
   - `content_disposition_type="inline"`: Opens in browser instead of downloading
   - Proper media type headers
   - Original filename

**Result:** Original medical report file opens in a new browser tab (PDF viewer or image viewer)

---

## Step 7: Medical Analysis Flow
**Location:** `backend/api/doctor_routes.py` (lines 425-577)

### Complete Analysis Workflow

#### Step 7.1: Patient Identification
The system identifies the patient using three methods (in order):

1. **From Query**: If patient name mentioned in analysis query
   ```python
   if patient_name:
       # Search for patient by name
   ```

2. **From Context**: If no name, use last discussed patient
   ```python
   elif query.last_patient_id:
       # Use the last patient context from previous query
   ```

3. **Fallback**: Use most recent patient with reports
   ```python
   else:
       # Get the most recent patient with reports
   ```

#### Step 7.2: Report Retrieval
- Gets the latest medical report for the identified patient
- Uses `extracted_text` or `ai_summary` as content source

#### Step 7.3: OpenAI Analysis
**Location:** `backend/api/doctor_routes.py` (lines 489-541)

1. **System Prompt**: Instructs OpenAI to:
   - NEVER repeat raw report content
   - ONLY provide analysis and interpretation
   - Focus on issues, causes, and recommendations

2. **User Prompt**: Includes:
   - Patient name
   - Report type and date
   - Report content (for analysis)

3. **OpenAI Call**: Uses GPT-3.5-turbo with:
   - Temperature: 0.3 (focused analysis)
   - Max tokens: 1500

4. **Response Structure**:
   - **Identified Health Issues**: What problems can be identified
   - **Root Causes and Etiology**: Causes (directly/indirectly mentioned)
   - **Clinical Significance**: What findings mean
   - **Recommendations**: Follow-up actions needed
   - **Summary**: Overall assessment

#### Step 7.4: Response Formatting
- Shows analysis text (NO raw report content)
- Includes report card for viewing original file
- Message: "Click on any report card below to view full details"

---

## Step 8: Upload Flow with Duplicate Detection
**Location:** `backend/api/doctor_routes.py` (lines 1093-1242)

### Upload Process

#### Step 8.1: File Validation
- Validates file type: PDF, JPG, JPEG, PNG
- Reads file content into memory

#### Step 8.2: Duplicate Detection
**Location:** `backend/api/doctor_routes.py` (lines 1116-1168)

1. **Calculate File Hash**:
   ```python
   file_hash = calculate_file_hash(content)  # MD5 hash
   ```

2. **Check by Hash** (for reports with hash):
   ```python
   existing_report = db.query(MedicalReport).filter(
       MedicalReport.file_hash == file_hash
   ).first()
   ```

3. **Check Reports Without Hash** (for old reports):
   - Reads existing report files
   - Calculates their hash
   - Updates `file_hash` in database
   - Compares with uploaded file hash

4. **If Duplicate Found**:
   - Returns duplicate response with:
     - `duplicate: True`
     - Existing report details
     - `file_hash` for confirmation
   - Frontend shows Yes/No options

#### Step 8.3: Duplicate Confirmation
**Location:** `frontend/js/main.js` (lines 474-550) and `backend/api/doctor_routes.py` (lines 1245-1305)

**If User Clicks "Yes" (Upload as Updated)**:
- Frontend calls: `POST /api/doctor/reports/upload-confirm`
- Backend creates new report entry with:
  - Same `file_hash`
  - Same `file_path` (reuses existing file)
  - New `report_date` (current timestamp)
  - New database entry (updated version)

**If User Clicks "No" (Cancel)**:
- Upload is cancelled
- No new entry created

#### Step 8.4: Normal Upload (No Duplicate)
If no duplicate found:
1. Save file to disk
2. Extract text (PDF or OCR for images)
3. Extract patient name from text
4. Find or create patient
5. Create report record with `file_hash`
6. Return success response

---

## Step 9: Context Tracking System
**Location:** `frontend/js/main.js` (lines 323-330, 390-397) and `backend/api/doctor_routes.py`

### How Context Works

1. **Frontend Storage**:
   ```javascript
   let lastPatientId = null;
   let lastPatientName = null;
   ```

2. **Context Update**:
   - When response includes `last_patient_id`, frontend stores it
   - Also stores `last_patient_name`

3. **Context Usage**:
   - Sent with each query: `last_patient_id`, `last_patient_name`
   - Used by medical analysis when patient name not specified
   - Enables queries like "medical analysis of him" or "analysis of this person"

### Example Context Flow

**Query 1**: "What is the medical report of Mr. Rahul?"
- Response includes: `last_patient_id: 5, last_patient_name: "Rahul Patel"`
- Frontend stores this context

**Query 2**: "Please provide me medical analysis of him"
- Frontend sends: `last_patient_id: 5, last_patient_name: "Rahul Patel"`
- Backend uses context to identify patient
- Performs analysis on Mr. Rahul's report

---

## Key Functions

### `_extract_patient_name_from_text(text: str)`
**Location:** `backend/api/doctor_routes.py`

Extracts patient names from medical report text using regex patterns:
- `Name: Mr. Suryansh Singh`
- `Patient Name: Mrs. John Doe`
- `Mr. Suryansh Singh Age:`

### `calculate_file_hash(content: bytes) -> str`
**Location:** `backend/api/doctor_routes.py` (line 1088)

Calculates MD5 hash of file content for duplicate detection:
```python
def calculate_file_hash(content: bytes) -> str:
    return hashlib.md5(content).hexdigest()
```

### Patient Name Extraction Patterns
The system looks for patterns like:
- `Name\s*:\s*(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?)\s+([A-Z][a-zA-Z\s]+)`
- `([A-Z][a-z]+\s+[A-Z][a-z]+)\s+Age\s*:`

---

## Important Rules

1. **Title Requirement**: Patient name extraction **ONLY happens** if query contains a title (Mr., Mrs., Dr., etc.) in fallback mode
   - ✅ "Mr. Suryansh Singh" → Extracts "Suryansh Singh"
   - ✅ OpenAI can extract without title
   - ❌ Fallback pattern matching requires title

2. **Multi-Level Search**: Searches in this order:
   - Exact match with title (if title present)
   - Partial match (first name + title)
   - Fallback (name without title)
   - Report text content

3. **Case-Insensitive**: All searches use `ilike` (case-insensitive)

4. **Multiple Results**: Shows ALL matching patients and their reports

5. **Context Awareness**: System remembers last discussed patient for follow-up queries

6. **Duplicate Detection**: Based on file content hash, not filename

7. **Report Viewing**: Opens original file in new tab, not parsed content

---

## Example Flows

### Example 1: Patient Report Search
**Query:** "provide me the medical report of Mr. Suryansh Singh"

1. ✅ Pre-check: Not "all people" → Continue
2. ✅ OpenAI extracts: `{"intent": "get_patient_report", "patient_name": "Suryansh Singh"}`
3. ✅ Title detected: "Mr."
4. ✅ Search Level 1: Look for "Mr. Suryansh Singh" → Found 3 patients
5. ✅ Search Level 2: Look for "Mr. Suryansh" → Found 5 patients (includes the 3 from Level 1)
6. ✅ Get reports for all 5 patients
7. ✅ Display: "Found 5 matching patient(s) with 8 report(s):"
   - Shows report cards
   - Stores context: `last_patient_id: 5, last_patient_name: "Suryansh Singh"`
8. ✅ User clicks report card → Opens original file in new tab

### Example 2: Medical Analysis with Context
**Query 1:** "Can you please provide me Mr. Rahul medical report"
- System shows reports
- Stores context: `last_patient_id: 10, last_patient_name: "Rahul Patel"`

**Query 2:** "Please provide me a medical analysis of this Mr. Rahul"
- System uses patient name from query
- Retrieves latest report
- Calls OpenAI for analysis
- Shows analysis (no raw content)
- Includes report card

**Query 3:** "Please provide me medical analysis of him"
- System uses context: `last_patient_id: 10`
- Retrieves Mr. Rahul's latest report
- Performs analysis
- Shows results

### Example 3: Duplicate Detection
**Query:** "i want to upload medical reports"
- System shows upload section
- Doctor uploads `report.pdf`

**Upload Process:**
1. ✅ Calculate hash: `abc123...`
2. ✅ Check database: Hash exists → Duplicate found
3. ✅ Return: `{duplicate: True, existing_patient_name: "John Doe", ...}`
4. ✅ Frontend shows: "This medical report is already present in the database"
5. ✅ Shows Yes/No buttons

**If Doctor Clicks "Yes":**
- Frontend calls `/api/doctor/reports/upload-confirm`
- Backend creates new entry with same hash, new timestamp
- Success message shown

**If Doctor Clicks "No":**
- Upload cancelled
- No entry created

---

## Database Tables Used

### 1. **`users` table**: Stores patient information
   - `id`, `full_name`, `username`, `email`, `role`

### 2. **`medical_reports` table**: Stores medical reports
   - `id`, `patient_id`, `consultation_id`
   - `report_type`, `report_name`, `report_date`
   - `file_path`, `file_type`, `file_hash` (NEW: for duplicate detection)
   - `extracted_text`, `ai_summary`, `ai_key_findings`, `ai_abnormal_values`
   - `parsed_data` (JSON), `uploaded_at`

### 3. **`tasks` table**: Stores tasks
   - `id`, `title`, `description`, `status`, `priority`, `task_type`, `due_date`

---

## API Endpoints

### Chat & Queries
- `POST /api/doctor/chat/query` - Main chat query endpoint

### Reports
- `POST /api/doctor/reports/upload` - Upload single report (with duplicate detection)
- `POST /api/doctor/reports/upload-multiple` - Upload multiple reports
- `POST /api/doctor/reports/upload-confirm` - Confirm duplicate upload
- `GET /api/doctor/reports/{report_id}` - Get report details
- `GET /api/doctor/reports/{report_id}/file` - Get original report file (opens in browser)
- `DELETE /api/doctor/reports/cleanup` - Cleanup invalid reports
- `DELETE /api/doctor/reports/remove-duplicates` - Remove duplicate reports

### Tasks
- `POST /api/doctor/tasks` - Create task
- `GET /api/doctor/tasks/{task_id}` - Get task details

---

## Search Query Examples

```sql
-- Level 1: Exact with title
SELECT * FROM users WHERE full_name ILIKE '%Mr. Suryansh Singh%';

-- Level 2: Partial with title
SELECT * FROM users WHERE full_name ILIKE '%Mr. Suryansh%';

-- Level 3: Without title
SELECT * FROM users WHERE full_name ILIKE '%Suryansh Singh%' OR username ILIKE '%Suryansh Singh%';

-- Get reports
SELECT * FROM medical_reports WHERE patient_id IN (1, 2, 3, 4, 5) ORDER BY report_date DESC;

-- Check for duplicate by hash
SELECT * FROM medical_reports WHERE file_hash = 'abc123...';

-- Get reports without hash (for migration)
SELECT * FROM medical_reports WHERE file_hash IS NULL OR file_hash = '';
```

---

## Frontend Components

### Report Cards
**Location:** `frontend/js/main.js` (lines 774-795)
- Visual cards displaying report information
- Clickable: Opens original file in new tab
- Shows: Patient name, Report type, Report date

### Upload Section
**Location:** `frontend/js/main.js` (lines 195-328, 263-328)
- Drag and drop interface
- Supports single and multiple file uploads
- Shows duplicate warning with Yes/No options

### Context Management
**Location:** `frontend/js/main.js` (lines 323-330, 390-397)
- Tracks last discussed patient
- Sends context with each query
- Enables context-aware follow-up queries

---

## Key Features Summary

1. **Smart Patient Search**: Multi-level search with title handling
2. **Context Tracking**: Remembers last discussed patient
3. **Medical Analysis**: AI-powered analysis using OpenAI
4. **Duplicate Detection**: MD5 hash-based duplicate prevention
5. **Report Viewing**: Opens original files in new browser tabs
6. **Upload Confirmation**: Yes/No options for duplicate handling
7. **Report Cards**: Visual display of reports
8. **Multiple Intents**: 17+ different query types supported
9. **Fallback Systems**: Works even if OpenAI unavailable
10. **File Hash Migration**: Handles old reports without hash

---

## Technical Details

### File Hash Calculation
- Algorithm: MD5
- Purpose: Duplicate detection
- Storage: `file_hash` column in `medical_reports` table
- Migration: Old reports get hash calculated on first duplicate check

### Report File Serving
- Endpoint: `GET /api/doctor/reports/{report_id}/file`
- Response Type: `FileResponse` with `content_disposition_type="inline"`
- Result: Opens in browser (PDF viewer or image viewer)
- Media Types: application/pdf, image/jpeg, image/png

### Context Persistence
- Frontend: JavaScript variables (`lastPatientId`, `lastPatientName`)
- Backend: Included in query request
- Usage: Medical analysis, follow-up queries
- Scope: Per browser session

---

## Error Handling

### No Patient Found
- Returns message with patient name
- Shows upload section
- Allows doctor to upload report

### No Reports Found
- Returns message with patient name
- Shows upload section for that patient

### Duplicate Detected
- Shows duplicate warning
- Provides Yes/No options
- Handles confirmation or cancellation

### OpenAI Unavailable
- Falls back to pattern matching
- Medical analysis unavailable (shows error)
- Other features work normally

---

## Future Enhancements

The system is designed to be extensible. Potential additions:
- Report versioning
- Advanced search filters
- Report comparison
- Batch operations
- Export functionality
