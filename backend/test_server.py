#!/usr/bin/env python3
"""
Test script to verify the background replacement server works
"""

import asyncio
import json
import base64
import numpy as np
import cv2
from main import BackgroundReplacer

def test_background_replacer():
    """Test the BackgroundReplacer class"""
    print("Testing BackgroundReplacer...")
    
    try:
        # Initialize the background replacer
        replacer = BackgroundReplacer()
        print("✅ BackgroundReplacer initialized successfully")
        
        # Create a test image (random noise)
        test_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        print("✅ Test image created")
        
        # Process the test image
        processed_image = replacer.process_frame(test_image)
        print("✅ Image processing completed")
        
        # Test background change
        replacer.set_background('office')
        print("✅ Background changed to office")
        
        replacer.set_background('nature')
        print("✅ Background changed to nature")
        
        replacer.set_background('blur')
        print("✅ Background changed to blur")
        
        print("\n🎉 All BackgroundReplacer tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ BackgroundReplacer test failed: {e}")
        return False

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    try:
        import fastapi
        print("✅ FastAPI imported")
        
        import uvicorn
        print("✅ Uvicorn imported")
        
        import websockets
        print("✅ WebSockets imported")
        
        import cv2
        print("✅ OpenCV imported")
        
        import mediapipe
        print("✅ MediaPipe imported")
        
        import numpy
        print("✅ NumPy imported")
        
        from PIL import Image
        print("✅ Pillow imported")
        
        print("\n🎉 All imports successful!")
        return True
        
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 Real-time AI Background Replacement - Server Test")
    print("=" * 60)
    
    # Test imports
    imports_ok = test_imports()
    
    if imports_ok:
        # Test background replacer
        replacer_ok = test_background_replacer()
        
        if replacer_ok:
            print("\n🎉 All tests passed! The server is ready to run.")
            print("\n📝 To start the server:")
            print("   python main.py")
            print("   or")
            print("   python run_server.py")
            print("\n🌐 Server will be available at:")
            print("   http://localhost:8000")
            print("   http://localhost:8000/docs (API documentation)")
            print("   ws://localhost:8000/ws (WebSocket endpoint)")
        else:
            print("\n❌ BackgroundReplacer tests failed.")
    else:
        print("\n❌ Import tests failed.")

if __name__ == "__main__":
    main()
