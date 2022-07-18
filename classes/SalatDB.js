const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

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

class SalatDB {
  /**
   * @type {import('sqlite').Database<sqlite3.Database, sqlite3.Statement>}
   */
  static db = undefined;
  /**
   * @param {Date} date
   * @returns {number}
   */
  static daysIntoYear(date) {
    return (
      ((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
        Date.UTC(date.getFullYear(), 0, 0)) /
        24 /
        60 /
        60 /
        1000) %
      366
    );
  }
  /**
   *
   * @param {number} timestamp
   * @returns {Date}
   */
  static convertTimestampToDate(timestamp) {
    const now = new Date();
    // console.log(
    //   timestamp,
    //   now.getFullYear(),
    //   now.getMonth() + 1,
    //   now.getDate()
    // );
    const hours = Math.floor(timestamp / 60);
    const minutes = timestamp % 60;
    // console.log([hours, minutes]);

    const date = new Date();
    date.setDate(now.getDate());
    date.setMonth(now.getMonth());
    date.setFullYear(now.getFullYear());
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;

    // return new Date(
    //   `${now.getFullYear()}-${(now.getMonth() + 1)
    //     .toString()
    //     .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}T${hours
    //     .toString()
    //     .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`
    // );
  }
  /**
   *
   * @param {number} timestamp
   * @returns {string}
   */
  static convertTimestampToString(timestamp) {
    return [Math.floor(timestamp / 60), timestamp % 60]
      .map((i) => i.toString().padStart(2, "0"))
      .join(":");
  }
  static async init() {
    SalatDB.db = await open({
      filename: "./salat.db",
      driver: sqlite3.Database,
    });
  }
  /**
   *
   * @param {Date} date
   * @param {number} categoryId
   * @returns {SalatPrayerTimes | undefined}
   */
  static async getTimesInAtoll(date, categoryId) {
    const dayIntoYear = SalatDB.daysIntoYear(date);
    const prayerTimes = await SalatDB.db.get(
      `SELECT * FROM PrayerTimes WHERE CategoryId = ? AND Date = ?`,
      [categoryId, dayIntoYear]
    );
    return prayerTimes;
  }
  /**
   *
   * @param {Date} date
   * @param {number} islandId
   * @returns {SalatPrayerTimes | undefined}
   */
  static async getTimesInIsland(date, islandId) {
    const island = await SalatDB.getIsland(islandId);
    if (!island) throw new Error(`Island with id ${islandId} not found`);
    const prayerTimes = await SalatDB.getTimesInAtoll(date, island.CategoryId);
    if (!prayerTimes)
      throw new Error(
        `Prayer times for island ${islandId} (categoryId ${island.CategoryId}) not found`
      );
    prayerTimes.IslandId = island.IslandId;
    ["Fajuru", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"].forEach((key) => {
      prayerTimes[key] += island.Minutes;
    });
    return prayerTimes;
  }

  /**
   *
   * @param {number} islandId
   * @returns {SalatIsland | undefined}
   */
  static async getIsland(islandId) {
    const island = await SalatDB.db.get(
      `SELECT * FROM Island WHERE IslandId = ?`,
      [islandId]
    );
    return island;
  }
}

module.exports = SalatDB;
