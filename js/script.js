//  Game constants
const snakeSpeed = 2;
const gameBoard = document.getElementById('game-board');
const expansionRate = 1;
const gridSize = 15;
const specialFoodExpirationMs = 10_000;

// Directions
const directionUpName = 'up';
const directionDownName = 'down';
const directionLeftName = 'left';
const directionRightName = 'right';
const directionUpY = -1;
const directionDownY = 1;
const directionLeftX = -1;
const directionRightX = 1;

//  Score labels
const scoreLabel = "Score: ";
const bestScoreLabel = "Best score: ";

//  Messages
const gameOverMessage = "You lost. Press OK to restart.";

//  Food points
const regularFoodPoints = 1;
const specialFoodPoints = 28;

//  Possibility percentages
const maxPercentPossibility = 100;
const specialFoodPercentPossibility = 3;

//  Arrows
const arrowUp = "ArrowUp";
const arrowDown = "ArrowDown";
const arrowLeft = "ArrowLeft";
const arrowRight = "ArrowRight";

//  Classes
const regularFoodClass = 'regular-food';
const specialFoodClass = 'special-food';
const snakeBodyClass = "snake-body";

//  IDs
const snakeHeadId = "snake-head";
const scoreId = "score";
const bestScoreId = "best-score";

const secondsInMillisecond = 1_000;

let snakeBody = [getRandomGridPosition()];

let lastRenderTime;
let inputDirection = {x: 0, y: 0};
let lastInputDirection = {x: 0, y: 0};

let regularFood = getRandomFoodPosition();
let regularFoodElement;

let specialFood = {x: 0, y: 0, isSpawned: false};
let specialFoodElement;
let specialFoodCreationTime; 

let newSegmentsCount;

let gameOver = false;

gameBoard.style.gridTemplateRows = 'repeat(' + gridSize + ', 1fr)';
gameBoard.style.gridTemplateColumns = 'repeat(' + gridSize + ', 1fr)';

let score = 0;
let bestScore = null;
let isNewBestScore = false;

window.requestAnimationFrame(play);

window.addEventListener('keydown', e => {
    switch (e.key) {
        case arrowUp:
            if(lastInputDirection.y !== 0)
            {
                break;
            }

            inputDirection = {x: 0, y: directionUpY};
            break;

        case arrowDown:
            if(lastInputDirection.y !== 0)
            {
                break;
            }

            inputDirection = {x: 0, y: directionDownY};
            break;

        case arrowLeft:
            if(lastInputDirection.x !== 0)
            {
                break;
            }

            inputDirection = {x: directionLeftX, y: 0};
            break;

        case arrowRight:
            if(lastInputDirection.x !== 0)
            {
                break;
            }

            inputDirection = {x: directionRightX, y: 0};
            break;
    }
});

function play(currentTime) {
    if (gameOver) {
       if (confirm(gameOverMessage)) {
            isNewBestScore = score > bestScore;
            if (isNewBestScore || bestScore == null) {
                bestScore = score;
            }            
            loadGame(bestScore);
       }
       
       return;
    }

    window.requestAnimationFrame(play);
    const secondsSinceLastRender = (currentTime - lastRenderTime) / secondsInMillisecond;

    if (secondsSinceLastRender < 1 / snakeSpeed) return;
    
    lastRenderTime = currentTime;

    update();
    draw(gameBoard);
}

function loadGame(bestScore) {
    const bestScoreText = document.getElementById(bestScoreId);
    bestScoreText.innerHTML = bestScoreLabel + bestScore;

    resetVariableValues();

    window.requestAnimationFrame(play);
}

function resetVariableValues() {
    lastRenderTime = 0;
    
    inputDirection = {x: 0, y: 0};
    lastInputDirection = {x: 0, y: 0};

    snakeBody = [getRandomGridPosition()];
    regularFood = getRandomFoodPosition();

    specialFood = {x: 0, y: 0, isSpawned: false};
    specialFoodCreationTime = null;

    newSegmentsCount = 0;

    gameOver = false;

    score = 0;

    refreshScore();
}

function draw(gameboard) {
    gameboard.innerHTML = '';
    drawSnake(gameboard);
    drawFood(gameboard);
}

function update() {
    updateSnake();
    updateFood();
    gameOver = isSnakeIsIntersectingItself();
}

function updateSnake() {
    addSnakeSegments();

    for (let index = snakeBody.length - 2; index >= 0; index--) {
        snakeBody[index + 1] = {...snakeBody[index]};
    }

    const head = getSnakeHead();
    head.x += inputDirection.x;
    head.y += inputDirection.y;

    lastInputDirection = inputDirection;

    const isOutOfLeftBound = head.x < 1;
    const isOutOfRightBound = head.x > gridSize;
    const isOutOfUpBound = head.y < 1
    const isOutOfBoundsDown = head.y > gridSize;

    if (isOutOfLeftBound) {
        head.x = gridSize;
        return;
    }

    if (isOutOfRightBound) {
        head.x = 1;
        return;
    }

    if (isOutOfUpBound) {
        head.y = gridSize;
        return;
    }
    
    if (isOutOfBoundsDown) {
        head.y = 1;
    }
}

