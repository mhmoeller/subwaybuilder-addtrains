// index.js – AddTrains mod
// For Subway Builder v0.10.3+

(function () {
    if (window.__AddTrainsModInitialized) return;
    window.__AddTrainsModInitialized = true;

    // --------------------------------------------------
    // CONFIGURATION: MAIN BUTTON POSITION & APPEARANCE
    // --------------------------------------------------
    const UI_BTN_CONFIG = {
        // Positioning
        align: "center",           // "left", "center" or "right"
        vertical: "center",       // "top", "center" or "bottom"
        bottom: "70px",           // Distance from bottom (when vertical="bottom")
        top: "20px",              // Distance from top (when vertical="top")
        offsetX: "0px",           // Additional horizontal offset
		offsetY: "230px",
        
        // Appearance
        icon: "custom",            // "train", "settings", "plus", or "custom"
        customIcon: "↝",           // Custom SVG icon if icon="custom"
        text: " Add Trains Mod",       // Button text
        backgroundColor: "white",      // Leave empty for default
        textColor: "black",            // Leave empty for default
        borderColor: "",          // Leave empty for default
        hoverEffect: false,        // Enable hover effect
        
        // Size
        width: "385px",            // Button width
        height: "45px",           // Button height
        scale: "1.0",             // Scale factor
        fontSize: "38px",         // Font size
        
        // Advanced
        zIndex: "99990",          // Z-index
        hideInGame: true          // Auto-hide when game is running
    };

    // --------------------------------------------------
    // STYLING
    // --------------------------------------------------
    function injectStyles() {
        if (document.getElementById("addtrains-style")) return;
        const style = document.createElement("style");
        style.id = "addtrains-style";
        style.textContent = `
            :root {
                --background: 0 0% 3.9%;
                --foreground: 0 0% 98%;
                --card: 0 0% 3.9%;
                --border: 0 0% 14.9%;
                --primary: 0 0% 98%;
                --primary-fg: 0 0% 9%;
                --muted: 0 0% 14.9%;
                --muted-fg: 0 0% 63.9%;
                --accent: 0 0% 14.9%;
                --accent-fg: 0 0% 98%;
                --font-main: 'TeX Gyre Heros', 'Inter', sans-serif;
            }

            .at-overlay {
                font-family: var(--font-main);
                background-color: hsl(var(--background) / 0.95);
                color: hsl(var(--foreground));
                position: fixed; inset: 0; z-index: 99998;
                display: flex; justify-content: center; align-items: center;
                backdrop-filter: blur(4px);
            }

            .at-panel {
                background-color: hsl(var(--card));
                border: 1px solid hsl(var(--border));
                border-radius: 8px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                width: 850px; max-height: 85vh;
                display: flex; flex-direction: column;
                overflow: hidden;
            }

            .at-header {
                padding: 16px 24px;
                border-bottom: 1px solid hsl(var(--border));
                display: flex; justify-content: space-between; align-items: center;
                background-color: hsl(var(--muted) / 0.3);
            }
            .at-header h2 { font-weight: 700; font-size: 1.25rem; margin: 0; }

            .at-tabs {
                display: flex; border-bottom: 1px solid hsl(var(--border));
                background-color: hsl(var(--background));
            }
            .at-tab {
                flex: 1; padding: 12px;
                background: none; border: none;
                color: hsl(var(--muted-fg));
                font-family: var(--font-main);
                font-weight: 600; cursor: pointer;
                transition: all 0.2s;
                border-bottom: 2px solid transparent;
            }
            .at-tab:hover { color: hsl(var(--foreground)); background-color: hsl(var(--accent)); }
            .at-tab.active { 
                color: hsl(var(--foreground)); 
                border-bottom-color: hsl(var(--primary));
            }

            .at-content {
                padding: 24px; overflow-y: auto; flex: 1;
            }

            .at-footer {
                padding: 16px 24px;
                border-top: 1px solid hsl(var(--border));
                background-color: hsl(var(--muted) / 0.3);
                display: flex; justify-content: space-between; align-items: center;
            }

            /* Components */
            .at-btn {
                display: inline-flex; align-items: center; justify-content: center;
                border-radius: 6px; font-weight: 500; font-size: 0.875rem;
                padding: 8px 16px; cursor: pointer; transition: all 0.2s;
                border: 1px solid transparent;
            }
            .at-btn-primary {
                background-color: hsl(var(--primary)); color: hsl(var(--primary-fg));
            }
            .at-btn-primary:hover { opacity: 0.9; }
            
            .at-btn-secondary {
                background-color: hsl(var(--secondary)); color: hsl(var(--foreground));
                border-color: hsl(var(--border));
            }
            .at-btn-secondary:hover { background-color: hsl(var(--accent)); }

            .at-btn-danger {
                background-color: #7f1d1d; color: #fee2e2;
                border: 1px solid #991b1b;
            }
            .at-btn-danger:hover { background-color: #991b1b; }

            .at-btn-ghost {
                background: transparent; color: hsl(var(--muted-fg));
            }
            .at-btn-ghost:hover { color: hsl(var(--foreground)); background-color: hsl(var(--accent)); }

            .at-input, .at-select {
                width: 100%; padding: 8px 12px;
                border-radius: 6px;
                border: 1px solid hsl(var(--border));
                background-color: hsl(var(--background));
                color: hsl(var(--foreground));
                font-family: var(--font-main);
                font-size: 0.875rem;
                margin-top: 4px;
            }
            .at-input:focus, .at-select:focus {
                outline: 2px solid hsl(var(--ring));
                border-color: transparent;
            }

            .at-card {
                background-color: hsl(var(--card));
                border: 1px solid hsl(var(--border));
                border-radius: 6px; padding: 12px;
                margin-bottom: 8px;
            }

            /* Custom Grid for lists */
            .at-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .at-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }

            .at-badge {
                padding: 2px 6px; border-radius: 4px;
                font-size: 0.75rem; font-weight: 700;
                background-color: hsl(var(--muted)); color: hsl(var(--muted-fg));
            }

            /* Main Menu Button Style */
            .at-menu-btn {
                position: fixed;
                z-index: ${UI_BTN_CONFIG.zIndex};
                background-color: ${UI_BTN_CONFIG.backgroundColor || 'hsl(var(--card))'};
                color: ${UI_BTN_CONFIG.textColor || 'hsl(var(--foreground))'};
                border: 1px solid ${UI_BTN_CONFIG.borderColor || 'hsl(var(--border))'};
                border-radius: 0px;
                padding: 10px 16px;
                font-family: var(--font-main);
                font-weight: 600;
                font-size: ${UI_BTN_CONFIG.fontSize};
                cursor: pointer;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
                display: flex; align-items: center; gap: 8px;
                transition: all 0.2s;
                width: ${UI_BTN_CONFIG.width};
                height: ${UI_BTN_CONFIG.height};
                transform: scale(${UI_BTN_CONFIG.scale});
                ${getButtonPosition()}
            }
			.at-menu-btn:hover {
				background-color: ${UI_BTN_CONFIG.hoverEffect ? 'hsl(var(--accent))' : UI_BTN_CONFIG.backgroundColor || 'hsl(var(--card))'};
				${UI_BTN_CONFIG.hoverEffect && UI_BTN_CONFIG.vertical !== 'center' ? 
					`transform: scale(${UI_BTN_CONFIG.scale}) translateY(-1px);` : 
					UI_BTN_CONFIG.hoverEffect ? 
					`transform: scale(${UI_BTN_CONFIG.scale});` : ''}
			}

            /* Plus button for adding trains */
            .at-add-btn {
                display: flex; align-items: center; justify-content: center;
                width: 100%; padding: 12px;
                border: 2px dashed hsl(var(--border));
                border-radius: 6px;
                background: transparent;
                color: hsl(var(--muted-fg));
                font-family: var(--font-main);
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: 16px;
            }
            .at-add-btn:hover {
                border-color: hsl(var(--primary));
                color: hsl(var(--foreground));
                background-color: hsl(var(--accent) / 0.1);
            }

            /* Debug section in edit panel */
            .at-debug-section {
                margin-top: 24px; padding-top: 16px;
                border-top: 1px solid hsl(var(--border));
            }
            .at-debug-toggle {
                background: transparent; border: none;
                color: hsl(var(--muted-fg)); cursor: pointer;
                font-size: 0.75rem; display: flex; align-items: center; gap: 4px;
            }
            .at-debug-toggle:hover { color: hsl(var(--foreground)); }

            /* Custom train card */
            .at-custom-train {
                position: relative;
                border-left: 4px solid #7c3aed !important;
            }
            .at-custom-badge {
                position: absolute; top: 8px; right: 8px;
                background-color: #7c3aed; color: white;
                padding: 2px 6px; border-radius: 4px;
                font-size: 0.7rem; font-weight: 600;
            }

            /* Delete button */
            .at-delete-btn {
                background: transparent; border: none;
                color: #ef4444; cursor: pointer;
                font-size: 0.75rem; display: flex; align-items: center; gap: 4px;
                padding: 4px 8px;
                border-radius: 4px;
            }
            .at-delete-btn:hover {
                background-color: rgba(239, 68, 68, 0.1);
            }

            /* Scrollbar */
            ::-webkit-scrollbar { width: 8px; }
            ::-webkit-scrollbar-track { background: hsl(var(--background)); }
            ::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 4px; }
            ::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-fg)); }
        `;
        document.head.appendChild(style);
    }

function getButtonPosition() {
    const align = UI_BTN_CONFIG.align || "right";
    const vertical = UI_BTN_CONFIG.vertical || "bottom";
    const offsetX = UI_BTN_CONFIG.offsetX || "0px";
    const offsetY = UI_BTN_CONFIG.offsetY || "0px"; // new
    
    let position = "";
    
    // Horizontal alignment
    if (align === "center") {
        position += `
            left: 50%;
            transform: translateX(-50%) scale(${UI_BTN_CONFIG.scale});
        `;
    } else if (align === "left") {
        position += `
            left: ${offsetX};
            right: auto;
        `;
    } else { // right
        position += `
            right: ${offsetX};
            left: auto;
        `;
    }
    
    // Vertical position
    if (vertical === "top") {
        position += `
            top: ${UI_BTN_CONFIG.top || "20px"};
            bottom: auto;
        `;
    } else if (vertical === "center") {
        // Center vertically
        position += `
            top: 50%;
            bottom: auto;
            transform: ${align === "center" ? 'translate(-50%, -50%)' : 'translateY(-50%)'} scale(${UI_BTN_CONFIG.scale});
        `;
    } else { // bottom
        position += `
            bottom: ${UI_BTN_CONFIG.bottom || "20px"};
            top: auto;
        `;
    }
    
    // Apply offsetY for all vertical positions
    if (vertical !== "center") {
        if (vertical === "top") {
            position = position.replace(`top: ${UI_BTN_CONFIG.top || "20px"};`, 
                `top: calc(${UI_BTN_CONFIG.top || "20px"} + ${offsetY});`);
        } else { // bottom
            position = position.replace(`bottom: ${UI_BTN_CONFIG.bottom || "20px"};`, 
                `bottom: calc(${UI_BTN_CONFIG.bottom || "20px"} + ${offsetY});`);
        }
    } else {
        // For center, we need to adjust with margin-top instead
        position += `margin-top: ${offsetY};`;
    }
    
    return position;
}

    // Icon definitions
    const ICONS = {
        train: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"/>
            <circle cx="12" cy="9" r="2.5"/>
        </svg>`,
        settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>`,
        plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>`,
        list: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
        </svg>`
    };

    // Debug system
    let debugLog = [];
    const MAX_LOG_ENTRIES = 100;

    function debugLogMessage(type, message, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = { timestamp, type, message, data };
        debugLog.unshift(entry);
        if (debugLog.length > MAX_LOG_ENTRIES) debugLog.pop();
        updateDebugPanel();
    }

    // --------------------------------------------------
    // TRAIN DEFINITIONS
    // --------------------------------------------------
    
    // Base elevation multipliers
    const BASE_ELEVATION_MULTIPLIERS = {
        DEEP_BORE: 2.0,
        STANDARD_TUNNEL: 1.5,
        CUT_AND_COVER: 1.2,
        AT_GRADE: 1.0,
        ELEVATED: 1.0
    };

    // Tram-specific
    const TRAM_ELEVATION_MULTIPLIERS = {
        DEEP_BORE: 2.0,
        STANDARD_TUNNEL: 1.5,
        CUT_AND_COVER: 1.2,
        AT_GRADE: 0.3,
        ELEVATED: 1.8
    };

    // Regional
    const REGIONAL_ELEVATION_MULTIPLIERS = {
        DEEP_BORE: 2.5,
        STANDARD_TUNNEL: 2.0,
        CUT_AND_COVER: 1.5,
        AT_GRADE: 0.8,
        ELEVATED: 1.2
    };

    // ALL TRAIN DEFINITIONS
    const ALL_TRAINS = {
        "heavy-metro": {
            id: "heavy-metro",
            name: "Heavy Metro",
            description: "For higher capacity routes. Modeled after the NYC subway's R211 cars.",
            allowAtGradeRoadCrossing: false,
            stats: {
                maxAcceleration: 1.1,
                maxDeceleration: 1.3,
                maxSpeed: 24.72,
                maxSpeedLocalStation: 13,
                capacityPerCar: 240,
                carLength: 15,
                minCars: 5,
                maxCars: 10,
                carsPerCarSet: 5,
                carCost: 2500000,
                trainWidth: 3.05,
                minStationLength: 160,
                maxStationLength: 227,
                baseTrackCost: 50000,
                baseStationCost: 75000000,
                trainOperationalCostPerHour: 500,
                carOperationalCostPerHour: 50,
                scissorsCrossoverCost: 15000000
            },
            elevationMultipliers: BASE_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: ["heavy-metro"],
            appearance: { color: "#2563eb" },
            isFixed: true // Cannot be disabled
        },
        "light-metro": {
            id: "light-metro",
            name: "Light Metro",
            description: "Lighter, more flexible transit for moderate capacity routes. Modeled after Copenhagen AnsaldoBreda.",
            allowAtGradeRoadCrossing: false,
            stats: {
                maxAcceleration: 1.3,
                maxDeceleration: 1.3,
                maxSpeed: 25.0,
                maxSpeedLocalStation: 13.0,
                capacityPerCar: 120,
                carLength: 13,
                minCars: 3,
                maxCars: 6,
                carsPerCarSet: 3,
                carCost: 2500000,
                trainWidth: 2.65,
                minStationLength: 80,
                maxStationLength: 160,
                baseTrackCost: 30000,
                baseStationCost: 50000000,
                trainOperationalCostPerHour: 100,
                carOperationalCostPerHour: 10,
                scissorsCrossoverCost: 12000000
            },
            elevationMultipliers: BASE_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: ["light-metro"],
            appearance: { color: "#10b981" },
            isFixed: true // Cannot be disabled
        },
        "s-train": {
            id: "s-train",
            name: "S-train",
            description: "High-capacity commuter train. Modeled after Copenhagen S-train Litra SE",
            allowAtGradeRoadCrossing: false,
            stats: {
                maxAcceleration: 1.3, // acceleration in m/s^2
                maxDeceleration: 1.2, // braking in m/s^2
                maxSpeed: 33.3, // Speed in m/s
                maxSpeedLocalStation: 13, // speed in m/s through stations
                capacityPerCar: 250, // number of people per car so if 8 cars it's 2000
                carLength: 21, // length in m
                minCars: 4, // minimum number of cars per train
                maxCars: 8, // maximum number of cars per train
                carsPerCarSet: 4, // standard number of cars
                carCost: 3000000, // price per car
                trainWidth: 3.6, // width of train in m
                minStationLength: 180, // make sure this is larger with at least 2 meters longer than your carLength*maxCars
                maxStationLength: 200, // make sure this is at least 10m larger than minStationLength
                baseTrackCost: 50000, // track cost at street level
                baseStationCost: 80000000, // station cost at street level
                trainOperationalCostPerHour: 600, // whole train cost to operate
                carOperationalCostPerHour: 60, // car operation cost
                scissorsCrossoverCost: 15000000 // scissors cost
            },
            elevationMultipliers: BASE_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: ["s-train"],
            appearance: { color: "#c2122b" },
            isFixed: false
        },
        "regional": {
            id: "regional",
            name: "Regional",
            description: "Regional diesel/electric unit for local services. Modelled after the LINT 41",
            allowAtGradeRoadCrossing: true,
            stats: {
                maxAcceleration: 0.6,
                maxDeceleration: 0.9,
                maxSpeed: 33.3,
                maxSpeedLocalStation: 12,
                capacityPerCar: 100,
                carLength: 20,
                minCars: 2,
                maxCars: 4,
                carsPerCarSet: 2,
                carCost: 2000000,
                trainWidth: 2.75,
                minStationLength: 82,
                maxStationLength: 120,
                baseTrackCost: 40000,
                baseStationCost: 60000000,
                trainOperationalCostPerHour: 300,
                carOperationalCostPerHour: 30,
                scissorsCrossoverCost: 10000000
            },
            elevationMultipliers: REGIONAL_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: ["regional"],
            appearance: { color: "#ebd768" },
            isFixed: false
        },
        "intercity": {
            id: "intercity",
            name: "Intercity",
            description: "Fast long-distance train modeled after the Danish IR4.",
            allowAtGradeRoadCrossing: false,
            stats: {
                maxAcceleration: 0.8,
                maxDeceleration: 1.0,
                maxSpeed: 50.0,
                maxSpeedLocalStation: 15,
                capacityPerCar: 130,
                carLength: 26,
                minCars: 2,
                maxCars: 8,
                carsPerCarSet: 2,
                carCost: 4000000,
                trainWidth: 3.1,
                minStationLength: 210,
                maxStationLength: 275,
                baseTrackCost: 60000,
                baseStationCost: 90000000,
                trainOperationalCostPerHour: 700,
                carOperationalCostPerHour: 70,
                scissorsCrossoverCost: 20000000
            },
            elevationMultipliers: BASE_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: ["intercity"],
            appearance: { color: "#222222" },
            isFixed: false
        },
        "tram": {
            id: "tram",
            name: "Tram",
            description: "City tram service modeled after Siemens Avenio.",
            allowAtGradeRoadCrossing: true,
            stats: {
                maxAcceleration: 1.2,
                maxDeceleration: 1.2,
                maxSpeed: 22.22,
                maxSpeedLocalStation: 8.0,
                capacityPerCar: 200,
                carLength: 30,
                minCars: 1,
                maxCars: 2,
                carsPerCarSet: 1,
                carCost: 1500000,
                trainWidth: 2.65,
                minStationLength: 62,
                maxStationLength: 80,
                baseTrackCost: 25000,
                baseStationCost: 20000000,
                trainOperationalCostPerHour: 200,
                carOperationalCostPerHour: 20,
                scissorsCrossoverCost: 5000000
            },
            elevationMultipliers: TRAM_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: ["tram"],
            appearance: { color: "#62b54e" },
            isFixed: false
        }
    };

    // --------------------------------------------------
    // CONFIG MANAGEMENT
    // --------------------------------------------------
    const STORAGE_KEY = 'addtrains_config';
    
    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Default config - all extra trains enabled by default
    const DEFAULT_CONFIG = {
        enabledTrains: Object.keys(ALL_TRAINS).filter(id => !ALL_TRAINS[id].isFixed), // Only extra trains
        customTrains: {}, // User-edited trains
        customTrainCounter: 0, // Counter for custom train IDs
        showEditPanel: false
    };

    function saveConfig(config) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
            debugLogMessage("log", "Config saved");
        } catch (e) {
            debugLogMessage("error", "Could not save config", e);
        }
    }

    function loadConfig() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                debugLogMessage("log", "Config loaded");
                return JSON.parse(saved);
            }
        } catch (e) {
            debugLogMessage("error", "Could not load config", e);
        }
        const defaultConfig = deepClone(DEFAULT_CONFIG);
        saveConfig(defaultConfig);
        return defaultConfig;
    }

    let currentConfig = loadConfig();

    // Get trains for registration
    function getTrainsForRegistration() {
        const config = currentConfig || loadConfig();
        const trains = {};
        
        // Always include fixed trains
        Object.entries(ALL_TRAINS).forEach(([trainId, trainDef]) => {
            if (trainDef.isFixed) {
                // Use custom version if exists, otherwise default
                if (config.customTrains && config.customTrains[trainId]) {
                    trains[trainId] = deepClone(config.customTrains[trainId]);
                } else {
                    trains[trainId] = deepClone(trainDef);
                }
            }
        });
        
        // Include enabled extra trains
        (config.enabledTrains || []).forEach(trainId => {
            if (ALL_TRAINS[trainId] && !ALL_TRAINS[trainId].isFixed) {
                // Use custom version if exists, otherwise default
                if (config.customTrains && config.customTrains[trainId]) {
                    trains[trainId] = deepClone(config.customTrains[trainId]);
                } else {
                    trains[trainId] = deepClone(ALL_TRAINS[trainId]);
                }
            }
        });
        
        // Include custom trains
        if (config.customTrains) {
            Object.entries(config.customTrains).forEach(([trainId, trainDef]) => {
                if (trainId.startsWith('custom-') && config.enabledTrains?.includes(trainId)) {
                    trains[trainId] = deepClone(trainDef);
                }
            });
        }
        
        debugLogMessage("log", `Preparing ${Object.keys(trains).length} trains for registration`);
        return trains;
    }

    // --------------------------------------------------
    // TRAIN REGISTRATION
    // --------------------------------------------------
    function registerTrainsToGame() {
        debugLogMessage("log", "=== REGISTERING TRAINS ===");
        
        const api = window.SubwayBuilderAPI;
        if (!api || !api.trains) {
            debugLogMessage("error", "API not available");
            return false;
        }

        const trainsApi = api.trains;
        const trains = getTrainsForRegistration();
        
        let successCount = 0;
        let failCount = 0;

        // Get existing trains
        let existingTrains = {};
        try {
            if (typeof trainsApi.getTrainTypes === 'function') {
                existingTrains = trainsApi.getTrainTypes() || {};
                debugLogMessage("log", `Found ${Object.keys(existingTrains).length} existing trains`);
            }
        } catch (e) {
            debugLogMessage("warn", "Could not get existing trains", e);
        }

        // Register each train
        Object.entries(trains).forEach(([trainId, trainDef]) => {
            try {
                // Create complete train object
                const completeTrain = {
                    id: trainDef.id,
                    name: trainDef.name,
                    description: trainDef.description || "",
                    allowAtGradeRoadCrossing: trainDef.allowAtGradeRoadCrossing !== undefined 
                        ? trainDef.allowAtGradeRoadCrossing 
                        : false,
                    stats: deepClone(trainDef.stats || {}),
                    elevationMultipliers: deepClone(trainDef.elevationMultipliers || BASE_ELEVATION_MULTIPLIERS),
                    compatibleTrackTypes: trainDef.compatibleTrackTypes || [trainId],
                    appearance: deepClone(trainDef.appearance || { color: "#ffffff" })
                };

                debugLogMessage("log", `Registering: ${trainId}`, {
                    allowAtGradeRoadCrossing: completeTrain.allowAtGradeRoadCrossing,
                    elevationMultipliers: completeTrain.elevationMultipliers
                });

                // Check if exists
                const exists = existingTrains[trainId];
                
                if (exists) {
                    // Try to modify
                    try {
                        if (typeof trainsApi.modifyTrainType === 'function') {
                            trainsApi.modifyTrainType(trainId, completeTrain);
                            debugLogMessage("log", `Modified: ${trainId}`);
                        } else {
                            trainsApi.registerTrainType(completeTrain);
                            debugLogMessage("log", `Registered (fallback): ${trainId}`);
                        }
                    } catch (modifyError) {
                        // If modify fails, try register as new
                        try {
                            trainsApi.registerTrainType(completeTrain);
                            debugLogMessage("log", `Registered (after modify failed): ${trainId}`);
                        } catch (registerError) {
                            throw registerError;
                        }
                    }
                } else {
                    // Register new
                    trainsApi.registerTrainType(completeTrain);
                    debugLogMessage("log", `Registered new: ${trainId}`);
                }
                
                successCount++;
                
            } catch (error) {
                debugLogMessage("error", `Failed: ${trainId}`, error);
                failCount++;
            }
        });

        // Verify
        setTimeout(() => {
            try {
                const finalTrains = trainsApi.getTrainTypes ? trainsApi.getTrainTypes() : {};
                debugLogMessage("log", "=== VERIFICATION ===");
                debugLogMessage("log", `Total trains in game: ${Object.keys(finalTrains).length}`);
                
                Object.keys(trains).forEach(trainId => {
                    if (finalTrains[trainId]) {
                        const train = finalTrains[trainId];
                        debugLogMessage("log", `OK ${trainId}`, {
                            allowAtGradeRoadCrossing: train.allowAtGradeRoadCrossing,
                            hasElevationMultipliers: !!train.elevationMultipliers,
                            elevationMultipliers: train.elevationMultipliers,
                            compatibleTrackTypes: train.compatibleTrackTypes
                        });
                    } else {
                        debugLogMessage("error", `FAILED ${trainId} NOT FOUND`);
                    }
                });
            } catch (e) {
                debugLogMessage("error", "Verification failed", e);
            }
        }, 1000);

        const success = failCount === 0;
        debugLogMessage(success ? "log" : "error", 
            `Registration: ${successCount} OK, ${failCount} failed`);
        return success;
    }

    // --------------------------------------------------
    // OVERLAY UI
    // --------------------------------------------------
    function openOverlay() {
        debugLogMessage("log", "Opening overlay...");
        
        // Close if already open
        closeOverlay();
        
        injectStyles(); // Ensure styles are injected
        
        const overlay = document.createElement("div");
        overlay.className = "at-overlay";
        overlay.id = "addtrains-overlay";
        
        const panel = document.createElement("div");
        panel.className = "at-panel";
        
        // Header
        const header = document.createElement("div");
        header.className = "at-header";
        
        const title = document.createElement("h2");
        title.textContent = "Train Configuration";
        
        const closeBtn = document.createElement("button");
        closeBtn.className = "at-btn at-btn-ghost";
        closeBtn.innerHTML = "&times;";
        closeBtn.style.fontSize = "1.5rem";
        closeBtn.style.padding = "0 8px";
        closeBtn.onclick = closeOverlay;
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // Tabs
        const tabsDiv = document.createElement("div");
        tabsDiv.className = "at-tabs";
        
        const enableTab = document.createElement("button");
        enableTab.className = `at-tab ${!currentConfig.showEditPanel ? 'active' : ''}`;
        enableTab.textContent = "Enable/Disable Trains";
        enableTab.onclick = () => {
            currentConfig.showEditPanel = false;
            saveConfig(currentConfig);
            openOverlay();
        };
        
        const editTab = document.createElement("button");
        editTab.className = `at-tab ${currentConfig.showEditPanel ? 'active' : ''}`;
        editTab.textContent = "Edit Train Stats";
        editTab.onclick = () => {
            currentConfig.showEditPanel = true;
            saveConfig(currentConfig);
            openOverlay();
        };
        
        tabsDiv.appendChild(enableTab);
        tabsDiv.appendChild(editTab);
        
        // Main content area
        const mainContent = document.createElement("div");
        mainContent.className = "at-content";
        
        if (currentConfig.showEditPanel) {
            // EDIT PANEL
            const editTitle = document.createElement("h3");
            editTitle.textContent = "Edit Train Statistics";
            editTitle.style.marginTop = "0";
            editTitle.style.color = "#4ade80";
            editTitle.style.borderBottom = "1px solid hsl(var(--border))";
            editTitle.style.paddingBottom = "10px";
            
            mainContent.appendChild(editTitle);
            
            const editNote = document.createElement("p");
            editNote.innerHTML = "<strong>Note:</strong> Heavy Metro and Light Metro are always enabled. Changes here will be saved automatically.";
            editNote.style.color = "hsl(var(--muted-fg))";
            editNote.style.fontSize = "0.9em";
            editNote.style.marginBottom = "20px";
            editNote.style.padding = "10px";
            editNote.style.background = "hsl(var(--muted) / 0.3)";
            editNote.style.borderRadius = "4px";
            
            mainContent.appendChild(editNote);
            
            // Train selection for editing
            const trainSelectDiv = document.createElement("div");
            trainSelectDiv.style.marginBottom = "20px";
            
            const trainSelect = document.createElement("select");
            trainSelect.className = "at-select";
            trainSelect.id = "train-edit-select";
            
            // Add option for each train (including custom trains)
            const allTrainsForEditing = { ...ALL_TRAINS };
            if (currentConfig.customTrains) {
                Object.entries(currentConfig.customTrains).forEach(([trainId, train]) => {
                    if (trainId.startsWith('custom-')) {
                        allTrainsForEditing[trainId] = train;
                    }
                });
            }
            
            Object.entries(allTrainsForEditing).forEach(([trainId, train]) => {
                const option = document.createElement("option");
                option.value = trainId;
                const prefix = trainId.startsWith('custom-') ? "✎ " : "";
                option.textContent = `${prefix}${train.name} (${trainId})`;
                trainSelect.appendChild(option);
            });
            
            trainSelectDiv.appendChild(trainSelect);
            mainContent.appendChild(trainSelectDiv);
            
            // Edit form will be loaded when train is selected
            const editFormDiv = document.createElement("div");
            editFormDiv.id = "train-edit-form";
            editFormDiv.style.display = "none";
            mainContent.appendChild(editFormDiv);
            
            // Load form when train is selected
            trainSelect.addEventListener("change", function() {
                loadEditForm(this.value, editFormDiv);
            });
            
            // Load first train by default
            if (Object.keys(allTrainsForEditing).length > 0) {
                trainSelect.value = Object.keys(allTrainsForEditing)[0];
                loadEditForm(Object.keys(allTrainsForEditing)[0], editFormDiv);
            }
            
            // Debug section at the bottom
            const debugSection = document.createElement("div");
            debugSection.className = "at-debug-section";
            
            const debugToggle = document.createElement("button");
            debugToggle.className = "at-debug-toggle";
            debugToggle.innerHTML = "Show Debug Panel";
            debugToggle.onclick = toggleDebugPanel;
            
            debugSection.appendChild(debugToggle);
            mainContent.appendChild(debugSection);
            
        } else {
            // ENABLE/DISABLE PANEL
            const enableTitle = document.createElement("h3");
            enableTitle.textContent = "Enable Extra Train Types";
            enableTitle.style.marginTop = "0";
            enableTitle.style.color = "#3b82f6";
            enableTitle.style.borderBottom = "1px solid hsl(var(--border))";
            enableTitle.style.paddingBottom = "10px";
            
            mainContent.appendChild(enableTitle);
            
            const fixedNote = document.createElement("div");
            fixedNote.style.marginBottom = "20px";
            fixedNote.style.padding = "15px";
            fixedNote.style.background = "hsl(var(--muted) / 0.3)";
            fixedNote.style.borderRadius = "6px";
            fixedNote.style.borderLeft = "4px solid #3b82f6";
            
            const fixedTitle = document.createElement("h4");
            fixedTitle.textContent = "Fixed Train Types (Always Enabled)";
            fixedTitle.style.marginTop = "0";
            fixedTitle.style.color = "#3b82f6";
            
            const fixedList = document.createElement("div");
            fixedList.style.display = "grid";
            fixedList.style.gridTemplateColumns = "1fr 1fr";
            fixedList.style.gap = "10px";
            fixedList.style.marginTop = "10px";
            
            Object.entries(ALL_TRAINS).forEach(([trainId, train]) => {
                if (train.isFixed) {
                    const trainItem = document.createElement("div");
                    trainItem.className = "at-card";
                    trainItem.style.borderLeft = `4px solid ${train.appearance.color}`;
                    
                    const trainName = document.createElement("div");
                    trainName.innerHTML = `<strong style="color: ${train.appearance.color}">${train.name}</strong>`;
                    
                    const trainIdSpan = document.createElement("div");
                    trainIdSpan.textContent = trainId;
                    trainIdSpan.style.fontSize = "0.8em";
                    trainIdSpan.style.color = "hsl(var(--muted-fg))";
                    
                    trainItem.appendChild(trainName);
                    trainItem.appendChild(trainIdSpan);
                    fixedList.appendChild(trainItem);
                }
            });
            
            fixedNote.appendChild(fixedTitle);
            fixedNote.appendChild(fixedList);
            mainContent.appendChild(fixedNote);
            
            // Extra trains selection
            const extraTitle = document.createElement("h4");
            extraTitle.textContent = "Extra Train Types";
            extraTitle.style.marginTop = "20px";
            extraTitle.style.color = "#10b981";
            
            mainContent.appendChild(extraTitle);
            
            const checkboxesDiv = document.createElement("div");
            checkboxesDiv.style.display = "grid";
            checkboxesDiv.style.gridTemplateColumns = "repeat(2, 1fr)";
            checkboxesDiv.style.gap = "10px";
            checkboxesDiv.style.marginTop = "15px";
            
            // Predefined extra trains
            Object.entries(ALL_TRAINS).forEach(([trainId, train]) => {
                if (!train.isFixed) {
                    createTrainCheckbox(trainId, train, checkboxesDiv);
                }
            });
            
            // Custom trains
            if (currentConfig.customTrains) {
                Object.entries(currentConfig.customTrains).forEach(([trainId, train]) => {
                    if (trainId.startsWith('custom-')) {
                        createTrainCheckbox(trainId, train, checkboxesDiv, true);
                    }
                });
            }
            
            mainContent.appendChild(checkboxesDiv);
            
            // Add new train button
            const addTrainBtn = document.createElement("button");
            addTrainBtn.className = "at-add-btn";
            addTrainBtn.innerHTML = "+ Add Custom Train Type";
            addTrainBtn.onclick = showAddTrainDialog;
            mainContent.appendChild(addTrainBtn);
            
            // Delete custom trains section
            if (currentConfig.customTrains && Object.keys(currentConfig.customTrains).some(id => id.startsWith('custom-'))) {
                const deleteSection = document.createElement("div");
                deleteSection.style.marginTop = "30px";
                deleteSection.style.paddingTop = "20px";
                deleteSection.style.borderTop = "1px solid hsl(var(--border))";
                
                const deleteTitle = document.createElement("h4");
                deleteTitle.textContent = "Custom Trains Management";
                deleteTitle.style.color = "#ef4444";
                deleteTitle.style.marginTop = "0";
                
                deleteSection.appendChild(deleteTitle);
                
                const deleteInfo = document.createElement("p");
                deleteInfo.textContent = "You can delete custom trains below. This action cannot be undone.";
                deleteInfo.style.fontSize = "0.875rem";
                deleteInfo.style.color = "hsl(var(--muted-fg))";
                deleteInfo.style.marginBottom = "15px";
                
                deleteSection.appendChild(deleteInfo);
                
                // List custom trains for deletion
                const customTrainsGrid = document.createElement("div");
                customTrainsGrid.style.display = "grid";
                customTrainsGrid.style.gridTemplateColumns = "repeat(2, 1fr)";
                customTrainsGrid.style.gap = "10px";
                
                Object.entries(currentConfig.customTrains).forEach(([trainId, train]) => {
                    if (trainId.startsWith('custom-')) {
                        const trainCard = document.createElement("div");
                        trainCard.className = "at-card at-custom-train";
                        
                        const badge = document.createElement("div");
                        badge.className = "at-custom-badge";
                        badge.textContent = "CUSTOM";
                        
                        const trainName = document.createElement("div");
                        trainName.innerHTML = `<strong style="color: ${train.appearance.color}">${train.name}</strong>`;
                        
                        const trainIdSpan = document.createElement("div");
                        trainIdSpan.textContent = trainId;
                        trainIdSpan.style.fontSize = "0.8em";
                        trainIdSpan.style.color = "hsl(var(--muted-fg))";
                        
                        const deleteBtn = document.createElement("button");
                        deleteBtn.className = "at-delete-btn";
                        deleteBtn.innerHTML = "🗑️ Delete";
                        deleteBtn.onclick = (e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${train.name}"? This action cannot be undone.`)) {
                                deleteCustomTrain(trainId);
                            }
                        };
                        deleteBtn.style.marginTop = "8px";
                        
                        trainCard.appendChild(badge);
                        trainCard.appendChild(trainName);
                        trainCard.appendChild(trainIdSpan);
                        trainCard.appendChild(deleteBtn);
                        customTrainsGrid.appendChild(trainCard);
                    }
                });
                
                deleteSection.appendChild(customTrainsGrid);
                mainContent.appendChild(deleteSection);
            }
        }
        
        // Buttons
        const buttonsDiv = document.createElement("div");
        buttonsDiv.className = "at-footer";
        
        const statusDiv = document.createElement("div");
        statusDiv.id = "addtrains-overlay-status";
        statusDiv.style.color = "hsl(var(--muted-fg))";
        statusDiv.style.fontSize = "0.9em";
        
        const actionButtons = document.createElement("div");
        actionButtons.style.display = "flex";
        actionButtons.style.gap = "10px";
        
        const cancelBtn = document.createElement("button");
        cancelBtn.className = "at-btn at-btn-secondary";
        cancelBtn.textContent = "Cancel";
        cancelBtn.onclick = closeOverlay;
        
        const applyBtn = document.createElement("button");
        applyBtn.className = "at-btn at-btn-primary";
        applyBtn.textContent = currentConfig.showEditPanel ? "Save Changes" : "Apply Selection";
        applyBtn.onclick = () => {
            if (currentConfig.showEditPanel) {
                // Save edited train
                saveEditedTrain();
                statusDiv.textContent = "Changes saved!";
                statusDiv.style.color = "#4ade80";
                setTimeout(() => {
                    statusDiv.textContent = "";
                }, 2000);
            } else {
                // Save enabled trains
                const enabledTrains = [];
                
                // Predefined trains
                Object.keys(ALL_TRAINS).forEach(trainId => {
                    if (!ALL_TRAINS[trainId].isFixed) {
                        const checkbox = document.getElementById(`checkbox-${trainId}`);
                        if (checkbox && checkbox.checked) {
                            enabledTrains.push(trainId);
                        }
                    }
                });
                
                // Custom trains
                if (currentConfig.customTrains) {
                    Object.keys(currentConfig.customTrains).forEach(trainId => {
                        if (trainId.startsWith('custom-')) {
                            const checkbox = document.getElementById(`checkbox-${trainId}`);
                            if (checkbox && checkbox.checked) {
                                enabledTrains.push(trainId);
                            }
                        }
                    });
                }
                
                currentConfig.enabledTrains = enabledTrains;
                saveConfig(currentConfig);
                
                // Register trains
                registerTrainsToGame();
                
                statusDiv.textContent = `Applied: ${enabledTrains.length} trains enabled`;
                statusDiv.style.color = "#4ade80";
                
                // Show notification
                const api = window.SubwayBuilderAPI;
                if (api?.ui?.showNotification) {
                    api.ui.showNotification(`${enabledTrains.length} train types enabled`, "success");
                }
                
                setTimeout(() => {
                    closeOverlay();
                }, 1500);
            }
        };
        
        actionButtons.appendChild(cancelBtn);
        actionButtons.appendChild(applyBtn);
        
        buttonsDiv.appendChild(statusDiv);
        buttonsDiv.appendChild(actionButtons);
        
        // Assemble
        panel.appendChild(header);
        panel.appendChild(tabsDiv);
        panel.appendChild(mainContent);
        panel.appendChild(buttonsDiv);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);
        
        // Close on background click
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                closeOverlay();
            }
        });
        
        debugLogMessage("log", "Overlay opened");
    }

    function createTrainCheckbox(trainId, train, container, isCustom = false) {
        const checkboxDiv = document.createElement("div");
        checkboxDiv.style.display = "flex";
        checkboxDiv.style.alignItems = "center";
        checkboxDiv.style.gap = "10px";
        checkboxDiv.style.padding = "10px";
        checkboxDiv.style.background = "hsl(var(--muted) / 0.1)";
        checkboxDiv.style.borderRadius = "6px";
        checkboxDiv.style.borderLeft = `4px solid ${train.appearance.color}`;
        if (isCustom) checkboxDiv.classList.add("at-custom-train");
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `checkbox-${trainId}`;
        checkbox.checked = currentConfig.enabledTrains?.includes(trainId) || false;
        checkbox.style.transform = "scale(1.2)";
        
        const label = document.createElement("label");
        label.htmlFor = `checkbox-${trainId}`;
        
        const labelDiv = document.createElement("div");
        labelDiv.style.flex = "1";
        
        const nameDiv = document.createElement("div");
        const customBadge = isCustom ? '<span style="font-size:0.7em; background:#7c3aed; color:white; padding:1px 4px; border-radius:3px; margin-right:6px;">CUSTOM</span>' : '';
        nameDiv.innerHTML = `${customBadge}<strong style="color: ${train.appearance.color}">${train.name}</strong>`;
        
        const idDiv = document.createElement("div");
        idDiv.textContent = trainId;
        idDiv.style.fontSize = "0.8em";
        idDiv.style.color = "hsl(var(--muted-fg))";
        
        const descDiv = document.createElement("div");
        descDiv.textContent = train.description;
        descDiv.style.fontSize = "0.8em";
        descDiv.style.color = "hsl(var(--muted-fg))";
        descDiv.style.marginTop = "5px";
        
        labelDiv.appendChild(nameDiv);
        labelDiv.appendChild(idDiv);
        labelDiv.appendChild(descDiv);
        
        label.appendChild(labelDiv);
        
        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(label);
        container.appendChild(checkboxDiv);
    }

    function showAddTrainDialog() {
        const dialog = document.createElement("div");
        dialog.className = "at-overlay";
        dialog.style.zIndex = "99999";
        
        const content = document.createElement("div");
        content.className = "at-panel";
        content.style.width = "500px";
        
        const header = document.createElement("div");
        header.className = "at-header";
        header.innerHTML = "<h3>Add Custom Train</h3>";
        
        const body = document.createElement("div");
        body.className = "at-content";
        body.style.padding = "20px";
        
        // Name input
        const nameDiv = document.createElement("div");
        nameDiv.style.marginBottom = "15px";
        nameDiv.innerHTML = `
            <label style="display:block; margin-bottom:5px; color:hsl(var(--foreground))">Train Name</label>
            <input type="text" id="new-train-name" class="at-input" placeholder="Enter train name">
        `;
        
        // Description input
        const descDiv = document.createElement("div");
        descDiv.style.marginBottom = "15px";
        descDiv.innerHTML = `
            <label style="display:block; margin-bottom:5px; color:hsl(var(--foreground))">Description</label>
            <input type="text" id="new-train-desc" class="at-input" placeholder="Enter description">
        `;
        
        // Color picker
        const colorDiv = document.createElement("div");
        colorDiv.style.marginBottom = "15px";
        colorDiv.innerHTML = `
            <label style="display:block; margin-bottom:5px; color:hsl(var(--foreground))">Color</label>
            <input type="color" id="new-train-color" class="at-input" value="#7c3aed">
        `;
        
        body.appendChild(nameDiv);
        body.appendChild(descDiv);
        body.appendChild(colorDiv);
        
        const footer = document.createElement("div");
        footer.className = "at-footer";
        footer.style.justifyContent = "flex-end";
        footer.style.gap = "10px";
        
        const cancelBtn = document.createElement("button");
        cancelBtn.className = "at-btn at-btn-secondary";
        cancelBtn.textContent = "Cancel";
        cancelBtn.onclick = () => document.body.removeChild(dialog);
        
        const createBtn = document.createElement("button");
        createBtn.className = "at-btn at-btn-primary";
        createBtn.textContent = "Create";
        createBtn.onclick = () => {
            const name = document.getElementById("new-train-name").value.trim();
            const desc = document.getElementById("new-train-desc").value.trim();
            const color = document.getElementById("new-train-color").value;
            
            if (!name) {
                alert("Please enter a train name");
                return;
            }
            
            createCustomTrain(name, desc, color);
            document.body.removeChild(dialog);
            openOverlay(); // Refresh the overlay
        };
        
        footer.appendChild(cancelBtn);
        footer.appendChild(createBtn);
        dialog.appendChild(content);
        content.appendChild(header);
        content.appendChild(body);
        content.appendChild(footer);
        document.body.appendChild(dialog);
    }

    function createCustomTrain(name, description, color) {
        const trainId = `custom-train-${Date.now()}`;
        
        const newTrain = {
            id: trainId,
            name: name,
            description: description || "Custom train type",
            allowAtGradeRoadCrossing: false,
            stats: {
                maxAcceleration: 1.0,
                maxDeceleration: 1.0,
                maxSpeed: 20.0,
                maxSpeedLocalStation: 10.0,
                capacityPerCar: 150,
                carLength: 20,
                minCars: 2,
                maxCars: 6,
                carsPerCarSet: 2,
                carCost: 2000000,
                trainWidth: 3.0,
                minStationLength: 100,
                maxStationLength: 150,
                baseTrackCost: 35000,
                baseStationCost: 50000000,
                trainOperationalCostPerHour: 300,
                carOperationalCostPerHour: 30,
                scissorsCrossoverCost: 10000000
            },
            elevationMultipliers: BASE_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: [trainId],
            appearance: { color: color },
            isFixed: false
        };
        
        if (!currentConfig.customTrains) {
            currentConfig.customTrains = {};
        }
        
        currentConfig.customTrains[trainId] = newTrain;
        
        if (!currentConfig.enabledTrains) {
            currentConfig.enabledTrains = [];
        }
        
        currentConfig.enabledTrains.push(trainId);
        saveConfig(currentConfig);
        
        debugLogMessage("log", `Custom train created: ${trainId}`);
        registerTrainsToGame();
    }

    function deleteCustomTrain(trainId) {
        if (!currentConfig.customTrains || !currentConfig.customTrains[trainId]) {
            return;
        }
        
        delete currentConfig.customTrains[trainId];
        
        // Remove from enabled trains
        if (currentConfig.enabledTrains) {
            currentConfig.enabledTrains = currentConfig.enabledTrains.filter(id => id !== trainId);
        }
        
        saveConfig(currentConfig);
        debugLogMessage("log", `Custom train deleted: ${trainId}`);
        
        // Refresh overlay
        openOverlay();
    }

    // Load edit form for a specific train
    function loadEditForm(trainId, container) {
        const train = ALL_TRAINS[trainId] || (currentConfig.customTrains && currentConfig.customTrains[trainId]);
        if (!train) return;
        
        container.innerHTML = "";
        container.style.display = "block";
        
        // Form
        const form = document.createElement("div");
        form.style.display = "grid";
        form.style.gridTemplateColumns = "repeat(2, 1fr)";
        form.style.gap = "15px";
        
        // Basic info
        const basicDiv = document.createElement("div");
        basicDiv.style.gridColumn = "1 / -1";
        basicDiv.style.padding = "15px";
        basicDiv.style.background = "hsl(var(--muted) / 0.1)";
        basicDiv.style.borderRadius = "6px";
        basicDiv.style.marginBottom = "15px";
        basicDiv.style.borderLeft = `4px solid ${train.appearance.color}`;
        
        const basicTitle = document.createElement("h4");
        basicTitle.textContent = "Basic Information";
        basicTitle.style.marginTop = "0";
        basicTitle.style.color = train.appearance.color;
        
        const nameDiv = createFormField("Name", "text", "edit-name", train.name);
        const descDiv = createFormField("Description", "text", "edit-desc", train.description);
        const colorDiv = createFormField("Color", "color", "edit-color", train.appearance.color);
        
        const crossDiv = document.createElement("div");
        crossDiv.style.marginTop = "10px";
        const crossLabel = document.createElement("label");
        crossLabel.style.display = "flex";
        crossLabel.style.alignItems = "center";
        crossLabel.style.gap = "8px";
        crossLabel.style.color = "hsl(var(--foreground))";
        const crossCheck = document.createElement("input");
        crossCheck.type = "checkbox";
        crossCheck.id = "edit-cross";
        crossCheck.checked = train.allowAtGradeRoadCrossing || false;
        crossLabel.appendChild(crossCheck);
        crossLabel.appendChild(document.createTextNode(" Can Cross Roads at Grade"));
        crossDiv.appendChild(crossLabel);
        
        basicDiv.appendChild(basicTitle);
        basicDiv.appendChild(nameDiv);
        basicDiv.appendChild(descDiv);
        basicDiv.appendChild(colorDiv);
        basicDiv.appendChild(crossDiv);
        
        // Stats
        const statsDiv = document.createElement("div");
        statsDiv.style.gridColumn = "1 / -1";
        statsDiv.style.padding = "15px";
        statsDiv.style.background = "hsl(var(--muted) / 0.1)";
        statsDiv.style.borderRadius = "6px";
        
        const statsTitle = document.createElement("h4");
        statsTitle.textContent = "Statistics";
        statsTitle.style.marginTop = "0";
        statsTitle.style.color = "#10b981";
        
        statsDiv.appendChild(statsTitle);
        
        // Create stat fields in a grid
        const statsGrid = document.createElement("div");
        statsGrid.style.display = "grid";
        statsGrid.style.gridTemplateColumns = "repeat(3, 1fr)";
        statsGrid.style.gap = "10px";
        
        const stats = train.stats || {};
        const statFields = [
            { key: "maxSpeed", label: "Max Speed (m/s)", type: "number", step: "0.1" },
            { key: "maxSpeedLocalStation", label: "Station Speed (m/s)", type: "number", step: "0.1" },
            { key: "maxAcceleration", label: "Acceleration", type: "number", step: "0.1" },
            { key: "maxDeceleration", label: "Deceleration", type: "number", step: "0.1" },
            { key: "capacityPerCar", label: "Capacity per Car", type: "number", step: "1" },
            { key: "carLength", label: "Car Length (m)", type: "number", step: "0.1" },
            { key: "minCars", label: "Min Cars", type: "number", step: "1" },
            { key: "maxCars", label: "Max Cars", type: "number", step: "1" },
            { key: "carsPerCarSet", label: "Cars per Set", type: "number", step: "1" },
            { key: "trainWidth", label: "Train Width (m)", type: "number", step: "0.1" },
            { key: "minStationLength", label: "Min Station (m)", type: "number", step: "1" },
            { key: "maxStationLength", label: "Max Station (m)", type: "number", step: "1" },
            { key: "carCost", label: "Car Cost ($)", type: "number", step: "1000" },
            { key: "baseTrackCost", label: "Track Cost ($/m)", type: "number", step: "1000" },
            { key: "baseStationCost", label: "Station Cost ($)", type: "number", step: "10000" },
            { key: "trainOperationalCostPerHour", label: "Train Op Cost ($/h)", type: "number", step: "10" },
            { key: "carOperationalCostPerHour", label: "Car Op Cost ($/h)", type: "number", step: "1" },
            { key: "scissorsCrossoverCost", label: "Scissors Cost ($)", type: "number", step: "1000" }
        ];
        
        statFields.forEach(field => {
            const fieldDiv = createFormField(
                field.label,
                field.type,
                `edit-${field.key}`,
                stats[field.key] || 0,
                field.step
            );
            statsGrid.appendChild(fieldDiv);
        });
        
        statsDiv.appendChild(statsGrid);
        
        // Reset button (only for non-custom trains)
        if (!trainId.startsWith('custom-')) {
            const resetDiv = document.createElement("div");
            resetDiv.style.gridColumn = "1 / -1";
            resetDiv.style.textAlign = "right";
            resetDiv.style.marginTop = "15px";
            
            const resetBtn = document.createElement("button");
            resetBtn.className = "at-btn at-btn-secondary";
            resetBtn.textContent = "Reset to Default";
            resetBtn.onclick = () => {
                if (confirm(`Reset ${train.name} to default values?`)) {
                    // Remove custom version
                    if (currentConfig.customTrains) {
                        delete currentConfig.customTrains[trainId];
                    }
                    saveConfig(currentConfig);
                    loadEditForm(trainId, container); // Reload form
                }
            };
            
            resetDiv.appendChild(resetBtn);
            form.appendChild(resetDiv);
        }
        
        form.appendChild(basicDiv);
        form.appendChild(statsDiv);
        container.appendChild(form);
        
        // Store train ID for saving
        container.dataset.trainId = trainId;
    }

    function createFormField(label, type, id, value, step = null) {
        const div = document.createElement("div");
        
        const labelEl = document.createElement("label");
        labelEl.textContent = label;
        labelEl.style.display = "block";
        labelEl.style.fontSize = "0.9em";
        labelEl.style.color = "hsl(var(--muted-fg))";
        labelEl.style.marginBottom = "5px";
        labelEl.htmlFor = id;
        
        const input = document.createElement("input");
        input.type = type;
        input.id = id;
        input.value = value;
        if (step) input.step = step;
        input.className = "at-input";
        
        div.appendChild(labelEl);
        div.appendChild(input);
        return div;
    }

    function saveEditedTrain() {
        const form = document.getElementById("train-edit-form");
        if (!form || !form.dataset.trainId) return;
        
        const trainId = form.dataset.trainId;
        const originalTrain = ALL_TRAINS[trainId] || (currentConfig.customTrains && currentConfig.customTrains[trainId]);
        
        if (!originalTrain) return;
        
        // Collect data from form
        const editedTrain = {
            id: trainId,
            name: document.getElementById("edit-name").value,
            description: document.getElementById("edit-desc").value,
            allowAtGradeRoadCrossing: document.getElementById("edit-cross").checked,
            stats: {},
            elevationMultipliers: originalTrain.elevationMultipliers || BASE_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: originalTrain.compatibleTrackTypes || [trainId],
            appearance: {
                color: document.getElementById("edit-color").value
            },
            isFixed: originalTrain.isFixed || false
        };
        
        // Collect stats
        const statFields = [
            "maxSpeed", "maxSpeedLocalStation", "maxAcceleration", "maxDeceleration",
            "capacityPerCar", "carLength", "minCars", "maxCars", "carsPerCarSet",
            "trainWidth", "minStationLength", "maxStationLength", "carCost",
            "baseTrackCost", "baseStationCost", "trainOperationalCostPerHour",
            "carOperationalCostPerHour", "scissorsCrossoverCost"
        ];
        
        statFields.forEach(field => {
            const input = document.getElementById(`edit-${field}`);
            if (input) {
                editedTrain.stats[field] = parseFloat(input.value) || 0;
            }
        });
        
        // Save to custom trains
        if (!currentConfig.customTrains) {
            currentConfig.customTrains = {};
        }
        currentConfig.customTrains[trainId] = editedTrain;
        saveConfig(currentConfig);
        
        debugLogMessage("log", `Saved edits for ${trainId}`);
    }

    function closeOverlay() {
        const overlay = document.getElementById("addtrains-overlay");
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }

    // --------------------------------------------------
    // DEBUG PANEL
    // --------------------------------------------------
    function createDebugPanel() {
        if (document.getElementById("addtrains-debug-panel")) return;

        const panel = document.createElement("div");
        panel.id = "addtrains-debug-panel";
        panel.style.position = "fixed";
        panel.style.top = "20px";
        panel.style.right = "20px";
        panel.style.width = "600px";
        panel.style.height = "500px";
        panel.style.zIndex = "99999";
        panel.style.background = "rgba(0,0,0,0.95)";
        panel.style.border = "2px solid #333";
        panel.style.borderRadius = "8px";
        panel.style.fontFamily = "'Courier New', monospace";
        panel.style.fontSize = "11px";
        panel.style.color = "#0f0";
        panel.style.overflow = "hidden";
        panel.style.display = "none";
        
        // Header
        const header = document.createElement("div");
        header.style.padding = "10px 15px";
        header.style.background = "#111";
        header.style.borderBottom = "1px solid #333";
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";
        header.style.cursor = "move";
        
        const title = document.createElement("div");
        title.innerHTML = "<strong>AddTrains Debug Panel</strong>";
        title.style.color = "#fff";
        
        const controls = document.createElement("div");
        controls.style.display = "flex";
        controls.style.gap = "5px";
        
        const refreshBtn = document.createElement("button");
        refreshBtn.textContent = "Refresh";
        refreshBtn.style.background = "#333";
        refreshBtn.style.border = "1px solid #555";
        refreshBtn.style.color = "#fff";
        refreshBtn.style.borderRadius = "3px";
        refreshBtn.style.padding = "2px 8px";
        refreshBtn.style.cursor = "pointer";
        refreshBtn.style.fontSize = "10px";
        refreshBtn.onclick = registerTrainsToGame;
        
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "×";
        closeBtn.style.background = "#c00";
        closeBtn.style.border = "none";
        closeBtn.style.color = "#fff";
        closeBtn.style.fontSize = "16px";
        closeBtn.style.borderRadius = "3px";
        closeBtn.style.padding = "0 8px";
        closeBtn.style.cursor = "pointer";
        closeBtn.onclick = () => panel.style.display = "none";
        
        controls.appendChild(refreshBtn);
        controls.appendChild(closeBtn);
        header.appendChild(title);
        header.appendChild(controls);
        
        // Content
        const content = document.createElement("div");
        content.id = "addtrains-debug-content";
        content.style.height = "calc(100% - 50px)";
        content.style.overflow = "auto";
        content.style.padding = "10px";
        content.style.whiteSpace = "pre-wrap";
        
        panel.appendChild(header);
        panel.appendChild(content);
        document.body.appendChild(panel);
        
        // Make draggable
        makeDraggable(panel, header);
        
        debugLogMessage("log", "Debug panel created");
    }

    function makeDraggable(element, handle) {
        let isDragging = false;
        let offsetX, offsetY;
        
        handle.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        
        function startDrag(e) {
            isDragging = true;
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            element.style.cursor = 'grabbing';
            e.preventDefault();
        }
        
        function drag(e) {
            if (!isDragging) return;
            element.style.left = (e.clientX - offsetX) + 'px';
            element.style.top = (e.clientY - offsetY) + 'px';
            element.style.right = 'auto';
        }
        
        function stopDrag() {
            isDragging = false;
            element.style.cursor = '';
        }
    }

    function updateDebugPanel() {
        const content = document.getElementById("addtrains-debug-content");
        if (!content) return;
        
        let html = "";
        debugLog.forEach(entry => {
            let color = "#0f0";
            let prefix = "[INFO]";
            
            if (entry.type === "error") {
                color = "#f00";
                prefix = "[ERROR]";
            } else if (entry.type === "warn") {
                color = "#ff0";
                prefix = "[WARN]";
            }
            
            html += `<div style="margin: 2px 0; padding: 3px 0; border-bottom: 1px solid #222;">`;
            html += `<span style="color: #888">[${entry.timestamp}]</span> `;
            html += `<span style="color: ${color}">${prefix}</span> `;
            html += `<span style="color: #fff">${entry.message}</span>`;
            
            if (entry.data) {
                html += `<div style="color: #aaa; margin-left: 20px; font-size: 10px;">`;
                html += JSON.stringify(entry.data, null, 2);
                html += `</div>`;
            }
            html += `</div>`;
        });
        
        content.innerHTML = html;
        content.scrollTop = 0;
    }

    function toggleDebugPanel() {
        const panel = document.getElementById("addtrains-debug-panel");
        if (!panel) {
            createDebugPanel();
            panel = document.getElementById("addtrains-debug-panel");
        }
        panel.style.display = panel.style.display === "none" ? "block" : "none";
        if (panel.style.display === "block") updateDebugPanel();
    }

    // --------------------------------------------------
    // UI BUTTONS
    // --------------------------------------------------
    function createUIButtons() {
        if (document.getElementById("btn-addtrains-open")) return;

        // Get icon
        let iconHTML = "";
        if (UI_BTN_CONFIG.icon === "custom" && UI_BTN_CONFIG.customIcon) {
            iconHTML = UI_BTN_CONFIG.customIcon;
        }

        // Main button
        const btn = document.createElement("button");
        btn.id = "btn-addtrains-open";
        btn.className = "at-menu-btn";
        btn.innerHTML = `
            ${iconHTML}
            ${UI_BTN_CONFIG.text}
        `;
        
        // Apply custom colors if specified
        if (UI_BTN_CONFIG.backgroundColor) {
            btn.style.backgroundColor = UI_BTN_CONFIG.backgroundColor;
        }
        if (UI_BTN_CONFIG.textColor) {
            btn.style.color = UI_BTN_CONFIG.textColor;
        }
        if (UI_BTN_CONFIG.borderColor) {
            btn.style.borderColor = UI_BTN_CONFIG.borderColor;
        }
        
        btn.addEventListener("click", openOverlay);
        btn.addEventListener("dblclick", toggleDebugPanel);

        document.body.appendChild(btn);
        
        // Auto-hide when game is running
        if (UI_BTN_CONFIG.hideInGame) {
            const observer = new MutationObserver(() => {
                const gameRunning = document.querySelector('.maplibregl-map, canvas.mapboxgl-canvas, canvas');
                if (gameRunning) {
                    btn.style.display = "none";
                } else {
                    btn.style.display = "flex";
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    // --------------------------------------------------
    // MAIN INITIALIZATION
    // --------------------------------------------------
    function initialize() {
        debugLogMessage("log", "=== ADD TRAINS MOD INITIALIZING ===");
        debugLogMessage("log", `API v${window.SubwayBuilderAPI?.version || 'unknown'}`);
        
        // Create UI
        injectStyles();
        createDebugPanel();
        createUIButtons();
        
        // Register trains immediately
        setTimeout(() => {
            const success = registerTrainsToGame();
            if (success) {
                debugLogMessage("log", "Initial registration successful");
            } else {
                debugLogMessage("error", "Initial registration failed");
            }
        }, 1000);
        
        // Setup hooks
        const api = window.SubwayBuilderAPI;
        if (api?.hooks) {
            if (typeof api.hooks.onGameInit === 'function') {
                api.hooks.onGameInit(() => {
                    debugLogMessage("log", "Game initialized - re-registering trains");
                    setTimeout(registerTrainsToGame, 500);
                });
            }
            
            if (typeof api.hooks.onCityLoad === 'function') {
                api.hooks.onCityLoad((cityCode) => {
                    debugLogMessage("log", `City loaded: ${cityCode}`);
                });
            }
        }
        
        debugLogMessage("log", "Mod initialized successfully");
    }

    // Start
    if (window.SubwayBuilderAPI) {
        initialize();
    } else {
        debugLogMessage("log", "Waiting for API...");
        const checkInterval = setInterval(() => {
            if (window.SubwayBuilderAPI) {
                clearInterval(checkInterval);
                initialize();
            }
        }, 100);
    }

})();