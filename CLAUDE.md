# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
A classic Tetris game implemented with HTML5, CSS3, and JavaScript. The game features smooth animations, score tracking, multiple speed levels, local high score storage, and mobile-responsive design.

**Main Technologies:**
- HTML5 Canvas for game rendering
- Vanilla JavaScript for game logic
- CSS3 for styling and animations
- Local Storage for high score persistence
- Web Audio API for sound effects

**Design Philosophy:**
- Digital Materialism: Pixels as physical entities with weight, texture, and spatial depth
- 3D visual effects with gradients, shadows, and highlights
- Responsive design for desktop, tablet, and mobile devices

## Project Structure

### Core Files
```
.
├── index.html          # Main HTML structure and UI elements
├── style.css           # CSS styles with responsive design
├── game.js             # Core game logic and rendering
├── tetromino.js        # Tetromino definitions and rotation logic (SRS system)
├── audio.js            # Sound effect management
├── plan.md             # Project planning and architecture
└── CLAUDE.md           # Project documentation (this file)
```

### Key Components

1. **index.html**
   - Game canvas (300×600px for 10×20 grid with 30px blocks)
   - Next piece preview canvas
   - Hold piece canvas
   - Game controls and information panels
   - Responsive layout with media queries

2. **style.css**
   - Digital Materialism design theme
   - Space/tech color scheme with gradients
   - Responsive breakpoints: 1200px, 992px, 768px, 480px
   - 3D effects for buttons and game elements
   - Smooth animations and transitions

3. **game.js** - Core Game Module
   - Game state management
   - Game loop with requestAnimationFrame
   - Collision detection and line clearing
   - Score calculation and level progression
   - User input handling (keyboard and buttons)
   - Canvas rendering with 3D effects

4. **tetromino.js** - Tetromino Module
   - 7 classic tetromino definitions (I, O, T, L, J, S, Z)
   - SRS (Super Rotation System) with wall kicks
   - Tetromino factory with 7-bag randomizer
   - Rotation and movement logic

5. **audio.js** - Audio Module
   - Web Audio API sound generation
   - Sound effect management
   - Local storage for audio settings
   - Procedurally generated sounds for game events

## Game Features

### Core Gameplay
- 7 classic tetromino pieces
- SRS rotation system with wall kicks
- Line clearing with cascading effects
- Score system with multipliers for combos and tetrises
- Level progression (speed increases every 10 lines)
- Next piece preview
- Hold piece functionality

### Controls
- **Keyboard:**
  - ← → : Move left/right
  - ↑ / Z / X : Rotate clockwise/counterclockwise
  - ↓ : Soft drop (accelerated fall)
  - Space : Hard drop (instant placement)
  - C : Hold piece
  - P / ESC : Pause game
- **Touch Controls:** Responsive buttons for mobile devices
- **Gamepad Support:** Optional future enhancement

### Visual Features
- 3D block rendering with gradients and highlights
- Ghost piece preview (shows where piece will land)
- Line clear animations
- Responsive design for all screen sizes
- Digital Materialism aesthetic with depth and texture

### Audio Features
- Procedurally generated sound effects
- Different sounds for different line clears (single, double, triple, tetris)
- Level up and game over sounds
- Toggleable sound with volume control

## Development Guidelines

### Code Style
- Use 2-space indentation
- Descriptive variable and function names (camelCase)
- JSDoc comments for complex functions
- Modular architecture with clear separation of concerns
- Error handling with try-catch for localStorage operations

### Testing Strategy
- Manual testing of game mechanics
- Browser compatibility testing (Chrome, Firefox, Safari, Edge)
- Mobile responsive testing
- Performance testing (FPS monitoring)
- Cross-browser audio testing

### Architecture Patterns
1. **Module Pattern:** Each JavaScript file is a self-contained module
2. **Factory Pattern:** Tetromino generation with 7-bag randomizer
3. **Observer Pattern:** Event-driven user input handling
4. **State Pattern:** Game state management with clear transitions

## Common Development Tasks

### Building the Project
```bash
# No build step required - this is a static web application
```

### Running Tests
```bash
# Manual testing by opening the game in a browser
open index.html

# For automated testing, consider adding Jest or similar
```

### Linting and Formatting
```bash
# Consider adding ESLint and Prettier for code quality
# npm install --save-dev eslint prettier eslint-config-prettier
```

### Running the Application
```bash
# Option 1: Open index.html directly in a browser
open index.html

# Option 2: Start a local HTTP server
python3 -m http.server 8000
# Then open http://localhost:8000 in your browser

# Option 3: Use Node.js http-server
npx http-server .

# Option 4: Use VS Code Live Server extension
```

### Debugging Tips
1. **Browser Developer Tools:**
   - F12 to open dev tools
   - Console tab for JavaScript errors
   - Network tab for file loading issues
   - Performance tab for FPS monitoring

2. **Game Debugging:**
   - Add `console.log` statements for game state changes
   - Use debugger statements in game.js
   - Monitor localStorage for saved data

3. **Visual Debugging:**
   - Canvas inspector tools
   - CSS grid inspector
   - Responsive design mode in browser

## Configuration Management

### Game Configuration (game.js: CONFIG)
- Grid size: 10×20 blocks
- Block size: 30px
- Initial speed: 1000ms per drop
- Speed decrement: 50ms per level
- Minimum speed: 100ms
- Score values: Single(100), Double(300), Triple(500), Tetris(800)
- Lines per level: 10

