"use strict";

function Model (config) {
  this.config = config;
  this.init();
}

var proto = Model.prototype;

proto.createArray = function (length) {
  var self = this,
    arr = new Array(length || 0),
    i = length;

  if (arguments.length > 1) {
    var args = Array.prototype.slice.call(arguments, 1);
    while (i--) {
      arr[length - 1 - i] = self.createArray.apply(this, args);
    }
  }

  return arr;
};

proto.init = function () {
  this.grid = this.createArray(this.config.x, this.config.y);
};

proto.onAreaStateUpdate = function (cb) {
  this.event = cb;
};

proto.getAreaState = function (x, y) {
  return this.grid[x][y];
};

proto.toggleAreaState = function (x, y) {
  this.grid[x][y] = !this.grid[x][y];
};

proto.play = function () {
  this.isPlaying = true;
  this.playThrough();
};

proto.pause = function () {
  this.isPlaying = false;
  this.playThrough();
};

proto.stepForward = function () {
  this.nextGeneration();
  this.event(this.grid);
};

proto.reset = function () {
  this.grid = this.createArray(this.config.x, this.config.y);
  this.event(this.grid);
};

proto.numberOfLiveNeighbors = function (x, y) {
  var xOffsets = [-1, 0, 1, -1, 1, -1, 0, 1],
    yOffsets = [-1, -1, -1, 0, 0, 1, 1, 1],
    numOfLiveCells = 0, len = xOffsets.length,
    i, neighborX, neighborY;

  for (i = 0; i < len; i++) {
    neighborX = x + xOffsets[i];
    neighborY = y + yOffsets[i];

    if (neighborX < 0 || neighborX >= this.config.x || neighborY < 0 || neighborY >= this.config.y) {
      continue;
    }

    if (this.grid[neighborX][neighborY]) {
      numOfLiveCells++;
    }
  }

  return numOfLiveCells;
};

proto.shouldLive = function (currentState, x, y) {
  if (!currentState) {
    return this.numberOfLiveNeighbors(x, y) === 3;
  }

  return ((this.numberOfLiveNeighbors(x, y) === 2) || (this.numberOfLiveNeighbors(x, y) === 3));
};

proto.nextGeneration = function () {
  var self = this,
    grid = this.grid,
    nextGrid = this.createArray(this.config.x, this.config.y);

  for (var x = 0; x < grid.length; x++) {
    for (var y = 0; y < grid[0].length; y++) {
      nextGrid[x][y] = self.shouldLive(grid[x][y], x, y);
    }
  }

  self.grid = nextGrid;
};

proto.playThrough = function () {
  var self = this;

  if (!this.isPlaying) {
    return;
  }

  setTimeout(function () {
    self.nextGeneration();
    self.event(self.grid);
    self.playThrough();
  }, 100);
};

module.exports = Model;