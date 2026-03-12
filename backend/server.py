from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime, timezone, time, timedelta
import os
import uuid
from dotenv import load_dotenv

from security import RateLimitMiddleware
from chatflow_handler import chatflow_router

load_dotenv()

# MongoDB setup
mongo_url = os.getenv('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.getenv('DB_NAME')]

# Initialize App
app = FastAPI(title="BookEasy + Ai Blitz")

# CORS
cors_origins = os.getenv('CORS_ORIGINS', '*').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting
app.add_middleware(RateLimitMiddleware, calls=100, period=60)

api_router = APIRouter(prefix="/api")

# Models
class TimeSlot(BaseModel):
    hour: int
    minute: int
    available: bool = True

class Appointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    service_type: str
    appointment_date: str
    appointment_time: str
    duration: int = 60
    notes: Optional[str] = None
    status: str = "pending"
    business_id: str = "default"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BusinessSettings(BaseModel):
    business_id: str
    business_name: str = "Your Business"
    business_type: str = "salon"
    business_hours_start: str = "09:00"
    business_hours_end: str = "18:00"
    slot_duration: int = 30
    services: List[str] = Field(default_factory=lambda: ["General Consultation"])

# API Endpoints
@api_router.post("/appointment")
async def create_appointment(appointment: Appointment):
    """Create a new appointment"""
    # Check if slot is available
    existing = await db.appointments.find_one({
        "appointment_date": appointment.appointment_date,
        "appointment_time": appointment.appointment_time,
        "status": {"$nin": ["cancelled"]}
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Time slot not available")
    
    await db.appointments.insert_one(appointment.model_dump())
    
    return {
        "success": True,
        "message": "Appointment booked successfully!",
        "appointment_id": appointment.id
    }

@api_router.get("/appointments/{business_id}")
async def get_appointments(business_id: str, date: Optional[str] = None):
    """Get appointments for a business"""
    query = {"business_id": business_id}
    if date:
        query["appointment_date"] = date
    
    appointments = await db.appointments.find(query, {"_id": 0}).sort("appointment_date", 1).to_list(500)
    return appointments

@api_router.patch("/appointment/{appointment_id}")
async def update_appointment_status(appointment_id: str, status: str):
    """Update appointment status"""
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {"success": True, "message": f"Status updated to {status}"}

@api_router.get("/available-slots/{business_id}")
async def get_available_slots(business_id: str, date: str):
    """Get available time slots for a date"""
    settings = await db.business_settings.find_one({"business_id": business_id}, {"_id": 0})
    
    if not settings:
        settings = BusinessSettings(business_id=business_id).model_dump()
        await db.business_settings.insert_one(settings)
    
    # Get booked appointments
    booked_appointments = await db.appointments.find({
        "business_id": business_id,
        "appointment_date": date,
        "status": {"$nin": ["cancelled"]}
    }, {"appointment_time": 1}).to_list(100)
    
    booked_times = {apt["appointment_time"] for apt in booked_appointments}
    
    # Generate slots
    start_hour, start_minute = map(int, settings["business_hours_start"].split(":"))
    end_hour, end_minute = map(int, settings["business_hours_end"].split(":"))
    slot_duration = settings.get("slot_duration", 30)
    
    slots = []
    current_time = datetime.strptime(f"{start_hour}:{start_minute}", "%H:%M")
    end_time = datetime.strptime(f"{end_hour}:{end_minute}", "%H:%M")
    
    while current_time < end_time:
        time_str = current_time.strftime("%H:%M")
        slots.append({
            "time": time_str,
            "available": time_str not in booked_times
        })
        current_time += timedelta(minutes=slot_duration)
    
    return slots

@api_router.get("/business-settings/{business_id}")
async def get_business_settings(business_id: str):
    """Get business settings"""
    settings = await db.business_settings.find_one({"business_id": business_id}, {"_id": 0})
    
    if not settings:
        settings = BusinessSettings(business_id=business_id).model_dump()
        await db.business_settings.insert_one(settings)
    
    return settings

@api_router.put("/business-settings/{business_id}")
async def update_business_settings(business_id: str, settings: BusinessSettings):
    """Update business settings"""
    settings_dict = settings.model_dump()
    settings_dict["business_id"] = business_id
    
    await db.business_settings.update_one(
        {"business_id": business_id},
        {"$set": settings_dict},
        upsert=True
    )
    
    return {"success": True, "message": "Settings updated"}

@api_router.get("/analytics/{business_id}")
async def get_analytics(business_id: str):
    """Get booking analytics"""
    all_appointments = await db.appointments.find({"business_id": business_id}, {"service_type": 1}).to_list(1000)
    
    service_counts = {}
    for apt in all_appointments:
        service = apt.get("service_type", "Unknown")
        service_counts[service] = service_counts.get(service, 0) + 1
    
    return {
        "total_bookings": len(all_appointments),
        "service_breakdown": service_counts
    }

# Include routers
app.include_router(api_router)
app.include_router(chatflow_router)

@app.get("/")
async def root():
    return {"message": "BookEasy + Ai Blitz API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
