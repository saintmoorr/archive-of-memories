/* ========================================================
   АРХИВ ЧУЖИХ ВОСПОМИНАНИЙ // МОДУЛЬ МИНИ-ИГР И ИНТЕРАКТИВОВ
   (games.js) by Saintmoor
   ======================================================== */

/* --- 1. БАЗА ДАННЫХ КОНСОЛИ ДЕКИ --- */
const secretLoreDatabase = {
  "МНЕМОЗИНА": {
    title: "ДОСЬЕ № 904-А // ПРОЕКТ «МНЕМОЗИНА»",
    desc: "Ведущий нейроинженер Фогель (брат Элли) отказался стирать эмоциональные центры детей. Ликвидирован инсценировкой.",
    effect: "Элли узнает правду о брате! Синаптический резонанс +15%."
  },
  "ВЕБЕР": {
    title: "ЛИЧНЫЙ ДНЕВНИК // ВЕБЕР-СТАРШИЙ // ЗАПИСЬ 00",
    desc: "Вебер пересадил внешность и имя погибшего сына сироте Яну, сделав из него живое оружие десинхронизации.",
    effect: "Иммунитет к диссоциации. Резонанс +10%."
  },
  "ЯН": {
    title: "АРХИВ МУНИЦИПАЛЬНОГО ПРИЮТА № 4 // ДОСЬЕ: ЯН",
    desc: "Биоритм мозга совпадает с кристаллической решеткой недр Эридана-4.",
    effect: "Разблокирована истинная мощь деструктора на экзопланете!"
  },
  "НОРД-БЕЙ": {
    title: "ПРОТОКОЛ ЧИСТКИ // ПОРТОВЫЙ РАЙОН НОРД-БЕЙ",
    desc: "Мать Кая застрелена чистильщиками «Арго-Сис». Ему внушили ложное воспоминание о шторме.",
    effect: "Кай берет ярость под контроль. QTE-овердрайв облегчен на 30%!"
  },
  "ОРИОН": {
    title: "ТЕХНИЧЕСКИЙ РЕГЛАМЕНТ РЕАКТОРА «ОРИОН-КРИО»",
    desc: "Рен поглощает тепло до 1.2 ГВт при условии эмоционального покоя.",
    effect: "Рен получает защиту в дренаже дредноута."
  },
  "ОМЕГА-16": {
    title: "МАТРИЦА СЕРИИ «ОМЕГА» // 16 УЗЛОВ",
    desc: "Синхронное пробуждение всех 16 узлов создает неуязвимый сверхразум колонии.",
    effect: "Мгновенное пробуждение анабиозного зала в 18 главе!"
  },
  "КОВАЛЬСКАЯ": {
    title: "СЕКРЕТНЫЙ ПРОТОКОЛ СОВЕТА // АВТОРИЗАЦИЯ «ЭРИДАН»",
    desc: "Аварийный код отмены квантовой детонации дредноута: 00-OMEGA-FREE.",
    effect: "Получен пароль отмены самоуничтожения корабля!"
  }
};

function submitCliWord() {
  const field = document.getElementById('cliInputField');
  const val = field.value.trim().toUpperCase();
  const out = document.getElementById('cliOutput');
  if (!val) return;

  if (secretLoreDatabase[val]) {
    const item = secretLoreDatabase[val];
    unlockedLoreKeys.add(val);
    out.innerHTML += `<br><span style="color:var(--green)">[ДОСТУП РАЗРЕШЕН: ${val}]</span><br><strong>${item.title}</strong><br>${item.desc}<br><span style="color:var(--cyan); font-size:11px;">[ЭФФЕКТ]: ${item.effect}</span><br>`;
    modifyResonance(10);
  } else {
    out.innerHTML += `<br><span style="color:var(--magenta)">[ОШИБКА 404]: Ключ «${val}» не найден.</span>`;
  }
  field.value = '';
  out.scrollTop = out.scrollHeight;
}

function putClueToCli(word) {
  document.getElementById('modalConsole').classList.add('open');
  document.getElementById('cliInputField').value = word;
  submitCliWord();
}

