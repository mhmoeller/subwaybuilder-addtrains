// index.js – AddTrains Mod
// Mod API version with React and added DanielD1909 train types
(function () {
    if (window.__AddTrainsModInitialized) return;
    window.__AddTrainsModInitialized = true;

    // --------------------------------------------------
    // DEBUG SYSTEM
    // --------------------------------------------------
    let debugLog = [];
    const MAX_LOG_ENTRIES = 100;

    function debugLogMessage(type, message, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = { timestamp, type, message, data };
        debugLog.unshift(entry);
        if (debugLog.length > MAX_LOG_ENTRIES) debugLog.pop();
        console.log(`[AddTrainsMod] ${message}`, data || '');
    }

    // --------------------------------------------------
    // HELPER FUNCTIONS
    // --------------------------------------------------
    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    function pick(source, keys) {
        const out = {};
        keys.forEach(k => {
            if (source[k] !== undefined) {
                out[k] = source[k];
            }
        });
        return out;
    }

    function showNotification(message, type = 'info') {
        const api = window.SubwayBuilderAPI;
        if (api && api.ui && api.ui.showNotification) {
            api.ui.showNotification(message, type);
            return;
        }
        
        // Advanced fallback notification
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            z-index: 10002;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
            backdrop-filter: blur(8px);
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // --------------------------------------------------
    // BASE ELEVATION MULTIPLIERS
    // --------------------------------------------------
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
    
    // --------------------------------------------------
    // TRAIN TYPES WITH LOCATION DATA AND NEW CATEGORY TAGS
    // --------------------------------------------------
    const REAL_TRAINS = {
        // Standard Metro Types
        "heavy-metro": {
            "id": "heavy-metro",
            "name": "Heavy Metro",
            "description": "For higher capacity routes. Modeled after NYC's R211s",
            "allowAtGradeRoadCrossing": false,
            "manufacturer": "Kawasaki",
            "tag": ["Metro"],
            "stats": {
                "maxSpeed": 24.7,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.1,
                "maxDeceleration": 1.3,
                "capacityPerCar": 240.0,
                "carLength": 15,
                "minCars": 5.0,
                "maxCars": 10.0,
                "carsPerCarSet": 5.0,
                "carCost": 2700931,
                "trainWidth": 3.05,
                "minStationLength": 160,
                "maxStationLength": 227,
                "baseTrackCost": 50000,
                "baseStationCost": 75000000,
                "trainOperationalCostPerHour": 500,
                "carOperationalCostPerHour": 50,
                "scissorsCrossoverCost": 15000000,
                "stopTimeSeconds": 35,
				"parallelTrackSpacing": 2.52,
				"trackClearance": 1.21,
				"maxLateralAcceleration": 1.0,
				"minTurnRadius": 80,
				"minStationTurnRadius": 426,
				"maxSlopePercentage": 5.5
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["heavy-metro"],
            "appearance": {
                "color": "#007EC6"
            },
            "isFixed": true,
            "location": {
                "continent": "North America",
                "country": "US",
                "city": "New York City"
            }
        },
        // "R188 (NYC)": {
        //     "id": "R188 (NYC)",
        //     "name": "R188 (NYC)",
        //     "description": "For higher capacity routes. The R188 is a subway EMU built by Kawasaki for the NYC Subway's A Division that entered service in 2013.",
        //     "allowAtGradeRoadCrossing": false,
        //     "manufacturer": "Kawasaki",
        //     "tag": ["Standard Metro"],
        //     "stats": {
        //         "maxSpeed": 24.7,
        //         "maxSpeedLocalStation": 13,
        //         "maxAcceleration": 1.1,
        //         "maxDeceleration": 1.3,
        //         "capacityPerCar": 188.0,
        //         "carLength": 15.65,
        //         "minCars": 5.0,
        //         "maxCars": 10.0,
        //         "carsPerCarSet": 5.0,
        //         "carCost": 2500000,
        //         "trainWidth": 2.65,
        //         "minStationLength": 159,
        //         "maxStationLength": 200,
        //         "baseTrackCost": 50000,
        //         "baseStationCost": 75000000,
        //         "trainOperationalCostPerHour": 500,
        //         "carOperationalCostPerHour": 50,
        //         "scissorsCrossoverCost": 15000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["R188 (NYC)"],
        //     "appearance": {
        //         "color": "#AF378B"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "US",
        //         "city": "New York City"
        //     }
        // },
        // "2024 Stock (LDN)": {
        //     "id": "2024 Stock (LDN)",
        //     "name": "2024 Stock (LDN)",
        //     "description": "For higher capacity routes. The 2024 Tube Stock is a subway EMU built by Siemens Mobility as part of their Inspiro family. It will enter service around mid-2026 on the Picadilly Line.",
        //     "allowAtGradeRoadCrossing": false,
        //     "manufacturer": "Siemens",
        //     "tag": ["Standard Metro"],
        //     "stats": {
        //         "maxSpeed": 27.5,
        //         "maxSpeedLocalStation": 13,
        //         "maxAcceleration": 1.4,
        //         "maxDeceleration": 1.4,
        //         "capacityPerCar": 116.0,
        //         "carLength": 12.63,
        //         "minCars": 9.0,
        //         "maxCars": 9.0,
        //         "carsPerCarSet": 9.0,
        //         "carCost": 2000000,
        //         "trainWidth": 2.65,
        //         "minStationLength": 160,
        //         "maxStationLength": 160,
        //         "baseTrackCost": 50000,
        //         "baseStationCost": 75000000,
        //         "trainOperationalCostPerHour": 500,
        //         "carOperationalCostPerHour": 50,
        //         "scissorsCrossoverCost": 15000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["Tube 2024 (LDN)"],
        //     "appearance": {
        //         "color": "#1B3F94"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "Europe",
        //         "country": "UK",
        //         "city": "London"
        //     }
        // },
        // "R179 (NYC)": {
        //     "id": "R179 (NYC)",
        //     "name": "R179 (NYC)",
        //     "description": "For separating the NYC subway into A and B Division Routes. The R179 is a subway EMU built by Bombardier (now Alstom) for the NYC Subway's B Division that entered service in 2019.",
        //     "allowAtGradeRoadCrossing": false,
		// 	"manufacturer": "Bombardier",
        //     "tag": ["Standard Metro"],
        //     "stats": {
        //         "maxSpeed": 24.7,
        //         "maxSpeedLocalStation": 13,
        //         "maxAcceleration": 1.1,
        //         "maxDeceleration": 1.3,
        //         "capacityPerCar": 240.0,
        //         "carLength": 18.4,
        //         "minCars": 4.0,
        //         "maxCars": 8.0,
        //         "carsPerCarSet": 4.0,
        //         "carCost": 2000000,
        //         "trainWidth": 3.05,
        //         "minStationLength": 150,
        //         "maxStationLength": 220,
        //         "baseTrackCost": 50000,
        //         "baseStationCost": 75000000,
        //         "trainOperationalCostPerHour": 500,
        //         "carOperationalCostPerHour": 50,
        //         "scissorsCrossoverCost": 15000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["R179 (NYC)"],
        //     "appearance": {
        //         "color": "#A7752A"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "US",
        //         "city": "New York City"
        //     }
        // },
        // "FE-10 (MXC)": {
        //     "id": "FE-10 (MXC)",
        //     "name": "FE-10 (MXC)",
        //     "description": "For higher capacity routes. The FE-10 is a steel-wheeled model of electrical multiple units used on the Mexico City Metro, first used in 2012.",
        //     "allowAtGradeRoadCrossing": false,
		// 	"manufacturer": "CAF",
        //     "tag": ["Standard Metro"],
        //     "stats": {
        //         "maxSpeed": 25.0,
        //         "maxSpeedLocalStation": 13,
        //         "maxAcceleration": 1.2,
        //         "maxDeceleration": 1.2,
        //         "capacityPerCar": 210.0,
        //         "carLength": 20.14,
        //         "minCars": 7.0,
        //         "maxCars": 7.0,
        //         "carsPerCarSet": 7.0,
        //         "carCost": 5580690,
        //         "trainWidth": 3.05,
        //         "minStationLength": 180,
        //         "maxStationLength": 180,
        //         "baseTrackCost": 50000,
        //         "baseStationCost": 75000000,
        //         "trainOperationalCostPerHour": 500,
        //         "carOperationalCostPerHour": 50,
        //         "scissorsCrossoverCost": 15000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["FE-10 (MXC)"],
        //     "appearance": {
        //         "color": "#B0A32A"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "Mexico",
        //         "city": "Mexico City"
        //     }
        // },
        // "Toronto Rocket": {
        //     "id": "Toronto Rocket",
        //     "name": "Toronto Rocket",
        //     "description": "For higher capacity routes. The Toronto Rocket is an EMU built by Bombardier for the Toronto Subway that entered service in 2021.",
        //     "allowAtGradeRoadCrossing": false,
		// 	"manufacturer": "Bombardier",
        //     "tag": ["Standard Metro"],
        //     "stats": {
        //         "maxSpeed": 20.8,
        //         "maxSpeedLocalStation": 13,
        //         "maxAcceleration": 0.9,
        //         "maxDeceleration": 1.35,
        //         "capacityPerCar": 174.0,
        //         "carLength": 23.0,
        //         "minCars": 4.0,
        //         "maxCars": 6.0,
        //         "carsPerCarSet": 2.0,
        //         "carCost": 2000000,
        //         "trainWidth": 3.2,
        //         "minStationLength": 140,
        //         "maxStationLength": 180,
        //         "baseTrackCost": 50000,
        //         "baseStationCost": 75000000,
        //         "trainOperationalCostPerHour": 500,
        //         "carOperationalCostPerHour": 50,
        //         "scissorsCrossoverCost": 15000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["Toronto Rocket"],
        //     "appearance": {
        //         "color": "#DA251D"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "Canada",
        //         "city": "Toronto"
        //     }
        // },
        // "R211 (NYC)": {
        //     "id": "R211 (NYC)",
        //     "name": "R211 (NYC)",
        //     "description": "For separating the NYC subway into A and B Division Routes. The R211 is a subway EMU built by Kawasaki for the NYC Subway's B Division that entered service in 2023.",
        //     "allowAtGradeRoadCrossing": false,
		// 	"manufacturer": "Kawasaki",
        //     "tag": ["Standard Metro"],
        //     "stats": {
        //         "maxSpeed": 24.7,
        //         "maxSpeedLocalStation": 13,
        //         "maxAcceleration": 1.1,
        //         "maxDeceleration": 1.3,
        //         "capacityPerCar": 240.0,
        //         "carLength": 18.35,
        //         "minCars": 5.0,
        //         "maxCars": 10.0,
        //         "carsPerCarSet": 5.0,
        //         "carCost": 2700931,
        //         "trainWidth": 3.05,
        //         "minStationLength": 186,
        //         "maxStationLength": 227,
        //         "baseTrackCost": 50000,
        //         "baseStationCost": 75000000,
        //         "trainOperationalCostPerHour": 500,
        //         "carOperationalCostPerHour": 50,
        //         "scissorsCrossoverCost": 15000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["R211 (NYC)"],
        //     "appearance": {
        //         "color": "#007EC6"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "US",
        //         "city": "New York City"
        //     }
        // },
        // "7000 Series (WSH)": {
        //     "id": "7000 Series (WSH)",
        //     "name": "7000 Series (WSH)",
        //     "description": "For higher capacity routes. The 7000-series is a subway EMU built by Kawasaki for Washington DC's Subway that entered service in 2015.",
        //     "allowAtGradeRoadCrossing": false,
		// 	"manufacturer": "Kawasaki",
        //     "tag": ["Standard Metro"],
        //     "stats": {
        //         "maxSpeed": 33.6,
        //         "maxSpeedLocalStation": 13,
        //         "maxAcceleration": 1.25,
        //         "maxDeceleration": 0.98,
        //         "capacityPerCar": 175.0,
        //         "carLength": 22.86,
        //         "minCars": 4.0,
        //         "maxCars": 8.0,
        //         "carsPerCarSet": 2.0,
        //         "carCost": 2765152,
        //         "trainWidth": 3.2,
        //         "minStationLength": 185,
        //         "maxStationLength": 220,
        //         "baseTrackCost": 50000,
        //         "baseStationCost": 75000000,
        //         "trainOperationalCostPerHour": 500,
        //         "carOperationalCostPerHour": 50,
        //         "scissorsCrossoverCost": 15000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["7000 Series (WSH)"],
        //     "appearance": {
        //         "color": "#231F20"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "US",
        //         "city": "Washington DC"
        //     }
        // },

        // Automated Metro Types
        "light-metro": {
            "id": "light-metro",
            "name": "Light Metro",
            "description": "Lighter, more flexible transit for moderate capacity routes. Modeled after Montreal's Alstom Metropolis Saint-Laurent",
            "allowAtGradeRoadCrossing": false,
			"manufacturer": "Alstom",
            "tag": ["Automated Metro"],
            "stats": {
                "maxSpeed": 27.8,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.1,
                "maxDeceleration": 1.3,
                "capacityPerCar": 200.0,
                "carLength": 19.05,
                "minCars": 2.0,
                "maxCars": 4.0,
                "carsPerCarSet": 2.0,
                "carCost": 2500000,
                "trainWidth": 2.9,
                "minStationLength": 80,
                "maxStationLength": 160,
                "baseTrackCost": 35000,
                "baseStationCost": 50000000,
                "trainOperationalCostPerHour": 400,
                "carOperationalCostPerHour": 40,
                "scissorsCrossoverCost": 12000000,
				"stopTimeSeconds": 32,
				"parallelTrackSpacing": 2.42,
				"trackClearance": 1.16,
				"maxLateralAcceleration": 1.0,
				"minTurnRadius": 86,
				"minStationTurnRadius": 1820,
				"maxSlopePercentage": 5.5,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["light-metro"],
            "appearance": {
                "color": "#000000"
            },
            "isFixed": true,
            "location": {
                "continent": "North America",
                "country": "Canada",
                "city": "Montreal"
            }
        },
        // "AnsaldoBreda (CPH)": {
        //     "id": "AnsaldoBreda (CPH)",
        //     "name": "AnsaldoBreda (CPH)",
        //     "description": "Lighter, more flexible transit for moderate capacity routes. The Hitachi Rail Italy Driverless Metro (formerly AnsaldoBreda) is a fully autonomous EMU family used across the globe. This specific model is based on those used by Copenhagen's Metro since 2002.",
        //     "allowAtGradeRoadCrossing": false,
		// 	"manufacturer": "Hitachi",
        //     "tag": ["Automated Metro"],
        //     "stats": {
        //         "maxSpeed": 25.0,
        //         "maxSpeedLocalStation": 13,
        //         "maxAcceleration": 1.3,
        //         "maxDeceleration": 1.3,
        //         "capacityPerCar": 102.0,
        //         "carLength": 13.0,
        //         "minCars": 3.0,
        //         "maxCars": 6.0,
        //         "carsPerCarSet": 3.0,
        //         "carCost": 2500000,
        //         "trainWidth": 2.65,
        //         "minStationLength": 80,
        //         "maxStationLength": 160,
        //         "baseTrackCost": 30000,
        //         "baseStationCost": 50000000,
        //         "trainOperationalCostPerHour": 100,
        //         "carOperationalCostPerHour": 10,
        //         "scissorsCrossoverCost": 12000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["AnsaldoBreda (CPH)"],
        //     "appearance": {
        //         "color": "#9E0817"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "Europe",
        //         "country": "Denmark",
        //         "city": "Copenhagen"
        //     }
        // },
        // "Innovia Metro (VAN)": {
        //     "id": "Innovia Metro (VAN)",
        //     "name": "Innovia Metro (VAN)",
        //     "description": "Lighter, more flexible transit for moderate capacity routes. The Innovia Metro is an automated rapid transit system family built by Alstom that have been in service across North America since 1985. This specific model is based on the Mark V used in Vancouver since 2025. Acceleration and decceleration are guesstimates.",
        //     "allowAtGradeRoadCrossing": false,
		// 	"manufacturer": "Alstom",
        //     "tag": ["Automated Metro"],
        //     "stats": {
        //         "maxSpeed": 22.2,
        //         "maxSpeedLocalStation": 13,
        //         "maxAcceleration": 1.0,
        //         "maxDeceleration": 1.0,
        //         "capacityPerCar": 134.0,
        //         "carLength": 16.96,
        //         "minCars": 4.0,
        //         "maxCars": 5.0,
        //         "carsPerCarSet": 1.0,
        //         "carCost": 2500000,
        //         "trainWidth": 2.65,
        //         "minStationLength": 100,
        //         "maxStationLength": 130,
        //         "baseTrackCost": 30000,
        //         "baseStationCost": 50000000,
        //         "trainOperationalCostPerHour": 100,
        //         "carOperationalCostPerHour": 10,
        //         "scissorsCrossoverCost": 12000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["Innovia Metro (VAN)"],
        //     "appearance": {
        //         "color": "#000000"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "Canada",
        //         "city": "Vancouver"
        //     }
        // },
        // "VAL 208 (FRA)": {
        //     "id": "VAL 208 (FRA)",
        //     "name": "VAL 208 (FRA)",
        //     "description": "These are light metro systems which use rubber wheels instead of steel. Operational costs are higher, but so is acceleration. The VAL 208 is an autonomous, rubber-tire EMU made by Siemens primarily used in France (Lille, Renne, Toulouse) and has been in service since 2001.",
        //     "allowAtGradeRoadCrossing": false,
		// 	"manufacturer": "Siemens",
        //     "tag": ["Automated Metro"],
        //     "stats": {
        //         "maxSpeed": 22.2,
        //         "maxSpeedLocalStation": 13,
        //         "maxAcceleration": 1.3,
        //         "maxDeceleration": 1.3,
        //         "capacityPerCar": 100.0,
        //         "carLength": 13.07,
        //         "minCars": 2.0,
        //         "maxCars": 4.0,
        //         "carsPerCarSet": 2.0,
        //         "carCost": 2000000,
        //         "trainWidth": 2.4,
        //         "minStationLength": 60,
        //         "maxStationLength": 100,
        //         "baseTrackCost": 30000,
        //         "baseStationCost": 50000000,
        //         "trainOperationalCostPerHour": 200,
        //         "carOperationalCostPerHour": 20,
        //         "scissorsCrossoverCost": 12000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["VAL 208 (FRA)"],
        //     "appearance": {
        //         "color": "#000000"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "Europe",
        //         "country": "France",
        //         "city": "Lille"
        //     }
        // },
        // "NM-16 (MXC)": {
        //     "id": "NM-16 (MXC)",
        //     "name": "NM-16 (MXC)",
        //     "description": "These are heavy metro systems which use rubber wheels instead of steel. Operational costs are higher, but so is acceleration. The NM-16 is a rubber-tyred model of electrical multiple units used on the Mexico City Metro",
        //     "allowAtGradeRoadCrossing": false,
		// 	"manufacturer": "CAF",
        //     "tag": ["Automated Metro"],
        //     "stats": {
        //         "maxSpeed": 19.4,
        //         "maxSpeedLocalStation": 13,
        //         "maxAcceleration": 1.43,
        //         "maxDeceleration": 1.43,
        //         "capacityPerCar": 249.0,
        //         "carLength": 16.77,
        //         "minCars": 9.0,
        //         "maxCars": 9.0,
        //         "carsPerCarSet": 9.0,
        //         "carCost": 2134515,
        //         "trainWidth": 3.0,
        //         "minStationLength": 200,
        //         "maxStationLength": 200,
        //         "baseTrackCost": 50000,
        //         "baseStationCost": 75000000,
        //         "trainOperationalCostPerHour": 600,
        //         "carOperationalCostPerHour": 60,
        //         "scissorsCrossoverCost": 15000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["NM-16 (MXC)"],
        //     "appearance": {
        //         "color": "#F04E98"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "Mexico",
        //         "city": "Mexico City"
        //     }
        // },
        // "Azur (MTL)": {
        //     "id": "Azur (MTL)",
        //     "name": "Azur (MTL)",
        //     "description": "These are heavy metro systems which use rubber wheels instead of steel. Operational costs are higher, but so is acceleration. The MPM-10 (Azur) is a rubber-tire vehicle built by Bombardier and Alstom for the Montreal Metro that entered service in 2016.",
        //     "allowAtGradeRoadCrossing": false,
        //     "manufacturer": ["Bombardier","Alstom"],
        //     "tag": ["Automated Metro"],
        //     "stats": {
        //         "maxSpeed": 20.1,
        //         "maxSpeedLocalStation": 13,
        //         "maxAcceleration": 1.21,
        //         "maxDeceleration": 1.23,
        //         "capacityPerCar": 126.0,
        //         "carLength": 16.93,
        //         "minCars": 9.0,
        //         "maxCars": 9.0,
        //         "carsPerCarSet": 9.0,
        //         "carCost": 1848654,
        //         "trainWidth": 2.5,
        //         "minStationLength": 190,
        //         "maxStationLength": 190,
        //         "baseTrackCost": 50000,
        //         "baseStationCost": 75000000,
        //         "trainOperationalCostPerHour": 600,
        //         "carOperationalCostPerHour": 60,
        //         "scissorsCrossoverCost": 15000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["Azur (MTL)"],
        //     "appearance": {
        //         "color": "#0085CA"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "Canada",
        //         "city": "Montreal"
        //     }
        // },

        // // Standard LRT Types
        // "S700 (MSP)": {
        //     "id": "S700 (MSP)",
        //     "name": "S700 (MSP)",
        //     "description": "Light rail is a form of urban transit that uses rolling stock derived from tram technology while also having some features from heavy rapid transit. The S700 series are articulated low-floor light-rail vehicles built by Siemens Mobility that have been in service across North America since 2004. This specific model is based on those recieved in 2020 by Metro Transit in Minnesota.",
        //     "allowAtGradeRoadCrossing": true,
		// 	"manufacturer": "Siemens",
        //     "tag": ["Standard LRT"],
        //     "stats": {
        //         "maxSpeed": 24.4,
        //         "maxSpeedLocalStation": 6.7,
        //         "maxAcceleration": 1.34,
        //         "maxDeceleration": 1.34,
        //         "capacityPerCar": 175.0,
        //         "carLength": 28.74,
        //         "minCars": 1.0,
        //         "maxCars": 3.0,
        //         "carsPerCarSet": 1.0,
        //         "carCost": 2185000,
        //         "trainWidth": 2.65,
        //         "minStationLength": 89,
        //         "maxStationLength": 120,
        //         "baseTrackCost": 25000,
        //         "baseStationCost": 20000000,
        //         "trainOperationalCostPerHour": 200,
        //         "carOperationalCostPerHour": 20,
        //         "scissorsCrossoverCost": 5000000
        //     },
        //     "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["S700 (MSP)"],
        //     "appearance": {
        //         "color": "#008244"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "US",
        //         "city": "Minneapolis"
        //     }
        // },
        // "Avenio (CPH)": {
        //     "id": "Avenio (CPH)",
        //     "name": "Avenio (CPH)",
        //     "description": "City tram service modeled after Siemens Avenio.",
        //     "allowAtGradeRoadCrossing": true,
		// 	"manufacturer": "Siemens",
        //     "tag": ["Standard LRT"],
        //     "stats": {
        //         "maxAcceleration": 1.2,
        //         "maxDeceleration": 1.2,
        //         "maxSpeed": 22.22,
        //         "maxSpeedLocalStation": 8.0,
        //         "capacityPerCar": 200,
        //         "carLength": 30,
        //         "minCars": 1,
        //         "maxCars": 2,
        //         "carsPerCarSet": 1,
        //         "carCost": 1500000,
        //         "trainWidth": 2.65,
        //         "minStationLength": 62,
        //         "maxStationLength": 80,
        //         "baseTrackCost": 25000,
        //         "baseStationCost": 20000000,
        //         "trainOperationalCostPerHour": 200,
        //         "carOperationalCostPerHour": 20,
        //         "scissorsCrossoverCost": 5000000
        //     },
        //     "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["Avenio (CPH)"],
        //     "appearance": { color: "#62b54e" },
        //     "isFixed": false,
        //     location: {
        //         "continent": "Europe",
        //         "country": "Denmark",
        //         "city": "Copenhagen"
        //     }
        // },
        // "S70 (ATL)": {
        //     "id": "S70 (ATL)",
        //     "name": "S70 (ATL)",
        //     "description": "City tram service. The S700 Streetcar is an articulated low-floor streetcar built by Siemens Mobility that have been in service across North America since 2004. This specific model is based on the streetcar model ordered by OC Streetcar.",
        //     "allowAtGradeRoadCrossing": true,
		// 	"manufacturer": "Siemens",
        //     "tag": ["Standard LRT"],
        //     "stats": {
        //         "maxSpeed": 20.0,
        //         "maxSpeedLocalStation": 6.7,
        //         "maxAcceleration": 1.34,
        //         "maxDeceleration": 1.34,
        //         "capacityPerCar": 200.0,
        //         "carLength": 27.5,
        //         "minCars": 1.0,
        //         "maxCars": 1.0,
        //         "carsPerCarSet": 1.0,
        //         "carCost": 2185000,
        //         "trainWidth": 2.65,
        //         "minStationLength": 62,
        //         "maxStationLength": 80,
        //         "baseTrackCost": 25000,
        //         "baseStationCost": 20000000,
        //         "trainOperationalCostPerHour": 200,
        //         "carOperationalCostPerHour": 20,
        //         "scissorsCrossoverCost": 5000000
        //     },
        //     "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["S70 (ATL)"],
        //     "appearance": {
        //         "color": "#01235E"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "US",
        //         "city": "Atlanta"
        //     }
        // },
        // "P3010 LRV (LA)": {
        //     "id": "P3010 LRV (LA)",
        //     "name": "P3010 LRV (LA)",
        //     "description": "Light rail is a form of urban transit that uses rolling stock derived from tram technology while also having some features from heavy rapid transit. The P3010 is an articulated low-floor light-rail vehicle built by Kinki Sharyo that has been in service in LA since 2016.",
        //     "allowAtGradeRoadCrossing": true,
		// 	"manufacturer": "Kinki-Sharyo",
        //     "tag": ["Standard LRT"],
        //     "stats": {
        //         "maxSpeed": 28.9,
        //         "maxSpeedLocalStation": 6.7,
        //         "maxAcceleration": 1.34,
        //         "maxDeceleration": 1.56,
        //         "capacityPerCar": 175.0,
        //         "carLength": 27.13,
        //         "minCars": 2.0,
        //         "maxCars": 3.0,
        //         "carsPerCarSet": 1.0,
        //         "carCost": 2500000,
        //         "trainWidth": 2.65,
        //         "minStationLength": 84,
        //         "maxStationLength": 120,
        //         "baseTrackCost": 25000,
        //         "baseStationCost": 20000000,
        //         "trainOperationalCostPerHour": 200,
        //         "carOperationalCostPerHour": 20,
        //         "scissorsCrossoverCost": 5000000
        //     },
        //     "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["P3010 LRV (LA)"],
        //     "appearance": {
        //         "color": "#000000"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "US",
        //         "city": "Los Angeles"
        //     }
        // },
        // "S700-US (SD)": {
        //     "id": "S700-US (SD)",
        //     "name": "S700-US (SD)",
        //     "description": "City tram service. The S700 series are articulated low-floor light-rail vehicles built by Siemens Mobility that have been in service across North America since 2004. This specific model is based on the ultra-short model used in San Diego since 2024.",
        //     "allowAtGradeRoadCrossing": true,
		// 	"manufacturer": "Siemens",
        //     "tag": ["Standard LRT"],
        //     "stats": {
        //         "maxSpeed": 24.6,
        //         "maxSpeedLocalStation": 6.7,
        //         "maxAcceleration": 1.34,
        //         "maxDeceleration": 1.34,
        //         "capacityPerCar": 145.0,
        //         "carLength": 24.8,
        //         "minCars": 2.0,
        //         "maxCars": 4.0,
        //         "carsPerCarSet": 1.0,
        //         "carCost": 2185000,
        //         "trainWidth": 2.65,
        //         "minStationLength": 102,
        //         "maxStationLength": 140,
        //         "baseTrackCost": 25000,
        //         "baseStationCost": 20000000,
        //         "trainOperationalCostPerHour": 200,
        //         "carOperationalCostPerHour": 20,
        //         "scissorsCrossoverCost": 5000000
        //     },
        //     "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["S700-US (SD)"],
        //     "appearance": {
        //         "color": "#000000"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "US",
        //         "city": "San Diego"
        //     }
        // },
        // "S200-HF (CGY)": {
        //     "id": "S200-HF (CGY)",
        //     "name": "S200-HF (CGY)",
        //     "description": "Light rail is a form of urban transit that uses rolling stock derived from tram technology while also having some features from heavy rapid transit. The S200 series are articulated high-floor light-rail vehicles built by Siemens Mobility that have been in service across North America since 2016. This specific model is based on the model used in Calgary since 2019.",
        //     "allowAtGradeRoadCrossing": true,
		// 	"manufacturer": "Siemens",
        //     "tag": ["Standard LRT"],
        //     "stats": {
        //         "maxSpeed": 22.4,
        //         "maxSpeedLocalStation": 6.7,
        //         "maxAcceleration": 0.95,
        //         "maxDeceleration": 1.32,
        //         "capacityPerCar": 200.0,
        //         "carLength": 25.8,
        //         "minCars": 1.0,
        //         "maxCars": 3.0,
        //         "carsPerCarSet": 1.0,
        //         "carCost": 2185000,
        //         "trainWidth": 2.65,
        //         "minStationLength": 80,
        //         "maxStationLength": 120,
        //         "baseTrackCost": 25000,
        //         "baseStationCost": 20000000,
        //         "trainOperationalCostPerHour": 200,
        //         "carOperationalCostPerHour": 20,
        //         "scissorsCrossoverCost": 5000000
        //     },
        //     "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["S200-HF (CGY)"],
        //     "appearance": {
        //         "color": "#000000"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "Canada",
        //         "city": "Calgary"
        //     }
        // },
        // "S200-HF (SF)": {
        //     "id": "S200-HF (SF)",
        //     "name": "S200-HF (SF)",
        //     "description": "Light rail is a form of urban transit that uses rolling stock derived from tram technology while also having some features from heavy rapid transit. The S200 series are articulated high-floor light-rail vehicles built by Siemens Mobility that have been in service across North America since 2016. This specific model is based on the model used in San Francisco since 2017.",
        //     "allowAtGradeRoadCrossing": true,
		// 	"manufacturer": "Siemens",
        //     "tag": ["Standard LRT"],
        //     "stats": {
        //         "maxSpeed": 22.4,
        //         "maxSpeedLocalStation": 6.7,
        //         "maxAcceleration": 1.34,
        //         "maxDeceleration": 1.34,
        //         "capacityPerCar": 150.0,
        //         "carLength": 22.86,
        //         "minCars": 2.0,
        //         "maxCars": 3.0,
        //         "carsPerCarSet": 1.0,
        //         "carCost": 2185000,
        //         "trainWidth": 2.65,
        //         "minStationLength": 71,
        //         "maxStationLength": 120,
        //         "baseTrackCost": 25000,
        //         "baseStationCost": 20000000,
        //         "trainOperationalCostPerHour": 200,
        //         "carOperationalCostPerHour": 20,
        //         "scissorsCrossoverCost": 5000000
        //     },
        //     "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["S200-HF (SF)"],
        //     "appearance": {
        //         "color": "#000000"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "US",
        //         "city": "San Francisco"
        //     }
        // },
        // "NJT Electric LRV": {
        //     "id": "NJT Electric LRV",
        //     "name": "NJT Electric LRV",
        //     "description": "Light rail is a form of urban transit that uses rolling stock derived from tram technology while also having some features from heavy rapid transit. This is an unnamed articulated low-floor light-rail vehicle built by Kinki-Sharyo for New Jersey Transit, specifically Hudson-Bergen Light Rail and Newark Light Rail. It has been in service since 2000.",
        //     "allowAtGradeRoadCrossing": true,
		// 	"manufacturer": "Kinki-Sharyo",
        //     "tag": ["Standard LRT"],
        //     "stats": {
        //         "maxSpeed": 24.4,
        //         "maxSpeedLocalStation": 6.7,
        //         "maxAcceleration": 1.34,
        //         "maxDeceleration": 1.34,
        //         "capacityPerCar": 200.0,
        //         "carLength": 27.43,
        //         "minCars": 1.0,
        //         "maxCars": 1.0,
        //         "carsPerCarSet": 1.0,
        //         "carCost": 2000000,
        //         "trainWidth": 2.65,
        //         "minStationLength": 62,
        //         "maxStationLength": 80,
        //         "baseTrackCost": 25000,
        //         "baseStationCost": 20000000,
        //         "trainOperationalCostPerHour": 200,
        //         "carOperationalCostPerHour": 20,
        //         "scissorsCrossoverCost": 5000000
        //     },
        //     "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["NJT Electric LRV"],
        //     "appearance": {
        //         "color": "#000000"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "US",
        //         "city": "New Jersey"
        //     }
        // },

        // // Diesel LRT Types
        // "GTW 2/6 (NJT)": {
        //     "id": "GTW 2/6 (NJT)",
        //     "name": "GTW 2/6 (NJT)",
        //     "description": "The diesel light metro is a rare form of transit that is generally used when existing rail can be used but there is no electrification, and heavy rail is not justified. This is a variant of the Stadler GTW 2/6 which is one of the rare and bizarre light rail DMUs and is exclusively in service on NJT's River Line. Details are scarce so the acceleration and braking are guesstimates.",
        //     "allowAtGradeRoadCrossing": true,
		// 	"manufacturer": "Stadler",
        //     "tag": ["Diesel LRT"],
        //     "stats": {
        //         "maxSpeed": 30.6,
        //         "maxSpeedLocalStation": 10,
        //         "maxAcceleration": 1.3,
        //         "maxDeceleration": 1.3,
        //         "capacityPerCar": 200.0,
        //         "carLength": 31.2,
        //         "minCars": 1.0,
        //         "maxCars": 2.0,
        //         "carsPerCarSet": 1.0,
        //         "carCost": 2000000,
        //         "trainWidth": 2.65,
        //         "minStationLength": 65,
        //         "maxStationLength": 100,
        //         "baseTrackCost": 25000,
        //         "baseStationCost": 40000000,
        //         "trainOperationalCostPerHour": 300,
        //         "carOperationalCostPerHour": 30,
        //         "scissorsCrossoverCost": 10000000
        //     },
        //     "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["GTW 2/6 (NJT)"],
        //     "appearance": {
        //         "color": "#000000"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "US",
        //         "city": "New Jersey"
        //     }
        // },

        // Standard Commuter Types
        "M9 (LIRR)": {
            "id": "M9 (LIRR)",
            "name": "M9 (LIRR)",
            "description": "Regional rail is a public rail transport service that operates between towns and cities. In North America, regional rail is often a synonym for commuter rail. The M9 is a commuter rail EMU built by Kawasaki for the Long Island Railroad that entered service in 2009.",
            "allowAtGradeRoadCrossing": true,
			"manufacturer": "Kawasaki",
            "tag": ["Commuter"],
            "stats": {
                "maxSpeed": 40.0,
                "maxSpeedLocalStation": 12,
                "maxAcceleration": 0.9,
                "maxDeceleration": 1.33,
                "capacityPerCar": 120.0,
                "carLength": 26.0,
                "minCars": 4.0,
                "maxCars": 14.0,
                "carsPerCarSet": 2.0,
                "carCost": 3859000,
                "trainWidth": 3.1,
                "minStationLength": 366,
                "maxStationLength": 400,
                "baseTrackCost": 50000,
                "baseStationCost": 65000000,
                "trainOperationalCostPerHour": 300,
                "carOperationalCostPerHour": 30,
                "scissorsCrossoverCost": 10500000,
				"stopTimeSeconds": 90,
				"parallelTrackSpacing": 2.72,
				"trackClearance": 1.31,
				"maxLateralAcceleration": 0.8,
				"minTurnRadius": 155,
				"minStationTurnRadius": 3361,
				"maxSlopePercentage": 2.0,
            },
            "elevationMultipliers": REGIONAL_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["M9 (LIRR)"],
            "appearance": {
                "color": "#0039A6"
            },
            "isFixed": false,
            "location": {
                "continent": "North America",
                "country": "US",
                "city": "New York City"
            }
        }
        // },
        // "IR4 (CPH)": {
        //     "id": "IR4 (CPH)",
        //     "name": "IR4 (CPH)",
        //     "description": "Fast long-distance fully electric train modeled after the Danish IR4. Also known as Litra ER. Built by ABB Scandia in the city of Randers in the years from 1993-1997",
        //     "allowAtGradeRoadCrossing": false,
		// 	"manufacturer": "ABB Scandia",
        //     "tag": ["Standard Commuter"],
        //     "stats": {
        //         "maxAcceleration": 0.8,
        //         "maxDeceleration": 1.0,
        //         "maxSpeed": 50.0,
        //         "maxSpeedLocalStation": 15,
        //         "capacityPerCar": 130,
        //         "carLength": 26,
        //         "minCars": 2,
        //         "maxCars": 8,
        //         "carsPerCarSet": 2,
        //         "carCost": 4000000,
        //         "trainWidth": 3.1,
        //         "minStationLength": 210,
        //         "maxStationLength": 275,
        //         "baseTrackCost": 60000,
        //         "baseStationCost": 90000000,
        //         "trainOperationalCostPerHour": 700,
        //         "carOperationalCostPerHour": 70,
        //         "scissorsCrossoverCost": 20000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["IR4 (CPH)"],
        //     "appearance": { color: "#222222" },
        //     "isFixed": false,
        //     location: {
        //         "continent": "Europe",
        //         "country": "Denmark",
        //         "city": "Copenhagen"
        //     }
        // },

        // // Diesel Commuter Types
        // "DM30-C3 (LIRR)": {
        //     "id": "DM30-C3 (LIRR)",
        //     "name": "DM30-C3 (LIRR)",
        //     "description": "Regional rail is a public rail transport service that operates between towns and cities. In North America, regional rail is often a synonym for commuter rail. The DM30AC-C3 is a commuter rail Diesel train that entered service in 1993, with coach cars manufacured by Kawasaki powered by an EMD manufactured Diesel locomotive.",
        //     "allowAtGradeRoadCrossing": true,
		// 	"manufacturer": "Kawasaki",
        //     "tag": ["Diesel Commuter"],
        //     "stats": {
        //         "maxSpeed": 42.0,
        //         "maxSpeedLocalStation": 12,
        //         "maxAcceleration": 0.65,
        //         "maxDeceleration": 1.3,
        //         "capacityPerCar": 150.0,
        //         "carLength": 26.0,
        //         "minCars": 4.0,
        //         "maxCars": 12.0,
        //         "carsPerCarSet": 2.0,
        //         "carCost": 2500000,
        //         "trainWidth": 3.1,
        //         "minStationLength": 314,
        //         "maxStationLength": 400,
        //         "baseTrackCost": 40000,
        //         "baseStationCost": 60000000,
        //         "trainOperationalCostPerHour": 800,
        //         "carOperationalCostPerHour": 40,
        //         "scissorsCrossoverCost": 10000000
        //     },
        //     "elevationMultipliers": REGIONAL_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["DM30-C3 (LIRR)"],
        //     "appearance": {
        //         "color": "#03B8A9"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "North America",
        //         "country": "US",
        //         "city": "New York City"
        //     }
        // },
        // "LINT 41": {
        //     "id": "LINT 41",
        //     "name": "LINT 41",
        //     "description": "Regional diesel/electric unit for local services. Modelled after the LINT 41",
        //     "allowAtGradeRoadCrossing": true,
		// 	"manufacturer": "Alstom",
        //     "tag": ["Diesel Commuter"],
        //     "stats": {
        //         "maxAcceleration": 0.6,
        //         "maxDeceleration": 0.9,
        //         "maxSpeed": 33.3,
        //         "maxSpeedLocalStation": 12,
        //         "capacityPerCar": 100,
        //         "carLength": 20,
        //         "minCars": 2,
        //         "maxCars": 4,
        //         "carsPerCarSet": 2,
        //         "carCost": 2000000,
        //         "trainWidth": 2.75,
        //         "minStationLength": 82,
        //         "maxStationLength": 120,
        //         "baseTrackCost": 40000,
        //         "baseStationCost": 60000000,
        //         "trainOperationalCostPerHour": 300,
        //         "carOperationalCostPerHour": 30,
        //         "scissorsCrossoverCost": 10000000
        //     },
        //     "elevationMultipliers": REGIONAL_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["LINT 41"],
        //     "appearance": { color: "#ebd768" },
        //     "isFixed": false,
        //     location: {
        //         "continent": ["Europe","North America"],
        //         "country": ["Denmark","Germany","Canada"],
        //         "city": ["Copenhagen","Mainz","Frankfurt am Main","Ottawa"]
        //     }
        // },

        // // Standard S-Bahn Types
        // "Litra SA (CPH)": {
        //     "id": "Litra SA (CPH)",
        //     "name": "Litra SA (CPH)",
        //     "description": "An S-Bahn is a type of hybrid commuter rail and rapid transit service that links suburbs with the city centre at moderate speeds, while continuing across the urban core over a central high-frequency corridor where multiple lines converge, where they provide a rapid means of travel across the city. The Litra SA is an EMU produced by Alstom and Siemens for the Copenhagen S-Tog system which entered service in 1996.",
        //     "allowAtGradeRoadCrossing": false,
		// 	"manufacturer": ["Siemens","Alstom"],
        //     "tag": ["Standard S-Bahn"],
        //     "stats": {
        //         "maxSpeed": 33.3,
        //         "maxSpeedLocalStation": 13,
        //         "maxAcceleration": 1.3,
        //         "maxDeceleration": 1.2,
        //         "capacityPerCar": 87.0,
        //         "carLength": 10.5,
        //         "minCars": 4.0,
        //         "maxCars": 8.0,
        //         "carsPerCarSet": 4.0,
        //         "carCost": 2500000,
        //         "trainWidth": 3.2,
        //         "minStationLength": 100,
        //         "maxStationLength": 220,
        //         "baseTrackCost": 50000,
        //         "baseStationCost": 75000000,
        //         "trainOperationalCostPerHour": 500,
        //         "carOperationalCostPerHour": 25,
        //         "scissorsCrossoverCost": 15000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["Litra SA (CPH)"],
        //     "appearance": {
        //         "color": "#BD2D3D"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "Europe",
        //         "country": "Denmark",
        //         "city": "Copenhagen"
        //     }
        // },
        // "Desiro CJ (VIE)": {
        //     "id": "Desiro CJ (VIE)",
        //     "name": "Desiro CJ (VIE)",
        //     "description": "An S-Bahn is a type of hybrid commuter rail and rapid transit service that links suburbs with the city centre at moderate speeds, while continuing across the urban core over a central high-frequency corridor where multiple lines converge, where they provide a rapid means of travel across the city. The Siemens Desiro is a family of DMUs and EMUs in service across the world made by Siemens and formerly Ural Locomotives. This specific model is based on Mainline model 'Urban' Varient in service since 2012 on Vienna's S-Bahn.",
        //     "allowAtGradeRoadCrossing": false,
		// 	"manufacturer": "Siemens",
        //     "tag": ["Standard S-Bahn"],
        //     "stats": {
        //         "maxSpeed": 44.4,
        //         "maxSpeedLocalStation": 13,
        //         "maxAcceleration": 1.1,
        //         "maxDeceleration": 0.8,
        //         "capacityPerCar": 180.0,
        //         "carLength": 25.0,
        //         "minCars": 3.0,
        //         "maxCars": 6.0,
        //         "carsPerCarSet": 3.0,
        //         "carCost": 2000000,
        //         "trainWidth": 3.2,
        //         "minStationLength": 152,
        //         "maxStationLength": 200,
        //         "baseTrackCost": 50000,
        //         "baseStationCost": 75000000,
        //         "trainOperationalCostPerHour": 500,
        //         "carOperationalCostPerHour": 50,
        //         "scissorsCrossoverCost": 15000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["Desiro CJ (VIE)"],
        //     "appearance": {
        //         "color": "#0097D9"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "Europe",
        //         "country": "Austria",
        //         "city": "Vienna"
        //     }
        // },
        // "DBAG 483 (BER)": {
        //     "id": "DBAG 483 (BER)",
        //     "name": "DBAG 483 (BER)",
        //     "description": "An S-Bahn is a type of hybrid commuter rail and rapid transit service that links suburbs with the city centre at moderate speeds, while continuing across the urban core over a central high-frequency corridor where multiple lines converge, where they provide a rapid means of travel across the city. The DB Class 483 is an EMU built by Stadler and Siemens for the Berlin S-Bahn that entered service in 2021.",
        //     "allowAtGradeRoadCrossing": false,
		// 	"manufacturer": ["Siemens","Stadler"],
        //     "tag": ["Standard S-Bahn"],
        //     "stats": {
        //         "maxSpeed": 27.8,
        //         "maxSpeedLocalStation": 13,
        //         "maxAcceleration": 1.0,
        //         "maxDeceleration": 0.8,
        //         "capacityPerCar": 87.0,
        //         "carLength": 18.4,
        //         "minCars": 2.0,
        //         "maxCars": 8.0,
        //         "carsPerCarSet": 2.0,
        //         "carCost": 2000000,
        //         "trainWidth": 3.0,
        //         "minStationLength": 150,
        //         "maxStationLength": 200,
        //         "baseTrackCost": 50000,
        //         "baseStationCost": 75000000,
        //         "trainOperationalCostPerHour": 500,
        //         "carOperationalCostPerHour": 50,
        //         "scissorsCrossoverCost": 15000000
        //     },
        //     "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
        //     "compatibleTrackTypes": ["DBAG 483 (BER)"],
        //     "appearance": {
        //         "color": "#CE9D52"
        //     },
        //     "isFixed": false,
        //     "location": {
        //         "continent": "Europe",
        //         "country": "Germany",
        //         "city": "Berlin"
        //     }
        // }
    };


	// --------------------------------------------------
    // HYBRID LOCATION + CATEGORY CATEGORIZATION - UPDATED WITH NEW CATEGORIES
    // --------------------------------------------------
    function getTrainCategories() {
        // Build hierarchical location tree
        const locationTree = {};
        
        // Helper to get category for a train
        function getTrainCategory(trainDef) {
            // FIRST: Check for explicit tag (from datapacks)
            if (trainDef.tag && Array.isArray(trainDef.tag) && trainDef.tag.length > 0) {
                return trainDef.tag[0]; // Use first tag as category
            }
            
            // FALLBACK: Stats-based categorization (only used if no tag)
            const totalCapacityAtMaxCars = trainDef.stats?.capacityPerCar * trainDef.stats?.maxCars || 0;
            const description = (trainDef.description || "").toLowerCase();
            
            if (trainDef.isFixed) {
                return "Fixed Standard Trains";
            } else if (trainDef.allowAtGradeRoadCrossing) {
                if (!description.includes("regional") && 
                    !description.includes("commuter") &&
                    !description.includes("long-distance") &&
                    !description.includes("s-bahn")) {
                    return "LRT";
                } else {
                    return "Commuter";
                }
            } else if (description.includes("regional") || 
                       description.includes("commuter") ||
                       description.includes("long-distance") ||
                       description.includes("s-bahn")) {
                return "Commuter";
            } else if (totalCapacityAtMaxCars >= 700) {
                return "Metro";
            } else {
                return "Automated Metro";
            }
        }
        
        // Process all trains (REAL_TRAINS + custom + datapack)
        const allTrains = { 
            ...REAL_TRAINS, 
            ...(currentConfig.customTrains || {}), 
            ...(currentConfig.dataPackTrains || {}) 
        };
        
        Object.entries(allTrains).forEach(([trainId, trainDef]) => {
            // Get location from train data
            const location = trainDef.location || {
                continent: "Uncategorized",
                country: "Unknown",
                city: "Unknown"
            };
            
            const category = getTrainCategory(trainDef);
            
            // NEW LOCATION STRUCTURE:
            // continent can be array or string
            // country and city should be paired: country[0] goes with city[0], country[1] with city[1], etc.
            
            const continents = Array.isArray(location.continent) ? location.continent : [location.continent || "Uncategorized"];
            const countries = Array.isArray(location.country) ? location.country : [location.country || "Unknown"];
            const cities = Array.isArray(location.city) ? location.city : [location.city || "Unknown"];
            
            // Use the first continent for the tree location
            const firstContinent = continents[0];
            
            // Ensure countries and cities have same length by pairing them correctly
            const maxLocations = countries.length;
            const pairedLocations = [];
            
            for (let i = 0; i < maxLocations; i++) {
                pairedLocations.push({
                    country: countries[i],
                    city: cities[Math.min(i, cities.length - 1)]
                });
            }
            
            // Only add train to tree once - under first continent and first country/city pair
            const firstLocation = pairedLocations[0];
            const firstCountry = firstLocation.country;
            const firstCity = firstLocation.city;
            
            if (!locationTree[firstContinent]) locationTree[firstContinent] = {};
            if (!locationTree[firstContinent][firstCountry]) locationTree[firstContinent][firstCountry] = {};
            if (!locationTree[firstContinent][firstCountry][firstCity]) {
                locationTree[firstContinent][firstCountry][firstCity] = {};
            }
            if (!locationTree[firstContinent][firstCountry][firstCity][category]) {
                locationTree[firstContinent][firstCountry][firstCity][category] = [];
            }
            
            // Check for duplicates
            const existingTrain = locationTree[firstContinent][firstCountry][firstCity][category]
                .find(([id]) => id === trainId);
            if (!existingTrain) {
                locationTree[firstContinent][firstCountry][firstCity][category].push([trainId, trainDef]);
            }
        });
        
        return locationTree;
    }

    // --------------------------------------------------
    // CONFIG MANAGEMENT
    // --------------------------------------------------
    const STORAGE_KEY = 'addtrains_config';
    const DATAPACK_STORAGE_KEY = 'datapacktrains_data';
    
    let uiState = {
        selectedTrainID: null,
        editedValues: {}
    };
    
    // Default config
    const DEFAULT_CONFIG = {
        enabledTrains: Object.keys(REAL_TRAINS).filter(id => !REAL_TRAINS[id].isFixed),
        customTrains: {},
        customTrainCounter: 0,
        showEditPanel: false,
        datapackValidationErrors: []
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

    // Load data from ALL DataPack mods
    function loadDataFromDataPacks() {
        try {
            const allDataPackTrains = {};
            const datapackKeys = [];
            
            // Find all datapack keys in localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('datapacktrains_')) {
                    datapackKeys.push(key);
                }
            }
            
            if (datapackKeys.length === 0) {
                debugLogMessage("log", "No DataPack data found");
                
                // Purge all datapack trains if no datapacks exist
                if (currentConfig.dataPackTrains && Object.keys(currentConfig.dataPackTrains).length > 0) {
                    const purgedCount = Object.keys(currentConfig.dataPackTrains).length;
                    const purgedTrains = Object.keys(currentConfig.dataPackTrains);
                    
                    // Remove from enabled trains
                    currentConfig.enabledTrains = currentConfig.enabledTrains.filter(
                        id => !purgedTrains.includes(id)
                    );
                    
                    currentConfig.dataPackTrains = {};
                    saveConfig(currentConfig);
                    
                    debugLogMessage("log", `Purged ${purgedCount} trains - all datapacks removed`);
                    showNotification(`Removed ${purgedCount} trains (datapacks uninstalled)`, 'info');
                }
                
                return null;
            }
            
            debugLogMessage("log", `Found ${datapackKeys.length} datapack(s): ${datapackKeys.join(', ')}`);
            
            // Load from each datapack
            datapackKeys.forEach(key => {
                const dataPackData = localStorage.getItem(key);
                if (dataPackData) {
                    try {
                        const parsed = JSON.parse(dataPackData);
                        
                        if (parsed.trains) {
                            Object.entries(parsed.trains).forEach(([trainId, trainData]) => {
                                // Ensure location data exists for DataPack trains
                                if (!trainData.location) {
                                    if (trainId.includes('(NYC)') || trainId.includes('NYC')) {
                                        trainData.location = { continent: "North America", country: "US", city: "New York City" };
                                    } else if (trainId.includes('(LDN)') || trainId.includes('LDN')) {
                                        trainData.location = { continent: "Europe", country: "UK", city: "London" };
                                    } else if (trainId.includes('(CPH)')) {
                                        trainData.location = { continent: "Europe", country: "Denmark", city: "Copenhagen" };
                                    } else if (trainId.includes('(MXC)')) {
                                        trainData.location = { continent: "North America", country: "Mexico", city: "Mexico City" };
                                    } else if (trainId.includes('(TOR)')) {
                                        trainData.location = { continent: "North America", country: "Canada", city: "Toronto" };
                                    } else if (trainId.includes('(MTL)')) {
                                        trainData.location = { continent: "North America", country: "Canada", city: "Montreal" };
                                    } else if (trainId.includes('(WSH)')) {
                                        trainData.location = { continent: "North America", country: "US", city: "Washington DC" };
                                    } else if (trainId.includes('(LA)')) {
                                        trainData.location = { continent: "North America", country: "US", city: "Los Angeles" };
                                    } else if (trainId.includes('(SD)')) {
                                        trainData.location = { continent: "North America", country: "US", city: "San Diego" };
                                    } else if (trainId.includes('(MSP)')) {
                                        trainData.location = { continent: "North America", country: "US", city: "Minneapolis" };
                                    } else if (trainId.includes('(ATL)')) {
                                        trainData.location = { continent: "North America", country: "US", city: "Atlanta" };
                                    } else if (trainId.includes('(SF)')) {
                                        trainData.location = { continent: "North America", country: "US", city: "San Francisco" };
                                    } else if (trainId.includes('(CGY)')) {
                                        trainData.location = { continent: "North America", country: "Canada", city: "Calgary" };
                                    } else if (trainId.includes('(VIE)')) {
                                        trainData.location = { continent: "Europe", country: "Austria", city: "Vienna" };
                                    } else if (trainId.includes('(BER)')) {
                                        trainData.location = { continent: "Europe", country: "Germany", city: "Berlin" };
                                    } else if (trainId.includes('(FRA)')) {
                                        trainData.location = { continent: "Europe", country: "France", city: "Lille" };
                                    } else if (trainId.includes('(VAN)')) {
                                        trainData.location = { continent: "North America", country: "Canada", city: "Vancouver" };
                                    } else {
                                        trainData.location = { continent: "DataPack", country: "Imported", city: "From DataPack" };
                                    }
                                }
                                
                                // Ensure tag exists for DataPack trains
                                if (!trainData.tag) {
                                    // Try to determine category from description or ID
                                    if (trainData.allowAtGradeRoadCrossing) {
                                        if (trainData.description && 
                                            (trainData.description.toLowerCase().includes('diesel') || 
                                             trainData.description.toLowerCase().includes('dmu'))) {
                                            trainData.tag = ["Diesel LRT"];
                                        } else {
                                            trainData.tag = ["Standard LRT"];
                                        }
                                    } else {
                                        trainData.tag = ["Standard Metro"];
                                    }
                                }
                                
                                // Store which datapack this train came from
                                trainData._datapackSource = key;
                                allDataPackTrains[trainId] = trainData;
                            });
                            
                            debugLogMessage("log", `Loaded ${Object.keys(parsed.trains).length} trains from ${key}`);
                        }
                    } catch (parseError) {
                        debugLogMessage("error", `Failed to parse datapack ${key}`, parseError);
                    }
                }
            });
            
            // Purge trains that are no longer in any datapack
            if (currentConfig.dataPackTrains) {
                const oldTrains = Object.keys(currentConfig.dataPackTrains);
                const newTrains = Object.keys(allDataPackTrains);
                const removedTrains = oldTrains.filter(id => !newTrains.includes(id));
                
                if (removedTrains.length > 0) {
                    // Remove from enabled trains
                    currentConfig.enabledTrains = currentConfig.enabledTrains.filter(
                        id => !removedTrains.includes(id)
                    );
                    
                    debugLogMessage("log", `Purged ${removedTrains.length} removed trains: ${removedTrains.join(', ')}`);
                    showNotification(
                        `Removed ${removedTrains.length} train(s) no longer in datapacks`,
                        'info'
                    );
                }
            }
            
            // Update config
            currentConfig.dataPackTrains = allDataPackTrains;
            saveConfig(currentConfig);
            
            debugLogMessage("log", `Total loaded: ${Object.keys(allDataPackTrains).length} trains from ${datapackKeys.length} datapack(s)`);
            
            return { trains: allDataPackTrains, sources: datapackKeys };
        } catch (e) {
            debugLogMessage("error", "Could not load DataPack data", e);
        }
        return null;
    }

    let currentConfig = loadConfig();
    
    // Try to load DataPack data on init
    setTimeout(() => {
        const datapackResult = loadDataFromDataPacks();
        
        // Validate datapack trains after loading
        if (datapackResult && datapackResult.trains) {
            const invalidTrains = [];
            
            Object.entries(datapackResult.trains).forEach(([trainId, train]) => {
                if (train.stats) {
                    const maxTrainLength = train.stats.carLength * train.stats.maxCars;
                    const minRequired = train.stats.minStationLength;
                    
                    if (maxTrainLength > (minRequired - 2)) {
                        invalidTrains.push({
                            id: trainId,
                            name: train.name || trainId,
                            maxLength: maxTrainLength,
                            minStation: minRequired,
                            issue: `Train too long: ${maxTrainLength.toFixed(1)}m > ${(minRequired - 2).toFixed(1)}m`
                        });
                    }
                }
            });
            
            // Store validation errors so UI can display them
            currentConfig.datapackValidationErrors = invalidTrains;
            saveConfig(currentConfig);
            
            if (invalidTrains.length > 0) {
                showNotification(
                    `⚠️ ${invalidTrains.length} datapack train(s) have validation errors. Open Add Trains menu to see details.`,
                    'warning',
                    15000
                );
                
                debugLogMessage("warn", `DataPack Validation Errors (${invalidTrains.length} trains):`);
                invalidTrains.forEach(t => {
                    debugLogMessage("warn", `  ${t.name}: ${t.issue}`);
                });
            } else {
                currentConfig.datapackValidationErrors = [];
                saveConfig(currentConfig);
                debugLogMessage("log", "All datapack trains validated successfully");
            }
        }
    }, 500);

    // --------------------------------------------------
    // TRACK COMPATIBILITY VALIDATION
    // --------------------------------------------------
    function validateTrackCompatibility(trains) {
        // Group trains by compatibleTrackTypes
        const trackGroups = {};
        
        Object.entries(trains).forEach(([trainId, train]) => {
            if (!train.compatibleTrackTypes || !train.stats) return;
            
            train.compatibleTrackTypes.forEach(trackType => {
                if (!trackGroups[trackType]) {
                    trackGroups[trackType] = [];
                }
                trackGroups[trackType].push({ id: trainId, name: train.name, train });
            });
        });
        
        // Check each track type group for compatibility
        const warnings = [];
        Object.entries(trackGroups).forEach(([trackType, trainsInGroup]) => {
            if (trainsInGroup.length > 1) {
                // Find the maximum requirements
                const minStations = trainsInGroup.map(t => t.train.stats.minStationLength || 0);
                const maxStations = trainsInGroup.map(t => t.train.stats.maxStationLength || 0);
                
                const requiredMin = Math.max(...minStations);
                const requiredMax = Math.max(...maxStations);
                
                // Check if all trains are compatible
                const incompatible = trainsInGroup.filter(({ train }) => 
                    (train.stats.minStationLength || 0) < requiredMin || 
                    (train.stats.maxStationLength || 0) < requiredMax
                );
                
                if (incompatible.length > 0) {
                    warnings.push({
                        trackType,
                        requiredMin,
                        requiredMax,
                        incompatible: incompatible.map(t => t.name || t.id),
                        allTrains: trainsInGroup.map(t => t.name || t.id)
                    });
                }
            }
        });
        
        // Show warnings
        if (warnings.length > 0) {
            warnings.forEach(w => {
                showNotification(
                    `⚠️ Track "${w.trackType}" needs stations ${w.requiredMin}-${w.requiredMax}m. ` +
                    `Incompatible: ${w.incompatible.join(', ')}`,
                    'warning',
                    8000
                );
            });
            
            debugLogMessage("warn", `Track compatibility warnings: ${warnings.length}`);
            warnings.forEach(w => {
                debugLogMessage("warn", `  ${w.trackType}: requires ${w.requiredMin}-${w.requiredMax}m, ` +
                    `incompatible trains: ${w.incompatible.join(', ')}`);
            });
        }
        
        return warnings;
    }
    
    // AUTO-FIX: Future-proofing station lengths for track compatibility
    /* AUTO-FIX COMMENTED OUT - Activate when devs has fixed compatibleTrackTypes
    function autoFixTrackCompatibility(trains) {
        const trackGroups = {};
        
        Object.entries(trains).forEach(([id, train]) => {
            // Skip fixed trains
            if (train.isFixed) return;
            if (!train.compatibleTrackTypes || !train.stats) return;
            
            train.compatibleTrackTypes.forEach(trackType => {
                if (!trackGroups[trackType]) trackGroups[trackType] = [];
                trackGroups[trackType].push({ id, train });
            });
        });
        
        const fixed = [];
        
        Object.entries(trackGroups).forEach(([trackType, group]) => {
            if (group.length <= 1) return;
            
            // Find maximum requirements
            const maxMin = Math.max(...group.map(t => t.train.stats.minStationLength || 0));
            const maxMax = Math.max(...group.map(t => t.train.stats.maxStationLength || 0));
            
            // Fix incompatible trains
            group.forEach(({ id, train }) => {
                const oldMin = train.stats.minStationLength;
                const oldMax = train.stats.maxStationLength;
                
                if (oldMin < maxMin || oldMax < maxMax) {
                    train.stats.minStationLength = maxMin;
                    train.stats.maxStationLength = maxMax;
                    
                    fixed.push({
                        id,
                        name: train.name,
                        trackType,
                        oldMin,
                        oldMax,
                        newMin: maxMin,
                        newMax: maxMax
                    });
                }
            });
        });
        
        if (fixed.length > 0) {
            showNotification(
                `Auto-fixed ${fixed.length} train(s) for track compatibility. Check console for details.`,
                'info',
                10000
            );
            
            debugLogMessage("log", `Auto-fixed ${fixed.length} trains for track compatibility:`);
            fixed.forEach(f => {
                debugLogMessage("log", `  ${f.name} (${f.trackType}): ${f.oldMin}-${f.oldMax}m → ${f.newMin}-${f.newMax}m`);
            });
        }
        
        return fixed;
    }
    */

    // --------------------------------------------------
    // GET TRAINS FOR REGISTRATION
    // --------------------------------------------------
    function getTrainsForRegistration() {
        const config = currentConfig || loadConfig();
        const trains = {};
        
        // Always include fixed trains
        Object.entries(REAL_TRAINS).forEach(([trainId, trainDef]) => {
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
            if (REAL_TRAINS[trainId] && !REAL_TRAINS[trainId].isFixed) {
                // Use custom version if exists, otherwise default
                if (config.customTrains && config.customTrains[trainId]) {
                    trains[trainId] = deepClone(config.customTrains[trainId]);
                } else {
                    trains[trainId] = deepClone(REAL_TRAINS[trainId]);
                }
            } else if (config.customTrains && config.customTrains[trainId]) {
                // Custom trains
                trains[trainId] = deepClone(config.customTrains[trainId]);
            } else if (config.dataPackTrains && config.dataPackTrains[trainId]) {
                // DataPack trains
                trains[trainId] = deepClone(config.dataPackTrains[trainId]);
            }
        });
        
        debugLogMessage("log", `Preparing ${Object.keys(trains).length} trains for registration`);
        return trains;
    }

    // --------------------------------------------------
    // TRAIN REGISTRATION WITH VALIDATION
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
        
        // AUTO-FIX KOMMENTERET UD - Aktiver når devs har rettet compatibleTrackTypes
        /* 
        // Auto-fix track compatibility FIRST
        autoFixTrackCompatibility(trains);
        */
        
        // Then validate track compatibility
        const trackWarnings = validateTrackCompatibility(trains);
        if (trackWarnings.length > 0) {
            debugLogMessage("warn", `Found ${trackWarnings.length} track compatibility issue(s)`);
        }
        
        let successCount = 0;
        let failCount = 0;
        let validationFailed = false;

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

        // Validate and register each train
        Object.entries(trains).forEach(([trainId, trainDef]) => {
            try {
                // Validate train length
                if (!validateTrainLength(trainDef)) {
                    validationFailed = true;
                    failCount++;
                    return;
                }

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

        // Verification
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

        const success = failCount === 0 && !validationFailed;
        if (validationFailed) {
            showNotification("Train registration failed: Some trains are too long!", 'error');
        } else {
            debugLogMessage(success ? "log" : "error", 
                `Registration: ${successCount} OK, ${failCount} failed`);
        }
        return success;
    }


    function validateTrainLength(train) {
        if (!train.stats) return true;
        
        const maxTrainLength = train.stats.carLength * train.stats.maxCars;
        const minRequiredLength = train.stats.minStationLength;
        
        if (maxTrainLength > (minRequiredLength - 2)) {
            return false;
        }
        
        return true;
    }


    // --------------------------------------------------
    // CREATE CUSTOM TRAIN
    // --------------------------------------------------
    function createCustomTrain(name, description, color) {
        const trainId = `custom-${++currentConfig.customTrainCounter}`;
        
        const newTrain = {
            id: trainId,
            name: name,
            description: description || "Custom train type",
            allowAtGradeRoadCrossing: false,
            tag: ["Metro"],
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
                scissorsCrossoverCost: 10000000,
                stopTimeSeconds: 90,
				parallelTrackSpacing: 3,
				trackClearance: 1.3,
				maxLateralAcceleration: 1,
				minTurnRadius: 155,
				minStationTurnRadius: 3000,
				maxSlopePercentage: 2.0
            },
            elevationMultipliers: BASE_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: [trainId],
            appearance: { color: color },
            isFixed: false,
            location: {
                continent: "Custom",
                country: "User Created",
                city: "Custom Trains"
            }
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
        return trainId;
    }

    // --------------------------------------------------
    // HYBRID TRAIN SELECTOR REACT COMPONENT
    // --------------------------------------------------
    function createHybridTrainSelector(React, components, icons) {
        const { useState } = React;
        
        // Helper components
        const Card = components.Card || ((props) => 
            React.createElement('div', {
                className: 'bg-background/50 rounded border',
                ...props
            }, props.children)
        );

        const Button = components.Button || ((props) => {
            const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 rounded-sm';
            const variantClasses = props.variant === 'destructive' 
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive/20' 
                : props.variant === 'secondary' 
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                : props.variant === 'ghost'
                ? 'bg-transparent hover:bg-accent hover:text-accent-foreground border-0'
                : '';
            
            return React.createElement('button', {
                className: `${baseClasses} ${variantClasses} ${props.className || ''}`,
                ...props
            }, props.children);
        });

        return function HybridTrainSelector({ onApply, initialEnabledTrains }) {
            const [enabledTrains, setEnabledTrains] = useState(() => {
                const enabledSet = new Set(initialEnabledTrains || []);
                
                // Always include fixed trains
                Object.entries(REAL_TRAINS).forEach(([trainId, trainDef]) => {
                    if (trainDef.isFixed) {
                        enabledSet.add(trainId);
                    }
                });
                
                // Include DataPack trains if enabled
                if (currentConfig.enabledTrains && currentConfig.dataPackTrains) {
                    Object.keys(currentConfig.dataPackTrains).forEach(trainId => {
                        if (currentConfig.enabledTrains.includes(trainId)) {
                            enabledSet.add(trainId);
                        }
                    });
                }
                
                return enabledSet;
            });
            
            const [expandedNodes, setExpandedNodes] = useState({
                'North America': true,
                'Europe': false,
                'Global': false,
                'Custom': false,
                'DataPack': false,
                'Uncategorized': false
            });
            
            const [searchQuery, setSearchQuery] = useState('');
            const tree = getTrainCategories();
            
            // Helper functions
            function getAllTrainsInNode(node) {
                if (Array.isArray(node)) {
                    return node.map(([trainId]) => trainId);
                }
                
                const trains = [];
                Object.values(node).forEach(child => {
                    trains.push(...getAllTrainsInNode(child));
                });
                return trains;
            }

            function getNodeStats(node) {
                if (Array.isArray(node)) {
                    return `${node.length} train${node.length !== 1 ? 's' : ''}`;
                }
                
                const totalTrains = getAllTrainsInNode(node).length;
                return `${totalTrains} train${totalTrains !== 1 ? 's' : ''}`;
            }

            function getCountryDisplayName(countryCode) {
                const countryNames = {
                    'AT': 'Austria',
                    'AU': 'Australia',
                    'CA': 'Canada',
                    'CH': 'Switzerland',
                    'CN': 'China',
                    'CZ': 'Czechia',
                    'DE': 'Germany',
                    'DK': 'Denmark',
                    'ES': 'Spain',
                    'FR': 'France',
                    'Generic': 'Generic Types',
                    'HU': 'Hungary',
                    'IE': 'Ireland',
                    'Imported': 'Imported',
                    'IN': 'India',
                    'IT': 'Italy',
                    'MX': 'Mexico',
                    'NL': 'Netherlands',
                    'NZ': 'New Zealand',
                    'TR': 'Turkey',
                    'UA': 'Ukraine',
                    'UK': 'United Kingdom',
                    'Unknown': 'Unknown',
                    'US': 'United States',
                    'User Created': 'User Created'
                }
				if (countryCode.includes(',')) {
					const codes = countryCode.split(',').map(c => c.trim());
					return codes.map(c => countryNames[c] || c).join(', ');
				};
                return countryNames[countryCode] || countryCode;
            }

            // Search functionality
            const handleSearch = (query) => {
                setSearchQuery(query);
            };

            // Toggle expand/collapse
            const toggleNode = (path) => {
                const pathKey = path.join('/');
                setExpandedNodes(prev => ({
                    ...prev,
                    [pathKey]: !prev[pathKey]
                }));
            };

            // Check if all trains in a node are enabled
            const isAllEnabled = (node, path) => {
                if (Array.isArray(node)) {
                    return node.every(([trainId]) => enabledTrains.has(trainId));
                }
                
                const allTrains = getAllTrainsInNode(node);
                return allTrains.length > 0 && allTrains.every(trainId => enabledTrains.has(trainId));
            };

            // Check if some (but not all) trains are enabled
            const isPartialEnabled = (node, path) => {
                if (Array.isArray(node)) {
                    const someEnabled = node.some(([trainId]) => enabledTrains.has(trainId));
                    const allEnabled = node.every(([trainId]) => enabledTrains.has(trainId));
                    return someEnabled && !allEnabled;
                }
                
                const allTrains = getAllTrainsInNode(node);
                if (allTrains.length === 0) return false;
                
                const someEnabled = allTrains.some(trainId => enabledTrains.has(trainId));
                const allEnabled = allTrains.every(trainId => enabledTrains.has(trainId));
                return someEnabled && !allEnabled;
            };

            // Bulk toggle for nodes
            const handleBulkToggle = (nodePath, enable) => {
                const nextEnabled = new Set(enabledTrains);
                
                // Get the node from the tree
                let currentNode = tree;
                for (const segment of nodePath) {
                    if (currentNode[segment]) {
                        currentNode = currentNode[segment];
                    } else {
                        return;
                    }
                }
                
                const trains = getAllTrainsInNode(currentNode);
                
                trains.forEach(trainId => {
                    const train = getTrainById(trainId);
                    if (!train || !train.isFixed) {
                        if (enable) {
                            nextEnabled.add(trainId);
                        } else {
                            nextEnabled.delete(trainId);
                        }
                    }
                });
                
                setEnabledTrains(nextEnabled);
                updateConfig(nextEnabled);
            };

            // Toggle individual train
            const toggleTrain = (trainId) => {
                const train = getTrainById(trainId);
                if (!train || train.isFixed) return;
                
                const next = new Set(enabledTrains);
                if (next.has(trainId)) {
                    next.delete(trainId);
                } else {
                    next.add(trainId);
                }
                setEnabledTrains(next);
                updateConfig(next);
            };

            function getTrainById(trainId) {
                return REAL_TRAINS[trainId] || 
                       currentConfig.customTrains?.[trainId] || 
                       currentConfig.dataPackTrains?.[trainId];
            }

            function updateConfig(enabledSet) {
                currentConfig.enabledTrains = Array.from(enabledSet).filter(id => {
                    const train = getTrainById(id);
                    return !train || !train.isFixed;
                });
                saveConfig(currentConfig);
            }

            // Train item component
            function TrainItem({ trainId, train, isEnabled, onToggle }) {
                const totalCapacity = train.stats?.capacityPerCar * train.stats?.minCars || 0;
                const isFixed = train.isFixed || false;
                const isCustom = trainId.startsWith('custom-');
                const isDataPack = currentConfig.dataPackTrains && currentConfig.dataPackTrains[trainId];
                
                return React.createElement('div', {
                    className: `px-4 py-3 bg-background/50 rounded border flex justify-between items-center mb-1 ${isFixed ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-accent/30'} transition-colors`,
                    onClick: isFixed ? undefined : () => onToggle(trainId)
                }, [
                    React.createElement('div', { key: 'info', className: 'flex-1' }, [
                        React.createElement('div', { 
                            className: 'font-medium flex items-center gap-2' 
                        }, [
                            React.createElement('div', {
                                key: 'color-indicator',
                                className: 'w-3 h-3 rounded-full',
                                style: { backgroundColor: train.appearance?.color || '#3b82f6' }
                            }),
                            train.name,
                            isFixed && React.createElement('span', {
                                className: 'px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full'
                            }, 'Fixed'),
                            isCustom && !isFixed && React.createElement('span', {
                                className: 'px-2 py-0.5 text-xs bg-purple-500/20 text-purple-500 rounded-full'
                            }, 'Custom'),
                            isDataPack && React.createElement('span', {
                                className: 'px-2 py-0.5 text-xs bg-green-500/20 text-green-500 rounded-full'
                            }, 'DataPack')
                        ]),
                        React.createElement('div', { 
                            className: 'text-sm text-muted-foreground line-clamp-1 mt-1' 
                        }, train.description),
                        React.createElement('div', { 
                            className: 'text-xs text-muted-foreground mt-1 flex gap-3' 
                        }, [
                            React.createElement('span', {}, `Capacity: ${totalCapacity}`),
                            React.createElement('span', {}, `Speed: ${train.stats?.maxSpeed || 0} m/s`),
                            React.createElement('span', {}, `Cars: ${train.stats?.minCars || 0}-${train.stats?.maxCars || 0}`)
                        ])
                    ]),
                    React.createElement('div', { className: 'flex items-center gap-2' }, [
                        React.createElement('label', {
                            className: `relative inline-flex items-center ${isFixed ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`
                        }, [
                            React.createElement('input', {
                                type: 'checkbox',
                                className: 'sr-only',
                                checked: isEnabled,
                                readOnly: true,
                                disabled: isFixed
                            }),
                            React.createElement('div', {
                                className: `w-11 h-6 border-2 border-transparent rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${isEnabled ? 'bg-primary' : 'bg-input'} ${isFixed ? 'cursor-not-allowed' : ''}`
                            }),
                            React.createElement('div', {
                                className: `absolute left-0.5 top-0.5 w-5 h-5 bg-background rounded-full shadow-lg transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'} ${isFixed ? 'cursor-not-allowed' : ''}`
                            })
                        ])
                    ])
                ]);
            }

            // Tree node component (recursive)
            function TreeNode({ node, nodeName, path = [], depth = 0 }) {
                const isLeaf = Array.isArray(node);
                const pathKey = path.join('/');
                const isExpanded = expandedNodes[pathKey] !== false;
                const nodeType = depth === 0 ? 'continent' : 
                                depth === 1 ? 'country' : 
                                depth === 2 ? 'city' : 
                                depth === 3 ? 'category' : 'train-list';
                
                // Get display name
                const displayName = depth === 1 ? getCountryDisplayName(nodeName) : nodeName;
                
                if (isLeaf) {
                    // Render train list
                    return React.createElement('div', { 
                        key: pathKey,
                        className: `train-list ${depth > 0 ? 'ml-8' : ''}`
                    }, node.map(([trainId, train]) => (
                        React.createElement(TrainItem, {
                            key: trainId,
                            trainId: trainId,
                            train: train,
                            isEnabled: enabledTrains.has(trainId),
                            onToggle: toggleTrain
                        })
                    )));
                }
                
                // For category nodes (depth 3)
                if (nodeType === 'category') {
                    const childEntries = Object.entries(node);
                    if (childEntries.length === 0) return null;
                    
                    return React.createElement('div', { 
                        key: pathKey,
                        className: 'category-group mb-3'
                    }, [
                        // Category header
                        React.createElement('div', {
                            className: 'category-header px-4 py-2 bg-background/40 rounded-t border-t border-x flex items-center cursor-pointer hover:bg-accent/20',
                            onClick: () => toggleNode(path)
                        }, [
                            childEntries.length > 0 && React.createElement('div', {
                                className: 'expand-toggle mr-2 w-6 h-6 flex items-center justify-center'
                            }, isExpanded ? '▼' : '▶'),
                            
                            React.createElement('h3', {
                                className: 'font-semibold text-base'
                            }, displayName),
                            
                            React.createElement('span', {
                                className: 'ml-2 text-xs bg-muted px-2 py-0.5 rounded'
                            }, getNodeStats(node))
                        ]),
                        
                        // Category content
                        isExpanded && childEntries.length > 0 && React.createElement('div', {
                            className: 'category-content border-x border-b rounded-b px-2 pb-2'
                        }, childEntries.map(([childName, childNode]) => (
                            React.createElement(TreeNode, {
                                key: childName,
                                node: childNode,
                                nodeName: childName,
                                path: [...path, childName],
                                depth: depth + 1
                            })
                        )))
                    ]);
                }
                
                // For continent/country/city nodes
                const childEntries = Object.entries(node);
                if (childEntries.length === 0) return null;
                
                const hasChildren = childEntries.length > 0;
                
                return React.createElement('div', { 
                    key: pathKey,
                    className: `tree-node ${nodeType} ${depth > 0 ? 'mb-1' : 'mb-3'}`
                }, [
                    // Node header
                    React.createElement('div', {
                        className: `node-header flex items-center px-4 py-3 ${nodeType === 'continent' ? 'bg-background/50' : 'bg-background/30'} rounded border cursor-pointer hover:bg-accent/20 transition-colors`,
                        onClick: () => hasChildren && toggleNode(path)
                    }, [
                        hasChildren && React.createElement('div', {
                            className: 'expand-toggle mr-2 w-6 h-6 flex items-center justify-center'
                        }, isExpanded ? '▼' : '▶'),
                        
                        // Bulk checkbox
                        React.createElement('input', {
                            type: 'checkbox',
                            className: 'bulk-checkbox mr-3 w-4 h-4',
                            checked: isAllEnabled(node, path),
                            ref: el => {
                                if (el) el.indeterminate = isPartialEnabled(node, path);
                            },
                            onChange: (e) => handleBulkToggle(path, e.target.checked),
                            onClick: (e) => e.stopPropagation()
                        }),
                        
                        // Node content
                        React.createElement('div', { className: 'node-content flex-1' }, [
                            React.createElement('span', {
                                className: `node-label ${nodeType === 'continent' ? 'text-lg font-semibold' : nodeType === 'country' ? 'font-medium' : ''}`
                            }, displayName),
                            React.createElement('span', {
                                className: 'node-stats ml-2 text-sm text-muted-foreground'
                            }, getNodeStats(node))
                        ])
                    ]),
                    
                    // Children
                    isExpanded && hasChildren && React.createElement('div', {
                        className: 'node-children ml-6 border-l border-border pl-4'
                    }, childEntries.map(([childName, childNode]) => (
                        React.createElement(TreeNode, {
                            key: childName,
                            node: childNode,
                            nodeName: childName,
                            path: [...path, childName],
                            depth: depth + 1
                        })
                    )))
                ]);
            }

            // Expand/collapse all
            const toggleAll = (expand) => {
                const newExpanded = {};
                
                function setExpansion(node, currentPath) {
                    const pathKey = currentPath.join('/');
                    newExpanded[pathKey] = expand;
                    
                    if (!Array.isArray(node)) {
                        Object.entries(node).forEach(([key, child]) => {
                            setExpansion(child, [...currentPath, key]);
                        });
                    }
                }
                
                Object.entries(tree).forEach(([continent, countries]) => {
                    setExpansion(countries, [continent]);
                });
                
                setExpandedNodes(newExpanded);
            };

            // Select all/none
            const selectAll = (select) => {
                const nextEnabled = new Set(enabledTrains);
                const allTrains = getAllTrainsInNode(tree);
                
                allTrains.forEach(trainId => {
                    const train = getTrainById(trainId);
                    if (!train || !train.isFixed) {
                        if (select) {
                            nextEnabled.add(trainId);
                        } else {
                            nextEnabled.delete(trainId);
                        }
                    }
                });
                
                setEnabledTrains(nextEnabled);
                updateConfig(nextEnabled);
            };

            // Apply changes
            const handleApply = () => {
                if (onApply) {
                    onApply();
                }
                showNotification('Train settings applied successfully!', 'success');
            };

            // Main render
            return React.createElement('div', { className: 'hybrid-selector w-full h-full flex flex-col' }, [
                // Control Bar
                React.createElement('div', {
                    key: 'control-bar',
                    className: 'control-bar p-4 border-b border-border bg-background/50 flex flex-wrap gap-3 items-center'
                }, [
                    React.createElement('div', {
                        className: 'search-container flex-1 min-w-[300px]'
                    }, [
                        React.createElement('input', {
                            type: 'text',
                            placeholder: 'Search trains, cities, or categories...',
                            value: searchQuery,
                            onChange: (e) => handleSearch(e.target.value),
                            className: 'w-full px-3 py-2 border border-input bg-background rounded text-sm'
                        })
                    ]),
                    
                    React.createElement('div', {
                        className: 'bulk-actions flex gap-2'
                    }, [
                        React.createElement(Button, {
                            onClick: () => toggleAll(!Object.values(expandedNodes).some(v => v)),
                            variant: 'secondary',
                            size: 'sm'
                        }, Object.values(expandedNodes).some(v => v) ? 'Collapse All' : 'Expand All'),
                        
                        React.createElement(Button, {
                            onClick: () => selectAll(true),
                            variant: 'secondary',
                            size: 'sm'
                        }, 'Select All'),
                        
                        React.createElement(Button, {
                            onClick: () => selectAll(false),
                            variant: 'secondary',
                            size: 'sm'
                        }, 'Select None')
                    ])
                ]),
                
                // Tree View
                React.createElement('div', {
                    key: 'tree-container',
                    className: 'tree-container flex-1 overflow-y-auto p-4'
                }, Object.entries(tree).map(([continentName, continentNode]) => (
                    React.createElement(TreeNode, {
                        key: continentName,
                        node: continentNode,
                        nodeName: continentName,
                        path: [continentName],
                        depth: 0
                    })
                ))),
                
                // Summary Bar
                React.createElement('div', {
                    key: 'summary-bar',
                    className: 'summary-bar p-4 border-t border-border bg-background/50 flex justify-between items-center'
                }, [
                    React.createElement('div', {
                        className: 'summary-stats text-sm text-muted-foreground'
                    }, [
                        `${enabledTrains.size} trains enabled`,
                        ' • ',
                        `${getAllTrainsInNode(tree).length} total trains`
                    ]),
                    
                    React.createElement(Button, {
                        onClick: handleApply,
                        className: 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }, 'Apply Changes')
                ])
            ]);
        };
    }

    // --------------------------------------------------
    // UPDATED ENABLE/DISABLE VIEW WITH NEW CATEGORIES
    // --------------------------------------------------
    function createReactUI() {
        const api = window.SubwayBuilderAPI;
        const React = api.utils?.React;
        const components = api.utils?.components || {};
        const icons = api.utils?.icons || {};
        
        if (!React) {
            debugLogMessage("error", "React not available");
            return null;
        }
		// --------------------------------------------------
		// GLOBAL ERROR CONTEXT
		// --------------------------------------------------
		const ErrorContext = React.createContext();

		function ErrorProvider({ children }) {
			const [errors, setErrors] = React.useState([]);
			const [showToast, setShowToast] = React.useState(false);

			const addError = (errorMessage) => {
				setErrors(prev => {
					const newErrors = [errorMessage, ...prev].slice(0, 5); // Max 5 errors
					return newErrors;
				});
				setShowToast(true);
				
				// Auto-hide after 8 seconds
				setTimeout(() => {
					setShowToast(false);
				}, 8000);
			};

			const clearErrors = () => {
				setErrors([]);
				setShowToast(false);
			};

			const value = {
				errors,
				showToast,
				addError,
				clearErrors
			};

			return React.createElement(ErrorContext.Provider, { value }, children);
		}

		function useError() {
			const context = React.useContext(ErrorContext);
			if (!context) {
				throw new Error('useError must be used within ErrorProvider');
			}
			return context;
		}


        // Main Menu Component
        function MainMenuButton() {
            const [isOpen, setIsOpen] = React.useState(false);
            const [activeView, setActiveView] = React.useState(null);
            const [selectedTrainForEdit, setSelectedTrainForEdit] = React.useState(null);
			const [hoveredTrain, setHoveredTrain] = React.useState(null);
            const [popupPosition, setPopupPosition] = React.useState({ x: 0, y: 0 });
            const { errors, showToast, addError, clearErrors } = useError();

            const openEnableDisable = () => {
                setActiveView('enable');
                setIsOpen(true);
            };

            const openEditTrain = () => {
                setActiveView('edit');
                setIsOpen(true);
            };

            const openCreateTrain = () => {
                setActiveView('create');
                setIsOpen(true);
            };
            
            const handleApplyWithFeedback = () => {
                // Clear old error
                clearErrors();
                
                // Run registrering function
                const success = registerTrainsToGame();
                
                if (!success) {
                    // Load error from debugLog
                    const errorMessages = debugLog
                        .filter(entry => entry.type === "error")
                        .slice(0, 5)
                        .map(e => e.message);
                    
                    // add validation error
                    if (currentConfig.datapackValidationErrors && currentConfig.datapackValidationErrors.length > 0) {
						currentConfig.datapackValidationErrors.slice(0, 3).forEach(err => {
							errorMessages.push(`${err.name}: ${err.issue || 'Train too long for station'}`);
						});
					}
                    
					// Add every error to global error state
                    errorMessages.forEach(msg => addError(msg));
					
					showNotification('An error occurred during train registration', 'error');
				} else {
					showNotification('Train updated correctly!', 'success');
					clearErrors();
				}
			};

            // Available components or fallbacks
            const Button = components.Button || ((props) => {
                const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 rounded-sm';
                const variantClasses = props.variant === 'destructive' 
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive/20' 
                    : props.variant === 'secondary' 
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    : props.variant === 'ghost'
                    ? 'bg-transparent hover:bg-accent hover:text-accent-foreground border-0'
                    : '';
                
                return React.createElement('button', {
                    className: `${baseClasses} ${variantClasses} ${props.className || ''}`,
                    ...props
                }, props.children);
            });

            const Card = components.Card || ((props) => 
                React.createElement('div', {
                    className: 'bg-background/50 rounded border',
                    ...props
                }, props.children)
            );

            const TrainIcon = icons.Train || (() => 
                React.createElement('span', { className: 'text-xl' }, '🚆')
            );

            // Fullscreen View Component
            function FullscreenView({ title, children, onBack }) {
                return React.createElement('div', {
                    className: 'absolute inset-0 w-full h-full overflow-auto bg-background'
                }, React.createElement('main', {
                    className: 'min-h-screen w-full px-4 md:px-8 lg:px-12 py-8 lg:py-12 overflow-y-auto'
                }, [
                    // Back button header
                    React.createElement('div', {
                        key: 'header',
                        className: 'w-full max-w-6xl mx-auto flex flex-col gap-6'
                    }, [
                        React.createElement('div', {
                            key: 'back-button',
                            className: 'w-full font-bold flex items-center justify-start bg-transparent text-primary cursor-pointer text-xl gap-1 overflow-visible whitespace-nowrap',
                            onClick: onBack
                        }, [
                            React.createElement('svg', {
                                width: "24",
                                height: "24",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                xmlns: "http://www.w3.org/2000/svg",
                                className: 'h-5 transition-transform overflow-visible flex-shrink-0 w-fit -ml-px',
                                style: { transform: 'rotate(180deg)', transitionDuration: '75ms' }
                            }, [
                                React.createElement('path', {
                                    d: "M12 4L20 12L12 20",
                                    stroke: "currentColor",
                                    strokeWidth: "4",
                                    strokeLinecap: "butt",
                                    strokeLinejoin: "inherit"
                                }),
                                React.createElement('path', {
                                    d: "M4 12H18",
                                    stroke: "currentColor",
                                    strokeWidth: "4",
                                    strokeLinecap: "square",
                                    strokeLinejoin: "inherit"
                                })
                            ]),
                            React.createElement('p', { className: 'flex-shrink-0' }, 'Back')
                        ]),
                        
                        // Main content
                        React.createElement('div', {
                            key: 'content',
                            className: 'w-full flex flex-col gap-6 min-h-full pb-6'
                        }, [
                            React.createElement('h1', {
                                key: 'title',
                                className: 'text-2xl font-bold'
                            }, title),
                            children
                        ])
                    ])
                ]));
            }

            // TOAST ERROR COMPONENT
            function ErrorToast() {
				const { errors, showToast, clearErrors } = useError();
				
				if (!showToast || errors.length === 0) return null;
				
				return React.createElement('div', {
					className: 'fixed bottom-4 right-4 z-[9999] w-96 max-w-full animate-in slide-in-from-right-5 duration-300',
					style: { animation: 'slideInRight 0.3s ease-out' }
				}, [
					React.createElement('div', {
						className: 'bg-destructive/10 border border-destructive/30 rounded-lg shadow-lg backdrop-blur-sm overflow-hidden'
					}, [
						// Header
						React.createElement('div', {
							className: 'bg-destructive text-destructive-foreground px-4 py-3 font-bold flex items-center gap-2'
						}, [
							React.createElement('svg', {
								xmlns: "http://www.w3.org/2000/svg",
								width: "20",
								height: "20",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "2",
								strokeLinecap: "round",
								strokeLinejoin: "round",
								className: "lucide lucide-alert-triangle"
							}, [
								React.createElement('path', { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }),
								React.createElement('path', { d: "M12 9v4" }),
								React.createElement('path', { d: "M12 17h.01" })
							]),
							errors.length === 1 ? 'Error' : 'Error during registration'
						]),
						
						// Content
						React.createElement('div', {
							className: 'p-4 bg-background/95'
						}, [
							React.createElement('ul', {
								className: 'text-sm space-y-1 list-disc ml-4'
							}, errors.map((err, i) => 
								React.createElement('li', { 
									key: i, 
									className: 'text-destructive/90'
								}, err)
							)),
							React.createElement('p', {
								className: 'text-xs text-muted-foreground mt-2 italic border-t pt-2'
							}, 'Please refer to the log for further details.')
						]),
						
						// Close button
						React.createElement('div', {
							className: 'border-t px-4 py-2 bg-muted/30 flex justify-end'
						}, [
							React.createElement(Button, {
								onClick: clearErrors,
								variant: 'ghost',
								size: 'sm',
								className: 'h-7 text-xs'
							}, 'Close')
						])
					])
				]);
			}

            // Enable/Disable View Component - UPDATED WITH NEW CATEGORIES
			function EnableDisableView() {
				const [enabledTrains, setEnabledTrains] = React.useState(() => {
					const enabledSet = new Set(currentConfig.enabledTrains || []);
					
					Object.entries(REAL_TRAINS).forEach(([trainId, trainDef]) => {
						if (trainDef.isFixed) {
							enabledSet.add(trainId);
						}
					});
					
					if (currentConfig.customTrains) {
						Object.entries(currentConfig.customTrains).forEach(([trainId, trainDef]) => {
							if (trainDef.isFixed) {
								enabledSet.add(trainId);
							}
						});
					}
					
					return enabledSet;
				});
				const { addError } = useError();
				
				// Build initial categories dynamically from all trains
				const buildInitialCategories = () => {
					const categories = { 
                        "Fixed Standard Trains": true,
                        "Metro": true,
                        "Automated Metro": true,
                        "LRT": true,
                        "Diesel LRT": true,
                        "Commuter": true,
                        "Diesel Commuter": true,
                        "S-Bahn": true,
                        "Automated S-Bahn": true,
                        "Rubber Metro": true,
                        "Automated Rubber Metro": true,
                        "Rubber LRT": true,
                        "People Mover": true,
                        "Dual-Mode Commuter": true,
                        "Hydrogen Commuter": true,
                    };
					
					return categories;
				};
				
				const [expandedCategories, setExpandedCategories] = React.useState(buildInitialCategories());
				
				const [selectedLocation, setSelectedLocation] = React.useState({
					continent: null,
					country: null,
					city: null,
					manufacturer: null
				});
				
				const [hoveredTrain, setHoveredTrain] = React.useState(null);
				const [hoverTimer, setHoverTimer] = React.useState(null);
				const [popupPosition, setPopupPosition] = React.useState({ x: 0, y: 0 });
				const popupRef = React.useRef(null);
				const hoveredTrainRef = React.useRef(null);
				
				// Get location tree for the dropdowns
				const locationTree = getTrainCategories();
				
				// Build list of all continents, countries, and cities
				const continents = Object.keys(locationTree);
				const countries = selectedLocation.continent ? 
					Object.keys(locationTree[selectedLocation.continent] || {}) : [];
				const cities = selectedLocation.continent && selectedLocation.country ? 
					Object.keys(locationTree[selectedLocation.continent]?.[selectedLocation.country] || {}) : [];
				
				// Normalize manufacturer names
				const normalizeManufacturer = (name) => {
					if (!name) return name;
					
					let normalized = name.trim();
					
					const caseMap = {
						'abb': 'ABB',
						'bombardier': 'Bombardier',
						'siemens': 'Siemens',
						'kawasaki': 'Kawasaki',
						'alstom': 'Alstom',
						'kinki-sharyo': 'Kinki Sharyo',
						'kinki sharyo': 'Kinki Sharyo',
						'nippon sharyo': 'Nippon Sharyo',
						'nippon-sharyo': 'Nippon Sharyo'
					};
					
					const lower = normalized.toLowerCase();
					if (caseMap[lower]) {
						return caseMap[lower];
					}
					
					normalized = normalized.replace(/-/g, ' ');
					normalized = normalized.replace(/\s+/g, ' ');
					
					return normalized;
				};
				
				// Build list of all manufacturers
				const manufacturers = React.useMemo(() => {
					const manufacturerSet = new Set();
					const allTrainsData = { 
						...REAL_TRAINS, 
						...(currentConfig.customTrains || {}), 
						...(currentConfig.dataPackTrains || {}) 
					};
					Object.values(allTrainsData).forEach(train => {
						if (train.manufacturer) {
							const trainManufacturers = Array.isArray(train.manufacturer) 
								? train.manufacturer 
								: [train.manufacturer];
							trainManufacturers.forEach(manufacturer => {
								if (manufacturer) {
									const normalized = normalizeManufacturer(manufacturer);
									manufacturerSet.add(normalized);
								}
							});
						}
					});
					return Array.from(manufacturerSet).sort();
				}, [currentConfig]);
				
				// Get country display name
				const getCountryDisplayName = (countryCode) => {
					const countryNames = {
						'AT': 'Austria',
						'AU': 'Australia',
						'CA': 'Canada',
						'CH': 'Switzerland',
						'CN': 'China',
						'CZ': 'Czechia',
						'DE': 'Germany',
						'DK': 'Denmark',
						'ES': 'Spain',
						'FR': 'France',
						'Generic': 'Generic Types',
						'HU': 'Hungary',
						'IE': 'Ireland',
						'Imported': 'Imported',
						'IN': 'India',
						'IT': 'Italy',
						'MX': 'Mexico',
						'NL': 'Netherlands',
						'NZ': 'New Zealand',
						'TR': 'Turkey',
						'UA': 'Ukraine',
						'UK': 'United Kingdom',
						'Unknown': 'Unknown',
						'US': 'United States',
						'User Created': 'User Created'
					};
					
					if (countryCode.includes(',')) {
						const codes = countryCode.split(',').map(c => c.trim());
						return codes.map(c => countryNames[c] || c).join(', ');
					}
					
					return countryNames[countryCode] || countryCode;
				};
				
				// Build categorized trains filtered by selected location
				const categorizedTrains = {
					"Fixed Standard Trains": [],
					"Metro": [],
					"Automated Metro": [],
					"LRT": [],
					"Diesel LRT": [],
					"Commuter": [],
					"Diesel Commuter": [],
					"S-Bahn": [],
					"Automated S-Bahn": [],
                    "Rubber Metro": [],
                    "Automated Rubber Metro": [],
                    "Rubber LRT": [],
                    "People Mover": [],
                    "Dual-Mode Commuter": [],
                    "Hydrogen Commuter": [],

				};
				
				// Collect all trains for quick access
				const allTrains = {};
				
				// Filter trains based on selected location
				function filterTrainsByLocation() {
					Object.keys(categorizedTrains).forEach(key => {
						categorizedTrains[key] = [];
					});
					
					Object.keys(allTrains).forEach(key => {
						delete allTrains[key];
					});
					
					// Helper function to traverse location tree and collect ALL trains
					function collectAllTrains(node, collected = new Map()) {
						if (Array.isArray(node)) {
							node.forEach(([trainId, train]) => {
								if (!collected.has(trainId)) {
									collected.set(trainId, train);
								}
							});
							return collected;
						}
						
						Object.values(node).forEach(child => {
							collectAllTrains(child, collected);
						});
						
						return collected;
					}
					
					// Collect all trains from the entire tree
					const allTrainsMap = collectAllTrains(locationTree);
					
					// Now filter the collected trains based on selected location
					allTrainsMap.forEach((train, trainId) => {
						let matchesContinent = !selectedLocation.continent;
						if (selectedLocation.continent) {
							const trainContinents = Array.isArray(train.location?.continent)
								? train.location.continent
								: [train.location?.continent || "Uncategorized"];
							matchesContinent = trainContinents.includes(selectedLocation.continent);
						}

						let matchesCountry = !selectedLocation.country;
						if (selectedLocation.country) {
							const trainCountries = Array.isArray(train.location?.country) 
								? train.location.country 
								: [train.location?.country || "Unknown"];
							
							const countryMap = {
								'US': 'United States',
								'CA': 'Canada',
								'UK': 'United Kingdom',
								'MX': 'Mexico'
							};
							
							matchesCountry = trainCountries.some(trainCountry => {
								if (trainCountry === selectedLocation.country) return true;
								if (countryMap[selectedLocation.country] === trainCountry) return true;
								const selectedCode = Object.keys(countryMap).find(code => countryMap[code] === selectedLocation.country);
								if (selectedCode === trainCountry) return true;
								return false;
							});
						}

						let matchesCity = !selectedLocation.city;
						if (selectedLocation.city) {
							const trainCities = Array.isArray(train.location?.city)  
								? train.location.city
								: [train.location?.city || "Unknown"];
							matchesCity = trainCities.includes(selectedLocation.city);
						}
						
						let matchesManufacturer = !selectedLocation.manufacturer;
						if (selectedLocation.manufacturer) {
							const trainManufacturers = Array.isArray(train.manufacturer)
								? train.manufacturer
								: [train.manufacturer];
							matchesManufacturer = trainManufacturers.includes(selectedLocation.manufacturer);
						}
						
						if (matchesContinent && matchesCountry && matchesCity && matchesManufacturer) {
							allTrains[trainId] = train;
							
							// Categorize the train based on tag
							let category = "Metro";
							
							if (train.isFixed) {
								category = "Fixed Standard Trains";
							} else if (train.tag && Array.isArray(train.tag) && train.tag.length > 0) {
								category = train.tag[0];
							}
							
							// Sikre at kategorien eksisterer
							if (!categorizedTrains[category]) {
								categorizedTrains[category] = [];
							}
							
							categorizedTrains[category].push([trainId, train]);
						}
					});
				}
				
				filterTrainsByLocation();
				
				// Cleanup timer on unmount
				React.useEffect(() => {
					return () => {
						if (hoverTimer) {
							clearTimeout(hoverTimer);
						}
					};
				}, [hoverTimer]);
				
				// Re-filter when location changes
				React.useEffect(() => {
					filterTrainsByLocation();
				}, [selectedLocation]);
				
				// Handle mouse enter on train item
				const handleMouseEnter = (trainId, train, e) => {
					if (hoverTimer) {
						clearTimeout(hoverTimer);
					}
					
					hoveredTrainRef.current = { trainId, train };
					
					const mouseX = e.clientX;
					const mouseY = e.clientY;
					const viewportWidth = window.innerWidth;
					const viewportHeight = window.innerHeight;
					
					const popupWidth = 360;
					const popupHeight = 600;
					
					let popupX, popupY;
					
					if (viewportWidth - mouseX > popupWidth + 20) {
						popupX = mouseX + 15;
					} else {
						popupX = mouseX - popupWidth - 15;
					}
					
					popupY = mouseY - (popupHeight / 2);
					
					popupX = Math.max(10, Math.min(popupX, viewportWidth - popupWidth - 10));
					popupY = Math.max(10, Math.min(popupY, viewportHeight - popupHeight - 10));
					
					setPopupPosition({ x: popupX, y: popupY });
					
					const timer = setTimeout(() => {
						if (hoveredTrainRef.current) {
							setHoveredTrain(hoveredTrainRef.current);
						}
					}, 1500);
					
					setHoverTimer(timer);
				};
				
				// Handle mouse leave from train item
				const handleMouseLeave = () => {
					if (hoverTimer) {
						clearTimeout(hoverTimer);
						setHoverTimer(null);
					}
					
					hoveredTrainRef.current = null;
					
					setTimeout(() => {
						if (!popupRef.current || !popupRef.current.matches(':hover')) {
							setHoveredTrain(null);
						}
					}, 50);
				};
				
				// Handle mouse enter on popup
				const handlePopupMouseEnter = () => {
					if (hoverTimer) {
						clearTimeout(hoverTimer);
						setHoverTimer(null);
					}
				};
				
				// Handle mouse leave from popup
				const handlePopupMouseLeave = () => {
					const timer = setTimeout(() => {
						setHoveredTrain(null);
					}, 300);
					
					setHoverTimer(timer);
				};
				
				// Delete custom train
				const deleteCustomTrain = (trainId, trainName) => {
					if (confirm(`Delete "${trainName}"? This action cannot be undone.`)) {
						if (currentConfig.customTrains && currentConfig.customTrains[trainId]) {
							delete currentConfig.customTrains[trainId];
						}
						
						currentConfig.enabledTrains = currentConfig.enabledTrains.filter(id => id !== trainId);
						saveConfig(currentConfig);
						
						const nextEnabled = new Set(enabledTrains);
						nextEnabled.delete(trainId);
						setEnabledTrains(nextEnabled);
						
						filterTrainsByLocation();
						
						showNotification(`Train "${trainName}" deleted`, 'success');
					}
				};
				
				// Toggle train enabled/disabled
				const toggleTrain = (trainId) => {
					const train = allTrains[trainId];
					if (!train || train.isFixed) {
						return;
					}
					
					const next = new Set(enabledTrains);
					if (next.has(trainId)) {
						next.delete(trainId);
					} else {
						const allTrainsData = { 
							...REAL_TRAINS, 
							...(currentConfig.customTrains || {}),
							...(currentConfig.dataPackTrains || {})
						};
						
						const nonFixedEnabled = Array.from(next).filter(id => {
							const t = allTrainsData[id];
							return t && !t.isFixed;
						});
						
						debugLogMessage("log", `Non-fixed enabled: ${nonFixedEnabled.length}/15`);
						
						if (nonFixedEnabled.length >= 15) {
							addError('Maximum 15 train types can be enabled (excluding fixed trains)');
							return;
						}
						
						next.add(trainId);
					}
					setEnabledTrains(next);
					currentConfig.enabledTrains = Array.from(next);
					saveConfig(currentConfig);
				};
				
				// Toggle category expand/collapse
				const toggleCategory = (category) => {
					setExpandedCategories(prev => ({
						...prev,
						[category]: !prev[category]
					}));
				};
				
				// Handle edit train
				const handleEditTrain = (trainId) => {
					setSelectedTrainForEdit(trainId);
					setActiveView('edit');
				};
				
				// Handle location selection
				const handleContinentChange = (continent) => {
					setSelectedLocation(prev => ({
						continent: continent || null,
						country: null,
						city: null,
						manufacturer: prev.manufacturer
					}));
				};
				
				const handleCountryChange = (country) => {
					setSelectedLocation(prev => ({
						...prev,
						country: country || null,
						city: null
					}));
				};
				
				const handleCityChange = (city) => {
					setSelectedLocation(prev => ({
						...prev,
						city: city || null
					}));
				};
				
				const clearLocationFilter = () => {
					setSelectedLocation({
						continent: null,
						country: null,
						city: null,
						manufacturer: null
					});
				};
				
				// Handle apply changes
				const handleApply = () => {
					const valid = registerTrainsToGame();
					if (valid) {
						showNotification('Train settings applied successfully!', 'success');
					}
					setIsOpen(false);
				};
				
				// Render train item
				const renderTrainItem = (trainId, train) => {
					const isCustom = trainId.startsWith('custom-');
					const isFixed = train.isFixed || false;
					const isEnabled = enabledTrains.has(trainId);
					const totalCapacity = train.stats.capacityPerCar * train.stats.minCars;
					
					return React.createElement('div', {
						key: trainId,
						className: `px-4 py-3 bg-background/50 rounded border flex justify-between items-center ${isFixed ? '' : 'cursor-pointer hover:bg-accent/50'} transition-colors group relative`,
						onClick: isFixed ? undefined : () => toggleTrain(trainId),
						onMouseEnter: (e) => handleMouseEnter(trainId, train, e),
						onMouseLeave: handleMouseLeave
					}, [
						React.createElement('div', { key: 'info', className: 'flex-1' }, [
							React.createElement('div', { 
								className: 'font-medium flex items-center gap-2' 
							}, [
								React.createElement('div', {
									key: 'color-indicator',
									className: 'w-3 h-3 rounded-full',
									style: { backgroundColor: train.appearance?.color || '#3b82f6' }
								}),
								train.name,
								isFixed && React.createElement('span', {
									className: 'px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full'
								}, 'Fixed'),
								isCustom && !isFixed && React.createElement('span', {
									className: 'px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full'
								}, 'Custom'),
								train.location && React.createElement('span', {
									className: 'px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full'
								}, `${train.location.city}`)
							]),
							React.createElement('div', { 
								className: 'text-sm text-muted-foreground line-clamp-2 mt-1' 
							}, train.description),
							React.createElement('div', { 
								className: 'text-xs text-muted-foreground mt-1 flex gap-3' 
							}, [
								React.createElement('span', {}, `Capacity: ${totalCapacity}`),
								React.createElement('span', {}, `Speed: ${train.stats.maxSpeed} m/s`),
								React.createElement('span', {}, `Cars: ${train.stats.minCars}-${train.stats.maxCars}`)
							])
						]),
						React.createElement('div', { className: 'flex items-center gap-2' }, [
							React.createElement('button', {
								onClick: (e) => {
									e.stopPropagation();
									handleEditTrain(trainId);
								},
								onMouseEnter: (e) => {
									e.stopPropagation();
									if (hoverTimer) {
										clearTimeout(hoverTimer);
										setHoverTimer(null);
									}
								},
								onMouseLeave: (e) => {
									e.stopPropagation();
								},
								className: 'px-2 py-1 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded border border-input hover:border-primary',
								title: 'Edit train'
							}, '✏️ Edit'),
							
							isCustom && !isFixed && React.createElement('button', {
								onClick: (e) => {
									e.stopPropagation();
									deleteCustomTrain(trainId, train.name);
								},
								className: 'p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity',
								title: 'Delete train'
							}, '🗑️'),
							
							React.createElement('label', {
								className: `relative inline-flex items-center ${isFixed ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`
							}, [
								React.createElement('input', {
									type: 'checkbox',
									className: 'sr-only',
									checked: isEnabled,
									readOnly: true,
									disabled: isFixed
								}),
								React.createElement('div', {
									className: `w-11 h-6 border-2 border-transparent rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${isEnabled ? 'bg-primary' : 'bg-input'} ${isFixed ? 'cursor-not-allowed' : ''}`
								}),
								React.createElement('div', {
									className: `absolute left-0.5 top-0.5 w-5 h-5 bg-background rounded-full shadow-lg transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'} ${isFixed ? 'cursor-not-allowed' : ''}`
								})
							])
						])
					]);
				};
				
				// Render category section
				const renderCategorySection = (categoryName, trains, description = '') => {
					if (!trains || trains.length === 0) return null;
					
					const isExpanded = expandedCategories[categoryName];
					
					return React.createElement('div', { key: categoryName, className: 'space-y-2' }, [
						React.createElement('div', {
							className: 'category-header px-4 py-3 bg-background/50 rounded border flex items-center cursor-pointer hover:bg-accent/20 transition-colors',
							onClick: () => toggleCategory(categoryName)
						}, [
							React.createElement('div', {
								className: 'expand-toggle mr-2 w-6 h-6 flex items-center justify-center'
							}, isExpanded ? '▼' : '▶'),
							
							React.createElement('div', { className: 'flex-1' }, [
								React.createElement('h2', {
									className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'
								}, [
									categoryName,
									React.createElement('span', { className: 'text-xs font-normal bg-muted px-2 py-0.5 rounded' }, 
										`${trains.length} type${trains.length !== 1 ? 's' : ''}`
									)
								]),
								description && React.createElement('p', { 
									className: 'text-sm text-muted-foreground mt-1' 
								}, description)
							])
						]),
						
						isExpanded && trains.length > 0 && React.createElement('div', { 
							className: 'category-content space-y-2 mt-2'
						}, trains.map(([trainId, train]) => 
							renderTrainItem(trainId, train)
						))
					]);
				};
				
				// Train Stats Popup Component
				function TrainStatsPopup() {
					if (!hoveredTrain) return null;
					
					const { trainId, train } = hoveredTrain;
					const isCustom = trainId.startsWith('custom-');
					const isFixed = train.isFixed || false;
					const maxTrainLength = train.stats.carLength * train.stats.maxCars;
					
					return React.createElement('div', {
						ref: popupRef,
						className: 'fixed z-50 bg-popover text-popover-foreground rounded-lg border shadow-lg backdrop-blur-sm',
						style: {
							left: `${popupPosition.x}px`,
							top: `${popupPosition.y}px`,
							width: '360px',
							maxHeight: '80vh',
							overflowY: 'auto'
						},
						onMouseEnter: handlePopupMouseEnter,
						onMouseLeave: handlePopupMouseLeave
					}, [
						React.createElement('div', {
							key: 'header',
							className: 'p-4 border-b flex items-center gap-3'
						}, [
							React.createElement('div', {
								className: 'w-8 h-8 rounded-full',
								style: { backgroundColor: train.appearance?.color || '#3b82f6' }
							}),
							React.createElement('div', { className: 'flex-1' }, [
								React.createElement('h3', { 
									className: 'font-bold text-lg'
								}, train.name),
								React.createElement('div', { 
									className: 'flex gap-2 mt-1'
								}, [
									isFixed && React.createElement('span', {
										className: 'px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full'
									}, 'Fixed'),
									isCustom && !isFixed && React.createElement('span', {
										className: 'px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full'
									}, 'Custom'),
									train.location && React.createElement('span', {
										className: 'px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full'
									}, `${train.location.city}, ${getCountryDisplayName(train.location.country)}`)
								])
							])
						]),
						
						React.createElement('div', {
							key: 'description',
							className: 'p-4 border-b'
						}, [
							React.createElement('p', { 
								className: 'text-sm text-muted-foreground'
							}, train.description)
						]),
						
						React.createElement('div', {
							key: 'stats',
							className: 'p-4 border-b'
						}, [
							React.createElement('h4', {
								className: 'font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground'
							}, 'Performance Stats'),
							
							React.createElement('div', { className: 'grid grid-cols-2 gap-3' }, [
								React.createElement('div', { key: 'col1', className: 'space-y-2' }, [
									createStatItem('Max Speed', `${train.stats.maxSpeed} m/s`),
									createStatItem('Station Speed', `${train.stats.maxSpeedLocalStation} m/s`),
									createStatItem('Acceleration', `${train.stats.maxAcceleration} m/s²`),
									createStatItem('Deceleration', `${train.stats.maxDeceleration} m/s²`),
									createStatItem('Capacity per Car', train.stats.capacityPerCar),
									createStatItem('Total Capacity', train.stats.capacityPerCar * train.stats.minCars)
								]),
								
								React.createElement('div', { key: 'col2', className: 'space-y-2' }, [
									createStatItem('Car Length', `${train.stats.carLength} m`),
									createStatItem('Train Width', `${train.stats.trainWidth || 3.0} m`),
									createStatItem('Max Train Length', `${maxTrainLength} m`),
									createStatItem('Min Cars', train.stats.minCars),
									createStatItem('Max Cars', train.stats.maxCars),
									createStatItem('Cars per Set', train.stats.carsPerCarSet)
								])
							])
						]),
						
						React.createElement('div', {
							key: 'costs',
							className: 'p-4 border-b'
						}, [
							React.createElement('h4', {
								className: 'font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground'
							}, 'Costs'),
							
							React.createElement('div', { className: 'grid grid-cols-2 gap-3' }, [
								createStatItem('Car Cost', `$${train.stats.carCost.toLocaleString()}`),
								createStatItem('Track Cost/m', `$${train.stats.baseTrackCost.toLocaleString()}`),
								createStatItem('Station Cost', `$${train.stats.baseStationCost.toLocaleString()}`),
								createStatItem('Scissors Crossover', `$${train.stats.scissorsCrossoverCost.toLocaleString()}`),
								createStatItem('Train Op. Cost/hr', `$${train.stats.trainOperationalCostPerHour}`),
								createStatItem('Car Op. Cost/hr', `$${train.stats.carOperationalCostPerHour}`),
                                createStatItem('stopTimeSeconds', `$${train.stats.stopTimeSeconds}`),
                                createStatItem('parallelTrackSpacing', `$${train.stats.parallelTrackSpacing}`),
                                createStatItem('trackClearance', `$${train.stats.trackClearance}`),
                                createStatItem('maxLateralAcceleration', `$${train.stats.maxLateralAcceleration}`),
                                createStatItem('minTurnRadius', `$${train.stats.minTurnRadius}`),
                                createStatItem('minStationTurnRadius', `$${train.stats.minStationTurnRadius}`),
                                createStatItem('maxSlopePercentage', `$${train.stats.maxSlopePercentage}`)
							])
						]),
						
						React.createElement('div', {
							key: 'elevation',
							className: 'p-4'
						}, [
							React.createElement('h4', {
								className: 'font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground'
							}, 'Elevation Cost Multipliers'),
							
							React.createElement('div', { className: 'space-y-2' }, [
								createMultiplierItem('Deep Bore', train.elevationMultipliers?.DEEP_BORE || 2.0),
								createMultiplierItem('Standard Tunnel', train.elevationMultipliers?.STANDARD_TUNNEL || 1.5),
								createMultiplierItem('Cut & Cover', train.elevationMultipliers?.CUT_AND_COVER || 1.2),
								createMultiplierItem('At Grade', train.elevationMultipliers?.AT_GRADE || 1.0),
								createMultiplierItem('Elevated', train.elevationMultipliers?.ELEVATED || 1.0)
							])
						])
					]);
					
					function createStatItem(label, value) {
						return React.createElement('div', { 
							key: label,
							className: 'flex justify-between items-center'
						}, [
							React.createElement('span', { 
								className: 'text-sm text-muted-foreground'
							}, label),
							React.createElement('span', { 
								className: 'text-sm font-medium font-mono'
							}, value)
						]);
					}
					
					function createMultiplierItem(label, value) {
						return React.createElement('div', { 
							key: label,
							className: 'flex justify-between items-center'
						}, [
							React.createElement('span', { 
								className: 'text-sm text-muted-foreground'
							}, label),
							React.createElement('span', { 
								className: 'text-sm font-medium font-mono bg-primary/10 text-primary px-2 py-1 rounded'
							}, `${value.toFixed(1)}x`)
						]);
					}
				}
				
				return React.createElement(FullscreenView, {
					title: 'Enable / Disable Trains',
					onBack: () => setActiveView(null)
				}, React.createElement(React.Fragment, null, [
					// Location Filter Bar
					React.createElement('div', {
						key: 'filter-bar',
						className: 'mb-6 p-4 bg-background/50 rounded border space-y-4'
					}, [
						React.createElement('div', {
							className: 'flex items-center justify-between'
						}, [
							React.createElement('h3', {
								className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
							}, 'Filter by Location'),
							
							React.createElement('div', { className: 'flex items-center gap-3' }, [
								(selectedLocation.continent || selectedLocation.country || selectedLocation.city || selectedLocation.manufacturer) && 
								React.createElement('button', {
									onClick: clearLocationFilter,
									className: 'text-xs text-muted-foreground hover:text-foreground'
								}, 'Clear Filter'),
								
								// Opdateret Disable All knap med korrekt styling
								React.createElement('button', {
									onClick: () => {
										const allTrainsData = { 
											...REAL_TRAINS, 
											...(currentConfig.customTrains || {}),
											...(currentConfig.dataPackTrains || {})
										};
										
										// Keep only fixed trains
										const fixedOnly = new Set();
										Object.entries(allTrainsData).forEach(([id, train]) => {
											if (train.isFixed) {
												fixedOnly.add(id);
											}
										});
										
										setEnabledTrains(fixedOnly);
										currentConfig.enabledTrains = Array.from(fixedOnly);
										saveConfig(currentConfig);
										
										showNotification('Disabled all non-fixed trains', 'success');
										debugLogMessage("log", "Disabled all non-fixed trains");
									},
									className: 'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 rounded-sm'
								}, 'Disable All Trains')
							])
						]),
						
						React.createElement('div', {
							className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'
						}, [
							// Continent Selector
							React.createElement('div', { key: 'continent' }, [
								React.createElement('label', {
									className: 'block text-xs font-medium mb-1 text-muted-foreground'
								}, 'Continent'),
								React.createElement('select', {
									value: selectedLocation.continent || '',
									onChange: (e) => handleContinentChange(e.target.value || null),
									className: 'w-full p-2 border border-input bg-background rounded text-sm'
								}, [
									React.createElement('option', { key: 'all', value: '' }, 'All Continents'),
									...continents.map(continent => 
										React.createElement('option', { key: continent, value: continent }, continent)
									)
								])
							]),
							
							// Country Selector
							React.createElement('div', { key: 'country' }, [
								React.createElement('label', {
									className: 'block text-xs font-medium mb-1 text-muted-foreground'
								}, 'Country'),
								React.createElement('select', {
									value: selectedLocation.country || '',
									onChange: (e) => handleCountryChange(e.target.value || null),
									disabled: !selectedLocation.continent,
									className: `w-full p-2 border border-input rounded text-sm ${!selectedLocation.continent ? 'bg-muted cursor-not-allowed' : 'bg-background'}`
								}, [
									React.createElement('option', { key: 'all', value: '' }, 'All Countries'),
									...countries.map(country => 
										React.createElement('option', { key: country, value: country }, getCountryDisplayName(country))
									)
								])
							]),
							
							// City Selector
							React.createElement('div', { key: 'city' }, [
								React.createElement('label', {
									className: 'block text-xs font-medium mb-1 text-muted-foreground'
								}, 'City'),
								React.createElement('select', {
									value: selectedLocation.city || '',
									onChange: (e) => handleCityChange(e.target.value || null),
									disabled: !selectedLocation.country,
									className: `w-full p-2 border border-input rounded text-sm ${!selectedLocation.country ? 'bg-muted cursor-not-allowed' : 'bg-background'}`
								}, [
									React.createElement('option', { key: 'all', value: '' }, 'All Cities'),
									...cities.map(city => 
										React.createElement('option', { key: city, value: city }, city)
									)
								])
							]),
							
							// Manufacturer Selector
							React.createElement('div', { key: 'manufacturer' }, [
								React.createElement('label', {
									className: 'block text-xs font-medium mb-1 text-muted-foreground'
								}, 'Manufacturer'),
								React.createElement('select', {
									value: selectedLocation.manufacturer || '',
									onChange: (e) => setSelectedLocation({ ...selectedLocation, manufacturer: e.target.value || null }),
									className: 'w-full p-2 border border-input bg-background rounded text-sm'
								}, [
									React.createElement('option', { key: 'all', value: '' }, 'All Manufacturers'),
									...manufacturers.map(manufacturer => 
										React.createElement('option', { key: manufacturer, value: manufacturer }, manufacturer)
									)
								])
							])
						]),
						
						// Active filter display
						(selectedLocation.continent || selectedLocation.country || selectedLocation.city || selectedLocation.manufacturer) && 
						React.createElement('div', {
							className: 'text-xs text-muted-foreground p-2 bg-primary/5 rounded border border-primary/10'
						}, [
							React.createElement('span', { className: 'font-medium' }, 'Active Filter: '),
							[
								selectedLocation.continent,
								selectedLocation.country && getCountryDisplayName(selectedLocation.country),
								selectedLocation.city,
								selectedLocation.manufacturer && `(${selectedLocation.manufacturer})`
							].filter(Boolean).join(' → ')
						])
					]),
					
					// Main content - Categories with filtered trains
					React.createElement('div', { key: 'main-content', className: 'space-y-6' }, [
						renderCategorySection(
							"Fixed Standard Trains",
							categorizedTrains["Fixed Standard Trains"],
							"Always enabled, cannot be disabled"
						),
						renderCategorySection(
							"Standard Metro",
							categorizedTrains["Metro"],
							"Conventional metro systems with steel wheels"
						),
						renderCategorySection(
							"Automated Metro",
							categorizedTrains["Automated Metro"],
							"Driverless metro systems (GoA4)"
						),
                        renderCategorySection(
							"Rubber Metro",
							categorizedTrains["Rubber Metro"],
							"Conventional metro systems with rubber tyres"
						),
                        renderCategorySection(
							"Automated Rubber Metro",
							categorizedTrains["Automated Rubber Metro"],
							"Driverless rubber tyre metro systems (GoA4)"
						),
						renderCategorySection(
							"Standard LRT",
							categorizedTrains["LRT"],
							"Light rail and tram systems"
						),
						renderCategorySection(
							"Diesel LRT",
							categorizedTrains["Diesel LRT"],
							"Diesel-powered light rail vehicles"
						),
                        renderCategorySection(
							"Rubber LRT",
							categorizedTrains["Rubber LRT"],
							"Light rail and tram systems with rubber tyres"
						),
						renderCategorySection(
							"Standard Commuter",
							categorizedTrains["Commuter"],
							"Electric commuter and regional rail"
						),
						renderCategorySection(
							"People Mover",
							categorizedTrains["People Mover"],
							"Automated People Movers like in airports"
						),
                        renderCategorySection(
							"Dual-Mode Commuter",
							categorizedTrains["Dual-Mode Commuter"],
							"Dual-Mode (Diesel and Electric) commuter trains"
						),
                        renderCategorySection(
							"Hydrogen Commuter",
							categorizedTrains["Hydrogen Commuter"],
							"Hydrogen-powered commuter trains"
						),
                        renderCategorySection(
							"Diesel Commuter",
							categorizedTrains["Diesel Commuter"],
							"Diesel-powered commuter trains"
						),
						renderCategorySection(
							"Standard S-Bahn",
							categorizedTrains["S-Bahn"],
							"S-Bahn / hybrid commuter-rapid transit"
						),
						renderCategorySection(
							"Automated S-Bahn",
							categorizedTrains["Automated S-Bahn"],
							"Driverless S-Bahn systems"
						)
					]),
					
					// Actions
					React.createElement('div', {
						key: 'actions',
						className: 'space-y-2 mt-6 pt-4 border-t'
					}, [
						React.createElement('div', {
							className: 'flex gap-2'
						}, [
							React.createElement(Button, {
								onClick: () => setActiveView(null),
								variant: 'secondary',
								className: 'flex-1'
							}, 'Back'),
							React.createElement(Button, {
								onClick: handleApplyWithFeedback, // Brug den nye handler med feedback
								className: 'flex-1'
							}, 'Apply Changes')
						])
					]),
					
					// Train Stats Popup
					React.createElement(TrainStatsPopup, { key: 'popup' })
				]));
			}

            // Edit Train View Component
            function EditTrainView() {
                // Get all available trains including datapacks
                const allAvailableTrains = { 
                    ...REAL_TRAINS, 
                    ...(currentConfig.customTrains || {}),
                    ...(currentConfig.dataPackTrains || {})
                };
                
                // Initialize with selectedTrainForEdit if provided
                const initialTrainId = selectedTrainForEdit || Object.keys(allAvailableTrains)[0];
                const [selectedTrainId, setSelectedTrainId] = React.useState(initialTrainId);
                const [trainData, setTrainData] = React.useState({});
                const [showApply, setShowApply] = React.useState(true);
                const [isCustomTrain, setIsCustomTrain] = React.useState(false);
                
                // Update selectedTrainId when selectedTrainForEdit changes
                React.useEffect(() => {
                    if (selectedTrainForEdit && selectedTrainForEdit !== selectedTrainId) {
                        setSelectedTrainId(selectedTrainForEdit);
                    }
                }, [selectedTrainForEdit]);
                
                // Clear selectedTrainForEdit on unmount
                React.useEffect(() => {
                    return () => {
                        if (selectedTrainForEdit) {
                            setSelectedTrainForEdit(null);
                        }
                    };
                }, []);
                
                const handleDelete = () => {
                    if (confirm(`Are you sure you want to delete "${trainData.name}"? This action cannot be undone.`)) {
                        // Remove from customTrains
                        if (currentConfig.customTrains && currentConfig.customTrains[selectedTrainId]) {
                            delete currentConfig.customTrains[selectedTrainId];
                        }
                        
                        // Remove from enabledTrains
                        currentConfig.enabledTrains = currentConfig.enabledTrains.filter(id => id !== selectedTrainId);
                        
                        // Save config
                        saveConfig(currentConfig);
                        
                        // Reset to first available train
                        const availableTrains = Object.keys(allAvailableTrains);
                        if (availableTrains.length > 0) {
                            setSelectedTrainId(availableTrains[0]);
                            const nextTrain = allAvailableTrains[availableTrains[0]];
                            setTrainData(deepClone(nextTrain));
                            setIsCustomTrain(availableTrains[0].startsWith('custom-'));
                        } else {
                            setSelectedTrainId('');
                            setTrainData({});
                            setIsCustomTrain(false);
                        }
                        
                        showNotification(`Train "${trainData.name}" deleted`, 'success');
                    }
                };
				
				React.useEffect(() => {
					const handleMouseMove = (e) => {
						if (hoveredTrain) {
							setPopupPosition({ x: e.clientX + 15, y: e.clientY - 50 });
						}
					};
					
					window.addEventListener('mousemove', handleMouseMove);
					return () => window.removeEventListener('mousemove', handleMouseMove);
				}, [hoveredTrain]);
				
                React.useEffect(() => {
                    // Load train from all sources including datapacks
                    const train = allAvailableTrains[selectedTrainId];
                    if (train) {
                        setTrainData(deepClone(train));
                        setIsCustomTrain(selectedTrainId.startsWith('custom-'));
                        // Validate length on load
                        validateLength(train);
                    }
                }, [selectedTrainId]);

                const validateLength = (train) => {
                    if (!train.stats) {
                        setShowApply(true);
                        return;
                    }
                    
                    const maxTrainLength = train.stats.carLength * train.stats.maxCars;
                    const minRequiredLength = train.stats.minStationLength;
                    const isValid = maxTrainLength <= (minRequiredLength - 2);
                    setShowApply(isValid);
                    
                    if (!isValid) {
                        showNotification(
                            `Warning: Train is too long! Minimum station length must be at least ${maxTrainLength + 2}m`,
                            'warning'
                        );
                    }
                };

                const updateStat = (statKey, value) => {
                    setTrainData(prev => {
                        const newData = deepClone(prev);
                        if (!newData.stats) newData.stats = {};
                        
                        // Handle different value types
                        if (typeof value === 'string') {
                            // Convert to number if it looks like a number
                            if (!isNaN(value) && value.trim() !== '') {
                                value = statKey.includes('Speed') || statKey.includes('Acceleration') || statKey.includes('Deceleration') 
                                    ? parseFloat(value) 
                                    : parseInt(value);
                            }
                        }
                        
                        newData.stats[statKey] = value;
                        
                        // Validate length when relevant stats change
                        if (['carLength', 'maxCars', 'minStationLength'].includes(statKey)) {
                            validateLength(newData);
                        }
                        
                        return newData;
                    });
                };

                const updateField = (field, value) => {
                    setTrainData(prev => ({ ...prev, [field]: value }));
                };
                
                const updateAppearance = (field, value) => {
                    setTrainData(prev => {
                        const newData = deepClone(prev);
                        if (!newData.appearance) newData.appearance = {};
                        newData.appearance[field] = value;
                        return newData;
                    });
                };
                
                const updateElevationMultiplier = (elevationType, value) => {
                    setTrainData(prev => {
                        const newData = deepClone(prev);
                        if (!newData.elevationMultipliers) newData.elevationMultipliers = {};
                        newData.elevationMultipliers[elevationType] = parseFloat(value);
                        return newData;
                    });
                };

                const handleSave = () => {
                    if (!validateTrainLength(trainData)) {
                        return;
                    }

                    if (!currentConfig.customTrains) {
                        currentConfig.customTrains = {};
                    }
                    currentConfig.customTrains[selectedTrainId] = deepClone(trainData);
                    
                    if (!currentConfig.enabledTrains.includes(selectedTrainId)) {
                        currentConfig.enabledTrains.push(selectedTrainId);
                    }
                    
                    saveConfig(currentConfig);
                    showNotification('Train changes saved!', 'success');
                };

                const handleReset = () => {
                    if (confirm('Reset to default values? This will remove any customizations.')) {
                        if (currentConfig.customTrains && currentConfig.customTrains[selectedTrainId]) {
                            delete currentConfig.customTrains[selectedTrainId];
                            saveConfig(currentConfig);
                            
                            const defaultTrain = REAL_TRAINS[selectedTrainId];
                            if (defaultTrain) {
                                setTrainData(deepClone(defaultTrain));
                            }
                            showNotification('Train reset to defaults!', 'success');
                        }
                    }
                };

                const handleApply = () => {
                    handleSave();
                    registerTrainsToGame();
                };

                // Calculate max train length for validation message
                const maxTrainLength = trainData.stats?.carLength * trainData.stats?.maxCars || 0;
                const minStationLength = trainData.stats?.minStationLength || 0;
                const isValidLength = maxTrainLength <= (minStationLength - 2);
                // Check if train name has content for validation message
                const isValidName = trainData.name && trainData.name.trim().length > 0; 
                
                // Helper function for slider components
                const createStatSlider = (label, statKey, min, max, step, unit = '') => {
                    const value = trainData.stats?.[statKey] || min;
                    const displayValue = `${value}${unit}`;
                    
                    return React.createElement('div', { key: statKey, className: 'mb-4' }, [
                        React.createElement('div', {
                            key: 'label-row',
                            className: 'flex justify-between items-center mb-2'
                        }, [
                            React.createElement('label', {
                                className: 'text-sm font-medium'
                            }, label),
                            React.createElement('span', {
                                className: 'text-sm font-mono font-semibold text-primary'
                            }, displayValue)
                        ]),
                        React.createElement('input', {
                            type: 'range',
                            min: min,
                            max: max,
                            step: step,
                            value: value,
                            onChange: (e) => updateStat(statKey, parseFloat(e.target.value)),
                            className: 'w-full h-2 bg-input rounded-lg appearance-none cursor-pointer',
                            style: {
                                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
                                WebkitAppearance: 'none',
                                height: '8px',
                                borderRadius: '4px'
                            }
                        })
                    ]);
                };

                const createElevationSlider = (label, elevationType, min, max, step) => {
                    const value = trainData.elevationMultipliers?.[elevationType] || min;
                    const displayValue = `${value.toFixed(1)}x`;
                    
                    return React.createElement('div', { key: elevationType, className: 'mb-3' }, [
                        React.createElement('div', {
                            key: 'label-row',
                            className: 'flex justify-between items-center mb-2'
                        }, [
                            React.createElement('label', {
                                className: 'text-sm font-medium'
                            }, label),
                            React.createElement('span', {
                                className: 'text-sm font-mono font-semibold text-primary'
                            }, displayValue)
                        ]),
                        React.createElement('input', {
                            type: 'range',
                            min: min,
                            max: max,
                            step: step,
                            value: value,
                            onChange: (e) => updateElevationMultiplier(elevationType, parseFloat(e.target.value)),
                            className: 'w-full h-2 bg-input rounded-lg appearance-none cursor-pointer',
                            style: {
                                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
                                WebkitAppearance: 'none',
                                height: '8px',
                                borderRadius: '4px'
                            }
                        })
                    ]);
                };

                // allAvailableTrains already declared at top of EditTrainView function

                return React.createElement(FullscreenView, {
                    title: 'Edit Train Statistics',
                    onBack: () => setActiveView(null)
                }, React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-8' }, [
                    // Left column - Basic settings and selection
                    React.createElement('div', { key: 'left', className: 'flex flex-col gap-6' }, [
                        // Train selection
                        React.createElement('div', { key: 'select', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Select Train'),
                            React.createElement('div', { className: 'px-4 py-3 bg-background/50 rounded border' }, 
                                React.createElement('div', { className: 'flex flex-col gap-2' }, [
                                    React.createElement('label', {
                                        className: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                    }, 'Train Type'),
                                    React.createElement('button', {
                                        type: 'button',
                                        role: 'combobox',
                                        className: 'backdrop-blur-sm border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*="text-"])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-muted/50 flex items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 w-full',
                                        onClick: () => {
                                            // Create dropdown menu
                                            const dropdown = document.createElement('div');
                                            dropdown.className = 'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md';
                                            dropdown.style.position = 'absolute';
                                            dropdown.style.width = '300px';
                                            
                                            Object.entries(allAvailableTrains).forEach(([id, train]) => {
                                                const item = document.createElement('div');
                                                item.className = 'relative flex cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground';
                                                item.textContent = train.isFixed ? train.name : id.startsWith('custom-') ? `${train.name} (Custom)` : train.name;
                                                item.onclick = () => {
                                                    setSelectedTrainId(id);
                                                    dropdown.remove();
                                                };
                                                dropdown.appendChild(item);
                                            });
                                            
                                            const trigger = document.activeElement;
                                            const rect = trigger.getBoundingClientRect();
                                            dropdown.style.left = `${rect.left}px`;
                                            dropdown.style.top = `${rect.bottom}px`;
                                            document.body.appendChild(dropdown);
                                            
                                            // Close on click outside
                                            const closeDropdown = (e) => {
                                                if (!dropdown.contains(e.target) && e.target !== trigger) {
                                                    dropdown.remove();
                                                    document.removeEventListener('click', closeDropdown);
                                                }
                                            };
                                            setTimeout(() => document.addEventListener('click', closeDropdown), 0);
                                        }
                                    }, [
                                        React.createElement('span', {
                                            key: 'value',
                                            style: { pointerEvents: 'none' }
                                        }, trainData.name || 'Select a train'),
                                        React.createElement('svg', {
                                            key: 'icon',
                                            xmlns: "http://www.w3.org/2000/svg",
                                            width: "24",
                                            height: "24",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            className: "lucide lucide-chevron-down size-4 opacity-50",
                                            "aria-hidden": "true"
                                        }, React.createElement('path', { d: "m6 9 6 6 6-6" }))
                                    ])
                                ])
                            )
                        ]),

                        // Validation warning
                        !isValidLength && React.createElement('div', {
                            key: 'warning',
                            className: 'p-4 bg-destructive/10 border border-destructive/20 rounded flex items-start gap-3'
                        }, [
                            React.createElement('div', {
                                className: 'w-10 h-10 rounded-md bg-destructive/10 flex items-center justify-center shrink-0'
                            }, React.createElement('svg', {
                                xmlns: "http://www.w3.org/2000/svg",
                                width: "24",
                                height: "24",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                className: "lucide lucide-triangle-alert w-5 h-5 text-destructive"
                            }, [
                                React.createElement('path', { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }),
                                React.createElement('path', { d: "M12 9v4" }),
                                React.createElement('path', { d: "M12 17h.01" })
                            ])),
                            React.createElement('div', { className: 'flex-1' }, [
                                React.createElement('div', { 
                                    className: 'font-medium text-destructive' 
                                }, 'Train Length Warning'),
                                React.createElement('div', { 
                                    className: 'text-sm text-muted-foreground mt-1' 
                                }, `Maximum train length (${maxTrainLength}m) must be at least 2m less than minimum station length (${minStationLength}m).`),
                                React.createElement('div', { 
                                    className: 'text-sm font-mono text-destructive mt-1' 
                                }, `Required: minStationLength > ${maxTrainLength + 2}m`)
                            ])
                        ]),

                        // Length summary
                        React.createElement('div', {
                            key: 'length-summary',
                            className: 'p-4 bg-primary/5 border border-primary/20 rounded'
                        }, [
                            React.createElement('div', { 
                                className: 'text-sm font-medium text-primary mb-1' 
                            }, 'Length Summary'),
                            React.createElement('div', { 
                                className: 'text-xs text-muted-foreground grid grid-cols-2 gap-2' 
                            }, [
                                React.createElement('div', { key: 'train' }, `Max Train Length: ${maxTrainLength}m`),
                                React.createElement('div', { key: 'station' }, `Min Station: ${minStationLength}m`),
                                React.createElement('div', { key: 'status' }, `Status: ${isValidLength ? '✅ Valid' : '❌ Invalid'}`)
                            ])
                        ]),

                        // BASIC INFORMATION SECTION
                        React.createElement('div', { key: 'basic-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Basic Information'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'space-y-4' }, [
                                    // Name and Description
                                    React.createElement('div', { key: 'name-desc', className: 'grid grid-cols-1 gap-4' }, [
                                        React.createElement('div', { key: 'name' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Train Name'),
                                            React.createElement('input', {
                                                type: 'text',
                                                value: trainData.name || '',
                                                onChange: (e) => updateField('name', e.target.value),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'desc' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Description'),
                                            React.createElement('textarea', {
                                                value: trainData.description || '',
                                                onChange: (e) => updateField('description', e.target.value),
                                                rows: 2,
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ])
                                    ]),

                                    // Color and Road Crossing
                                    React.createElement('div', { key: 'color-crossing', className: 'grid grid-cols-2 gap-4' }, [
                                        React.createElement('div', { key: 'color' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Color'),
                                            React.createElement('div', { className: 'flex items-center gap-3' }, [
                                                React.createElement('input', {
                                                    type: 'color',
                                                    value: trainData.appearance?.color || '#3b82f6',
                                                    onChange: (e) => updateAppearance('color', e.target.value),
                                                    className: 'w-10 h-10 cursor-pointer rounded border border-input'
                                                }),
                                                React.createElement('span', { 
                                                    className: 'text-sm font-mono text-muted-foreground' 
                                                }, trainData.appearance?.color || '#3b82f6')
                                            ])
                                        ]),
                                        
                                        React.createElement('div', { key: 'crossing' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Road Crossing'),
                                            React.createElement('div', { 
                                                className: 'flex items-center h-10 mt-2'
                                            }, [
                                                React.createElement('input', {
                                                    type: 'checkbox',
                                                    id: 'road-crossing',
                                                    checked: trainData.allowAtGradeRoadCrossing || false,
                                                    onChange: (e) => updateField('allowAtGradeRoadCrossing', e.target.checked),
                                                    className: 'sr-only peer'
                                                }),
                                                React.createElement('label', {
                                                    htmlFor: 'road-crossing',
                                                    className: 'relative inline-flex items-center cursor-pointer'
                                                }, [
                                                    React.createElement('div', {
                                                        className: `w-11 h-6 border-2 border-transparent rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${trainData.allowAtGradeRoadCrossing ? 'bg-primary' : 'bg-input'}`
                                                    }),
                                                    React.createElement('div', {
                                                        className: `absolute left-0.5 top-0.5 w-5 h-5 bg-background rounded-full shadow-lg transition-transform ${trainData.allowAtGradeRoadCrossing ? 'translate-x-5' : 'translate-x-0'}`
                                                    })
                                                ]),
                                                React.createElement('label', {
                                                    htmlFor: 'road-crossing',
                                                    className: 'ml-2 text-sm text-muted-foreground'
                                                }, 'Allow at-grade road crossing')
                                            ])
                                        ])
                                    ])
                                ])
                            ])
                        ])
                    ]),

                    // Right column - All other settings
                    React.createElement('div', { key: 'right', className: 'flex flex-col gap-6' }, [
                        // PERFORMANCE SECTION
                        React.createElement('div', { key: 'performance-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Performance'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'space-y-4' }, [
                                    createStatSlider('Max Speed', 'maxSpeed', 5, 100, 0.1, ' m/s'),
                                    createStatSlider('Station Speed', 'maxSpeedLocalStation', 1, 30, 0.1, ' m/s'),
                                    createStatSlider('Acceleration', 'maxAcceleration', 0.1, 3, 0.1, ' m/s²'),
                                    createStatSlider('Deceleration', 'maxDeceleration', 0.1, 3, 0.1, ' m/s²')
                                ])
                            ])
                        ]),

                        // CAPACITY & SIZE SECTION
                        React.createElement('div', { key: 'capacity-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Capacity & Size'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
                                    // Left column
                                    React.createElement('div', { key: 'left', className: 'space-y-4' }, [
                                        React.createElement('div', { key: 'capacity' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Capacity per Car'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 10,
                                                max: 1000,
                                                value: trainData.stats?.capacityPerCar || 150,
                                                onChange: (e) => updateStat('capacityPerCar', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'car-length' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Car Length (m)'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 5,
                                                max: 50,
                                                step: '0.5',
                                                value: trainData.stats?.carLength || 20,
                                                onChange: (e) => updateStat('carLength', parseFloat(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'train-width' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Train Width (m)'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 5,
                                                step: '0.05',
                                                value: trainData.stats?.trainWidth || 3.0,
                                                onChange: (e) => updateStat('trainWidth', parseFloat(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ])
                                    ]),

                                    // Right column
                                    React.createElement('div', { key: 'right', className: 'space-y-4' }, [
                                        React.createElement('div', { key: 'min-cars' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Minimum Cars'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 20,
                                                value: trainData.stats?.minCars || 2,
                                                onChange: (e) => updateStat('minCars', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'max-cars' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Maximum Cars'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 20,
                                                value: trainData.stats?.maxCars || 6,
                                                onChange: (e) => updateStat('maxCars', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'cars-per-set' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Cars per Set'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 10,
                                                value: trainData.stats?.carsPerCarSet || 2,
                                                onChange: (e) => updateStat('carsPerCarSet', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ])
                                    ])
                                ])
                            ])
                        ]),

                        // STATION SECTION
                        React.createElement('div', { key: 'station-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Station Requirements'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
                                    React.createElement('div', { key: 'min-length' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Minimum Station Length (m)'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 20,
                                            max: 500,
                                            value: trainData.stats?.minStationLength || 100,
                                            onChange: (e) => updateStat('minStationLength', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'max-length' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Maximum Station Length (m)'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 30,
                                            max: 600,
                                            value: trainData.stats?.maxStationLength || 150,
                                            onChange: (e) => updateStat('maxStationLength', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ])
                                ])
                            ])
                        ]),

                        // COSTS SECTION
                        React.createElement('div', { key: 'costs-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Costs ($)'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
                                    React.createElement('div', { key: 'car-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Car Cost'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 100000,
                                            max: 10000000,
                                            step: '10000',
                                            value: trainData.stats?.carCost || 2000000,
                                            onChange: (e) => updateStat('carCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'track-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Track Cost per meter'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1000,
                                            max: 200000,
                                            step: '1000',
                                            value: trainData.stats?.baseTrackCost || 35000,
                                            onChange: (e) => updateStat('baseTrackCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'station-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Station Cost'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1000000,
                                            max: 500000000,
                                            step: '100000',
                                            value: trainData.stats?.baseStationCost || 50000000,
                                            onChange: (e) => updateStat('baseStationCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'scissors-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Scissors Crossover Cost'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1000000,
                                            max: 50000000,
                                            step: '100000',
                                            value: trainData.stats?.scissorsCrossoverCost || 10000000,
                                            onChange: (e) => updateStat('scissorsCrossoverCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'train-op-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Train Op. Cost per hour'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 50,
                                            max: 5000,
                                            step: '10',
                                            value: trainData.stats?.trainOperationalCostPerHour || 300,
                                            onChange: (e) => updateStat('trainOperationalCostPerHour', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'car-op-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Car Op. Cost per hour'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 5,
                                            max: 500,
                                            step: '5',
                                            value: trainData.stats?.carOperationalCostPerHour || 30,
                                            onChange: (e) => updateStat('carOperationalCostPerHour', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    React.createElement('div', { key: 'stopTime' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Stop Time'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 10,
                                            max: 100,
                                            step: '1',
                                            value: trainData.stats?.stopTimeSeconds || 30,
                                            onChange: (e) => updateStat('stopTimeSeconds', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),

                                    React.createElement('div', { key: 'parallelTrackSpacing' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Parallel Track Spacing'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1,
                                            max: 3,
                                            step: '0.01',
                                            value: trainData.stats?.parallelTrackSpacing || 2.75,
                                            onChange: (e) => updateStat('parallelTrackSpacing', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),

                                    React.createElement('div', { key: 'trackClearance' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Track Clearance'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1,
                                            max: 3,
                                            step: '0.01',
                                            value: trainData.stats?.trackClearance || 1.3,
                                            onChange: (e) => updateStat('trackClearance', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),

                                    React.createElement('div', { key: 'maxLateralAcceleration' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Max Lateral Acceleration'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 0.5,
                                            max: 1.5,
                                            step: '0.05',
                                            value: trainData.stats?.maxLateralAcceleration || 1,
                                            onChange: (e) => updateStat('maxLateralAcceleration', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),

                                    React.createElement('div', { key: 'minTurnRadius' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Min Turn Radius'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 50,
                                            max: 5000,
                                            step: '10',
                                            value: trainData.stats?.minTurnRadius || 200,
                                            onChange: (e) => updateStat('minTurnRadius', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),

                                    React.createElement('div', { key: 'minStationTurnRadius' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Min Station Turn Radius'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 100,
                                            max: 10000,
                                            step: '10',
                                            value: trainData.stats?.minTurnRadius || 200,
                                            onChange: (e) => updateStat('minStationTurnRadius', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),

                                    React.createElement('div', { key: 'maxSlopePercentage' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Max Slope Percentage'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1,
                                            max: 15,
                                            step: '0.1',
                                            value: trainData.stats?.minTurnRadius || 6,
                                            onChange: (e) => updateStat('maxSlopePercentage', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ])
                                ])
                            ])
                        ]),

                        // ELEVATION MULTIPLIERS SECTION
                        React.createElement('div', { key: 'elevation-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Elevation Cost Multipliers'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'space-y-3' }, [
                                    createElevationSlider('Deep Bore', 'DEEP_BORE', 1.0, 5.0, 0.1),
                                    createElevationSlider('Standard Tunnel', 'STANDARD_TUNNEL', 1.0, 4.0, 0.1),
                                    createElevationSlider('Cut & Cover', 'CUT_AND_COVER', 1.0, 3.0, 0.1),
                                    createElevationSlider('At Grade', 'AT_GRADE', 0.1, 2.0, 0.1),
                                    createElevationSlider('Elevated', 'ELEVATED', 1.0, 3.0, 0.1)
                                ])
                            ])
                        ]),

                        // Actions
                        React.createElement('div', {
                            key: 'actions',
                            className: 'space-y-2 mt-auto'
                        }, [
                            React.createElement('div', {
                                className: 'flex justify-between items-center text-sm text-muted-foreground'
                            }, [
                                React.createElement('span', {}, isCustomTrain ? '✎ Custom Train' : 'Default Train'),
                                !showApply && React.createElement('div', {
                                    className: 'flex items-center gap-2 text-destructive'
                                }, [
                                    React.createElement('svg', {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        width: "16",
                                        height: "16",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        className: "lucide lucide-alert-circle"
                                    }, [
                                        React.createElement('circle', { cx: "12", cy: "12", r: "10" }),
                                        React.createElement('line', { x1: "12", x2: "12", y1: "8", y2: "12" }),
                                        React.createElement('line', { x1: "12", x2: "12.01", y1: "16", y2: "16" })
                                    ]),
                                    'Fix length issue to apply'
                                ])
                            ]),
                            React.createElement('div', {
                                className: 'flex gap-2 pt-4 border-t'
                            }, [
                                React.createElement(Button, {
                                    onClick: handleReset,
                                    variant: 'secondary',
                                    className: 'flex-1'
                                }, 'Reset to Default'),
                                
                                isCustomTrain && React.createElement(Button, {
                                    onClick: handleDelete,
                                    variant: 'destructive',
                                    className: 'flex-1'
                                }, 'Delete Train'),
                                
                                showApply && React.createElement(Button, {
                                    onClick: handleApply,
                                    className: 'flex-1'
                                }, 'Save & Apply')
                            ])
                        ])
                    ])
                ]));
            }

            // Create Train View Component - UPDATED WITH VALIDATION
            function CreateTrainView() {
                const [trainData, setTrainData] = React.useState({
                    name: '',
                    description: 'Custom train type',
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
                        scissorsCrossoverCost: 10000000,
                        stopTimeSeconds: 90,
                        parallelTrackSpacing: 2.72,
                        trackClearance: 1.31,
                        maxLateralAcceleration: 0.8,
                        minTurnRadius: 155,
                        minStationTurnRadius: 3361,
                        maxSlopePercentage: 2.0,
                    },
                    elevationMultipliers: BASE_ELEVATION_MULTIPLIERS,
                    appearance: { color: '#7c3aed' }
                });
                
                // Validation constants
                const maxTrainLength = trainData.stats?.carLength * trainData.stats?.maxCars || 0;
                const minStationLength = trainData.stats?.minStationLength || 0;
                const isValidLength = maxTrainLength <= (minStationLength - 2);
                const isValidName = trainData.name && trainData.name.trim().length > 0;
                const showApply = isValidName && isValidLength;

                // Update functions
                const updateStat = (statKey, value) => {
                    setTrainData(prev => {
                        const newData = deepClone(prev);
                        if (!newData.stats) newData.stats = {};
                        
                        if (typeof value === 'string') {
                            if (!isNaN(value) && value.trim() !== '') {
                                value = statKey.includes('Speed') || statKey.includes('Acceleration') || statKey.includes('Deceleration') 
                                    ? parseFloat(value) 
                                    : parseInt(value);
                            }
                        }
                        
                        newData.stats[statKey] = value;
                        return newData;
                    });
                };

                const updateField = (field, value) => {
                    setTrainData(prev => ({ ...prev, [field]: value }));
                };
                
                const updateAppearance = (field, value) => {
                    setTrainData(prev => {
                        const newData = deepClone(prev);
                        if (!newData.appearance) newData.appearance = {};
                        newData.appearance[field] = value;
                        return newData;
                    });
                };
                
                const updateElevationMultiplier = (elevationType, value) => {
                    setTrainData(prev => {
                        const newData = deepClone(prev);
                        if (!newData.elevationMultipliers) newData.elevationMultipliers = {};
                        newData.elevationMultipliers[elevationType] = parseFloat(value);
                        return newData;
                    });
                };

                const handleCreate = () => {
                    if (!isValidName) {
                        showNotification('Please enter a train name', 'error');
                        return;
                    }

                    if (!validateTrainLength(trainData)) {
                        return;
                    }

                    const trainId = createCustomTrain(trainData.name, trainData.description, trainData.appearance.color);
                    
                    // Save custom stats
                    if (!currentConfig.customTrains) {
                        currentConfig.customTrains = {};
                    }
                    currentConfig.customTrains[trainId] = {
                        ...trainData,
                        id: trainId,
                        compatibleTrackTypes: [trainId],
                        isFixed: false
                    };
                    saveConfig(currentConfig);
                    
                    showNotification(`Custom train "${trainData.name}" created!`, 'success');
                    
                    // Switch to edit view with new train selected
                    setActiveView('edit');
                };
                
                // Helper function for slider components
                const createStatSlider = (label, statKey, min, max, step, unit = '') => {
                    const value = trainData.stats?.[statKey] || min;
                    const displayValue = `${value}${unit}`;
                    
                    return React.createElement('div', { key: statKey, className: 'mb-4' }, [
                        React.createElement('div', {
                            key: 'label-row',
                            className: 'flex justify-between items-center mb-2'
                        }, [
                            React.createElement('label', {
                                className: 'text-sm font-medium'
                            }, label),
                            React.createElement('span', {
                                className: 'text-sm font-mono font-semibold text-primary'
                            }, displayValue)
                        ]),
                        React.createElement('input', {
                            type: 'range',
                            min: min,
                            max: max,
                            step: step,
                            value: value,
                            onChange: (e) => updateStat(statKey, parseFloat(e.target.value)),
                            className: 'w-full h-2 bg-input rounded-lg appearance-none cursor-pointer',
                            style: {
                                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
                                WebkitAppearance: 'none',
                                height: '8px',
                                borderRadius: '4px'
                            }
                        })
                    ]);
                };

                const createElevationSlider = (label, elevationType, min, max, step) => {
                    const value = trainData.elevationMultipliers?.[elevationType] || min;
                    const displayValue = `${value.toFixed(1)}x`;
                    
                    return React.createElement('div', { key: elevationType, className: 'mb-3' }, [
                        React.createElement('div', {
                            key: 'label-row',
                            className: 'flex justify-between items-center mb-2'
                        }, [
                            React.createElement('label', {
                                className: 'text-sm font-medium'
                            }, label),
                            React.createElement('span', {
                                className: 'text-sm font-mono font-semibold text-primary'
                            }, displayValue)
                        ]),
                        React.createElement('input', {
                            type: 'range',
                            min: min,
                            max: max,
                            step: step,
                            value: value,
                            onChange: (e) => updateElevationMultiplier(elevationType, parseFloat(e.target.value)),
                            className: 'w-full h-2 bg-input rounded-lg appearance-none cursor-pointer',
                            style: {
                                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
                                WebkitAppearance: 'none',
                                height: '8px',
                                borderRadius: '4px'
                            }
                        })
                    ]);
                };

                return React.createElement(FullscreenView, {
                    title: 'Create Custom Train',
                    onBack: () => setActiveView(null)
                }, React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-8' }, [
                    // Left column - Basic settings
                    React.createElement('div', { key: 'left', className: 'flex flex-col gap-6' }, [
                        // Validation warning
                        (!isValidLength || !isValidName) && React.createElement('div', {
                            key: 'warning',
                            className: 'p-4 bg-destructive/10 border border-destructive/20 rounded flex items-start gap-3 mb-4'
                        }, [
                            React.createElement('div', {
                                className: 'w-10 h-10 rounded-md bg-destructive/10 flex items-center justify-center shrink-0'
                            }, React.createElement('svg', {
                                xmlns: "http://www.w3.org/2000/svg",
                                width: "24",
                                height: "24",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                className: "lucide lucide-triangle-alert w-5 h-5 text-destructive"
                            }, [
                                React.createElement('path', { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }),
                                React.createElement('path', { d: "M12 9v4" }),
                                React.createElement('path', { d: "M12 17h.01" })
                            ])),
                            React.createElement('div', { className: 'flex-1' }, [
                                React.createElement('div', { 
                                    className: 'font-medium text-destructive' 
                                }, !isValidLength && !isValidName ? 'Validation Issues' : 
                                   !isValidName ? 'Name Required' : 'Train Length Warning'),
                                !isValidLength && React.createElement('div', { 
                                    className: 'text-sm text-muted-foreground mt-1' 
                                }, `Maximum train length (${maxTrainLength}m) must be at least 2m less than minimum station length (${minStationLength}m).`),
                                !isValidLength && React.createElement('div', { 
                                    key: 'length-requirement',
                                    className: 'text-sm font-mono text-destructive mt-1' 
                                }, `Required: minStationLength > ${maxTrainLength + 2}m`),
                                !isValidName && React.createElement('div', { 
                                    key: 'name-requirement',
                                    className: 'text-sm font-mono text-destructive mt-1' 
                                }, `Required: Enter a train name`)
                            ])
                        ]),

                        // Validation summary
                        React.createElement('div', {
                            key: 'length-summary',
                            className: 'p-4 bg-primary/5 border border-primary/20 rounded'
                        }, [
                            React.createElement('div', { 
                                className: 'text-sm font-medium text-primary mb-1' 
                            }, 'Validation Summary'),
                            React.createElement('div', { 
                                className: 'text-xs text-muted-foreground grid grid-cols-2 gap-2' 
                            }, [
                                React.createElement('div', { key: 'train' }, `Max Train Length: ${maxTrainLength}m`),
                                React.createElement('div', { key: 'station' }, `Min Station: ${minStationLength}m`),
                                React.createElement('div', { key: 'name' }, `Name: ${isValidName ? '✅ Provided' : '❌ Missing'}`),
                                React.createElement('div', { key: 'status' }, `Status: ${isValidLength && isValidName ? '✅ Valid' : '❌ Invalid'}`)
                            ])
                        ]),

                        // BASIC INFORMATION SECTION
                        React.createElement('div', { key: 'basic-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Basic Information'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'space-y-4' }, [
                                    // Name and Description
                                    React.createElement('div', { key: 'name-desc', className: 'grid grid-cols-1 gap-4' }, [
                                        React.createElement('div', { key: 'name' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Train Name *'),
                                            React.createElement('input', {
                                                type: 'text',
                                                value: trainData.name || '',
                                                onChange: (e) => updateField('name', e.target.value),
                                                placeholder: 'e.g., Express Shuttle, Mountain Train',
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'desc' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Description'),
                                            React.createElement('textarea', {
                                                value: trainData.description || '',
                                                onChange: (e) => updateField('description', e.target.value),
                                                placeholder: 'Describe your custom train type...',
                                                rows: 2,
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ])
                                    ]),

                                    // Color and Road Crossing
                                    React.createElement('div', { key: 'color-crossing', className: 'grid grid-cols-2 gap-4' }, [
                                        React.createElement('div', { key: 'color' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Color'),
                                            React.createElement('div', { className: 'flex items-center gap-3' }, [
                                                React.createElement('input', {
                                                    type: 'color',
                                                    value: trainData.appearance?.color || '#7c3aed',
                                                    onChange: (e) => updateAppearance('color', e.target.value),
                                                    className: 'w-10 h-10 cursor-pointer rounded border border-input'
                                                }),
                                                React.createElement('span', { 
                                                    className: 'text-sm font-mono text-muted-foreground' 
                                                }, trainData.appearance?.color || '#7c3aed')
                                            ])
                                        ]),
                                        
                                        React.createElement('div', { key: 'crossing' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Road Crossing'),
                                            React.createElement('div', { 
                                                className: 'flex items-center h-10 mt-2'
                                            }, [
                                                React.createElement('input', {
                                                    type: 'checkbox',
                                                    id: 'road-crossing-create',
                                                    checked: trainData.allowAtGradeRoadCrossing || false,
                                                    onChange: (e) => updateField('allowAtGradeRoadCrossing', e.target.checked),
                                                    className: 'sr-only peer'
                                                }),
                                                React.createElement('label', {
                                                    htmlFor: 'road-crossing-create',
                                                    className: 'relative inline-flex items-center cursor-pointer'
                                                }, [
                                                    React.createElement('div', {
                                                        className: `w-11 h-6 border-2 border-transparent rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${trainData.allowAtGradeRoadCrossing ? 'bg-primary' : 'bg-input'}`
                                                    }),
                                                    React.createElement('div', {
                                                        className: `absolute left-0.5 top-0.5 w-5 h-5 bg-background rounded-full shadow-lg transition-transform ${trainData.allowAtGradeRoadCrossing ? 'translate-x-5' : 'translate-x-0'}`
                                                    })
                                                ]),
                                                React.createElement('label', {
                                                    htmlFor: 'road-crossing-create',
                                                    className: 'ml-2 text-sm text-muted-foreground'
                                                }, 'Allow at-grade road crossing')
                                            ])
                                        ])
                                    ])
                                ])
                            ])
                        ])
                    ]),

                    // Right column - All other settings
                    React.createElement('div', { key: 'right', className: 'flex flex-col gap-6' }, [
                        // PERFORMANCE SECTION
                        React.createElement('div', { key: 'performance-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Performance'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'space-y-4' }, [
                                    createStatSlider('Max Speed', 'maxSpeed', 5, 100, 0.1, ' m/s'),
                                    createStatSlider('Station Speed', 'maxSpeedLocalStation', 1, 30, 0.1, ' m/s'),
                                    createStatSlider('Acceleration', 'maxAcceleration', 0.1, 3, 0.1, ' m/s²'),
                                    createStatSlider('Deceleration', 'maxDeceleration', 0.1, 3, 0.1, ' m/s²')
                                ])
                            ])
                        ]),

                        // CAPACITY & SIZE SECTION
                        React.createElement('div', { key: 'capacity-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Capacity & Size'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
                                    // Left column
                                    React.createElement('div', { key: 'left', className: 'space-y-4' }, [
                                        React.createElement('div', { key: 'capacity' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Capacity per Car'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 10,
                                                max: 1000,
                                                value: trainData.stats?.capacityPerCar || 150,
                                                onChange: (e) => updateStat('capacityPerCar', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'car-length' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Car Length (m)'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 5,
                                                max: 50,
                                                step: '0.5',
                                                value: trainData.stats?.carLength || 20,
                                                onChange: (e) => updateStat('carLength', parseFloat(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'train-width' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Train Width (m)'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 5,
                                                step: '0.05',
                                                value: trainData.stats?.trainWidth || 3.0,
                                                onChange: (e) => updateStat('trainWidth', parseFloat(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ])
                                    ]),

                                    // Right column
                                    React.createElement('div', { key: 'right', className: 'space-y-4' }, [
                                        React.createElement('div', { key: 'min-cars' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Minimum Cars'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 20,
                                                value: trainData.stats?.minCars || 2,
                                                onChange: (e) => updateStat('minCars', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'max-cars' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Maximum Cars'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 20,
                                                value: trainData.stats?.maxCars || 6,
                                                onChange: (e) => updateStat('maxCars', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'cars-per-set' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Cars per Set'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 10,
                                                value: trainData.stats?.carsPerCarSet || 2,
                                                onChange: (e) => updateStat('carsPerCarSet', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ])
                                    ])
                                ])
                            ])
                        ]),

                        // STATION SECTION
                        React.createElement('div', { key: 'station-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Station Requirements'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
                                    React.createElement('div', { key: 'min-length' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Minimum Station Length (m)'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 20,
                                            max: 500,
                                            value: trainData.stats?.minStationLength || 100,
                                            onChange: (e) => updateStat('minStationLength', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'max-length' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Maximum Station Length (m)'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 30,
                                            max: 600,
                                            value: trainData.stats?.maxStationLength || 150,
                                            onChange: (e) => updateStat('maxStationLength', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ])
                                ])
                            ])
                        ]),

                        // COSTS SECTION
                        React.createElement('div', { key: 'costs-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Costs ($)'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
                                    React.createElement('div', { key: 'car-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Car Cost'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 100000,
                                            max: 10000000,
                                            step: '10000',
                                            value: trainData.stats?.carCost || 2000000,
                                            onChange: (e) => updateStat('carCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'track-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Track Cost per meter'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1000,
                                            max: 200000,
                                            step: '1000',
                                            value: trainData.stats?.baseTrackCost || 35000,
                                            onChange: (e) => updateStat('baseTrackCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'station-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Station Cost'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1000000,
                                            max: 500000000,
                                            step: '100000',
                                            value: trainData.stats?.baseStationCost || 50000000,
                                            onChange: (e) => updateStat('baseStationCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),

                                    React.createElement('div', { key: 'scissors-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Scissors Crossover Cost'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1000000,
                                            max: 50000000,
                                            step: '100000',
                                            value: trainData.stats?.scissorsCrossoverCost || 10000000,
                                            onChange: (e) => updateStat('scissorsCrossoverCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'train-op-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Train Op. Cost per hour'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 50,
                                            max: 5000,
                                            step: '10',
                                            value: trainData.stats?.trainOperationalCostPerHour || 300,
                                            onChange: (e) => updateStat('trainOperationalCostPerHour', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'car-op-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Car Op. Cost per hour'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 5,
                                            max: 500,
                                            step: '5',
                                            value: trainData.stats?.carOperationalCostPerHour || 30,
                                            onChange: (e) => updateStat('carOperationalCostPerHour', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),

                                    React.createElement('div', { key: 'stopTime' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Stop Time'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 10,
                                            max: 100,
                                            step: '1',
                                            value: trainData.stats?.stopTimeSeconds || 30,
                                            onChange: (e) => updateStat('stopTimeSeconds', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),

                                    React.createElement('div', { key: 'parallelTrackSpacing' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Parallel Track Spacing'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1,
                                            max: 3,
                                            step: '0.01',
                                            value: trainData.stats?.parallelTrackSpacing || 2.75,
                                            onChange: (e) => updateStat('parallelTrackSpacing', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),

                                    React.createElement('div', { key: 'trackClearance' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Track Clearance'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1,
                                            max: 3,
                                            step: '0.01',
                                            value: trainData.stats?.trackClearance || 1.3,
                                            onChange: (e) => updateStat('trackClearance', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),

                                    React.createElement('div', { key: 'maxLateralAcceleration' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Max Lateral Acceleration'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 0.5,
                                            max: 1.5,
                                            step: '0.05',
                                            value: trainData.stats?.maxLateralAcceleration || 1,
                                            onChange: (e) => updateStat('maxLateralAcceleration', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),

                                    React.createElement('div', { key: 'minTurnRadius' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Min Turn Radius'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 50,
                                            max: 5000,
                                            step: '10',
                                            value: trainData.stats?.minTurnRadius || 200,
                                            onChange: (e) => updateStat('minTurnRadius', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),

                                    React.createElement('div', { key: 'minStationTurnRadius' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Min Station Turn Radius'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 100,
                                            max: 10000,
                                            step: '10',
                                            value: trainData.stats?.minStationTurnRadius || 200,
                                            onChange: (e) => updateStat('minStationTurnRadius', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),

                                    React.createElement('div', { key: 'maxSlopePercentage' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Max Slope Percentage'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1,
                                            max: 15,
                                            step: '0.1',
                                            value: trainData.stats?.maxSlopePercentage || 6,
                                            onChange: (e) => updateStat('maxSlopePercentage', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ])
                                ])
                            ])
                        ]),

                        // ELEVATION MULTIPLIERS SECTION
                        React.createElement('div', { key: 'elevation-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Elevation Cost Multipliers'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'space-y-3' }, [
                                    createElevationSlider('Deep Bore', 'DEEP_BORE', 1.0, 5.0, 0.1),
                                    createElevationSlider('Standard Tunnel', 'STANDARD_TUNNEL', 1.0, 4.0, 0.1),
                                    createElevationSlider('Cut & Cover', 'CUT_AND_COVER', 1.0, 3.0, 0.1),
                                    createElevationSlider('At Grade', 'AT_GRADE', 0.1, 2.0, 0.1),
                                    createElevationSlider('Elevated', 'ELEVATED', 1.0, 3.0, 0.1)
                                ])
                            ])
                        ]),

                        // Actions
                        React.createElement('div', {
                            key: 'actions',
                            className: 'space-y-2 mt-auto'
                        }, [
                            React.createElement('div', {
                                className: 'flex justify-between items-center text-sm text-muted-foreground'
                            }, [
                                React.createElement('span', {}, 'New Custom Train'),
                                !showApply && React.createElement('div', {
                                    className: 'flex items-center gap-2 text-destructive'
                                }, [
                                    React.createElement('svg', {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        width: "16",
                                        height: "16",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        className: "lucide lucide-alert-circle"
                                    }, [
                                        React.createElement('circle', { cx: "12", cy: "12", r: "10" }),
                                        React.createElement('line', { x1: "12", x2: "12", y1: "8", y2: "12" }),
                                        React.createElement('line', { x1: "12", x2: "12.01", y1: "16", y2: "16" })
                                    ]),
                                    'Fix validation issues to create'
                                ])
                            ]),
                            React.createElement('div', {
                                className: 'flex gap-2 pt-4 border-t'
                            }, [
                                React.createElement(Button, {
                                    onClick: () => setActiveView(null),
                                    variant: 'secondary',
                                    className: 'flex-1'
                                }, 'Cancel'),
                                
                                showApply && React.createElement(Button, {
                                    onClick: handleCreate,
                                    className: 'flex-1'
                                }, 'Create Train')
                            ])
                        ])
                    ])
                ]));
            }

            // Main menu view
            function MainMenuView() {
				const trainCategories = getTrainCategories();
				
				// Calculate total trains
				let totalTrains = 0;
				let standardMetroCount = 0;
				let automatedMetroCount = 0;
				let standardLRTCount = 0;
				let dieselLRTCount = 0;
				let standardCommuterCount = 0;
				let dieselCommuterCount = 0;
				let standardSBahnCount = 0;
				let automatedSBahnCount = 0;
                let RubberMetroCount = 0;
                let AutomatedRubberMetroCount = 0;
                let RubberLRTCount = 0;
                let PeopleMoverCount = 0;
                let DualModeCommuterCount = 0;
                let HydrogenCommuterCount = 0;
				let fixedCount = 0;
				
				// Helper function to traverse the tree and count trains
				function countTrainsInNode(node) {
					if (Array.isArray(node)) {
						return node.length;
					}
					
					let count = 0;
					Object.values(node).forEach(child => {
						count += countTrainsInNode(child);
					});
					return count;
				}
				
				// Count trains in each continent
				Object.values(trainCategories).forEach(continent => {
					Object.values(continent).forEach(country => {
						Object.values(country).forEach(city => {
							Object.entries(city).forEach(([category, trains]) => {
								const trainCount = trains.length;
								totalTrains += trainCount;
								
								switch(category) {
									case "Fixed Standard Trains":
										fixedCount += trainCount;
										break;
									case "Metro":
										standardMetroCount += trainCount;
										break;
									case "Automated Metro":
										automatedMetroCount += trainCount;
										break;
									case "LRT":
										standardLRTCount += trainCount;
										break;
									case "Diesel LRT":
										dieselLRTCount += trainCount;
										break;
									case "Commuter":
										standardCommuterCount += trainCount;
										break;
									case "Diesel Commuter":
										dieselCommuterCount += trainCount;
										break;
									case "S-Bahn":
										standardSBahnCount += trainCount;
										break;
									case "Automated S-Bahn":
										automatedSBahnCount += trainCount;
										break;
                                    case "Rubber Metro":
                                        RubberMetroCount += trainCount;
                                        break;
                                    case "Automated Rubber Metro": 
                                        AutomatedRubberMetroCount += trainCount;
                                        break;
                                    case "Rubber LRT": 
                                        RubberLRTCount += trainCount;
                                        break;
                                    case "Automated People Mover": 
                                        PeopleMoverCount += trainCount;
                                        break;
                                    case "Dual-Mode Commuter": 
                                        DualModeCommuterCount += trainCount;
                                        break;
                                    case "Hydrogen Commuter": 
                                        HydrogenCommuterCount += trainCount;
                                        break;
								}
							});
						});
					});
				});
				
				// Get enabled trains count
				const enabledTrainsCount = currentConfig.enabledTrains ? 
					currentConfig.enabledTrains.filter(id => {
						const train = REAL_TRAINS[id] || (currentConfig.customTrains && currentConfig.customTrains[id]);
						return !train || !train.isFixed;
					}).length : 0;
				
				return React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-8' }, [
					React.createElement('div', { key: 'left', className: 'flex flex-col gap-6' }, [
						React.createElement('div', { key: 'header', className: 'space-y-2' }, [
							React.createElement('h1', {
								className: 'text-2xl font-bold'
							}, 'Add Trains Manager'),
							React.createElement('p', {
								className: 'text-sm text-muted-foreground'
							}, 'Customize and manage your train types by mhmoeller')
						]),
						
						// Quick stats
                        React.createElement(Card, { key: 'stats', className: 'p-4' }, [
                            React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
                                React.createElement('div', { className: 'space-y-1' }, [
                                    React.createElement('div', { className: 'text-2xl font-bold' }, 
                                        enabledTrainsCount
                                    ),
                                    React.createElement('div', { className: 'text-xs text-muted-foreground' }, 'Enabled Trains')
                                ]),
                                React.createElement('div', { className: 'space-y-1' }, [
                                    React.createElement('div', { className: 'text-2xl font-bold' }, 
                                        totalTrains
                                    ),
                                    React.createElement('div', { className: 'text-xs text-muted-foreground' }, 'Total Train Types')
                                ])
                            ]),
                            React.createElement('div', { className: 'mt-4 text-xs text-muted-foreground grid grid-cols-2 gap-2' }, [
								React.createElement('div', {}, `Standard Metro: ${standardMetroCount}`),
								React.createElement('div', {}, `Automated Metro: ${automatedMetroCount}`),
								React.createElement('div', {}, `Standard LRT: ${standardLRTCount}`),
								React.createElement('div', {}, `Diesel LRT: ${dieselLRTCount}`),
								React.createElement('div', {}, `Standard Commuter: ${standardCommuterCount}`),
								React.createElement('div', {}, `Diesel Commuter: ${dieselCommuterCount}`),
								React.createElement('div', {}, `Standard S-Bahn: ${standardSBahnCount}`),
								React.createElement('div', {}, `Automated S-Bahn: ${automatedSBahnCount}`),
                                React.createElement('div', {}, `Rubber Metro: ${RubberMetroCount}`),
                                React.createElement('div', {}, `Automated Rubber Metro: ${AutomatedRubberMetroCount}`),
                                React.createElement('div', {}, `Rubber LRT: ${RubberLRTCount}`),
                                React.createElement('div', {}, `People Mover: ${PeopleMoverCount}`),
                                React.createElement('div', {}, `Dual-Mode Commuter: ${DualModeCommuterCount}`),
                                React.createElement('div', {}, `Hydrogen Commuter: ${HydrogenCommuterCount}`)
							])
                        ]),

                        // DataPack validation warnings
                        (currentConfig.datapackValidationErrors && currentConfig.datapackValidationErrors.length > 0) &&
                        React.createElement(Card, { 
                            key: 'validation-warnings',
                            className: 'p-4 border-destructive bg-destructive/10' 
                        }, [
                            React.createElement('div', { className: 'flex items-start gap-2' }, [
                                React.createElement('div', { className: 'text-destructive font-bold text-sm' }, '⚠️'),
                                React.createElement('div', { className: 'flex-1' }, [
                                    React.createElement('div', { className: 'text-sm font-semibold text-destructive' }, 
                                        `${currentConfig.datapackValidationErrors.length} DataPack Train(s) Have Errors`
                                    ),
                                    React.createElement('div', { className: 'text-xs text-muted-foreground mt-1' }, 
                                        'These trains are too long for their station length and will not work in-game.'
                                    ),
                                    React.createElement('div', { className: 'mt-2 space-y-1 text-xs' }, 
                                        currentConfig.datapackValidationErrors.slice(0, 5).map((err, i) =>
                                            React.createElement('div', { key: i, className: 'text-destructive/90' }, 
                                                `• ${err.name}: ${err.maxLength?.toFixed(1)}m train > ${(err.minStation - 2)?.toFixed(1)}m station`
                                            )
                                        )
                                    ),
                                    currentConfig.datapackValidationErrors.length > 5 &&
                                    React.createElement('div', { className: 'text-xs text-muted-foreground mt-1' }, 
                                        `...and ${currentConfig.datapackValidationErrors.length - 5} more`
                                    )
                                ])
                            ])
                        ])
                    ]),

                    React.createElement('div', { key: 'right', className: 'flex flex-col gap-6' }, [
                        React.createElement('div', { key: 'options', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Management Options'),

                            React.createElement('button', {
                                onClick: openEnableDisable,
                                className: 'inline-flex items-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full rounded-sm justify-between gap-2'
                            }, [
                                React.createElement('div', { className: 'flex items-center gap-2' }, [
                                    React.createElement('svg', {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        width: "24",
                                        height: "24",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        className: "lucide lucide-toggle-right h-4 w-4"
                                    }, [
                                        React.createElement('rect', { width: "20", height: "12", x: "2", y: "6", rx: "6", ry: "6" }),
                                        React.createElement('circle', { cx: "16", cy: "12", r: "2" })
                                    ]),
                                    React.createElement('span', {}, 'Enable / Disable Trains')
                                ]),
                                React.createElement('svg', {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    width: "24",
                                    height: "24",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    className: "lucide lucide-chevron-right h-4 w-4 text-muted-foreground"
                                }, React.createElement('path', { d: "m9 18 6-6-6-6" }))
                            ]),

                            React.createElement('button', {
                                onClick: openEditTrain,
                                className: 'inline-flex items-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full rounded-sm justify-between gap-2'
                            }, [
                                React.createElement('div', { className: 'flex items-center gap-2' }, [
                                    React.createElement('svg', {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        width: "24",
                                        height: "24",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        className: "lucide lucide-settings h-4 w-4"
                                    }, [
                                        React.createElement('path', { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }),
                                        React.createElement('circle', { cx: "12", cy: "12", r: "3" })
                                    ]),
                                    React.createElement('span', {}, 'Edit Train Statistics')
                                ]),
                                React.createElement('svg', {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    width: "24",
                                    height: "24",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    className: "lucide lucide-chevron-right h-4 w-4 text-muted-foreground"
                                }, React.createElement('path', { d: "m9 18 6-6-6-6" }))
                            ]),

                            React.createElement('button', {
                                onClick: openCreateTrain,
                                className: 'inline-flex items-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full rounded-sm justify-between gap-2'
                            }, [
                                React.createElement('div', { className: 'flex items-center gap-2' }, [
                                    React.createElement('svg', {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        width: "24",
                                        height: "24",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        className: "lucide lucide-plus-circle h-4 w-4"
                                    }, [
                                        React.createElement('circle', { cx: "12", cy: "12", r: "10" }),
                                        React.createElement('path', { d: "M8 12h8" }),
                                        React.createElement('path', { d: "M12 8v8" })
                                    ]),
                                    React.createElement('span', {}, 'Create Custom Train')
                                ]),
                                React.createElement('svg', {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    width: "24",
                                    height: "24",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    className: "lucide lucide-chevron-right h-4 w-4 text-muted-foreground"
                                }, React.createElement('path', { d: "m9 18 6-6-6-6" }))
                            ])
                        ]),

                        // Actions
                        React.createElement('div', {
                            key: 'actions',
                            className: 'space-y-2 mt-auto'
                        }, [
                            React.createElement(Button, {
                                onClick: handleApplyWithFeedback, // Brug den nye handler med feedback
                                className: 'w-full'
                            }, 'Apply All Train Changes')
                        ])
                    ])
                ]);
            }

            // Render appropriate view
            let content;
            if (isOpen) {
                switch (activeView) {
                    case 'enable':
                        content = React.createElement(EnableDisableView);
                        break;
                    case 'edit':
                        content = React.createElement(EditTrainView);
                        break;
                    case 'create':
                        content = React.createElement(CreateTrainView);
                        break;
                    default:
                        content = React.createElement(FullscreenView, {
                            title: 'Add Trains Manager',
                            onBack: () => setIsOpen(false)
                        }, React.createElement(MainMenuView));
                        break;
                }
            }

            return React.createElement(React.Fragment, null, [
                // Main button
                React.createElement('div', {
                    key: 'button-container',
                    className: 'flex flex-col gap-1'
                }, [
                    React.createElement('div', {
                        key: 'button',
                        onClick: () => {
                            if (!isOpen) {
                                setActiveView(null);
                            }
                            setIsOpen(!isOpen);
                        },
                        className: 'max-w-full font-bold flex items-center bg-primary text-primary-foreground cursor-pointer text-4xl flex-row-reverse justify-end gap-1.5 w-full h-fit hover:bg-primary/90 transition-colors group',
                        style: {
                            borderRadius: '0'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'text-container',
                            className: 'flex gap-1 items-center px-1'
                        }, [
                            React.createElement('p', {
                                key: 'text',
                                className: 'h-full text-3xl'
                            }, 'Add Trains')
                        ]),
                        
                        React.createElement(TrainIcon, {
                            key: 'icon',
                            className: 'min-w-fit transition-all h-9 w-9 ml-1 group-hover:scale-110',
                            style: {
                                transitionDuration: '150ms'
                            }
                        })
                    ]),
                    
                    React.createElement('p', {
                        key: 'description',
                        className: 'text-xs text-muted-foreground pl-1 truncate'
                    }, '')
                ]),
                
                // Fullscreen content
                isOpen && content,
                
                // Error Toast in lower right corner
                React.createElement(ErrorToast, { key: 'error-toast' })
            ]);
        }

        return function WrappedMainMenuButton() {
			return React.createElement(ErrorProvider, null, 
				React.createElement(MainMenuButton, {})
			);
		};
    }
	
    // --------------------------------------------------
    // INITIALIZATION
    // --------------------------------------------------
    function initialize() {
        debugLogMessage("log", "=== ADD TRAINS MOD INITIALIZING ===");
        const api = window.SubwayBuilderAPI;

        if (!api) {
            debugLogMessage("error", "API not available");
            return;
        }

        // Register trains on game init
        if (api.hooks && typeof api.hooks.onGameInit === 'function') {
            api.hooks.onGameInit(() => {
                debugLogMessage("log", "Game initialized - registering trains");
                setTimeout(registerTrainsToGame, 500);
            });
        }

        // Try to register UI component
        try {
            const hasReact = !!api.utils?.React;
            
            if (hasReact && api.ui?.registerComponent && typeof api.hooks.onGameInit) {
                debugLogMessage("log", "Registering React component");
                const ReactComponent = createReactUI();
                if (ReactComponent) {
                    api.ui.registerComponent("main-menu", {
                        id: 'add-trains-button',
                        component: ReactComponent
                    });
                    api.ui.registerComponent("settings-menu", {
                        id: 'add-trains-button-2',
                        component: ReactComponent
                    });
                    debugLogMessage("log", "React component registered successfully");
                }
            } else if (api.ui?.addToolbarPanel) {
                debugLogMessage("log", "Adding toolbar panel");
                const ReactComponent = createReactUI();
                if (ReactComponent) {
                    api.ui.addToolbarPanel({
                        id: 'add-trains-panel',
                        icon: 'Train',
                        tooltip: 'Add Trains',
                        width: 500,
                        render: ReactComponent
                    });
                    debugLogMessage("log", "Toolbar panel added successfully");
                }
            }
		
        } catch (error) {
            debugLogMessage("error", "Failed to register UI", error);
        }

        // Initial train registration
        setTimeout(() => {
            registerTrainsToGame();
            debugLogMessage("log", "Initial train registration complete");
        }, 1000);

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
