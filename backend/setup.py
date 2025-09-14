#!/usr/bin/env python3
"""
Setup script for the Real-time AI Background Replacement system
"""

import subprocess
import sys
import os
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"   Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python {version.major}.{version.minor} is not supported.")
        print("   Please install Python 3.8 or higher.")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def create_virtual_environment():
    """Create virtual environment"""
    if os.path.exists("ml_env"):
        print("✅ Virtual environment already exists")
        return True
    
    return run_command("python -m venv ml_env", "Creating virtual environment")

def get_pip_command():
    """Get the correct pip command for the virtual environment"""
    if platform.system() == "Windows":
        return "ml_env\\Scripts\\pip.exe"
    else:
        return "ml_env/bin/pip"

def install_dependencies():
    """Install required dependencies"""
    pip_cmd = get_pip_command()
    
    # Upgrade pip first
    if not run_command(f"{pip_cmd} install --upgrade pip", "Upgrading pip"):
        return False
    
    # Install requirements
    if not run_command(f"{pip_cmd} install -r requirements.txt", "Installing dependencies"):
        return False
    
    return True

def test_installation():
    """Test if the installation works"""
    python_cmd = "ml_env\\Scripts\\python.exe" if platform.system() == "Windows" else "ml_env/bin/python"
    
    if not run_command(f"{python_cmd} ml_env/test.py", "Testing installation"):
        return False
    
    return True

def main():
    """Main setup function"""
    print("🚀 Real-time AI Background Replacement - Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Create virtual environment
    if not create_virtual_environment():
        print("❌ Failed to create virtual environment")
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Test installation
    if not test_installation():
        print("❌ Installation test failed")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("=" * 50)
    print("📝 Next steps:")
    print("1. Activate the virtual environment:")
    if platform.system() == "Windows":
        print("   ml_env\\Scripts\\activate")
    else:
        print("   source ml_env/bin/activate")
    print("2. Run the server:")
    print("   python run_server.py")
    print("   or")
    print("   python main.py")
    print("3. Open your web browser and test the API at:")
    print("   http://localhost:8000/docs")
    print("=" * 50)

if __name__ == "__main__":
    main()
