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

})();
