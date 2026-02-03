# 🏥 Dr. Jii Medical Assistant

A comprehensive AI-powered medical assistant platform with React frontend and FastAPI backend.

## 🚀 Quick Start

### **Option 1: Full Stack (Recommended)**
```bash
# Run the complete setup
START_FULL_PROJECT.bat
```

### **Option 2: Manual Setup**
```bash
# 1. Install Python dependencies
.venv\Scripts\activate
pip install -r requirements.txt

# 2. Build React frontend
cd frontend
npm install
npm run build
cd ..

# 3. Start backend server
python backend/main.py
```

## 📱 **Access Points**
- **Frontend**: http://localhost:8000/frontend/
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🎯 **Features**
- ✅ **Modern React Frontend** with chat interface
- ✅ **84 PDF Medical Reports** ready to view and download
- ✅ **AI-Powered Chat** with OpenAI integration
- ✅ **Patient Management** with search and filtering
- ✅ **Medical Knowledge Base** for healthcare queries
- ✅ **Task Management** system for medical workflows
- ✅ **Responsive Design** works on desktop and mobile

## 🧪 **Test Queries**
- "How many patients do we have?"
- "Show me medical reports for Priya Sharma"
- "What are the latest blood test results?"
- "Give me a summary of all reports"
- "Show me all PDF reports"

## 🔧 **Development**

### **Frontend Development**
```bash
cd frontend
npm run dev  # Start Vite dev server
```

### **Backend Development**
```bash
.venv\Scripts\activate
python backend/main.py  # Start FastAPI server
```

## 🚀 **Deployment**

### **Render Deployment**
1. Push code to GitHub
2. Connect repository to Render
3. Use the included `render.yaml` configuration
4. Set `OPENAI_API_KEY` environment variable

### **Local Production Build**
```bash
build-frontend.bat  # Build React app
python backend/main.py  # Serve production build
```

## 📊 **Database**
- **40 Patients** with realistic Indian names
- **84 Medical Reports** in PDF format
- **Sample Tasks** and consultations
- **SQLite database** with comprehensive medical data

## 🔑 **Environment Variables**
```env
PORT=8000
OPENAI_API_KEY=your_openai_api_key_here
SECRET_KEY=your_secret_key
ENVIRONMENT=development
```

## 🏗️ **Architecture**
```
Dr-jii-Model/
├── backend/           # FastAPI backend
│   ├── api/          # API routes
│   ├── models.py     # Database models
│   ├── services/     # Business logic
│   └── main.py       # Application entry
├── frontend/         # React frontend
│   ├── src/         # React components
│   ├── dist/        # Built files (auto-generated)
│   └── package.json # Dependencies
├── uploads/         # Medical report files
├── drjii.db        # SQLite database
└── render.yaml     # Deployment config
```

## 🎉 **What's New**
- **Modern React UI** with chat interface
- **Real-time messaging** with typing indicators
- **PDF report cards** with inline viewing
- **Responsive design** for all devices
- **Auto-detecting API URLs** for deployment
- **Chat history** with localStorage persistence

---

**Dr. Jii Medical Assistant** - Bringing AI to Healthcare 🏥✨