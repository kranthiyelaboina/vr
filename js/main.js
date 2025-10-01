/**
 * VYOMA VR THERAPY PLATFORM
 * Main JavaScript Controller
 * Handles WebXR, YouTube 360° playback, PWA functionality
 */

// ========================================
// GLOBAL VARIABLES
// ========================================

let player = null;
let currentSessionId = null;
let isVRSupported = false;
let vrSession = null;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let currentRotationX = 0;
let currentRotationY = 0;
let autoHideTimeout = null;
let qualityCheckInterval = null;
let progressInterval = null;
let deferredPrompt = null;
let config = null;

// ========================================
// CONFIGURATION LOADER
// ========================================

async function loadConfig() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
        console.log('Configuration loaded:', config);
    } catch (error) {
        console.error('Failed to load configuration:', error);
        // Fallback configuration
        config = {
            sessions: [
                {
                    id: "eKumVFvGHFA",
                    title: "Cosmic Meditation Journey",
                    description: "Experience the infinite cosmos for deep relaxation"
                },
                {
                    id: "7AkbUfZjS5k",
                    title: "Forest Bathing Therapy",
                    description: "Connect with nature for anxiety relief and grounding"
                },
                {
                    id: "jqq_ZdD5Zwg",
                    title: "Ocean Wave Mindfulness",
                    description: "Find peace with rhythmic ocean waves and breathwork"
                }
            ],
            quality: {
                preferred: "highres",
                fallback: "hd1080",
                forceMaxQuality: true,
                checkInterval: 5000
            },
            immersive: {
                autoHideControls: true,
                hideDelay: 5000,
                enableLoop: true,
                startMuted: false
            }
        };
    }
}

// ========================================
// INITIALIZATION
// ========================================

window.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    initializeApp();
    checkWebXRSupport();
    setupServiceWorker();
    setupInstallPrompt();
    setupScrollEffects();
});

