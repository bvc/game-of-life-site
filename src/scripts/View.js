"use strict";

var $ = require("jquery"),
  Model = require("./Model");

function View (config) {
  var defaultConfig = {
    canvasContainerSelector: "",
    controlContainerSelector: "",
    width: 700,
    height: 400,
    rectWidth: 10,
    rectHeight: 10
  };

  this.props = $.extend(defaultConfig, config);

  this.init();
}

var proto = View.prototype;

/**
 * Initialize the canvas layering and model
 */
proto.init = function () {
  var $canvasContainer = $(this.props.canvasContainerSelector);

  if ($canvasContainer.length !== 1) {
    throw new Error("The element doesn't exist");
  }

  this.$canvasContainer = $canvasContainer;
  this.$canvasContainer.width(this.props.width);
  this.$canvasContainer.height(this.props.height);

  this.$controls = $(this.props.controlContainerSelector);

  this.model = new Model({
    x: this.props.width / this.props.rectWidth,
    y: this.props.height / this.props.rectHeight
  });

  this.setupCanvas();
  this.setCanvasEvents();
  this.setControlEvents();
};

/**
 * Setup the gridCanvas, selectCanvas, and highlightCanvas layering
 */
proto.setupCanvas = function () {
  var self = this,
    cxt, x, y, offset = 0;

  ["gridCanvas", "selectCanvas", "highlightCanvas"].forEach(function (canvasName, idx) {
    var canvasEl = self[canvasName] = document.createElement("canvas");

    canvasEl.width = self.props.width;
    canvasEl.height = self.props.height;
    canvasEl.style.position = "absolute";
    canvasEl.style.left = 0;
    canvasEl.style.top = 0;
    canvasEl.style.zIndex = idx;

    self.$canvasContainer.append(canvasEl);
  });

  cxt = this.gridCanvas.getContext("2d");

  for (x = 0; x <= this.props.width; x += this.props.rectWidth) {
    cxt.moveTo(x + offset, offset);
    cxt.lineTo(x + offset, this.props.height + offset);
  }

  for (y = 0; y <= this.props.height; y += this.props.rectHeight) {
    cxt.moveTo(offset, y + offset);
    cxt.lineTo(this.props.width + offset, y + offset);
  }

  cxt.strokeStyle = "black";
  cxt.stroke();
};

/**
 * Set listeners for highlighting and selection
 */
proto.setCanvasEvents = function () {
  var self = this,
    hightlightCxt = self.highlightCanvas.getContext("2d"),
    selectCxt = self.selectCanvas.getContext("2d"),
    rWidth = self.props.rectWidth,
    rHeight = self.props.rectHeight,
    oldRect;

  var clearOldRect = function () {
    if (oldRect) {
      hightlightCxt.clearRect(oldRect.xPos, oldRect.yPos, rWidth, rHeight);
    }
  };

  var highlightArea = function (coor) {
    clearOldRect();

    hightlightCxt.fillStyle = "#7ec0ee";
    hightlightCxt.fillRect(coor.xPos, coor.yPos, rWidth, rHeight);

    oldRect = coor;
  };

  var toggleSelectArea = function (coor) {
    self.model.toggleAreaState(coor.xNum, coor.yNum);

    var currentState = self.model.getAreaState(coor.xNum, coor.yNum);

    if (!!currentState) {
      selectCxt.fillStyle = "#000080";
      selectCxt.fillRect(coor.xPos, coor.yPos, rWidth, rHeight);
    } else {
      selectCxt.clearRect(coor.xPos, coor.yPos, rWidth, rHeight);
    }
  };

  var updateSelectArea = function (grid) {
    for (var x = 0; x < grid.length; x++) {
      for (var y = 0; y < grid[0].length; y++) {
        if (grid[x][y]) {
          selectCxt.fillStyle = "#000080";
          selectCxt.fillRect(x * rWidth, y * rHeight, rWidth, rHeight);
        } else {
          selectCxt.clearRect(x * rWidth, y * rHeight, rWidth, rHeight);
        }
      }
    }
  };

  var getPosition = function (evt) {
    var rect = self.gridCanvas.getBoundingClientRect(),
      x = evt.clientX - rect.left,
      y = evt.clientY - rect.top,
      xNum = Math.floor(x / rWidth),
      yNum = Math.floor(y / rHeight);

    return {
      xNum: Math.abs(xNum),
      yNum: Math.abs(yNum),
      xPos: xNum * rWidth,
      yPos: yNum * rHeight
    };
  };

  $(this.highlightCanvas).mousemove(function (evt) {
    highlightArea(getPosition(evt));
  });

  $(this.highlightCanvas).mouseout(function () {
    clearOldRect();
  });

  $(this.highlightCanvas).click(function (evt) {
    toggleSelectArea(getPosition(evt));
  });

  self.model.onAreaStateUpdate(function (grid) {
    updateSelectArea(grid);
  });
};

/**
 * Set listeners for the controls
 */
proto.setControlEvents = function () {
  var self = this,
    $play = this.$controls.find(".play"),
    $pause = this.$controls.find(".pause");

  $play.click(function () {
    $play.prop("disabled", true);
    $pause.prop("disabled", false);

    self.model.play();
  });

  $pause.click(function () {
    $play.prop("disabled", false);
    $pause.prop("disabled", true);

    self.model.pause();
  });

  this.$controls.find(".step-forward").click(function () {
    self.model.stepForward();
  });

  this.$controls.find(".reset").click(function () {
    self.model.reset();
  });
};

module.exports = View;