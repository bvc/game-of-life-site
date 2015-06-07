"use strict";

var $ = require("jquery"),
  Model = require("./Model");

function View (config) {
  var defaultConfig = {
    canvasContainerSelector: "",
    width: 700,
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

  this.model = new Model();

  this.setupCanvas();
  this.setCanvasControls();
  this.setControls();
};

/**
 * Setup the canvas
 */
proto.setupCanvas = function () {
  var context = this.canvas.getContext("2d"),
    x, y, offset = 0;

  this.canvas.width = this.props.width;
  this.canvas.height = this.props.height;

  for (x = 0; x <= this.props.width; x += this.props.rectWidth) {
    context.moveTo(x + offset, offset);
    context.lineTo(x + offset, this.props.height + offset);
  }

  for (y = 0; y <= this.props.height; y += this.props.rectHeight) {
    context.moveTo(offset, y + offset);
    context.lineTo(this.props.width + offset, y + offset);
  }

  context.strokeStyle = "black";
  context.stroke();
};

/**
 * Set listeners for canvas
 */
proto.setCanvasControls = function () {
  var self = this;

  function getPosition(evt) {
    var rect = self.canvas.getBoundingClientRect();

    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  $(this.canvas).mousemove(function (evt) {
    var pos = getPosition(evt);

    // Display highlight when hovering
    console.log("==HOVER== x:" + pos.x + " y:" + pos.y);
  });

  $(this.canvas).click(function (evt) {
    var pos = getPosition(evt);

    // Change state when clicking
    console.log("==CLICK== x:" + pos.x + " y:" + pos.y);
  });
};

/**
 * Set listeners for the controls
 */
proto.setControls = function () {
};

module.exports = View;