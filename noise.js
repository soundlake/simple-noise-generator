// https://codepen.io/2kool2/pen/xrLeMq
// https://noisehack.com/generate-noise-web-audio-api/

var Noise = (function () {
  "use strict";

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  let fadeOutTimer;

  function createWhite(track) {
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    track.audioSource.buffer = noiseBuffer;
  }

  function createPink(track) {
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // (roughly) compensate for gain
      b6 = white * 0.115926;
    }
    track.audioSource.buffer = noiseBuffer;
  }

  function createBrown(track) {
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    var lastOut = 0.0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 5; // (roughly) compensate for gain
    }
    track.audioSource.buffer = noiseBuffer;
  }

  function stopNoise(track) {
    if (track.audioSource) {
      clearTimeout(fadeOutTimer);
      track.audioSource.stop();
    }
  }

  function fade(track) {
    track.fadeOut = (track.fadeOut && track.fadeOut >= 0) ? track.fadeOut : 0.5;

    if (track.canFade) {
      track.gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + track.fadeOut);
      track.canFade = false;

      fadeOutTimer = setTimeout(() => {
        stopNoise(track);
      }, track.fadeOut * 1000);
    }
  }

  function buildTrack(track) {
    track.audioSource = audioContext.createBufferSource();
    track.gainNode = audioContext.createGain();
    track.audioSource.connect(track.gainNode);
    track.gainNode.connect(audioContext.destination);
    track.canFade = true; // used to prevent fadeOut firing twice
  }

  function setGain(track) {
    track.volume = (track.volume && track.volume >= 0) ? track.volume : 0.5;
    track.fadeIn = (track.fadeIn && track.fadeIn >= 0) ? track.fadeIn : 0.5;
    track.gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    track.gainNode.gain.linearRampToValueAtTime(track.volume / 4, audioContext.currentTime + track.fadeIn / 2);
    track.gainNode.gain.linearRampToValueAtTime(track.volume, audioContext.currentTime + track.fadeIn);
  }

  function playNoise(track, type) {
    stopNoise(track);
    if (['white', 'pink', 'brown'].indexOf(type) < 0) {
      return ;
    }
    buildTrack(track);
    switch (type) {
      case 'white': createWhite(track); break;
      case 'pink': createPink(track); break;
      case 'brown': createBrown(track); break;
    }
    setGain(track);
    track.audioSource.loop = true;
    track.audioSource.start();
  }

  return {
    white: (track) => { playNoise(track, 'white'); },
    pink: (track) => { playNoise(track, 'pink'); },
    brown: (track) => { playNoise(track, 'brown'); },
    stop: stopNoise
  }
}());
