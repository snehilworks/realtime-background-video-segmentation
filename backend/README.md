# AI Background Replacement Backend

Real-time AI-powered background replacement using MediaPipe and FastAPI.

## 🚀 Features

- **Real-time Background Replacement**: Uses MediaPipe Selfie Segmentation for accurate person detection
- **Multiple Background Types**: Solid colors, real images, and custom uploads
- **WebSocket Communication**: Low-latency real-time video processing
- **REST API**: Background management and system control
- **High Performance**: Optimized for 30+ FPS processing

## 📋 Requirements

- Python 3.8+
- OpenCV
- MediaPipe
- FastAPI
- Uvicorn
- NumPy
- Pillow

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd RealTimeEngine/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv ml_env
   ```

3. **Activate virtual environment**
   - Windows: `ml_env\Scripts\activate`
   - Linux/Mac: `source ml_env/bin/activate`

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run setup script**
   ```bash
   python setup.py
   ```

## 🚀 Quick Start

1. **Start the server**
   ```bash
   python run_server.py
   ```

2. **Server will be available at**
   - API: `http://localhost:8000`
   - WebSocket: `ws://localhost:8000/ws`
   - Docs: `http://localhost:8000/docs`

## 📁 Project Structure

```
backend/
├── main.py                 # FastAPI server and WebSocket handler
├── requirements.txt        # Python dependencies
├── setup.py               # Environment setup script
├── run_server.py          # Server startup script
├── backgrounds/           # Background images directory
│   ├── office.jpg
│   ├── nature.jpg
│   ├── space.jpg
│   └── beach.jpg
├── ml_env/               # Virtual environment (ignored by git)
└── README.md             # This file
```

## 🔧 API Endpoints

### WebSocket
- **`/ws`** - Real-time video processing
  - Receives: Base64 encoded video frames
  - Sends: Processed frames with background replacement

### REST API
- **`GET /`** - Health check
- **`GET /backgrounds`** - List available backgrounds
- **`POST /backgrounds/{background_type}`** - Change background
- **`POST /upload-background`** - Upload custom background
- **`GET /performance`** - Get performance metrics

## 🎯 Usage Examples

### Change Background via API
```bash
curl -X POST "http://localhost:8000/backgrounds/office"
```

### Upload Custom Background
```bash
curl -X POST "http://localhost:8000/upload-background" \
  -F "file=@your_image.jpg"
```

### WebSocket Connection (JavaScript)
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  console.log('Connected to AI server');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'processed_frame') {
    // Display processed frame
    const img = new Image();
    img.src = 'data:image/jpeg;base64,' + data.data;
  }
};
```

## ⚙️ Configuration

### Background Types
- `blur` - Blurred background
- `office` - Office environment
- `nature` - Natural outdoor scene
- `space` - Space/astronaut theme
- `beach` - Beach/ocean scene
- `custom` - User uploaded image

### Performance Settings
- **Quality**: Controls processing resolution
- **Edge Smoothing**: Improves segmentation edges
- **FPS Target**: 30 FPS (configurable)

## 🐛 Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Ensure virtual environment is activated
   - Run `pip install -r requirements.txt`

2. **WebSocket connection failed**
   - Check if server is running on port 8000
   - Verify firewall settings

3. **Poor performance**
   - Reduce video quality in client
   - Check system resources
   - Try different background types

4. **Background images not loading**
   - Ensure `backgrounds/` directory exists
   - Check file permissions
   - Verify image formats (JPG/PNG)

### Performance Optimization

- Use GPU acceleration when available
- Reduce video resolution for better FPS
- Close unnecessary applications
- Ensure adequate RAM (8GB+ recommended)

## 📊 Performance Metrics

The server provides real-time performance data:
- **FPS**: Frames per second
- **Latency**: Processing delay
- **CPU Usage**: System resource utilization
- **Memory Usage**: RAM consumption
- **Frame Drops**: Missed frames

## 🔒 Security Notes

- Server runs on localhost by default
- No authentication implemented (development only)
- File uploads are not validated (add validation for production)
- Consider rate limiting for production use

## 🚀 Deployment

For production deployment:

1. **Use a production WSGI server**
   ```bash
   pip install gunicorn
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Add environment variables**
   ```bash
   export HOST=0.0.0.0
   export PORT=8000
   export WORKERS=4
   ```

3. **Configure reverse proxy** (nginx/Apache)
4. **Add authentication and rate limiting**
5. **Implement proper logging**

## 📝 License

This project is part of the RealTimeEngine portfolio project.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation at `/docs`
- Create an issue in the repository


