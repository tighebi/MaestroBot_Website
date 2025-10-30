// hand-tracker.js - Hand tracking and gesture recognition using MediaPipe

class HandTracker {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.canvasCtx = this.canvas.getContext('2d');
        this.isRunning = false;
        
        // Gesture callback
        this.onGestureDetected = null;
        
        // Landmark indices
        this.TIP_IDS = [4, 8, 12, 16, 20];
    }
    
    // Helper function to calculate the Euclidean distance between two landmarks
    distance(p1, p2) {
        // We use Math.pow(x, 2) instead of x * x for clarity
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
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
        if (this.isRunning) return true;
        
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
        
        if (results.multiHandLandmarks && results.multiHandedness) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const landmarks = results.multiHandLandmarks[i];
                const handedness = results.multiHandedness[i];
                const label = handedness.label; // Keep original label (no flip)
                
                // Draw hand landmarks
                this.drawHandLandmarks(landmarks);
                
                // Count fingers and classify gesture
                // FIXED: Passing the 'label' argument (Line ~217)
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
            [0, 1], [1, 2], [2, 3], [3, 4],  // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8],  // Index
            [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
            [0, 13], [13, 14], [14, 15], [15, 16],  // Ring
            [0, 17], [17, 18], [18, 19], [19, 20],  // Pinky
            [5, 9], [9, 13], [13, 17]  // Palm
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
    
    // FIXED: Added 'handednessLabel' parameter to the function definition (Line ~263)
    countFingers(landmarks, handednessLabel) { 
        const fingersUp = [];
        
        // --- 1. Thumb Check (L4) ---
        // This logic is designed to correctly detect a tightly closed fist by checking 
        // the thumb's bend (L4 relative to L3) both vertically and horizontally.

        let finalThumbIsUp = 1; // Assume up initially

        // Check 1: Vertical Position - Is the thumb tip (L4) bent down past its PIP joint (L3)?
        // If L4.y is lower (larger) than L3.y, it's bent.
        if (landmarks[4].y > landmarks[3].y) {
            finalThumbIsUp = 0;
        }

        // Check 2: Horizontal Position - Is the thumb tucked in across the palm (crossing L3)?
        if (handednessLabel === 'Right') {
            // For a right hand, if L4.x is to the right (larger) of L3.x, it's tucked in.
            if (landmarks[4].x > landmarks[3].x) {
                finalThumbIsUp = 0;
            }
        } else { // Left hand
            // For a left hand, if L4.x is to the left (smaller) of L3.x, it's tucked in.
            if (landmarks[4].x < landmarks[3].x) {
                finalThumbIsUp = 0;
            }
        }
        
        fingersUp.push(finalThumbIsUp);
        
        // --- 2. Other Fingers (L8, 12, 16, 20) ---
        // Check if the tip's Y-coordinate is higher (smaller value) than the PIP joint's Y-coordinate.
        for (let i = 1; i < this.TIP_IDS.length; i++) {
            const tipId = this.TIP_IDS[i];
            const tipY = landmarks[tipId].y;
            const pipY = landmarks[tipId - 2].y; // PIP joint is two points before the tip
            
            // In normalized coordinates (0,0 is top-left), tipY < pipY means the finger is extended upwards
            fingersUp.push(tipY < pipY ? 1 : 0);
        }
        
        return fingersUp;
    }
    
    classifyGesture(fingersUp) {
        const total = fingersUp.reduce((a, b) => a + b, 0);
        
        // Simple count-based classification
        if (total === 0) return 'Closed Fist'; // This is your 'closed well'
        if (total === 5) return 'Open Hand';
        if (total === 1) return '1 Finger';
        if (total === 2) return '2 Fingers';
        if (total === 3) return '3 Fingers';
        if (total === 4) return '4 Fingers';
        
        return 'Other';
    }
}

// Export for use in app.js
window.HandTracker = HandTracker;
