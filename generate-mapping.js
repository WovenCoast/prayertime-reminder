const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const fs = require("fs");

/**
 * @typedef {Object} SalatPrayerTimes
 * @property {number} CategoryId
 * @property {number?} IslandId
 * @property {number} Date
 * @property {number} Fajuru
 * @property {number} Sunrise
 * @property {number} Dhuhr
 * @property {number} Asr
 * @property {number} Maghrib
 * @property {number} Isha
 */

/**
 * @typedef {Object} SalatIsland
 * @property {number} CategoryId
 * @property {number} IslandId
 * @property {string} Atoll
 * @property {string} Island
 * @property {number} Minutes
 * @property {number | null} Latitude
 * @property {number | null} Longitude
 * @property {0 | 1} Status
 */

async function generate() {
  const db = await open({
    filename: "./salat.db",
    driver: sqlite3.Database,
  });
  /**
   * @type {SalatIsland[]}
   */
  const islands = await db.all("SELECT * FROM Island");

  const md = [
    "# Island Mapping",
    "",
    "Find the island ID you want by looking at the table below.",
    "",
    "| Island ID | Atoll | Island           |",
    "| --------- | ----- | ---------------- |",
    ...islands.map(
      (i) =>
        `| ${i.IslandId.toString().padEnd(9)} | ${i.Atoll.toString().padEnd(
          5
        )} | ${i.Island.padEnd(16)} |`
    ),
    "",
    "Here's a cookie for making it all the way here 🍪",
  ].join("\n");

  fs.writeFileSync("./island-mapping.md", md);
}

generate();
