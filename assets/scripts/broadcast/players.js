/*
 * Player Rendering Module
 * Handles CS2 player card creation, updates, and animations
 */

export function initPlayerRenderer() {
  const playersDiv = document.getElementById('players');
  playersDiv.innerHTML = '<div class="team-col left"></div><div class="team-col right"></div>';
  const $left = playersDiv.querySelector('.team-col.left');
  const $right = playersDiv.querySelector('.team-col.right');

  let playersData = {};
  let currentMap = '';

  function weaponIcon(w) {
    if (!w || !w.name) return '';
    const id = (w.name || '').replace(/^weapon_/, '');
    return '<img class="weapon" src="/assets/weapons/weapon_' + id + '.svg" alt="' + id + '">';
  }

  function updateMapBackground(gsi) {
    const mapName = gsi?.map?.name;        // e.g. "de_cache"
    if (!mapName || mapName === currentMap) return;
    const url = 'https://raw.githubusercontent.com/ghostcap-gaming/cs2-map-images/refs/heads/main/cs2/' + mapName + '.png';
    document.querySelector('.main').style.backgroundImage = 'url(' + url + ')';
    currentMap = mapName;
  }

  function renderPlayers(gsi) {
    updateMapBackground(gsi);
    
    if (!gsi?.allplayers) {
      console.log('No allplayers data found');
      return;
    }
    
    console.log('Rendering players:', Object.keys(gsi.allplayers).length, 'players found');
    console.log('Team columns:', $left ? 'left OK' : 'left MISSING', $right ? 'right OK' : 'right MISSING');
    
    const currentPlayers = Object.keys(gsi.allplayers);
    const existingPlayers = Object.keys(playersData);
    
    // Remove players who are no longer in the game
    existingPlayers.forEach(steamid => {
      if (!currentPlayers.includes(steamid)) {
        const card = document.querySelector('[data-steamid="' + steamid + '"]');
        if (card) card.remove();
        delete playersData[steamid];
      }
    });
    
    Object.entries(gsi.allplayers).forEach(([steamid, p]) => {
      console.log('Processing player:', p.name, 'team:', p.team, 'steamid:', steamid);
      const col = (p.team === 'T') ? $left : $right;
      console.log('Column assigned:', col ? 'Found' : 'NULL', 'for team', p.team);
      const active = Object.values(p.weapons || {}).find(w => w.state === 'active');
      let weaponHtml = weaponIcon(active);
      
      // --- Stats ---
      const k = p.match_stats.kills;
      const a = p.match_stats.assists;
      const d = p.match_stats.deaths;
      const hs = p.match_stats.round_killhs || p.state.round_killhs || 0;
      const totalDmg = p.state.round_totaldmg || 0;
      const rounds = gsi.map?.round || 1;
      const adr = rounds ? Math.round(totalDmg / rounds) : '—';
      const hsPct = k ? Math.round((hs / k) * 100) : 0;
      const kd = d ? (k / d).toFixed(2) : (k > 0 ? '∞' : '0');
      
      // Check if player card already exists
      let card = document.querySelector('[data-steamid="' + steamid + '"]');
      console.log('Card existence check for', p.name, '(steamid:', steamid + '):', card ? 'EXISTS' : 'NOT FOUND');
      
      if (!card) {
        // Create new card
        console.log('Creating new card for:', p.name);
        card = document.createElement('div');
        card.className = 'player-card';
        card.setAttribute('data-steamid', steamid);
        
        let cardHtml = '<div class="player-card-inner">' +
          '<div class="name">' + p.name + '<span class="money">$ ' + p.state.money + '</span></div>' +
          '<div class="stats">' +
          '<span class="adr">ADR ' + adr + '</span>' +
          '<span class="hs">HS% ' + hsPct + '</span>' +
          '<span class="kd">K/D ' + kd + '</span>' +
          '<span class="kills">K ' + k + '</span>' +
          '<span class="assists">A ' + a + '</span>' +
          '<span class="deaths">D ' + d + '</span>' +
          '<span class="mvps">MVP ' + (p.match_stats.mvps || 0) + '</span>' +
          '<span class="score">Score ' + (p.match_stats.score || 0) + '</span>' +
          '<span class="weapon">' + (weaponHtml || '') + '</span>' +
          '</div>' +
          '<div class="hp-bar"><div class="hp-fill" style="width:' + p.state.health + '%; transition: width 1s ease;"></div></div>' +
          '</div>';
          
        card.innerHTML = cardHtml;
        console.log('Appending card for', p.name, 'to', p.team, 'column');
        col.appendChild(card);
        console.log('Card appended successfully for', p.name);
        
        // Store initial data
        playersData[steamid] = {
          health: p.state.health,
          money: p.state.money,
          team: p.team,
          flashed: p.state.flashed || 0
        };
      } else {
        console.log('Updating existing card for:', p.name);
        // Update existing card
        const prevData = playersData[steamid] || {};
        
        // Update money
        const moneySpan = card.querySelector('.money');
        if (moneySpan) moneySpan.textContent = '$ ' + p.state.money;
        
        // Update stats
        const adrSpan = card.querySelector('.adr');
        if (adrSpan) adrSpan.textContent = 'ADR ' + adr;
        
        const hsSpan = card.querySelector('.hs');
        if (hsSpan) hsSpan.textContent = 'HS% ' + hsPct;
        
        const kdSpan = card.querySelector('.kd');
        if (kdSpan) kdSpan.textContent = 'K/D ' + kd;
        
        const killsSpan = card.querySelector('.kills');
        if (killsSpan) killsSpan.textContent = 'K ' + k;
        
        const assistsSpan = card.querySelector('.assists');
        if (assistsSpan) assistsSpan.textContent = 'A ' + a;
        
        const deathsSpan = card.querySelector('.deaths');
        if (deathsSpan) deathsSpan.textContent = 'D ' + d;
        
        const mvpsSpan = card.querySelector('.mvps');
        if (mvpsSpan) mvpsSpan.textContent = 'MVP ' + (p.match_stats.mvps || 0);
        
        const scoreSpan = card.querySelector('.score');
        if (scoreSpan) scoreSpan.textContent = 'Score ' + (p.match_stats.score || 0);
        
        // Update weapon
        const weaponSpan = card.querySelector('.weapon');
        if (weaponSpan) weaponSpan.innerHTML = weaponHtml || '';
        
        // Smooth HP transition - only update if health changed
        if (prevData.health !== p.state.health) {
          const hpFill = card.querySelector('.hp-fill');
          if (hpFill) {
            hpFill.style.width = p.state.health + '%';
          }
          
          // Damage effect - only if health decreased and player is alive
          if (prevData.health > p.state.health && p.state.health > 0) {
            card.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.8)';
            setTimeout(() => {
              card.style.boxShadow = '';
            }, 500);
          }
        }
        
        // Flash effect - only if flash value increased and player is alive
        if (p.state.health > 0 && p.state.flashed > 0 && 
            (!prevData.flashed || p.state.flashed > prevData.flashed)) {
          const flashStrength = Math.min(1, p.state.flashed / 255);
          card.style.background = 'rgba(255, 255, 255, ' + (flashStrength * 0.6) + ')';
          setTimeout(() => {
            card.style.background = '';
          }, 300);
        }
        
        // Move card to correct team if team changed
        if (prevData.team !== p.team) {
          const newCol = (p.team === 'T') ? $left : $right;
          newCol.appendChild(card);
        }
        
        // Update stored data
        playersData[steamid] = {
          health: p.state.health,
          money: p.state.money,
          team: p.team,
          flashed: p.state.flashed || 0
        };
      }
      
      // Update dead/alive state and low HP warning
      if (p.state?.health === 0) {
        card.className = 'player-card dead';
        // Remove any effects when dead
        card.style.background = '';
        card.style.boxShadow = '';
      } else {
        card.className = 'player-card';
        
        // Low HP warning - persistent red glow for low health
        if (p.state.health <= 30) {
          card.style.border = '2px solid rgba(255, 0, 0, 0.7)';
        } else {
          card.style.border = '';
        }
      }
    });
  }

  console.log('✅ Players module finished loading');
  return { renderPlayers };
}
