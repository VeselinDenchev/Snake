# Snake
JavaScript  Course Project

&nbsp;&nbsp;&nbsp;&nbsp;The good old *Snake* game remastered in JavaScript.

&nbsp;&nbsp;&nbsp;&nbsp;The rules are simple:
1. The snake start with one square length (its head).
2. The snake can move up, down, left and right.
3. If the snake gets out of a bound it spawns on the opposite side of the map.
4. Every eaten piece of food by the snake makes its body one segment longer. The are two types of food:
    - Regular (an apple)\
    &nbsp;&nbsp;&nbsp;&nbsp;The regular food adds 1 point to the score. It spawns once after another piece of regular food is eaten. 
    - Special (a mouse)\
    &nbsp;&nbsp;&nbsp;&nbsp;The special food adds 28 points to the score. It spawns randomly with 3% chance of spawning in each render of a game frame. It can't be in the same position as regular food that is already spawned. Once it is spawned it stays on the screen for 10 seconds and afterwards disapears.
5. The game ends when the head of the snake 'bites' the body (the heads touches a body segment). If the current score is bigger than the best score it becomes the new best score.