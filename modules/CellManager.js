import { CONFIG } from "./CONFIG.js";

export class CellManager {
    constructor() {
        this.alive = true;
    }

    init() {

    }


    createCell(index, gridManager) {
        const n = CONFIG.CELLSACROSS + 1;
        const cell = {
            div: document.createElement("div"),
            index: index,
            row: Math.floor(index / CONFIG.CELLSACROSS),
            col: index % CONFIG.CELLSACROSS,
            alive: false,
            walls: {},
        };

        cell.TL = cell.col + (cell.row * n);
        cell.TR = cell.TL + 1;
        cell.BL = cell.TL + n;
        cell.BR = cell.BL + 1;

        cell.div.classList.add("cell");
        // Assign wall objects from GridManager
        const topLeft = { x: cell.col, y: cell.row };
        const topRight = { x: cell.col + 1, y: cell.row };
        const bottomLeft = { x: cell.col, y: cell.row + 1 };
        const bottomRight = { x: cell.col + 1, y: cell.row + 1 };
        cell.walls = {
            top: gridManager.getOrCreateWall(gridManager.wallsMap, topLeft, topRight),
            right: gridManager.getOrCreateWall(gridManager.wallsMap, topRight, bottomRight),
            bottom: gridManager.getOrCreateWall(gridManager.wallsMap, bottomLeft, bottomRight),
            left: gridManager.getOrCreateWall(gridManager.wallsMap, topLeft, bottomLeft),
        };

        // Determine wall activity for each wall
        cell.wallActive = {
            top: this.isWallActive(cell, 'top'),
            right: this.isWallActive(cell, 'right'),
            bottom: this.isWallActive(cell, 'bottom'),
            left: this.isWallActive(cell, 'left'),
        };

        return cell;
    }

    isWallActive(cell, side) {
        // Helper to determine if wall is active based on state and even/odd
        function wallLogic(state, even) {
            if (state == 0) return even;
            if (state == 1) return !even;
            return false;
        }
        if (side === 'top') {
            const state = CONFIG.DOWN_STATE[cell.row];
            return wallLogic(state, cell.col % 2 === 0);
        }
        if (side === 'bottom') {
            const state = CONFIG.DOWN_STATE[cell.row + 1];
            return wallLogic(state, cell.col % 2 === 0);
        }
        if (side === 'left') {
            const state = CONFIG.ACROSS_STATE[cell.col];
            return wallLogic(state, cell.row % 2 === 0);
        }
        if (side === 'right') {
            const state = CONFIG.ACROSS_STATE[cell.col + 1];
            return wallLogic(state, cell.row % 2 === 0);
        }
        return false;
    }

    setAlive(cell, alive = true) {
        cell.alive = alive;
        cell.div.classList.toggle('alive', alive);
    }

    getOrthogonalNeighbors(cell, cells) {
        // Returns neighbors in up, down, left, right directions
        const neighbors = [];
        const { row, col } = cell;
        const across = CONFIG.CELLSACROSS;
        const down = CONFIG.CELLSDOWN;
        // Up
        if (row > 0) neighbors.push(cells[(row - 1) * across + col]);
        // Down
        if (row < down - 1) neighbors.push(cells[(row + 1) * across + col]);
        // Left
        if (col > 0) neighbors.push(cells[row * across + (col - 1)]);
        // Right
        if (col < across - 1) neighbors.push(cells[row * across + (col + 1)]);
        return neighbors;
    }

    canBecomeAlive(cell, neighbor) {
        // Returns true if there is no active wall between cell and neighbor
        if (cell.row === neighbor.row) {
            // Horizontal neighbor
            if (cell.col < neighbor.col) {
                // neighbor is to the right
                return !cell.wallActive.right;
            } else {
                // neighbor is to the left
                return !cell.wallActive.left;
            }
        } else if (cell.col === neighbor.col) {
            // Vertical neighbor
            if (cell.row < neighbor.row) {
                // neighbor is below
                return !cell.wallActive.bottom;
            } else {
                // neighbor is above
                return !cell.wallActive.top;
            }
        }
        return false;
    }

}