import $ from 'jquery';
import GameComponent from './components/game-component';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

$(() => {
  new GameComponent({
    canvasContainerSelector: ".canvas-container",
    controlContainerSelector: "#controls"
  });
});
