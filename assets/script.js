const easyTime = 60;
const hardTime = 30;
const firstAnswer = 20;
const secondAnswer = 10;
const timeLoss = 5;
const attemptsAllowed = 2;
const questionSpeed = 500;

var category = 0;
var score = 0;
var attempt = 1;
var difficulty = "easy";
var playing = false;
var isWin = false;
var time;

const theme = document.getElementById("theme");
const viewScores = document.getElementById("view-high-scores");
const message = document.getElementById("message-box");
const timeClock = document.getElementById("time");
const questionBox = document.getElementById("question-box");
const answerBox = document.getElementById("answer-box");
const startButton = document.getElementById("start")

// fetch("./questions.json");

// console.log(questions);

// function createQuestion() {
//     return JSON.parse(questions.json);
// }


// quiz.forEach(quizItem => {
//     quizItem.category;
//     quizItem.questions.forEach(question => {
//         question.question;
//         question.answers.forEach(answer => {
            
//         })
//     })
// });

// console.log(quiz[0].questions[0].question);
// console.log(quiz[0].questions[0].answers[0]);

startButton.addEventListener("click", startGame);

function startGame() {
    score = 0;
    setTimer();
    startRound();
}

function setTimer() {
    if (difficulty === "easy") {
        time = easyTime;
    } else {
        time = hardTime;
    }
}

function startRound() {
    attempt = 1;
    let questionIndex = findRandomQuestion();
    writeQuestion(questionIndex);
    writeAnswers(questionIndex);
    playing = true;
}

function timer() {
    setInterval(() => {
        if (playing === true) {
            time--;
        }

        timeClock.textContent = time;

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
    startRound();
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

function questionFail() {
    showCorrect();
    startRound();
}

function writeQuestion(questionNum) {
    questionBox.textContent = quiz[category].questions[questionNum].question;
}

