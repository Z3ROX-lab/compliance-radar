from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Compliance Radar API!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/audit")
def run_audit():
    return {
        "status": "success",
        "data": {
            "environment": "Test Environment",
            "conformity_score": 0.9,
            "misconfigurations": [
                {
                    "id": "TEST_001",
                    "description": "Test misconfiguration",
                    "severity": "low",
                    "remediation": "Fix this issue"
                }
            ]
        }
    }
