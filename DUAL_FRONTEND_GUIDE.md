# 🏥 Dr. Jii Dual Frontend System

Dr. Jii now features **two complete frontend interfaces** for different use cases.

## 🎯 **Two Frontends Available:**

### **1. Chat Frontend** (`/frontend/`)
**Technology**: React + Vite  
**Purpose**: Simple AI medical chat interface  
**Best For**: Quick medical queries, patient report searches

**Features**:
- 💬 Real-time AI chat interface
- 📄 PDF medical report viewing
- 🔍 Patient search functionality
- 📊 Report cards with download links
- 🎨 Clean, minimal design

**Access**: `http://localhost:8000/frontend/`

---

### **2. Expert Dashboard** (`/expert/`)
**Technology**: React + Create React App + Redux + Material-UI  
**Purpose**: Comprehensive medical management system  
**Best For**: Complete hospital/clinic management

**Features**:
- 👨‍⚕️ Doctor management
- 👥 Patient management
- 📅 Appointment scheduling
- 💊 Prescription management
- 📋 Invoice generation
- 💰 Payment tracking
- 📊 Analytics dashboard
- 💬 Chat system
- 🏥 Facility management
- 📱 ABDM integration
- 🔔 Notifications
- ⚙️ Settings & configuration

**Access**: `http://localhost:8000/expert/`

---

## 🚀 **Quick Start**

### **Option 1: One-Click Setup**
```bash
START_DUAL_FRONTEND.bat
```

### **Option 2: Manual Setup**
```bash
# 1. Install Python dependencies
.venv\Scripts\activate
pip install -r requirements.txt

# 2. Build Chat Frontend
cd frontend
npm install
npm run build
cd ..

# 3. Build Expert Dashboard
cd frontend-expert
npm install
npm run build
cd ..

# 4. Start server
python backend/main.py
```

---

## 📱 **Access Points**

After starting the server:

| Interface | URL | Description |
|-----------|-----|-------------|
| **Root** | `http://localhost:8000/` | Redirects to Expert Dashboard |
| **Expert Dashboard** | `http://localhost:8000/expert/` | Full medical management system |
| **Chat Frontend** | `http://localhost:8000/frontend/` | Simple AI chat interface |
| **API Documentation** | `http://localhost:8000/docs` | FastAPI Swagger docs |
| **Health Check** | `http://localhost:8000/health` | Server status |

---

## 🔧 **Development**

### **Chat Frontend Development**
```bash
cd frontend
npm run dev  # Runs on http://localhost:5173
```

### **Expert Dashboard Development**
```bash
cd frontend-expert
npm start  # Runs on http://localhost:3000
```

### **Backend Development**
```bash
.venv\Scripts\activate
python backend/main.py  # Runs on http://localhost:8000
```

---

## 🏗️ **Architecture**

```
Dr-jii-Model/
├── backend/                    # FastAPI backend
│   ├── api/                   # API routes
│   ├── models.py              # Database models
│   ├── services/              # Business logic
│   └── main.py                # Serves both frontends
│
├── frontend/                   # Chat Frontend (React + Vite)
│   ├── src/                   # React components
│   ├── dist/                  # Built files
│   └── package.json
│
├── frontend-expert/            # Expert Dashboard (React + CRA)
│   ├── src/                   # React components
│   ├── build/                 # Built files
│   └── package.json
│
├── uploads/                    # Medical report files
├── drjii.db                   # SQLite database
└── render.yaml                # Deployment config
```

---

## 🚀 **Deployment**

### **Render Deployment**
The `render.yaml` is configured to build both frontends automatically:

```yaml
buildCommand: "pip install -r requirements.txt && 
               cd frontend && npm install && npm run build && 
               cd ../frontend-expert && npm install && npm run build && 
               cd .."
```

### **Production URLs**
- **Expert Dashboard**: `https://your-app.onrender.com/expert/`
- **Chat Frontend**: `https://your-app.onrender.com/frontend/`
- **API**: `https://your-app.onrender.com/docs`

---

## 🎯 **Use Cases**

### **Use Chat Frontend When:**
- ✅ Quick medical queries
- ✅ Searching patient reports
- ✅ Viewing PDF medical documents
- ✅ Simple AI interactions

### **Use Expert Dashboard When:**
- ✅ Managing appointments
- ✅ Creating prescriptions
- ✅ Generating invoices
- ✅ Tracking payments
- ✅ Viewing analytics
- ✅ Managing doctors/patients
- ✅ Complete clinic operations

---

## 📊 **Database**

Both frontends share the same backend and database:
- **40 Patients** with realistic medical data
- **84 Medical Reports** in PDF format
- **Sample Appointments** and consultations
- **Tasks** and notifications
- **SQLite database** with comprehensive data

---

## 🔑 **Environment Variables**

```env
PORT=8000
OPENAI_API_KEY=your_openai_api_key_here
SECRET_KEY=your_secret_key
ENVIRONMENT=development
```

---

## 🎉 **Benefits of Dual Frontend**

1. **Flexibility**: Choose the right interface for the task
2. **Scalability**: Add more frontends as needed
3. **Separation**: Independent development and deployment
4. **User Choice**: Different users can use different interfaces
5. **Feature Rich**: Comprehensive medical management + Simple chat

---

**Dr. Jii Medical Assistant** - Two Interfaces, One Powerful Backend 🏥✨