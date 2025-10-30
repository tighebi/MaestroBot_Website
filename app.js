// app.js - Main application logic and music controller

// Sidebar toggle
document.getElementById('toggle-sidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('hidden');
});

class MusicController {
    constructor() {
        // DOM Elements
        this.audio = document.getElementById('audio');
        this.fileInput = document.getElementById('file-input');
        this.loadBtn = document.getElementById('load-btn');
        this.playBtn = document.getElementById('play-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.cameraBtn = document.getElementById('camera-btn');
        this.fileStatus = document.getElementById('file-status');
        this.actionStatus = document.getElementById('action-status');
        this.stateStatus = document.getElementById('state-status');
        this.videoOverlay = document.getElementById('video-overlay');
        
        // Tab elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanes = document.querySelectorAll('.tab-pane');
        
        // State
        this.isPlaying = false;
        this.isPaused = false;
        this.cameraOn = false;
        this.volume = 0.6; // 0-1 range
        this.playbackRate = 1.0;
        this.targetVolume = 0.6;
        this.targetRate = 1.0;
        this.controlMode = 'slider'; // 'static' or 'slider'
        
        // Fading state
        this.isFading = false;
        this.fadeInterval = null;
        
        // Slider control state
        this.prevSliderData = { x: null, y: null };
        this.SLIDER_DEADZONE_X = 15;
        this.SLIDER_DEADZONE_Y = 10;
        
        // Hand tracker
        this.handTracker = new HandTracker();
        
        // Initialize
        this.init();
    }
    
    async init() {
        // Set up event listeners
        this.loadBtn.addEventListener('click', () => this.loadFile());
        this.playBtn.addEventListener('click', () => this.playManual());
        this.pauseBtn.addEventListener('click', () => this.pauseManual());
        this.stopBtn.addEventListener('click', () => this.stopManual());
        this.cameraBtn.addEventListener('click', () => this.toggleCamera());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // Audio events
        this.audio.addEventListener('ended', () => this.onAudioEnded());
        this.audio.addEventListener('play', () => this.updateStateLabel());
        this.audio.addEventListener('pause', () => this.updateStateLabel());
        
        // Set initial audio properties
        this.audio.volume = this.volume;
        this.audio.playbackRate = this.playbackRate;
        
        // Initialize hand tracker
        await this.handTracker.initialize();
        this.handTracker.onGestureDetected = (hands) => this.handleGesture(hands);
        
        // Start smooth update loop
        setInterval(() => this.smoothUpdateLoop(), 50);
        
        // Update state label
        this.updateStateLabel();
    }
    
    switchTab(tabName) {
        // Update tab buttons
        this.tabBtns.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update tab panes
        this.tabPanes.forEach(pane => {
            if (pane.id === `${tabName}-tab`) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });
        
        // Update control mode
        this.controlMode = tabName;
        this.targetVolume = this.volume;
        this.targetRate = this.playbackRate;
        this.prevSliderData = { x: null, y: null };
        
        console.log(`Control mode changed to: ${this.controlMode}`);
    }
    
    async toggleCamera() {
        if (this.cameraOn) {
            // Turn off
            this.handTracker.stop();
            this.cameraOn = false;
            this.cameraBtn.textContent = 'Start Camera';
            this.cameraBtn.classList.remove('active');
            this.videoOverlay.textContent = 'Camera Off';
            this.videoOverlay.classList.remove('hidden');
            this.actionStatus.textContent = '(camera off)';
        } else {
            // Turn on
            const success = await this.handTracker.start();
            if (success) {
                this.cameraOn = true;
                this.cameraBtn.textContent = 'Stop Camera';
                this.cameraBtn.classList.add('active');
                this.videoOverlay.classList.add('hidden');
                this.actionStatus.textContent = '(waiting)';
            }
        }
    }
    
    loadFile() {
        this.fileInput.click();
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const url = URL.createObjectURL(file);
        this.audio.src = url;
        this.fileStatus.textContent = file.name;
        this.playManual();
    }
    
    playManual() {
        if (this.isFading || !this.audio.src) return;
        
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.isPaused = false;
            this.audio.volume = this.targetVolume;
            this.audio.playbackRate = this.targetRate;
            this.updateStateLabel();
        }).catch(err => {
            console.error('Play failed:', err);
        });
    }
    
    pauseManual() {
        if (this.isFading) return;
        
        if (this.isPlaying && !this.isPaused) {
            this.audio.pause();
            this.isPaused = true;
            this.isPlaying = false;
            this.updateStateLabel();
        }
    }
    
    stopManual() {
        if (this.isFading) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
            this.isFading = false;
        }
        
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.volume = 0.6;
        this.targetVolume = 0.6;
        this.playbackRate = 1.0;
        this.targetRate = 1.0;
        this.audio.volume = this.volume;
        this.audio.playbackRate = this.playbackRate;
        this.updateStateLabel();
    }
    
    fadeAndPause() {
        if (!this.isPlaying || this.isPaused || this.isFading) return;
        
        this.isFading = true;
        const originalVolume = this.audio.volume;
        const fadeSteps = 10;
        const stepDuration = 50; // ms
        let currentStep = 0;
        
        this.fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = originalVolume * (1 - currentStep / fadeSteps);
            
            if (currentStep >= fadeSteps || newVolume <= 0) {
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
                this.audio.pause();
                this.audio.volume = originalVolume;
                this.isPaused = true;
                this.isPlaying = false;
                this.isFading = false;
                this.updateStateLabel();
            } else {
                this.audio.volume = newVolume;
            }
        }, stepDuration);
    }
    
    onAudioEnded() {
        this.isPlaying = false;
        this.isPaused = false;
        this.updateStateLabel();
    }
    
    smoothUpdateLoop() {
        if (this.isFading) return;
        
        let changed = false;
        
        // Smooth volume transitions
        if (Math.abs(this.targetVolume - this.volume) > 0.01) {
            const step = this.targetVolume > this.volume ? 0.02 : -0.02;
            this.volume = Math.max(0, Math.min(1, this.volume + step));
            this.audio.volume = this.volume;
            changed = true;
        }
        
        // Smooth rate transitions
        if (Math.abs(this.targetRate - this.playbackRate) > 0.02) {
            const step = this.targetRate > this.playbackRate ? 0.05 : -0.05;
            this.playbackRate = Math.max(0.25, Math.min(3.0, this.playbackRate + step));
            this.audio.playbackRate = this.playbackRate;
            changed = true;
        }
        
        if (changed) {
            this.updateStateLabel();
        }
    }
    
    handleGesture(hands) {
        if (!this.cameraOn || this.isFading) return;
        
        const leftHand = hands.left;
        const rightHand = hands.right;
        
        // Update action status
        const leftGesture = leftHand ? leftHand.gesture : 'No Hand';
        const rightGesture = rightHand ? rightHand.gesture : 'No Hand';
        
        if (!leftHand && !rightHand) {
            this.actionStatus.textContent = '(no hands)';
            this.prevSliderData = { x: null, y: null };
            return;
        }
        
        this.actionStatus.textContent = `L: ${leftGesture} | R: ${rightGesture}`;
        
        // Route to appropriate handler
        if (this.controlMode === 'static') {
            this.handleStaticMode(leftHand, rightHand);
        } else {
            this.handleSliderMode(leftHand, rightHand);
        }
    }
    
    handleStaticMode(leftHand, rightHand) {
        const leftGesture = leftHand ? leftHand.gesture : null;
        const rightGesture = rightHand ? rightHand.gesture : null;
        
        // Playback control - both hands
        if (leftGesture === 'Open Hand' && rightGesture === 'Open Hand') {
            if (!this.isPlaying || this.isPaused) {
                this.playManual();
            }
        } else if (leftGesture === 'Closed Fist' && rightGesture === 'Closed Fist') {
            if (this.isPlaying && !this.isPaused) {
                this.fadeAndPause();
            }
        }
        
        // Volume control - left hand
        if (leftHand) {
            const volumeMap = {
                '1 Finger': 0.25,
                '2 Fingers': 0.5,
                '3 Fingers': 0.75,
                '4 Fingers': 1.0
            };
            
            if (volumeMap[leftGesture] !== undefined) {
                this.targetVolume = volumeMap[leftGesture];
            }
        }
        
        // Speed control - right hand
        if (rightHand) {
            const rateMap = {
                '1 Finger': 0.5,
                '2 Fingers': 0.75,
                '3 Fingers': 1.0,
                '4 Fingers': 1.5
            };
            
            if (rateMap[rightGesture] !== undefined) {
                this.targetRate = rateMap[rightGesture];
            }
        }
    }
    
    handleSliderMode(leftHand, rightHand) {
        const leftGesture = leftHand ? leftHand.gesture : null;
        const rightGesture = rightHand ? rightHand.gesture : null;
        
        // Playback control - left hand only
        if (leftGesture === 'Open Hand') {
            if (!this.isPlaying || this.isPaused) {
                this.playManual();
            }
        } else if (leftGesture === 'Closed Fist') {
            if (this.isPlaying && !this.isPaused) {
                this.fadeAndPause();
            }
        }
        
        // Slider controls - right hand
        if (rightHand) {
            const currentX = rightHand.x;
            const currentY = rightHand.y;
            const prevX = this.prevSliderData.x;
            const prevY = this.prevSliderData.y;
            
            // Speed control - horizontal movement with open hand
            if (rightGesture === 'Open Hand') {
                if (prevX !== null) {
                    const deltaX = currentX - prevX;
                    if (Math.abs(deltaX) > this.SLIDER_DEADZONE_X) {
                        const newRate = this.playbackRate + (deltaX * 0.005);
                        this.playbackRate = Math.max(0.25, Math.min(3.0, newRate));
                        this.targetRate = this.playbackRate;
                        this.audio.playbackRate = this.playbackRate;
                        this.updateStateLabel();
                    }
                }
                this.prevSliderData.x = currentX;
                this.prevSliderData.y = null;
            }
            // Volume control - vertical movement with closed fist
            else if (rightGesture === 'Closed Fist') {
                if (prevY !== null) {
                    const deltaY = currentY - prevY;
                    if (Math.abs(deltaY) > this.SLIDER_DEADZONE_Y) {
                        const newVolume = this.volume - (deltaY * 0.002);
                        this.volume = Math.max(0, Math.min(1, newVolume));
                        this.targetVolume = this.volume;
                        this.audio.volume = this.volume;
                        this.updateStateLabel();
                    }
                }
                this.prevSliderData.y = currentY;
                this.prevSliderData.x = null;
            } else {
                this.prevSliderData = { x: null, y: null };
            }
        } else {
            this.prevSliderData = { x: null, y: null };
        }
    }
    
    updateStateLabel() {
        let state = 'stopped';
        let stateClass = 'state-stopped';
        
        if (this.isPlaying && !this.isPaused && !this.audio.paused) {
            state = 'playing';
            stateClass = 'state-playing';
        } else if (this.isPaused || this.audio.paused) {
            state = 'paused';
            stateClass = 'state-paused';
        }
        
        const volumePercent = Math.round(this.volume * 100);
        const rateStr = this.playbackRate.toFixed(2);
        
        this.stateStatus.textContent = `State: ${state} | Volume: ${volumePercent} | Rate: ${rateStr}x`;
        this.stateStatus.className = stateClass;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.musicController = new MusicController();
});