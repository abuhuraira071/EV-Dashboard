/* ═══════════════════════════════════════════
   THEME
═══════════════════════════════════════════ */
let isDark = true;

function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('themeIcon').textContent = isDark ? '☀️' : '🌙';
  // Rebuild chart gradients on theme switch
  setTimeout(rebuildGradients, 50);
}

/* ═══════════════════════════════════════════
   CLOCK
═══════════════════════════════════════════ */
function tick() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString();
  document.getElementById('clockDate').textContent =
    now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
setInterval(tick, 1000); tick();

/* ═══════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════ */
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('on');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('on');
}

/* ═══════════════════════════════════════════
   TOAST
═══════════════════════════════════════════ */
let _toastTimer;
function toast(msg, type = 'ok') {
  const el = document.getElementById('toast');
  el.className = `toast ${type}`;
  document.getElementById('toastMsg').textContent = msg;
  el.classList.add('on');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('on'), 3500);
}

/* ═══════════════════════════════════════════
   STATUS
═══════════════════════════════════════════ */
function setStatus(online, label) {
  const pill = document.getElementById('statusPill');
  online ? pill.classList.add('online') : pill.classList.remove('online');
  document.getElementById('statusLabel').textContent = label;
}

/* ═══════════════════════════════════════════
   4 INDIVIDUAL SIGNAL CHARTS
═══════════════════════════════════════════ */
let chartV, chartI, chartS, chartP;

function makeGrad(ctx, h, colorRgb) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, `rgba(${colorRgb},0.22)`);
  g.addColorStop(1, `rgba(${colorRgb},0.0)`);
  return g;
}

