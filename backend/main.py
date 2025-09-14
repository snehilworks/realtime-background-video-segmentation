#!/usr/bin/env python3
"""
Real-time AI Background Replacement Server
Main server file with FastAPI and WebSocket support
"""

import asyncio
import base64
import json
import logging
import os
import uuid
from typing import Optional, Dict, Any
import cv2
import numpy as np
import mediapipe as mp
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BackgroundReplacer:
    """Real-time background replacement using MediaPipe and OpenCV"""
    
    def __init__(self):
        """Initialize the background replacer"""
        self.mp_selfie_segmentation = mp.solutions.selfie_segmentation
        self.selfie_segmentation = self.mp_selfie_segmentation.SelfieSegmentation(model_selection=1)
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Background options
        self.backgrounds = {
            'office': self._create_office_background(),
            'nature': self._create_nature_background(),
            'space': self._create_space_background(),
            'beach': self._create_beach_background(),
            'gradient': self._create_gradient_background(),
            'abstract': self._create_abstract_background(),
            'blur': None,  # Will be handled specially
            'none': None   # No background
        }
        self.current_background = 'none'
        self.custom_backgrounds = {}  # Store custom uploaded backgrounds
        
        logger.info("BackgroundReplacer initialized successfully")
    
    def _create_office_background(self) -> np.ndarray:
        """Create a simple office background"""
        # Create a gradient office-like background
        height, width = 480, 640
        background = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Create gradient from light blue to white
        for i in range(height):
            intensity = int(200 + (55 * i / height))
            background[i, :] = np.array([min(255, intensity), min(255, intensity + 20), min(255, intensity + 40)], dtype=np.uint8)
        
        return background
    
    def _create_nature_background(self) -> np.ndarray:
        """Create a simple nature background"""
        # Create a gradient nature-like background
        height, width = 480, 640
        background = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Create gradient from green to blue (sky)
        for i in range(height):
            if i < height // 2:  # Sky
                intensity = int(100 + (100 * i / (height // 2)))
                background[i, :] = np.array([min(255, intensity), min(255, intensity + 50), min(255, intensity + 100)], dtype=np.uint8)
            else:  # Ground
                intensity = int(50 + (50 * (i - height // 2) / (height // 2)))
                background[i, :] = np.array([min(255, intensity), min(255, intensity + 100), min(255, intensity)], dtype=np.uint8)
        
        return background
    
    def _create_space_background(self) -> np.ndarray:
        """Create a space/cosmic background"""
        height, width = 480, 640
        background = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Create deep space gradient from dark blue to black
        for i in range(height):
            intensity = int(20 + (30 * (height - i) / height))
            background[i, :] = np.array([intensity // 3, intensity // 2, intensity], dtype=np.uint8)
        
        # Add some "stars" (random bright pixels)
        for _ in range(100):
            x, y = np.random.randint(0, width), np.random.randint(0, height)
            brightness = np.random.randint(150, 255)
            background[y, x] = [brightness, brightness, brightness]
        
        return background
    
    def _create_beach_background(self) -> np.ndarray:
        """Create a beach background"""
        height, width = 480, 640
        background = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Sky (top half)
        for i in range(height // 2):
            intensity = int(100 + (80 * i / (height // 2)))
            background[i, :] = np.array([intensity, intensity + 50, intensity + 100], dtype=np.uint8)
        
        # Water (middle section)
        for i in range(height // 2, height * 3 // 4):
            intensity = int(50 + (30 * (i - height // 2) / (height // 4)))
            background[i, :] = np.array([intensity + 50, intensity + 80, intensity + 120], dtype=np.uint8)
        
        # Sand (bottom section)
        for i in range(height * 3 // 4, height):
            intensity = int(80 + (40 * (i - height * 3 // 4) / (height // 4)))
            background[i, :] = np.array([intensity + 60, intensity + 40, intensity], dtype=np.uint8)
        
        return background
    
    def _create_gradient_background(self) -> np.ndarray:
        """Create a colorful gradient background"""
        height, width = 480, 640
        background = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Create a diagonal gradient from purple to pink
        for i in range(height):
            for j in range(width):
                # Normalize coordinates
                x = j / width
                y = i / height
                
                # Create gradient from purple to pink
                r = int(128 + 127 * (x + y) / 2)
                g = int(50 + 100 * x)
                b = int(200 - 100 * y)
                
                background[i, j] = [min(255, max(0, b)), min(255, max(0, g)), min(255, max(0, r))]
        
        return background
    
    def _create_abstract_background(self) -> np.ndarray:
        """Create an abstract artistic background"""
        height, width = 480, 640
        background = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Create multiple overlapping gradients
        for i in range(height):
            for j in range(width):
                x = j / width
                y = i / height
                
                # Multiple sine waves for abstract effect
                r = int(100 + 100 * np.sin(x * np.pi * 2) * np.cos(y * np.pi * 2))
                g = int(100 + 100 * np.sin(y * np.pi * 3) * np.cos(x * np.pi * 1.5))
                b = int(100 + 100 * np.sin((x + y) * np.pi * 2.5))
                
                background[i, j] = [min(255, max(0, b)), min(255, max(0, g)), min(255, max(0, r))]
        
        return background
    
    def add_custom_background(self, background_id: str, background_image: np.ndarray) -> bool:
        """Add a custom background image"""
        try:
            self.custom_backgrounds[background_id] = background_image
            logger.info(f"Custom background added: {background_id}")
            return True
        except Exception as e:
            logger.error(f"Error adding custom background: {e}")
            return False
    
    def set_background(self, background_type: str) -> bool:
        """Set the background type"""
        logger.info(f"Attempting to set background to: {background_type}")
        logger.info(f"Available predefined backgrounds: {list(self.backgrounds.keys())}")
        logger.info(f"Available custom backgrounds: {list(self.custom_backgrounds.keys())}")
        
        if background_type in self.backgrounds or background_type in self.custom_backgrounds:
            self.current_background = background_type
            logger.info(f"Background successfully changed to: {background_type}")
            return True
        else:
            logger.warning(f"Background type '{background_type}' not found in available backgrounds")
            return False
    
    def process_frame(self, frame: np.ndarray) -> np.ndarray:
        """Process a single frame and replace background"""
        try:
            # Convert BGR to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Get segmentation mask
            results = self.selfie_segmentation.process(rgb_frame)
            
            if results.segmentation_mask is not None:
                # Create 3-channel mask
                mask = np.stack((results.segmentation_mask,) * 3, axis=-1)
                mask = (mask > 0.5).astype(np.uint8)
                
                # Resize frame to match mask if needed
                if frame.shape[:2] != mask.shape[:2]:
                    frame = cv2.resize(frame, (mask.shape[1], mask.shape[0]))
                
                # Apply background
                if self.current_background == 'blur':
                    # Create blurred background
                    background = cv2.GaussianBlur(frame, (21, 21), 0)
                elif self.current_background == 'none':
                    # No background change
                    return frame
                elif self.current_background in self.backgrounds:
                    # Use predefined background
                    background = self.backgrounds[self.current_background]
                    if background.shape[:2] != frame.shape[:2]:
                        background = cv2.resize(background, (frame.shape[1], frame.shape[0]))
                elif self.current_background in self.custom_backgrounds:
                    # Use custom background
                    background = self.custom_backgrounds[self.current_background]
                    if background.shape[:2] != frame.shape[:2]:
                        background = cv2.resize(background, (frame.shape[1], frame.shape[0]))
                else:
                    # Default to original frame
                    return frame
                
                # Combine foreground and background
                result = frame * mask + background * (1 - mask)
                return result.astype(np.uint8)
            else:
                return frame
                
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return frame

# Initialize FastAPI app
app = FastAPI(
    title="Real-time AI Background Replacement",
    description="WebSocket-based real-time background replacement using MediaPipe",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create backgrounds directory if it doesn't exist
os.makedirs("backgrounds", exist_ok=True)

# Mount static files for serving uploaded backgrounds
app.mount("/backgrounds", StaticFiles(directory="backgrounds"), name="backgrounds")

# Global background replacer instance
background_replacer = BackgroundReplacer()

# Store active WebSocket connections
active_connections: list[WebSocket] = []

@app.get("/")
async def root():
    """Root endpoint with basic info"""
    return {
        "message": "Real-time AI Background Replacement Server",
        "version": "1.0.0",
        "endpoints": {
            "websocket": "/ws",
            "docs": "/docs",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "background_replacer": "initialized"}

@app.get("/backgrounds")
async def get_available_backgrounds():
    """Get list of available background types"""
    return {
        "backgrounds": list(background_replacer.backgrounds.keys()),
        "current": background_replacer.current_background
    }

@app.post("/background")
async def set_background(background_data: Dict[str, Any]):
    """Set the background type"""
    background_type = background_data.get("type")
    if not background_type:
        raise HTTPException(status_code=400, detail="Background type is required")
    
    success = background_replacer.set_background(background_type)
    if success:
        return {"message": f"Background changed to {background_type}", "success": True}
    else:
        raise HTTPException(status_code=400, detail=f"Invalid background type: {background_type}")

@app.post("/upload-background")
async def upload_background(file: UploadFile = File(...)):
    """Upload a custom background image"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        background_id = f"custom_{uuid.uuid4().hex[:8]}"
        filename = f"{background_id}.{file_extension}"
        file_path = os.path.join("backgrounds", filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Load and process the image
        image = cv2.imread(file_path)
        if image is None:
            os.remove(file_path)  # Clean up invalid file
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Convert BGR to RGB for consistency
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Add to background replacer
        success = background_replacer.add_custom_background(background_id, image_rgb)
        logger.info(f"Custom background upload result: success={success}, background_id={background_id}")
        
        if success:
            return {
                "message": "Background uploaded successfully",
                "background_id": background_id,
                "filename": filename,
                "url": f"/backgrounds/{filename}",
                "success": True
            }
        else:
            os.remove(file_path)  # Clean up on failure
            raise HTTPException(status_code=500, detail="Failed to process background image")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading background: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/backgrounds/list")
async def list_backgrounds():
    """Get list of all available backgrounds including custom ones"""
    custom_backgrounds = []
    for bg_id in background_replacer.custom_backgrounds.keys():
        # Find the corresponding file
        for filename in os.listdir("backgrounds"):
            if filename.startswith(bg_id):
                custom_backgrounds.append({
                    "id": bg_id,
                    "name": f"Custom {bg_id[:8]}",
                    "type": "custom",
                    "url": f"/backgrounds/{filename}"
                })
                break
    
    return {
        "predefined": list(background_replacer.backgrounds.keys()),
        "custom": custom_backgrounds,
        "current": background_replacer.current_background
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time video processing"""
    await websocket.accept()
    active_connections.append(websocket)
    logger.info(f"WebSocket connected. Total connections: {len(active_connections)}")
    
    try:
        while True:
            # Receive data from client
            data = await websocket.receive_text()
            
            try:
                # Parse the incoming data
                message = json.loads(data)
                
                if message.get("type") == "frame":
                    # Process video frame
                    frame_data = message.get("data")
                    if frame_data:
                        # Decode base64 image
                        image_bytes = base64.b64decode(frame_data)
                        nparr = np.frombuffer(image_bytes, np.uint8)
                        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                        
                        if frame is not None:
                            # Process frame with background replacement
                            processed_frame = background_replacer.process_frame(frame)
                            
                            # Encode processed frame back to base64
                            _, buffer = cv2.imencode('.jpg', processed_frame)
                            processed_data = base64.b64encode(buffer).decode('utf-8')
                            
                            # Send processed frame back
                            response = {
                                "type": "processed_frame",
                                "data": processed_data,
                                "background": background_replacer.current_background
                            }
                            await websocket.send_text(json.dumps(response))
                
                elif message.get("type") == "set_background" or message.get("type") == "change_background":
                    # Change background
                    bg_type = message.get("background")
                    logger.info(f"Received background change request: {bg_type}")
                    if bg_type:
                        success = background_replacer.set_background(bg_type)
                        response = {
                            "type": "background_changed",
                            "background": bg_type,
                            "success": success
                        }
                        logger.info(f"Sending background change response: {response}")
                        await websocket.send_text(json.dumps(response))
                
                elif message.get("type") == "ping":
                    # Respond to ping
                    await websocket.send_text(json.dumps({"type": "pong"}))
                
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON format"
                }))
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": str(e)
                }))
                
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(active_connections)}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in active_connections:
            active_connections.remove(websocket)

@app.get("/test")
async def test_endpoint():
    """Test endpoint to verify server is working"""
    return {
        "message": "Server is working!",
        "background_replacer_initialized": background_replacer is not None,
        "available_backgrounds": list(background_replacer.backgrounds.keys()),
        "current_background": background_replacer.current_background
    }

def main():
    """Main function to run the server"""
    logger.info("Starting Real-time AI Background Replacement Server...")
    logger.info("Server will be available at: http://localhost:8000")
    logger.info("WebSocket endpoint: ws://localhost:8000/ws")
    logger.info("API documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    main()
