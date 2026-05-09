// Redirect to dashboard if already logged in
window.addEventListener('DOMContentLoaded', () => {
  const auth = localStorage.getItem('studyplanner_auth');
  if (auth) {
    // Show "Go to Dashboard" button in nav if logged in
    const navBtns = document.querySelector('.nav-btns');
    if (navBtns) {
      navBtns.innerHTML = `
        <button class="btn-outline" onclick="location.href='dashboard.html'">My Dashboard</button>
        <button class="btn-primary" onclick="openLogoutModal()">Logout</button>`;
    }
  }
});


(function(){
  const KEY = 'sp_public_dark';
  function applyPublicDark(){
    const on = localStorage.getItem(KEY)==='1';
    document.documentElement.setAttribute('data-theme', on ? 'dark' : 'light-public');
    const btn = document.getElementById('publicDarkBtn');
    if(btn) btn.textContent = on ? '☀️' : '🌙';
  }
  window.togglePublicDark = function(){
    const on = localStorage.getItem(KEY)==='1';
    localStorage.setItem(KEY, on ? '0' : '1');
    applyPublicDark();
  };
  // Run immediately
  applyPublicDark();
  document.addEventListener('DOMContentLoaded', applyPublicDark);
})();


function openVideo() {
  const modal = document.getElementById('videoModal');
  const video = document.getElementById('demoVideo');

  modal.style.display = 'flex';
  video.currentTime = 0;
  video.play();
}

function closeVideo() {
  const modal = document.getElementById('videoModal');
  const video = document.getElementById('demoVideo');

  modal.style.display = 'none';
  video.pause();
}

