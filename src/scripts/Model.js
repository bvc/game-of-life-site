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

module.exports = Model;