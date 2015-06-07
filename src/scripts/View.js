"use strict";

var $ = require("jquery");

function View (config) {
  var defaultConfig = {
    canvasContainerSelector: "",
    width: 400,
    height: 400,
    rectWidth: 20,
    rectHeight: 20
  };

  this.props = $.extend(defaultConfig, config);

  this.init();
}

var proto = View.prototype;

proto.init = function () {
  var $canvasContainer = $(this.props.canvasContainerSelector);

  if ($canvasContainer.length !== 1) {
    throw new Error("The element doesn't exist");
  }

  this.canvas = document.createElement("canvas");

  $canvasContainer.append(this.canvas);

  this.setupCanvas();
  this.setCanvasControls();
  this.setControls();
};

proto.setupCanvas = function () {
  var context = this.canvas.getContext("2d"),
    x, y, offset = 0;

  this.canvas.width = this.props.width;
  this.canvas.height = this.props.height;

  for (x = 0; x <= this.props.width; x += this.props.rectWidth) {
    context.moveTo(0.5 + x + offset, offset);
    context.lineTo(0.5 + x + offset, this.props.height + offset);
  }

  for (y = 0; y <= this.props.height; y += this.props.rectHeight) {
    context.moveTo(offset, 0.5 + y + offset);
    context.lineTo(this.props.width + offset, 0.5 + y + offset);
  }

  context.strokeStyle = "black";
  context.stroke();
};

proto.setCanvasControls = function () {
};

proto.setControls = function () {
};

module.exports = View;