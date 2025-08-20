import { CONFIG } from "./CONFIG.js";

export class GridManager {

    constructor(cellManager) {
        this.cellManager = cellManager;
        this.wallsMap = new Map();
        this.cells = [];

        this.init()
    }

    init() {
        this.gridContainer = document.getElementById('grid-container');
        this.createGrid();
        console.log(`across: ${CONFIG.ACROSS_STATE}`)
        console.log(`down: ${CONFIG.DOWN_STATE}`)
    }

    getOrCreateWall(wallsMap, start, end) {
        const key = makeWallKey(start, end);

        if (!wallsMap.has(key)) {
            wallsMap.set(key, {
                start,
                end,
                active: false,
            });
        }

        return wallsMap.get(key);
    }


    createGrid() {
        this.gridContainer.style.gridTemplateColumns = `repeat(${CONFIG.CELLSACROSS},${CONFIG.CELLSIZE}px)`
        this.gridContainer.style.gridTemplateRows = `repeat(${CONFIG.CELLSDOWN},${CONFIG.CELLSIZE}px)`

        this.gridContainer.innerHTML = "";



        for (let r = 0; r < CONFIG.CELLSACROSS; r++) {
            for (let c = 0; c < CONFIG.CELLSDOWN; i++) {
                const topLeft = { x: c, y: r };
                const topRight = { x: c + 1, y: r };
                const bottomLeft = { x: c, y: r + 1 };
                const bottomRight = { x: c + 1, y: r + 1 };

                const cell = {
                    div: document.createElement("div"),
                    row: r,
                    col: c,
                    walls: {
                        top: this.getOrCreateWall(this.wallsMap, topLeft, topRight),
                        right: this.getOrCreateWall(this.wallsMap, topRight, bottomRight),
                        bottom: this.getOrCreateWall(this.wallsMap, bottomLeft, bottomRight),
                        left: this.cellManagergetOrCreateWall(wallsMap, topLeft, bottomLeft),
                    },
                }
                this.cell.push(cell)
                this.gridContainer.appendChild(cell.div);
            }
        }
    }
}