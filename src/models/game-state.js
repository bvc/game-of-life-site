function GameState (config) {
  this.config = config;
  this.init();
}

/**
 * Neighbor coordinates relative to the current x and y positions
 */
let X_OFFSETS = [-1, 0, 1, -1, 1, -1, 0, 1],
  Y_OFFSETS = [-1, -1, -1, 0, 0, 1, 1, 1],
  OFFSETS_LENGTH = X_OFFSETS.length;

let proto = GameState.prototype;

/**
 * Creates an n-dimensional array
 * @param length - The length of the array
 * @returns {Array}
 */
proto.createArray = function (length) {
  let arr = new Array(length || 0),
    i = length;

  if (arguments.length > 1) {
    let args = Array.prototype.slice.call(arguments, 1);
    while (i--) {
      arr[length - 1 - i] = this.createArray.apply(this, args);
    }
  }

  return arr;
};

/**
 * Initializes the cells
 */
proto.init = function () {
  this.grid = this.createArray(this.config.x, this.config.y);
};

/**
 * Event handler to update any views listening to changes
 * @param cb - The callback to handle updates
 */
proto.onAreaStateUpdate = function (cb) {
  this.event = cb;
};

/**
 * Gets the state of the cell at the given coordinates
 * @param x - The x coordinate
 * @param y - The y coordinate
 * @returns {boolean} - The state of the cell
 */
proto.getAreaState = function (x, y) {
  return this.grid[x][y];
};

/**
 * Toggles the cell at the given coordinates to be alive or dead
 * @param x - The x coordinate
 * @param y - The y coordinate
 */
proto.toggleAreaState = function (x, y) {
  this.grid[x][y] = !this.grid[x][y];
};

/**
 * Plays the simulation
 */
proto.play = function () {
  this.isPlaying = true;
  this.playThrough();
};

/**
 * Pauses the simulation
 */
proto.pause = function () {
  this.isPlaying = false;
  this.playThrough();
};

/**
 * Steps forward a generation
 */
proto.stepForward = function () {
  this.nextGeneration();
};

/**
 * Resets the entire grid
 */
proto.reset = function () {
  this.grid = this.createArray(this.config.x, this.config.y);
  this.event(this.grid);
};

/**
 * Counts the number of live neighbors for a given coordinate
 * @param x - The x coordinate
 * @param y - The y coordinate
 * @returns {number} - Number of live neighbors
 */
proto.numberOfLiveNeighbors = function (x, y) {
  let numOfLiveCells = 0,
    i, neighborX, neighborY;

  for (i = 0; i < OFFSETS_LENGTH; i++) {
    neighborX = x + X_OFFSETS[i];
    neighborY = y + Y_OFFSETS[i];

    if (neighborX < 0 || neighborX >= this.config.x || neighborY < 0 || neighborY >= this.config.y) {
      continue;
    }

    if (this.grid[neighborX][neighborY]) {
      numOfLiveCells++;
    }
  }

  return numOfLiveCells;
};

/**
 * Determines whether the cell should live or die based on:
 *
 * Any live cell with fewer than two live neighbours dies, as if caused by under-population.
 * Any live cell with two or three live neighbours lives on to the next generation.
 * Any live cell with more than three live neighbours dies, as if by overcrowding.
 * Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
 *
 * @param currentState - The current state of the target cell
 * @param x - The x coordinate
 * @param y - The y coordinate
 * @returns {boolean} - Whether the cell should live or die in the next generation
 */
proto.shouldLive = function (currentState, x, y) {
  let liveNeighbors = this.numberOfLiveNeighbors(x, y);

  if (!currentState) {
    return liveNeighbors === 3;
  }

  return ((liveNeighbors === 2) || (liveNeighbors === 3));
};

/**
 * Traverse through the grid and determine which cells live or die in the next generation
 */
proto.nextGeneration = function () {
  let grid = this.grid,
    nextGrid = this.createArray(this.config.x, this.config.y);

  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[0].length; y++) {
      nextGrid[x][y] = this.shouldLive(grid[x][y], x, y);
    }
  }

  this.grid = nextGrid;
  this.event(this.grid);
};

/**
 * Plays through the next generation
 */
proto.playThrough = function () {
  let self = this;

  if (!this.isPlaying) {
    return;
  }

  setTimeout(function () {
    self.nextGeneration();
    self.playThrough();
  }, 100);
};

export default GameState;
