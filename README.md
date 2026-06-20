# NovieOS Platformer

A browser-based 2D platformer prototype built with HTML5 Canvas.

## How to Play

Open `index.html` in any modern browser — no build step or server required.

### Controls

| Key | Action |
|-----|--------|
| Arrow Left / A | Move left |
| Arrow Right / D | Move right |
| Arrow Up / W / Space | Jump |
| Enter | Restart (game over screen) |

### Scoring

- **Stomp a floating platform** — land on it from above with momentum: **+10 points**
- **Collect a gold coin** — walk or jump into it: **+10 points**

### Lives

You start with **3 lives** (shown as hearts in the top-left HUD). Falling off
the bottom of the screen costs one life and resets the level. Losing all lives
triggers the Game Over screen.

## Features

- Horizontal camera that smoothly follows the player along the x-axis
- Procedurally placed ground segments, floating platforms, and coins
- Parallax scrolling background with stars and distant hills
- Score and lives HUD overlay
- Particle effects and score popups on collection/stomp
- Game over and restart flow

## Project Structure

```
index.html      — entry point (canvas element)
css/style.css   — minimal page styling
js/game.js      — complete game engine (input, physics, camera, rendering, HUD)
README.md       — this file
```

## Requirements

Any modern web browser (Chrome, Firefox, Safari, Edge). No dependencies.
