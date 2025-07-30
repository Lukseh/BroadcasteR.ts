/*
 * BroadcasteR.ts - HTML Rendering Module
 * Handles generation of broadcast pages and main dashboard
 */

import { Instance } from './types.js';

export function renderBroadcastPage(instance: Instance, allInstances: Instance[]): string {
  const assets = '/assets';
  const BASE_PATH = process.env.BASE_PATH || '/broadcast';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${instance.page_title}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="icon" href="${assets}/favicon.ico">
  <link rel="stylesheet" href="${assets}/style.css">
  <link href="https://fonts.googleapis.com/css2?family=Microsoft+YaHei:wght@400;500;700&display=swap" rel="stylesheet">
  <script>
    // Global configuration variables
    window.INST      = ${JSON.stringify(instance)};
    window.ALL       = ${JSON.stringify(allInstances.map(i => ({ name: i.id, base: i.url })))};
    window.BASE_PATH = "${BASE_PATH}";
  </script>
  <script type="module" src="${assets}/scripts/broadcast/broadcast.js"></script>
</head>

<body>
  <div class="container">
    <div class="main">
      <iframe id="twitch-player" allowfullscreen></iframe>
      <div class="overlay-block" style="position:relative;">
        <div class="bomb-bg"></div>
        <div class="scoreboard">
          <div id="team1"></div>
          <div id="score">Loading data...</div>
          <div id="team2"></div>
        </div>
        <div class="players" id="players"></div>
      </div>
    </div>
    <iframe class="chat" id="twitch-chat"></iframe>
  </div>
</body>
</html>`;
}

export function renderMainDashboard(instances: Instance[]): string {
  const assets = '/assets';
  const BASE_PATH = process.env.BASE_PATH || '/broadcast';
  const mainTitle = process.env.PAGE_TITLE || 'BroadcasteR.ts Dashboard';
  
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${mainTitle}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="icon" href="${assets}/favicon.ico">
  <link rel="stylesheet" href="${assets}/style.css">
  <link href="https://fonts.googleapis.com/css2?family=Microsoft+YaHei:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body style="background:#181a20;min-height:100vh;">
  <nav style="display:flex;align-items:center;padding:1em 2vw;background:#23272e;">
    <img src="${assets}/android-chrome-512x512.png" alt="Logo" style="height:40px;margin-right:15px">
    <a href="/" class="main-title-link">${mainTitle}</a>
  </nav>
  <div class="instance-cards">
    ${instances.map(inst => {
      const ttv = inst.twitch_channel || '';
      // Use Twitch's public preview endpoint with cache buster, fallback to local icon
      const preview = ttv
        ? `https://static-cdn.jtvnw.net/previews-ttv/live_user_${ttv}.jpg?width=380&height=214&cb=${Math.floor(Date.now() / 60000)}`
        : `${assets}/android-chrome-192x192.png`;
      const broadcastUrl = BASE_PATH + inst.url;
      // Show instance id as title
      const subtitle = inst.page_name || '';
      return `
        <div class="instance-card" data-id="${inst.id}">
          <img class="ttv-preview" src="${preview}" alt="Twitch Preview" loading="lazy" onerror="this.onerror=null;this.src='${assets}/android-chrome-192x192.png'">
          <div class="info">
            <a href="${broadcastUrl}" class="instance-title-link" style="font-size:1.3em;font-weight:700;margin-bottom:0.2em;letter-spacing:0.5px;">${inst.id}</a>
            <div style="font-size:1.1em;font-weight:400;margin-bottom:0.7em;opacity:0.8;">${subtitle}</div>
            <div class="scoreboard" style="display:flex;align-items:center;justify-content:center;gap:1.5em;">
              <span id="team1-${inst.id}" style="color:var(--team-t);font-weight:600;min-width:60px;text-align:right;">T</span>
              <span id="score-${inst.id}" class="score-anim" style="color:#00b894;min-width:60px;text-align:center;">- : -</span>
              <span id="team2-${inst.id}" style="color:var(--team-ct);font-weight:600;min-width:60px;text-align:left;">CT</span>
            </div>
            <a class="watch-btn" href="${broadcastUrl}" style="width:80%;text-align:center;">Watch</a>
          </div>
        </div>
      `;
    }).join('')}
  </div>
  <script>
    // Simple WebSocket updates for each instance
    ${instances.map(inst => `
      (() => {
        const ws = new WebSocket((location.protocol==='https:'?'wss':'ws')+'://'+location.host+'/ws${inst.url}');
        ws.onmessage = e => {
          try {
            const data = JSON.parse(e.data);
            if (data.map) {
              const tName = data.map.team_t?.name || 'T';
              const ctName = data.map.team_ct?.name || 'CT';
              const score = (data.map.team_t?.score||0)+' : '+(data.map.team_ct?.score||0);
              
              // Update team names and scores
              document.getElementById('team1-${inst.id}').textContent = tName;
              document.getElementById('team2-${inst.id}').textContent = ctName;
              document.getElementById('score-${inst.id}').textContent = score;
            }
          } catch {}
        };
      })();
    `).join('')}
  </script>
</body>
</html>`;
}
