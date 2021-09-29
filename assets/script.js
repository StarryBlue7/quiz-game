const mode = [
    {
        difficulty: "Easy",
        timeLimit: 60,
        attemptPoints: [20, 10], 
        timeLoss: 3,
        timeMultiplier: 2
    },
    {
        difficulty: "Hard",
        timeLimit: 45,
        attemptPoints: [30],
        timeLoss: 5,
        timeMultiplier: 10
    }
]

const questionSpeed = 500;

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

function showThemes() {
    quiz.forEach(function callbackFn(theme, i) { 
        let li = document.createElement("li");
        li.textContent = theme.category;
        li.setAttribute("data-theme", i);
        answerBox.appendChild(li);
    })
};

function showModes() {
    mode.forEach(function callbackFn(setting, i) { 
        let button = buildBtn(setting.difficulty, setting.difficulty, "bordered")
        button.setAttribute("data-difficulty", i);
        quizBox.appendChild(button);
    })
}

viewScores.addEventListener("click", showScores);

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

function setTimer() {
    // time = timeLimit[difficultyMode];
    time = mode[difficultyMode].timeLimit;
};

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

function rightAnswer() {
    playing = false;
    const attemptsAllowed = mode[difficultyMode].attemptPoints.length;
    score += mode[difficultyMode].attemptPoints[attemptsAllowed - attempts]
    // score += attemptPoints[attemptsAllowed - attempts];

    let bell = new Audio("./assets/sounds/rightBell.wav");
    bell.play();
    bell.volume = 0.5;

    writePoints();
    gameMessage(true);
    revealAnswer();
};

function wrongAnswer() {
    time -= mode[difficultyMode].timeLoss;
    // time -= timeLoss;

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

function revealAnswer() {
    let correctAnswer = document.getElementById("correct");
    correctAnswer.style.backgroundColor = "green";
    setTimeout(() => {
        correctAnswer.style.backgroundColor = "inherit";
        endRound()
    }, 2000);
}

function gameMessage(isCorrect) {
    if (isCorrect === true) {
        const attemptsAllowed = mode[difficultyMode].attemptPoints.length;
        message.innerText = "Correct! +" + mode[difficultyMode].attemptPoints[attemptsAllowed - attempts] + " pts!";
        // message.innerText = "Correct! +" + attemptPoints[attemptsAllowed - attempts] + " pts!";
    } else {
        message.innerText = "Wrong! -" + mode[difficultyMode].timeLoss + "s"
    }
    setTimeout(() => {
        message.innerText = " ";
    }, 2000);
}

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

function winGame() {
    let timeBonus = time * mode[difficultyMode].timeMultiplier;
    // let timeBonus = time * timeMultiplier;
    score += timeBonus;
    message.innerText = "Time Bonus: " + timeBonus + " pts!"

    let winSound = new Audio("./assets/sounds/gameWin.wav");
    winSound.play();
    winSound.volume = 0.5;
    
    hideQuiz(true);
    clearAnswers();
    endCard(true);
}

function gameOver() {
    let loseSound = new Audio("./assets/sounds/gameLose.wav");
    loseSound.play();
    loseSound.volume = 0.5;

    isLose = true;
    hideQuiz(true);
    clearAnswers();
    endCard(false);
};

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

function buildBtn(text, id, addClass) {
    let btn = document.createElement("button");
    btn.innerText = text;
    btn.setAttribute("id", id);
    btn.setAttribute("class", addClass);
    return btn;
}

function hideQuiz(toHidden) {
    if (toHidden === true) {
        questionBox.classList.add("hidden");
        answerBox.classList.add("hidden");
    } else {
        questionBox.classList.remove("hidden");
        answerBox.classList.remove("hidden");
    } 
};

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

function saveScore(initials) {
    let newScore = {
        initials: initials,
        // difficulty: difficulty[difficultyMode],
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