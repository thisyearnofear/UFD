const fartSounds = [
  { name: "wet", file: "sounds/fart-01.wav" },
  { name: "raspberry", file: "sounds/fart-02.wav" },
  { name: "wambam", file: "sounds/fart-03.wav" },
  { name: "crescendo", file: "sounds/fart-04.wav" },
  { name: "bass", file: "sounds/fart-05.wav" },
  { name: "uhoh", file: "sounds/fart-06.wav" },
  { name: "stamina", file: "sounds/fart-07.wav" },
  { name: "rimshot", file: "sounds/fart-08.wav" },
  { name: "squeal", file: "sounds/fart-squeak-01.wav" },
];

const buttonEmojis = ["💨", "🦄", "🇺🇸"];

function moveButton(button) {
  if (button.isHovered || button.isPlaying) return;

  // Get current position
  const currentX = parseFloat(button.style.left);
  const currentY = parseFloat(button.style.top);

  // Create a more organic movement pattern
  const angle = Math.random() * Math.PI * 2; // Random direction
  const distance = Math.random() * 8 + 2; // Random small distance (2-10%)

  // Calculate new position using polar coordinates for more natural movement
  let targetX = currentX + Math.cos(angle) * distance;
  let targetY = currentY + Math.sin(angle) * distance;

  // Add slight wobble
  const wobbleX = Math.sin(Date.now() / 500) * 2;
  const wobbleY = Math.cos(Date.now() / 500) * 2;
  targetX += wobbleX;
  targetY += wobbleY;

  // Keep within bounds with bounce effect
  if (targetX < 5 || targetX > 95) {
    targetX = currentX - (targetX - currentX); // Reverse direction
  }
  if (targetY < 5 || targetY > 95) {
    targetY = currentY - (targetY - currentY); // Reverse direction
  }

  targetX = Math.max(5, Math.min(95, targetX));
  targetY = Math.max(5, Math.min(95, targetY));

  // Randomize movement duration slightly
  const duration = 0.5 + Math.random() * 0.5;

  // Animate the movement with variable timing
  button.style.transition = `left ${duration}s cubic-bezier(0.4, 0, 0.2, 1), top ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`;
  button.style.left = `${targetX}%`;
  button.style.top = `${targetY}%`;

  // Schedule next movement with random delay
  const nextDelay = 500 + Math.random() * 1000;
  setTimeout(() => moveButton(button), nextDelay);
}

function createFartButton() {
  const button = document.createElement("button");
  button.className = "fart-button";

  // Random emoji
  const emoji = buttonEmojis[Math.floor(Math.random() * buttonEmojis.length)];
  button.innerHTML = emoji;

  // Initial position
  button.style.position = "fixed";
  button.style.left = Math.random() * 80 + 10 + "%";
  button.style.top = Math.random() * 80 + 10 + "%";
  button.style.zIndex = "1000";

  // Random sound
  const sound = fartSounds[Math.floor(Math.random() * fartSounds.length)];
  const audio = new Audio(sound.file);

  // Start movement with random delay
  setTimeout(() => moveButton(button), Math.random() * 1000);

  // Hover handling
  button.addEventListener("mouseenter", () => {
    button.isHovered = true;
    button.classList.add("hover");
  });

  button.addEventListener("mouseleave", () => {
    button.isHovered = false;
    button.classList.remove("hover");
    // Resume movement after a short delay
    setTimeout(() => moveButton(button), 500);
  });

  // Click handling
  button.addEventListener("click", () => {
    button.isPlaying = true;
    audio.currentTime = 0;
    audio.play();
    button.classList.add("playing");

    // Add explosion effect
    const explosion = document.createElement("div");
    explosion.className = "explosion";
    button.appendChild(explosion);

    setTimeout(() => {
      button.classList.remove("playing");
      explosion.remove();
      button.isPlaying = false;
      // Resume movement after effect
      setTimeout(() => moveButton(button), 500);
    }, 500);
  });

  return button;
}

function addFartButtons(count = 8) {
  for (let i = 0; i < count; i++) {
    document.body.appendChild(createFartButton());
  }
}

// Add fart button styles
const style = document.createElement("style");
style.textContent = `
  .fart-button {
    background: #f0f0f0;
    border: 1px solid #999;
    border-radius: 4px;
    font-size: 1.5em;
    cursor: pointer;
    padding: 8px;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      0 1px 1px rgba(0,0,0,0.2),
      inset 0 1px 0 rgba(255,255,255,0.8);
    opacity: 0.7;
    position: relative;
    overflow: hidden;
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 
        0 1px 1px rgba(0,0,0,0.2),
        inset 0 1px 0 rgba(255,255,255,0.8);
    }
    50% {
      transform: scale(1.1);
      box-shadow: 
        0 2px 4px rgba(0,0,0,0.2),
        inset 0 1px 0 rgba(255,255,255,0.8);
    }
    100% {
      transform: scale(1);
      box-shadow: 
        0 1px 1px rgba(0,0,0,0.2),
        inset 0 1px 0 rgba(255,255,255,0.8);
    }
  }
  
  .fart-button:hover,
  .fart-button.hover {
    animation: none;
    transform: scale(1.2) !important;
    opacity: 1;
    z-index: 1001;
    transition: all 0.3s ease;
  }
  
  .fart-button:active,
  .fart-button.playing {
    animation: none;
    transform: scale(1.1) translateY(2px) !important;
    box-shadow: 
      0 0px 0px rgba(0,0,0,0.2),
      inset 0 1px 1px rgba(0,0,0,0.1);
  }
  
  .explosion {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    pointer-events: none;
    background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
    animation: explode 0.5s ease-out forwards;
  }
  
  @keyframes explode {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  addFartButtons();
});
