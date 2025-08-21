export const CONFIG = (() => {
  const CELLSIZE = 15;
  let CELLSACROSS = 15;
  let CELLSDOWN = 15;

  let acrossState = null;
  let downState = null;
  let initialized = false;

  // Numeric control additions
  let useNumericControl = false;
  let acrossStateNumber = 0n;
  let downStateNumber = 0n;

  return {
    CELLSIZE,
    get CELLSACROSS() { return CELLSACROSS; },
    get CELLSDOWN() { return CELLSDOWN; },
    setGridSize(across, down) {
      CELLSACROSS = across;
      CELLSDOWN = down;
      initialized = false;
      acrossState = null;
      downState = null;
    },

    init() {
      if (!initialized) {
        acrossState = Array.from({ length: CELLSACROSS }, () => Math.floor(Math.random() * 2));
        downState = Array.from({ length: CELLSDOWN }, () => Math.floor(Math.random() * 2));
        initialized = true;
      }
    },

    // Numeric control API
    setNumericControl(enabled) {
      useNumericControl = enabled;
    },
    setAcrossStateNumber(num) {
      // Accept both Number and BigInt
      acrossStateNumber = typeof num === 'bigint' ? num : BigInt(num);
    },
    setDownStateNumber(num) {
      downStateNumber = typeof num === 'bigint' ? num : BigInt(num);
    },
    get acrossStateNumber() {
      return acrossStateNumber;
    },
    get downStateNumber() {
      return downStateNumber;
    },

    get ACROSS_STATE() {
      if (useNumericControl) {
        // Convert BigInt to binary array, pad to CELLSACROSS
        let bin = acrossStateNumber.toString(2).padStart(CELLSACROSS, '0');
        return Array.from(bin).map(Number);
      } else {
        if (!initialized) this.init();
        return acrossState;
      }
    },

    get DOWN_STATE() {
      if (useNumericControl) {
        let bin = downStateNumber.toString(2).padStart(CELLSDOWN, '0');
        return Array.from(bin).map(Number);
      } else {
        if (!initialized) this.init();
        return downState;
      }
    }
  };
})();