function chartOptions(yColor, yLabel, yMin, yMax) {
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const tickColor = isDark ? '#2a3650' : '#9ca3af';
  const ttBg = isDark ? '#111e33' : '#ffffff';
  const ttBody = isDark ? '#e8edf5' : '#111827';
  const ttTitle = isDark ? '#6b7a99' : '#6b7280';
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 180 },
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: ttBg,
        borderColor: `rgba(${yColor},0.25)`, borderWidth: 1,
        titleColor: ttTitle, bodyColor: ttBody, padding: 10,
        bodyFont: { family: 'JetBrains Mono', size: 11 },
        titleFont: { family: 'JetBrains Mono', size: 10 },
        callbacks: {
          title: (i) => `Sample #${i[0].label}`,
          label: (i) => ` ${yLabel}: ${Number(i.raw).toFixed(4)}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: tickColor, font: { family: 'JetBrains Mono', size: 9 }, maxTicksLimit: 8 },
        border: { display: false }
      },
      y: {
        ...(yMin !== null ? { min: yMin } : {}),
        ...(yMax !== null ? { max: yMax } : {}),
        grid: { color: gridColor },
        ticks: {
          color: `rgb(${yColor})`,
          font: { family: 'JetBrains Mono', size: 9 },
          maxTicksLimit: 5
        },
        border: { display: false }
      }
    }
  };
}

function buildCharts() {
  const ctxV = document.getElementById('chartV').getContext('2d');
  const ctxI = document.getElementById('chartI').getContext('2d');
  const ctxS = document.getElementById('chartS').getContext('2d');
  const ctxP = document.getElementById('chartP').getContext('2d');

  chartV = new Chart(ctxV, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Voltage', data: [],
        borderColor: '#4da6ff',
        backgroundColor: makeGrad(ctxV, 160, '77,166,255'),
        borderWidth: 2, pointRadius: 0, pointHoverRadius: 4,
        fill: true, tension: 0.38
      }]
    },
    options: chartOptions('77,166,255', 'V', null, null)
  });

  chartI = new Chart(ctxI, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Current', data: [],
        borderColor: '#2de08a',
        backgroundColor: makeGrad(ctxI, 160, '45,224,138'),
        borderWidth: 2, pointRadius: 0, pointHoverRadius: 4,
        fill: true, tension: 0.38
      }]
    },
    options: chartOptions('45,224,138', 'A', null, null)
  });

  chartS = new Chart(ctxS, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'SOC', data: [],
        borderColor: '#ffb347',
        backgroundColor: makeGrad(ctxS, 160, '255,179,71'),
        borderWidth: 2, pointRadius: 0, pointHoverRadius: 4,
        fill: true, tension: 0.38
      }]
    },
    options: chartOptions('255,179,71', '%', 0, 100)
  });

  chartP = new Chart(ctxP, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Power', data: [],
        borderColor: '#a78bfa',
        backgroundColor: makeGrad(ctxP, 160, '167,139,250'),
        borderWidth: 2, pointRadius: 0, pointHoverRadius: 4,
        fill: true, tension: 0.38
      }]
    },
    options: chartOptions('167,139,250', 'W', null, null)
  });
}

function rebuildGradients() {
  [chartV, chartI, chartS, chartP].forEach(c => { if (c) c.destroy(); });
  buildCharts();
  if (latestHistories) pushToCharts(latestHistories);
}

buildCharts();

/* ═══════════════════════════════════════════
   GAUGE
═══════════════════════════════════════════ */
function updateGauge(soc) {
  const total = 257.6;
  const pct = Math.min(Math.max(soc / 100, 0), 1);
  const arc = document.getElementById('gArc');
  arc.setAttribute('stroke-dasharray', `${pct * total} ${total}`);

  const color = pct > 0.75 ? '#2de08a' : pct > 0.35 ? '#ffb347' : '#f87171';
  arc.setAttribute('stroke', color);
  arc.style.filter = `drop-shadow(0 0 10px ${color}88)`;

  const num = document.getElementById('gaugeNum');
  num.textContent = soc.toFixed(1);
  num.style.color = color;
  document.getElementById('gaugeMeta').textContent = `${soc.toFixed(0)}%`;
  document.getElementById('soc-fill').style.width = `${pct * 100}%`;
}

/* ═══════════════════════════════════════════
   LOG
═══════════════════════════════════════════ */
let logCount = 0;
function addLog(v, i, s, p) {
  logCount++;
  const wrap = document.getElementById('logScroll');
  if (logCount === 1) wrap.innerHTML = '';
  const t = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const row = document.createElement('div');
  row.className = 'log-row';
  row.innerHTML = `
    <span class="l-time">${t}</span>
    <span class="l-v">${v.toFixed(2)}</span>
    <span class="l-i">${i.toFixed(3)}</span>
    <span class="l-s">${s.toFixed(1)}</span>
    <span class="l-p">${p.toFixed(2)}</span>`;
  wrap.insertBefore(row, wrap.firstChild);
  if (wrap.children.length > 50) wrap.removeChild(wrap.lastChild);
  document.getElementById('logMeta').textContent = `${logCount} entries`;
}

/* ═══════════════════════════════════════════
   FLASH
═══════════════════════════════════════════ */
function flash(id) {
  const el = document.getElementById(id);
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

/* ═══════════════════════════════════════════
   DATA PUSH
═══════════════════════════════════════════ */
let totalRx = 0;
let latestHistories = null;

function pushToCharts(h) {
  const n = h.voltage.length;
  const labels = Array.from({ length: n }, (_, k) => k + 1);

  [
    [chartV, h.voltage],
    [chartI, h.current],
    [chartS, h.soc],
    [chartP, h.power]
  ].forEach(([chart, data]) => {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update('none');
  });
}

/* ═══════════════════════════════════════════
   SOCKET.IO
═══════════════════════════════════════════ */
const socket = io();

socket.on('connect', () => console.log('✅ WS connected'));

socket.on('disconnect', () => {
  setStatus(false, 'WS Lost');
  toast('Connection to server lost', 'err');
});

socket.on('mqtt_status', (d) => {
  if (d.connected) {
    setStatus(true, 'Live');
    toast('MQTT broker connected ✓', 'ok');
  } else {
    setStatus(false, d.reason || 'Offline');
    toast(`MQTT: ${d.reason || 'Disconnected'}`, 'err');
  }
});

socket.on('new_data', (d) => {
  const h = d.histories;
  if (!h || h.voltage.length === 0) return;

  totalRx++;
  latestHistories = h;
  const { voltage: v, current: i, soc: s, power: p } = d;

  // Push all 4 charts
  pushToCharts(h);

  // Live values in chart headers
  ['ch-val-v', 'ch-val-i', 'ch-val-s', 'ch-val-p'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  });
  document.getElementById('ch-val-v').textContent = v.toFixed(2);
  document.getElementById('ch-val-i').textContent = i.toFixed(3);
  document.getElementById('ch-val-s').textContent = s.toFixed(1);
  document.getElementById('ch-val-p').textContent = p.toFixed(2);

  // KPI cards
  ['kv-v', 'kv-i', 'kv-s', 'kv-p'].forEach(flash);
  document.getElementById('kv-v').textContent = v.toFixed(2);
  document.getElementById('kv-i').textContent = i.toFixed(3);
  document.getElementById('kv-s').textContent = s.toFixed(1);
  document.getElementById('kv-p').textContent = p.toFixed(2);

  // Sidebar
  document.getElementById('sb-v').textContent = v.toFixed(2);
  document.getElementById('sb-i').textContent = i.toFixed(3);
  document.getElementById('sb-s').textContent = s.toFixed(1);
  document.getElementById('sb-p').textContent = p.toFixed(2);
  document.getElementById('sb-n').textContent = totalRx;

  // Sidebar tracks
  const vMax = Math.max(...h.voltage) || 1;
  const iMax = Math.max(...h.current) || 1;
  const pMax = Math.max(...h.power) || 1;
  document.getElementById('tb-v').style.width = `${(v / vMax * 100).toFixed(1)}%`;
  document.getElementById('tb-i').style.width = `${(i / iMax * 100).toFixed(1)}%`;
  document.getElementById('tb-s').style.width = `${Math.min(s, 100).toFixed(1)}%`;
  document.getElementById('tb-p').style.width = `${(p / pMax * 100).toFixed(1)}%`;

  // Gauge + SOC bar
  updateGauge(s);

  // Log
  addLog(v, i, s, p);
});