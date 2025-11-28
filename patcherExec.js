import config from './config_trains.js';

/**
 * patcherExec
 * Required by Kronifer's SubwayBuilder Patcher.
 * * @param {Object} fileContents - Dictionary containing filenames/content and resource paths.
 * @returns {Object} The modified fileContents dictionary.
 */
export function patcherExec(fileContents) {
  console.log("[addTrains] Executing patcherExec...");

  // Iterate over the dictionary to find the correct files by their dynamic names
  fileContents.INDEX = patchIndexContent(fileContents.INDEX, config);
  fileContents.GAMEMAIN = patchGameMainContent(fileContents.GAMEMAIN, config);

  console.log("Successfully patched trains according to config_trains.js");
  return fileContents;
}

// -----------------------------------------------------------
// STEP 0: VALIDATE CONFIGURATION
// Prevents broken game states/crashes before patching starts.
// -----------------------------------------------------------

try {
  validateConfig(config);
} catch (error) {
  console.error("");
  console.error("CONFIG VALIDATION FAILED FOR addTrains.");
  console.error("Please fix the errors in config_trains.js and try again.");
  console.error("");
  console.error(error.message);
  throw error;
}


// ==================================================
// LOGIC FUNCTIONS (Core implementation)
// ==================================================

function patchIndexContent(text, config) {
  let newText = text;
  let changed = false;

  // 1. OVERWRITE TRAIN_TYPES
  const reTrain = /const TRAIN_TYPES\s*=\s*\{[\s\S]*?\};/;
  if (reTrain.test(newText)) {
    // We use config.trains directly as requested
    const jsonString = JSON.stringify(config.trains, null, 0);
    newText = newText.replace(reTrain, `const TRAIN_TYPES = ${jsonString};`);
    changed = true;
    console.log(`  -> Replaced TRAIN_TYPES`);
  }

  // 2. FORCE STATION COMPATIBILITY
  const allTrainKeys = Object.keys(config.trains);
  const reStationTracks = /(["']?compatibleTrackTypes["']?)\s*:\s*\[([^\]]*)\]/g;
  
  if (reStationTracks.test(newText)) {
    newText = newText.replace(reStationTracks, (match, prefix, content) => {
      let items = [];
      if (content.trim().length > 0) {
        items = content.split(',').map(s => s.trim().replace(/['"]/g, ''));
      }
      const missingKeys = allTrainKeys.filter(k => !items.includes(k));
      if (missingKeys.length === 0) return match; 
      
      const newItemsString = missingKeys.map(k => `"${k}"`).join(",");
      const separator = (content.trim().length > 0) ? "," : "";
      return `${prefix}:[${content}${separator}${newItemsString}]`;
    });
    // Regex runs multiple times, so we assume change if TRAIN_TYPES worked
  }

  // 3. PATCH COST CALCULATIONS
  // Filter out default types to inject only new ones
  const customTrainKeys = allTrainKeys.filter(k => k !== "heavy-metro" && k !== "light-metro");

  if (customTrainKeys.length > 0) {
    // Cost Pattern A (Elevation)
    const reCostObj = /"light-metro"\s*:\s*\{\s*"total"\s*:\s*0,\s*"byElevation"\s*:\s*([a-zA-Z0-9_]+)\(\)\s*\}/g;
    newText = newText.replace(reCostObj, (match, funcName) => {
      const injections = customTrainKeys.map(k => `,"${k}":{"total":0,"byElevation":${funcName}()}`).join("");
      console.log(`  -> Injected Cost Calculation (Elevation)`);
      return match + injections;
    });

    // Cost Pattern B (Count)
    const reCountObj = /"light-metro"\s*:\s*\{\s*"total"\s*:\s*0,\s*"count"\s*:\s*0\s*\}/g;
    newText = newText.replace(reCountObj, (match) => {
      const injections = customTrainKeys.map(k => `,"${k}":{"total":0,"count":0}`).join("");
      console.log(`  -> Injected Cost Calculation (Count)`);
      return match + injections;
    });
  }

  return newText;
}

function patchGameMainContent(text, config) {
  // 4. FIX ROAD COLLISIONS
  // Extract allowed keys from config.trains
  const allowedKeys = [];
  for (const [key, value] of Object.entries(config.trains)) {
    if (value.canCrossRoads === true) allowedKeys.push(key);
  }
  if (allowedKeys.length === 0) return text;

  if (text.includes("Dynamic Road Collision Patch")) return text;

  const conditions = allowedKeys.map(k => `(__t && __t.trackType === '${k}')`).join(" || ");
  const snippet = `
  // Dynamic Road Collision Patch
  if (Array.isArray(arguments[0]) && arguments[0].length > 0) {
    var __t = arguments[0][0];
    if (${conditions}) {
      return { "isValid": !![] };
    }
  }
  `;

  const re = /function validateRoadCollision\([^)]*\)\s*\{/;
  if (!re.test(text)) return text;

  console.log(`  -> Patched Road Collision Logic`);
  return text.replace(re, (match) => match + "\n" + snippet);
}

// ==================================================
// VALIDATION LOGIC
// ==================================================
// --- VALIDATION LOGIC ---
function validateConfig(config) {
  if (!config || typeof config !== "object") {
    throw new Error(
      "Config is missing or invalid. Make sure config_trains.js exports a config object."
    );
  }

  if (!config.trains || typeof config.trains !== "object") {
    throw new Error(
      "Missing 'trains' in config. Make sure config_trains.js has a 'trains' object."
    );
  }

  for (const [key, t] of Object.entries(config.trains)) {
    const trainLabel = t?.id || t?.name || key;

    // Top-level required fields (canCrossRoads is optional)
    const missingTop = [];
    if (!t.id) missingTop.push("id");
    if (!t.name) missingTop.push("name");
    if (!t.description) missingTop.push("description");
    if (!t.stats) missingTop.push("stats");
    if (!t.compatibleTrackTypes) missingTop.push("compatibleTrackTypes");
    if (!t.appearance) missingTop.push("appearance");

    if (missingTop.length > 0) {
      throw new Error(
        `Missing fields: '${missingTop.join(", ")}' in '${trainLabel}'.`
      );
    }

    // Stats object must exist and be an object
    const s = t.stats;
    if (!s || typeof s !== "object") {
      throw new Error(
        `Invalid or missing 'stats' object in '${trainLabel}'.`
      );
    }

    // Required stats fields
    const requiredStats = [
      "maxAcceleration",
      "maxDeceleration",
      "maxSpeed",
      "maxSpeedLocalStation",
      "capacityPerCar",
      "carLength",
      "minCars",
      "maxCars",
      "carsPerCarSet",
      "carCost",
      "trainWidth",
      "minStationLength",
      "maxStationLength",
      "baseTrackCost",
      "baseStationCost",
      "trainOperationalCostPerHour",
      "carOperationalCostPerHour",
      "scissorsCrossoverCost",
    ];

    const missingStats = requiredStats.filter(
      (field) => s[field] === undefined || s[field] === null
    );

    if (missingStats.length > 0) {
      throw new Error(
        `Missing stats: '${missingStats.join(", ")}' in '${trainLabel}'.`
      );
    }

    // Logical checks between numeric stats
    const requiredGap = 2;
    const carLength = s.carLength;
    const maxCars = s.maxCars;
    const minStationLength = s.minStationLength;
    const maxStationLength = s.maxStationLength;

    const len = carLength * maxCars;

    // minCars should not be larger than maxCars
    if (s.minCars > s.maxCars) {
      throw new Error(
        `minCars (${s.minCars}) is greater than maxCars (${s.maxCars}) in '${trainLabel}'.`
      );
    }

    // minStationLength must be at least carLength * maxCars + 2
    const minRequiredMinStation = len + requiredGap;
    if (minStationLength < minRequiredMinStation) {
      throw new Error(
        `Make sure minStationLength on '${trainLabel}' is at least ${minRequiredMinStation}. ` +
          `(current minStationLength=${minStationLength}, train length=${len}; carLength=${carLength}, maxCars=${maxCars}).`
      );
    }

    // maxStationLength must be at least 10m longer than minStationLength
    if (maxStationLength < minStationLength + requiredGap) {
      const suggestedMaxStation = minStationLength + requiredGap;
      throw new Error(
        `maxStationLength must be at least ${requiredGap}m longer than minStationLength. Look at '${trainLabel}'. ` +
          `With your current values (minStationLength=${minStationLength}, maxStationLength=${maxStationLength}), ` +
          `maxStationLength should be at least ${suggestedMaxStation}.`
      );
    }

    // Train length must not exceed maxStationLength
    if (len > maxStationLength) {
      throw new Error(
        `Max train length (${len}) is greater than maxStationLength (${maxStationLength}) for '${trainLabel}'. ` +
          `Increase maxStationLength or reduce maxCars/carLength to avoid crashes.`
      );
    }

    // Warnings about compatibleTrackTypes
    if (!Array.isArray(t.compatibleTrackTypes)) {
      console.warn(
        `Warning: 'compatibleTrackTypes' for '${trainLabel}' is not an array( not in [""] ) – skipping detailed track type check.`
      );
    } else if (!t.compatibleTrackTypes.includes(t.id)) {
      console.warn(
        `Warning: ID '${t.id}' is not listed in compatibleTrackTypes for '${trainLabel}'.`
      );
    }
  }
}
