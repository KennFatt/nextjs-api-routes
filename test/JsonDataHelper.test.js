import assert from "assert/strict";
import fs from "fs";
import {
  JSON_DATA_PATH,
  insertRecord,
  loadRecords,
  getRecordDataById,
  updateRecord,
  deleteRecord,
} from "../lib/JsonDataHelper";

function removeTestingFile() {
  if (fs.existsSync(JSON_DATA_PATH)) {
    fs.rmSync(JSON_DATA_PATH);
  }
}

/**
 * Test suites:
 *
 * 0. All functions
 *    - All methods should throwing an error (TypeError with the exact same message)
 *        if the `data` parameter is not an array.
 *
 * 1. loadRecords()
 *    - Write new file with JSON content that includes an empty array.
 *    - Read existing JSON content from a file.
 *
 * 2. getRecordDataById()
 *    - It should be hrowing an error if the given `id` is not found.
 *    - Returning an object that has `id` key match with the given `id`.
 *
 * 3. insertRecord()
 *    - Inserting new record then calling `loadRecords` and get the latest element
 *        should be equal (deep comparison) to the `newRecord` object.
 *    - Inserting an existing record should throw an error.
 *
 * 4. updateRecord()
 *    - The latest data (from `loadRecords`) should includes the new record object.
 *    - The length of `data` array before and after calling the function should be the same.
 *    - It should be throwing an error when updating the record with non existing id.
 *
 * 5. deleteRecord()
 *    - It should be throwing an error if the record does not exist.
 *    - The `data` length should be decreased by 1 (respective to the length before function calls)
 */
describe("JsonDataHelper", () => {
  after(() => {
    removeTestingFile();
  });

  // start-of: suite 0
  describe("All functions (except `loadRecords`) require an array as its first parameter.", () => {
    const boundFns = [
      insertRecord,
      getRecordDataById,
      updateRecord,
      deleteRecord,
    ].map((fn) => fn.bind(null, false));

    boundFns.forEach((boundFn) => {
      it(`Calling function: ${boundFn.name}  should throw an error`, () => {
        assert.throws(boundFn, {
          name: "TypeError",
          message: "The `data` argument supposed to be an array!",
        });
      });
    });
  });
  // end-of: suite 0

  // start-of: suite 1
  describe("Helper function: loadRecords()", () => {
    afterEach(() => {
      removeTestingFile();
    });

    describe("Init call should generate new file and return an empty array", () => {
      const records = loadRecords();

      it("File exists on filesystem", () => {
        assert.ok(fs.existsSync(JSON_DATA_PATH));
      });

      it("Returns an empty array", () => {
        assert.deepEqual(records, []);
      });
    });

    describe("Read existing JSON file", () => {
      const dummyRecord = {
        id: Date.now(),
        email: "dummy@example.com",
        message: "A dummy message",
      };
      const jsonContent = JSON.stringify([dummyRecord], null, 4);
      fs.writeFileSync(JSON_DATA_PATH, jsonContent, { encoding: "utf-8" });

      const records = loadRecords();

      it("The records[0] should equal to the dummy data", () => {
        assert.deepEqual(records[0], dummyRecord);
      });
    });
  });
  // end-of: suite 1
});
