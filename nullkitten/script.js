const ACCESS_HASH = "e3ef88fc71ec1d6bd1e74c5ae3e4606d1978cb03c10b8b630446738b9e09772e";
const ACCESS_STORAGE_KEY = "nullkitten:unlocked";
const ACCESS_TUNING_MS = 1900;
const ACCESS_ACCEPTED_MS = 920;

const tracklist = [
  {
    title: "Night Feed",
    src: "/nullkitten/assets/audio/track-01.mp3",
    // Replace with the real stream URL or a local file when the first track is ready.
  },
  {
    title: "Static Prayer",
    src: "/nullkitten/assets/audio/track-02.mp3",
    // Replace with the next live stream source or a real audio file path.
  },
  {
    title: "Afterimage Choir",
    src: "/nullkitten/assets/audio/track-03.mp3",
    // Replace with the actual track file or remote stream endpoint.
  },
];

const audio = document.getElementById("player-audio");
const playToggle = document.getElementById("play-toggle");
const prevTrack = document.getElementById("prev-track");
const nextTrack = document.getElementById("next-track");
const trackName = document.getElementById("track-name");
const trackDuration = document.getElementById("track-duration");
const currentTime = document.getElementById("current-time");
const remainingTime = document.getElementById("remaining-time");
const progressFill = document.getElementById("progress-fill");
const trackCount = document.getElementById("track-count");
const playerShell = document.querySelector("[data-player-shell]");
const accessGate = document.getElementById("access-gate");
const accessForm = document.getElementById("access-form");
const accessCode = document.getElementById("access-code");
const accessSubmit = document.querySelector(".access-submit");
const accessStatus = document.getElementById("access-status");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let activeTrackIndex = 0;

function clearGateState() {
  document.body.classList.remove(
    "gate-tuning",
    "gate-ready",
    "gate-error",
    "gate-rejected",
    "gate-accepted",
  );
}

function setGateReady() {
  document.body.classList.remove("gate-tuning", "gate-error");
  document.body.classList.add("gate-ready");
  accessCode.disabled = false;
  accessSubmit.disabled = false;
  accessCode.focus();
}

function unlockSite({ skipMessage = false, immediate = false } = {}) {
  clearGateState();
  document.body.classList.remove("is-locked");
  document.body.classList.add("is-unlocked", "site-unlocked");

  if (!skipMessage) {
    accessStatus.textContent = "signal accepted";
  }

  window.setTimeout(() => {
    accessGate.setAttribute("aria-hidden", "true");
  }, immediate ? 0 : 560);
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function rejectAccess() {
  accessStatus.textContent = "signal rejected";
  document.body.classList.remove("gate-error");
  accessForm.classList.remove("is-rejected");
  void accessForm.offsetWidth;
  document.body.classList.add("gate-error", "gate-rejected");
  accessForm.classList.add("is-rejected");
  accessCode.value = "";
  accessCode.focus();

  window.setTimeout(() => {
    document.body.classList.remove("gate-error");
    accessForm.classList.remove("is-rejected");
  }, reducedMotion.matches ? 0 : 540);
}

async function handleAccessSubmit(event) {
  event.preventDefault();

  const normalizedCode = accessCode.value.trim().toLowerCase();
  const inputHash = await sha256Hex(normalizedCode);

  if (inputHash === ACCESS_HASH) {
    localStorage.setItem(ACCESS_STORAGE_KEY, "1");
    accessCode.disabled = true;
    accessSubmit.disabled = true;
    accessStatus.textContent = "signal accepted";
    document.body.classList.remove("gate-ready", "gate-error", "gate-rejected");
    document.body.classList.add("gate-accepted");

    window.setTimeout(
      () => unlockSite({ skipMessage: true, immediate: reducedMotion.matches }),
      reducedMotion.matches ? 0 : ACCESS_ACCEPTED_MS,
    );
    return;
  }

  rejectAccess();
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function updateTrackCount() {
  const current = String(activeTrackIndex + 1).padStart(2, "0");
  const total = String(tracklist.length).padStart(2, "0");
  trackCount.textContent = `${current} / ${total}`;
}

function loadTrack(index, shouldPlay = false) {
  activeTrackIndex = (index + tracklist.length) % tracklist.length;
  const track = tracklist[activeTrackIndex];

  audio.src = track.src;
  audio.load();
  trackName.textContent = track.title;
  trackDuration.textContent = "--:--";
  currentTime.textContent = "0:00";
  remainingTime.textContent = "--:--";
  progressFill.style.width = "0%";
  progressFill.parentElement.setAttribute("aria-valuenow", "0");
  playToggle.setAttribute("aria-label", `Play ${track.title}`);
  playToggle.innerHTML = "<span aria-hidden=\"true\">▶</span>";
  updateTrackCount();

  if (shouldPlay) {
    void audio.play().catch(() => {
      // Playback stays user-initiated; if the file is missing, the UI still loads cleanly.
    });
  }
}

function syncProgress() {
  const duration = audio.duration;
  const time = audio.currentTime;
  const hasDuration = Number.isFinite(duration) && duration > 0;
  const percent = hasDuration ? Math.min((time / duration) * 100, 100) : 0;

  currentTime.textContent = formatTime(time);
  trackDuration.textContent = hasDuration ? formatTime(duration) : "--:--";
  remainingTime.textContent = hasDuration ? formatTime(Math.max(duration - time, 0)) : "--:--";
  progressFill.style.width = `${percent}%`;
  progressFill.parentElement.setAttribute("aria-valuenow", String(Math.round(percent)));
}

function togglePlayback() {
  if (audio.paused) {
    void audio.play().catch(() => {});
  } else {
    audio.pause();
  }
}

playToggle.addEventListener("click", togglePlayback);
prevTrack.addEventListener("click", () => loadTrack(activeTrackIndex - 1, true));
nextTrack.addEventListener("click", () => loadTrack(activeTrackIndex + 1, true));

audio.addEventListener("play", () => {
  playToggle.setAttribute("aria-label", `Pause ${tracklist[activeTrackIndex].title}`);
  playToggle.innerHTML = "<span aria-hidden=\"true\">❚❚</span>";
});

audio.addEventListener("pause", () => {
  playToggle.setAttribute("aria-label", `Play ${tracklist[activeTrackIndex].title}`);
  playToggle.innerHTML = "<span aria-hidden=\"true\">▶</span>";
});

audio.addEventListener("timeupdate", syncProgress);
audio.addEventListener("loadedmetadata", syncProgress);
audio.addEventListener("durationchange", syncProgress);
audio.addEventListener("ended", () => loadTrack(activeTrackIndex + 1, true));

audio.addEventListener("error", () => {
  trackDuration.textContent = "offline";
  remainingTime.textContent = "--:--";
  trackName.textContent = `${tracklist[activeTrackIndex].title} - audio missing`;
  progressFill.style.width = "0%";
  progressFill.parentElement.setAttribute("aria-valuenow", "0");
});

playerShell.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

if (localStorage.getItem(ACCESS_STORAGE_KEY) === "1") {
  unlockSite({ skipMessage: true, immediate: true });
} else {
  accessForm.addEventListener("submit", handleAccessSubmit);
  accessCode.disabled = true;
  accessSubmit.disabled = true;
  window.setTimeout(setGateReady, reducedMotion.matches ? 0 : ACCESS_TUNING_MS);
}

loadTrack(0, false);
