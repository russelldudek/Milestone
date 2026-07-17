const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const stack = document.querySelector('.protocol-stack');
const stage = document.querySelector('.protocol-stage');
const sheets = stack ? [...stack.querySelectorAll('.protocol-sheet')] : [];
let activeSheet = 0;
let flipping = false;

if (stack) requestAnimationFrame(() => setTimeout(() => stack.classList.add('aligned'), 250));

const menu = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');
if (menu && nav) {
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
}

const scenarios = {
  balanced: {
    title: 'Illustrative baseline portfolio',
    copy: 'Each workstream has a distinct evidence profile and a decision matched to its current state.',
    decision: 'Advance the portfolio with differentiated controls',
    code: 'DECISION READY',
    focus: 0,
    workstreams: [
      {values:{value:84,readiness:78,authority:86,spend:82,dependencies:72,adoption:74},status:'advance',label:'Advance with controls'},
      {values:{value:76,readiness:71,authority:88,spend:85,dependencies:66,adoption:70},status:'advance',label:'Advance with data controls'},
      {values:{value:81,readiness:79,authority:82,spend:69,dependencies:58,adoption:76},status:'escalate',label:'Advance after dependency decision'},
      {values:{value:88,readiness:83,authority:79,spend:80,dependencies:74,adoption:62},status:'advance',label:'Advance with adoption plan'}
    ]
  },
  data: {
    title: 'Data and compliance dependency',
    copy: 'A shared data-control issue changes more than one workstream. The portfolio view exposes the ripple before it becomes schedule noise.',
    decision: 'Hold W2; re-sequence W3; assign data authority',
    code: 'CONTROL DECISION',
    focus: 1,
    workstreams: [
      {values:{value:82,readiness:72,authority:84,spend:80,dependencies:67,adoption:72},status:'advance',label:'Advance with monitoring'},
      {values:{value:78,readiness:38,authority:52,spend:77,dependencies:44,adoption:64},status:'hold',label:'Hold for data authority'},
      {values:{value:79,readiness:63,authority:76,spend:66,dependencies:49,adoption:71},status:'escalate',label:'Re-sequence shared dependency'},
      {values:{value:86,readiness:77,authority:75,spend:76,dependencies:69,adoption:58},status:'advance',label:'Advance with bounded scope'}
    ]
  },
  vendor: {
    title: 'External partner dependency',
    copy: 'Vendor delivery, integration ownership, and contingency change roadmap confidence across the portfolio - not only on the partner-led workstream.',
    decision: 'Re-plan W3 and protect dependent commitments',
    code: 'DEPENDENCY ACTION',
    focus: 2,
    workstreams: [
      {values:{value:83,readiness:76,authority:85,spend:80,dependencies:64,adoption:72},status:'advance',label:'Advance with contingency'},
      {values:{value:74,readiness:69,authority:86,spend:78,dependencies:57,adoption:68},status:'advance',label:'Protect shared capacity'},
      {values:{value:80,readiness:61,authority:74,spend:44,dependencies:32,adoption:67},status:'escalate',label:'Escalate vendor boundary'},
      {values:{value:86,readiness:80,authority:77,spend:73,dependencies:55,adoption:60},status:'hold',label:'Hold dependent release'}
    ]
  },
  adoption: {
    title: 'Adoption ownership gap',
    copy: 'Technical readiness remains credible, but workflow ownership, enablement, and sustainment evidence change the value and budget posture.',
    decision: 'Narrow W4 until operating ownership is explicit',
    code: 'OWNER REQUIRED',
    focus: 3,
    workstreams: [
      {values:{value:81,readiness:76,authority:84,spend:79,dependencies:70,adoption:66},status:'advance',label:'Advance with user evidence'},
      {values:{value:73,readiness:69,authority:86,spend:82,dependencies:64,adoption:61},status:'advance',label:'Add change evidence'},
      {values:{value:77,readiness:75,authority:79,spend:65,dependencies:54,adoption:58},status:'escalate',label:'Name sustainment owner'},
      {values:{value:80,readiness:82,authority:74,spend:71,dependencies:68,adoption:28},status:'hold',label:'Hold for operating ownership'}
    ]
  }
};

function relativePosition(index) {
  return (index - activeSheet + sheets.length) % sheets.length;
}

