var track = {
  volume: 0.5,
  fadeIn: 2.5,
  fadeOut: 1.3,
}

document.querySelector('#white').addEventListener('click', () => { Noise.white(track); });
document.querySelector('#pink').addEventListener('click', () => { Noise.pink(track); });
document.querySelector('#brown').addEventListener('click', () => { Noise.brown(track); });
document.querySelector('#stop').addEventListener('click', () => { Noise.stop(track); });
