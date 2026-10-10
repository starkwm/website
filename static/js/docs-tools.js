(() => {
  document.querySelectorAll(".prose pre > code").forEach((code, index) => {
    const pre = code.parentElement;
    const wrapper = document.createElement("div");
    wrapper.className = "code-block";
    const toolbar = document.createElement("div");
    toolbar.className = "code-block__toolbar";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy";
    button.textContent = "Copy";
    button.setAttribute("aria-label", `Copy code block ${index + 1}`);
    const status = document.createElement("span");
    status.className = "code-copy-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    toolbar.append(status, button);
    pre.before(wrapper);
    wrapper.append(toolbar, pre);
    let reset;
    button.addEventListener("click", async () => {
      clearTimeout(reset);
      status.textContent = "";
      button.disabled = true;
      try {
        // Hugo's line-number decorations, if enabled later, are not example text.
        let text = code.textContent;
        if (code.querySelector(".ln, .lnt, [data-line-number]")) {
          const example = code.cloneNode(true);
          example.querySelectorAll(".ln, .lnt, [data-line-number]").forEach(line => line.remove());
          text = example.textContent;
        }
        await navigator.clipboard.writeText(text);
        status.textContent = "Copied";
        reset = setTimeout(() => { status.textContent = ""; }, 3000);
      } catch {
        status.textContent = "Copy failed. Select the code to copy it.";
      } finally {
        button.disabled = false;
      }
    });
  });

  const prose = document.querySelector(".docs-content .prose");
  if (!prose) return;
  const headings = [...document.querySelectorAll('.page-toc #TableOfContents a[href^="#"]')]
    .map(link => {
      let id;
      try { id = decodeURIComponent(link.hash.slice(1)); } catch { return null; }
      const heading = document.getElementById(id);
      return heading && prose.contains(heading) ? { link, heading } : null;
    }).filter(Boolean)
    .sort((a, b) => a.heading.compareDocumentPosition(b.heading) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
  let current;
  let queued = false;
  let navigationTarget = targetForHash(window.location.hash);
  let navigationPosition;

  function targetForHash(hash) {
    try {
      const id = decodeURIComponent(hash.slice(1));
      return headings.find(item => item.heading.id === id);
    } catch {
      return undefined;
    }
  }

  function navigate(hash) {
    navigationTarget = targetForHash(hash);
    navigationPosition = undefined;
    schedule();
  }

  function resumeReading() {
    navigationTarget = undefined;
    navigationPosition = undefined;
    schedule();
  }

  function update() {
    queued = false;
    let active;
    const readingLine = 80;
    for (const item of headings) {
      if (item.heading.getBoundingClientRect().top <= readingLine) active = item;
    }
    const atBottom = window.scrollY > 0 &&
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (atBottom) active = headings.at(-1);
    if (navigationTarget) {
      // A short page may reach its bottom before the requested heading reaches the reading line.
      // Keep that heading selected through native scrolling, then resume tracking when reading moves.
      if (navigationPosition !== undefined && Math.abs(window.scrollY - navigationPosition) > 2) {
        navigationTarget = undefined;
        navigationPosition = undefined;
      } else {
        const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        const destination = Math.max(0, Math.min(
          document.documentElement.scrollHeight - window.innerHeight,
          window.scrollY + navigationTarget.heading.getBoundingClientRect().top - padding
        ));
        if (Math.abs(window.scrollY - destination) <= 2) navigationPosition = window.scrollY;
        active = navigationTarget;
      }
    }
    if (current === active) return;
    current?.link.removeAttribute("aria-current");
    active?.link.setAttribute("aria-current", "location");
    current = active;
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("hashchange", () => navigate(window.location.hash));
  // Clicking the current hash again does not fire hashchange. Search results can use full page URLs.
  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const link = event.target.closest("a[href]");
    if (link && link.origin === window.location.origin && link.pathname === window.location.pathname &&
      link.search === window.location.search && link.hash && link.target !== "_blank" && !link.hasAttribute("download")) {
      navigate(link.hash);
    }
  });
  window.addEventListener("wheel", resumeReading, { passive: true });
  window.addEventListener("touchmove", resumeReading, { passive: true });
  window.addEventListener("keydown", event => {
    if (event.defaultPrevented || event.isComposing || event.target.isContentEditable ||
      event.target.closest("input, textarea, select, button, dialog[open]")) return;
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) resumeReading();
  });
  window.addEventListener("load", schedule);
  document.fonts?.ready.then(schedule);
  schedule();
})();
