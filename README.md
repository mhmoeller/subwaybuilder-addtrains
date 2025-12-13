# Subway Builder – addTrains Mod

This repository contains a standalone mod to the Subway Builder Modding API.
It replaces the in-game `TRAIN_TYPES` and adds several Danish-inspired train types, as well as a tweaked light metro.
These can be customised to fit your own train types, or add your own custom types.

The package is meant for players who want more realistic regional/commuter rail and tram options for their custom maps.

---

## Features

- Uses the Subway Builder's modding API.
- Keeps the original **heavy metro** base stats
- Provides a modified **light metro** modeled after the driverless Copenhagen Metro
- Adds new train types:
  - **S-train** – high-capacity commuter rail (Copenhagen S-tog inspired)
  - **Regional** – local diesel/electric multiple unit (LINT 41 inspired)
  - **Intercity** – fast long-distance train (Danish IR4 inspired)
  - **Tram** – city tram / light rail (Siemens Avenio inspired)
  If selected at least.
- Extends internal cost-tracking structures so the new train types participate in:
  - Elevation-based cost statistics
  - Count/total-based cost statistics
- Adds dynamic road collision logic:
  - Only train types with `allowAtGradeRoadCrossing: true` in the UI are allowed to cross roads at grade

All train definitions live in the index.js.

---

## Requirements

You need:

- **Subway Builder** (the game)
- The 2 files from here(Manifest and Index)
  That's it.
---

## Installation

1. Open the game, go to the Settings and enable modding. Press the Open Mods Folder.

2. Download the manifest.json and the index.js from here to the Mods folder. 

3. Restart the game.
   
5. Enter the Mods menu again and enable the Add Trains.

6. Restart the game. The Mod should now work and you can enable the Trains you want to add/mod.

Notes:
Every train type has:
- name – label shown in the UI
- description – description string in the UI
- stats – performance, capacity, costs, etc.
- allowAtGradeRoadCrossing:true. These are the only trains allowed to cross roads at grade in the patched validateRoadCollision logic.

If you want to tweak balance (speeds, capacities, costs, etc.), you only need to edit them in the main menu and apply changes.
Just make sure if that your minStationLength is at least a few meters longer than the total length of your carLength\*minCars
and of course that your maxStationLength is at least a few meters longer than carLength\*maxCars.

You can remove the new train types by unchecking them or pressing remove in the Edit Train Stats menu and add your own types as you please.