function assignSheetPositions() {
  sheets.forEach((sheet, index) => {
    sheet.classList.remove('is-active','is-behind-1','is-behind-2','is-behind-3','is-flipping');
    const pos = relativePosition(index);
    sheet.classList.add(pos === 0 ? 'is-active' : `is-behind-${pos}`);
    sheet.setAttribute('aria-hidden', String(pos !== 0));
  });
  const live = document.querySelector('.protocol-live');
  if (live) live.textContent = `Workstream ${activeSheet + 1} of ${sheets.length}. Click to flip to the next workstream.`;
}

function flipTo(nextIndex, animate = true) {
  if (!sheets.length || flipping) return;
  const normalized = (nextIndex + sheets.length) % sheets.length;
  if (normalized === activeSheet) {
    assignSheetPositions();
    return;
  }
  const current = sheets[activeSheet];
  if (!animate || prefersReduced) {
    activeSheet = normalized;
    assignSheetPositions();
    return;
  }
  flipping = true;
  current.classList.add('is-flipping');
  window.setTimeout(() => {
    activeSheet = normalized;
    assignSheetPositions();
    flipping = false;
  }, 520);
}

if (stage) {
  stage.addEventListener('click', event => {
    if (event.target.closest('a,button')) return;
    flipTo(activeSheet + 1);
  });
  stage.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
      event.preventDefault();
      flipTo(activeSheet + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      flipTo(activeSheet - 1);
    }
  });
}

function animateNumber(node, next) {
  const current = Number.parseInt(node.textContent, 10) || next;
  if (prefersReduced || current === next) {
    node.textContent = `${next}%`;
    return;
  }
  const start = performance.now();
  const duration = 420;
  const tick = now => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = `${Math.round(current + (next - current) * eased)}%`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function metricState(value) {
  if (value < 45) return 'critical';
  if (value < 65) return 'attention';
  return 'ready';
}

function updateBoardWorkstream(ws, data, baselineData) {
  ws.classList.remove('status-hold','status-escalate');
  if (data.status === 'hold') ws.classList.add('status-hold');
  if (data.status === 'escalate') ws.classList.add('status-escalate');
  const status = ws.querySelector('.workstream-status');
  if (status) status.textContent = data.label;
  ws.querySelectorAll('.mini-row').forEach(row => {
    const field = row.dataset.field;
    const value = data.values[field];
    const base = baselineData.values[field];
    row.style.setProperty('--v', `${value}%`);
    row.dataset.state = metricState(value);
    row.classList.toggle('is-changed', value !== base);
    animateNumber(row.querySelector('b'), value);
  });
}

function updateHeroSheet(sheet, data, index) {
  sheet.querySelectorAll('.evidence-row').forEach(row => {
    const field = row.dataset.field;
    const value = data.values[field];
    const bar = row.querySelector('i');
    if (bar) bar.style.setProperty('--level', `${value}%`);
    row.dataset.state = metricState(value);
  });
  const decision = sheet.querySelector('[data-decision]');
  if (decision) decision.textContent = data.label;
  const title = sheet.querySelector('.sheet-index strong');
  if (title) title.textContent = `Workstream ${index + 1}`;
}

function applyScenario(key) {
  const scenario = scenarios[key];
  if (!scenario) return;
  document.querySelectorAll('[data-scenario]').forEach(button => {
    button.setAttribute('aria-selected', String(button.dataset.scenario === key));
  });
  const title = document.querySelector('#board-title');
  const copy = document.querySelector('#board-copy');
  const decision = document.querySelector('#decision-text');
  const code = document.querySelector('#decision-code');
  if (title) title.textContent = scenario.title;
  if (copy) copy.textContent = scenario.copy;
  if (decision) decision.textContent = scenario.decision;
  if (code) code.textContent = scenario.code;

  const baselineData = scenarios.balanced.workstreams;
  document.querySelectorAll('.workstream').forEach((ws, index) => {
    updateBoardWorkstream(ws, scenario.workstreams[index], baselineData[index]);
  });
  sheets.forEach((sheet, index) => updateHeroSheet(sheet, scenario.workstreams[index], index));
  flipTo(scenario.focus, true);
}

document.querySelectorAll('[data-scenario]').forEach(button => {
  button.addEventListener('click', () => applyScenario(button.dataset.scenario));
});

assignSheetPositions();
applyScenario('balanced');
