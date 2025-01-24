import { coreGameAssets, wordsArray } from "./modules/ai-invasion-assets.js";

console.log("FUD v0.1");

/* ---------- AI INVASION - a game by David Wildman ---------*/

/* ---------- The aim of this game is to review words that pop up on your screen, and shoot any that are not real words.
------------- 
------------- When the game starts, the will see a "play" button and an "instructions" button.
------------- On clicking "instructions", a guide to playing the game is shown.
------------- On clicking "play",  countdown begins from 3.
------------- When the game starts, a word appears somewhere on the screen.
------------- You have to decide whether to keep or discard the word.
------------- Clicking on the word brings up its definition and a "keep" and "discard" button.
------------- If you keep a real word, your score is increased by the point value of that word.
------------- If you discard a real word, your score is decreased by the point value of that word.
------------- If you keep a fake word, the language pollution level increases by 1.
------------- If you discard a fake word, your score increases by the point value of that word.
------------- Once the language pollution level reaches a given threshold, you lose the game and your score is displayed.
------------- If the number of fake words exceeds a given threshold, all interactivity stops.
------------- The game then spews out loads of fake words for 3 seconds. It is then game over.
------------- If you score over a certain threshold, you are given a particularly eloquent message.
------------- If you score below a given threshold, you are given a poorly worded message.
------------- -------------------------------------------------------------------------------------------------------------*/

/*----------- GLOBAL VARIABLES INITIALIZATION ----------*/
let gameReset = true;
let playerScore = 0;
let currentWord = null;
// let scoreOne = 0;
// let scoreTwo = 0;
// let scoreThree = 0;
// let highScore = 0;
// let currentLanguagePollutionLevel = 0;
const newGameWordsArray = [];

// DOM Elements //
const resetToggleButton = document.querySelector("#reset-toggle-button");
const gameBoard = document.querySelector(".game-board");
const wordInfo = document.querySelector("#word-info");
const scoreBoard = document.querySelector("#player-score");
const jumbotron = document.querySelector(".jumbotron");
const timer = document.querySelector("#timer");

/*-----------------------------------------*/
/*-----------                    ----------*/
/*-----------                    ----------*/
/*----------- CORE GAME FUNCTION ----------*/
/*-----------                    ----------*/
/*-----------                    ----------*/
/*-----------------------------------------*/

const getNewGameWordsArray = () => {
  // The wordsArray is imported from the core game assets file.
  // The object at index position [0] should remain the same
  // each time the game is run.
  console.log("THIS WORD SHOULD BE THE SAME EACH TIME: ", wordsArray[0].word);
  // The Core Game Assets array is never mutated. At the moment,
  // it contains very few objects. Once there are a significant number
  // of objects in this array, I will set a hard limit on the
  // number of objects to import for a game.
  for (let i = 0; i < coreGameAssets.length; i++) {
    // This block of code is looping through the imported
    // array of word objects, and picking out a random one
    // to splice out and push into the newGameWordsArray.
    // The random number will always correspond to a valid
    // index of an object within the current wordsArray. Once
    // all the objects have been pushed, the loop stops.
    let n = Math.round(wordsArray.length * Math.random());
    let splicedWordObject = wordsArray.splice(n - 1, 1)[0];
    newGameWordsArray.push(splicedWordObject);
  }

  // Finally, I log the object at index position [0]
  // of the new game array. This makes it easy to
  // check whether or not the array has been
  // randomized successfully.
  console.log(
    "THIS WORD SHOULD BE DIFFERENT EACH TIME: ",
    newGameWordsArray[0].word
  );
};

const playGame = () => {
  console.log(newGameWordsArray);
  const maxActiveWords = 10;
  const wordInterval = 800; // Generate words slightly faster
  const moveInterval = 2000; // Move words every 2 seconds

  const generateWord = () => {
    // Count current active words
    const currentWords = gameBoard.querySelectorAll("span").length;

    if (currentWords < maxActiveWords) {
      // Get random word from array
      const randomIndex = Math.floor(Math.random() * wordsArray.length);
      const newWordObject = wordsArray[randomIndex];
      addItemsToGameBoard(newWordObject);

      // Remove word after random time between 3-6 seconds
      const removeDelay = Math.random() * 3000 + 3000;
      setTimeout(() => {
        const words = gameBoard.querySelectorAll("span");
        if (words.length > 0) {
          const randomWord = words[Math.floor(Math.random() * words.length)];
          if (randomWord && !randomWord.isClicked) {
            randomWord.remove();
          }
        }
      }, removeDelay);
    }
  };

  // Move existing words randomly
  const moveWords = () => {
    const words = gameBoard.querySelectorAll("span");
    words.forEach((word) => {
      if (!word.isClicked) {
        const newX = Math.floor(Math.random() * 80) + 1;
        const newY = Math.floor(Math.random() * 80) + 1;
        word.style.transition = "all 0.5s ease-in-out";
        word.style.left = `${newX}%`;
        word.style.top = `${newY}%`;
      }
    });
  };

  // Start generating and moving words
  const wordGenerator = setInterval(generateWord, wordInterval);
  const wordMover = setInterval(moveWords, moveInterval);

  // Clear intervals when game ends
  setTimeout(() => {
    clearInterval(wordGenerator);
    clearInterval(wordMover);
    // Clear all remaining words
    const words = gameBoard.querySelectorAll("span");
    words.forEach((word) => word.remove());
  }, 71000);
};

/*----------- GLOBAL FUNCTIONS ----------*/

const playAudio = (audioSource) => {
  if (!audioSource) return;
  let audio = new Audio("/games/ai-invasion/" + audioSource);
  audio.play();
};

