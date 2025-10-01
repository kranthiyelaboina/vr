# Vyoma VR Therapy Platform 🧘‍♀️🌌

## Overview

Vyoma is a professional VR therapy web experience designed as a Progressive Web App (PWA) that targets budget VR headsets and smartphones. It provides immersive 360° therapeutic sessions through hidden YouTube embeds with WebXR support for compatible VR headsets.

## 🚀 Features

### Currently Completed Features ✅

1. **Stunning Landing Page**
   - Hero section with cosmic background effects
   - Animated nebula, stars, and aurora effects
   - Responsive navigation with glass morphism design
   - Device compatibility badges

2. **Immersive Session Catalog**
   - Three 360° therapy sessions with hidden YouTube integration
   - Professional session cards with hover effects
   - Session benefits and duration display
   - Responsive grid layout with Bootstrap 5

3. **WebXR-Ready Modal Experience**
   - Hidden YouTube embeds with removed UI elements
   - Force 4K/highest quality video streaming
   - Custom overlay controls (play/pause, VR toggle, fullscreen)
   - Auto-hiding controls after 5 seconds
   - Real-time quality monitoring
   - Progress bar and time display

4. **360° Interaction**
   - Touch and mouse-based drag controls for non-VR devices
   - Smooth rotation with visual feedback
   - Drag hint for first-time users
   - WebXR VR mode support for Meta Quest and compatible headsets

5. **PWA Functionality**
   - Full offline support with service worker
   - Installable as native app
   - App manifest with icons and shortcuts
   - Background caching strategy
   - Offline fallback page

6. **Visual Excellence**
   - Custom gradient cursors
   - Glass morphism UI elements
   - AOS scroll animations
   - Parallax scrolling effects
   - Floating particle effects
   - Responsive design for all devices

## 📍 Functional Entry Points

### Main Pages
- `/` or `/index.html` - Main landing page with all features

### Therapy Sessions (via JavaScript functions)
- `startSession('eKumVFvGHFA', title, description)` - Cosmic Meditation Journey
- `startSession('7AkbUfZjS5k', title, description)` - Forest Bathing Therapy  
- `startSession('jqq_ZdD5Zwg', title, description)` - Ocean Wave Mindfulness

### PWA Shortcuts
- `/?session=cosmic` - Direct link to cosmic meditation
- `/?session=forest` - Direct link to forest therapy
- `/?session=ocean` - Direct link to ocean mindfulness

### API Endpoints
- `/manifest.json` - PWA manifest configuration
- `/config.json` - Application configuration
- `/service-worker.js` - Offline functionality

## 🔧 Technical Architecture

### Data Models
- **Session Model**: id, title, description, duration, benefits, thumbnail
- **Configuration Model**: quality settings, immersive settings, WebXR config
- **PWA Model**: cache strategies, install prompts, offline handling

### Tech Stack
- **Frontend**: HTML5, CSS3, Bootstrap 5, Vanilla JavaScript
- **Libraries**: Font Awesome, AOS, Google Fonts
- **Video**: YouTube IFrame API with 360° support
- **PWA**: Service Worker, Web App Manifest
- **WebXR**: Native WebXR API for VR headsets

### Browser Support
- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+
- Meta Quest Browser
- Mobile browsers with PWA support

## 📱 Installation & Usage

### Local Development
1. Open `index.html` in a modern browser
2. Or use a local server: `python -m http.server 8000`
3. Navigate to `http://localhost:8000`

### PWA Installation
1. **Chrome/Edge**: Click install icon in address bar
2. **Safari iOS**: Tap Share → Add to Home Screen
3. **Firefox**: Menu → Install

### VR Headset Usage
1. Connect Meta Quest or compatible headset
2. Open Vyoma in headset browser
3. Start any therapy session
4. Click "Enter VR" button
5. Use headset controls to navigate

## 🎮 Controls

### Desktop
- **Mouse**: Click and drag to look around in 360°
- **Keyboard**: Space to play/pause, F for fullscreen, ESC to exit

### Mobile
- **Touch**: Swipe to look around
- **Gyroscope**: Move device to explore (if supported)

### VR Headset
- **Head tracking**: Look around naturally
- **Controller**: Use trigger to interact with UI

## ⚠️ Features Not Yet Implemented

1. User accounts and progress tracking
2. Custom playlists creation
3. Biometric integration (heart rate monitoring)
4. Multiplayer/shared sessions
5. Voice-guided meditations overlay
6. Session recommendations AI
7. Offline video caching (YouTube limitation)

## 💡 Recommended Next Steps

1. **Backend Integration**
   - Add user authentication system
   - Implement session analytics
   - Create therapist dashboard

2. **Content Expansion**
   - Add more therapy sessions
   - Create themed collections
   - Add guided meditation audio tracks

3. **Enhanced VR Features**
   - Hand tracking support
   - Spatial audio implementation
   - Interactive VR elements

4. **Monetization**
   - Premium session subscriptions
   - Therapist marketplace
   - Corporate wellness packages

5. **Performance Optimization**
   - Implement CDN for assets
   - Add video preloading
   - Optimize for slower connections

## 🛠️ Configuration

Edit `config.json` to customize:
- Video quality preferences
- Auto-hide control delays
- WebXR settings
- PWA behavior
- UI theme colors

## 📄 File Structure

```
vyoma/
├── index.html          # Main application page
├── css/
│   └── style.css      # All custom styles
├── js/
│   └── main.js        # Application logic
├── icons/             # PWA icons (to be added)
├── assets/            # Screenshots and media
├── manifest.json      # PWA manifest
├── service-worker.js  # Offline functionality
├── config.json        # App configuration
├── README.md          # Documentation
└── start-server.bat   # Windows server launcher
```

## 🚀 Deployment

The app is ready for static hosting on:
- GitHub Pages
- Netlify
- Vercel
- Any static web server

Ensure HTTPS is enabled for PWA and WebXR features.

## 📝 License

© 2024 Vyoma VR Therapy Platform. All rights reserved.

## 🤝 Support

For issues or questions, please refer to the documentation or contact support.

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: 2024