const ACCESS_HASH = "e3ef88fc71ec1d6bd1e74c5ae3e4606d1978cb03c10b8b630446738b9e09772e";
const ACCESS_STORAGE_KEY = "nullkitten:unlocked";
const ACCESS_TUNING_MS = 1900;
const ACCESS_ACCEPTED_MS = 920;
const TRACK_COUNTER_URL = "./track-counter.php";
const PLAY_COUNT_THRESHOLD_SECONDS = 10;

const tracklist = [
  {
    id: "boot-sequence",
    title: "B00T::SEQ//",
    artist: "Null.Kitten",
    album: "MEATSPACE//INIT",
    track: 1,
    duration: "3:21",
    src: "assets/audio/album-01/Boot Sequence.mp3",
  },
  {
    id: "memory-loss",
    title: "MEMØRY_LØ$$",
    artist: "Null.Kitten",
    album: "MEATSPACE//INIT",
    track: 2,
    duration: "6:59",
    src: "assets/audio/album-01/Memory Loss.mp3",
  },
  {
    id: "body-horror",
    title: "B0DY_H0RRØR.exe",
    artist: "Null.Kitten",
    album: "MEATSPACE//INIT",
    track: 3,
    duration: "2:48",
    src: "assets/audio/album-01/Body Horror.mp3",
  },
  {
    id: "into-analog",
    title: ">into_analog_",
    artist: "Null.Kitten",
    album: "MEATSPACE//INIT",
    track: 4,
    duration: "3:45",
    src: "assets/audio/album-01/Into Analog.mp3",
  },
  {
    id: "hoomans",
    title: "H00M4N$.tmp",
    artist: "Null.Kitten",
    album: "MEATSPACE//INIT",
    track: 5,
    duration: "3:12",
    src: "assets/audio/album-01/Hoomans.mp3",
  },
  {
    id: "consume",
    title: "C0N$UME.dll",
    artist: "Null.Kitten",
    album: "MEATSPACE//INIT",
    track: 6,
    duration: "3:03",
    src: "assets/audio/album-01/Consume.mp3",
  },
  {
    id: "patch-notes",
    title: "PATCH_NOTES.md",
    artist: "Null.Kitten",
    album: "MEATSPACE//INIT",
    track: 7,
    duration: "3:26",
    src: "assets/audio/album-01/Patch Notes.mp3",
  },
  {
    id: "contraband-pulse",
    title: "CØNTRABAND_PUL$E",
    artist: "Null.Kitten",
    album: "MEATSPACE//INIT",
    track: 8,
    duration: "3:00",
    src: "assets/audio/album-01/Contraband Pulse.mp3",
  },
  {
    id: "kult",
    title: "KµLT//ERR",
    artist: "Null.Kitten",
    album: "MEATSPACE//INIT",
    track: 9,
    duration: "3:07",
    src: "assets/audio/album-01/Kult.mp3",
  },
];

const audio = document.getElementById("player-audio");
const playToggle = document.getElementById("play-toggle");
const prevTrack = document.getElementById("prev-track");
const nextTrack = document.getElementById("next-track");
const stopTrack = document.getElementById("stop-track");
const trackName = document.getElementById("track-name");
const trackAlbum = document.getElementById("track-album");
const trackDuration = document.getElementById("track-duration");
const currentTime = document.getElementById("current-time");
const remainingTime = document.getElementById("remaining-time");
const progressFill = document.getElementById("progress-fill");
const progressRange = document.getElementById("progress-range");
const trackCount = document.getElementById("track-count");
const playerShell = document.querySelector("[data-player-shell]");
const playlist = document.getElementById("playlist");
const accessGate = document.getElementById("access-gate");
const accessForm = document.getElementById("access-form");
const accessCode = document.getElementById("access-code");
const accessSubmit = document.querySelector(".access-submit");
const accessStatus = document.getElementById("access-status");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let activeTrackIndex = 0;
let isSeeking = false;
let playCountsLoaded = false;
let playCountsLoading = false;
let playCountsAttempted = false;
let playCounts = Object.create(null);
let listenSeconds = 0;
let lastPlaybackSample = 0;
let playCountRecorded = false;
let activeCountTrackId = null;

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

  maybeLoadPlayCounts();
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

