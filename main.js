const grid = new ShipGrid('canvas', SHIP_IMG_SRC, 8, 5);
const hint = document.getElementById('hint');
 
document.body.addEventListener('click', () => {
  grid.toggle();
  hint.classList.add('hidden');
});
 