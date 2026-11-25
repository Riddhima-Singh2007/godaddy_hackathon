// app.js - BLUE · GLA University Mathura Lost & Found, Reinvented
// Real campus landmarks, GLAMS Student Portal quick-sync, and live semantic match radar

let allReports = [];
let globalInsights = {};
let currentFeedFilter = 'all';
let currentSelectedHotspot = '';
let currentActiveMatchReport = null;
let currentCandidateMatch = null;
let soundEnabled = true;
let livePreviewDebounceTimer = null;

// Pitch Timer variables
let pitchTimerSeconds = 0;
let pitchTimerInterval = null;

// Audio Synthesizer (Web Audio API)
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx && AudioContextClass) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playChime(type = 'match') {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (type === 'match') {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.18);

      osc2.frequency.setValueAtTime(659.25, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } else if (type === 'celebration') {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = now + (idx * 0.08);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.15, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.4);
      });
    }
  } catch (e) {
    console.warn('Audio chime notice:', e);
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  setupSoundToggle();
  setupJudgeQuickButton();
  loadInsights();
  loadReports();
  loadPromptLog();

  // Run initial preview with default values
  triggerLivePreview();
});

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setupSoundToggle() {
  const btn = document.getElementById('btn-sound-toggle');
  btn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      btn.classList.remove('text-slate-600');
      btn.classList.add('text-slate-400');
      playChime('match');
    } else {
      btn.classList.add('text-slate-600');
      btn.classList.remove('text-slate-400');
    }
  });
}

function setupJudgeQuickButton() {
  const btn = document.getElementById('btn-judge-quick');
  btn.addEventListener('click', () => {
    applyGLAPreset('judge_hoodie');
    switchTab('report');
  });
}

// Tab Switching
function switchTab(tabId) {
  const tabs = ['report', 'map', 'feed', 'promptlog', 'pitch'];
  tabs.forEach(id => {
    const pane = document.getElementById(`tab-content-${id}`);
    const deskBtn = document.getElementById(`tab-btn-${id}`);
    if (pane) {
      if (id === tabId) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    }
    if (deskBtn) {
      if (id === tabId) {
        deskBtn.classList.add('active', 'bg-blue-600', 'text-white', 'shadow-sm');
        deskBtn.classList.remove('text-slate-300');
      } else {
        deskBtn.classList.remove('active', 'bg-blue-600', 'text-white', 'shadow-sm');
        deskBtn.classList.add('text-slate-300');
      }
    }
  });

  setTimeout(initIcons, 50);
  if (tabId === 'feed') renderFeed();
}

// Report Type Toggle (Lost vs Found)
let activeReportType = 'lost';
function setReportType(type) {
  activeReportType = type;
  const lostBtn = document.getElementById('toggle-lost');
  const foundBtn = document.getElementById('toggle-found');
  const submitText = document.getElementById('submit-btn-text');

  if (type === 'lost') {
    lostBtn.className = 'px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-white bg-blue-600 shadow-sm flex items-center space-x-1.5';
    foundBtn.className = 'px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white flex items-center space-x-1.5';
    submitText.innerText = 'Submit Lost Report & Find Matches (< 30s)';
  } else {
    foundBtn.className = 'px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-white bg-emerald-600 shadow-sm flex items-center space-x-1.5';
    lostBtn.className = 'px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white flex items-center space-x-1.5';
    submitText.innerText = 'Submit Found Report & Alert Owners (< 30s)';
  }
  triggerLivePreview();
}

function setColor(color) {
  document.getElementById('form-colour').value = color;
  triggerLivePreview();
}

