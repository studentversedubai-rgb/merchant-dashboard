"""
CORS Configuration Update
Add merchant.studentverse.app to allowed origins
"""

from fastapi.middleware.cors import CORSMiddleware

# Update your main.py or app initialization file with this configuration

ALLOWED_ORIGINS = [
    "https://studentverse.app",
    "https://www.studentverse.app",
    "https://merchant.studentverse.app",  # NEW: Merchant validation app
    "http://localhost:3000",  # Development
    "http://localhost:5173",  # Vite dev server
]

# Add to your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)
