// loader.js
// Simple loading UI: simulates progress until window.hideLoadingScreen() is called
(function(){
  function qs(id){ return document.getElementById(id); }
  const loadingScreen = qs('loadingScreen');
  const fill = qs('loadingBarFill');

  let progress = 0;
  let ticker = null;

  function stepSim(){
    // gentle random progress up to 99%
    progress += Math.random() * 10 + 4;
    if(progress > 99) progress = 99;
    if(fill) fill.style.width = progress + '%';
    ticker = setTimeout(stepSim, 200);
  }

  function finishAndHide(){
    if(ticker) { clearTimeout(ticker); ticker = null; }
    if(fill) fill.style.width = '100%';
    // slight delay so 100% is visible
    setTimeout(() => {
      if(loadingScreen) loadingScreen.style.display = 'none';
    }, 200);
  }

  // expose the function for game code to call when ready
  window.hideLoadingScreen = finishAndHide;

  document.addEventListener('DOMContentLoaded', function(){
    // start simulated progress
    if(loadingScreen && fill) stepSim();
  });

  // fallback: hide after full window load
  window.addEventListener('load', function(){
    setTimeout(finishAndHide, 300);
  });
})();