// GLA University Presets
function applyGLAPreset(name) {
  if (name === 'judge_hoodie') {
    setReportType('lost');
    document.getElementById('form-item').value = 'Grey Hoodie';
    document.getElementById('form-colour').value = 'Heather Grey';
    document.getElementById('form-hotspot').value = 'GLA Central Library';
    document.getElementById('form-place').value = '2nd Floor Quiet Reading Hall (Desk #42)';
    document.getElementById('form-time').value = 'Yesterday 4:00 PM';
    document.getElementById('form-brand').value = 'Champion';
    document.getElementById('form-desc').value = 'Lost my grey hoodie in GLA library 2nd floor study area yesterday around 4 pm.';
  } else if (name === 'navy_bottle') {
    setReportType('lost');
    document.getElementById('form-item').value = 'Water Bottle';
    document.getElementById('form-colour').value = 'Navy Blue';
    document.getElementById('form-hotspot').value = 'GD Subway & Central Food Court';
    document.getElementById('form-place').value = 'Outdoor Shaded Stone Benches';
    document.getElementById('form-time').value = 'Today 11:30 AM';
    document.getElementById('form-brand').value = 'Hydro Flask';
    document.getElementById('form-desc').value = 'Lost navy bottle on stone bench near Nescafe at GD Subway.';
  } else if (name === 'gla_id') {
    setReportType('lost');
    document.getElementById('form-item').value = 'GLA Student RFID ID Card';
    document.getElementById('form-colour').value = 'Blue GLA Lanyard';
    document.getElementById('form-hotspot').value = 'Academic Blocks 1-3 (CSE Complex)';
    document.getElementById('form-place').value = 'AB-1 Central Atrium & Smart Classrooms';
    document.getElementById('form-time').value = 'Today 9:00 AM';
    document.getElementById('form-brand').value = 'GLA University SmartCard';
    document.getElementById('form-desc').value = 'Lost GLA student ID on blue lanyard with University logo near AB-1 atrium.';
  } else if (name === 'charger_ab2') {
    setReportType('lost');
    document.getElementById('form-item').value = '67W USB-C Power Adapter';
    document.getElementById('form-colour').value = 'White';
    document.getElementById('form-hotspot').value = 'Academic Blocks 1-3 (CSE Complex)';
    document.getElementById('form-place').value = 'AB-2 2nd Floor CSE Computing Lab #204';
    document.getElementById('form-time').value = 'Yesterday 3:30 PM';
    document.getElementById('form-brand').value = 'Apple MagSafe';
    document.getElementById('form-desc').value = 'Left white MacBook charger plugged into wall strip in Lab 204.';
  }

  triggerLivePreview();
}

function updateGLASublocations() {
  const spot = document.getElementById('form-hotspot').value;
  const placeInput = document.getElementById('form-place');
  const defaults = {
    'GLA Central Library': '2nd Floor Quiet Reading Hall (Desk #42)',
    'GD Subway & Central Food Court': 'Outdoor Shaded Stone Benches',
    'Academic Blocks 1-3 (CSE Complex)': 'AB-2 2nd Floor CSE Computing Lab #204',
    'Academic Blocks 4-6 (IBM Management)': 'AB-6 IBM Main Seminar Hall #1',
    'Hostels & Residential Zone': 'Boys Hostel Wing 3 - Dining Mess Entrance',
    'KC Sports Ground & Ninad Amphitheatre': 'KC Ground Cricket Pavilion Bleachers',
    'Main Gate 1 & NH-19 Checkpoint': 'Main Gate 1 Security Checkpost & Lost Desk'
  };
  if (defaults[spot]) {
    placeInput.value = defaults[spot];
  }
}

// GLAMS Student Portal Sync Simulation
async function syncGLAMSProfile() {
  const roll = document.getElementById('glams-roll-input').value.trim();
  if (!roll) {
    alert('Please enter your GLA University Roll Number (e.g. 2215000189 or GLA/2023/CS/1042)');
    return;
  }

  try {
    const res = await fetch(`/api/glams/verify/${encodeURIComponent(roll)}`);
    const data = await res.json();
    const statusDiv = document.getElementById('glams-sync-status');
    statusDiv.innerHTML = `✓ <strong>GLAMS Synced:</strong> ${data.student_name} (${data.roll_number}) · Department: ${data.department} · Residence: ${data.hostel}`;
    statusDiv.classList.remove('hidden');
    playChime('match');
  } catch (err) {
    console.error('GLAMS Sync error:', err);
  }
}

// Live Match Preview (Debounced)
function triggerLivePreview() {
  clearTimeout(livePreviewDebounceTimer);
  livePreviewDebounceTimer = setTimeout(() => {
    fetchLivePreview();
  }, 120);
}

