#!/usr/bin/env python3
"""
Test script to test the upload-background endpoint
"""

import requests
import os
from PIL import Image
import numpy as np

def create_test_image():
    """Create a simple test image"""
    # Create a simple colored image
    img = Image.new('RGB', (640, 480), color='red')
    img.save('test_background.jpg')
    return 'test_background.jpg'

def test_upload():
    """Test the upload endpoint"""
    print("🧪 Testing Upload Endpoint")
    print("=" * 40)
    
    # Create test image
    test_file = create_test_image()
    
    try:
        # Test upload
        with open(test_file, 'rb') as f:
            files = {'file': (test_file, f, 'image/jpeg')}
            response = requests.post('http://localhost:8000/upload-background', files=files)
        
        print(f"✅ Upload endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 200:
            result = response.json()
            background_id = result.get('background_id')
            
            # Test setting the uploaded background
            set_response = requests.post('http://localhost:8000/background', 
                                       json={"type": background_id})
            print(f"✅ Set uploaded background: {set_response.status_code}")
            print(f"   Response: {set_response.json()}")
        
    except Exception as e:
        print(f"❌ Upload test failed: {e}")
    finally:
        # Clean up test file
        if os.path.exists(test_file):
            os.remove(test_file)

if __name__ == "__main__":
    test_upload()
