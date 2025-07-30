/*
 * Broadcast Main Module
 * Coordinates all broadcast page functionality
 */

console.log('📦 Loading broadcast modules...');

import { initNavigation } from './nav.js';
console.log('📦 Navigation module imported');

import { initTwitchIframes } from './twitch.js';
console.log('📦 Twitch module imported');

import { initPlayerRenderer } from './players.js';
console.log('📦 Players module imported');

import { initScoreRenderer } from './score.js';
console.log('📦 Score module imported');

import { initPolling } from './polling.js';
console.log('📦 Polling module imported');

console.log('✅ All modules imported successfully');

// Initialize broadcast page
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Broadcast page DOMContentLoaded - starting initialization');
  
  // Initialize navigation
  console.log('📍 Initializing navigation...');
  initNavigation(window.INST, window.ALL, window.BASE_PATH);
  
  // Initialize Twitch iframes
  console.log('📍 Initializing Twitch iframes...');
  initTwitchIframes(window.INST);
  
  // Initialize player renderer
  console.log('📍 Initializing player renderer...');
  const { renderPlayers } = initPlayerRenderer();
  
  // Initialize score renderer
  console.log('📍 Initializing score renderer...');
  const { renderScore } = initScoreRenderer();
  
  // Start polling
  console.log('📍 Initializing polling...');
  initPolling(window.INST, renderPlayers, renderScore);
  
  console.log('✅ Broadcast page initialization complete');
});
