(() => {
  const root = document.documentElement;
  const avatars = [...document.querySelectorAll(".project-avatar, .brand-avatar")];
  if (!avatars.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const brandAnimators = new Map(
    avatars.filter(avatar => avatar.matches(".brand-avatar"))
      .map(avatar => [avatar, createBrandAnimator(avatar)])
  );

  function applyMotion() {
    root.dataset.avatarMotion = reducedMotion.matches ? "paused" : "running";
    pauseHiddenAvatars();
  }

  reducedMotion.addEventListener("change", applyMotion);

  const visibility = new Map(avatars.map(avatar => [avatar, true]));
  function pauseHiddenAvatars() {
    for (const avatar of avatars) {
      const paused = document.hidden || !visibility.get(avatar);
      avatar.dataset.avatarPaused = String(paused);
      brandAnimators.get(avatar)?.setRunning(!paused && !reducedMotion.matches);
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
  applyMotion();

  function createBrandAnimator(avatar) {
    const motion = avatar.querySelector("[data-brand-motion]");
    const body = avatar.querySelector("[data-brand-body]");
    const gaze = avatar.querySelector("[data-brand-gaze]");
    const eyes = [...avatar.querySelectorAll("[data-brand-eye]")];
    if (!motion || !body || !gaze || !eyes.length) return null;

    const initialBody = body.getAttribute("d");
    let frameID = null;
    let previousTimestamp = null;
    let elapsed = 0;
    let nextGlance = 1.3 + Math.random() * 1.8;
    let glance;

    function smooth(value) {
      const bounded = Math.max(0, Math.min(1, value));
      return bounded * bounded * (3 - 2 * bounded);
    }

    function drawGaze(time) {
      if (!glance && time >= nextGlance) {
        glance = {
          start: time,
          offset: (Math.random() < 0.5 ? -1 : 1) * (3.5 + Math.random() * 2.4),
          outward: 0.25 + Math.random() * 0.2,
          hold: 0.7 + Math.random() * 0.8,
          inward: 0.35 + Math.random() * 0.2
        };
      }

      let offset = 0;
      if (glance) {
        const age = time - glance.start;
        const returnStart = glance.outward + glance.hold;
        const end = returnStart + glance.inward;
        if (age < glance.outward) {
          offset = glance.offset * smooth(age / glance.outward);
        } else if (age < returnStart) {
          offset = glance.offset;
        } else if (age < end) {
          offset = glance.offset * (1 - smooth((age - returnStart) / glance.inward));
        } else {
          glance = undefined;
          nextGlance = time + 2.2 + Math.random() * 3.8;
        }
      }
      gaze.setAttribute("transform", "translate(" + offset.toFixed(3) + " 0)");
    }

    function draw(time) {
      const phase = 2 * Math.PI * time / 6.4;
      const breath = Math.sin(phase);
      const sway = Math.sin(phase + 0.65) - Math.sin(0.65);
      const crown = 1.6 * breath;
      const shoulder = 1.1 * Math.sin(phase - 0.4);
      motion.setAttribute("transform",
        "translate(128 207) rotate(" + (0.7 * sway).toFixed(3) + ") scale(" +
        (1 + 0.013 * breath).toFixed(4) + " " +
        (1 - 0.018 * breath).toFixed(4) + ") translate(-128 -207)");
      body.setAttribute("d",
        "M97 " + (49.5 - crown) +
        "C114 " + (49.5 - crown) + " 124 " + (62 - crown * 0.4) + " 137 73" +
        "C149 83.5 159 83.5 179 " + (90 + shoulder) +
        "C207 " + (99 + shoulder) + " 226 118 227.5 146" +
        "C229 180 208 198 177 203C154 207.5 74 209 51 199" +
        "C31 191 23 171 31 151C37 136 50 127 58 113" +
        "C71 94 66 " + (66 - crown * 0.4) + " 83 " + (54 - crown) +
        "C87 " + (51 - crown) + " 91 " + (49.5 - crown) + " 97 " + (49.5 - crown) + "Z");
      const cycle = time % 10.6;
      const blink = Math.max(
        Math.max(0, 1 - Math.abs(cycle - 1.7) / 0.14),
        Math.max(0, 1 - Math.abs(cycle - 7.5) / 0.14)
      );
      eyes.forEach(eye => eye.setAttribute("ry", String(14.9 * (1 - 0.91 * smooth(blink)))));
      drawGaze(time);
    }

    function frame(timestamp) {
      if (previousTimestamp !== null) {
        elapsed += Math.min((timestamp - previousTimestamp) / 1000, 0.08);
      }
      previousTimestamp = timestamp;
      draw(elapsed);
      frameID = requestAnimationFrame(frame);
    }

    function reset() {
      elapsed = 0;
      glance = undefined;
      nextGlance = 1.3 + Math.random() * 1.8;
      motion.removeAttribute("transform");
      body.setAttribute("d", initialBody);
      gaze.removeAttribute("transform");
      eyes.forEach(eye => eye.setAttribute("ry", "14.9"));
    }

    return {
      setRunning(running) {
        if (running) {
          if (frameID === null) frameID = requestAnimationFrame(frame);
        } else {
          if (frameID !== null) cancelAnimationFrame(frameID);
          frameID = null;
          previousTimestamp = null;
          if (reducedMotion.matches) reset();
        }
      }
    };
  }
})();
