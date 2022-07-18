//  Game constants
const SNAKE_SPEED = 2;
const GAME_BOARD = document.getElementById('game-board');
const EXPANSION_RATE = 1;
const GRID_SIZE = 15;
const SPECIAL_FOOD_EXPIRATION_MS = 10_000;

// Directions
const DIRECTION_UP_NAME = 'up';
const DIRECTION_DOWN_NAME = 'down';
const DIRECTION_LEFT_NAME = 'left';
const DIRECTION_RIGHT_NAME = 'right';
const DIRECTION_UP = {x: 0, y: -1};
const DIRECTION_DOWN = {x: 0, y: 1};
const DIRECTION_LEFT = {x: -1, y: 0};
const DIRECTION_RIGHT = {x: 1, y: 0};

//  Score labels
const SCORE_LABEL = "Score: ";
const BEST_SCORE_LABEL = "Best score: ";

//  Messages
const GAME_OVER_MESSAGE = "You lost. Press OK to restart.";

//  Food points
const REGULAR_FOOD_POINTS = 1;
const SPECIAL_FOOD_POINTS = 28;

//  Possibility percentages
const MAX_PERCENT_POSSIBILITY = 100;
const SPECIAL_FOOD_PERCENT_POSSIBILITY = 3;

//  Arrows
const ARROW_UP = "ArrowUp";
const ARROW_DOWN = "ArrowDown";
const ARROW_LEFT = "ArrowLeft";
const ARROW_RIGHT = "ArrowRight";

//  Classes
const REGULAR_FOOD_CLASS = 'regular-food';
const SPECIAL_FOOD_CLASS = 'special-food';
const SNAKE_BODY_CLASS = "snake-body";

//  IDs
const SNAKE_HEAD_ID = "snake-head";
const SCORE_ID = "score";
const BEST_SCORE_ID = "best-score";

const SECONDS_IN_MILLISECOND = 1_000;

let snakeBody = [getRandomGridPosition()];

let lastRenderTime;
let inputDirection = {x: 0, y: 0};
let lastInputDirection = {x: 0, y: 0};

let regularFood = getRandomFoodPosition();
let foodElement;

let specialFood = {x: 0, y: 0, isSpawned: false};
let specialFoodElement;
let specialFoodCreationTime; 

let newSegmentsCount;

let gameOver = false;

GAME_BOARD.style.gridTemplateRows = 'repeat(' + GRID_SIZE + ', 1fr)';
GAME_BOARD.style.gridTemplateColumns = 'repeat(' + GRID_SIZE + ', 1fr)';

let score = 0;
let bestScore = null;
let isNewBestScore = false;

window.requestAnimationFrame(play);

window.addEventListener('keydown', e => {
    switch (e.key) {
        case ARROW_UP:
            if(lastInputDirection.y !== 0)
            {
                break;
            }
            inputDirection = DIRECTION_UP;
            break;

        case ARROW_DOWN:
            if(lastInputDirection.y !== 0)
            {
                break;
            }
            inputDirection = DIRECTION_DOWN;
            break;

        case ARROW_LEFT:
            if(lastInputDirection.x !== 0)
            {
                break;
            }
            inputDirection = DIRECTION_LEFT;
            break;

        case ARROW_RIGHT:
            if(lastInputDirection.x !== 0)
            {
                break;
            }
            inputDirection = DIRECTION_RIGHT;
            break;
    }
});

function play(currentTime) {
    if (gameOver) {
       if (confirm(GAME_OVER_MESSAGE)) {
            isNewBestScore = score > bestScore;
            if (isNewBestScore || bestScore == null) {
                bestScore = score;
            }            
            loadGame(bestScore);
       }
       
       return;
    }

    window.requestAnimationFrame(play);
    let secondsSinceLastRender = (currentTime - lastRenderTime) / SECONDS_IN_MILLISECOND;

    if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;
    
    lastRenderTime = currentTime;

    update();
    draw(GAME_BOARD);
}