// Play and reset button  //
const toggleReset = () => {
  if (gameReset === true) {
    gameReset = false;
    console.log("Game started.");
    resetToggleButton.setAttribute("value", "RESTART");
    jumbotron.style.display = "none";
    gameBoard.style.border = "none";
    wordInfo.innerHTML = "";
    timer.innerHTML = "01:10";
    playAudio("anthem.mp3");
    gameBoard.style.backgroundImage =
      "url(https://media.giphy.com/media/l0MYGWqxQUdCONvTq/giphy.gif)";
    gameBoard.style.backgroundSize = "contain";
    gameBoard.style.backgroundPosition = "center";
    gameBoard.style.backgroundRepeat = "no-repeat";
    getNewGameWordsArray();
    playGame();
    timerMechanism();
  } else {
    gameReset = true;
    window.location.reload();
  }
};

const addItemsToGameBoard = (wordObject) => {
  const getRandomXCoordinate = () => Math.floor(Math.random() * 80) + 1;
  const getRandomYCoordinate = () => Math.floor(Math.random() * 80) + 1;

  const xPos = getRandomXCoordinate() + "%";
  const yPos = getRandomYCoordinate() + "%";

  const wordSpan = `<span 
    data-points-score='${wordObject.points}' 
    data-definition='${wordObject.definition}' 
    data-is-real='${wordObject.isReal}'
    style='top:${yPos};left:${xPos};'>${wordObject.word}</span>`;

  gameBoard.innerHTML += wordSpan;
};

const getButtons = (event) => {
  if (event.target === event.currentTarget) return;

  currentWord = event.target;
  currentWord.isClicked = true; // Mark as clicked
  currentWord.remove();

  wordInfo.innerHTML = `
    <div class="word-definition">${currentWord.dataset.definition}</div>
    <div class="button-container">
      <button id="keep" 
        value="${currentWord.dataset.pointsScore}" 
        data-points-score="${currentWord.dataset.pointsScore}" 
        data-definition="${currentWord.dataset.definition}" 
        data-is-real="${currentWord.dataset.isReal}">
        KEEP
      </button>
      <button id="discard" 
        value="${currentWord.dataset.pointsScore}" 
        data-points-score="${currentWord.dataset.pointsScore}" 
        data-definition="${currentWord.dataset.definition}" 
        data-is-real="${currentWord.dataset.isReal}">
        DISCARD
      </button>
    </div>
  `;
};

const playerScoreEvent = (event) => {
  if (event.target === event.currentTarget || !event.target.matches("button")) {
    return;
  }

  const button = event.target;
  const isKeep = button.id === "keep";
  const isReal = button.dataset.isReal === "true";
  const points = parseInt(button.dataset.pointsScore);

  if ((isKeep && isReal) || (!isKeep && !isReal)) {
    console.log("CORRECT");
    gameBoard.style.backgroundImage =
      "url(https://media.giphy.com/media/26tknCqiJrBQG6bxC/giphy.gif)";
    playAudio("congrats.mp3");
    playerScore += points;
  } else {
    console.log("INCORRECT");
    gameBoard.style.backgroundImage =
      "url(https://media.giphy.com/media/hPPx8yk3Bmqys/giphy.gif)";
    playAudio("i-dont-think-so.mp3");
    playerScore -= points;
  }

  scoreBoard.innerHTML = playerScore;
  wordInfo.innerHTML = isReal
    ? `<div>REAL WORD:<br>${button.dataset.definition}</div>`
    : `<div>FAKE WORD!!!</div>`;
};

const timerMechanism = () => {
  let timeRemaining = 60 * 1.1825;

  const updateTimer = () => {
    const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, "0");
    const seconds = String(Math.floor(timeRemaining % 60)).padStart(2, "0");
    timer.textContent = `${minutes}:${seconds}`;

    if (timeRemaining < 30) timer.style.color = "orange";
    if (timeRemaining < 15) timer.style.color = "red";
    if (timeRemaining < 10) timer.style.animation = "flash 0.5s infinite";
    if (timeRemaining < 5) timer.style.animation = "flash 0.125s infinite";

    if (--timeRemaining < 0) {
      clearInterval(timerInterval);
      timer.textContent = "";
      gameBoard.innerHTML = "";

      // Create a container for end game message with higher z-index
      const endGameMessage = document.createElement("div");
      endGameMessage.style.position = "fixed";
      endGameMessage.style.top = "50%";
      endGameMessage.style.left = "50%";
      endGameMessage.style.transform = "translate(-50%, -50%)";
      endGameMessage.style.zIndex = "1000";
      endGameMessage.style.color = "white";
      endGameMessage.style.fontSize = "5vmin";
      endGameMessage.style.textAlign = "center";
      endGameMessage.style.fontFamily = "Orbitron";
      endGameMessage.style.textShadow = "2px 2px 4px rgba(0,0,0,0.8)";

      if (playerScore <= 35) {
        gameBoard.style.backgroundImage =
          "url(https://media.giphy.com/media/l49JFunqyrbTPSfIY/giphy.gif)";
        endGameMessage.innerHTML = `GAME OVER.<br>YOU LOSE!<br><br>35 points needed to win.<br><br>Try again?`;
      } else {
        gameBoard.style.backgroundImage =
          "url(https://media.giphy.com/media/OlSUgQk2sIlTW/giphy.gif)";
        endGameMessage.innerHTML = `WELL DONE!<br>YOU WIN!`;
      }

      gameBoard.appendChild(endGameMessage);
      wordInfo.innerHTML = "";
    }
  };

  const timerInterval = setInterval(updateTimer, 1000);
  updateTimer();
};

/*----------- ------------------------------------------------------------------------------------------------------------*/
// Global event Listeners //
resetToggleButton.addEventListener("click", toggleReset);
gameBoard.addEventListener("click", getButtons);
wordInfo.addEventListener("click", playerScoreEvent);
