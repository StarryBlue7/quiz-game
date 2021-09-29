// Difficulty modes object, can accept any number of different difficulty modes
const mode = [
    {
        difficulty: "Easy",
        timeLimit: 60,              // Total time in seconds
        attemptPoints: [20, 10],    // Points awarded per attempt, total allowed attempts determined by number of entries
        timeLoss: 3,                // Time in seconds deducted from clock for wrong answers
        timeMultiplier: 2           // Time bonus multiplier at end of game
    },
    {
        difficulty: "Hard",
        timeLimit: 45,
        attemptPoints: [30],
        timeLoss: 5,
        timeMultiplier: 10
    }
]

var category = 0;
var score;
var attempts;
var difficultyMode = 0;
var playing = false;
var isWin;
var isLose;
var time;
var showingHighScores = false;
var questionOrder = [];
var questionCounter = 0;
var scoreList;

const theme = document.getElementById("theme");
const viewScores = document.getElementById("view-high-scores");
const message = document.getElementById("message-box");
const timeClock = document.getElementById("time");
const points = document.getElementById("points");
const quizBox = document.getElementById("quiz-box");
const questionBox = document.getElementById("question-box");
const answerBox = document.getElementById("answer-box");
const scoreboard = document.getElementById("scoreboard");
const bgMusic = new Audio("./assets/sounds/bgMusic.wav");

// Runs on page load to set up main menu
function init() {
    writeTheme();
    score = 0;
    isWin = false;
    isLose = false;
    writePoints();
    setTimer();
    writeTime();
    message.innerText = " "
    writeRules();
    showThemes();
    showModes();
};

function writeTheme() {
    theme.textContent = quiz[category].category;
};

function writePoints() {
    points.textContent = score;
};

function writeTime() {
    timeClock.textContent = time;
};

function writeRules() {
    questionBox.innerHTML = "<button id=\"start\" class=\"bordered\">Start</button><h3>You'll have " + mode[difficultyMode].attemptPoints.length + " attempt(s) per question and " + mode[difficultyMode].timeLimit + " seconds in total. Click 'Start' for a new game, or change the category or difficulty below!</h3>"; 
};

// Generate buttons for selecting quiz category
function showThemes() {
    quiz.forEach(function callbackFn(theme, i) { 
        let li = document.createElement("li");
        li.textContent = theme.category;
        li.setAttribute("data-theme", i);
        answerBox.appendChild(li);
    })
};

// Generate buttons for changing difficulty setting
function showModes() {
    mode.forEach(function callbackFn(setting, i) { 
        let button = buildBtn(setting.difficulty, setting.difficulty, "bordered")
        button.setAttribute("data-difficulty", i);
        quizBox.appendChild(button);
    })
}

viewScores.addEventListener("click", showScores);

// Event listener for most dynamically generated buttons
quizBox.addEventListener("click", function(event) {
    event.stopPropagation();
    let button = event.target;
    if (button.matches("button") && button.getAttribute("id") === "start") {
        startGame();
    } else if (button.matches("button") && button.getAttribute("id") === "save-score") {
        let initials = prompt("Enter initials:").slice(0,3).toUpperCase();
        if (initials !== null) {
            saveScore(initials);
        };
    } else if (button.matches("button") && button.getAttribute("id") === "restart") {
        clearEndCard();
        hideQuiz(false);
        init();
    } else if (button.getAttribute("data-difficulty")) {
        difficultyMode = button.getAttribute("data-difficulty");
        console.log("Difficulty: " + difficultyMode);
        setTimer();
        writeTime();
        writeRules();
    };
    hideScoreboard(true);
})

function startGame() {
    bgMusic.play();
    bgMusic.volume = 0.1;
    bgMusic.loop = true;

    score = 0;
    isWin = false;
    isLose = false;
    setTimer();
    hideQuiz(false);
    clearAnswers();
    clearEndCard();

    questionOrder = randomOrder(quiz[category].questions);
    questionCounter = 0;
    startTimer();
    startRound();
};

// Set timer according to difficulty mode
function setTimer() {
    time = mode[difficultyMode].timeLimit;
};