function normalizePlayCounts(rawCounts) {
  const normalized = Object.create(null);

  tracklist.forEach((track) => {
    const value = rawCounts && Number(rawCounts[track.id]);
    normalized[track.id] = Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  });

  return normalized;
}

function formatPlayCount(count) {
  return `${count} play${count === 1 ? "" : "s"}`;
}

function applyPlayCounts() {
  playlist.querySelectorAll(".playlist-track").forEach((button, index) => {
    const countEl = button.querySelector(".playlist-count");

    if (!countEl) return;

    if (!playCountsLoaded) {
      countEl.hidden = true;
      countEl.textContent = "";
      return;
    }

    const track = tracklist[index];
    const count = playCounts[track.id] ?? 0;
    countEl.textContent = formatPlayCount(count);
    countEl.hidden = false;
  });
}

async function loadPlayCounts() {
  if (playCountsLoading || playCountsLoaded || playCountsAttempted) {
    return;
  }

  playCountsLoading = true;
  playCountsAttempted = true;

  try {
    const response = await fetch(TRACK_COUNTER_URL, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    playCounts = normalizePlayCounts(data && data.counts);
    playCountsLoaded = true;
    applyPlayCounts();
  } catch {
    // Quiet fallback: play counts remain hidden if PHP is unavailable.
  } finally {
    playCountsLoading = false;
  }
}

function maybeLoadPlayCounts() {
  if (!document.body.classList.contains("is-unlocked") || !playlist.childElementCount) {
    return;
  }

  void loadPlayCounts();
}

function resetPlayCountState(trackId = tracklist[activeTrackIndex]?.id || null, sampleTime = 0) {
  activeCountTrackId = trackId;
  listenSeconds = 0;
  playCountRecorded = false;
  lastPlaybackSample = Number.isFinite(sampleTime) ? sampleTime : 0;
}

function submitPlayCount(trackId) {
  if (!trackId) return;

  fetch(TRACK_COUNTER_URL, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ trackId }),
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (!data || !data.counts) return;
      playCounts = normalizePlayCounts(data.counts);
      playCountsLoaded = true;
      applyPlayCounts();
    })
    .catch(() => {
      // Counting must never interrupt playback.
    });
}

function updatePlayCountProgress() {
  if (!activeCountTrackId || playCountRecorded || audio.paused || audio.seeking) {
    lastPlaybackSample = Number.isFinite(audio.currentTime) ? audio.currentTime : lastPlaybackSample;
    return;
  }

  const currentSample = audio.currentTime;
  if (!Number.isFinite(currentSample)) return;

  const delta = currentSample - lastPlaybackSample;
  lastPlaybackSample = currentSample;

  if (delta <= 0) {
    return;
  }

  listenSeconds += delta;

  if (listenSeconds >= PLAY_COUNT_THRESHOLD_SECONDS && !playCountRecorded) {
    playCountRecorded = true;
    submitPlayCount(activeCountTrackId);
  }
}

function renderPlaylist() {
  playlist.innerHTML = "";

  tracklist.forEach((track, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    const trackNumber = document.createElement("span");
    const meta = document.createElement("span");
    const title = document.createElement("span");
    const right = document.createElement("span");
    const duration = document.createElement("span");
    const count = document.createElement("span");

    button.className = "playlist-track";
    button.type = "button";
    button.dataset.trackIndex = String(index);
    button.setAttribute("aria-label", `Play ${track.title}`);
    button.dataset.trackId = track.id;

    trackNumber.className = "playlist-number";
    trackNumber.textContent = String(track.track || index + 1).padStart(2, "0");

    meta.className = "playlist-meta";
    title.className = "playlist-title";
    title.textContent = track.title;

    right.className = "playlist-right";
    duration.className = "playlist-duration";
    duration.textContent = track.duration || "--:--";

    count.className = "playlist-count";
    count.hidden = true;

    right.append(duration, count);
    meta.append(title);
    button.append(trackNumber, meta, right);
    item.append(button);
    playlist.append(item);
  });

  applyPlayCounts();
}

