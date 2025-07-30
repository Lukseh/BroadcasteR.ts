/*
 * Twitch Integration Module
 * Handles Twitch player and chat iframe setup
 */

export function initTwitchIframes(INST) {
  const parent = location.hostname;
  const channel = INST.twitch_channel;

  const player = document.getElementById('twitch-player');
  player.src = 'https://player.twitch.tv/?channel=' + channel + '&parent=' + parent + '&autoplay=true';

  const chat = document.getElementById('twitch-chat');
  chat.src = 'https://www.twitch.tv/embed/' + channel + '/chat?parent=' + parent + '&darkpopout';
  
  console.log('✅ Twitch module finished loading');
}
