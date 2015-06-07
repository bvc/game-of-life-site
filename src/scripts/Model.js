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

proto.stepBackward = function () {
  // TODO: Step backward
  this.event(this.grid);
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
  // TODO: Step forward
  this.event(this.grid);
};

proto.reset = function () {
  this.grid = this.createArray(this.config.x, this.config.y);
  this.event(this.grid);
};

proto.playThrough = function () {
  var self = this;

  if (!this.isPlaying) {
    return;
  }

  setTimeout(function () {
    // TODO: Toggle next state change
    console.log("I'm playing");
    self.playThrough();
  }, 500);
};

module.exports = Model;