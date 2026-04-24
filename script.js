const header = document.querySelector("[data-site-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const primaryNav = document.querySelector("[data-primary-nav]");
const yearTarget = document.querySelector("[data-year]");
const canvas = document.querySelector("#hero-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

function setHeaderState() {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function setNavOpen(isOpen) {
  if (!header || !navToggle) {
    return;
  }

  document.body.classList.toggle("nav-open", isOpen);
  header.classList.toggle("nav-is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (navToggle && primaryNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    setNavOpen(!isOpen);
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setNavOpen(false);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavOpen(false);
    }
  });
}

if (canvas instanceof HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  const palette = ["#65eff6", "#2fa9bc", "#9da2a6", "#ecedee"];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let points = [];
  let frame = 0;
  let animationId;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);

    if (context) {
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    createPoints();
  }

  function createPoints() {
    const spacing = width < 700 ? 86 : 112;
    const columns = Math.ceil(width / spacing) + 2;
    const rows = Math.ceil(height / spacing) + 2;
    points = [];

    for (let row = -1; row < rows; row += 1) {
      for (let column = -1; column < columns; column += 1) {
        const seed = row * 97 + column * 53;
        points.push({
          x: column * spacing + ((seed * 17) % 31),
          y: row * spacing + ((seed * 23) % 37),
          phase: seed,
          color: palette[Math.abs(seed) % palette.length],
        });
      }
    }
  }

  function draw() {
    if (!context) {
      return;
    }

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#000000";
    context.fillRect(0, 0, width, height);

    const time = frame * 0.006;
    const activePoints = points.map((point) => {
      const driftX = Math.sin(time + point.phase) * 12;
      const driftY = Math.cos(time * 0.8 + point.phase) * 10;
      return {
        ...point,
        x: point.x + driftX,
        y: point.y + driftY,
      };
    });

    context.lineWidth = 1;

    for (let index = 0; index < activePoints.length; index += 1) {
      const point = activePoints[index];

      for (let nextIndex = index + 1; nextIndex < activePoints.length; nextIndex += 1) {
        const nextPoint = activePoints[nextIndex];
        const distance = Math.hypot(point.x - nextPoint.x, point.y - nextPoint.y);

        if (distance < 138) {
          const alpha = Math.max(0, 1 - distance / 138) * 0.2;
          context.strokeStyle = `rgba(101, 239, 246, ${alpha})`;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(nextPoint.x, nextPoint.y);
          context.stroke();
        }
      }
    }

    for (const point of activePoints) {
      context.fillStyle = point.color;
      context.globalAlpha = 0.72;
      context.beginPath();
      context.arc(point.x, point.y, 3.2, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;
    }

    frame += 1;

    if (!reducedMotion.matches) {
      animationId = window.requestAnimationFrame(draw);
    }
  }

  resizeCanvas();
  draw();

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(animationId);
    resizeCanvas();
    draw();
  });

  reducedMotion.addEventListener("change", () => {
    window.cancelAnimationFrame(animationId);
    draw();
  });
}
