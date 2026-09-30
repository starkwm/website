(() => {
  const root = document.documentElement;
  const avatars = [...document.querySelectorAll(".project-avatar")];
  const button = document.querySelector(".avatar-motion-toggle");
  if (!avatars.length || !button) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let paused = false;

  try {
    paused = localStorage.getItem("avatar-motion") === "paused";
  } catch {
    // The pause control also works without storage.
  }

  function applyMotion() {
    const stopped = paused || reducedMotion.matches;
    root.dataset.avatarMotion = stopped ? "paused" : "running";
    button.hidden = reducedMotion.matches;
    button.textContent = stopped ? "Play animations" : "Pause animations";
    button.setAttribute("aria-pressed", String(stopped));
  }

  button.addEventListener("click", () => {
    paused = !paused;
    applyMotion();
    try {
      localStorage.setItem("avatar-motion", paused ? "paused" : "running");
    } catch {
      // Keep the preference for this page even without storage.
    }
  });
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
