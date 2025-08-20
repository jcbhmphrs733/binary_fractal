import { CONFIG } from "./CONFIG.js";

export class CellManager {
    constructor() {
        this.alive = true;
    }

    init() {

    }

    createCell(index) {
        const n = CONFIG.CELLSACROSS + 1;
        const cell = {
            div: document.createElement("div"),
            index: index,
            row: Math.floor(index / CONFIG.CELLSACROSS),
            col: index % CONFIG.CELLSACROSS,
        };

        cell.TL = cell.col + (cell.row * n);
        cell.TR = cell.TL + 1;
        cell.BL = cell.TL + n;
        cell.BR = cell.BL + 1;

        cell.div.classList.add("cell");

        // TRUE if: row is "1" in config AND col is even
        // FALSE if: row is "0" in config AND col is even
        const tbar = CONFIG.DOWN_STATE[cell.row] == 1 && cell.col % 2 === 0;

        cell.div.innerHTML = tbar;
        return cell;
    }

}