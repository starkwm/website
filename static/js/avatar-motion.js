(() => {
  const root = document.documentElement;
  const avatars = [...document.querySelectorAll(".project-avatar")];
  if (!avatars.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function applyMotion() {
    root.dataset.avatarMotion = reducedMotion.matches ? "paused" : "running";
  }

  reducedMotion.addEventListener("change", applyMotion);

  const visibility = new Map(avatars.map(avatar => [avatar, true]));
  function pauseHiddenAvatars() {
    for (const avatar of avatars) {
      avatar.dataset.avatarPaused = String(document.hidden || !visibility.get(avatar));
    }
  }
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) visibility.set(entry.target, entry.isIntersecting);
      pauseHiddenAvatars();
    });
    avatars.forEach(avatar => observer.observe(avatar));
  }
  document.addEventListener("visibilitychange", pauseHiddenAvatars);
  pauseHiddenAvatars();
  applyMotion();
})();
