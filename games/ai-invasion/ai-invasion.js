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

  // Clear intervals when game ends (30 seconds)
  setTimeout(() => {
    clearInterval(wordGenerator);
    clearInterval(wordMover);
    // Clear all remaining words
    const words = gameBoard.querySelectorAll("span");
    words.forEach((word) => word.remove());
  }, 30000); // Changed to 30 seconds
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
    timer.innerHTML = "00:30";
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

// Add new leaderboard functions
const showLeaderboard = async () => {
  try {
    const leaderboardContainer = document.createElement("div");
    leaderboardContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0,0,0,0.8);
      z-index: 1000;
    `;

    // Get scores from localStorage
    const scores = JSON.parse(localStorage.getItem("aiInvasionScores") || "[]");
    const top10 = scores.slice(0, 10);

    // Try to sign the score if wallet is connected
    const currentWalletAddress =
      window.WalletManager?.provider?.publicKey?.toString();
    if (currentWalletAddress) {
      try {
        const signedData = await window.WalletManager.signScore(playerScore);
        if (signedData) {
          const scoreData = {
            score: playerScore,
            ...signedData,
          };

          scores.push(scoreData);
          scores.sort((a, b) => b.score - a.score);
          localStorage.setItem(
            "aiInvasionScores",
            JSON.stringify(scores.slice(0, 100))
          ); // Keep top 100
        }
      } catch (err) {
        console.error("❌ Error signing score:", err);
      }
    }

    const playerRank =
      scores.findIndex((score) => score.publicKey === currentWalletAddress) + 1;

    // Create tweet text based on score
    const tweetText =
      playerScore >= 35
        ? `I just scored ${playerScore} points (Rank #${playerRank}) fighting FAKE NEWS in the FUD game! 🎮\n\n@buythefudcto\n9w1NDpXVbhZwjjD93rJeT126MPgETkkgVsMYNwH6pump\n\nPlay now at https://fartsunicornsdonald.com`
        : `Fake news got me! Only ${playerScore} points (Rank #${playerRank}) in the FUD game! Can you do better? 🎮\n\n@buythefudcto\n9w1NDpXVbhZwjjD93rJeT126MPgETkkgVsMYNwH6pump\n\nPlay at https://fartsunicornsdonald.com`;

    const leaderboardHTML = `
      <div class="leaderboard" style="
        background: rgba(0,0,0,0.95);
        padding: 30px;
        border-radius: 12px;
        color: white;
        font-family: 'Orbitron', sans-serif;
        min-width: 350px;
        max-width: 90%;
        box-shadow: 0 0 20px rgba(255,255,255,0.1);
      ">
        <h2 style="text-align: center; margin-bottom: 20px; color: #fff;">Top Scores</h2>
        ${top10
          .map(
            (score, i) => `
          <div class="score-entry ${
            score.publicKey === currentWalletAddress ? "current-player" : ""
          }" 
               style="
                 margin: 10px 0;
                 padding: 12px;
                 display: flex;
                 justify-content: space-between;
                 ${
                   score.publicKey === currentWalletAddress
                     ? "background: rgba(255,255,255,0.1); border-radius: 8px;"
                     : ""
                 }
                 align-items: center;
               ">
            <span style="font-weight: bold; min-width: 30px;">#${i + 1}</span>
            <span style="flex-grow: 1; text-align: center;">${
              score.score
            }</span>
            <span style="font-family: monospace; opacity: 0.8;">
              ${score.publicKey.slice(0, 4)}...${score.publicKey.slice(-4)}
            </span>
            ${
              score.publicKey === currentWalletAddress
                ? `
              <button onclick="verifyIdentity('${score.publicKey}')"
                      style="
                        margin-left: 10px;
                        padding: 4px 8px;
                        background: #1DA1F2;
                        border: none;
                        color: white;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                      ">
                Verify Identity
              </button>
            `
                : ""
            }
          </div>
        `
          )
          .join("")}
        
        <div style="margin-top: 30px; display: flex; flex-direction: column; gap: 10px;">
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(
            tweetText
          )}"
             target="_blank"
             style="
               background: #1DA1F2;
               color: white;
               padding: 12px;
               border-radius: 8px;
               text-decoration: none;
               text-align: center;
               font-weight: bold;
               transition: all 0.3s ease;
             "
             onmouseover="this.style.transform='scale(1.02)'"
             onmouseout="this.style.transform='scale(1)'">
            Share on Twitter 🐦
          </a>
          
          <button onclick="closeLeaderboard()" 
                  style="
                    width: 100%;
                    padding: 12px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-family: 'Orbitron', sans-serif;
                    transition: all 0.3s ease;
                  "
                  onmouseover="this.style.background='rgba(255,255,255,0.2)'"
                  onmouseout="this.style.background='rgba(255,255,255,0.1)'">
            Close
          </button>
        </div>
      </div>
    `;

    leaderboardContainer.innerHTML = leaderboardHTML;
    document.body.appendChild(leaderboardContainer);
  } catch (err) {
    console.error("❌ Error showing leaderboard:", err);
    // Show error state in leaderboard
    const leaderboardContainer = document.createElement("div");
    leaderboardContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0,0,0,0.8);
      z-index: 1000;
    `;
    leaderboardContainer.innerHTML = `
      <div class="leaderboard" style="
        background: rgba(0,0,0,0.95);
        padding: 30px;
        border-radius: 12px;
        color: white;
        font-family: 'Orbitron', sans-serif;
        min-width: 350px;
        max-width: 90%;
        box-shadow: 0 0 20px rgba(255,255,255,0.1);
      ">
        <h2 style="text-align: center; margin-bottom: 20px; color: #fff;">Error Loading Leaderboard</h2>
        <p style="text-align: center; color: #ff4444;">Please try again later.</p>
        <button onclick="closeLeaderboard()" 
                style="
                  width: 100%;
                  padding: 12px;
                  background: rgba(255,255,255,0.1);
                  border: 1px solid rgba(255,255,255,0.2);
                  color: white;
                  border-radius: 8px;
                  cursor: pointer;
                  font-family: 'Orbitron', sans-serif;
                  margin-top: 20px;
                "
                onmouseover="this.style.background='rgba(255,255,255,0.2)'"
                onmouseout="this.style.background='rgba(255,255,255,0.1)'">
          Close
        </button>
      </div>
    `;
    document.body.appendChild(leaderboardContainer);
  }
};

// Add verify identity function
window.verifyIdentity = async (publicKey) => {
  try {
    console.log("🔍 Attempting to resolve domain for:", publicKey);

    const response = await fetch(
      `https://sns-sdk-proxy.bonfida.workers.dev/domains/${publicKey}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("📡 API response:", data);

    if (
      data.s === "ok" &&
      Array.isArray(data.result) &&
      data.result.length > 0
    ) {
      const domainData = data.result[0];
      console.log("🔑 Found domain data:", domainData);

      const domain = `${domainData.domain}.sol`;
      console.log("✅ Using domain:", domain);

      // Update the display
      const scoreEntries = document.querySelectorAll(".score-entry");
      for (const entry of scoreEntries) {
        const addressSpan = entry.querySelector(
          'span[style*="font-family: monospace"]'
        );
        if (
          addressSpan &&
          addressSpan.textContent.includes(publicKey.slice(0, 4))
        ) {
          addressSpan.innerHTML = `<span style="color: #1DA1F2">${domain}</span>`;
          // Hide the verify button
          const verifyButton = entry.querySelector("button");
          if (verifyButton) {
            verifyButton.style.display = "none";
          }
          break;
        }
      }
    } else {
      console.log("❌ No domains found");
      alert("No .sol domains found for this wallet");
    }
  } catch (err) {
    console.error("❌ Error verifying identity:", err);
    alert(`Error resolving domain: ${err.message}`);
  }
};

// Add close leaderboard function to window scope
window.closeLeaderboard = () => {
  const leaderboardContainer =
    document.querySelector(".leaderboard")?.parentElement;
  if (leaderboardContainer) {
    leaderboardContainer.remove();
  }
};

// Modify timerMechanism to show leaderboard when game ends
const timerMechanism = () => {
  let timeRemaining = 30; // 30 seconds total

  const countdown = setInterval(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timer.innerHTML = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

    if (timeRemaining <= 0) {
      clearInterval(countdown);
      // Show game over message
      wordInfo.innerHTML = `<div style="text-align: center;">
        <h2>GAME OVER!</h2>
        <p>Final Score: ${playerScore}</p>
      </div>`;

      // Show leaderboard after a short delay
      setTimeout(showLeaderboard, 1000);
    }
    timeRemaining--;
  }, 1000);
};

/*----------- ------------------------------------------------------------------------------------------------------------*/
// Global event Listeners //
resetToggleButton.addEventListener("click", toggleReset);
gameBoard.addEventListener("click", getButtons);
wordInfo.addEventListener("click", playerScoreEvent);
