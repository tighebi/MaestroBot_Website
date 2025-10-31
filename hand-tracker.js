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
                const label = handedness.label === 'Left' ? 'Right' : 'Left';
                
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
    
    // Save the current canvas state (un-flipped)
    this.canvasCtx.save();
    
    // Move origin to the text's drawing position
    this.canvasCtx.translate(textX, textY);
    
    // Horizontally flip the drawing context
    this.canvasCtx.scale(-1, 1); 
    
    // Draw the text at the new (0,0) origin.
    // This text is now mirrored *on the canvas*.
    this.canvasCtx.strokeText(text, 0, 0);
    this.canvasCtx.fillText(text, 0, 0);
    
    // Restore the canvas to its original state.
    // The CSS flip will now "un-mirror" this mirrored text, making it readable.
    this.canvasCtx.restore();
}
    
countFingers(landmarks, handednessLabel) { 
    const fingersUp = [];
    
    // --- 1. Thumb Check (L4) ---
    
    // Start by assuming the thumb is down (0)
    let finalThumbIsUp = 0; 
    
    // Get coordinates for thumb landmarks
    const thumbTipY = landmarks[4].y;
    const thumbIpY = landmarks[3].y;  // IP joint (Interphalangeal)
    const thumbTipX = landmarks[4].x;
    const thumbIpX = landmarks[3].x;

    // Check 1: Vertical extension
    // Is the tip (L4) higher than the IP joint (L3)?
    const verticallyExtended = thumbTipY < thumbIpY;
    
    // Check 2: Horizontal extension
    // Is the tip (L4) horizontally further from the palm than the IP joint (L3)?
    // This logic is based on the *original mirrored video* coordinates.
    let horizontallyExtended = false;
    
    if (handednessLabel === 'Right') {
        // An actual RIGHT hand looks like a LEFT hand in the mirrored video.
        // On that mirrored "left hand", the thumb is on the right side.
        // It's "extended" if its X is GREATER than the joint X.
        horizontallyExtended = thumbTipX > thumbIpX;
    } else { // 'Left'
        // An actual LEFT hand looks like a RIGHT hand in the mirrored video.
        // On that mirrored "right hand", the thumb is on the left side.
        // It's "extended" if its X is LESS than the joint X.
        horizontallyExtended = thumbTipX < thumbIpX;
    }

    // The thumb is only "UP" if it's extended in *both* directions.
    if (verticallyExtended && horizontallyExtended) {
        finalThumbIsUp = 1;
    }
    
    fingersUp.push(finalThumbIsUp);
    
    // --- 2. Other Fingers (L8, 12, 16, 20) ---
    
    // Check if the tip's Y-coordinate is higher (smaller value) 
    // than the PIP joint's Y-coordinate.
    for (let i = 1; i < this.TIP_IDS.length; i++) {
        const tipId = this.TIP_IDS[i];
        const tipY = landmarks[tipId].y;
        const pipY = landmarks[tipId - 2].y; // PIP joint is two points before the tip
        
        // tipY < pipY means the finger is extended upwards
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
