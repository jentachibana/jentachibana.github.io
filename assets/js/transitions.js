(() => {
  // Entry fade-in for browsers without View Transitions API
  if (!document.startViewTransition) {
    document.body.classList.add("transition-fade-in");
    document.body.addEventListener(
      "animationend",
      () => document.body.classList.remove("transition-fade-in"),
      { once: true }
    );
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) return;

    e.preventDefault();

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.href = link.href;
      });
    } else {
      // Fallback: fade out then navigate
      document.body.classList.add("transition-fade-out");
      setTimeout(() => { window.location.href = link.href; }, 400);
    }
  });
})();
