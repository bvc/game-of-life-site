/**
 * Neighbor coordinates relative to the current x and y positions
 */
const X_OFFSETS = [-1, 0, 1, -1, 1, -1, 0, 1];
const Y_OFFSETS = [-1, -1, -1, 0, 0, 1, 1, 1];
const OFFSETS_LENGTH = 8;

export default class GameState {
  constructor (config) {
    this.config = config;
    this.init();
  }

  /**
   * Initialize the cells
   */
  init() {
    this.grid = this.createArray(this.config.x, this.config.y);
  }

  /**
   * Creates an n-dimensional array
   * @param length - The length of the array
   * @returns {Array}
   */
  createArray (length) {
    let arr = new Array(length || 0);
    let i = length;

    if (arguments.length > 1) {
      let args = Array.prototype.slice.call(arguments, 1);

      while (i--) {
        arr[length - 1 - i] = this.createArray.apply(this, args);
      }
    }

    return arr;
  }

  /**
   * Event handler to update any views listening to changes
   * @param cb - The callback to handle updates
   */
  onAreaStateUpdate (cb) {
    this.event = cb;
  }

  /**
   * Gets the state of the cell at the coordinates
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns {boolean} - State of the cell
   */
  getAreaState (x, y) {
    return this.grid[x][y];
  }

  /**
   * Toggles the cell at the given coordinates to be alive or dead
   * @param x - X coordinate
   * @param y - Y coordinate
   */
  toggleAreaState (x, y) {
    this.grid[x][y] = !this.grid[x][y];
  }

  /**
   * Plays the simulation
   */
  play () {
    this.isPlaying = true;
    this.playThrough();
  }

  /**
   * Pauses the simulation
   */
  pause () {
    this.isPlaying = false;
    this.playThrough();
  }

  /**
   * Moves the simulation forward a generation
   */
  stepForward () {
    this.nextGeneration();
  }

  /**
   * Resets the entire grid
   */
  reset () {
    this.grid = this.createArray(this.config.x, this.config.y);
    this.event(this.grid);
  }

  /**
   * Counts the number of live neighbors for a given coordinate
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns {number} - Number of live neighbors
   */
  numberOfLiveNeighbors (x, y) {
    let numberOfLiveCells = 0;
    let neighborX;
    let neighborY;

    for (let i = 0; i < OFFSETS_LENGTH; i++) {
      neighborX = x + X_OFFSETS[i];
      neighborY = y + Y_OFFSETS[i];

      if (neighborX < 0 || neighborX >= this.config.x || neighborY < 0 || neighborY >= this.config.y) {
        continue;
      }

      if (this.grid[neighborX][neighborY]) {
        numberOfLiveCells++;
      }
    }

    return numberOfLiveCells;
  }

  /**
   * Determines whether the cell should live or die based on:
   *
   * Any live cell with fewer than two live neighbours dies, as if caused by under-population.
   * Any live cell with two or three live neighbours lives on to the next generation.
   * Any live cell with more than three live neighbours dies, as if by overcrowding.
   * Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
   *
   * @param currentState - The current state of the target cell
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns {boolean} - Whether the cell should live or die in the next generation
   */
  shouldLive (currentState, x, y) {
    const liveNeighbors = this.numberOfLiveNeighbors(x, y);

    if (!currentState) {
      return liveNeighbors === 3;
    }

    return ((liveNeighbors === 2) || (liveNeighbors === 3));
  }

  /**
   * Traverse through the grid and determine which cells live or die in the next generation
   */
  nextGeneration () {
    let grid = this.grid;
    let nextGrid = this.createArray(this.config.x, this.config.y);

    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[0].length; y++) {
        nextGrid[x][y] = this.shouldLive(grid[x][y], x, y);
      }
    }

    this.grid = nextGrid;
    this.event(this.grid);
  }

  /**
   * Plays through the next generation
   */
  playThrough () {
    const self = this;

    if (!this.isPlaying) {
      return;
    }

    setTimeout(() => {
      self.nextGeneration();
      self.playThrough();
    }, 100);
  }
}
