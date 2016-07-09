import $ from 'jquery';
import GameState from '../models/game-state';

export default class GameComponent {
  constructor (config) {
    let defaultConfig = {
      canvasContainerSelector: '',
      controlContainerSelector: '',
      width: 700,
      height: 400,
      rectWidth: 10,
      rectHeight: 10
    };

    this.props = $.extend(defaultConfig, config);

    this.init();
  }

  init () {
    let $canvasContainer = $(this.props.canvasContainerSelector);

    if ($canvasContainer.length !== 1) {
      throw new Error('The element does not exist or should only target one dom element');
    }

    this.$canvasContainer = $canvasContainer;
    this.$canvasContainer.width(this.props.width);
    this.$canvasContainer.height(this.props.height);

    this.$controls = $(this.props.controlContainerSelector);

    this.model = new GameState({
      x: this.props.width / this.props.rectWidth,
      y: this.props.height / this.props.rectHeight
    });

    this.setupCanvas();
    this.setCanvasEvents();
    this.setControlEvents();
  }

  setupCanvas () {
    const self = this;

    ['gridCanvas', 'selectCanvas', 'highlightCanvas'].forEach((canvasName, idx) => {
      let canvasEl = self[canvasName] = document.createElement('canvas');

      canvasEl.width = self.props.width;
      canvasEl.height = self.props.height;
      canvasEl.style.position = 'absolute';
      canvasEl.style.left = 0;
      canvasEl.style.top = 0;
      canvasEl.style.zIndex = idx;

      self.$canvasContainer.append(canvasEl);
    });

    let cxt = this.gridCanvas.getContext('2d');
    let offset = 0;

    for (let x = 0; x <= this.props.width; x += this.props.rectWidth) {
      cxt.moveTo(x + offset, offset);
      cxt.lineTo(x + offset, this.props.height + offset);
    }

    for (let y = 0; y <= this.props.height; y += this.props.rectHeight) {
      cxt.moveTo(offset, y + offset);
      cxt.lineTo(this.props.width + offset, y + offset);
    }

    cxt.strokeStyle = 'black';
    cxt.stroke();
  }

  setCanvasEvents () {
    const self = this;

    let highlightCxt = self.highlightCanvas.getContext('2d');
    let selectCxt = self.selectCanvas.getContext('2d');
    let rWidth = self.props.rectWidth;
    let rHeight = self.props.rectHeight;
    let oldRect;

    function clearOldRect () {
      if (oldRect) {
        highlightCxt.clearRect(oldRect.xPos, oldRect.yPos, rWidth, rHeight);
      }
    }

    function highlightArea (coor) {
      clearOldRect();

      highlightCxt.fillStyle = '#7ec0ee';
      highlightCxt.fillRect(coor.xPos, coor.yPos, rWidth, rHeight);

      oldRect = coor;
    }

    function toggleSelectArea (coor) {
      self.model.toggleAreaState(coor.xNum, coor.yNum);

      let currentState = self.model.getAreaState(coor.xNum, coor.yNum);

      if (currentState) {
        selectCxt.fillStyle = '#000080';
        selectCxt.fillRect(coor.xPos, coor.yPos, rWidth, rHeight);
      } else {
        selectCxt.clearRect(coor.xPos, coor.yPos, rWidth, rHeight);
      }
    }

    function updateSelectArea (grid) {
      for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[0].length; y++) {
          if (grid[x][y]) {
            selectCxt.fillStyle = '#000080';
            selectCxt.fillRect(x * rWidth, y * rHeight, rWidth, rHeight);
          } else {
            selectCxt.clearRect(x * rWidth, y * rHeight, rWidth, rHeight);
          }
        }
      }
    }

    function getPosition (evt) {
      let rect = self.gridCanvas.getBoundingClientRect();
      let x = evt.clientX - rect.left;
      let y = evt.clientY - rect.top;
      let xNum = Math.floor(x / rWidth);
      let yNum = Math.floor(y / rHeight);

      return {
        xNum: Math.abs(xNum),
        yNum: Math.abs(yNum),
        xPos: xNum * rWidth,
        yPos: yNum * rHeight
      };
    }

    $(this.highlightCanvas).mousemove((evt) => {
      highlightArea(getPosition(evt));
    });

    $(this.highlightCanvas).mouseout(() => {
      clearOldRect();
    });

    $(this.highlightCanvas).click((evt) => {
      toggleSelectArea(getPosition(evt));
    });

    self.model.onAreaStateUpdate((grid) => {
      updateSelectArea(grid);
    });
  }

  setControlEvents () {
    const self = this;

    let $play = this.$controls.find('.play');
    let $pause = this.$controls.find('.pause');

    $play.click(() => {
      $play.prop('disabled', true);
      $pause.prop('disabled', false);

      self.model.play();
    });

    $pause.click(() => {
      $play.prop('disabled', false);
      $pause.prop('disabled', true);

      self.model.pause();
    });

    this.$controls.find('.step-forward').click(() => {
      self.model.stepForward();
    });

    this.$controls.find('.reset').click(() => {
      self.model.reset();
    });
  }
}