function loadGame(bestScore) {
    let bestScoreText = document.getElementById(BEST_SCORE_ID);
    bestScoreText.innerHTML = BEST_SCORE_LABEL + bestScore;

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

    let head = getSnakeHead();
    head.x += inputDirection.x;
    head.y += inputDirection.y;

    lastInputDirection = inputDirection;

    let isOutOfLeftBound = head.x < 1;
    let isOutOfRightBound = head.x > GRID_SIZE;
    let isOutOfUpBound = head.y < 1
    let isOutOfBoundsDown = head.y > GRID_SIZE;

    if (isOutOfLeftBound) {
        head.x = GRID_SIZE;
        return;
    }

    if (isOutOfRightBound) {
        head.x = 1;
        return;
    }

    if (isOutOfUpBound) {
        head.y = GRID_SIZE;
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

        let isHead = index == 0;
        if (isHead) {
            snakeElement.id = SNAKE_HEAD_ID;
        }
        else {
            snakeElement.className = SNAKE_BODY_CLASS;
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
        let isHead = index == 0;
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
    let head = snakeBody[0];

    return head;
}

function adjustSnakeHeadOrientation(newCoordinates) {
    newDirection = getDirectionName(newCoordinates);
    let degreesToRotate = 0;

    switch (newDirection) {
        case DIRECTION_LEFT_NAME:
            degreesToRotate = -90;
            break;

        case DIRECTION_RIGHT_NAME:
            degreesToRotate = 90;
            break;

        case DIRECTION_DOWN_NAME:
            degreesToRotate = 180;
            break;

        default:
            return;
    }

    let snakeHeadElement = document.getElementById(SNAKE_HEAD_ID);
    snakeHeadElement.style.transform = 'rotate(' + degreesToRotate + 'deg)';
}

function isSnakeIsIntersectingItself() {
    let head = getSnakeHead();

    return isOnSnake(head, { ignoreHead : true });
}

function updateFood() {
    if (isOnSnake(regularFood)) {
        expandSnake(EXPANSION_RATE);
        addPointsToScore(REGULAR_FOOD_POINTS);
        regularFood = getRandomFoodPosition();
    }

    if (specialFood.isSpawned && isOnSnake(specialFood)) {
        specialFood.isSpawned = false;
        expandSnake(EXPANSION_RATE);
        addPointsToScore(SPECIAL_FOOD_POINTS);
    }

    let randomPercentage = getRandomIntBiggerThanZero(MAX_PERCENT_POSSIBILITY);

    let currentTime = (new Date).getTime();

    let isPossibleToGetSpawned = randomPercentage <= SPECIAL_FOOD_PERCENT_POSSIBILITY;
    let isInTheSamePositionAsRegularFood = specialFood.x == regularFood.x && specialFood.y == regularFood.y;
    let timeForSpecialFoodHasRunOut = currentTime - specialFoodCreationTime > SPECIAL_FOOD_EXPIRATION_MS;
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
    foodElement = document.createElement('div');
    foodElement.style.gridColumnStart = regularFood.x;
    foodElement.style.gridRowStart = regularFood.y;
    foodElement.classList.add(REGULAR_FOOD_CLASS);
    gameboard.appendChild(foodElement);

    if (specialFood.isSpawned) {
        specialFoodElement = document.createElement('div');
        specialFoodElement.style.gridColumnStart = specialFood.x;
        specialFoodElement.style.gridRowStart = specialFood.y;
        specialFoodElement.classList.add(SPECIAL_FOOD_CLASS);
        gameboard.appendChild(specialFoodElement);
        if (specialFoodCreationTime == null) {
            specialFoodCreationTime = (new Date).getTime();
        }
    }
    else if (gameboard.classList.contains(SPECIAL_FOOD_CLASS)) {
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
    let haveEqualPositions = firstPosition.x == secondPosition.x && firstPosition.y == secondPosition.y;

    return haveEqualPositions;
}

function getRandomGridPosition() {
    let position = {
        x: getRandomIntBiggerThanZero(GRID_SIZE),
        y: getRandomIntBiggerThanZero(GRID_SIZE)
    }

    return position;
}

function getRandomIntBiggerThanZero(upperBound) {
    let randomInt =  Math.floor(Math.random() * upperBound) + 1;

    return randomInt;
}

function addPointsToScore(points) {
    score += points;
    refreshScore();
}

function refreshScore() {
    let scoreText = document.getElementById(SCORE_ID);
    scoreText.innerHTML = SCORE_LABEL + score;
}

function getDirectionName(directionCoordinates) {
    let directionName;

    switch (directionCoordinates.x) {
        case 1:
            directionName = DIRECTION_RIGHT_NAME;
            break;
    
        case -1:
            directionName = DIRECTION_LEFT_NAME;
            break;
    }

    switch (directionCoordinates.y) {
        case -1:
            directionName = DIRECTION_UP_NAME;
            break;
    
        case 1:
            directionName = DIRECTION_DOWN_NAME;
    }

    return directionName;
}