// ================================================================
// CINEVERSE v4 — Frontend API Client (Auto-detects local vs prod)
// ================================================================
const _isLocal   = ['localhost','127.0.0.1','0.0.0.0'].includes(location.hostname);
const _PROD_HOST = 'https://cineverse-backend-xbm3.onrender.com';
const _LOCAL_HOST= 'http://localhost:5000'; // Change if backend starts on different port
const API_BASE   = (_isLocal ? _LOCAL_HOST : _PROD_HOST) + '/api';
const IMG_BASE   = 'https://image.tmdb.org/t/p/';
const PLACEHOLDER = 'https://via.placeholder.com/342x513?text=No+Image';


// ── TOKEN ──
const getToken    = () => localStorage.getItem('cv_token');
const setToken    = t  => localStorage.setItem('cv_token', t);
const removeToken = () => localStorage.removeItem('cv_token');
const isLoggedIn  = () => !!getToken();

function authHeaders() {
  const h = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
}

// ── CORE FETCH ──
async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders(), ...options });
    const ct  = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      throw new Error(`WELCOME! PLEASE REFRESH THE PAGE AND WAIT FOR 30 SECONDS TO LOAD CONTENT`);
    }
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || `Error ${res.status}`);
      err.status = res.status;
      err.data   = data;
      throw err;
    }
    return data;
  } catch (err) {
    if (err.name === 'TypeError' || err.message.includes('fetch')) {
      throw new Error('Cannot reach backend. Make sure the server is running on port 5000.');
    }
    throw err;
  }
}

// ── AUTH ──
const register    = (n,u,e,p)  => apiFetch('/auth/register', { method:'POST', body: JSON.stringify({name:n,username:u,email:e,password:p}) });
const verifyEmail = (e,c)       => apiFetch('/auth/verify-email', { method:'POST', body: JSON.stringify({email:e,code:c}) }).then(d=>{if(d.token)setToken(d.token);return d;});
const resendCode  = e           => apiFetch('/auth/resend-code', { method:'POST', body: JSON.stringify({email:e}) });
const login       = (id,pw)     => apiFetch('/auth/login', { method:'POST', body: JSON.stringify({login:id,password:pw}) }).then(d=>{if(d.token)setToken(d.token);return d;});
const getMe       = ()          => apiFetch('/auth/me');
const onboarding  = (g,l,m)     => apiFetch('/auth/onboarding', { method:'PUT', body: JSON.stringify({favoriteGenres:g,preferredLanguages:l,moodTags:m}) });
const updateAvatar= (e,c)       => apiFetch('/auth/avatar', { method:'PUT', body: JSON.stringify({avatarEmoji:e,avatarColor:c}) });
const updateUPI   = upi         => apiFetch('/auth/upi', { method:'PUT', body: JSON.stringify({upiId:upi}) });

// ── TMDB ──
const tmdbSearch     = (q,p=1)       => apiFetch(`/tmdb/search?q=${encodeURIComponent(q)}&page=${p}`);
const tmdbTrending   = (t='movie',w='week') => apiFetch(`/tmdb/trending/${t}/${w}`);
const tmdbMovie      = id            => apiFetch(`/tmdb/movie/${id}`);
const tmdbTV         = id            => apiFetch(`/tmdb/tv/${id}`);
const tmdbPerson     = id            => apiFetch(`/tmdb/person/${id}`);
const tmdbGenres     = ()            => apiFetch('/tmdb/genres');
const tmdbDiscover   = (g,l,s,p=1,extra='') => apiFetch(`/tmdb/discover?page=${p}${g?'&genre='+g:''}${l?'&lang='+l:''}${s?'&sort='+s:''}${extra}`);
const tmdbNowPlaying = (p=1)         => apiFetch(`/tmdb/now-playing?page=${p}`);
const tmdbTopRated   = (p=1)         => apiFetch(`/tmdb/top-rated?page=${p}`);
const tmdbUpcoming   = ()            => apiFetch('/tmdb/upcoming');
const tmdbPopular    = (p=1)         => apiFetch(`/tmdb/popular?page=${p}`);
const tmdbPopularTV  = (p=1)         => apiFetch(`/tmdb/popular-tv?page=${p}`);
const tmdbTopTV      = ()            => apiFetch('/tmdb/top-rated-tv');
const tmdbAiringToday= ()            => apiFetch('/tmdb/airing-today');
const whereToWatch   = (type,id)     => apiFetch(`/tmdb/where-to-watch/${type}/${id}`);

// ── USER ACTIVITY ──
const toggleWatchlist = (id,t,p)     => apiFetch(`/user/watchlist/${id}`, { method:'POST', body: JSON.stringify({title:t,posterPath:p}) });
const markWatched     = (id,t,p)     => apiFetch(`/user/watched/${id}`,   { method:'POST', body: JSON.stringify({title:t,posterPath:p}) });
const toggleFavorite  = (id,t,p)     => apiFetch(`/user/favorites/${id}`, { method:'POST', body: JSON.stringify({title:t,posterPath:p}) });
const getRecommendations = ()        => apiFetch('/user/recommendations');

// ── REVIEWS ──
const getMovieReviews = id           => apiFetch(`/reviews/movie/${id}`);
const postReview      = (id,r,t,mt,mp) => apiFetch(`/reviews/movie/${id}`, { method:'POST', body: JSON.stringify({rating:r,text:t,movieTitle:mt,posterPath:mp}) });
const likeReview      = id           => apiFetch(`/reviews/${id}/like`, { method:'POST' });
const deleteReview    = id           => apiFetch(`/reviews/${id}`, { method:'DELETE' });
const getRecentReviews= (p=1)        => apiFetch(`/reviews/feed/recent?page=${p}`);

