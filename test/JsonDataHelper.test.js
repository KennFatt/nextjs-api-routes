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

function cleanUpTestFile() {
  try {
    fs.rmSync(JSON_DATA_PATH, { recursive: true });
  } catch {}
}

/**
 * Create a suite that run the `hook` callback right
 *  before and after the suite rather than the `it()`.
 *
 * This is useful to clean up the data before specifying a scenario.
 *
 * Adapting from SO's answer:
 * @see https://stackoverflow.com/a/26111323/6569706
 *
 * MochaJS's GitHub Issue #911:
 * @see https://github.com/mochajs/mocha/issues/911
 *
 * @param {string} suiteName
 * @param {Function|undefined} hook
 * @param {Function} tests
 */
function describeWithHook(suiteName, hook, tests) {
  const callHook = () => {
    if (typeof hook === "function") {
      hook.call(null);
    }
  };

  describe(suiteName, () => {
    before(() => {
      callHook();
    });

    tests();

    after(() => {
      callHook();
    });
  });
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
 * 2. insertRecord()
 *    - Inserting new record then calling `loadRecords` and get the latest element
 *        should be equal (deep comparison) to the `newRecord` object.
 *    - Inserting an existing record should throw an error.
 *
 * 3. getRecordDataById()
 *    - It should be throwing an error if the given `id` is not found.
 *    - Returning an object that has `id` key match with the given `id`.
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
describeWithHook("JsonDataHelper", cleanUpTestFile, () => {
  const dummyRecord = {
    id: Date.now(),
    email: "dummy@example.com",
    message: "A dummy message",
  };

  // start-of: suite 0
  describe("All functions (except `loadRecords`) require an array as its first parameter.", () => {
    const boundFns = [
      insertRecord,
      getRecordDataById,
      updateRecord,
      deleteRecord,
    ].map((fn) => fn.bind(null, false));

    boundFns.forEach((boundFn) => {
      it(`Calling function: ${boundFn.name} should throw an error`, () => {
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
    describeWithHook(
      "Init call should generate new file and return an empty array",
      cleanUpTestFile,
      () => {
        it("File exists on filesystem", () => {
          loadRecords();
          assert.ok(fs.existsSync(JSON_DATA_PATH));
        });

        it("Returns an empty array", () => {
          assert.deepEqual(loadRecords(), []);
        });
      }
    );

    describeWithHook("Read existing JSON file", cleanUpTestFile, () => {
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
