from fastapi import FastAPI
from app.routes import patient_routes, consultation_notes_routes
from app.routes import doctor_routes
from app.routes import availability_routes
from app.routes import appointment_routes
from app.routes import audio_routes
from app.routes import note_chatbot_routes
from app.routes import appointment_chatbot_routes
from app.routes import message_routes
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat_routes
from app.routes import admin_routes

app = FastAPI(
    title="Doctor Appointment Booking API",
    description="Backend for AI-powered doctor booking system",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your routes here
app.include_router(patient_routes.router)
app.include_router(doctor_routes.router)
app.include_router(availability_routes.router)
app.include_router(appointment_routes.router)
app.include_router(audio_routes.router)
app.include_router(consultation_notes_routes.router)
app.include_router(message_routes.router)
app.include_router(chat_routes.router)
app.include_router(appointment_chatbot_routes.router, tags=["Appointment Chatbot"])
app.include_router(note_chatbot_routes.router, tags=["VoiceNote Chatbot"])
app.include_router(admin_routes.router)
app.router.redirect_slashes = False
