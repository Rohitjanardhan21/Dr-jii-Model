# Dr. Jii Doctor Assistant - Complete Features List

## 🎯 Overview
Dr. Jii is an AI-powered medical assistant platform that helps doctors manage patient medical reports, analyze reports, and access medical knowledge through a natural language chat interface.

---

## 📋 Core Features

### 1. **Medical Report Management**

#### 1.1 Upload Medical Reports
**How to use:**
- Type: `"i want to upload medical reports"` or `"upload medical reports"`
- Or use the upload section that appears when needed
- Drag and drop files or click to browse
- Supports: PDF, JPG, JPEG, PNG files
- Can upload single or multiple files at once

**Features:**
- Automatic patient name extraction from reports
- Automatic patient creation if not exists
- Text extraction from PDFs and images (OCR)
- Duplicate detection (see below)

#### 1.2 View Medical Reports
**How to use:**
- Type: `"What is the medical report of [patient name]?"` or `"Do you have [patient name] medical report?"`
- Example: `"What is the medical report of Mr. Rahul?"`
- Reports appear as clickable cards
- Click on any report card to open the original file in a new browser tab

**Features:**
- Smart patient name matching (handles titles like Mr., Mrs., Dr.)
- Shows all reports for matching patients
- Original file opens in browser (PDF viewer or image viewer)

#### 1.3 List All Reports
**How to use:**
- Type: `"List all reports"` or `"Show all reports"` or `"Provide me the medical report of all people"`
- Displays all medical reports in the database as cards

#### 1.4 Count Reports
**How to use:**
- Type: `"How many reports do we have in our database?"` or `"How many medical reports?"`
- Returns total count of reports

---

### 2. **Patient Management**

#### 2.1 Get All Patient Names
**How to use:**
- Type: `"What are the names of all my patients?"` or `"Tell me the name of patients"` or `"List patient names"`
- Shows all unique patient names from the database

#### 2.2 Search Patient
**How to use:**
- Type: `"Find patient [name]"` or `"Search patient [name]"`
- Example: `"Find patient John Doe"`
- Shows patient details and information

#### 2.3 Analyze Patient Health
**How to use:**
- Type: `"What is wrong with [patient name]?"` or `"What's the problem with [patient name]?"`
- Example: `"What is wrong with Rahul?"`
- Analyzes patient's reports and identifies health issues

---

### 3. **Medical Report Analysis (AI-Powered)**

#### 3.1 Medical Analysis
**How to use:**
- First, ask for a patient's report: `"Can you please provide me Mr. Rahul medical report"`
- Then ask: `"Please provide me a medical analysis of this Mr. Rahul"` or `"Please provide me medical analysis of him"` or `"Medical analysis of this person"`
- The system uses OpenAI to analyze the report

**What it provides:**
- **Identified Health Issues**: What problems can be identified
- **Root Causes and Etiology**: Causes of issues (directly/indirectly mentioned)
- **Clinical Significance**: What findings mean for patient health
- **Recommendations**: Follow-up actions, tests, monitoring needed
- **Summary**: Overall health assessment

**Note:** The analysis shows only the interpretation, not the raw report content. Click the report card to view the original file.

#### 3.2 Report Summary
**How to use:**
- Type: `"Summarize [patient name]'s report"` or `"Summary of [patient name]"`
- Shows AI-generated summary of the report

#### 3.3 Prescription Suggestions
**How to use:**
- Type: `"What prescription can we give to [patient name]?"` or `"Suggest prescription for [patient name]"`
- Uses OpenAI to suggest medications based on report findings

---

### 4. **Lab Value Analysis**

#### 4.1 Find Patients by Lab Values
**How to use:**
- Type: `"What patient have less RBC?"` or `"Which patients have high WBC?"` or `"Find patients with low hemoglobin"`
- Examples:
  - `"What patient have less RBC?"`
  - `"Which patients have high WBC?"`
  - `"Find patients with low platelet count"`
- Searches through all reports for abnormal lab values

**Supported Lab Tests:**
- RBC (Red Blood Cells)
- WBC (White Blood Cells)
- Hemoglobin
- Platelets
- Glucose
- Creatinine
- Cholesterol
- And more

**Conditions:**
- Low / Less / Decreased / Below
- High / More / Increased / Elevated / Above

---

### 5. **Duplicate Detection & Management**

#### 5.1 Automatic Duplicate Detection
**How it works:**
- When uploading a report, system calculates MD5 hash of file content
- Checks if identical file already exists
- If duplicate found, shows warning with options

**When duplicate detected:**
- Message: "This medical report is already present in the database"
- Shows existing report details (patient name, date)
- Two options:
  - **✅ Yes, Upload as Updated Report**: Saves as new entry with updated timestamp
  - **❌ No, Cancel Upload**: Cancels the upload

#### 5.2 Remove Duplicates
**How to use:**
- Type: `"remove duplicates"` or `"delete duplicate reports"` or `"cleanup duplicates"`
- Removes duplicate reports from database
- Keeps the most recent report for each duplicate group
- Shows count of removed duplicates