// ── FORUM ──
const getForumPosts   = (mid,p=1)    => apiFetch(`/forum/movie/${mid}?page=${p}`);
const getForumPost    = pid          => apiFetch(`/forum/${pid}`);
const createPost      = (mid,d)      => apiFetch(`/forum/movie/${mid}`, { method:'POST', body: JSON.stringify(d) });
const replyToPost     = (pid,body)   => apiFetch(`/forum/${pid}/reply`, { method:'POST', body: JSON.stringify({body}) });
const likePost        = pid          => apiFetch(`/forum/${pid}/like`, { method:'POST' });
const deletePost      = pid          => apiFetch(`/forum/${pid}`, { method:'DELETE' });
const getRecentPosts  = ()           => apiFetch('/forum/recent');

// ── LEADERBOARD ──
const getLeaderboard  = month        => apiFetch(`/leaderboard/monthly${month?'?month='+month:''}`);
const getMyRank       = ()           => apiFetch('/leaderboard/my-rank');
const getLBHistory    = ()           => apiFetch('/leaderboard/history');

// ── IMAGE HELPERS ──
const posterUrl    = (p,s='w342')    => p ? IMG_BASE+s+p : PLACEHOLDER;
const backdropUrl  = p               => p ? IMG_BASE+'w1280'+p : '';
const profileUrl   = (p,s='w185')    => p ? IMG_BASE+s+p : PLACEHOLDER;
const formatDate   = d               => d ? new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : 'N/A';
const formatRuntime= m               => !m ? 'N/A' : m>=60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`;
const getYear      = d               => d ? new Date(d).getFullYear() : '';
const formatMoney  = n               => !n||n===0 ? 'N/A' : n>=1e9 ? `$${(n/1e9).toFixed(2)}B` : n>=1e6 ? `$${(n/1e6).toFixed(1)}M` : `$${n.toLocaleString()}`;

// ── USER CACHE ──
let _user = null;
async function getCurrentUser(force = false) {
  if (_user && !force) return _user;
  if (!getToken()) return null;
  try { const d = await getMe(); _user = d.user; return _user; } catch { return null; }
}
function clearUserCache() { _user = null; }
function logout() { removeToken(); clearUserCache(); window.location.href = 'index.html'; }

// ── BACKEND HEALTH ──
async function checkBackend() {
  try {
    const r = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) });
    if (!r.ok) return false;
    const d = await r.json();
    return d.success === true;
  } catch { return false; }
}

// ── TOAST ──
function showToast(msg, type = 'info', dur = 3500) {
  document.querySelector('.cv-toast')?.remove();
  const c = { info:'var(--accent-cyan)', success:'#00e676', error:'var(--accent-pink)', xp:'var(--accent-gold)', warning:'#ff9800' };
  const col = c[type] || c.info;
  const t = document.createElement('div');
  t.className = 'cv-toast';
  t.style.cssText = `position:fixed;bottom:2rem;right:2rem;padding:.875rem 1.5rem;background:var(--bg-card);border:1px solid ${col};border-radius:12px;color:var(--text-primary);font-family:var(--font-ui);font-size:.9rem;z-index:99999;box-shadow:0 0 20px ${col}44;animation:slideIn .3s ease;max-width:340px;word-break:break-word;line-height:1.4;`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),300); }, dur);
}

// ── AVATAR CONSTANTS ──
const AVATARS = ['🎬','🎭','🎥','🍿','🎞️','👾','🦊','🐺','🦋','🔥','⚡','🌌','🤖','👽','🦸','🕵️','🧙','🦹','🎪','🌙'];
const AVATAR_COLORS = [
  'linear-gradient(135deg,#00e5ff,#7b2fff)',
  'linear-gradient(135deg,#ff2d78,#ffd700)',
  'linear-gradient(135deg,#7b2fff,#ff2d78)',
  'linear-gradient(135deg,#00e5ff,#ff2d78)',
  'linear-gradient(135deg,#ffd700,#ff2d78)',
  'linear-gradient(135deg,#7b2fff,#00e5ff)',
  'linear-gradient(135deg,#00e676,#00e5ff)',
  'linear-gradient(135deg,#ff9800,#ff2d78)',
];

function updateNavAvatar(user) {
  const el = document.getElementById('navAvatar');
  if (!el || !user) return;
  el.textContent  = user.avatarEmoji || '🎬';
  el.style.background = AVATAR_COLORS[user.avatarColor || 0];
}

// ── EXPORT ──
window.CV = {
  isLoggedIn, logout, getCurrentUser, clearUserCache,
  register, verifyEmail, resendCode, login, getMe, onboarding, updateAvatar, updateUPI,
  tmdbSearch, tmdbTrending, tmdbMovie, tmdbTV, tmdbPerson, tmdbGenres, tmdbDiscover,
  tmdbNowPlaying, tmdbTopRated, tmdbUpcoming, tmdbPopular, tmdbPopularTV, tmdbTopTV, tmdbAiringToday,
  whereToWatch,
  toggleWatchlist, markWatched, toggleFavorite, getRecommendations,
  getMovieReviews, postReview, likeReview, deleteReview, getRecentReviews,
  getForumPosts, getForumPost, createPost, replyToPost, likePost, deletePost, getRecentPosts,
  getLeaderboard, getMyRank, getLBHistory,
  posterUrl, backdropUrl, profileUrl, formatDate, formatRuntime, getYear, formatMoney,
  showToast, AVATARS, AVATAR_COLORS, updateNavAvatar, checkBackend,
  PLACEHOLDER, API_BASE
};