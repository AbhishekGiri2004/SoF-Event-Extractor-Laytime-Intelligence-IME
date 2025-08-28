import asyncio
import logging
import re
import csv
import io
from typing import Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)

class RealDocumentProcessor:
    """Real document processor that extracts actual data from files"""
    
    def __init__(self):
        self.vessel_patterns = [
            r'vessel[:\s]+([A-Z\s]+)',
            r'ship[:\s]+([A-Z\s]+)',
            r'mv\s+([A-Z\s]+)',
            r'ms\s+([A-Z\s]+)',
            r'vessel\s+name[:\s]+([A-Z\s]+)'
        ]
        
        self.port_patterns = [
            r'port[:\s]+([A-Z\s]+)',
            r'port\s+of\s+([A-Z\s]+)',
            r'berth[:\s]+([A-Z\s]+)',
            r'discharge\s+port[:\s]+([A-Z\s]+)',
            r'loading\s+port[:\s]+([A-Z\s]+)'
        ]
        
        self.cargo_patterns = [
            r'cargo[:\s]+([A-Z\s]+)',
            r'cargo\s+type[:\s]+([A-Z\s]+)',
            r'loading\s+([A-Z\s]+)',
            r'discharging\s+([A-Z\s]+)'
        ]
        
        self.voyage_patterns = [
            r'from[:\s]+([A-Z\s]+)',
            r'to[:\s]+([A-Z\s]+)',
            r'voyage\s+from[:\s]+([A-Z\s]+)',
            r'voyage\s+to[:\s]+([A-Z\s]+)'
        ]
    
    async def extract_from_csv(self, content: bytes, filename: str) -> Dict[str, Any]:
        """Extract real data from CSV files"""
        try:
            # Decode content
            text_content = content.decode('utf-8')
            
            # Parse CSV
            csv_reader = csv.DictReader(io.StringIO(text_content))
            rows = list(csv_reader)
            
            if not rows:
                return self._get_empty_result(filename)
            
            # Extract vessel info from first row
            first_row = rows[0]
            vessel_info = self._extract_vessel_from_csv_row(first_row)
            
            # Extract events from all rows
            events = self._extract_events_from_csv_rows(rows)
            
            return {
                "filename": filename,
                "vessel": vessel_info.get('vessel', 'Unknown'),
                "port": vessel_info.get('port', 'Unknown'),
                "cargo": vessel_info.get('cargo', 'Unknown'),
                "operation": vessel_info.get('operation', 'Discharge'),
                "voyage_from": vessel_info.get('voyage_from', 'Unknown'),
                "voyage_to": vessel_info.get('voyage_to', 'Unknown'),
                "demurrage_rate": vessel_info.get('demurrage_rate'),
                "dispatch_rate": vessel_info.get('dispatch_rate'),
                "load_rate": vessel_info.get('load_rate'),
                "cargo_quantity": vessel_info.get('cargo_quantity'),
                "events": events,
                "extracted_at": datetime.now().isoformat(),
                "confidence_score": 0.9 if events else 0.5
            }
            
        except Exception as e:
            logger.error(f"Error processing CSV {filename}: {str(e)}")
            return self._get_empty_result(filename)
    
    def _extract_vessel_from_csv_row(self, row: Dict[str, str]) -> Dict[str, Any]:
        """Extract vessel information from CSV row"""
        vessel_info = {}
        
        # Look for vessel name in column headers and values
        for col_name, value in row.items():
            col_lower = col_name.lower()
            value_clean = str(value).strip()
            
            if not value_clean or value_clean.lower() in ['nan', 'none', '']:
                continue
                
            # Vessel name
            if 'vessel' in col_lower:
                vessel_info['vessel'] = value_clean
            elif 'ship' in col_lower:
                vessel_info['vessel'] = value_clean
            
            # Port
            elif 'port' in col_lower:
                vessel_info['port'] = value_clean
            
            # Cargo
            elif 'cargo' in col_lower:
                vessel_info['cargo'] = value_clean
            
            # Operation
            elif 'operation' in col_lower:
                vessel_info['operation'] = value_clean
            
            # Voyage
            elif 'from' in col_lower and 'voyage' in col_lower:
                vessel_info['voyage_from'] = value_clean
            elif 'to' in col_lower and 'voyage' in col_lower:
                vessel_info['voyage_to'] = value_clean
            elif 'from' in col_lower:
                vessel_info['voyage_from'] = value_clean
            elif 'to' in col_lower:
                vessel_info['voyage_to'] = value_clean
            
            # Rates
            elif 'demurrage' in col_lower:
                try:
                    vessel_info['demurrage_rate'] = float(value_clean)
                except:
                    pass
            elif 'dispatch' in col_lower:
                try:
                    vessel_info['dispatch_rate'] = float(value_clean)
                except:
                    pass
            elif 'load' in col_lower and 'rate' in col_lower:
                try:
                    vessel_info['load_rate'] = float(value_clean)
                except:
                    pass
            
            # Cargo quantity
            elif any(word in col_lower for word in ['qty', 'quantity', 'mt', 'ton']):
                try:
                    vessel_info['cargo_quantity'] = float(value_clean)
                except:
                    pass
        
        return vessel_info
    
    def _extract_events_from_csv_rows(self, rows: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """Extract events from CSV rows"""
        events = []
        
        for row in rows:
            event_name = None
            start_time = None
            end_time = None
            
            # Look for event-related columns
            for col_name, value in row.items():
                col_lower = col_name.lower()
                value_clean = str(value).strip()
                
                if not value_clean or value_clean.lower() in ['nan', 'none', '']:
                    continue
                
                # Event name
                if 'event' in col_lower:
                    event_name = value_clean
                
                # Time columns
                elif 'time' in col_lower or 'date' in col_lower:
                    if 'start' in col_lower:
                        start_time = value_clean
                    elif 'end' in col_lower:
                        end_time = value_clean
                    elif start_time is None:
                        start_time = value_clean
                    elif end_time is None:
                        end_time = value_clean
            
            # Create event if we have a name and at least one time
            if event_name and (start_time or end_time):
                event_type = self._determine_event_type(event_name)
                events.append({
                    "name": event_name,
                    "start_time": start_time or "00:00",
                    "end_time": end_time or "00:00",
                    "event_type": event_type,
                    "confidence": 0.9
                })
        
        return events
    
    def _determine_event_type(self, event_name: str) -> str:
        """Determine event type based on event name"""
        event_lower = event_name.lower()
        
        if any(word in event_lower for word in ['arrival', 'arrived']):
            return 'arrival'
        elif any(word in event_lower for word in ['departure', 'departed']):
            return 'departure'
        elif any(word in event_lower for word in ['loading', 'load']):
            return 'loading'
        elif any(word in event_lower for word in ['discharging', 'discharge']):
            return 'discharging'
        elif any(word in event_lower for word in ['berthing', 'berthed']):
            return 'berthing'
        elif any(word in event_lower for word in ['anchorage', 'anchored']):
            return 'anchorage'
        elif any(word in event_lower for word in ['shifting', 'shifted']):
            return 'shifting'
        else:
            return 'other'
    
    async def extract_from_text(self, content: bytes, filename: str) -> Dict[str, Any]:
        """Extract data from text content (PDF/Word)"""
        try:
            # For now, we'll extract from text content
            # In a full implementation, this would use OCR and AI
            text_content = content.decode('utf-8', errors='ignore')
            
            # Extract vessel information using patterns
            vessel_info = self._extract_from_text_patterns(text_content)
            
            # Extract events from text
            events = self._extract_events_from_text(text_content)
            
            return {
                "filename": filename,
                "vessel": vessel_info.get('vessel', 'Unknown'),
                "port": vessel_info.get('port', 'Unknown'),
                "cargo": vessel_info.get('cargo', 'Unknown'),
                "operation": vessel_info.get('operation', 'Discharge'),
                "voyage_from": vessel_info.get('voyage_from', 'Unknown'),
                "voyage_to": vessel_info.get('voyage_to', 'Unknown'),
                "events": events,
                "extracted_at": datetime.now().isoformat(),
                "confidence_score": 0.7 if events else 0.3
            }
            
        except Exception as e:
            logger.error(f"Error processing text {filename}: {str(e)}")
            return self._get_empty_result(filename)
    
    def _extract_from_text_patterns(self, text: str) -> Dict[str, str]:
        """Extract vessel information using regex patterns"""
        vessel_info = {}
        
        # Extract vessel name
        for pattern in self.vessel_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                vessel_info['vessel'] = match.group(1).strip()
                break
        
        # Extract port
        for pattern in self.port_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                vessel_info['port'] = match.group(1).strip()
                break
        
        # Extract cargo
        for pattern in self.cargo_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                vessel_info['cargo'] = match.group(1).strip()
                break
        
        # Extract voyage information
        for pattern in self.voyage_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if 'from' in pattern:
                    vessel_info['voyage_from'] = match.group(1).strip()
                elif 'to' in pattern:
                    vessel_info['voyage_to'] = match.group(1).strip()
        
        return vessel_info
    
    def _extract_events_from_text(self, text: str) -> List[Dict[str, Any]]:
        """Extract events from text content"""
        events = []
        
        # Split text into lines
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Look for event patterns
            event_patterns = [
                r'(\d{1,2}:\d{2})\s*[-–]\s*([^:]+)',
                r'([^:]+)\s*:\s*(\d{1,2}:\d{2})',
                r'(\d{1,2}:\d{2})\s*([A-Z][^:]+)'
            ]
            
            for pattern in event_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    time_str = match.group(1) if ':' in match.group(1) else match.group(2)
                    event_name = match.group(2) if ':' in match.group(1) else match.group(1)
                    
                    if time_str and event_name:
                        event_type = self._determine_event_type(event_name)
                        events.append({
                            "name": event_name.strip(),
                            "start_time": time_str.strip(),
                            "end_time": time_str.strip(),
                            "event_type": event_type,
                            "confidence": 0.8
                        })
                    break
        
        return events
    
    def _get_empty_result(self, filename: str) -> Dict[str, Any]:
        """Return empty result when extraction fails"""
        return {
            "filename": filename,
            "vessel": "Unknown",
            "port": "Unknown",
            "cargo": "Unknown",
            "operation": "Discharge",
            "voyage_from": "Unknown",
            "voyage_to": "Unknown",
            "events": [],
            "extracted_at": datetime.now().isoformat(),
            "confidence_score": 0.0
        }
