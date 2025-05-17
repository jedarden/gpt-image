// Jest global setup for frontend tests
// Mocks URL.createObjectURL to prevent jsdom errors in tests

if (typeof global.URL === 'undefined') {
  global.URL = {};
}

if (!global.URL.createObjectURL) {
  global.URL.createObjectURL = function () {
    return 'mocked-object-url';
  };
}
// Mock HTMLCanvasElement.getContext to resolve jsdom canvas limitations in tests
if (typeof HTMLCanvasElement !== 'undefined') {
  // Always override getContext to ensure it returns a non-null stub object for any context type.
  HTMLCanvasElement.prototype.getContext = function (...args) {
    // Comprehensive mock context for canvas (all methods are no-ops, always non-null)
    const noop = () => {};
    return {
      // Drawing methods
      fillRect: noop,
      clearRect: noop,
      strokeRect: noop,
      drawImage: noop,
      fillText: noop,
      strokeText: noop,
      beginPath: noop,
      closePath: noop,
      moveTo: noop,
      lineTo: noop,
      bezierCurveTo: noop,
      quadraticCurveTo: noop,
      arc: noop,
      arcTo: noop,
      ellipse: noop,
      rect: noop,
      fill: noop,
      stroke: noop,
      clip: noop,
      isPointInPath: () => false,
      isPointInStroke: () => false,
      // State methods
      save: noop,
      restore: noop,
      // Transformations
      scale: noop,
      rotate: noop,
      translate: noop,
      transform: noop,
      setTransform: noop,
      resetTransform: noop,
      // Image data
      getImageData: () => ({ data: [], width: 0, height: 0 }),
      putImageData: noop,
      createImageData: (...args) => ({ data: [], width: args[0] || 0, height: args[1] || 0 }),
      // Style and compositing
      setLineDash: noop,
      getLineDash: () => [],
      setLineDashOffset: noop,
      // Text
      measureText: () => ({ width: 0, actualBoundingBoxLeft: 0, actualBoundingBoxRight: 0 }),
      // Misc
      createLinearGradient: () => ({ addColorStop: noop }),
      createRadialGradient: () => ({ addColorStop: noop }),
      createPattern: () => ({}),
      // Properties (stubs)
      canvas: {},
      // Add any additional commonly used methods as needed
    };
  };
}