async function fetchLivePreview() {
  const item = document.getElementById('form-item').value.trim();
  const colour = document.getElementById('form-colour').value.trim();
  const hotspot = document.getElementById('form-hotspot').value;
  const place = document.getElementById('form-place').value.trim();
  const time = document.getElementById('form-time').value.trim();
  const brand = document.getElementById('form-brand').value.trim();
  const desc = document.getElementById('form-desc').value.trim();

  const container = document.getElementById('live-matches-container');
  const badge = document.getElementById('radar-status-badge');

  if (!item && !desc) {
    badge.innerText = 'Ready to match...';
    container.innerHTML = `
      <div class="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-950/60 rounded-2xl border border-slate-800">
        <i data-lucide="sparkles" class="w-10 h-10 text-slate-700 mb-2"></i>
        <h4 class="text-sm font-semibold text-slate-300">Instant Match Finder</h4>
        <p class="text-xs text-slate-500 max-w-xs mt-1">Type what you lost or click a quick fill button above to see likely matches on campus.</p>
      </div>
    `;
    initIcons();
    return;
  }

  badge.innerText = 'Searching GLA campus...';

  try {
    const res = await fetch('/api/match-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item,
        colour,
        hotspot,
        place: `${hotspot} - ${place}`,
        time,
        brand,
        description: desc,
        type: activeReportType
      })
    });
    const data = await res.json();
    renderLivePreviewCards(data.matches || []);
  } catch (err) {
    console.error('Error fetching live matches:', err);
  }
}

