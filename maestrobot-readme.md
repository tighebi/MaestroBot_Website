# 🎵 MaestroBOT - Web Edition

Control music playback with hand gestures using your webcam! This is the web-based version of MaestroBOT, built with HTML5, JavaScript, and MediaPipe.

![MaestroBOT Banner](https://img.shields.io/badge/MaestroBOT-Web%20Edition-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

## 🌟 Features

- 🖐️ **Two Control Modes**:
  - **Static Gestures**: Predefined hand positions control volume and speed
  - **Slider Controls**: Dynamic hand movements for real-time adjustments
- 🎥 **Live Camera Feed**: See your hands and gesture recognition in real-time
- 🎨 **Dark Mode UI**: Sleek, modern interface inspired by the original Python version
- 🎵 **MP3 Playback**: Load and play your favorite music files
- ⚡ **Smooth Transitions**: Gradual volume and speed changes for natural control
- 📱 **Responsive Design**: Works on desktop and tablet devices

## 🎮 Gesture Controls

### Static Gestures Mode

**Playback (Both Hands Together):**
- 🖐️🖐️ Both Hands Open → Play/Resume
- ✊✊ Both Hands Closed → Fade to Pause

**Volume (Left Hand):**
- ☝️ One Finger → 25%
- ✌️ Two Fingers → 50%
- 🤟 Three Fingers → 75%
- 🖖 Four Fingers → 100%

**Speed (Right Hand):**
- ☝️ One Finger → 0.50x
- ✌️ Two Fingers → 0.75x
- 🤟 Three Fingers → 1.00x
- 🖖 Four Fingers → 1.50x

### Slider Controls Mode

**Playback (Left Hand):**
- 🖐️ Open Hand → Play/Resume
- ✊ Closed Fist → Fade to Pause

**Dynamic Controls (Right Hand):**
- 🖐️ Open Hand + Move Left/Right → Adjust Speed
- ✊ Closed Fist + Move Up/Down → Adjust Volume

## 🚀 Quick Start

### Option 1: Direct File Opening (Simplest)

1. Download all files to a folder:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `hand-tracker.js`

2. Open `index.html` in a modern web browser (Chrome, Edge, or Firefox recommended)

3. Click "Start Camera" and allow webcam access

4. Click "Load MP3" to select your music file

5. Start conducting! 🎵

### Option 2: Local Web Server (Recommended)

For the best experience, run a local web server:

#### Using Python (if installed):
```bash
# Navigate to the project folder
cd maestrobot-web

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Using Node.js:
```bash
# Install http-server globally (one time)
npm install -g http-server

# Run server
http-server -p 8000
```

#### Using VS Code:
1. Install the "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

Then open your browser to `http://localhost:8000`

## 📋 Requirements

### Browser Requirements:
- Modern web browser with WebRTC support:
  - ✅ Google Chrome (recommended)
  - ✅ Microsoft Edge
  - ✅ Firefox
  - ✅ Safari 11+

### System Requirements:
- Working webcam
- Stable internet connection (for loading MediaPipe libraries from CDN)
- MP3 audio files

### Permissions:
- Camera access (you'll be prompted when starting the app)

## 🗂️ Project Structure

```
maestrobot-web/
├── index.html          # Main HTML structure and layout
├── styles.css          # Dark mode styling and responsive design
├── app.js              # Music controller and application logic
├── hand-tracker.js     # MediaPipe integration and gesture recognition
└── README.md           # This file
```

## 🎯 How It Works

1. **Hand Tracking**: MediaPipe Hands detects up to 2 hands and tracks 21 landmarks per hand
2. **Gesture Recognition**: Finger counting algorithm classifies hand positions
3. **Control Mapping**: Gestures are mapped to audio controls based on the active mode
4. **Smooth Transitions**: Volume and playback rate changes are interpolated for natural feel
5. **Visual Feedback**: Real-time visualization shows detected hands and recognized gestures

## 🛠️ Customization

### Adjusting Gesture Sensitivity

Edit `hand-tracker.js`:
```javascript
// Change detection confidence (0.0 - 1.0)
this.hands.setOptions({
    minDetectionConfidence: 0.75,  // Lower = more sensitive
    minTrackingConfidence: 0.75
});
```

### Modifying Control Mappings

Edit `app.js` in the `handleStaticMode()` or `handleSliderMode()` functions:
```javascript
// Change volume levels
const volumeMap = {
    'One Finger': 0.25,    // Change these values
    'Two Fingers': 0.5,
    'Three Fingers': 0.75,
    'Four Fingers': 1.0
};
```

### Changing Colors

Edit `styles.css`:
```css
/* Main background */
body {
    background-color: #121212;  /* Change this */
}

/* Accent color for playing state */
.state-playing {
    color: #66BB6A;  /* Change this */
}
```

## 🐛 Troubleshooting

### Camera Not Working
- **Check permissions**: Ensure you've granted camera access
- **HTTPS/Localhost only**: Browsers require secure context for camera access
- **Check other apps**: Close other apps using your webcam

### Gestures Not Recognized
- **Lighting**: Ensure good lighting conditions
- **Distance**: Keep hands at a comfortable distance from camera (2-3 feet)
- **Background**: Plain backgrounds work best
- **Hand orientation**: Keep palms facing the camera

### Audio Not Playing
- **File format**: Ensure you're using MP3 files
- **Browser support**: Try a different browser (Chrome recommended)
- **User interaction**: Some browsers require user interaction before playing audio

### Poor Performance
- **Close tabs**: Close unnecessary browser tabs
- **Update browser**: Ensure you're using the latest browser version
- **Hardware**: Older computers may struggle with real-time video processing

## 🔮 Future Enhancements

Possible features to add:
- [ ] Playlist support with gesture navigation
- [ ] Gesture recording and custom mappings
- [ ] Mobile device support
- [ ] Multiple audio format support (WAV, OGG)
- [ ] Visual equalizer
- [ ] Gesture training mode
- [ ] Export/import gesture configurations

## 📜 License & Attribution

This project uses:
- **MediaPipe Hands** by Google ([Apache 2.0 License](https://github.com/google/mediapipe/blob/master/LICENSE))
- Gesture recognition concepts from the original Python MaestroBOT

Original Python version: [MaestroBOT](https://github.com/baonguy3n/MaestroBOT)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 💡 Tips for Best Results

1. **Use good lighting** - Bright, even lighting helps hand detection
2. **Plain background** - Reduces false detections
3. **Smooth movements** - Sudden movements may not register
4. **Practice gestures** - Spend a few minutes learning the gestures
5. **Center your hands** - Keep hands in the center of the camera frame
6. **One gesture at a time** - Wait for cooldown between gestures

## 📞 Support

Having issues? Check:
1. This README's troubleshooting section
2. Browser console for error messages (F12)
3. Camera and microphone permissions in browser settings

---

**Enjoy conducting your music! 🎵🎼✨**