/* --- 2. МИНИ-ИГРА: ПОЛЕТ ЧЕЛНОКА --- */
const modalFlight = document.getElementById('modalFlight');
const fCanvas = document.getElementById('flightCanvas');
const fCtx = fCanvas ? fCanvas.getContext('2d') : null;
const hullDisplay = document.getElementById('hullDisplay');
const distDisplay = document.getElementById('distDisplay');
const btnStartFlight = document.getElementById('btnStartFlight');
const btnFlightProceed = document.getElementById('btnFlightProceed');

let ship = { x: 280, y: 250, w: 34, h: 28, speed: 6.5 };
let obstacles = [];
let keys = {};
let flightDist = 0;
const maxFlightDist = 2000;
let hullIntegrity = 100;
let flightAnim = null;
let isFlightRunning = false;

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function initFlightControls() {
  const btnTouchLeft = document.getElementById('btnTouchLeft');
  const btnTouchRight = document.getElementById('btnTouchRight');
  if (btnTouchLeft && btnTouchRight) {
    btnTouchLeft.addEventListener('pointerdown', () => keys['ArrowLeft'] = true);
    btnTouchLeft.addEventListener('pointerup', () => keys['ArrowLeft'] = false);
    btnTouchRight.addEventListener('pointerdown', () => keys['ArrowRight'] = true);
    btnTouchRight.addEventListener('pointerup', () => keys['ArrowRight'] = false);
  }

  if (btnStartFlight) btnStartFlight.onclick = startFlightGame;
  if (btnFlightProceed) {
    btnFlightProceed.onclick = () => {
      modalFlight.classList.remove('open');
      goToChapterById("ch13");
    };
  }
  const closeFlight = document.getElementById('btnCloseFlight');
  if (closeFlight) {
    closeFlight.onclick = () => {
      modalFlight.classList.remove('open');
      isFlightRunning = false;
      cancelAnimationFrame(flightAnim);
    };
  }
}

function startFlightGame() {
  ship.x = 280;
  obstacles = [];
  flightDist = 0;
  hullIntegrity = 100;
  isFlightRunning = true;
  if (btnStartFlight) btnStartFlight.style.display = 'none';
  if (btnFlightProceed) btnFlightProceed.style.display = 'none';
  if (hullDisplay) {
    hullDisplay.innerText = '100%';
    hullDisplay.style.color = 'var(--green)';
  }
  if (distDisplay) distDisplay.innerText = `0 / ${maxFlightDist}m`;

  cancelAnimationFrame(flightAnim);
  flightLoop();
}