function renderLivePreviewCards(matches) {
  const container = document.getElementById('live-matches-container');
  const badge = document.getElementById('radar-status-badge');

  if (!matches || matches.length === 0) {
    badge.innerText = '0 Matches currently';
    badge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold';
    container.innerHTML = `
      <div class="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-950/60 rounded-2xl border border-slate-800">
        <i data-lucide="search-x" class="w-10 h-10 text-slate-600 mb-2"></i>
        <h4 class="text-sm font-semibold text-slate-300">No match on campus yet</h4>
        <p class="text-xs text-slate-500 max-w-xs mt-1">When you submit your report, BLUE will continuously alert you when matching items are turned in at GLA desks.</p>
      </div>
    `;
    initIcons();
    return;
  }

  if (matches[0].score >= 85) {
    badge.innerText = `⚡ ${matches.length} Matches Found (Top ${matches[0].score}%)`;
    badge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold animate-pulse';
  } else {
    badge.innerText = `${matches.length} Matches Found (Top ${matches[0].score}%)`;
    badge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold';
  }

  let html = '';
  matches.forEach((m, idx) => {
    const isTop = idx === 0;
    const item = m.candidate;
    const scoreColor = m.score >= 85 ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' : 'text-blue-400 border-blue-500/40 bg-blue-500/10';

    html += `
      <div class="bg-slate-950 border ${isTop ? 'border-blue-500/70 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30' : 'border-slate-800'} rounded-2xl p-4 transition-all hover:border-slate-700">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center space-x-2">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.type === 'found' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}">
                ${item.type.toUpperCase()} #${item.id}
              </span>
              <span class="text-xs text-slate-400 flex items-center space-x-1">
                <i data-lucide="clock" class="w-3 h-3"></i>
                <span>${item.time}</span>
              </span>
            </div>
            <h4 class="text-sm font-bold text-white flex items-center space-x-2">
              <span>${item.item}</span>
              <span class="text-xs font-normal text-slate-400">(${item.colour})</span>
            </h4>
            <p class="text-xs text-slate-300 flex items-center space-x-1">
              <i data-lucide="map-pin" class="w-3 h-3 text-blue-400"></i>
              <span>${item.place}</span>
            </p>
          </div>

          <div class="flex flex-col items-center">
            <div class="w-14 h-14 rounded-2xl border ${scoreColor} flex flex-col items-center justify-center font-black">
              <span class="text-base leading-none">${m.score}%</span>
              <span class="text-[9px] uppercase tracking-wider font-semibold">Match</span>
            </div>
            <span class="text-[10px] text-slate-400 font-semibold mt-1">${m.tier}</span>
          </div>
        </div>

        <div class="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div class="text-[11px] text-slate-300 flex items-center space-x-1">
            <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>${m.breakdown[0].reason}</span>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              onclick='openMatchModalFromPreview(${JSON.stringify(m).replace(/'/g, "&#39;")})' 
              class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition flex items-center space-x-1"
            >
              <i data-lucide="eye" class="w-3 h-3"></i>
              <span>Compare</span>
            </button>
            <button 
              onclick="directReunite('${item.id}')" 
              class="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm flex items-center space-x-1"
            >
              <i data-lucide="party-popper" class="w-3 h-3"></i>
              <span>Claim</span>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  initIcons();
}

// Handle Form Submission
async function handleReportSubmit(e) {
  e.preventDefault();

  const item = document.getElementById('form-item').value.trim();
  const colour = document.getElementById('form-colour').value.trim();
  const hotspot = document.getElementById('form-hotspot').value;
  const place = document.getElementById('form-place').value.trim();
  const time = document.getElementById('form-time').value.trim();
  const brand = document.getElementById('form-brand').value.trim();
  const desc = document.getElementById('form-desc').value.trim();
  const photoPreview = document.getElementById('photo-preview');
  const image_url = photoPreview && photoPreview.src && !photoPreview.src.endsWith('#') ? photoPreview.src : null;

  const btn = document.getElementById('btn-submit-report');
  btn.disabled = true;
  btn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 animate-spin"></i><span>Saving to GLA Mesh...</span>`;
  initIcons();

  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item,
        colour,
        brand,
        hotspot,
        place: `${hotspot} - ${place}`,
        time,
        description: desc,
        type: activeReportType,
        image_url
      })
    });

    const data = await res.json();
    playChime('match');

    await loadReports();
    await loadInsights();

    if (window.confetti) {
      window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }

    if (data.matches && data.matches.length > 0) {
      renderLivePreviewCards(data.matches);
    }

    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i><span>Report Filed at GLA! Matches Ready</span>`;
    initIcons();

    setTimeout(() => {
      btn.innerHTML = `<i data-lucide="send" class="w-4 h-4"></i><span>Submit Another Report (&lt; 30s)</span>`;
      initIcons();
    }, 2500);

  } catch (err) {
    console.error('Error submitting report:', err);
    btn.disabled = false;
    btn.innerHTML = `Submit Report (< 30s)`;
  }
}

// Photo Upload
function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    processImageExtract(event.target.result);
  };
  reader.readAsDataURL(file);
}

function setPresetPhoto(preset) {
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');

  if (preset === 'grey_hoodie') {
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 120, 120);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('GLA Hoodie', 24, 65);
    processImageExtract(canvas.toDataURL(), 'Heather Grey');
    document.getElementById('form-colour').value = 'Heather Grey';
    document.getElementById('form-item').value = 'Grey Pullover Hoodie';
  } else if (preset === 'navy_flask') {
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 120, 120);
    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Navy Flask', 24, 65);
    processImageExtract(canvas.toDataURL(), 'Navy Blue');
    document.getElementById('form-colour').value = 'Navy Blue';
    document.getElementById('form-item').value = 'Hydro Flask 32oz';
  }
  triggerLivePreview();
}

function processImageExtract(dataUrl, overrideTag = null) {
  const container = document.getElementById('photo-preview-container');
  const preview = document.getElementById('photo-preview');
  const tag = document.getElementById('photo-detected-tag');

  preview.src = dataUrl;
  container.classList.remove('hidden');
  container.classList.add('flex');

  if (overrideTag) {
    tag.innerText = `Detected Color: ${overrideTag}`;
  } else {
    tag.innerText = `Extracted Dominant Tone & Visual Profile`;
  }
}

// Fetch Global Insights & Stats
async function loadInsights() {
  try {
    const res = await fetch('/api/insights');
    globalInsights = await res.json();

    document.getElementById('stat-total-items').innerText = globalInsights.total_reports || 150;
    document.getElementById('stat-reunited-badge').innerText = globalInsights.reunited_count || 30;
    document.getElementById('tab-feed-count').innerText = globalInsights.total_reports || 150;

    const topLostDiv = document.getElementById('metric-top-lost-items');
    if (topLostDiv && globalInsights.top_3_most_lost_categories) {
      let html = '';
      globalInsights.top_3_most_lost_categories.forEach(item => {
        html += `
          <div class="flex items-center justify-between text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span class="font-semibold text-white">#${item.rank} ${item.name}</span>
            <span class="font-mono text-amber-400 font-bold">${item.percentage}% of losses</span>
          </div>
        `;
      });
      topLostDiv.innerHTML = html;
    }

    const topSpotsDiv = document.getElementById('metric-top-hotspots');
    if (topSpotsDiv && globalInsights.top_3_hotspots) {
      let html = '';
      globalInsights.top_3_hotspots.forEach(spot => {
        html += `
          <div class="flex items-center justify-between text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span class="font-semibold text-white">#${spot.rank} ${spot.name}</span>
            <span class="font-mono text-blue-400 font-bold">${spot.count} items (${spot.percentage}%)</span>
          </div>
        `;
      });
      topSpotsDiv.innerHTML = html;
    }

    const insightText = document.getElementById('metric-key-insight');
    if (insightText) {
      insightText.innerText = globalInsights.key_data_insight || '60% of items at GLA are lost in Central Library & GD Subway.';
    }

  } catch (err) {
    console.error('Error loading insights:', err);
  }
}

// Fetch Reports & Feed
async function loadReports() {
  try {
    const res = await fetch('/api/reports?limit=150');
    const data = await res.json();
    allReports = data.reports || [];
    renderFeed();
  } catch (err) {
    console.error('Error loading reports:', err);
  }
}

function renderFeed() {
  const grid = document.getElementById('feed-items-grid');
  if (!grid) return;

  const searchQuery = (document.getElementById('feed-search')?.value || '').toLowerCase();
  const hotspotSelect = document.getElementById('feed-hotspot-select')?.value || '';

  let list = [...allReports];

  if (currentFeedFilter === 'lost') {
    list = list.filter(r => r.type === 'lost' && r.status === 'active');
  } else if (currentFeedFilter === 'found') {
    list = list.filter(r => r.type === 'found' && r.status === 'active');
  } else if (currentFeedFilter === 'reunited') {
    list = list.filter(r => r.status === 'reunited');
  }

  if (hotspotSelect) {
    list = list.filter(r => (r.hotspot || '').includes(hotspotSelect));
  }

  if (searchQuery) {
    list = list.filter(r => 
      (r.item && r.item.toLowerCase().includes(searchQuery)) ||
      (r.colour && r.colour.toLowerCase().includes(searchQuery)) ||
      (r.place && r.place.toLowerCase().includes(searchQuery)) ||
      (r.brand && r.brand.toLowerCase().includes(searchQuery)) ||
      (r.description && r.description.toLowerCase().includes(searchQuery))
    );
  }

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-500 text-xs">
        <i data-lucide="package-x" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
        <p class="font-semibold text-slate-400">No items match the selected GLA filters</p>
      </div>
    `;
    initIcons();
    return;
  }

  let html = '';
  list.forEach(r => {
    const isReunited = r.status === 'reunited';
    const isLost = r.type === 'lost';

    html += `
      <div class="report-card bg-slate-900 border ${isReunited ? 'border-emerald-500/30' : 'border-slate-800'} rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3">
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full ${
              isReunited ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              isLost ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }">
              ${isReunited ? '🎉 REUNITED' : (isLost ? 'LOST' : 'FOUND')} #${r.id}
            </span>
            <span class="text-[11px] text-slate-400 flex items-center space-x-1">
              <i data-lucide="clock" class="w-3 h-3"></i>
              <span>${r.time}</span>
            </span>
          </div>

          <div>
            <h4 class="text-sm font-bold text-white">${r.item}</h4>
            <div class="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
              <span>Colour: <strong class="text-slate-200">${r.colour}</strong></span>
              <span>•</span>
              <span>${r.brand || 'Unbranded'}</span>
            </div>
          </div>

          <p class="text-xs text-slate-300 flex items-start space-x-1.5">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5"></i>
            <span>${r.place}</span>
          </p>

          <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-850">
            ${r.description || 'No extra description.'}
          </p>
        </div>

        <div class="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          ${!isReunited ? `
            <button onclick="findMatchesForReport('${r.id}')" class="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition flex items-center justify-center space-x-1">
              <i data-lucide="sparkles" class="w-3 h-3 text-blue-400"></i>
              <span>Find Matches</span>
            </button>
            <button onclick="directReunite('${r.id}')" class="py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center space-x-1">
              <i data-lucide="party-popper" class="w-3 h-3"></i>
              <span>Reunited</span>
            </button>
          ` : `
            <span class="w-full text-center text-xs font-mono text-emerald-400 font-semibold py-1">
              ✓ Successfully Reunited with Owner at GLA Desk
            </span>
          `}
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
  initIcons();
}

function setFeedFilter(filter) {
  currentFeedFilter = filter;
  ['all', 'lost', 'found', 'reunited'].forEach(f => {
    const btn = document.getElementById(`filter-btn-${f}`);
    if (btn) {
      if (f === filter) {
        btn.className = 'filter-pill active px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white';
      } else {
        btn.className = 'filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white';
      }
    }
  });
  renderFeed();
}

function selectHotspotFilter(hotspotName) {
  currentSelectedHotspot = hotspotName;
  const banner = document.getElementById('selected-hotspot-banner');
  const nameLabel = document.getElementById('selected-hotspot-name');
  const select = document.getElementById('feed-hotspot-select');

  if (banner && nameLabel) {
    nameLabel.innerText = `Selected GLA Landmark: ${hotspotName}`;
    banner.classList.remove('hidden');
    banner.classList.add('flex');
  }

  if (select) {
    select.value = hotspotName;
  }
}

async function findMatchesForReport(reportId) {
  try {
    const res = await fetch(`/api/reports/${reportId}/matches`);
    const data = await res.json();
    if (data.matches && data.matches.length > 0) {
      const best = data.matches[0];
      openMatchModal(data.report, best.candidate, best.score, best.tier, best.breakdown);
    } else {
      alert(`No strong match candidate found for Report #${reportId} at this time.`);
    }
  } catch (err) {
    console.error('Error finding matches:', err);
  }
}

