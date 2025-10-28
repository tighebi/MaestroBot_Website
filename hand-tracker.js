// hand-tracker.js - Hand tracking and gesture recognition using MediaPipe

class HandTracker {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.canvasCtx = this.canvas.getContext('2d');
        this.isRunning = false;
        
        // Gesture tracking state
        this.prevHandData = {};
        this.GESTURE_COOLDOWN = 500; // milliseconds
        this.lastGestureTime = { left: 0, right: 0 };
        
        // Gesture callback
        this.onGestureDetected = null;
        
        // Landmark indices
        this.TIP_IDS = [4, 8, 12, 16, 20];
    }
    
    async initialize() {
        // Initialize MediaPipe Hands
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });
        
        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.75,
            minTrackingConfidence: 0.75
        });
        
        this.hands.onResults((results) => this.onResults(results));
        
        // Set up canvas size
        this.canvas.width = 640;
        this.canvas.height = 480;
    }
    
    async start() {
        if (this.isRunning) return;
        
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            
            this.video.srcObject = stream;
            this.isRunning = true;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => resolve();
            });
            
            // Start camera processing
            this.camera = new Camera(this.video, {
                onFrame: async () => {
                    await this.hands.send({ image: this.video });
                },
                width: 640,
                height: 480
            });
            
            await this.camera.start();
            return true;
        } catch (error) {
            console.error('Error starting camera:', error);
            return false;
        }
    }
    
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        
        if (this.camera) {
            this.camera.stop();
            this.camera = null;
        }
        
        if (this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.video.srcObject = null;
        }
        
        // Clear canvas
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    onResults(results) {
        // Clear canvas
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const detectedHands = { left: null, right: null };
        const currentTime = Date.now();
        
        if (results.multiHandLandmarks && results.multiHandedness) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const landmarks = results.multiHandLandmarks[i];
                const handedness = results.multiHandedness[i];
                const label = handedness.label; // 'Left' or 'Right'
                
                // Draw hand landmarks
                this.drawHandLandmarks(landmarks);
                
                // Count fingers and classify gesture
                const fingersUp = this.countFingers(landmarks, label);
                const gesture = this.classifyGesture(fingersUp);
                
                // Get wrist position
                const wrist = landmarks[0];
                const x = Math.floor(wrist.x * this.canvas.width);
                const y = Math.floor(wrist.y * this.canvas.height);
                
                // Store detected hand data
                detectedHands[label.toLowerCase()] = {
                    gesture: gesture,
                    x: x,
                    y: y,
                    fingersUp: fingersUp
                };
                
                // Draw gesture label on canvas
                this.drawGestureLabel(label, gesture, x, y);
            }
        }
        
        this.canvasCtx.restore();
        
        // Trigger callback with detected gestures
        if (this.onGestureDetected) {
            this.onGestureDetected(detectedHands);
        }
    }
    
    drawHandLandmarks(landmarks) {
        // Draw connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],  // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8],  // Index
            [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
            [0, 13], [13, 14], [14, 15], [15, 16],  // Ring
            [0, 17], [17, 18], [18, 19], [19, 20],  // Pinky
            [5, 9], [9, 13], [13, 17]  // Palm
        ];
        
        this.canvasCtx.strokeStyle = '#F542E6';
        this.canvasCtx.lineWidth = 2;
        
        for (const [start, end] of connections) {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            
            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(startPoint.x * this.canvas.width, startPoint.y * this.canvas.height);
            this.canvasCtx.lineTo(endPoint.x * this.canvas.width, endPoint.y * this.canvas.height);
            this.canvasCtx.stroke();
        }
        
        // Draw landmarks
        this.canvasCtx.fillStyle = '#F57542';
        for (const landmark of landmarks) {
            const x = landmark.x * this.canvas.width;
            const y = landmark.y * this.canvas.height;
            
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(x, y, 4, 0, 2 * Math.PI);
            this.canvasCtx.fill();
        }
    }
    
    drawGestureLabel(label, gesture, x, y) {
        this.canvasCtx.font = 'bold 18px Segoe UI';
        this.canvasCtx.fillStyle = '#00FF00';
        this.canvasCtx.strokeStyle = '#000000';
        this.canvasCtx.lineWidth = 3;
        
        const text = `${label}: ${gesture}`;
        const textX = x - 70;
        const textY = y - 30;
        
        this.canvasCtx.strokeText(text, textX, textY);
        this.canvasCtx.fillText(text, textX, textY);
    }
    
    countFingers(landmarks, label) {
        const fingersUp = [];
        
        // Thumb detection (horizontal movement)
        const thumbTipX = landmarks[this.TIP_IDS[0]].x;
        const thumbIpX = landmarks[this.TIP_IDS[0] - 1].x;
        
        if (label === 'Right') {
            fingersUp.push(thumbTipX < thumbIpX ? 1 : 0);
        } else {
            fingersUp.push(thumbTipX > thumbIpX ? 1 : 0);
        }
        
        // Other fingers (vertical extension)
        for (let i = 1; i < this.TIP_IDS.length; i++) {
            const tipId = this.TIP_IDS[i];
            const tipY = landmarks[tipId].y;
            const pipY = landmarks[tipId - 2].y;
            
            fingersUp.push(tipY < pipY ? 1 : 0);
        }
        
        return fingersUp;
    }
    
    classifyGesture(fingersUp) {
        const total = fingersUp.reduce((a, b) => a + b, 0);
        
        // Check for specific patterns
        if (total === 1 && (fingersUp[1] === 1 || fingersUp[0] === 1)) {
            return 'One Finger';
        } else if (total === 2 && fingersUp[1] === 1 && fingersUp[2] === 1) {
            return 'Two Fingers';
        } else if (total === 3 && fingersUp[1] === 1 && fingersUp[2] === 1 && fingersUp[3] === 1) {
            return 'Three Fingers';
        } else if (total === 4 && fingersUp.slice(1).every(f => f === 1)) {
            return 'Four Fingers';
        } else if (total === 5) {
            return 'Open Hand';
        } else if (total === 0) {
            return 'Closed Fist';
        }
        
        return 'Other';
    }
}

// Export for use in app.js
window.HandTracker = HandTracker;