// Random array generator for order of questions and answers
function randomOrder(array) {
    let randomArray = [];
    for (let i = 0; i < array.length; i++) {
        randomArray.push(i);
    }
    for (let i = randomArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [randomArray[i], randomArray[randomIndex]] = [randomArray[randomIndex], randomArray[i]]
    }
    return randomArray;
};

// Begin each question round
function startRound() {
    attempts = mode[difficultyMode].attemptPoints.length;
    if (questionOrder[questionCounter] === undefined) {
        isWin = true;
    } else {
        questionIndex = questionOrder[questionCounter];
        questionCounter++;
        writeQuestion(questionIndex);
        writeAnswers(questionIndex);
        playing = true;
    }
};

// Game timer
function startTimer() {
    const runTimer = setInterval(() => {
        if (playing === true) {
            time--;
        }
        writeTime();

        if(time >= 0 && isWin) {
            clearInterval(runTimer);
            winGame();
        } else if (time <= 0) {
            time = 0;
            writeTime();
            clearInterval(runTimer);
            gameOver();
        }
    }, 1000)
};

// Display question and associated set of answers
function writeQuestion(questionIndex) {
    questionBox.textContent = quiz[category].questions[questionIndex].question;
};

function writeAnswers(questionIndex) {
    let answerSet = quiz[category].questions[questionIndex].answers;
    let answerOrder = randomOrder(answerSet);
    if (isLose) {
        return;
    }
    answerOrder.forEach(function callbackFn(answerNumber) { 
        let li = document.createElement("li");
        li.textContent = answerSet[answerNumber];
        if (answerNumber === 0) {
            li.setAttribute("data-check", "true");
            li.setAttribute("id", "correct");
        } else {
            li.setAttribute("data-check", "false");
        }
        answerBox.appendChild(li);
    })
};

// Check if clicked answer is correct or incorrect
answerBox.addEventListener("click", function(event) {
    event.stopPropagation();
    let dataCheck = event.target.getAttribute("data-check");
    if (playing === true && dataCheck == "true") {
        rightAnswer();
    } else if (playing === true && dataCheck == "false") {
        wrongAnswer();
    } else if (event.target.getAttribute("data-theme")) {
        category = event.target.getAttribute("data-theme");
        console.log("Category: " + category);
        writeTheme();
    }
});

// Award points for correct answer, based on attempt number
function rightAnswer() {
    playing = false;
    const attemptsAllowed = mode[difficultyMode].attemptPoints.length;
    score += mode[difficultyMode].attemptPoints[attemptsAllowed - attempts]

    let bell = new Audio("./assets/sounds/rightBell.wav");
    bell.play();
    bell.volume = 0.5;

    writePoints();
    gameMessage(true);
    revealAnswer();
};

// Deduct time for wrong answer, end round if all attempts used and show correct answer
function wrongAnswer() {
    time -= mode[difficultyMode].timeLoss;

    let buzzer = new Audio("./assets/sounds/wrongBuzzer2.wav");
    buzzer.play();
    buzzer.volume = 0.5;
    
    gameMessage(false);
    if (attempts > 1) {
        attempts--;
    } else {
        playing = false;

        let fail = new Audio("./assets/sounds/failSound.wav");
        fail.play();
        fail.volume = 0.5;

        revealAnswer();
    }
};

// Show correct answer in green
function revealAnswer() {
    let correctAnswer = document.getElementById("correct");
    correctAnswer.style.backgroundColor = "green";
    setTimeout(() => {
        correctAnswer.style.backgroundColor = "inherit";
        endRound()
    }, 2000);
}

// Display game messages for point awards or time deductions
function gameMessage(isCorrect) {
    if (isCorrect === true) {
        const attemptsAllowed = mode[difficultyMode].attemptPoints.length;
        message.innerText = "Correct! +" + mode[difficultyMode].attemptPoints[attemptsAllowed - attempts] + " pts!";
    } else {
        message.innerText = "Wrong! -" + mode[difficultyMode].timeLoss + "s"
    }
    setTimeout(() => {
        message.innerText = " ";
    }, 2000);
}

// Reset board for next round
function endRound() {
    questionBox.textContent = " ";
    clearAnswers();
    startRound();
}

function clearAnswers() {
    while (answerBox.firstChild) {
        answerBox.removeChild(answerBox.firstChild);
    };
}

