import logging
import os
from datetime import datetime
from typing import Dict, Any
import json

def setup_logging():
    """Setup logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('extractor.log')
        ]
    )

def load_config() -> Dict[str, Any]:
    """Load configuration from environment variables"""
    config = {
        'openai_api_key': os.getenv('OPENAI_API_KEY'),
        'azure_cognitive_endpoint': os.getenv('AZURE_COGNITIVE_ENDPOINT'),
        'azure_cognitive_key': os.getenv('AZURE_COGNITIVE_KEY'),
        'azure_storage_connection_string': os.getenv('AZURE_STORAGE_CONNECTION_STRING'),
        'max_file_size': int(os.getenv('MAX_FILE_SIZE', '10485760')),  # 10MB default
        'supported_formats': os.getenv('SUPPORTED_FORMATS', 'pdf,doc,docx,csv,xls,xlsx').split(','),
        'processing_timeout': int(os.getenv('PROCESSING_TIMEOUT', '300')),  # 5 minutes
    }
    return config

def validate_file(file_content: bytes, filename: str, max_size: int = 10485760) -> bool:
    """Validate uploaded file"""
    if len(file_content) > max_size:
        return False
    
    allowed_extensions = ['.pdf', '.doc', '.docx', '.csv', '.xls', '.xlsx']
    file_extension = os.path.splitext(filename.lower())[1]
    
    return file_extension in allowed_extensions

def save_to_storage(content: bytes, filename: str, storage_path: str = "uploads") -> str:
    """Save file to local storage"""
    os.makedirs(storage_path, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{filename.replace(' ', '_')}"
    file_path = os.path.join(storage_path, safe_filename)
    
    with open(file_path, 'wb') as f:
        f.write(content)
    
    return file_path

def format_timestamp(timestamp: str) -> str:
    """Format timestamp for display"""
    try:
        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except:
        return timestamp

def calculate_confidence_score(events: list) -> float:
    """Calculate overall confidence score for extracted data"""
    if not events:
        return 0.0
    
    total_confidence = sum(event.get('confidence', 0.5) for event in events)
    return total_confidence / len(events)

def export_to_json(data: Dict[str, Any], filename: str) -> str:
    """Export data to JSON file"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    export_filename = f"export_{timestamp}_{filename}.json"
    
    with open(export_filename, 'w') as f:
        json.dump(data, f, indent=2, default=str)
    
    return export_filename

def export_to_csv(events: list, filename: str) -> str:
    """Export events to CSV file"""
    import csv
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    export_filename = f"export_{timestamp}_{filename}.csv"
    
    with open(export_filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Event Name', 'Start Time', 'End Time', 'Event Type', 'Confidence'])
        
        for event in events:
            writer.writerow([
                event.get('name', ''),
                event.get('start_time', ''),
                event.get('end_time', ''),
                event.get('event_type', ''),
                event.get('confidence', 0.0)
            ])
    
    return export_filename
