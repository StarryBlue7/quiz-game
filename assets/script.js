const timeLimit = [60, 40];
const difficulty = ["Easy", "Hard"];

const attemptPoints = [20, 10];
const attemptsAllowed = attemptPoints.length;

const timeLoss = 3;
const timeMultiplier = 1;

const questionSpeed = 500;

var category = 0;
var score = 0;
var attempts;
var difficultyMode = 0;
var playing = false;
var isWin = false;
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
const startButton = document.getElementById("start");
const scoreboard = document.getElementById("scoreboard");

function init() {
    writeTheme();
    writePoints();
    setTimer();
    writeTime();
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

viewScores.addEventListener("click", showScores);
startButton.addEventListener("click", startGame);
quizBox.addEventListener("click", function(event) {
    let button = event.target;
    if (button.matches("button") && button.getAttribute("id") === "save-score") {
        let initials = prompt("Enter initials:").slice(0,2).toUpperCase();
        if (initials !== null) {
            saveScore(initials);
        }
    } else if (button.matches("button") && button.getAttribute("id") === "restart") {
        hideQuiz(false);
        init();
    }
    hideScoreboard(true);
})

function startGame() {
    score = 0;
    setTimer();
    hideQuiz(false);
    questionOrder = randomOrder(quiz[category].questions);
    questionCounter = 0;
    startTimer();
    startRound();
};

function setTimer() {
    time = timeLimit[difficultyMode];
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
    attempts = attemptsAllowed;
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

answerBox.addEventListener("click", function(event) {
    let dataCheck = event.target.getAttribute("data-check");
    if (dataCheck == "true") {
        rightAnswer();
    } else if (dataCheck == "false") {
        wrongAnswer();
    }
});

function rightAnswer() {
    playing = false;
    score += attemptPoints[attemptsAllowed - attempts];
        
    writePoints();
    gameMessage(true);
    revealAnswer();
};

function wrongAnswer() {
    time -= timeLoss;
    gameMessage(false);
    if (attempts > 1) {
        attempts--;
    } else {
        playing = false;
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
        message.innerText = "Correct! +" + attemptPoints[attemptsAllowed - attempts] + " pts!";
    } else {
        message.innerText = "Wrong! -" + timeLoss + "s"
    }
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

function writeQuestion(questionIndex) {
    questionBox.textContent = quiz[category].questions[questionIndex].question;
};

function writeAnswers(questionIndex) {
    let answerSet = quiz[category].questions[questionIndex].answers;
    let answerOrder = randomOrder(answerSet);

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

function winGame() {
    let timeBonus = time * timeMultiplier;
    score += timeBonus;
    message.innerText = "Time Bonus: " + timeBonus + " pts!"
    
    hideQuiz(true);
    clearAnswers();
    endCard(true);
}

function gameOver() {
    hideQuiz(true);
    clearAnswers();
    endCard(false);
};

function endCard(isWin) {
    let endMsg = document.createElement("h2");
    if (isWin === true) {
        endMsg.innerText = "You Win!";
    } else {
        endMsg.innerText = "Game Over!";
    }
    endMsg.setAttribute("class", "bordered");
    quizBox.appendChild(endMsg);

    let finalScore = document.createElement("h3");
    finalScore.innerText = "Final Score: " + score + " pts";
    finalScore.setAttribute("class", "bordered");
    quizBox.appendChild(finalScore);

    let saveBtn = document.createElement("button");
    saveBtn.innerText = "Save Score?";
    saveBtn.setAttribute("id", "save-score");
    saveBtn.setAttribute("class", "bordered");
    quizBox.appendChild(saveBtn); 

    let restartBtn = document.createElement("button");
    restartBtn.innerText = "Restart";
    restartBtn.setAttribute("id", "restart");
    restartBtn.setAttribute("class", "bordered");
    quizBox.appendChild(restartBtn); 
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

function showScores() {
    playing = false;
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

        let scoreTable = "<table><tr><td>Initials</td><td>Difficulty</td><td>Score</td>"
        scoreList.forEach(function callbackFn(entry) {
            scoreTable += "<tr>";
            scoreTable += "<td>" + entry.initials + "</td>";
            scoreTable += "<td>" + entry.difficulty + "</td>";
            scoreTable += "<td>" + entry.score + "</td>";
            scoreTable += "</tr>";
        })
        scoreboard.innerHTML += scoreTable;

    } else {
        scoreList = [];
    }
    localStorage.setItem("scoreList", JSON.stringify(scoreList));
}

function saveScore(initials) {
    let newScore = {
        initials: initials,
        difficulty: difficulty[difficultyMode],
        score: score
    }
    scoreList = JSON.parse(localStorage.getItem("scoreList"));
    scoreList.push(newScore);
    localStorage.setItem("scoreList", JSON.stringify(scoreList));
    updateScores();
}

init();