// Add time bonus when all questions complete before time ends
function winGame() {
    let timeBonus = time * mode[difficultyMode].timeMultiplier;
    score += timeBonus;
    message.innerText = "Time Bonus: " + timeBonus + " pts!"

    let winSound = new Audio("./assets/sounds/gameWin.wav");
    winSound.play();
    winSound.volume = 0.5;
    
    hideQuiz(true);
    clearAnswers();
    endCard(true);
}

// Game over for time running out
function gameOver() {
    let loseSound = new Audio("./assets/sounds/gameLose.wav");
    loseSound.play();
    loseSound.volume = 0.5;

    isLose = true;
    hideQuiz(true);
    clearAnswers();
    endCard(false);
};

// End card shows game results
function endCard(isWin) {
    bgMusic.pause();
    bgMusic.loop = false;
    bgMusic.currentTime = 0;

    let endMsg = document.createElement("h1");
    if (isWin === true) {
        endMsg.innerText = "You Win!";
    } else {
        endMsg.innerText = "Game Over!";
    }
    endMsg.setAttribute("class", "bordered");
    quizBox.appendChild(endMsg);

    let finalScore = document.createElement("h2");
    finalScore.innerText = "Final Score: " + score + " pts";
    finalScore.setAttribute("class", "bordered");
    quizBox.appendChild(finalScore);

    let saveBtn = buildBtn("Save Score?", "save-score", "bordered");
    quizBox.appendChild(saveBtn); 

    let restartBtn = buildBtn("Restart", "restart", "bordered");
    quizBox.appendChild(restartBtn); 
}

function clearEndCard() {
    while (quizBox.children[3]) {
        quizBox.removeChild(quizBox.children[3]);
    };
}

// Build dynamically generated buttons
function buildBtn(text, id, addClass) {
    let btn = document.createElement("button");
    btn.innerText = text;
    btn.setAttribute("id", id);
    btn.setAttribute("class", addClass);
    return btn;
}

// Hide quiz windows for end card
function hideQuiz(toHidden) {
    if (toHidden === true) {
        questionBox.classList.add("hidden");
        answerBox.classList.add("hidden");
    } else {
        questionBox.classList.remove("hidden");
        answerBox.classList.remove("hidden");
    } 
};

// Hide/show high score list
function hideScoreboard(toHidden) {
    if (toHidden === true) {
        scoreboard.classList.add("hidden");
    } else {
        scoreboard.classList.remove("hidden");
    } 
};

function showScores(event) {
    event.stopPropagation();
    hideScoreboard(false);
    updateScores();
};

// Generate table of high scores from local storage JSON file
function updateScores() {
    scoreboard.innerHTML = "<h2>High Scores!<h2>";
    scoreList = JSON.parse(localStorage.getItem("scoreList"));
    if (scoreList !== null) {
        scoreList.sort(function (a, b){
            return b.score - a.score;
        })

        let scoreTable = "<table><tr><th>Initials</th><th>Difficulty</th><th>Category</th><th>Score</th>"
        scoreList.forEach(function callbackFn(entry) {
            scoreTable += "<tr>";
            scoreTable += "<td>" + entry.initials + "</td>";
            scoreTable += "<td>" + entry.difficulty + "</td>";
            scoreTable += "<td>" + entry.category + "</td>";
            scoreTable += "<td>" + entry.score + "</td>";
            scoreTable += "</tr>";
        })
        scoreboard.innerHTML += scoreTable;

    } else {
        scoreList = [];
    }

    let closeBtn = buildBtn("Close", "closeScores", "bordered");
    scoreboard.appendChild(closeBtn); 

    localStorage.setItem("scoreList", JSON.stringify(scoreList));
}

// Add new high score to high scores list and local storage file
function saveScore(initials) {
    let newScore = {
        initials: initials,
        difficulty: mode[difficultyMode].difficulty,
        category: quiz[category].category,
        score: score
    }
    scoreList = JSON.parse(localStorage.getItem("scoreList"));
    scoreList.push(newScore);
    localStorage.setItem("scoreList", JSON.stringify(scoreList));
    updateScores();
    score = 0;
    writePoints();

    let saveScore = new Audio("./assets/sounds/saveHS.wav");
    saveScore.play();
    saveScore.volume = 0.7;
}

init();