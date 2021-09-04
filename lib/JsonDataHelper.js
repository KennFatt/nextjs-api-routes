/**
 * TODO:
 * - [Mutability] Should I make each function to has a clone version of the `data`?
 *      So they're not supposed to modify its original values.
 *
 * @typedef {Object} FeedbackRecord
 * @property {number} id
 * @property {string} email
 * @property {string} message
 */
import fs from "fs";
import path from "path";

const JSON_DATA_PATH =
  process.env.NODE_ENV === "test"
    ? path.join(process.cwd(), "data", "data-testing.json")
    : path.join(process.cwd(), "data", "data.json");

/**
 * Check if the `record` satisfy with our record object signature (`FeedbackRecord`).
 * @see FeedbackRecord
 *
 * @param {object} record
 * @returns {boolean}
 */
function isValidRecord(record) {
  return "id" in record && "email" in record && "message" in record;
}

/**
 * Flush the given data into file with JSON format.
 * Write if the `data` is non-empty array. Otherwise, create new JSON file.
 *
 * @param {FeedbackRecord[]} data
 */
function writeJsonData(data) {
  try {
    fs.writeFileSync(JSON_DATA_PATH, JSON.stringify(data ?? [], null, 4), {
      encoding: "utf-8",
    });
  } catch {}
}

/**
 * Create a new record with given email and message from request payload body.
 * The object created is **immutable by default** and for now, the key `id` is
 *  a random number from `0` (**inclusive**) to max `2 ^ 30`.
 *
 * @param {string} email
 * @param {string} message
 * @returns {FeedbackRecord}
 */
function createRecordObject(email, message) {
  return Object.freeze({
    id: ~~(Math.random() * (1 << 30)),
    email,
    message,
  });
}

/**
 * Parse JSON file and return its value(s) if exists,
 *  otherwise create new JSON file and return an empty array.
 *
 * @returns {FeedbackRecord[]}
 */
function loadRecords() {
  let records = [];

  try {
    const content = fs.readFileSync(JSON_DATA_PATH, { encoding: "utf-8" });
    records = JSON.parse(content);
  } catch (e) {
    if (e.code === "ENOENT") {
      writeJsonData(records);
    }
  } finally {
    return records;
  }
}

/**
 * Find a specific record data (`FeedbackRecord`) by its `id` from the database
 *  and return the object if found. Otherwise, an error should be thrown.
 *
 * @param {FeedbackRecord[]} data
 * @param {number} recordId
 * @returns {FeedbackRecord}
 */
function getRecordDataById(data, recordId) {
  if (!(data instanceof Array)) {
    throw new TypeError("The `data` argument supposed to be an array!");
  }

  if (typeof recordId !== "number") {
    throw new TypeError("The `recordId` argument supposed to be a number!");
  }

  const recordData = data.find((record) => record.id === recordId);
  if (!recordData) {
    throw new Error(`Record with id ${recordId} does not exists.`);
  }

  return recordData;
}

/**
 * Inserting new record (`FeedbackRecord`) into the array of records
 *  and flush them into JSON file immediately.
 *
 * @param {FeedbackRecord[]} data
 * @param {FeedbackRecord} newRecord
 * @returns {FeedbackRecord[]} Reference to `data`
 */
function insertRecord(data, newRecord) {
  if (!(data instanceof Array)) {
    throw new TypeError("The `data` argument supposed to be an array!");
  }

  if (!isValidRecord(newRecord)) {
    throw new Error("The `newRecord` object has missing mandatory keys.");
  }

  data.push(newRecord);
  writeJsonData(data);

  return data;
}

/**
 * Update the `data` element by replacing `oldRecordId`'s object id with
 *  `newRecord` object.
 *
 * If the index of `oldRecordId`'s object is 0, then
 *  data[0] = newRecord
 *
 * If `oldRecordId`'s object !== newRecord, then
 *  writeJsonData()
 *
 * @param {FeedbackRecord[]} data
 * @param {number} oldRecordId
 * @param {FeedbackRecord} newRecord
 *
 * @returns {boolean} TRUE if data updated successfully. Otherwise, FALSE.
 */
function updateRecord(data, oldRecordId, newRecord) {
  if (!(data instanceof Array)) {
    throw new TypeError("The `data` argument supposed to be an array!");
  }

  if (!isValidRecord(newRecord)) {
    throw new Error("The `newRecord` object has missing mandatory keys.");
  }

  const oldRecordIndex = data.findIndex((record) => record.id === oldRecordId);
  if (oldRecordIndex === -1) {
    throw new Error(
      `The record with an \`id\` of ${oldRecordIndex} does not exist!`
    );
  }

  /** Deep comparison */
  let isDataUpdated = false;
  for (const k in data[oldRecordIndex]) {
    if (newRecord[k] !== data[oldRecordIndex][k]) {
      isDataUpdated = true;
      break;
    }
  }

  if (isDataUpdated) {
    data[oldRecordIndex] = newRecord;
    writeJsonData(data);
  }

  return isDataUpdated;
}

/**
 * Delete specific record with given `targetRecordId` from the `data`.
 *
 * @param {FeedbackRecord[]} data
 * @param {number} targetRecordId
 * @returns {FeedbackRecord}
 */
function deleteRecord(data, targetRecordId) {
  if (!(data instanceof Array)) {
    throw new TypeError("The `data` argument supposed to be an array!");
  }

  if (data.length === 0) {
    throw new Error("The `data` is empty!");
  }

  const targetRecordIndex = data.findIndex(
    (record) => record.id === targetRecordId
  );
  if (targetRecordIndex === -1) {
    throw new Error(
      `The record with an \`id\` of ${targetRecordId} does not exist!`
    );
  }

  const deletedRecord = data.splice(targetRecordIndex, 1)[0];
  writeJsonData(data);

  return deletedRecord;
}

export {
  JSON_DATA_PATH,
  createRecordObject,
  loadRecords,
  getRecordDataById,
  insertRecord,
  updateRecord,
  deleteRecord,
};
