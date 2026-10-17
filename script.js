const paragraphs = [
  "The best way to improve your skills is to practice a little every day. Small improvements become powerful results when you stay consistent and patient.",

  "Technology gives us many opportunities to learn, create, and solve problems. The most successful developers continue experimenting and learning from every project.",

  "Great ideas become real products when people take action. Start with something simple, improve it over time, and do not be afraid to make mistakes.",

  "A positive mindset helps you handle challenges with confidence. When you focus on progress instead of perfection, learning becomes more enjoyable.",

  "Writing clean code is not only about making a program work. It is also about making the code easy to understand, maintain, and improve in the future."
];

const themeButton = document.getElementById("themeButton");
const restartButton = document.getElementById("restartButton");
const newTextButton = document.getElementById("newTextButton");
const typingInput = document.getElementById("typingInput");
const textDisplay = document.getElementById("textDisplay");
const resultCard = document.getElementById("resultCard");
const tryAgainButton = document.getElementById("tryAgainButton");
const toast = document.getElementById("toast");

const timerElement = document.getElementById("timer");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const bestScoreElement = document.getElementById("bestScore");
const progressBar = document.getElementById("progressBar");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

const finalWpm = document.getElementById("finalWpm");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalTime = document.getElementById("finalTime");
const finalCharacters = document.getElementById(
  "finalCharacters"
);

let currentText = "";
let timer = 60;
let timerInterval = null;
let testStarted = false;
let testFinished = false;

let bestScore =
  Number(localStorage.getItem("typeFlowBestScore")) || 0;

function getRandomText() {
  const randomIndex = Math.floor(
    Math.random() * paragraphs.length
  );

  return paragraphs[randomIndex];
}

function loadNewText() {
  currentText = getRandomText();
  textDisplay.innerHTML = "";

  currentText.split("").forEach((character, index) => {
    const characterElement = document.createElement("span");

    characterElement.dataset.index = index;
    characterElement.textContent = character;

    textDisplay.appendChild(characterElement);
  });
}

function resetTest() {
  clearInterval(timerInterval);

  timer = 60;
  testStarted = false;
  testFinished = false;

  typingInput.value = "";
  typingInput.disabled = false;

  timerElement.textContent = "60";
  wpmElement.textContent = "0";
  accuracyElement.textContent = "100%";
  bestScoreElement.textContent = bestScore;
  progressBar.style.width = "0%";

  finalWpm.textContent = "0";
  finalAccuracy.textContent = "0%";
  finalTime.textContent = "0s";
  finalCharacters.textContent = "0";

  statusDot.className = "status-dot";
  statusText.textContent = "Ready to begin";

  resultCard.classList.add("hidden");

  loadNewText();
  typingInput.focus();
}

function startTest() {
  if (testStarted || testFinished) {
    return;
  }

  testStarted = true;
  statusDot.className = "status-dot active";
  statusText.textContent = "Test in progress";

  timerInterval = setInterval(() => {
    timer -= 1;
    timerElement.textContent = timer;

    updateStats();

    if (timer <= 0) {
      finishTest();
    }
  }, 1000);
}

function updateTextDisplay() {
  const typedText = typingInput.value;
  const characters = textDisplay.querySelectorAll("span");

  characters.forEach((character, index) => {
    character.classList.remove(
      "correct",
      "incorrect",
      "current"
    );

    if (index < typedText.length) {
      if (typedText[index] === currentText[index]) {
        character.classList.add("correct");
      } else {
        character.classList.add("incorrect");
      }
    }

    if (index === typedText.length) {
      character.classList.add("current");
    }
  });
}

function calculateAccuracy() {
  const typedText = typingInput.value;

  if (typedText.length === 0) {
    return 100;
  }

  let correctCharacters = 0;

  for (let index = 0; index < typedText.length; index++) {
    if (typedText[index] === currentText[index]) {
      correctCharacters += 1;
    }
  }

  return Math.round(
    (correctCharacters / typedText.length) * 100
  );
}

function calculateWPM() {
  const typedText = typingInput.value;
  const elapsedSeconds = 60 - timer;

  if (elapsedSeconds <= 0 || typedText.length === 0) {
    return 0;
  }

  let correctCharacters = 0;

  for (let index = 0; index < typedText.length; index++) {
    if (typedText[index] === currentText[index]) {
      correctCharacters += 1;
    }
  }

  const words = correctCharacters / 5;
  const minutes = elapsedSeconds / 60;

  return Math.max(0, Math.round(words / minutes));
}

function updateStats() {
  const accuracy = calculateAccuracy();
  const wpm = calculateWPM();

  const progress = Math.min(
    (typingInput.value.length / currentText.length) * 100,
    100
  );

  accuracyElement.textContent = `${accuracy}%`;
  wpmElement.textContent = wpm;
  progressBar.style.width = `${progress}%`;
}

function finishTest() {
  if (testFinished) {
    return;
  }

  clearInterval(timerInterval);

  testFinished = true;
  typingInput.disabled = true;

  const accuracy = calculateAccuracy();
  const wpm = calculateWPM();
  const characters = typingInput.value.length;
  const timeTaken = Math.max(1, 60 - timer);

  statusDot.className = "status-dot finished";
  statusText.textContent = "Test completed";

  finalWpm.textContent = wpm;
  finalAccuracy.textContent = `${accuracy}%`;
  finalTime.textContent = `${timeTaken}s`;
  finalCharacters.textContent = characters;

  if (wpm > bestScore) {
    bestScore = wpm;

    localStorage.setItem(
      "typeFlowBestScore",
      bestScore
    );

    bestScoreElement.textContent = bestScore;
    showToast("New personal best! 🎉");
  }

  resultCard.classList.remove("hidden");

  resultCard.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

function loadTheme() {
  const savedTheme = localStorage.getItem("typeFlowTheme");

  if (savedTheme === "dark") {
    document.body.setAttribute("data-theme", "dark");
    themeButton.textContent = "☀️";
  }
}

typingInput.addEventListener("input", () => {
  if (!testStarted) {
    startTest();
  }

  updateTextDisplay();
  updateStats();

  if (typingInput.value.length >= currentText.length) {
    finishTest();
  }
});

restartButton.addEventListener("click", resetTest);

newTextButton.addEventListener("click", () => {
  resetTest();
  showToast("New paragraph loaded");
});

tryAgainButton.addEventListener("click", resetTest);

themeButton.addEventListener("click", () => {
  const isDark =
    document.body.getAttribute("data-theme") === "dark";

  if (isDark) {
    document.body.removeAttribute("data-theme");
    themeButton.textContent = "🌙";
    localStorage.setItem("typeFlowTheme", "light");
  } else {
    document.body.setAttribute("data-theme", "dark");
    themeButton.textContent = "☀️";
    localStorage.setItem("typeFlowTheme", "dark");
  }
});

loadTheme();
bestScoreElement.textContent = bestScore;
resetTest();