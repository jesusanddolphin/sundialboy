let backgroundImage, characterImage;
let backgroundImage2, characterImage2;
let song;

let phaseStartTime = 0;
let currentPhase = 'blue'; // 'blue', 'transitionToWhite', 'white', 'transitionToBlue'

let allowDraw = false;
let fading = false;
let fadeStartTime = 0;

let drawStartTime = 0;
let inDrawPhase = false;
let phaseCycleCount = 0;

let alpha = 255;
let whiteAlpha = 255;

let alpha1 = 255; // Transparency of first image set
let alpha2 = 0;   // Transparency of second image set

let blueLines = [];
let whiteLines = [];

let songStarted = false;

function preload() {
  backgroundImage = loadImage("background.png");
  characterImage = loadImage("character.png");
  backgroundImage2 = loadImage("background2.png");
  characterImage2 = loadImage("character2.png");

  song = loadSound("song.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  phaseStartTime = millis();
}

function draw() {
  let currentTime = millis();
  let elapsed = currentTime - phaseStartTime;

  // === PHASE MANAGEMENT ===
  if (currentPhase === 'blue' && phaseCycleCount >= 2) {
    currentPhase = 'transitionToWhite';
    phaseStartTime = currentTime;
    phaseCycleCount = 0;
  } else if (currentPhase === 'white' && phaseCycleCount >= 2) {
    currentPhase = 'transitionToBlue';
    phaseStartTime = currentTime;
    phaseCycleCount = 0;
  } else if (currentPhase === 'transitionToWhite' && elapsed >= 5000) {
    currentPhase = 'white';
    phaseStartTime = currentTime;
  } else if (currentPhase === 'transitionToBlue' && elapsed >= 5000) {
    currentPhase = 'blue';
    phaseStartTime = currentTime;
  }

  // === ALPHA TRANSITIONS ===
  if (currentPhase === 'transitionToWhite') {
    let t = constrain((currentTime - phaseStartTime) / 5000, 0, 1);
    alpha1 = lerp(255, 0, t);
    alpha2 = lerp(0, 255, t);
  } else if (currentPhase === 'transitionToBlue') {
    let t = constrain((currentTime - phaseStartTime) / 5000, 0, 1);
    alpha1 = lerp(0, 255, t);
    alpha2 = lerp(255, 0, t);
  } else if (currentPhase === 'blue') {
    alpha1 = 255;
    alpha2 = 0;
  } else if (currentPhase === 'white') {
    alpha1 = 0;
    alpha2 = 255;
  }

  clear();

  // === BACKGROUND DRAW ===
  tint(255, alpha1);
  image(backgroundImage, 0, 0, windowWidth, windowHeight);
  tint(255, alpha2);
  image(backgroundImage2, 0, 0, windowWidth, windowHeight);
  noTint();

  // === LINE DRAWING ===
  strokeWeight(2);
  for (let lineData of blueLines) {
    stroke(12, 12, 191, alpha);
    line(lineData.x1, lineData.y1, lineData.x2, lineData.y2);
  }

  for (let lineData of whiteLines) {
    stroke(255, 255, 255, whiteAlpha);
    line(lineData.x1, lineData.y1, lineData.x2, lineData.y2);
  }

  // === CHARACTER DRAW ===
  let charWidth = 75, charHeight = 225;
  let charX = windowWidth / 2 - charWidth / 2 - 5;
  let charY = windowHeight / 2 - charHeight / 2 - 90;

  tint(255, alpha1);
  image(characterImage, charX, charY, charWidth, charHeight);
  tint(255, alpha2);
  image(characterImage2, charX, charY, charWidth, charHeight);
  noTint();

  // === DRAW ON CLICK ===
  if (allowDraw && !fading && (currentPhase === 'blue' || currentPhase === 'white')) {
    let newLine = {
      x1: windowWidth / 2,
      y1: windowHeight / 2,
      x2: mouseX,
      y2: mouseY,
      time: currentTime
    };
    if (currentPhase === 'blue') {
      blueLines.push(newLine);
      if (blueLines.length > 300) blueLines.shift();
    } else if (currentPhase === 'white') {
      whiteLines.push(newLine);
      if (whiteLines.length > 300) whiteLines.shift();
    }
  }

  // === END DRAWING AFTER 10 SECONDS ===
  if (allowDraw && inDrawPhase && millis() - drawStartTime >= 10000) {
    allowDraw = false;
    inDrawPhase = false;
    fading = true;
    fadeStartTime = millis();
  }

  // === FADING HANDLER ===
  if (fading) {
    let fadeElapsed = currentTime - fadeStartTime;
    let fadeVal = map(fadeElapsed, 0, 5000, 255, 0);
    fadeVal = constrain(fadeVal, 0, 255);

    if (currentPhase === 'blue') {
      alpha = fadeVal;
      if (fadeVal === 0) {
        blueLines = [];
        alpha = 255;
        fading = false;
        phaseCycleCount++;
      }
    } else if (currentPhase === 'white') {
      whiteAlpha = fadeVal;
      if (fadeVal === 0) {
        whiteLines = [];
        whiteAlpha = 255;
        fading = false;
        phaseCycleCount++;
      }
    }
  }
}

function mousePressed() {
  if (!songStarted) {
    song.loop();
    songStarted = true;
  }

  if (!fading && (currentPhase === 'blue' || currentPhase === 'white')) {
    allowDraw = true;
    inDrawPhase = true;
    drawStartTime = millis();
  }
}



