import { CONFIG } from "./CONFIG.js";
import { CellManager } from "./CellManager.js";

export class GridManager {
  constructor() {
    this.cellManager = new CellManager();
    this.wallsMap = new Map();
    this.cells = [];
    this.init();
  }

  init() {
    this.gridContainer = document.getElementById("grid-container");
    this.createGrid();
  }

  isWallActive(cellIndex, side) {
    const cell = this.cells[cellIndex];
    const wall = cell.walls[side];
    return wall ? wall.active : false;
  }
  makeWallKey(a, b) {
    // Compare by y first, then x for deterministic ordering
    if (a.y < b.y || (a.y === b.y && a.x < b.x)) {
      return `${a.x},${a.y}|${b.x},${b.y}`;
    }
    return `${b.x},${b.y}|${a.x},${a.y}`;
  }

  getOrCreateWall(wallsMap, start, end) {
    const key = this.makeWallKey(start, end);

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
    this.gridContainer.style.gridTemplateColumns = `repeat(${CONFIG.CELLSACROSS},${CONFIG.CELLSIZE}px)`;
    this.gridContainer.style.gridTemplateRows = `repeat(${CONFIG.CELLSDOWN},${CONFIG.CELLSIZE}px)`;

    this.gridContainer.innerHTML = "";

    const across = CONFIG.CELLSACROSS;
    const down = CONFIG.CELLSDOWN;
    // Normal cells
    for (let i = 0; i < across * down; i++) {
      const cell = this.cellManager.createCell(i, this);
      this.cells.push(cell);
      this.gridContainer.appendChild(cell.div);
    }

    // Visualize the last row of vertices (bottom edge)
    for (let c = 0; c < across; c++) {
      const fakeIndex = down * across + c;
      const cell = {
        div: document.createElement("div"),
        row: down,
        col: c,
      };
      cell.div.classList.add("cell", "edge-cell");
      // Only bottom wall
      if (this.cellManager.isWallActive(cell, 'bottom')) {
        cell.div.classList.add("wall-bottom-active");
      }
      this.gridContainer.appendChild(cell.div);
    }

    // Visualize the last column of vertices (right edge)
    for (let r = 0; r < down; r++) {
      const fakeIndex = r * (across + 1) + across;
      const cell = {
        div: document.createElement("div"),
        row: r,
        col: across,
      };
      cell.div.classList.add("cell", "edge-cell");
      // Only right wall
      if (this.cellManager.isWallActive(cell, 'right')) {
        cell.div.classList.add("wall-right-active");
      }
      this.gridContainer.appendChild(cell.div);
    }

    // Region-labeling: alive/dead regions alternate across walls
    if (this.cells.length > 0) {
      this.labelRegions();
    }

  }

  labelRegions() {
    // Assign region IDs to all cells using BFS
    let regionCounter = 0;
    const visited = new Set();
    const across = CONFIG.CELLSACROSS;
    const down = CONFIG.CELLSDOWN;
    // First pass: label regions
    for (const cell of this.cells) {
      if (visited.has(cell.index)) continue;
      // Start BFS for a new region
      const queue = [cell];
      while (queue.length > 0) {
        const curr = queue.shift();
        if (visited.has(curr.index)) continue;
        visited.add(curr.index);
        curr.regionId = regionCounter;
        curr.div.classList.add(`region-${regionCounter}`);
        // Explore neighbors not separated by a wall
        const neighbors = this.cellManager.getOrthogonalNeighbors(curr, this.cells);
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor.index) && this.cellManager.canBecomeAlive(curr, neighbor)) {
            queue.push(neighbor);
          }
        }
      }
      regionCounter++;
    }

    // Second pass: propagate alive/dead state to regions using wall crossing parity
    // Build region adjacency graph (regions connected by a wall)
    const regionAdj = new Map(); // regionId -> Set of neighbor regionIds
    for (const cell of this.cells) {
      const neighbors = this.cellManager.getOrthogonalNeighbors(cell, this.cells);
      for (const neighbor of neighbors) {
        if (cell.regionId !== neighbor.regionId) {
          if (!regionAdj.has(cell.regionId)) regionAdj.set(cell.regionId, new Set());
          regionAdj.get(cell.regionId).add(neighbor.regionId);
        }
      }
    }
    // BFS from region 0, toggling alive/dead on each wall crossing
    const regionAlive = {};
    const queue = [{ regionId: this.cells[0].regionId, alive: true }];
    const regionVisited = new Set();
    while (queue.length > 0) {
      const { regionId, alive } = queue.shift();
      if (regionVisited.has(regionId)) continue;
      regionVisited.add(regionId);
      regionAlive[regionId] = alive;
      const neighbors = regionAdj.get(regionId) || [];
      for (const neighborId of neighbors) {
        if (!regionVisited.has(neighborId)) {
          queue.push({ regionId: neighborId, alive: !alive });
        }
      }
    }
    // Assign alive/dead to cells
    for (const cell of this.cells) {
      this.cellManager.setAlive(cell, !!regionAlive[cell.regionId]);
    }
  }

  setRegionAlive(regionId) {
    for (const cell of this.cells) {
      if (cell.regionId === regionId) {
        this.cellManager.setAlive(cell, true);
      } else {
        this.cellManager.setAlive(cell, false);
      }
    }
  }
  // propagateAlive removed; region labeling now handles alive/dead state
}
