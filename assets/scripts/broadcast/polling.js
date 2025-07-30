/*
 * Polling Module
 * Handles GSI data fetching and rendering coordination
 */

export function initPolling(INST, renderPlayers, renderScore) {
  async function poll() {
    try {
      const r = await fetch('/gsi' + INST.url);
      if (r.ok) {
        const data = await r.json();
        renderPlayers(data);
        renderScore(data);
      }
    } catch (e) { 
      console.error(e); 
    }
    setTimeout(poll, INST.delay_ms || 1000);
  }
  
  // Start polling
  console.log('✅ Polling module finished loading - starting poll');
  poll();
}
