/**
 * C - insertRecord                     POST    201 (accepted and has side effect)
 * R - loadRecords, getRecordDataById   GET     200
 * U - updateRecord                     PUT     201 (accepted and has side effect) | 204 (data exists and no response)
 * D - deleteRecord                     DELETE  200 (deleted)
 *
 * TODO:
 * - [Mutability] Should I make each function to has a clone version of the `data`?
 *      So they're not supposed to modify its original values.
 */
import fs from "fs";
import path from "path";

const JSON_DATA_PATH =
  process.env.NODE_ENV === "test"
    ? path.join(process.cwd(), "data", "data-testing.json")
    : path.join(process.cwd(), "data", "data.json");

function isValidRecord(record) {
  return "id" in record && "email" in record && "message" in record;
}

function getRecordIndex(data, targetRecord) {
  return data.findIndex((record) => record.id === targetRecord);
}

function writeJsonData(data) {
  fs.writeFileSync(JSON_DATA_PATH, JSON.stringify(data ?? [], null, 4), {
    encoding: "utf-8",
  });
}

function loadRecords() {
  let records = [];
  if (!fs.existsSync(JSON_DATA_PATH)) {
    writeJsonData(records);
    return records;
  }

  const content = fs.readFileSync(JSON_DATA_PATH, { encoding: "utf-8" });
  records = JSON.parse(content);

  return records;
}

function getRecordDataById(data, recordId) {
  if (!(data instanceof Array)) {
    throw new TypeError("The `data` argument supposed to be an array!");
  }

  const recordIndex = getRecordIndex(data, {
    id: recordId,
    email: "",
    message: "",
  });

  if (recordIndex === -1) {
    throw new Error(`Record with id ${recordId} does not exists`);
  }

  return data[recordIndex];
}

function insertRecord(data, newRecord) {
  if (!(data instanceof Array)) {
    throw new TypeError("The `data` argument supposed to be an array!");
  }

  if (!isValidRecord(newRecord)) {
    throw new Error("The `newRecord` object has missing mandatory keys.");
  }

  if (getRecordIndex(newRecord) > -1) {
    throw new Error("Could not insert new record because it already exists!");
  }

  data.push(newRecord);
  writeJsonData(data);
}

function updateRecord(data, oldRecord, newRecord) {
  if (!(data instanceof Array)) {
    throw new TypeError("The `data` argument supposed to be an array!");
  }

  if (!isValidRecord(oldRecord)) {
    throw new Error("The `oldRecord` object has missing mandatory keys.");
  }

  if (!isValidRecord(newRecord)) {
    throw new Error("The `newRecord` object has missing mandatory keys.");
  }

  const oldRecordIndex = getRecordIndex(data, oldRecord);
  if (oldRecordIndex === -1) {
    throw new Error(
      `Could not update record with id: ${oldRecord.id} because it does not exists!`
    );
  }

  data[oldRecordIndex] = newRecord;
  writeJsonData(data);
}

function deleteRecord(data, targetRecord) {
  if (!(data instanceof Array)) {
    throw new TypeError("The `data` argument supposed to be an array!");
  }

  if (!isValidRecord(targetRecord)) {
    throw new Error("The `targetRecord` object has missing mandatory keys.");
  }

  const targetRecordIndex = getRecordIndex(data, targetRecord);
  if (targetRecordIndex === -1) {
    throw new Error(
      `Could not delete record with id: ${targetRecord.id} because it does not exists!`
    );
  }

  data.splice(targetRecordIndex, 1);
  writeJsonData(data);
}

export {
  JSON_DATA_PATH,
  loadRecords,
  getRecordDataById,
  insertRecord,
  updateRecord,
  deleteRecord,
};
