import asyncio
import logging
import re
from typing import List, Dict, Any, Optional
import os
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

class AIExtractor:
    """AI-powered extraction of events and vessel information from text"""
    
    def __init__(self):
        self.event_patterns = self._load_event_patterns()
        self.vessel_patterns = self._load_vessel_patterns()
        
        # Try to initialize AI services (optional)
        self.openai_available = False
        self.azure_available = False
        self.nlp = None
        
        try:
            import openai
            self.openai_available = True
            logger.info("OpenAI integration available")
        except ImportError:
            logger.info("OpenAI not available - using pattern matching only")
        
        try:
            import spacy
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy NLP model loaded")
        except (ImportError, OSError):
            logger.info("spaCy not available - using basic pattern matching")
        
        logger.info("AIExtractor initialized with pattern-based extraction")
    
    def _load_event_patterns(self) -> Dict[str, List[str]]:
        """Load patterns for event detection"""
        return {
            'arrival': [
                r'arrival|arrived|vessel\s+arrived|ship\s+arrived',
                r'end\s+of\s+sea\s+passage|sea\s+passage\s+ended',
                r'pilot\s+on\s+board|pilot\s+embarked'
            ],
            'departure': [
                r'departure|departed|vessel\s+departed|ship\s+departed',
                r'pilot\s+off\s+board|pilot\s+disembarked'
            ],
            'loading': [
                r'loading|load|commenced\s+loading|started\s+loading',
                r'completed\s+loading|finished\s+loading'
            ],
            'discharging': [
                r'discharging|discharge|commenced\s+discharging|started\s+discharging',
                r'completed\s+discharging|finished\s+discharging'
            ],
            'berthing': [
                r'berthing|berthed|vessel\s+berthed|ship\s+berthed',
                r'all\s+fast|all\s+lines\s+made\s+fast'
            ],
            'unberthing': [
                r'unberthing|unberthed|vessel\s+unberthed',
                r'lines\s+let\s+go|lines\s+cast\s+off'
            ],
            'shifting': [
                r'shifting|shifted|vessel\s+shifted|ship\s+shifted'
            ],
            'anchorage': [
                r'anchorage|anchored|vessel\s+anchored|ship\s+anchored',
                r'dropped\s+anchor|anchor\s+down'
            ]
        }
    
    def _load_vessel_patterns(self) -> Dict[str, List[str]]:
        """Load patterns for vessel information extraction"""
        return {
            'vessel': [
                r'vessel:\s*([A-Z\s]+)',
                r'ship:\s*([A-Z\s]+)',
                r'mv\s+([A-Z\s]+)',
                r'ms\s+([A-Z\s]+)'
            ],
            'port': [
                r'port:\s*([A-Z\s]+)',
                r'port\s+of\s+([A-Z\s]+)',
                r'berth:\s*([A-Z\s]+)'
            ],
            'cargo': [
                r'cargo:\s*([A-Z\s]+)',
                r'cargo\s+type:\s*([A-Z\s]+)',
                r'loading\s+([A-Z\s]+)'
            ]
        }
    
    async def extract_events(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract events from text using pattern matching
        """
        try:
            events = []
            
            # Use pattern matching (basic implementation)
            pattern_events = self._extract_with_patterns(text)
            events.extend(pattern_events)
            
            # Remove duplicates and sort by time
            unique_events = self._deduplicate_events(events)
            sorted_events = self._sort_events_by_time(unique_events)
            
            logger.info(f"Extracted {len(sorted_events)} events from text")
            return sorted_events
            
        except Exception as e:
            logger.error(f"Error extracting events: {str(e)}")
            return []
    
    async def extract_vessel_info(self, text: str) -> Dict[str, Any]:
        """
        Extract vessel information from text using pattern matching
        """
        try:
            # Use pattern matching for vessel info extraction
            vessel_info = self._extract_vessel_with_patterns(text)
            
            # Set confidence level
            vessel_info['confidence'] = 0.8 if vessel_info else 0.3
            
            logger.info(f"Extracted vessel info: {vessel_info}")
            return vessel_info
            
        except Exception as e:
            logger.error(f"Error extracting vessel info: {str(e)}")
            return {}
    
    async def _extract_with_openai(self, text: str) -> List[Dict[str, Any]]:
        """Extract events using OpenAI"""
        try:
            prompt = f"""
            Extract maritime events from the following text. Return a JSON array of events with:
            - name: event name
            - start_time: start time (HH:MM format)
            - end_time: end time (HH:MM format)
            - event_type: arrival, departure, loading, discharging, berthing, unberthing, shifting, anchorage, or other
            
            Text: {text[:2000]}
            
            Return only valid JSON array.
            """
            
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.1
            )
            
            # Parse response
            content = response.choices[0].message.content
            import json
            events = json.loads(content)
            return events
            
        except Exception as e:
            logger.error(f"OpenAI extraction failed: {str(e)}")
            return []
    
    def _extract_with_patterns(self, text: str) -> List[Dict[str, Any]]:
        """Extract events using pattern matching"""
        events = []
        
        # Split text into lines
        lines = text.split('\n')
        
        for line in lines:
            line_lower = line.lower().strip()
            if not line_lower:
                continue
                
            # Look for time patterns first
            time_matches = re.findall(r'(\d{1,2}:\d{2})', line)
            
            # Check each event type
            for event_type, patterns in self.event_patterns.items():
                for pattern in patterns:
                    if re.search(pattern, line_lower, re.IGNORECASE):
                        start_time = time_matches[0] if time_matches else "00:00"
                        end_time = time_matches[1] if len(time_matches) > 1 else start_time
                        
                        events.append({
                            "name": line.strip(),
                            "start": start_time,
                            "end": end_time,
                            "start_time": start_time,
                            "end_time": end_time,
                            "event_type": event_type,
                            "confidence": 0.8
                        })
                        break
        
        # If no events found, try to extract any line with time
        if not events:
            for line in lines:
                if re.search(r'\d{1,2}:\d{2}', line):
                    time_match = re.search(r'(\d{1,2}:\d{2})', line)
                    time = time_match.group(1) if time_match else "00:00"
                    
                    events.append({
                        "name": line.strip(),
                        "start": time,
                        "end": time,
                        "start_time": time,
                        "end_time": time,
                        "event_type": "other",
                        "confidence": 0.6
                    })
        
        return events
    
    def _extract_with_nlp(self, text: str) -> List[Dict[str, Any]]:
        """Extract events using NLP"""
        events = []
        
        if not self.nlp:
            return events
        
        doc = self.nlp(text)
        
        # Look for sentences containing event-related words
        event_keywords = ['arrival', 'departure', 'loading', 'discharging', 'berthing', 'anchorage']
        
        for sent in doc.sents:
            sent_text = sent.text.lower()
            if any(keyword in sent_text for keyword in event_keywords):
                # Extract time
                time_match = re.search(r'(\d{1,2}:\d{2})', sent.text)
                time = time_match.group(1) if time_match else "00:00"
                
                events.append({
                    "name": sent.text.strip(),
                    "start_time": time,
                    "end_time": time,
                    "event_type": "other",
                    "confidence": 0.6
                })
        
        return events
    
    async def _extract_vessel_with_openai(self, text: str) -> Dict[str, Any]:
        """Extract vessel info using OpenAI"""
        try:
            prompt = f"""
            Extract vessel information from the following text. Return a JSON object with:
            - vessel: vessel name
            - port: port name
            - cargo: cargo type
            - operation: loading or discharging
            - voyage_from: departure port
            - voyage_to: destination port
            
            Text: {text[:1500]}
            
            Return only valid JSON object.
            """
            
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.1
            )
            
            content = response.choices[0].message.content
            import json
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"OpenAI vessel extraction failed: {str(e)}")
            return {}
    
    def _extract_vessel_with_patterns(self, text: str) -> Dict[str, Any]:
        """Extract vessel info using pattern matching"""
        vessel_info = {}
        
        # Look for vessel patterns
        for info_type, patterns in self.vessel_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    vessel_info[info_type] = match.group(1).strip()
                    break
        
        # Additional patterns for common maritime document formats
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Look for vessel name patterns
            if 'vessel' not in vessel_info:
                if re.search(r'vessel\s*name|ship\s*name|m\.?v\.?|m\.?s\.?', line, re.IGNORECASE):
                    # Extract vessel name from the line
                    vessel_match = re.search(r'(?:vessel\s*name|ship\s*name|m\.?v\.?|m\.?s\.?)\s*:?\s*([A-Z][A-Z\s]+)', line, re.IGNORECASE)
                    if vessel_match:
                        vessel_info['vessel'] = vessel_match.group(1).strip()
            
            # Look for port patterns
            if 'port' not in vessel_info:
                if re.search(r'port|berth|terminal', line, re.IGNORECASE):
                    port_match = re.search(r'(?:port|berth|terminal)\s*:?\s*([A-Z][A-Z\s]+)', line, re.IGNORECASE)
                    if port_match:
                        vessel_info['port'] = port_match.group(1).strip()
            
            # Look for cargo patterns
            if 'cargo' not in vessel_info:
                if re.search(r'cargo|commodity|product', line, re.IGNORECASE):
                    cargo_match = re.search(r'(?:cargo|commodity|product)\s*:?\s*([A-Z][A-Z\s]+)', line, re.IGNORECASE)
                    if cargo_match:
                        vessel_info['cargo'] = cargo_match.group(1).strip()
        
        return vessel_info
    
    async def _extract_vessel_with_azure(self, text: str) -> Dict[str, Any]:
        """Extract vessel info using Azure Text Analytics"""
        try:
            # Extract entities
            result = self.text_client.recognize_entities([text])
            entities = result[0].entities
            
            vessel_info = {}
            
            for entity in entities:
                if entity.category == "Organization":
                    vessel_info['vessel'] = entity.text
                elif entity.category == "Location":
                    vessel_info['port'] = entity.text
            
            return vessel_info
            
        except Exception as e:
            logger.error(f"Azure vessel extraction failed: {str(e)}")
            return {}
    
    def _deduplicate_events(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate events"""
        seen = set()
        unique_events = []
        
        for event in events:
            # Create a key for deduplication
            key = f"{event['name']}_{event['start_time']}_{event['end_time']}"
            if key not in seen:
                seen.add(key)
                unique_events.append(event)
        
        return unique_events
    
    def _sort_events_by_time(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sort events by start time"""
        def parse_time(time_str):
            try:
                return datetime.strptime(time_str, "%H:%M")
            except:
                return datetime.min
        
        return sorted(events, key=lambda x: parse_time(x['start_time']))