function initializeApp() {
    console.log('Vyoma VR Therapy Platform Initializing...');
    
    // Setup YouTube API
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    
    // Setup navigation scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('mainNav');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ========================================
// WEBXR SUPPORT CHECK
// ========================================

async function checkWebXRSupport() {
    if ('xr' in navigator) {
        try {
            isVRSupported = await navigator.xr.isSessionSupported('immersive-vr');
            if (isVRSupported) {
                console.log('WebXR VR is supported!');
                showVRButton();
            } else {
                console.log('WebXR is available but VR is not supported');
            }
        } catch (error) {
            console.log('Error checking WebXR support:', error);
        }
    } else {
        console.log('WebXR is not available');
    }
}

function showVRButton() {
    const vrBtn = document.getElementById('vrBtn');
    if (vrBtn) {
        vrBtn.style.display = 'flex';
    }
}

// ========================================
// YOUTUBE PLAYER SETUP
// ========================================

function onYouTubeIframeAPIReady() {
    console.log('YouTube IFrame API Ready');
}

function createYouTubePlayer(videoId) {
    // Destroy existing player if it exists
    if (player) {
        player.destroy();
        player = null;
    }
    
    // Create new player with aggressive parameters to hide YouTube UI
    player = new YT.Player('youtubePlayer', {
        videoId: videoId,
        playerVars: {
            // Core parameters to hide UI
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            cc_load_policy: 0,
            
            // Quality settings
            vq: 'highres',
            quality: 'highres',
            
            // Playback settings
            loop: 1,
            playlist: videoId, // Required for loop to work
            
            // Additional hiding parameters
            autohide: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            widget_referrer: window.location.origin,
            
            // Mute initially (can unmute after user interaction)
            mute: 0,
            
            // Start from beginning
            start: 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    console.log('Player ready');
    
    // Force highest quality
    if (config.quality.forceMaxQuality) {
        forceMaxQuality();
    }
    
    // Hide loading indicator
    document.getElementById('loadingIndicator').style.display = 'none';
    
    // Start playback
    event.target.playVideo();
    
    // Setup quality monitoring
    startQualityMonitoring();
    
    // Setup progress tracking
    startProgressTracking();
    
    // Setup auto-hide for controls
    if (config.immersive.autoHideControls) {
        setupAutoHideControls();
    }
    
    // Show drag hint for non-VR devices
    if (!isVRSupported) {
        showDragHint();
    }
}

function onPlayerStateChange(event) {
    console.log('Player state changed:', event.data);
    
    if (event.data === YT.PlayerState.PLAYING) {
        updatePlayPauseButton(true);
        // Force quality again when playing starts
        setTimeout(forceMaxQuality, 1000);
    } else if (event.data === YT.PlayerState.PAUSED) {
        updatePlayPauseButton(false);
    } else if (event.data === YT.PlayerState.ENDED) {
        // Loop the video
        if (config.immersive.enableLoop) {
            player.playVideo();
        }
    }
}

function onPlayerError(event) {
    console.error('Player error:', event.data);
    alert('Error loading video. Please try again.');
}

// ========================================
// QUALITY MANAGEMENT
// ========================================

function forceMaxQuality() {
    if (!player) return;
    
    const availableQualities = player.getAvailableQualityLevels();
    console.log('Available qualities:', availableQualities);
    
    // Priority order for 360° videos
    const qualityPriority = ['highres', 'hd1080', 'hd720', 'large', 'medium', 'small'];
    
    for (let quality of qualityPriority) {
        if (availableQualities.includes(quality)) {
            player.setPlaybackQuality(quality);
            console.log('Setting quality to:', quality);
            updateQualityDisplay(quality);
            break;
        }
    }
    
    // Also set playback rate to normal
    player.setPlaybackRate(1);
}

function startQualityMonitoring() {
    if (qualityCheckInterval) {
        clearInterval(qualityCheckInterval);
    }
    
    qualityCheckInterval = setInterval(() => {
        if (!player) return;
        
        const currentQuality = player.getPlaybackQuality();
        const bufferPercentage = getBufferPercentage();
        
        updateQualityDisplay(currentQuality);
        updateBufferDisplay(bufferPercentage);
        
        // Force max quality if it dropped
        if (config.quality.forceMaxQuality && currentQuality !== 'highres' && currentQuality !== 'hd1080') {
            forceMaxQuality();
        }
    }, config.quality.checkInterval || 5000);
}

function getBufferPercentage() {
    if (!player || !player.getVideoLoadedFraction) return 0;
    return Math.round(player.getVideoLoadedFraction() * 100);
}

function updateQualityDisplay(quality) {
    const qualityLabel = document.getElementById('qualityLabel');
    const currentQuality = document.getElementById('currentQuality');
    
    const qualityMap = {
        'highres': '4K',
        'hd1080': '1080p',
        'hd720': '720p',
        'large': '480p',
        'medium': '360p',
        'small': '240p'
    };
    
    const displayQuality = qualityMap[quality] || quality;
    
    if (qualityLabel) qualityLabel.textContent = displayQuality;
    if (currentQuality) currentQuality.textContent = displayQuality;
}

function updateBufferDisplay(percentage) {
    const bufferStatus = document.getElementById('bufferStatus');
    if (bufferStatus) {
        bufferStatus.textContent = percentage + '%';
    }
}

function showQualityInfo() {
    const monitor = document.getElementById('qualityMonitor');
    if (monitor) {
        monitor.style.display = monitor.style.display === 'none' ? 'flex' : 'none';
    }
}

// ========================================
// SESSION MANAGEMENT
// ========================================

function startSession(videoId, title, description) {
    console.log('Starting session:', videoId);
    
    currentSessionId = videoId;
    
    // Update modal content
    document.getElementById('sessionTitle').textContent = title;
    document.getElementById('sessionDescription').textContent = description;
    
    // Show modal
    const modal = document.getElementById('immersiveModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';
    
    // Create YouTube player
    setTimeout(() => {
        createYouTubePlayer(videoId);
    }, 500);
    
    // Setup drag controls for 360° viewing
    setupDragControls();
}

function exitSession() {
    console.log('Exiting session');
    
    // Stop and destroy player
    if (player) {
        player.stopVideo();
        player.destroy();
        player = null;
    }
    
    // Clear intervals
    if (qualityCheckInterval) {
        clearInterval(qualityCheckInterval);
        qualityCheckInterval = null;
    }
    
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    
    // Reset rotation
    currentRotationX = 0;
    currentRotationY = 0;
    
    // Hide modal
    const modal = document.getElementById('immersiveModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Show overlay controls
    document.getElementById('immersiveOverlay').classList.remove('hidden');
    
    // Clear auto-hide timeout
    if (autoHideTimeout) {
        clearTimeout(autoHideTimeout);
    }
    
    // Exit VR if active
    if (vrSession) {
        vrSession.end();
        vrSession = null;
    }
}

// ========================================
// PLAYBACK CONTROLS
// ========================================

function togglePlayPause() {
    if (!player) return;
    
    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function updatePlayPauseButton(isPlaying) {
    const btn = document.getElementById('playPauseBtn');
    if (btn) {
        btn.innerHTML = isPlaying ? 
            '<i class="fas fa-pause"></i>' : 
            '<i class="fas fa-play"></i>';
    }
}

function startProgressTracking() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    
    progressInterval = setInterval(() => {
        if (!player || !player.getCurrentTime) return;
        
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        
        if (duration > 0) {
            const percentage = (currentTime / duration) * 100;
            updateProgressBar(percentage);
            updateTimeDisplay(currentTime, duration);
        }
    }, 1000);
}

function updateProgressBar(percentage) {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
}

function updateTimeDisplay(current, duration) {
    const display = document.getElementById('timeDisplay');
    if (display) {
        display.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// ========================================
// 360° DRAG CONTROLS
// ========================================

function setupDragControls() {
    const container = document.getElementById('youtubeContainer');
    if (!container) return;
    
    // Mouse events
    container.addEventListener('mousedown', startDrag);
    container.addEventListener('mousemove', drag);
    container.addEventListener('mouseup', endDrag);
    container.addEventListener('mouseleave', endDrag);
    
    // Touch events
    container.addEventListener('touchstart', startDrag);
    container.addEventListener('touchmove', drag);
    container.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    isDragging = true;
    
    const container = document.getElementById('youtubeContainer');
    container.classList.add('dragging');
    
    if (e.type === 'touchstart') {
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
    } else {
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        e.preventDefault();
    }
}

function drag(e) {
    if (!isDragging) return;
    
    let currentX, currentY;
    
    if (e.type === 'touchmove') {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
    } else {
        currentX = e.clientX;
        currentY = e.clientY;
        e.preventDefault();
    }
    
    const deltaX = currentX - dragStartX;
    const deltaY = currentY - dragStartY;
    
    // Update rotation based on drag
    currentRotationX += deltaX * 0.5;
    currentRotationY = Math.max(-90, Math.min(90, currentRotationY + deltaY * 0.3));
    
    // Apply rotation to player container
    applyRotation();
    
    dragStartX = currentX;
    dragStartY = currentY;
}

function endDrag() {
    isDragging = false;
    const container = document.getElementById('youtubeContainer');
    container.classList.remove('dragging');
}

function applyRotation() {
    const playerElement = document.getElementById('youtubePlayer');
    if (playerElement) {
        playerElement.style.transform = `
            translate(-50%, -50%) 
            rotateX(${-currentRotationY}deg) 
            rotateY(${currentRotationX}deg)
            scale(1.5)
        `;
    }
}

function showDragHint() {
    const hint = document.getElementById('dragHint');
    if (hint) {
        hint.style.opacity = '1';
        setTimeout(() => {
            hint.style.opacity = '0';
        }, 3000);
    }
}

// ========================================
// AUTO-HIDE CONTROLS
// ========================================

function setupAutoHideControls() {
    const overlay = document.getElementById('immersiveOverlay');
    const container = document.getElementById('youtubeContainer');
    
    function showControls() {
        overlay.classList.remove('hidden');
        
        if (autoHideTimeout) {
            clearTimeout(autoHideTimeout);
        }
        
        autoHideTimeout = setTimeout(() => {
            if (!isDragging) {
                overlay.classList.add('hidden');
            }
        }, config.immersive.hideDelay || 5000);
    }
    
    // Show controls on mouse move or touch
    container.addEventListener('mousemove', showControls);
    container.addEventListener('touchstart', showControls);
    
    // Initial hide
    autoHideTimeout = setTimeout(() => {
        overlay.classList.add('hidden');
    }, config.immersive.hideDelay || 5000);
}

// ========================================
// FULLSCREEN MANAGEMENT
// ========================================

function toggleFullscreen() {
    const modal = document.getElementById('immersiveModal');
    
    if (!document.fullscreenElement) {
        modal.requestFullscreen().then(() => {
            updateFullscreenButton(true);
        }).catch(err => {
            console.error('Error entering fullscreen:', err);
        });
    } else {
        document.exitFullscreen().then(() => {
            updateFullscreenButton(false);
        });
    }
}

function updateFullscreenButton(isFullscreen) {
    const btn = document.getElementById('fullscreenBtn');
    if (btn) {
        btn.innerHTML = isFullscreen ? 
            '<i class="fas fa-compress"></i><span class="control-label">Exit Fullscreen</span>' : 
            '<i class="fas fa-expand"></i><span class="control-label">Fullscreen</span>';
    }
}

document.addEventListener('fullscreenchange', () => {
    updateFullscreenButton(!!document.fullscreenElement);
});

// ========================================
// WEBXR VR MODE
// ========================================

async function enterVR() {
    if (!isVRSupported) {
        alert('VR is not supported on this device');
        return;
    }
    
    try {
        // Request VR session
        vrSession = await navigator.xr.requestSession('immersive-vr', {
            optionalFeatures: ['local-floor', 'bounded-floor']
        });
        
        console.log('VR session started');
        
        // Setup VR session
        vrSession.addEventListener('end', onVRSessionEnd);
        
        // Enter fullscreen first
        const modal = document.getElementById('immersiveModal');
        await modal.requestFullscreen();
        
        // Note: Full WebXR implementation would require WebGL context
        // and proper VR rendering pipeline
        alert('VR mode activated! Use your headset controls to navigate.');
        
    } catch (error) {
        console.error('Failed to enter VR:', error);
        alert('Failed to enter VR mode. Please ensure your headset is connected.');
    }
}

function onVRSessionEnd() {
    console.log('VR session ended');
    vrSession = null;
    
    // Exit fullscreen
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}

// ========================================
// PWA FUNCTIONALITY
// ========================================

function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
}

function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install prompt after 30 seconds
        setTimeout(() => {
            showInstallPrompt();
        }, 30000);
    });
}

function showInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt && deferredPrompt) {
        prompt.style.display = 'block';
    }
}

function dismissInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
        prompt.style.display = 'none';
    }
}

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
            dismissInstallPrompt();
        });
    } else {
        // Fallback for browsers that don't support beforeinstallprompt
        alert('To install Vyoma:\n\n' +
              'Chrome/Edge: Click the install icon in the address bar\n' +
              'Safari: Tap Share > Add to Home Screen\n' +
              'Firefox: Click menu > Install');
    }
}

// ========================================
// NAVIGATION HELPERS
// ========================================

function scrollToSessions() {
    document.getElementById('sessions').scrollIntoView({ behavior: 'smooth' });
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// SCROLL EFFECTS
// ========================================

function setupScrollEffects() {
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        const cosmicBg = document.querySelector('.cosmic-background');
        
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
        
        if (cosmicBg) {
            cosmicBg.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
    });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
// ERROR HANDLING
// ========================================

window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// ========================================
// PERFORMANCE MONITORING
// ========================================

if ('performance' in window && 'PerformanceObserver' in window) {
    const perfObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
            console.log('Performance entry:', entry);
        }
    });
    
    perfObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
}

// ========================================
// INITIALIZATION COMPLETE
// ========================================

console.log('Vyoma VR Therapy Platform - Ready');