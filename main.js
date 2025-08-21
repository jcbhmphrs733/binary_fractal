import { CellManager } from './modules/CellManager.js';
import { GridManager } from './modules/GridManager.js';
import { CONFIG } from './modules/CONFIG.js';


class BinaryFractal {
    constructor() {
        this.cellManager = new CellManager();
        this.gridManager = new GridManager(this.cellManager);
    }

    reinitGrid() {
        // Re-create the grid to reflect new config
        this.gridManager = new GridManager(this.cellManager);
    }
}

// Initialize the application when DOM is loaded

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    window.binaryFractal = new BinaryFractal();

    // Numeric input controls
    const acrossInput = document.getElementById('across-input');
    const downInput = document.getElementById('down-input');
    const acrossLabel = document.querySelector('label[for="across-input"]');
    const downLabel = document.querySelector('label[for="down-input"]');
    const cellsAcrossInput = document.getElementById('cells-across-input');
    const cellsDownInput = document.getElementById('cells-down-input');


    // Set numeric state to match initial random state before enabling numeric control
    const initialAcross = BigInt('0b' + CONFIG.ACROSS_STATE.join(''));
    const initialDown = BigInt('0b' + CONFIG.DOWN_STATE.join(''));
    CONFIG.setAcrossStateNumber(initialAcross);
    CONFIG.setDownStateNumber(initialDown);
    CONFIG.setNumericControl(true);

    // After grid is initialized and DOM elements exist, sync input fields to state
    function syncInputsToState() {
        acrossInput.value = CONFIG.acrossStateNumber;
        downInput.value = CONFIG.downStateNumber;
    }
    syncInputsToState();

    // Animation: auto-increment both across and down state numbers
    let interval = 1000; // ms
    let across = 0n;
    let down = 0n;
    let maxAcross = (1n << BigInt(CONFIG.CELLSACROSS)) - 1n;
    let maxDown = (1n << BigInt(CONFIG.CELLSDOWN)) - 1n;

    // Remove old setInterval (animation now controlled by animId)

    // Keypress controls (example: pause/resume animation with spacebar)
    let animPaused = false;
    let animId = null;
    const stateSignifier = document.getElementById('state-signifier');
    function updateStateSignifier() {
        if (animId) {
            stateSignifier.textContent = 'Press Space to Pause.';
        } else {
            stateSignifier.textContent = 'Press Space to Increment.';
        }
    }
    function startAnim() {
        if (animId) return;
        animId = setInterval(() => {
            // Increment across and down, wrap if needed (BigInt)
            let nextAcross = (CONFIG.acrossStateNumber + 1n) > maxAcross ? 0n : CONFIG.acrossStateNumber + 1n;
            let nextDown = (CONFIG.downStateNumber + 1n) > maxDown ? 0n : CONFIG.downStateNumber + 1n;
            CONFIG.setAcrossStateNumber(nextAcross);
            CONFIG.setDownStateNumber(nextDown);
            window.binaryFractal.reinitGrid();
            updateStateInputs();
        }, interval);
        updateStateSignifier();
    }
    function stopAnim() {
        if (animId) clearInterval(animId);
        animId = null;
        updateStateSignifier();
    }
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            animPaused = !animPaused;
            if (animPaused) {
                stopAnim();
            } else {
                startAnim();
            }
        }
        // Add more key controls here as needed
    });
    // Set initial values for cell count inputs
    cellsAcrossInput.value = CONFIG.CELLSACROSS;
    cellsDownInput.value = CONFIG.CELLSDOWN;
    cellsAcrossInput.min = 1;
    cellsDownInput.min = 1;

    function updateStateInputs() {
        // Always reflect the actual state in CONFIG
        if (CONFIG.useNumericControl) {
            across = CONFIG.acrossStateNumber;
            down = CONFIG.downStateNumber;
        } else {
            across = BigInt('0b' + CONFIG.ACROSS_STATE.join(''));
            down = BigInt('0b' + CONFIG.DOWN_STATE.join(''));
        }
        acrossInput.value = across.toString();
        downInput.value = down.toString();
        acrossInput.min = 0;
        downInput.min = 0;
        acrossInput.max = maxAcross;
        downInput.max = maxDown;
        if (acrossLabel) {
            acrossLabel.textContent = `Across State (0 - ${maxAcross}):`;
        }
        if (downLabel) {
            downLabel.textContent = `Down State (0 - ${maxDown}):`;
        }
        cellsAcrossInput.value = CONFIG.CELLSACROSS;
        cellsDownInput.value = CONFIG.CELLSDOWN;
    }
    // Always reflect the true state in the input fields after grid/state initialization
    function syncInputsToState() {
    acrossInput.value = BigInt('0b' + CONFIG.ACROSS_STATE.join('')).toString();
    downInput.value = BigInt('0b' + CONFIG.DOWN_STATE.join('')).toString();
    }
    // Call after DOMContentLoaded and after any grid/state change
    syncInputsToState();

    acrossInput.addEventListener('input', (e) => {
    let val = e.target.value;
    let bigVal = BigInt(val || '0');
    if (bigVal > maxAcross) bigVal = 0n;
    if (bigVal < 0n) bigVal = 0n;
    CONFIG.setAcrossStateNumber(bigVal);
    across = CONFIG.acrossStateNumber;
    acrossInput.value = across.toString();
    window.binaryFractal.reinitGrid();
    updateStateInputs();
    });
    downInput.addEventListener('input', (e) => {
    let val = e.target.value;
    let bigVal = BigInt(val || '0');
    if (bigVal > maxDown) bigVal = 0n;
    if (bigVal < 0n) bigVal = 0n;
    CONFIG.setDownStateNumber(bigVal);
    down = CONFIG.downStateNumber;
    downInput.value = down.toString();
    window.binaryFractal.reinitGrid();
    updateStateInputs();
    });

    // Cell count input controls
    function updateMaxesAndLabels() {
        maxAcross = Math.pow(2, CONFIG.CELLSACROSS) - 1;
        maxDown = Math.pow(2, CONFIG.CELLSDOWN) - 1;
        acrossInput.max = maxAcross;
        downInput.max = maxDown;
        if (acrossLabel) {
            acrossLabel.textContent = `Across State (0 - ${maxAcross}):`;
        }
        if (downLabel) {
            downLabel.textContent = `Down State (0 - ${maxDown}):`;
        }
    }
    cellsAcrossInput.addEventListener('input', (e) => {
    syncInputsToState();
    let val = Math.max(1, parseInt(e.target.value) || 1);
    // Preserve current state value and pad with zeros if needed
    let prevAcross = CONFIG.acrossStateNumber;
    let prevDown = CONFIG.downStateNumber;
    let maxAcrossNew = (1n << BigInt(val)) - 1n;
    let newAcross = prevAcross > maxAcrossNew ? 0n : prevAcross;
    CONFIG.setGridSize(val, CONFIG.CELLSDOWN);
    CONFIG.setAcrossStateNumber(newAcross);
    CONFIG.setDownStateNumber(prevDown);
    window.binaryFractal.reinitGrid();
    updateMaxesAndLabels();
    updateStateInputs();
    });
    cellsDownInput.addEventListener('input', (e) => {
    syncInputsToState();
    let val = Math.max(1, parseInt(e.target.value) || 1);
    // Preserve current state value and pad with zeros if needed
    let prevAcross = CONFIG.acrossStateNumber;
    let prevDown = CONFIG.downStateNumber;
    let maxDownNew = (1n << BigInt(val)) - 1n;
    let newDown = prevDown > maxDownNew ? 0n : prevDown;
    CONFIG.setGridSize(CONFIG.CELLSACROSS, val);
    CONFIG.setAcrossStateNumber(prevAcross);
    CONFIG.setDownStateNumber(newDown);
    window.binaryFractal.reinitGrid();
    updateMaxesAndLabels();
    updateStateInputs();
    });
    // Also update maxes/labels on load
    updateMaxesAndLabels();

    // Start with animation paused; only start on space bar
    updateStateInputs();
    updateStateSignifier();
});

export { BinaryFractal };