function flightLoop() {
  if (!isFlightRunning || !fCtx) return;

  if (keys['ArrowLeft'] || keys['KeyA']) ship.x -= ship.speed;
  if (keys['ArrowRight'] || keys['KeyD']) ship.x += ship.speed;
  if (ship.x < 10) ship.x = 10;
  if (ship.x > fCanvas.width - ship.w - 10) ship.x = fCanvas.width - ship.w - 10;

  flightDist += 4;
  if (distDisplay) distDisplay.innerText = `${Math.min(flightDist, maxFlightDist)} / ${maxFlightDist}m`;

  if (Math.random() < 0.08) {
    obstacles.push({
      x: Math.random() * (fCanvas.width - 40),
      y: -30,
      w: 24 + Math.random() * 20,
      h: 18 + Math.random() * 16,
      speed: 3.5 + Math.random() * 3
    });
  }

  fCtx.fillStyle = '#020610';
  fCtx.fillRect(0, 0, fCanvas.width, fCanvas.height);

  fCtx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
  fCtx.beginPath();
  for (let i = 0; i < 8; i++) {
    let lx = (i * 80 + (flightDist % 80));
    fCtx.moveTo(lx, 0); fCtx.lineTo(lx, fCanvas.height);
  }
  fCtx.stroke();

  // Челнок «Атлас»
  fCtx.fillStyle = '#00f0ff';
  fCtx.beginPath();
  fCtx.moveTo(ship.x + ship.w / 2, ship.y);
  fCtx.lineTo(ship.x + ship.w, ship.y + ship.h);
  fCtx.lineTo(ship.x + ship.w / 2, ship.y + ship.h - 6);
  fCtx.lineTo(ship.x, ship.y + ship.h);
  fCtx.closePath();
  fCtx.fill();

  fCtx.fillStyle = '#ffaa00';
  fCtx.fillRect(ship.x + ship.w / 2 - 3, ship.y + ship.h - 4, 6, 8 + Math.random() * 8);

  // Препятствия
  fCtx.fillStyle = '#ff0055';
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.y += obs.speed;
    fCtx.fillRect(obs.x, obs.y, obs.w, obs.h);

    if (
      ship.x < obs.x + obs.w &&
      ship.x + ship.w > obs.x &&
      ship.y < obs.y + obs.h &&
      ship.y + ship.h > obs.y
    ) {
      hullIntegrity -= 15;
      obstacles.splice(i, 1);
      if (hullDisplay) {
        hullDisplay.innerText = `${Math.max(hullIntegrity, 0)}%`;
        if (hullIntegrity <= 40) hullDisplay.style.color = 'var(--amber)';
        if (hullIntegrity <= 20) hullDisplay.style.color = 'var(--magenta)';
      }

      if (hullIntegrity <= 0) {
        isFlightRunning = false;
        fCtx.fillStyle = '#ff0055';
        fCtx.font = '18px Orbitron, monospace';
        fCtx.textAlign = 'center';
        fCtx.fillText('КОРПУС РАЗРУШЕН В РАЗЛОМЕ', fCanvas.width / 2, fCanvas.height / 2);
        if (btnStartFlight) {
          btnStartFlight.style.display = 'inline-block';
          btnStartFlight.innerText = 'ПОВТОРИТЬ ПРЫЖОК';
        }
        return;
      }
    } else if (obs.y > fCanvas.height + 40) {
      obstacles.splice(i, 1);
    }
  }

  if (flightDist >= maxFlightDist) {
    isFlightRunning = false;
    fCtx.fillStyle = '#00ff66';
    fCtx.font = '18px Orbitron, monospace';
    fCtx.textAlign = 'center';
    fCtx.fillText('РАЗЛОМ ПРЕОДОЛЕН! ВЫХОД К ЭРИДАНУ-4', fCanvas.width / 2, fCanvas.height / 2);
    if (btnFlightProceed) btnFlightProceed.style.display = 'inline-block';
    return;
  }

  flightAnim = requestAnimationFrame(flightLoop);
}

/* --- 3. МИНИ-ИГРА: НЕЙРОХИРУРГИЯ (ЛИМИТ 5 СЕКТОРОВ) --- */
let neuroTraps = new Set();
let neuroShunts = new Set();
let neuroRevealed = 0;
const neuroSize = 5;
const totalTraps = 4;
const targetReveals = 5;

function startNeuroGame(applyPenalty = false) {
  const grid = document.getElementById('neuroGrid');
  if (!grid) return;
  grid.innerHTML = '';
  neuroTraps.clear();
  neuroShunts.clear();
  neuroRevealed = 0;

  const nStatus = document.getElementById('neuroStatus');
  const sDisp = document.getElementById('shuntsDisplay');
  const rDisp = document.getElementById('revealedDisplay');

  if (nStatus) {
    nStatus.innerText = 'СКАНИРОВАНИЕ';
    nStatus.style.color = 'var(--cyan)';
  }
  if (sDisp) sDisp.innerText = `0 / ${totalTraps}`;
  if (rDisp) rDisp.innerText = `0 / ${targetReveals}`;

  if (applyPenalty) modifyResonance(-10);

  while (neuroTraps.size < totalTraps) {
    neuroTraps.add(Math.floor(Math.random() * (neuroSize * neuroSize)));
  }

  for (let i = 0; i < neuroSize * neuroSize; i++) {
    const cell = document.createElement('div');
    cell.className = 'neuro-cell';
    cell.dataset.idx = i;
    cell.onclick = () => revealNeuroCell(i, cell);
    cell.oncontextmenu = (e) => {
      e.preventDefault();
      toggleShunt(i, cell);
    };
    grid.appendChild(cell);
  }
}

