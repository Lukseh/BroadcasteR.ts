/*
 * Navigation Module
 * Handles top navigation bar creation and broadcast switching
 */

export function initNavigation(INST, ALL, BASE_PATH) {
  const nav = document.createElement('nav');
  document.body.prepend(nav);

  const logo = Object.assign(new Image(), {
    src: '/assets/android-chrome-512x512.png',
    alt: 'Logo',
    style: 'height:40px;margin-right:15px'
  });
  nav.appendChild(logo);
  
  // Add link to main page in page name
  const mainLink = document.createElement('a');
  mainLink.href = '/';
  mainLink.textContent = INST.page_name || INST.page_title || INST.id;
  mainLink.className = 'main-title-link';
  mainLink.style.marginRight = '10px';
  nav.appendChild(mainLink);

  const sel = document.createElement('select');
  sel.style.cssText = 'margin-left:2vw;padding:6px 10px;background:#444;color:#fff;border:none;border-radius:4px';
  sel.appendChild(new Option('Switch broadcast', '', true, true));
  ALL.forEach(o => {
    const value = BASE_PATH + o.base;
    sel.appendChild(new Option(o.name, value, false, o.base === INST.url));
  });
  sel.onchange = e => location.href = e.target.value;
  nav.appendChild(sel);
  
  console.log('✅ Navigation module finished loading');
}
