const easyTime = 60;
const hardTime = 40;
const firstAnswer = 20;
const secondAnswer = 10;
const timeLoss = 3;
const attemptsAllowed = 2;
const questionSpeed = 500;

var category = 0;
var score = 0;
var attempt = 1;
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
const questionBox = document.getElementById("question-box");
const answerBox = document.getElementById("answer-box");
const startButton = document.getElementById("start")

function init() {
    writeTheme();
    writePoints();
    setTimer();
    writeTime();
}

function writeTheme() {
    theme.textContent = quiz[category].category;
}

function writePoints() {
    points.textContent = score;
}

function writeTime() {
    timeClock.textContent = time;
}

startButton.addEventListener("click", startGame);

function startGame() {
    score = 0;
    setTimer();
    questionOrder = randomOrder(quiz[category].questions);
    questionCounter = 0;
    startRound();
}

function setTimer() {
    if (difficulty === "easy") {
        time = easyTime;
    } else {
        time = hardTime;
    }
}

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
}

function startRound() {
    attempt = 1;
    questionIndex = questionOrder[questionCounter]
    questionCounter++
    writeQuestion(questionIndex);
    writeAnswers(questionIndex);
    playing = true;
}

function startTimer() {
    setInterval(() => {
        if (playing === true) {
            time--;
        }

        writeTime();

        if(time >= 0 && isWin) {
            clearInterval(timer);
            winGame();
        } else if (time <= 0) {
            time = 0;
            clearInterval(timer);
            gameOver();
        }
    }, 1000)
}

function rightAnswer() {
    playing = false;
    messageRight();
    addPoints();
}

function wrongAnswer() {
    time -= timeLoss;
    messageWrong();
    if (attempt < attemptsAllowed) {
        attempt++;
    } else {
        playing = false;
        revealAnswer();
        startRound();
    }
}

function writeQuestion(questionIndex) {
    questionBox.textContent = quiz[category].questions[questionIndex].question;
}

function writeAnswers(questionIndex) {
    let answerSet = quiz[category].questions[questionIndex].answers;
    // for (i = 0; i < answerSet.length; i++) {
    //     positions.push(i);
    // }
    let answerOrder = randomOrder(answerSet);

    answerOrder.forEach(function callbackFn(answerNumber) { 
        let li = document.createElement("li");
        li.textContent = answerSet[answerNumber];
        if (answerNumber === 0) {
            li.setAttribute("data-check", "true");
        } else {
            li.setAttribute("data-check", "false");
        }
        answerBox.appendChild(li);
    })
};

init();