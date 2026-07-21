document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".menu-btn");
  const overlay = document.querySelector(".nav-overlay");
  const header = document.querySelector(".site-header");
  if (!btn || !overlay) return;

  const updateMenuContrast = () => {
    if (!header || overlay.classList.contains("open")) return;

    const rect = btn.getBoundingClientRect();
    const elements = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    const backgroundElement = elements.find((element) => !element.closest(".site-header, .nav-overlay"));
    let element = backgroundElement;

    while (element && element !== document.body) {
      const color = getComputedStyle(element).backgroundColor;
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);

      if (match && (!match[4] || Number(match[4]) > 0)) {
        const brightness = (Number(match[1]) * 299 + Number(match[2]) * 587 + Number(match[3]) * 114) / 1000;
        header.classList.toggle("on-dark", brightness < 128);
        return;
      }

      element = element.parentElement;
    }

    header.classList.remove("on-dark");
  };

  const closeMenu = () => {
    btn.classList.remove("open");
    overlay.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "メニューを開く");
    updateMenuContrast();
  };

  btn.addEventListener("click", () => {
    const isOpen = btn.classList.toggle("open");
    overlay.classList.toggle("open", isOpen);
    btn.setAttribute("aria-expanded", String(isOpen));
    btn.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    if (!isOpen) updateMenuContrast();
  });

  overlay.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("scroll", updateMenuContrast, { passive: true });
  window.addEventListener("resize", updateMenuContrast);
  updateMenuContrast();
});