function toggleShunt(idx, cell) {
  if (cell.classList.contains('revealed')) return;
  const sDisp = document.getElementById('shuntsDisplay');
  if (neuroShunts.has(idx)) {
    neuroShunts.delete(idx);
    cell.classList.remove('shunt');
    cell.innerText = '';
  } else {
    if (neuroShunts.size >= totalTraps) return;
    neuroShunts.add(idx);
    cell.classList.add('shunt');
    cell.innerText = '🛡️';
  }
  if (sDisp) sDisp.innerText = `${neuroShunts.size} / ${totalTraps}`;
}

function revealNeuroCell(idx, cell) {
  if (cell.classList.contains('revealed') || neuroShunts.has(idx)) return;
  const nStatus = document.getElementById('neuroStatus');
  const rDisp = document.getElementById('revealedDisplay');

  if (neuroTraps.has(idx)) {
    cell.classList.add('trap');
    cell.innerText = '💥';
    if (nStatus) {
      nStatus.innerText = 'ЧИП ПОВРЕЖДЕН!';
      nStatus.style.color = 'var(--magenta)';
    }
    modifyResonance(-10);
    document.querySelectorAll('.neuro-cell').forEach(c => c.style.pointerEvents = 'none');
    return;
  }

  let r = Math.floor(idx / neuroSize);
  let c = idx % neuroSize;
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      let nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < neuroSize && nc >= 0 && nc < neuroSize) {
        if (neuroTraps.has(nr * neuroSize + nc)) count++;
      }
    }
  }

  cell.classList.add('revealed');
  cell.innerText = count > 0 ? count : '';
  neuroRevealed++;
  if (rDisp) rDisp.innerText = `${neuroRevealed} / ${targetReveals}`;

  // УСПЕШНОЕ ИЗВЛЕЧЕНИЕ: ПЕРЕХОД ДАЛЬШЕ
  if (neuroRevealed >= targetReveals) {
    if (nStatus) {
      nStatus.innerText = 'ИЗОЛЯЦИЯ СНЯТА // КОД ДОБЫТ';
      nStatus.style.color = 'var(--green)';
    }
    modifyResonance(15);
    putClueToCli("МНЕМОЗИНА");
    document.querySelectorAll('.neuro-cell').forEach(c => c.style.pointerEvents = 'none');

    // Через 1 секунду закрываем окно и переводим на Главу 2 (Рынок «Стек»)
    setTimeout(() => {
      const modal = document.getElementById('modalNeuro');
      if (modal) modal.classList.remove('open');
      if (typeof goToChapterById === 'function') {
        goToChapterById("ch2");
      }
    }, 1100);
  }
}

/* --- 4. МИНИ-ИГРА: QTE-ОВЕРДРАЙВ (ENTER / SPACE / TOUCH) --- */
let qteCursorPos = 0;
let qteDirection = 1;
let qteAnim = null;
let isQTEActive = false;

function startQTE() {
  isQTEActive = true;
  qteCursorPos = 0;
  qteDirection = 1;
  const res = document.getElementById('qteResult');
  if (res) res.innerText = '';
  cancelAnimationFrame(qteAnim);

  const zone = document.querySelector('.qte-zone');
  if (zone) {
    zone.style.width = `${qteZoneWidth}%`;
    zone.style.left = `${50 - qteZoneWidth/2}%`;
  }

  loopQTE();
}

function loopQTE() {
  if (!isQTEActive) return;
  qteCursorPos += qteSpeedModifier * qteDirection;
  if (qteCursorPos >= 96) qteDirection = -1;
  if (qteCursorPos <= 0) qteDirection = 1;

  const cursor = document.getElementById('qteCursor');
  if (cursor) cursor.style.left = `${qteCursorPos}%`;
  qteAnim = requestAnimationFrame(loopQTE);
}