function drawSnake(gameboard) {
    gameboard.innerHTML = '';

    for (let index = 0; index < snakeBody.length; index++) {
        let snakeElement = document.createElement("div");
        snakeElement.style.gridColumnStart = snakeBody[index].x;
        snakeElement.style.gridRowStart = snakeBody[index].y;

        const isHead = index == 0;
        if (isHead) {
            snakeElement.id = snakeHeadId;
        }
        else {
            snakeElement.className = snakeBodyClass;
        }

        gameboard.appendChild(snakeElement);
    }

    adjustSnakeHeadOrientation(inputDirection);
}

function expandSnake(amount) {
    newSegmentsCount += amount;
}

function isOnSnake(position, { ignoreHead = false } = {}) {
    return snakeBody.some((segment, index) => {
        const isHead = index == 0;
        if (isHead && ignoreHead) {
            return false;
        }
        return haveEqualPositions(segment, position)
    })
}

function addSnakeSegments() {
    for (let index = 0; index < newSegmentsCount; index++) {
        snakeBody.push({...snakeBody[snakeBody.length - 1]});
    }

    newSegmentsCount = 0;
}

function getSnakeHead() {
    const head = snakeBody[0];

    return head;
}

function adjustSnakeHeadOrientation(newCoordinates) {
    newDirection = getDirectionName(newCoordinates);
    let degreesToRotate = 0;

    switch (newDirection) {
        case directionLeftName:
            degreesToRotate = -90;
            break;

        case directionRightName:
            degreesToRotate = 90;
            break;

        case directionDownName:
            degreesToRotate = 180;
            break;

        default:
            return;
    }

    const snakeHeadElement = document.getElementById(snakeHeadId);
    snakeHeadElement.style.transform = 'rotate(' + degreesToRotate + 'deg)';
}

function isSnakeIsIntersectingItself() {
    const head = getSnakeHead();

    return isOnSnake(head, { ignoreHead : true });
}

function updateFood() {
    if (isOnSnake(regularFood)) {
        expandSnake(expansionRate);
        addPointsToScore(regularFoodPoints);
        regularFood = getRandomFoodPosition();
    }

    if (specialFood.isSpawned && isOnSnake(specialFood)) {
        specialFood.isSpawned = false;
        expandSnake(expansionRate);
        addPointsToScore(specialFoodPoints);
    }

    const randomPercentage = getRandomIntBiggerThanZero(maxPercentPossibility);

    const currentTime = (new Date).getTime();

    const isPossibleToGetSpawned = randomPercentage <= specialFoodPercentPossibility;
    const isInTheSamePositionAsRegularFood = specialFood.x == regularFood.x && specialFood.y == regularFood.y;
    const timeForSpecialFoodHasRunOut = currentTime - specialFoodCreationTime > specialFoodExpirationMs;
    if (!specialFood.isSpawned && isPossibleToGetSpawned) {    
        do {
            specialFood = getRandomFoodPosition();
        }
        while (isInTheSamePositionAsRegularFood)

        specialFood = {x: specialFood.x, y: specialFood.y, isSpawned: true};
    }
    else if (specialFoodCreationTime != null && timeForSpecialFoodHasRunOut) {
        specialFood.isSpawned = false;
        specialFoodCreationTime = null;
    }
}

function drawFood(gameboard) {
    regularFoodElement = document.createElement('div');
    regularFoodElement.style.gridColumnStart = regularFood.x;
    regularFoodElement.style.gridRowStart = regularFood.y;
    regularFoodElement.classList.add(regularFoodClass);
    gameboard.appendChild(regularFoodElement);

    if (specialFood.isSpawned) {
        specialFoodElement = document.createElement('div');
        specialFoodElement.style.gridColumnStart = specialFood.x;
        specialFoodElement.style.gridRowStart = specialFood.y;
        specialFoodElement.classList.add(specialFoodClass);
        gameboard.appendChild(specialFoodElement);
        if (specialFoodCreationTime == null) {
            specialFoodCreationTime = (new Date).getTime();
        }
    }
    else if (gameboard.classList.contains(specialFoodClass)) {
        gameboard.removeChild(specialFoodElement);
    }
}

function getRandomFoodPosition() {
    let newFoodPosition;
    while (newFoodPosition == null || isOnSnake(newFoodPosition)) {
        newFoodPosition = getRandomGridPosition();
    }

    return newFoodPosition;
}

function haveEqualPositions(firstPosition, secondPosition) {
    const haveEqualPositions = firstPosition.x == secondPosition.x && firstPosition.y == secondPosition.y;

    return haveEqualPositions;
}

function getRandomGridPosition() {
    const position = {
        x: getRandomIntBiggerThanZero(gridSize),
        y: getRandomIntBiggerThanZero(gridSize)
    }

    return position;
}

function getRandomIntBiggerThanZero(upperBound) {
    const randomInt =  Math.floor(Math.random() * upperBound) + 1;

    return randomInt;
}

function addPointsToScore(points) {
    score += points;
    refreshScore();
}

function refreshScore() {
    const scoreText = document.getElementById(scoreId);
    scoreText.innerHTML = scoreLabel + score;
}

function getDirectionName(directionCoordinates) {
    let directionName;

    switch (directionCoordinates.x) {
        case directionRightX:
            directionName = directionRightName;
            break;
    
        case directionLeftX:
            directionName = directionLeftName;
            break;
    }

    switch (directionCoordinates.y) {
        case directionUpY:
            directionName = directionUpName;
            break;
    
        case directionDownY:
            directionName = directionDownName;
    }

    return directionName;
}