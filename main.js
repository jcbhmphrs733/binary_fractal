import { CellManager } from './modules/CellManager.js';
import { GridManager } from './modules/GridManager.js';

class BinaryFractal {
    constructor() {
        this.cellManager = new CellManager();
        this.gridManager = new GridManager(this.cellManager);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    })
    window.binaryFractal = new BinaryFractal();
});

export { BinaryFractal };