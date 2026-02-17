# 🎮 Modern Tetris Game

A classic Tetris game built with HTML5 Canvas, featuring 3D visual effects, responsive design, and procedural sound generation. This implementation follows modern Tetris guidelines with SRS rotation system and smooth animations.

![Tetris Game Screenshot](https://via.placeholder.com/800x400/0a0a2a/ffffff?text=Tetris+Game+Screenshot)

## ✨ Features

### 🎮 Core Gameplay
- **7 Classic Tetrominoes** - I, O, T, L, J, S, Z pieces
- **SRS Rotation System** - Super Rotation System with wall kicks
- **Line Clearing** - Cascading animations and effects
- **Scoring System** - Multipliers for combos and tetrises
- **Level Progression** - Speed increases every 10 lines
- **Next Piece Preview** - See the upcoming piece
- **Hold Piece** - Store a piece for later use

### 🎨 Visual Design
- **3D Block Rendering** - Gradients, shadows, and highlights
- **Digital Materialism** - Pixels with physical depth and texture
- **Ghost Piece Preview** - Shows where piece will land
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Smooth Animations** - 60 FPS game loop with requestAnimationFrame

### 🔊 Audio Experience
- **Procedural Sound Generation** - Web Audio API based sounds
- **Dynamic Audio** - Different sounds for line clears (single, double, triple, tetris)
- **Configurable Audio** - Toggle sound and adjust volume
- **Local Storage** - Audio preferences saved between sessions

### 📱 Controls

#### Keyboard Controls
- **← →** : Move left/right
- **↑ / Z / X** : Rotate clockwise/counterclockwise
- **↓** : Soft drop (accelerated fall)
- **Space** : Hard drop (instant placement)
- **C** : Hold piece
- **P / ESC** : Pause game

#### Touch Controls (Mobile)
- On-screen buttons for all actions
- Responsive touch targets
- Landscape orientation recommended

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in your web browser.

### Option 2: Local Server
```bash
# Using Python
python3 -m http.server 8000
# Open http://localhost:8000

# Using Node.js
npx http-server .
# Open http://localhost:8080
```

### Option 3: VS Code
Use the Live Server extension to run the game.

## 🏗️ Project Structure

```
tetris-game/
├── index.html          # Main HTML structure
├── style.css           # Responsive CSS with 3D effects
├── game.js             # Core game logic and rendering
├── tetromino.js        # Tetromino definitions and SRS rotation
├── audio.js            # Web Audio API sound management
├── plan.md             # Project planning and architecture
└── README.md           # This file
```

## 🔧 Technical Details

### Game Configuration
- **Grid Size**: 10×20 blocks
- **Block Size**: 30px
- **Initial Speed**: 1000ms per drop
- **Speed Decrement**: 50ms per level
- **Minimum Speed**: 100ms
- **Lines Per Level**: 10

### Scoring System
- **Single Line**: 100 points
- **Double Lines**: 300 points
- **Triple Lines**: 500 points
- **Tetris (4 Lines)**: 800 points
- **Combo Multipliers**: Additional points for consecutive line clears

### Local Storage
- `tetris_high_score`: Highest score achieved
- `tetris_audio_settings`: Audio preferences
- `tetris_stats`: Game statistics

## 🎯 Design Philosophy

### Digital Materialism
This game implements a "Digital Materialism" aesthetic where pixels are treated as physical entities with:
- **Weight** - Blocks feel substantial
- **Texture** - Surface details and lighting
- **Spatial Depth** - 3D effects and shadows
- **Physicality** - Realistic movements and collisions

### Responsive Design
- **Desktop**: Full feature set with keyboard controls
- **Tablet**: Optimized touch interface
- **Mobile**: Streamlined controls for smaller screens
- **Breakpoints**: 1200px, 992px, 768px, 480px

## 🌐 Browser Compatibility

### Supported Browsers
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### Known Issues
- **iOS Safari**: Web Audio API may have slight latency
- **Old Android**: CSS Grid support may be limited
- **Firefox**: Canvas performance may vary

## 🛠️ Development

### Code Style
- 2-space indentation
- Descriptive camelCase variable names
- JSDoc comments for complex functions
- Modular architecture with clear separation

### Architecture Patterns
1. **Module Pattern** - Self-contained JavaScript modules
2. **Factory Pattern** - Tetromino generation with 7-bag randomizer
3. **Observer Pattern** - Event-driven input handling
4. **State Pattern** - Game state management

### Building and Testing
```bash
# No build step required - static web application

# Manual testing
open index.html

# Consider adding testing tools
npm install --save-dev jest eslint prettier
```

## 📈 Performance Optimization

### Rendering
- Only redraw changed canvas portions
- RequestAnimationFrame for smooth 60 FPS
- Pre-calculated gradients and colors
- Minimal DOM operations

### Memory Management
- Proper event listener cleanup
- Limited localStorage writes
- Memory leak prevention in game loop

### Mobile Optimization
- Touch event optimization
- Reduced animation complexity on low-end devices
- Battery-friendly rendering

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in multiple browsers
5. Submit a pull request

### Code Review Checklist
- [ ] Follows code style guidelines
- [ ] Includes appropriate comments
- [ ] Handles edge cases and errors
- [ ] Maintains browser compatibility
- [ ] Preserves mobile responsiveness
- [ ] No console.log in production code

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

### Documentation
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Tetris SRS System](https://tetris.wiki/Super_Rotation_System)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

### Tools
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [Web Audio API Tester](https://webaudiodemos.appspot.com/)
- [Canvas Inspector](https://chrome.google.com/webstore/detail/canvas-inspector/iefkmhbabpohgakhddfpkmekfofmbpam)

### Inspiration
- [Official Tetris Guidelines](https://tetris.wiki/Tetris_Guideline)
- [Digital Materialism Philosophy](https://en.wikipedia.org/wiki/Digital_materialism)
- [Classic Tetris World Championship](https://ctwc.fandom.com/wiki/Classic_Tetris_World_Championship)

## 🙏 Acknowledgments

- Based on the classic Tetris game by Alexey Pajitnov
- Inspired by modern Tetris guideline implementations
- Built with vanilla JavaScript and HTML5 Canvas
- Claude Code Assistant for project architecture and documentation

---

**Version**: 1.0.0
**Last Updated**: 2026-02-17
**Live Demo**: [GitHub Pages](https://ezone1987.github.io/tetris-game/)
**Repository**: https://github.com/ezone1987/tetris-game