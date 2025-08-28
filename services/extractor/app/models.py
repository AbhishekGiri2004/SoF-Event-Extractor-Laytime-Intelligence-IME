from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class EventType(str, Enum):
    ARRIVAL = "arrival"
    DEPARTURE = "departure"
    LOADING = "loading"
    DISCHARGING = "discharging"
    SHIFTING = "shifting"
    ANCHORAGE = "anchorage"
    PILOT_ONBOARD = "pilot_onboard"
    PILOT_OFFBOARD = "pilot_offboard"
    BERTHING = "berthing"
    UNBERTHING = "unberthing"
    OTHER = "other"

class Event(BaseModel):
    name: str = Field(..., description="Event name")
    start_time: str = Field(..., description="Event start time")
    end_time: str = Field(..., description="Event end time")
    event_type: EventType = Field(EventType.OTHER, description="Type of event")
    location: Optional[str] = Field(None, description="Event location")
    description: Optional[str] = Field(None, description="Event description")
    confidence: float = Field(0.8, description="AI confidence score")

class VesselInfo(BaseModel):
    vessel_name: str = Field(..., description="Vessel name")
    port: str = Field(..., description="Port name")
    cargo: str = Field(..., description="Cargo type")
    operation: str = Field("Discharge", description="Operation type")
    voyage_from: Optional[str] = Field(None, description="Voyage from")
    voyage_to: Optional[str] = Field(None, description="Voyage to")
    demurrage_rate: Optional[float] = Field(None, description="Demurrage rate per day")
    dispatch_rate: Optional[float] = Field(None, description="Dispatch rate per day")
    load_rate: Optional[float] = Field(None, description="Load rate per day")
    cargo_quantity: Optional[float] = Field(None, description="Cargo quantity in MT")

class ExtractedData(BaseModel):
    filename: str = Field(..., description="Original filename")
    vessel: str = Field(..., description="Vessel name")
    port: str = Field(..., description="Port name")
    cargo: str = Field(..., description="Cargo type")
    operation: str = Field("Discharge", description="Operation type")
    voyage_from: str = Field("Unknown", description="Voyage from")
    voyage_to: str = Field("Unknown", description="Voyage to")
    events: List[Event] = Field(default_factory=list, description="Extracted events")
    extracted_at: str = Field(..., description="Extraction timestamp")
    confidence_score: float = Field(0.8, description="Overall confidence score")
    raw_text: Optional[str] = Field(None, description="Raw extracted text")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ProcessingJob(BaseModel):
    job_id: str = Field(..., description="Unique job identifier")
    filename: str = Field(..., description="Original filename")
    status: ProcessingStatus = Field(ProcessingStatus.PENDING, description="Processing status")
    progress: float = Field(0.0, description="Processing progress (0-100)")
    created_at: datetime = Field(default_factory=datetime.now, description="Job creation time")
    completed_at: Optional[datetime] = Field(None, description="Job completion time")
    result: Optional[ExtractedData] = Field(None, description="Processing result")
    error: Optional[str] = Field(None, description="Error message if failed")

class BatchProcessingRequest(BaseModel):
    files: List[str] = Field(..., description="List of file paths to process")
    priority: str = Field("normal", description="Processing priority")

class BatchProcessingResponse(BaseModel):
    batch_id: str = Field(..., description="Batch processing identifier")
    total_files: int = Field(..., description="Total number of files")
    status: ProcessingStatus = Field(ProcessingStatus.PENDING, description="Batch status")
    jobs: List[ProcessingJob] = Field(default_factory=list, description="Individual job statuses")
