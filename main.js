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
    const initialAcross = parseInt(CONFIG.ACROSS_STATE.join(''), 2);
    const initialDown = parseInt(CONFIG.DOWN_STATE.join(''), 2);
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
    let across = 0;
    let down = 0;
    let maxAcross = Math.pow(2, CONFIG.CELLSACROSS) - 1;
    let maxDown = Math.pow(2, CONFIG.CELLSDOWN) - 1;

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
            // Increment across and down, wrap if needed
            let nextAcross = (CONFIG.acrossStateNumber + 1) > maxAcross ? 0 : CONFIG.acrossStateNumber + 1;
            let nextDown = (CONFIG.downStateNumber + 1) > maxDown ? 0 : CONFIG.downStateNumber + 1;
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
            // Convert binary array to number
            across = parseInt(CONFIG.ACROSS_STATE.join(''), 2);
            down = parseInt(CONFIG.DOWN_STATE.join(''), 2);
        }
        acrossInput.value = across;
        downInput.value = down;
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
        acrossInput.value = parseInt(CONFIG.ACROSS_STATE.join(''), 2);
        downInput.value = parseInt(CONFIG.DOWN_STATE.join(''), 2);
    }
    // Call after DOMContentLoaded and after any grid/state change
    syncInputsToState();

    acrossInput.addEventListener('input', (e) => {
    let val = Math.max(0, Math.min(maxAcross, parseInt(e.target.value) || 0));
    // If the value was previously forced to zero, allow user to increment from there
    CONFIG.setAcrossStateNumber(val);
    across = CONFIG.acrossStateNumber;
    acrossInput.value = across;
    window.binaryFractal.reinitGrid();
    updateStateInputs();
    });
    downInput.addEventListener('input', (e) => {
        const val = Math.max(0, Math.min(maxDown, parseInt(e.target.value) || 0));
        down = val;
        CONFIG.setDownStateNumber(down);
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
    let maxAcrossNew = Math.pow(2, val) - 1;
    let newAcross = prevAcross > maxAcrossNew ? 0 : prevAcross;
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
    let maxDownNew = Math.pow(2, val) - 1;
    let newDown = prevDown > maxDownNew ? 0 : prevDown;
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