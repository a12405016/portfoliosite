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



(function () {
  var loading = document.getElementById('loading');
  if (!loading) return;

  // ---- 同一タブでは1回だけ再生する ----
  var STORAGE_KEY = 'ns_loading_shown';
  var alreadyShown = false;
  try {
    alreadyShown = sessionStorage.getItem(STORAGE_KEY) === '1';
    if (!alreadyShown) sessionStorage.setItem(STORAGE_KEY, '1');
  } catch (e) {
    // sessionStorageが使えない環境ではフォールバックとして毎回再生
    alreadyShown = false;
  }
  if (alreadyShown) {
    loading.style.display = 'none';
    document.body.classList.remove('is-loading');
    return;
  }

  var progress = loading.querySelector('.ring-progress');
  var dot = loading.querySelector('.ring-dot');
  var percentEl = loading.querySelector('.loading-percent');
  var icon = loading.querySelector('.loading-icon');

  var CX = 120, CY = 120, R = 100;
  var CIRC = 2 * Math.PI * R;
  progress.style.strokeDasharray = CIRC;
  progress.style.strokeDashoffset = CIRC;

  var DURATION = 2000; // ここが「2秒で完了」の部分
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function finish() {
    // ① 少し間を置いてアイコンが右下から勢いよく登場、中心を通り過ぎてバウンドしながら収まる
    setTimeout(function () {
      icon.classList.add('enter');
      // ② アイコンが収まってからリング全体をディゾルブして本文へ
      setTimeout(function () {
        loading.classList.add('dissolve');
        document.body.classList.remove('is-loading');
        setTimeout(function () {
          loading.style.display = 'none';
          loading.dispatchEvent(new CustomEvent('loading:complete', { bubbles: true }));
        }, 900);
      }, 850);
    }, 150);
  }

  if (reduce) {
    progress.style.strokeDashoffset = 0;
    percentEl.textContent = '100%';
    finish();
    return;
  }

  var start = null;
  function step(ts) {
    if (!start) start = ts;
    var elapsed = ts - start;
    var t = Math.min(elapsed / DURATION, 1);
    var eased = easeInOutCubic(t);

    progress.style.strokeDashoffset = CIRC * (1 - eased);
    percentEl.textContent = Math.round(eased * 100) + '%';

    var angle = -Math.PI / 2 + eased * Math.PI * 2;
    dot.setAttribute('cx', CX + R * Math.cos(angle));
    dot.setAttribute('cy', CY + R * Math.sin(angle));

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      finish();
    }
  }
  requestAnimationFrame(step);
})();