(function () {
  "use strict";

  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");

  var CANVAS_W = 800;
  var CANVAS_H = 480;
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  var GRAVITY = 0.6;
  var PLAYER_SPEED = 4;
  var JUMP_FORCE = -12;
  var STOMP_BOUNCE = -8;
  var COIN_VALUE = 10;
  var STOMP_VALUE = 10;
  var INITIAL_LIVES = 3;
  var DEATH_Y_OFFSET = 200;

  // ── Input ──

  var keys = {};
  window.addEventListener("keydown", function (e) { keys[e.code] = true; });
  window.addEventListener("keyup", function (e) { keys[e.code] = false; });

  // ── Camera ──

  var camera = { x: 0 };

  function updateCamera(player) {
    var targetX = player.x - CANVAS_W / 3;
    camera.x += (targetX - camera.x) * 0.1;
    if (camera.x < 0) camera.x = 0;
  }

  // ── Player ──

  function createPlayer(x, y) {
    return {
      x: x,
      y: y,
      w: 28,
      h: 36,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
    };
  }

  function updatePlayer(p) {
    p.vx = 0;
    if (keys["ArrowLeft"] || keys["KeyA"]) { p.vx = -PLAYER_SPEED; p.facing = -1; }
    if (keys["ArrowRight"] || keys["KeyD"]) { p.vx = PLAYER_SPEED; p.facing = 1; }
    if ((keys["ArrowUp"] || keys["KeyW"] || keys["Space"]) && p.onGround) {
      p.vy = JUMP_FORCE;
      p.onGround = false;
    }

    p.vy += GRAVITY;
    p.x += p.vx;
    p.y += p.vy;
  }

  function drawPlayer(p) {
    ctx.save();
    ctx.translate(p.x - camera.x, p.y);

    // body
    ctx.fillStyle = "#e94560";
    ctx.fillRect(0, 0, p.w, p.h);

    // eyes
    var eyeX = p.facing === 1 ? 16 : 6;
    ctx.fillStyle = "#fff";
    ctx.fillRect(eyeX, 8, 7, 7);
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(eyeX + (p.facing === 1 ? 3 : 1), 10, 3, 3);

    ctx.restore();
  }

  // ── Platforms ──

  function createPlatform(x, y, w, h, color) {
    return { x: x, y: y, w: w, h: h || 20, color: color || "#0f3460", stomped: false };
  }

  function drawPlatform(p) {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - camera.x, p.y, p.w, p.h);
    // top edge highlight
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(p.x - camera.x, p.y, p.w, 3);
  }

  // ── Coins ──

  function createCoin(x, y) {
    return { x: x, y: y, size: 16, collected: false, bobOffset: Math.random() * Math.PI * 2 };
  }

  function drawCoin(c, time) {
    if (c.collected) return;
    var bob = Math.sin(time * 3 + c.bobOffset) * 3;
    var cx = c.x + c.size / 2 - camera.x;
    var cy = c.y + c.size / 2 + bob;

    // outer glow
    ctx.fillStyle = "rgba(255,215,0,0.3)";
    ctx.beginPath();
    ctx.arc(cx, cy, c.size * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // coin body
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(cx, cy, c.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // shine
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(cx - 2, cy - 2, c.size / 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Particles ──

  var particles = [];

  function spawnParticles(x, y, color, count) {
    for (var i = 0; i < count; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 1) * 5,
        life: 30 + Math.random() * 20,
        color: color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  function updateParticles() {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.globalAlpha = p.life / 50;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - camera.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  // ── Score popups ──

  var popups = [];

  function spawnPopup(x, y, text) {
    popups.push({ x: x, y: y, text: text, life: 40 });
  }

  function updatePopups() {
    for (var i = popups.length - 1; i >= 0; i--) {
      popups[i].y -= 1.2;
      popups[i].life--;
      if (popups[i].life <= 0) popups.splice(i, 1);
    }
  }

  function drawPopups() {
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    for (var i = 0; i < popups.length; i++) {
      var p = popups[i];
      ctx.globalAlpha = p.life / 40;
      ctx.fillStyle = "#ffd700";
      ctx.fillText(p.text, p.x - camera.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  // ── HUD ──

  function drawHUD(score, lives) {
    // backdrop
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(8, 8, 190, 52);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.strokeRect(8, 8, 190, 52);

    ctx.font = "bold 18px monospace";
    ctx.textAlign = "left";

    // score
    ctx.fillStyle = "#ffd700";
    ctx.fillText("★ " + score, 18, 32);

    // lives
    ctx.fillStyle = "#e94560";
    var heartsStr = "";
    for (var i = 0; i < lives; i++) heartsStr += "♥ ";
    ctx.fillText(heartsStr, 18, 52);
  }

  // ── Level ──

  function buildLevel() {
    var platforms = [];
    var coins = [];

    // ground segments with gaps
    var gx = 0;
    for (var i = 0; i < 30; i++) {
      var gw = 200 + Math.random() * 300;
      platforms.push(createPlatform(gx, CANVAS_H - 40, gw, 40, "#0f3460"));

      // coins on ground
      if (i > 0 && Math.random() > 0.4) {
        coins.push(createCoin(gx + gw / 2 - 8, CANVAS_H - 70));
      }

      gx += gw;
      // gap
      if (i < 29) gx += 60 + Math.random() * 80;
    }

    // floating platforms
    for (var j = 0; j < 50; j++) {
      var px = 300 + j * 180 + Math.random() * 100;
      var py = CANVAS_H - 120 - Math.random() * 200;
      var pw = 80 + Math.random() * 80;
      var colors = ["#533483", "#0f3460", "#1a508b"];
      platforms.push(createPlatform(px, py, pw, 18, colors[j % 3]));

      // coin on floating platform
      if (Math.random() > 0.3) {
        coins.push(createCoin(px + pw / 2 - 8, py - 30));
      }
    }

    return { platforms: platforms, coins: coins };
  }

  // ── Collision ──

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function resolveCollisions(player, platforms, state) {
    player.onGround = false;

    for (var i = 0; i < platforms.length; i++) {
      var plat = platforms[i];
      if (!rectsOverlap(player, plat)) continue;

      var overlapLeft = (player.x + player.w) - plat.x;
      var overlapRight = (plat.x + plat.w) - player.x;
      var overlapTop = (player.y + player.h) - plat.y;
      var overlapBottom = (plat.y + plat.h) - player.y;

      var minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapTop && player.vy >= 0) {
        player.y = plat.y - player.h;
        player.onGround = true;

        // stomp scoring: only when landing from above with velocity
        if (player.vy > 2 && !plat.stomped && plat.h < 30) {
          plat.stomped = true;
          state.score += STOMP_VALUE;
          player.vy = STOMP_BOUNCE;
          spawnParticles(player.x + player.w / 2, plat.y, plat.color, 6);
          spawnPopup(player.x + player.w / 2, plat.y - 10, "+" + STOMP_VALUE);
          // reset stomp after delay so it can be stomped again
          (function (p) { setTimeout(function () { p.stomped = false; }, 2000); })(plat);
        } else {
          player.vy = 0;
        }
      } else if (minOverlap === overlapBottom) {
        player.y = plat.y + plat.h;
        player.vy = 0;
      } else if (minOverlap === overlapLeft) {
        player.x = plat.x - player.w;
      } else if (minOverlap === overlapRight) {
        player.x = plat.x + plat.w;
      }
    }
  }

  function checkCoinCollection(player, coins, state) {
    var playerRect = { x: player.x, y: player.y, w: player.w, h: player.h };
    for (var i = 0; i < coins.length; i++) {
      var c = coins[i];
      if (c.collected) continue;
      var coinRect = { x: c.x, y: c.y, w: c.size, h: c.size };
      if (rectsOverlap(playerRect, coinRect)) {
        c.collected = true;
        state.score += COIN_VALUE;
        spawnParticles(c.x + c.size / 2, c.y + c.size / 2, "#ffd700", 8);
        spawnPopup(c.x + c.size / 2, c.y - 10, "+" + COIN_VALUE);
      }
    }
  }

  // ── Background ──

  function drawBackground() {
    // sky gradient
    var grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, "#0a0a23");
    grad.addColorStop(1, "#16213e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // parallax stars
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    for (var i = 0; i < 60; i++) {
      var sx = ((i * 137 + 50) % 1200) - (camera.x * 0.1) % 1200;
      var sy = (i * 97 + 30) % CANVAS_H;
      if (sx < 0) sx += 1200;
      if (sx < CANVAS_W) {
        ctx.fillRect(sx, sy, 2, 2);
      }
    }

    // distant hills (parallax)
    ctx.fillStyle = "rgba(15,52,96,0.5)";
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_H);
    for (var hx = 0; hx <= CANVAS_W; hx += 40) {
      var worldX = hx + camera.x * 0.2;
      var hy = CANVAS_H - 80 - Math.sin(worldX * 0.005) * 40 - Math.sin(worldX * 0.012) * 20;
      ctx.lineTo(hx, hy);
    }
    ctx.lineTo(CANVAS_W, CANVAS_H);
    ctx.closePath();
    ctx.fill();
  }

  // ── Game state ──

  var GameState = { PLAYING: 0, GAME_OVER: 1 };

  var state, player, level;

  function resetLevel() {
    player = createPlayer(100, CANVAS_H - 100);
    level = buildLevel();
    camera.x = 0;
    particles = [];
    popups = [];
    if (!state) {
      state = { score: 0, lives: INITIAL_LIVES, mode: GameState.PLAYING, gameOverTimer: 0 };
    }
    state.mode = GameState.PLAYING;
  }

  function fullReset() {
    state = { score: 0, lives: INITIAL_LIVES, mode: GameState.PLAYING, gameOverTimer: 0 };
    resetLevel();
  }

  // ── Game over screen ──

  function drawGameOver() {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.textAlign = "center";
    ctx.fillStyle = "#e94560";
    ctx.font = "bold 48px monospace";
    ctx.fillText("GAME OVER", CANVAS_W / 2, CANVAS_H / 2 - 30);

    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 24px monospace";
    ctx.fillText("Score: " + state.score, CANVAS_W / 2, CANVAS_H / 2 + 20);

    ctx.fillStyle = "#fff";
    ctx.font = "18px monospace";
    ctx.fillText("Press ENTER to restart", CANVAS_W / 2, CANVAS_H / 2 + 60);
  }

  // ── Main loop ──

  var gameTime = 0;

  function gameLoop() {
    gameTime += 1 / 60;

    if (state.mode === GameState.GAME_OVER) {
      drawBackground();
      drawGameOver();
      if (keys["Enter"]) {
        fullReset();
      }
      requestAnimationFrame(gameLoop);
      return;
    }

    // update
    updatePlayer(player);
    resolveCollisions(player, level.platforms, state);
    checkCoinCollection(player, level.coins, state);
    updateCamera(player);
    updateParticles();
    updatePopups();

    // death check: fell below screen
    if (player.y > CANVAS_H + DEATH_Y_OFFSET) {
      state.lives--;
      if (state.lives <= 0) {
        state.mode = GameState.GAME_OVER;
        state.gameOverTimer = 0;
      } else {
        resetLevel();
      }
    }

    // draw
    drawBackground();

    for (var i = 0; i < level.platforms.length; i++) {
      var p = level.platforms[i];
      // culling: skip platforms far off screen
      if (p.x + p.w < camera.x - 50 || p.x > camera.x + CANVAS_W + 50) continue;
      drawPlatform(p);
    }

    for (var j = 0; j < level.coins.length; j++) {
      var c = level.coins[j];
      if (c.collected) continue;
      if (c.x + c.size < camera.x - 50 || c.x > camera.x + CANVAS_W + 50) continue;
      drawCoin(c, gameTime);
    }

    drawPlayer(player);
    drawParticles();
    drawPopups();
    drawHUD(state.score, state.lives);

    requestAnimationFrame(gameLoop);
  }

  // ── Start ──

  fullReset();
  gameLoop();
})();
