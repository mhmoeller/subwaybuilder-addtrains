# Subway Builder – addTrains package

This repository contains an **optional train package** for use with [Kronifer's SubwayBuilder Patcher](https://github.com/Kronifer/subwaybuilder-patcher).  
It replaces the in-game `TRAIN_TYPES` and adds several Danish-inspired train types, as well as a tweaked light metro.
These can be customised to fit your own train types.

The package is meant for players who want more realistic regional/commuter rail and tram options for their custom maps.

---

## Features

- Uses the patcher’s extendable API (`patcherExec(fileContents)`) to modify:
  - `INDEX` – overwrites `TRAIN_TYPES` with the set from `config_trains.js`
  - `GAMEMAIN` – patches road collision validation for selected train types
- Keeps the original **heavy metro** base stats
- Provides a modified **light metro** modeled after the driverless Copenhagen Metro
- Adds new train types:
  - **S-train** – high-capacity commuter rail (Copenhagen S-tog inspired)
  - **Regional** – local diesel/electric multiple unit (LINT 41 inspired)
  - **Intercity** – fast long-distance train (Danish IR4 inspired)
  - **Tram** – city tram / light rail (Siemens Avenio inspired)
- Extends internal cost-tracking structures so the new train types participate in:
  - Elevation-based cost statistics
  - Count/total-based cost statistics
- Adds dynamic road collision logic:
  - Only train types with `canCrossRoads: true` in `config_trains.js` are allowed to cross roads at grade

All train definitions live in one place: `config_trains.js`.

---

## Requirements

You need:

- **Subway Builder** (the game)
- **Node.js**
- **Kronifer's subwaybuilder-patcher**  
  → available here: https://github.com/Kronifer/subwaybuilder-patcher

This repository does **not** include the patcher itself. It is an add-on package.

---

## Installation

1. **Set up the patcher**

   Follow the instructions in Kronifer's patcher’s README to clone and install it. In short (example):

   ```
   git clone https://github.com/Kronifer/subwaybuilder-patcher
   cd subwaybuilder-patcher
   npm install
   ```
2. Create the addTrains package folder

Inside your subwaybuilder-patcher directory, create:
patcher/
  packages/
    addTrains/
      config_trains.js
      patcherExec.js
Copy config_trains.js and patcherExec.js from this repository into patcher/packages/addTrains/.

3. Enable the package in config.js

Open config.js in the root of the patcher repo and make sure packagesToRun includes "addTrains".
For example:
   ```
const config = {
  "subwaybuilderLocation": "C:\\Users\\runke\\AppData\\Local\\Programs\\Subway\ Builder\\", // appimage location image on linux or install directory on windows (something like C:\\Users\\[username]\\AppData\\Local\\Programs\\Subway\ Builder)
  "platform": "windows", // either 'linux' or 'windows'
  "packagesToRun": ["mapPatcher","addTrains"] // Order matters! This will run the map patcher first
};

export default config;
   ```
If you already have patched the maps you want you can just use ["addTrains"]

4. Run the patcher

From the root of the patcher repo:
   ```
node ./patcher/patch_game.js
   ```
This will patch the Subway Builder installation pointed to by subwaybuilderLocation.

Launch the patched game

Start Subway Builder from the patched install as described in the Kronifer's README.
You should now see the new train types available in-game when placing tracks and configuring lines.

Remember if you have patched maps into the game run as instructed by Kronifer:
   ```
cd patcher\packages\mapPatcher
.\serve.ps1
   ```

-----------------------------------

Configuration details

All train types are defined in config_trains.js under the exported trains object:
   ```
export default {
  trains: {
    "heavy-metro": { ... },
    "light-metro": { ... },
    "s-train": { ... },
    "regional": { ... },
    "intercity": { ... },
    "tram": { ... }
  }
};
   ```
Notes:
Every train type has:
- id – must match the key and the entry in compatibleTrackTypes
- name – label shown in the UI
- description – description string in the UI
- stats – performance, capacity, costs, etc.
- compatibleTrackTypes – which track type identifiers this train can run on
- Some types define canCrossRoads: true. These are the only trains allowed to cross roads at grade in the patched validateRoadCollision logic.

If you want to tweak balance (speeds, capacities, costs, etc.), you only need to edit config_trains.js and re-run the patcher.
Just make sure if that your minStationLength is at least a few meters longer than the total length of your carLength\*minCars
and of course that your maxStationLength is at least a few meters longer than carLength\*maxCars.

You can remove the new train types from the config file and add your own types as you please. Just make sure you are using another train type as a template.
