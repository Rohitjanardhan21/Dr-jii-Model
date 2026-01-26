from fastapi import FastAPI
import os

app = FastAPI()

@app.get("/")
def home():
    return {"message": "AI-Health Assistant Doctor Jii is Online!"}

@app.get("/predict")
def predict():
    # This is where your model logic will eventually go
    return {"status": "Model is ready for health queries"}

if __name__ == "__main__":
    import uvicorn
    # Cloud Run provides the PORT environment variable
    port = int(os.environ.get("PORT", 8081))
    uvicorn.run(app, host="0.0.0.0", port=port)
