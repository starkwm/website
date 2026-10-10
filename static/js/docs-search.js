(() => {
  const normalize = text => text.toLowerCase().replace(/\s+/g, " ").trim();
  const compact = text => text.replace(/\s+/g, " ").trim();

  function prepareIndex(pages) {
    return pages.map(page => ({
      ...page,
      titleText: normalize(page.title),
      bodyText: normalize(page.content),
      headings: page.headings.map(heading => ({ ...heading, text: normalize(heading.title) }))
    }));
  }

  function snippet(text, query, terms) {
    const display = compact(text);
    const lower = display.toLowerCase();
    let position = lower.indexOf(query);
    if (position < 0) position = terms.reduce((found, term) => {
      const next = lower.indexOf(term);
      return next < 0 ? found : Math.min(found, next);
    }, Infinity);
    const start = Number.isFinite(position) ? Math.max(0, position - 55) : 0;
    return `${start ? "…" : ""}${display.slice(start, start + 180)}${display.length > start + 180 ? "…" : ""}`;
  }

  function search(pages, value, limit = 12) {
    const query = normalize(value);
    if (!query) return [];
    const terms = [...new Set(query.split(" "))];
    const results = new Map();
    function add(result) {
      const previous = results.get(result.url);
      if (!previous || previous.score < result.score) results.set(result.url, result);
    }
    for (const page of pages) {
      const titleMatch = page.titleText === query;
      const matchingHeadings = page.headings.filter(heading => terms.every(term => heading.text.includes(term)));
      for (const heading of matchingHeadings) {
        add({
          product: page.product, title: page.title, heading: heading.title,
          url: `${page.url}#${encodeURIComponent(heading.id)}`,
          snippet: heading.title,
          score: heading.text === query ? 1000 : 500 + (heading.text.includes(query) ? 50 : 0)
        });
      }
      const fields = [page.titleText, ...page.headings.map(heading => heading.text), page.bodyText];
      if (!terms.every(term => fields.some(field => field.includes(term)))) continue;
      // Heading results already identify the most useful destinations on this page.
      if (matchingHeadings.length && !titleMatch) continue;
      add({
        product: page.product, title: page.title, url: page.url,
        snippet: snippet(page.content || page.description, query, terms),
        score: titleMatch ? 1100 :
          100 + terms.reduce((score, term) => score + (page.titleText.includes(term) ? 40 : 0) +
            (page.headings.some(heading => heading.text.includes(term)) ? 15 : 0), 0) +
          (page.bodyText.includes(query) ? 30 : 0)
      });
    }
    return [...results.values()].sort((a, b) => b.score - a.score || a.url.localeCompare(b.url)).slice(0, limit);
  }

  // The matcher also runs in Node's focused checks without a browser or a package toolchain.
  if (typeof module !== "undefined") module.exports = { prepareIndex, search };
  if (typeof document === "undefined") return;

  const trigger = document.querySelector(".docs-search-trigger");
  const dialog = document.querySelector("#docs-search");
  if (!trigger || !dialog || typeof dialog.showModal !== "function") return;
  const input = dialog.querySelector("input");
  const status = dialog.querySelector("[role=status]");
  const list = dialog.querySelector(".docs-search__results");
  let index;
  let pending;
  let timer;

  function render() {
    list.replaceChildren();
    if (!index) return;
    const query = input.value.trim();
    if (!query) {
      status.textContent = "Enter a word or command.";
      return;
    }
    const results = search(index, query);
    status.textContent = results.length ?
      `${results.length === 12 ? "Showing the first 12 results" : `${results.length} result${results.length === 1 ? "" : "s"}`}.` :
      `No results for "${query}".`;
    for (const result of results) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = result.url;
      const product = document.createElement("small");
      product.textContent = result.product;
      const title = document.createElement("strong");
      title.textContent = result.heading ? `${result.title} / ${result.heading}` : result.title;
      const summary = document.createElement("span");
      summary.textContent = result.snippet;
      link.append(product, title, summary);
      item.append(link);
      list.append(item);
    }
  }

  async function loadIndex() {
    if (index) { render(); return; }
    status.textContent = "Loading documentation…";
    try {
      if (!pending) pending = fetch(dialog.dataset.indexUrl).then(async response => {
        if (!response.ok) throw new Error("Search index unavailable");
        return prepareIndex(await response.json());
      });
      index = await pending;
      if (dialog.open) render();
    } catch {
      pending = null;
      if (dialog.open) status.textContent = "Search could not load. Close and reopen to try again, or use the documentation links.";
    }
  }

  function open() {
    dialog.showModal();
    input.focus();
    loadIndex();
  }
  trigger.addEventListener("click", open);
  dialog.querySelector(".docs-search__close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("keydown", event => {
    if (event.key === "Escape" && !event.isComposing) {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    clearTimeout(timer);
    trigger.focus();
  });
  // Native same-page fragment links do not navigate away and must dismiss the modal.
  list.addEventListener("click", event => {
    if (event.target.closest("a")) dialog.close();
  });
  input.addEventListener("input", () => {
    clearTimeout(timer);
    list.replaceChildren();
    timer = setTimeout(render, 250);
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey ||
      event.repeat || event.isComposing || event.defaultPrevented || dialog.open ||
      document.querySelector("dialog[open]")) return;
    if (event.target.closest("input, textarea, select") || event.target.isContentEditable) return;
    open();
    event.preventDefault();
  });
  trigger.hidden = false;
})();
