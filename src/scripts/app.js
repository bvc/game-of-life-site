"use strict";

var $ = require("jquery"),
  View = require("./View");

$(function () {
  window.view = new View({
    canvasContainerSelector: ".canvas-container",
    controlContainerSelector: "#controls"
  });
});