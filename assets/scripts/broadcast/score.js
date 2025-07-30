/*
 * Score Rendering Module
 * Handles team scores and bomb state effects
 */

export function initScoreRenderer() {
  let lastScore = '';
  let lastBombState = '';
  let bombFlashInterval = null;
  
  function renderScore(gsi) {
    if (!gsi?.map) return;
    const t = gsi.map.team_t;
    const c = gsi.map.team_ct;
    document.getElementById('team1').textContent = t?.name || 'T';
    document.getElementById('team2').textContent = c?.name || 'CT';
    const scoreStr = String((t?.score || 0)) + ' : ' + String((c?.score || 0));
    const scoreEl = document.getElementById('score');
    
    // Animate score change
    if (lastScore && lastScore !== scoreStr) {
      scoreEl.style.transform = 'scale(1.2)';
      scoreEl.style.color = '#00ff00';
      setTimeout(() => {
        scoreEl.style.transform = '';
        scoreEl.style.color = '';
      }, 600);
    }
    scoreEl.textContent = scoreStr;
    lastScore = scoreStr;
    
    // Bomb state effects
    const bomb = gsi.bomb?.state || gsi.round?.bomb || '';
    const bombBg = document.querySelector('.bomb-bg');
    
    if (bombBg && bomb !== lastBombState) {
      // Clear any existing effects
      if (bombFlashInterval) {
        clearInterval(bombFlashInterval);
        bombFlashInterval = null;
      }
      bombBg.style.opacity = '';
      bombBg.style.background = '';
      bombBg.style.animation = '';
      
      console.log('🧨 Bomb state changed from', lastBombState, 'to', bomb);
      
      // Apply new effect based on bomb state
      if (bomb === 'planted') {
        // Orange pulsing effect for planted bomb
        bombBg.style.background = 'radial-gradient(circle, rgba(255,165,0,0.5) 0%, transparent 70%)';
        bombBg.style.opacity = '1';
        
        // Start flashing animation
        let flashState = true;
        bombFlashInterval = setInterval(() => {
          if (flashState) {
            bombBg.style.background = 'radial-gradient(circle, rgba(255,100,0,0.7) 0%, transparent 60%)';
          } else {
            bombBg.style.background = 'radial-gradient(circle, rgba(255,165,0,0.3) 0%, transparent 70%)';
          }
          flashState = !flashState;
        }, 800); // Flash every 800ms
        
        console.log('🧨 Bomb planted - starting orange flash effect');
        
      } else if (bomb === 'defused') {
        // Green success effect
        bombBg.style.background = 'radial-gradient(circle, rgba(0,255,0,0.6) 0%, transparent 60%)';
        bombBg.style.opacity = '1';
        
        // Flash green 3 times
        let flashCount = 0;
        const defuseFlash = setInterval(() => {
          if (flashCount % 2 === 0) {
            bombBg.style.background = 'radial-gradient(circle, rgba(0,255,0,0.8) 0%, transparent 50%)';
          } else {
            bombBg.style.background = 'radial-gradient(circle, rgba(0,255,0,0.2) 0%, transparent 70%)';
          }
          flashCount++;
          if (flashCount >= 6) { // 3 flashes
            clearInterval(defuseFlash);
            setTimeout(() => {
              bombBg.style.opacity = '';
              bombBg.style.background = '';
            }, 1000);
          }
        }, 300);
        
        console.log('🧨 Bomb defused - showing green flash effect');
        
      } else if (bomb === 'exploded') {
        // Red explosion effect
        bombBg.style.background = 'radial-gradient(circle, rgba(255,0,0,0.8) 0%, transparent 50%)';
        bombBg.style.opacity = '1';
        
        // Intense red flash
        let flashCount = 0;
        const explodeFlash = setInterval(() => {
          if (flashCount % 2 === 0) {
            bombBg.style.background = 'radial-gradient(circle, rgba(255,50,50,0.9) 0%, transparent 40%)';
          } else {
            bombBg.style.background = 'radial-gradient(circle, rgba(200,0,0,0.6) 0%, transparent 60%)';
          }
          flashCount++;
          if (flashCount >= 8) { // 4 flashes
            clearInterval(explodeFlash);
            setTimeout(() => {
              bombBg.style.opacity = '';
              bombBg.style.background = '';
            }, 2000);
          }
        }, 200);
        
        console.log('🧨 Bomb exploded - showing red flash effect');
        
      } else {
        // No bomb or other states - clear effects
        console.log('🧨 No bomb state - clearing effects');
      }
      
      lastBombState = bomb;
    }
  }

  // Cleanup function for when module is reloaded
  function cleanup() {
    if (bombFlashInterval) {
      clearInterval(bombFlashInterval);
      bombFlashInterval = null;
    }
  }

  console.log('✅ Score module finished loading');
  return { renderScore, cleanup };
}
