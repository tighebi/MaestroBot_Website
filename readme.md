🎵 MaestroBOT - Web Edition (Improved)
Control music playback with hand gestures using your webcam! This is the improved web-based version of MaestroBOT, built with HTML5, JavaScript, and MediaPipe.

Show Image
Show Image

🌟 New Features
✅ Fixed Camera Orientation: Camera now shows hands correctly (left is left, right is right)
✅ Improved Finger Recognition: Counts any extended fingers (0-5), regardless of order
✅ Collapsible Sidebar: Instructions hidden by default, toggle with button
✅ No MP3 Warnings: Removed annoying alert popups
🎨 Dark Mode UI: Sleek, modern interface
🎵 Two Control Modes: Static gestures and dynamic sliders
🎮 Gesture Controls
Static Gestures Mode
Playback (Both Hands Together):

🖐️🖐️ Both Hands Open → Play/Resume
✊✊ Both Hands Closed → Fade to Pause
Volume (Left Hand):

☝️ 1 Finger Extended → 25%
✌️ 2 Fingers Extended → 50%
🤟 3 Fingers Extended → 75%
🖖 4 Fingers Extended → 100%
Speed (Right Hand):

☝️ 1 Finger Extended → 0.50x
✌️ 2 Fingers Extended → 0.75x
🤟 3 Fingers Extended → 1.00x
🖖 4 Fingers Extended → 1.50x
Slider Controls Mode
Playback (Left Hand):

🖐️ Open Hand → Play/Resume
✊ Closed Fist → Fade to Pause
Dynamic Controls (Right Hand):

🖐️ Open Hand + Move Left/Right → Adjust Speed
✊ Closed Fist + Move Up/Down → Adjust Volume
🚀 Quick Start
Installation
Download all files to a folder:
index.html
styles.css
app.js
hand-tracker.js
README.md
Running the App
Option 1: Direct File Opening (Simplest)
Open index.html in a modern web browser (Chrome, Edge, or Firefox recommended)
Click "Start Camera" and allow webcam access
Click "Load MP3" to select your music file
Start conducting! 🎵
Option 2: Local Web Server (Recommended)
For the best experience, run a local web server:

Using Python:

bash
# Navigate to the project folder
cd maestrobot-web

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
Using Node.js:

bash
# Install http-server globally (one time)
npm install -g http-server

# Run server
http-server -p 8000
Using VS Code:

Install the "Live Server" extension
Right-click index.html
Select "Open with Live Server"
Then open your browser to http://localhost:8000

