document.addEventListener('DOMContentLoaded', () => {
  // State & Elements
  let stitchCount = 0, rowCount = 0;
  const history    = [];
  const clickSound = new Audio('https://www.soundjay.com/button/beep-07.wav');
  const startTime  = Date.now();

  const stitchBtn    = document.getElementById('stitchBtn');
  const rowBtn       = document.getElementById('rowBtn');
  const resetBtn     = document.getElementById('resetBtn');
  const undoBtn      = document.getElementById('undoBtn');
  const editBtn      = document.getElementById('editBtn');
  const perRowInput  = document.getElementById('stitchesPerRow');
  const autoRowCheck = document.getElementById('autoRow');

  const pipToggle    = document.getElementById('pipToggle');
  const pipContainer = document.getElementById('pipContainer');
  const pipOverlay   = document.getElementById('pipOverlay');
  const pipMessage   = document.getElementById('pipMessage');
  const pipStitches  = document.getElementById('pipStitches');
  const pipRows      = document.getElementById('pipRows');
  const pipTimer     = document.getElementById('pipTimer');
  const pipStitchBtn = document.getElementById('pipStitchBtn');
  const pipRowBtn    = document.getElementById('pipRowBtn');
  const pipUndoBtn   = document.getElementById('pipUndoBtn');

  const themeBtns    = document.querySelectorAll('.theme-btn');

  // Display updater
  function updateDisplays() {
    stitchBtn.textContent   = `${stitchCount} Stitches`;
    rowBtn.textContent      = `${rowCount} Rows`;
    pipStitches.textContent = `Stitches: ${stitchCount}`;
    pipRows.textContent     = `Rows: ${rowCount}`;
  }

  // Counter logic
  function addStitch() {
    history.push({ s: stitchCount, r: rowCount });
    const perRow = parseInt(perRowInput.value) || Infinity;
    if (autoRowCheck.checked && stitchCount + 1 >= perRow) {
      stitchCount = 0; rowCount++;
    } else {
      stitchCount++;
    }
    clickSound.play();
    updateDisplays();
  }
  function addRow() {
    history.push({ s: stitchCount, r: rowCount });
    rowCount++; stitchCount = 0;
    clickSound.play();
    updateDisplays();
  }
  function undo() {
    if (!history.length) return;
    const { s, r } = history.pop();
    stitchCount = s; rowCount = r;
    clickSound.play();
    updateDisplays();
  }
  function reset() {
    history.push({ s: stitchCount, r: rowCount });
    stitchCount = 0; rowCount = 0;
    clickSound.play();
    updateDisplays();
  }
  function editValues() {
    const newS = parseInt(prompt("New stitch count:", stitchCount));
    const newR = parseInt(prompt("New row count:", rowCount));
    history.push({ s: stitchCount, r: rowCount });
    if (!isNaN(newS)) stitchCount = newS;
    if (!isNaN(newR)) rowCount    = newR;
    clickSound.play();
    updateDisplays();
  }

  // Attach main handlers
  stitchBtn.addEventListener('click', addStitch);
  rowBtn   .addEventListener('click', addRow);
  resetBtn .addEventListener('click', reset);
  undoBtn  .addEventListener('click', undo);
  editBtn  .addEventListener('click', editValues);

  // Theme picker
  function setTheme(color) {
    document.body.style.background = color;
    themeBtns.forEach(b => b.classList.toggle('active', b.dataset.color === color));
  }
  themeBtns.forEach(b => b.addEventListener('click', () => setTheme(b.dataset.color)));
  if (themeBtns[0]) setTheme(themeBtns[0].dataset.color);

  // Timer
  setInterval(() => {
    const secs = Math.floor((Date.now() - startTime) / 1000);
    const m    = String(Math.floor(secs / 60)).padStart(2,'0');
    const s    = String(secs % 60).padStart(2,'0');
    pipTimer.textContent = `⏱️ ${m}:${s}`;
  }, 1000);

  // PiP manager
  const PIP_WINDOW_SIZE = { width: 300, height: 240 };
  class PipManager {
    constructor(overlay, container, toggleBtn, message, size) {
      this.overlay   = overlay;
      this.container = container;
      this.toggleBtn = toggleBtn;
      this.message   = message;
      this.size      = size;
      toggleBtn.addEventListener('click', this.startPiP);
    }
    startPiP = async () => {
      if (document.documentPictureInPicture?.window) return;
      const win = await window.documentPictureInPicture.requestWindow(this.size);
      for (const sheet of document.styleSheets) {
        try {
          const css = [...sheet.cssRules].map(r=>r.cssText).join('');
          const style = win.document.createElement('style');
          style.textContent = css;
          win.document.head.appendChild(style);
        } catch {
          const link = win.document.createElement('link');
          link.rel  = 'stylesheet';
          link.href = sheet.href;
          win.document.head.appendChild(link);
        }
      }
      win.document.body.appendChild(this.overlay);
      this.message.style.display = '';
      this.toggleBtn.removeEventListener('click', this.startPiP);
      this.toggleBtn.addEventListener('click', this.stopPiP);
    }
    stopPiP = () => {
      this.container.appendChild(this.overlay);
      this.message.style.display = 'none';
      this.toggleBtn.removeEventListener('click', this.stopPiP);
      this.toggleBtn.addEventListener('click', this.startPiP);
      document.documentPictureInPicture?.window.close();
    }
  }
  new PipManager(pipOverlay, pipContainer, pipToggle, pipMessage, PIP_WINDOW_SIZE);
  pipStitchBtn.addEventListener('click', addStitch);
  pipRowBtn   .addEventListener('click', addRow);
  pipUndoBtn  .addEventListener('click', undo);

  // Initial render
  updateDisplays();
});
