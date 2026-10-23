"use strict";
(function () {
  const music = new Audio("assets/audio/background-music.aac");
  music.volume = 0.20;
  music.loop = true;
  music.preload = "auto";
  music.autoplay = true;
  let muted = false, pending = false;

  function play() {
    if (muted || music.paused === false || pending) return;
    pending = true;
    try {
      const request = music.play();
      if (request && request.then) request.then(function () { pending = false; }, function () { pending = false; });
      else pending = false;
    } catch (_) { pending = false; }
  }

  function setMuted(value) {
    muted = Boolean(value);
    music.muted = muted;
    if (!muted) play();
  }

  // A browser may require a user gesture before it allows audible autoplay.
  // Retry on normal game interactions; always reuse the same looping player.
  document.addEventListener("pointerdown", play, true);
  document.addEventListener("click", play, true);
  document.addEventListener("keydown", function (event) {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.code === "KeyM") return;
    play();
  }, true);
  music.addEventListener("error", function () {});
  window.QingGameMusic = { setMuted:setMuted };
  play();
})();
