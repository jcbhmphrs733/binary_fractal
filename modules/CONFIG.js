export const CONFIG = (() => {
  const CELLSIZE = 60;
  const CELLSACROSS = 5;
  const CELLSDOWN = 5;

  let acrossState = null;
  let downState = null;
  let initialized = false;

  return {
    CELLSIZE,
    CELLSACROSS,
    CELLSDOWN,

    init() {
      if (!initialized) {
        acrossState = Array.from({ length: CELLSACROSS }, () => Math.floor(Math.random() * 2));
        downState = Array.from({ length: CELLSDOWN }, () => Math.floor(Math.random() * 2));
        initialized = true;
      }
    },

    get ACROSS_STATE() {
      if (!initialized) this.init();
      return acrossState;
    },

    get DOWN_STATE() {
      if (!initialized) this.init();
      return downState;
    }
  };
})();
