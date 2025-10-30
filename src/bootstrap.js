import './ui-utils.js';
import { API } from './api.js';
// ensure window.API (already set by api.js) and showSimulatorBadge (ui-utils) are available
window.API = API;

import { exportEntityCSV, exportAllJSON } from './export.js';
// expose convenience functions for inline code
window.exportCSV = exportEntityCSV;
window.exportAllJSON = exportAllJSON;
