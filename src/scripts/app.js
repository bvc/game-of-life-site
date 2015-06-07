"use strict";

var $ = require("jquery"),
  View = require("./View");

$(function () {
  new View({
    canvasContainerSelector: ".canvas-container"
  });
});