function hitQTE() {
  if (!isQTEActive) return;
  isQTEActive = false;
  cancelAnimationFrame(qteAnim);

  const zoneLeft = 50 - qteZoneWidth/2;
  const zoneRight = 50 + qteZoneWidth/2;
  const res = document.getElementById('qteResult');

  if (qteCursorPos >= zoneLeft && qteCursorPos <= zoneRight) {
    if (res) {
      res.innerText = '⚡ УСПЕХ! ПРИВОДЫ ЗАМКНУТЫ // КУПОЛ СБИТ';
      res.style.color = 'var(--green)';
    }
    modifyResonance(15);
    setTimeout(() => {
      document.getElementById('modalQTE').classList.remove('open');
      goToChapterById("ch17");
    }, 800);
  } else {
    if (res) {
      res.innerText = 'ОШИБКА! ТУРЕЛИ ДАЛИ ЗАЛП // УРОН СИНАПСОВ';
      res.style.color = 'var(--magenta)';
    }
    modifyResonance(-10);
  }
}

window.addEventListener('keydown', e => {
  if (isQTEActive && (e.code === 'Enter' || e.code === 'Space')) {
    e.preventDefault();
    hitQTE();
  }
});

/* --- 5. ТАКТИЧЕСКАЯ КАРТА --- */
function selectTacNode(nodeId) {
  document.querySelectorAll('.tac-node').forEach((el, i) => {
    el.classList.toggle('selected', (i + 1) === nodeId);
  });
  const rep = document.getElementById('tacReport');
  const btn = document.getElementById('btnConfirmTacPlan');
  if (btn) btn.style.display = 'inline-block';

  if (nodeId === 1) {
    qteSpeedModifier = 4.2;
    qteZoneWidth = 14;
    if (rep) rep.innerHTML = '<strong>ПЛАН: ДРЕНАЖ РЕАКТОРА.</strong> Рен берет тепловой удар на себя. Турели без присмотра: QTE будет быстрее, а зеленая зона уже!';
  } else if (nodeId === 2) {
    qteSpeedModifier = 2.4;
    qteZoneWidth = 28;
    if (rep) rep.innerHTML = '<strong>ПЛАН: ЛОБОВОЙ ВЗЛОМ ТУРЕЛЕЙ.</strong> Кай подключается к шине орудий. Зеленая зона QTE расширена!';
  } else {
    qteSpeedModifier = 3.2;
    qteZoneWidth = 20;
    if (rep) rep.innerHTML = '<strong>ПЛАН: ШТУРМ 9-Й ПАЛУБЫ.</strong> Сбалансированный штурм.';
  }
}

function confirmTacPlan() {
  modifyResonance(10);
  document.getElementById('modalTacticalMap').classList.remove('open');
  goToChapterById("ch16");
}

/* --- 6. ТАКТИЧЕСКИЙ ЧАТ ДЕКИ --- */
let quickChatTimer = null;
function triggerQuickChat() {
  const box = document.getElementById('quickChatBox');
  const bar = document.getElementById('quickChatBar');
  if (!box || !bar) return;

  box.style.display = 'block';
  box.style.zIndex = '999';
  bar.style.width = '100%';
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });

  let timeLeft = 50;
  clearInterval(quickChatTimer);
  quickChatTimer = setInterval(() => {
    timeLeft--;
    bar.style.width = `${(timeLeft / 50) * 100}%`;
    if (timeLeft <= 0) {
      clearInterval(quickChatTimer);
      box.style.display = 'none';
      modifyResonance(-10);
      goToChapterById("ch15");
    }
  }, 100);
}

function resolveQuickChat(choice) {
  clearInterval(quickChatTimer);
  const box = document.getElementById('quickChatBox');
  if (box) box.style.display = 'none';

  modifyResonance(choice === 1 ? 10 : 5);
  goToChapterById("ch15");
}

// Инициализация кнопок управления полетом при загрузке
window.addEventListener('DOMContentLoaded', initFlightControls);
