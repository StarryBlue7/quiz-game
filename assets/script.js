const easyTime = 60;
const hardTime = 40;
const attemptPoints = [20, 10];
const timeLoss = 3;
const timeMultiplier = 1;
const attemptsAllowed = 2;
const questionSpeed = 500;

var category = 0;
var score = 0;
var attempts;
var difficulty = "easy";
var playing = false;
var isWin = false;
var time = easyTime;
var showingHighScores = false;
var questionOrder = [];
var questionCounter = 0;

const theme = document.getElementById("theme");
const viewScores = document.getElementById("view-high-scores");
const message = document.getElementById("message-box");
const timeClock = document.getElementById("time");
const points = document.getElementById("points");
const quizBox = document.getElementById("quiz-box");
const questionBox = document.getElementById("question-box");
const answerBox = document.getElementById("answer-box");
const startButton = document.getElementById("start");

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

startButton.addEventListener("click", startGame);

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
    if (difficulty === "easy") {
        time = easyTime;
    } else {
        time = hardTime;
    }
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
    endMessage(true);
    writePoints();
}

function gameOver() {
    hideQuiz(true);
    clearAnswers();
    endMessage(false);
    writePoints();
};

function endMessage(isWin) {
    let endMsg = document.createElement("h2");
    if (isWin === true) {
        endMsg.innerText = "You Win!";
    } else {
        endMsg.innerText = "Game Over!";
    }
    endMsg.setAttribute("class", "bordered");
    quizBox.appendChild(endMsg);

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
        questionBox.setAttribute("class", "hidden");
        answerBox.setAttribute("class", "hidden");
    } else {
        questionBox.setAttribute("class", "visible");
        answerBox.setAttribute("class", "visible");
    } 
};

init();