---

### 6. **Task Management**

#### 6.1 View Tasks
**How to use:**
- `"Show pending tasks"` or `"Tell me all pending tasks"` - Shows only pending tasks
- `"Tell me all tasks"` or `"What tasks do I have?"` - Shows all tasks with filter options
- Tasks displayed as cards with details

**Task Filter Options:**
- 📋 Pending Tasks
- ✅ Completed Tasks
- 📊 All Tasks

#### 6.2 Create Task
**How to use:**
- Type: `"I want to add a task"` or `"Create a task"`
- System prompts for task details
- Fill in the form that appears

#### 6.3 Search Task
**How to use:**
- Type task description or name
- Example: `"someone have to check today"`
- Searches tasks by title or description

---

### 7. **Medical Knowledge Base**

#### 7.1 General Medical Information
**How to use:**
- Click the **"Medical Knowledge"** button (📚) at the bottom
- Ask medical questions like:
  - `"What are the latest dengue treatment guidelines?"`
  - `"Tell me about diabetes management"`
  - `"What is hypertension?"`
- Uses OpenAI for real-time medical knowledge
- Falls back to knowledge base if OpenAI unavailable

**Topics covered:**
- Disease information
- Treatment guidelines
- Medical procedures
- Latest medical news and research

---

### 8. **Database Cleanup**

#### 8.1 Cleanup Invalid Reports
**How to use:**
- Type: `"cleanup invalid reports"` or `"remove unknown patient reports"` or `"delete invalid reports"`
- Removes reports with:
  - No patient ID
  - Invalid patient data
  - Missing extracted text and file
- Shows count of deleted reports

---

## 🎨 User Interface Features

### Chat Interface
- **Natural Language Processing**: Ask questions in plain English
- **Mode Selection**: 
  - Medical Report Mode (default) - For patient reports and analysis
  - Medical Knowledge Mode - For general medical information
- **Report Cards**: Visual cards showing report details
- **Task Cards**: Visual cards showing task information
- **Drag & Drop Upload**: Easy file upload interface

### Report Cards
- Click to view original file in new tab
- Shows: Patient name, Report type, Report date
- Opens PDF/images directly in browser

---

## 🔧 Technical Features

### Smart Patient Name Matching
- Handles titles: Mr., Mrs., Ms., Dr., Miss, Master
- Fuzzy matching for name variations
- Searches in:
  - User database
  - Extracted text from reports
  - Multiple matching strategies

### File Processing
- **PDF Text Extraction**: Extracts text from PDF files
- **Image OCR**: Extracts text from images (JPG, PNG)
- **Automatic Patient Creation**: Creates patient records from report data

### AI Integration
- **OpenAI GPT-3.5-turbo**: For query understanding and medical analysis
- **Fallback Systems**: Works even if OpenAI unavailable
- **Medical Knowledge Service**: Real-time medical information

---

## 📝 Example Queries

### Report Queries
- `"How many reports do we have in our database?"`
- `"What is the medical report of Mr. Rahul?"`
- `"Do you have Mayank Ahmed medical report?"`
- `"List all reports"`
- `"What are the names of all my patients?"`

### Analysis Queries
- `"Please provide me a medical analysis of this Mr. Rahul"`
- `"Medical analysis of him"`
- `"What is wrong with Rahul?"`
- `"Summarize Mayank's report"`

### Lab Value Queries
- `"What patient have less RBC?"`
- `"Which patients have high WBC?"`
- `"Find patients with low hemoglobin"`

### Task Queries
- `"Show pending tasks"`
- `"Tell me all tasks"`
- `"I want to add a task"`

### Upload Queries
- `"i want to upload medical reports"`
- `"upload medical reports"`

### Cleanup Queries
- `"remove duplicates"`
- `"cleanup invalid reports"`

---

## 🚀 Getting Started

1. **Start the server**: Run `python backend/main.py`
2. **Open browser**: Navigate to `http://localhost:8000/frontend/index.html`
3. **Start chatting**: Type your questions in the chat box
4. **Upload reports**: Use the upload section or ask to upload reports

---

## ⚙️ Configuration

### Required Setup
- **OpenAI API Key**: Set in `.env` file as `OPENAI_API_KEY` for full functionality
- **Database**: SQLite database (auto-created)
- **File Storage**: Reports stored in `uploads/reports/` directory

### Optional Features
- Medical Knowledge mode works with or without OpenAI
- Query understanding has fallback pattern matching
- All features work offline except AI analysis

---

## 📌 Notes

- **Patient Names**: Use titles (Mr., Mrs., etc.) for better matching
- **File Formats**: Supports PDF, JPG, JPEG, PNG
- **Duplicate Detection**: Based on file content, not filename
- **Report Viewing**: Click report cards to open original files
- **Analysis**: Shows interpretation only, not raw report content

---

## 🆘 Help

If you're unsure what to ask, type any question and the system will suggest available commands.

**Common Help Query**: Just type anything and the bot will show available options.

