#!/usr/bin/env python3
"""
Test script to verify the backend endpoints are working
"""

import requests
import json
import time

def test_endpoints():
    """Test all the backend endpoints"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Backend Endpoints")
    print("=" * 40)
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Health endpoint failed: {e}")
    
    # Test backgrounds endpoint
    try:
        response = requests.get(f"{base_url}/backgrounds")
        print(f"✅ Backgrounds endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Backgrounds endpoint failed: {e}")
    
    # Test backgrounds list endpoint
    try:
        response = requests.get(f"{base_url}/backgrounds/list")
        print(f"✅ Backgrounds list endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Backgrounds list endpoint failed: {e}")
    
    # Test root endpoint
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Root endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Root endpoint failed: {e}")
    
    # Test setting background
    try:
        response = requests.post(f"{base_url}/background", json={"type": "office"})
        print(f"✅ Set background endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Set background endpoint failed: {e}")
    
    print("\n🎉 Endpoint testing complete!")

if __name__ == "__main__":
    print("⏳ Waiting for server to start...")
    time.sleep(2)
    test_endpoints()