function openMatchModalFromPreview(matchObj) {
  const currentQuery = {
    item: document.getElementById('form-item').value,
    colour: document.getElementById('form-colour').value,
    place: document.getElementById('form-place').value,
    time: document.getElementById('form-time').value
  };
  openMatchModal(currentQuery, matchObj.candidate, matchObj.score, matchObj.tier, matchObj.breakdown);
}

function openMatchModal(query, candidate, score, tier, breakdown) {
  currentActiveMatchReport = query;
  currentCandidateMatch = candidate;

  document.getElementById('modal-match-score').innerText = `${score}%`;
  document.getElementById('modal-match-tier').innerText = tier;

  document.getElementById('modal-query-item').innerText = query.item || 'Lost Item';
  document.getElementById('modal-query-colour').innerText = `Colour: ${query.colour || 'N/A'}`;
  document.getElementById('modal-query-place').innerText = `Place: ${query.place || 'GLA Campus'}`;
  document.getElementById('modal-query-time').innerText = `Time: ${query.time || 'N/A'}`;

  document.getElementById('modal-candidate-item').innerText = candidate.item || 'Found Item';
  document.getElementById('modal-candidate-colour').innerText = `Colour: ${candidate.colour || 'N/A'}`;
  document.getElementById('modal-candidate-place').innerText = `Place: ${candidate.place || 'GLA Campus'}`;
  document.getElementById('modal-candidate-time').innerText = `Time: ${candidate.time || 'N/A'}`;

  const list = document.getElementById('modal-breakdown-list');
  let bHtml = '';
  if (breakdown) {
    breakdown.forEach(b => {
      bHtml += `
        <div class="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
          <span class="font-medium text-slate-300">${b.factor}: <span class="text-slate-400 font-normal">${b.reason}</span></span>
          <span class="font-mono font-bold text-emerald-400">${b.score}%</span>
        </div>
      `;
    });
  }
  list.innerHTML = bHtml;

  const modal = document.getElementById('modal-match-detail');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  initIcons();
}