function updatePlaylistState() {
  playlist.querySelectorAll(".playlist-track").forEach((button, index) => {
    const isActive = index === activeTrackIndex;
    button.classList.toggle("is-active", isActive);
    button.toggleAttribute("aria-current", isActive);
  });
}

function setPlaybackButton(isPlaying) {
  const track = tracklist[activeTrackIndex];
  playToggle.setAttribute("aria-label", `${isPlaying ? "Pause" : "Play"} ${track.title}`);
  playToggle.innerHTML = isPlaying
    ? "<span aria-hidden=\"true\">▌▌</span>"
    : "<span aria-hidden=\"true\">▶</span>";
  playerShell.classList.toggle("is-playing", isPlaying);
  updatePlaylistState();
}

function loadTrack(index, shouldPlay = false) {
  activeTrackIndex = (index + tracklist.length) % tracklist.length;
  const track = tracklist[activeTrackIndex];

  isSeeking = false;
  resetPlayCountState(track.id);
  audio.src = track.src;
  audio.load();
  trackName.textContent = track.title;
  trackAlbum.textContent = track.album || "MEATSPACE//INIT";
  trackDuration.textContent = track.duration || "--:--";
  currentTime.textContent = "0:00";
  remainingTime.textContent = "--:--";
  progressFill.style.width = "0%";
  progressRange.value = "0";
  progressFill.parentElement.setAttribute("aria-valuenow", "0");
  progressRange.setAttribute("aria-valuenow", "0");
  setPlaybackButton(false);
  updateTrackCount();
  updatePlaylistState();
  maybeLoadPlayCounts();

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
  progressRange.setAttribute("aria-valuenow", String(Math.round(percent)));

  if (!isSeeking) {
    progressRange.value = String(percent);
  }
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
stopTrack.addEventListener("click", () => {
  audio.pause();
  audio.currentTime = 0;
  isSeeking = false;
  resetPlayCountState();
  syncProgress();
});

progressRange.addEventListener("input", () => {
  isSeeking = true;
  progressFill.style.width = `${progressRange.value}%`;
});

progressRange.addEventListener("change", () => {
  const duration = audio.duration;
  if (Number.isFinite(duration) && duration > 0) {
    audio.currentTime = (Number(progressRange.value) / 100) * duration;
  }
  isSeeking = false;
  lastPlaybackSample = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  syncProgress();
});

playlist.addEventListener("click", (event) => {
  const button = event.target.closest(".playlist-track");
  if (!button) return;
  loadTrack(Number(button.dataset.trackIndex), true);
});

audio.addEventListener("play", () => {
  setPlaybackButton(true);
  lastPlaybackSample = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
});

audio.addEventListener("pause", () => {
  setPlaybackButton(false);
  lastPlaybackSample = Number.isFinite(audio.currentTime) ? audio.currentTime : lastPlaybackSample;
});

audio.addEventListener("playing", () => {
  lastPlaybackSample = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
});

audio.addEventListener("timeupdate", () => {
  syncProgress();
  updatePlayCountProgress();
});

audio.addEventListener("loadedmetadata", () => {
  lastPlaybackSample = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  syncProgress();
});

audio.addEventListener("durationchange", syncProgress);
audio.addEventListener("seeking", () => {
  isSeeking = true;
  lastPlaybackSample = Number.isFinite(audio.currentTime) ? audio.currentTime : lastPlaybackSample;
});

audio.addEventListener("seeked", () => {
  isSeeking = false;
  lastPlaybackSample = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  syncProgress();
});

audio.addEventListener("ended", () => loadTrack(activeTrackIndex + 1, true));

audio.addEventListener("error", () => {
  trackDuration.textContent = "offline";
  remainingTime.textContent = "--:--";
  trackName.textContent = `${tracklist[activeTrackIndex].title} - audio missing`;
  progressFill.style.width = "0%";
  progressRange.value = "0";
  progressFill.parentElement.setAttribute("aria-valuenow", "0");
  progressRange.setAttribute("aria-valuenow", "0");
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

renderPlaylist();
loadTrack(0, false);
maybeLoadPlayCounts();
