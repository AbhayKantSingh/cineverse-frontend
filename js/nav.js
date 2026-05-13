// ================================================================
// CINEVERSE v4 — Shared Navigation Logic
// Include this on every page AFTER api.js
// Call: initNav() in DOMContentLoaded
// ================================================================
async function initNav() {
  if (!CV.isLoggedIn()) {
    // Ensure LOGIN/JOIN button is visible
    const area = document.getElementById('navAuthArea');
    if (area && !area.querySelector('.btn-login-nav')) {
      area.innerHTML = `<button class="btn-login-nav" onclick="window.location.href='index.html'">LOGIN / JOIN</button>`;
    }
    // Hide profile link
    const pl = document.getElementById('navProfileLink');
    if (pl) pl.style.display = 'none';
    return null;
  }

  // Logged in: fetch user and update nav
  try {
    const user = await CV.getCurrentUser();
    if (!user) { CV.logout(); return null; }

    // Replace LOGIN button with avatar
    const area = document.getElementById('navAuthArea');
    if (area) {
      area.innerHTML = `<a href="profile.html"><div class="nav-avatar" id="navAvatar" style="background:${CV.AVATAR_COLORS[user.avatarColor||0]}" title="${user.name}">${user.avatarEmoji||'🎬'}</div></a>`;
    }

    // Show profile link
    const pl = document.getElementById('navProfileLink');
    if (pl) pl.style.display = 'block';

    // Highlight active nav link
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href') || '';
      a.classList.toggle('active', href === path || (path === '' && href === 'index.html'));
    });

    return user;
  } catch(err) {
    console.warn('[Nav] Could not load user:', err.message);
    return null;
  }
}