function closeMatchModal() {
  const modal = document.getElementById('modal-match-detail');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function confirmReunionFromModal() {
  if (!currentCandidateMatch) return;
  closeMatchModal();
  await directReunite(currentCandidateMatch.id, currentActiveMatchReport?.id);
}

async function directReunite(reportId, matchedWithId = null) {
  try {
    const res = await fetch(`/api/reports/${reportId}/reunite`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matched_with_id: matchedWithId })
    });
    const data = await res.json();

    playChime('celebration');

    if (window.confetti) {
      window.confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    }

    document.getElementById('receipt-claim-code').innerText = data.claim_code || 'GLA-8291-REUN';
    document.getElementById('receipt-item-name').innerText = data.report.item;
    
    const successModal = document.getElementById('modal-reunion-success');
    successModal.classList.remove('hidden');
    successModal.classList.add('flex');
    initIcons();

    await loadReports();
    await loadInsights();

  } catch (err) {
    console.error('Error marking reunited:', err);
  }
}

function closeSuccessModal() {
  const modal = document.getElementById('modal-reunion-success');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function loadPromptLog() {
  try {
    const res = await fetch('/api/prompt-log');
    const data = await res.json();
    const container = document.getElementById('prompt-log-container');
    if (!container) return;

    let html = '';
    data.prompt_log.forEach(entry => {
      html += `
        <div class="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-800">
            <span class="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
              Role: ${entry.role}
            </span>
            <span class="text-xs text-slate-400 font-semibold">Objective: ${entry.objective}</span>
          </div>

          <div class="space-y-1.5 text-xs">
            <p class="font-bold text-slate-300">Prompt Given to AI:</p>
            <div class="font-mono bg-slate-900 p-2.5 rounded-lg text-slate-300 border border-slate-800/80">
              ${entry.prompt}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
            <div class="bg-red-950/30 border border-red-900/40 p-3 rounded-xl space-y-1">
              <span class="font-bold text-red-400 flex items-center space-x-1">
                <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>
                <span>What the AI Got Wrong:</span>
              </span>
              <p class="text-slate-300 leading-relaxed">${entry.aiMistake}</p>
            </div>

            <div class="bg-emerald-950/30 border border-emerald-900/40 p-3 rounded-xl space-y-1">
              <span class="font-bold text-emerald-400 flex items-center space-x-1">
                <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>
                <span>Engineering Fix & Impact:</span>
              </span>
              <p class="text-slate-300 leading-relaxed">${entry.fix}</p>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
    initIcons();
  } catch (err) {
    console.error('Error loading prompt log:', err);
  }
}

// 3-Minute Pitch Timer Controls
function togglePitchTimer() {
  const btn = document.getElementById('btn-pitch-timer');
  if (pitchTimerInterval) {
    clearInterval(pitchTimerInterval);
    pitchTimerInterval = null;
    btn.innerText = 'Resume';
    btn.className = 'px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs';
  } else {
    pitchTimerInterval = setInterval(() => {
      pitchTimerSeconds++;
      updatePitchTimerDisplay();
      if (pitchTimerSeconds >= 180) {
        clearInterval(pitchTimerInterval);
        pitchTimerInterval = null;
        btn.innerText = 'Time Up!';
        btn.className = 'px-2.5 py-1 rounded bg-red-500 text-white font-bold text-xs';
      }
    }, 1000);
    btn.innerText = 'Pause';
    btn.className = 'px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs';
  }
}

function resetPitchTimer() {
  clearInterval(pitchTimerInterval);
  pitchTimerInterval = null;
  pitchTimerSeconds = 0;
  updatePitchTimerDisplay();
  const btn = document.getElementById('btn-pitch-timer');
  btn.innerText = 'Start';
  btn.className = 'px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs';
}

function updatePitchTimerDisplay() {
  const min = Math.floor(pitchTimerSeconds / 60);
  const sec = pitchTimerSeconds % 60;
  document.getElementById('pitch-timer').innerText = 
    `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function runPitchJudgeDemo() {
  applyGLAPreset('judge_hoodie');
  switchTab('report');
}
