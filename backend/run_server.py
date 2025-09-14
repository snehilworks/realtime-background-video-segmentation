#!/usr/bin/env python3
"""
Simple script to run the background replacement server
"""

import subprocess
import sys
import os

def main():
    """Run the background replacement server"""
    print("🚀 Starting Real-time AI Background Replacement Server...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("main.py"):
        print("❌ Error: main.py not found. Please run this from the background-ml directory.")
        sys.exit(1)
    
    # Check if virtual environment exists
    if not os.path.exists("ml_env"):
        print("❌ Error: Virtual environment not found. Please run setup first.")
        print("   Run: python -m venv ml_env")
        print("   Then: ml_env\\Scripts\\activate (Windows) or source ml_env/bin/activate (Linux/Mac)")
        sys.exit(1)
    
    # Activate virtual environment and run server
    try:
        if os.name == 'nt':  # Windows
            activate_script = "ml_env\\Scripts\\activate.bat"
            python_exe = "ml_env\\Scripts\\python.exe"
        else:  # Linux/Mac
            activate_script = "source ml_env/bin/activate"
            python_exe = "ml_env/bin/python"
        
        print(f"🐍 Using Python: {python_exe}")
        print("🌐 Server will be available at: http://localhost:8000")
        print("📡 WebSocket endpoint: ws://localhost:8000/ws")
        print("📚 API docs: http://localhost:8000/docs")
        print("=" * 50)
        print("Press Ctrl+C to stop the server")
        print("=" * 50)
        
        # Run the server
        subprocess.run([python_exe, "main.py"], check=True)
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running server: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("❌ Python executable not found. Please check your virtual environment setup.")
        sys.exit(1)

if __name__ == "__main__":
    main()