### Audio Configuration (audio.js: SOUND_CONFIG)
- Enabled by default
- Volume: 0.7 (70%)
- Procedural sound frequencies and durations

### Local Storage Keys
- `tetris_high_score`: Highest score achieved
- `tetris_audio_settings`: Audio preferences
- `tetris_stats`: Game statistics

## Performance Considerations

### Rendering Optimization
- Only redraw changed portions of canvas
- Use requestAnimationFrame for smooth animation
- Pre-calculate expensive values (e.g., gradients)
- Minimize DOM operations

### Memory Management
- Proper cleanup of event listeners
- Limit localStorage writes
- Avoid memory leaks in game loop

### Mobile Performance
- Touch event optimization
- Reduced animation complexity on low-end devices
- Battery-friendly rendering

## Browser Compatibility

### Supported Browsers
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### Polyfills Required
- None for core functionality
- Web Audio API may need polyfills for older browsers
- CSS Grid may need prefixes for older browsers

### Known Issues
1. **iOS Safari:** Web Audio API may have latency
2. **Old Android Browsers:** CSS Grid support may be limited
3. **Firefox:** Canvas performance may vary

## Future Enhancements

### Planned Features
1. **Game Modes:**
   - Marathon (endless play)
   - Sprint (40-line race)
   - Ultra (2-minute score attack)

2. **Visual Enhancements:**
   - Multiple themes (dark/light/colorblind)
   - Particle effects for line clears
   - Background animations

3. **Multiplayer:**
   - Local 2-player mode
   - Online multiplayer
   - Leaderboards

4. **Accessibility:**
   - Screen reader support
   - Keyboard-only navigation
   - High contrast mode

5. **Advanced Features:**
   - Replay system
   - Statistics tracking
   - Achievement system

### Technical Improvements
1. **Code Optimization:**
   - Web Workers for game logic
   - WebGL rendering for better performance
   - Service Worker for offline play

2. **Testing:**
   - Unit tests for game logic
   - Integration tests for game flow
   - Performance tests for rendering

3. **Tooling:**
   - Build system for minification
   - Automated deployment
   - Continuous integration

## Troubleshooting

### Common Issues

1. **Game not starting**
   - Check browser console for JavaScript errors
   - Ensure all files are in the same directory
   - Verify JavaScript is enabled in browser
   - Check for CORS issues with local file access

2. **Controls not working**
   - Ensure focus is on the game canvas
   - Check for conflicting keyboard shortcuts
   - Try clicking on the game area first
   - Test in different browsers

3. **High score not saving**
   - Check browser local storage permissions
   - Try clearing browser cache and reloading
   - Verify localStorage is available
   - Check for quota exceeded errors

4. **Sound not playing**
   - Check browser audio permissions
   - Verify Web Audio API support
   - Try clicking on page first (some browsers require user interaction)
   - Check console for audio errors

5. **Visual glitches**
   - Clear browser cache
   - Try different browser
   - Check canvas size compatibility
   - Verify CSS is loading correctly

6. **Mobile issues**
   - Rotate device to landscape for better experience
   - Ensure touch events are not being intercepted
   - Check viewport meta tag
   - Test on actual device (not just emulator)

### Debugging Steps

1. **First Steps:**
   - Open browser developer tools (F12)
   - Check Console tab for errors
   - Check Network tab for failed file loads
   - Clear browser cache and hard reload (Ctrl+F5)

2. **Game-Specific Debugging:**
   - Add `debugger` statements to game.js
   - Log game state changes to console
   - Check localStorage contents
   - Monitor FPS in performance tab

3. **Canvas Debugging:**
   - Use canvas inspection tools
   - Check canvas context state
   - Verify drawing coordinates
   - Test with simple shapes first

4. **Audio Debugging:**
   - Check AudioContext state
   - Verify oscillator creation
   - Test with simple tones first
   - Check browser audio permissions

## Contributing

### Development Workflow
1. Create feature branch
2. Make changes with clear commits
3. Test in multiple browsers
4. Submit pull request
5. Address review comments
6. Merge to main

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Functions have appropriate comments
- [ ] No console.log statements in production code
- [ ] Error handling for edge cases
- [ ] Browser compatibility considered
- [ ] Performance implications considered
- [ ] Mobile responsiveness maintained

### Release Process
1. Update version number
2. Update CHANGELOG.md
3. Run final testing suite
4. Create release tag
5. Deploy to hosting service
6. Update documentation

## Resources

### Documentation
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Tetris SRS System](https://tetris.wiki/Super_Rotation_System)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

### Tools
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [Web Audio API Tester](https://webaudiodemos.appspot.com/)
- [Canvas Inspector](https://chrome.google.com/webstore/detail/canvas-inspector/iefkmhbabpohgakhddfpkmekfofmbpam)
- [Responsive Design Tester](https://chrome.google.com/webstore/detail/responsive-web-design-tes/objclahbaimaknlnjeegpfnobpgkfkle)

### Inspiration
- [Official Tetris Guidelines](https://tetris.wiki/Tetris_Guideline)
- [Digital Materialism Philosophy](https://en.wikipedia.org/wiki/Digital_materialism)
- [Classic Tetris World Championship](https://ctwc.fandom.com/wiki/Classic_Tetris_World_Championship)

---

**Last Updated:** 2026-02-15
**Version:** 1.0.0
**Author:** Claude Code Assistant
**Based on:** snake_game project architecture