📋 Requirements
Browser Requirements:
Modern web browser with WebRTC support:
✅ Google Chrome (recommended)
✅ Microsoft Edge
✅ Firefox
✅ Safari 11+
System Requirements:
Working webcam
Stable internet connection (for loading MediaPipe libraries from CDN)
MP3 audio files
Permissions:
Camera access (you'll be prompted when starting the app)
🗂️ Project Structure
maestrobot-web/
├── index.html          # Main HTML structure and layout
├── styles.css          # Dark mode styling and responsive design
├── app.js              # Music controller and application logic
├── hand-tracker.js     # MediaPipe integration and gesture recognition
└── README.md           # This file
🎯 How It Works
Hand Tracking: MediaPipe Hands detects up to 2 hands and tracks 21 landmarks per hand
Gesture Recognition: Counts extended fingers (thumb + 4 fingers = 0 to 5 total)
Control Mapping: Gestures are mapped to audio controls based on the active mode
Smooth Transitions: Volume and playback rate changes are interpolated for natural feel
Visual Feedback: Real-time visualization shows detected hands and recognized gestures
🛠️ Customization
Adjusting Gesture Sensitivity
Edit hand-tracker.js:

javascript
// Change detection confidence (0.0 - 1.0)
this.hands.setOptions({
    minDetectionConfidence: 0.75,  // Lower = more sensitive
    minTrackingConfidence: 0.75
});
Modifying Control Mappings
Edit app.js in the handleStaticMode() function:

javascript
// Change volume levels
const volumeMap = {
    '1 Finger': 0.25,    // Change these values
    '2 Fingers': 0.5,
    '3 Fingers': 0.75,
    '4 Fingers': 1.0
};

// Change speed levels
const rateMap = {
    '1 Finger': 0.5,     // Change these values
    '2 Fingers': 0.75,
    '3 Fingers': 1.0,
    '4 Fingers': 1.5
};
Changing Slider Sensitivity
Edit app.js in the constructor:

javascript
this.SLIDER_DEADZONE_X = 15;  // Horizontal deadzone (speed)
this.SLIDER_DEADZONE_Y = 10;  // Vertical deadzone (volume)
Lower values = more sensitive, higher values = less sensitive

Changing Colors
Edit styles.css:

css
/* Main background */
body {
    background-color: #121212;  /* Change this */
}

/* Accent color for playing state */
.state-playing {
    color: #66BB6A;  /* Change this */
}
🐛 Troubleshooting
Camera Not Working
Check permissions: Ensure you've granted camera access
HTTPS/Localhost only: Browsers require secure context for camera access
Check other apps: Close other apps using your webcam
Try different browser: Chrome usually has the best WebRTC support
Gestures Not Recognized
Lighting: Ensure good lighting conditions
Distance: Keep hands at a comfortable distance from camera (2-3 feet)
Background: Plain backgrounds work best
Hand orientation: Keep palms facing the camera
Finger extension: Make sure fingers are fully extended or fully closed
Audio Not Playing
File format: Ensure you're using MP3 files
Browser support: Try a different browser (Chrome recommended)
User interaction: Some browsers require user interaction before playing audio
Check console: Press F12 and check for errors
Poor Performance
Close tabs: Close unnecessary browser tabs
Update browser: Ensure you're using the latest browser version
Hardware: Older computers may struggle with real-time video processing
Lower complexity: Edit hand-tracker.js and change modelComplexity: 0
💡 Tips for Best Results
Use good lighting - Bright, even lighting helps hand detection
Plain background - Reduces false detections
Smooth movements - Sudden movements may not register well in slider mode
Practice gestures - Spend a few minutes learning the finger counts
Center your hands - Keep hands in the center of the camera frame
Consistent finger positions - Fully extend or fully close fingers for best recognition
🔮 Future Enhancement Ideas
Possible features to add:

 Playlist support with gesture navigation
 Two-hand pinch & pull gestures for intuitive volume control
 Swipe gestures for skip forward/backward
 Visual zone overlay for hovering controls
 Hand distance-based control (closer = louder)
 Palm rotation for speed control
 Gesture recording and custom mappings
 Mobile device support
 Multiple audio format support (WAV, OGG, FLAC)
 Visual equalizer
 Gesture training mode
 Export/import gesture configurations
📜 License & Attribution
This project uses:

MediaPipe Hands by Google (Apache 2.0 License)
Gesture recognition concepts from the original Python MaestroBOT
Original Python version: MaestroBOT

🤝 Contributing
Contributions are welcome! Feel free to:

Report bugs
Suggest new features
Submit pull requests
Improve documentation
📞 Support
Having issues? Check:

This README's troubleshooting section
Browser console for error messages (F12)
Camera and microphone permissions in browser settings
MediaPipe compatibility: https://google.github.io/mediapipe/
🎼 Key Improvements in This Version
What Changed:
Camera now reads correctly - No more mirror flip confusion!
Simpler finger counting - Any fingers extended = that number (0-5)
Hidden instructions - Click "☰ Instructions" button to show/hide
No annoying alerts - Removed MP3 warning popup
Better UX - Cleaner layout with sidebar
Technical Details:
Removed scaleX(-1) transform from video/canvas
Simplified countFingers() to count any extended fingers
Added collapsible sidebar with CSS transitions
Removed alert() calls for better user experience
Updated gesture labels from "One Finger" to "1 Finger" etc.
Enjoy conducting your music! 🎵🎼✨

