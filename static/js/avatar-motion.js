(() => {
  const sources = document.querySelectorAll(".brand-avatar source, .project-avatar source");
  const visible = new Set(sources);
  const motion = "(prefers-reduced-motion: no-preference)";

  function update(source) {
    source.media = !document.hidden && visible.has(source) ? motion : "not all";
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const source = entry.target.querySelector("source");
        if (entry.isIntersecting) visible.add(source);
        else visible.delete(source);
        update(source);
      }
    });
    sources.forEach(source => observer.observe(source.parentElement));
  }
  document.addEventListener("visibilitychange", () => sources.forEach(update));
  sources.forEach(update);
})();
