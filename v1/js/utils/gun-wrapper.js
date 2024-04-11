// This file acts as a bridge between the Gun global variable and ES Modules.
// Check if Gun is loaded globally
const Gun = window.Gun;

// Ensure Gun is loaded. This might be via a <script> tag in your HTML.
if (typeof Gun === 'undefined') {
    throw new Error('Gun is not loaded. Please include Gun before this script.');
  }
  
  // Export the Gun global variable as a named export
  export { Gun };
  