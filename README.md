# Dr. Jii - Medical Assistant

AI-powered medical assistant for doctors and healthcare professionals.

## Quick Start

1. **Local Development:**
   ```bash
   # Install dependencies
   pip install -r requirements.txt
   
   # Run the application
   python backend/main.py
   ```
   Access: http://localhost:8000

2. **Deploy to Render:**
   - Connect this repository to Render
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python backend/main.py`
   - Add environment variables: `OPENAI_API_KEY`, `SECRET_KEY`

3. **Deploy Frontend to Cloudflare Pages:**
   - Upload the `frontend/` folder to Cloudflare Pages
   - Update API URLs to point to your backend

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:
- `OPENAI_API_KEY`: Your OpenAI API key
- `SECRET_KEY`: Random secret key for JWT tokens

## Features

- Patient management
- Medical report analysis
- AI-powered medical knowledge queries
- Prescription management
- Emergency triage detection