import assert from "assert/strict";
import fs from "fs";
import {
  JSON_DATA_PATH,
  createRecordObject,
  insertRecord,
  loadRecords,
  getRecordDataById,
  updateRecord,
  deleteRecord,
} from "../lib/JsonDataHelper";

const DUMMY_EMAIL = "dummy{id}@example.com";
const DUMMY_MESSAGE = "Consequat proident cupidatat amet non.";
const DUMMY_RECORD = createRecordObject(DUMMY_EMAIL, DUMMY_MESSAGE);

/**
 * Test suites:
 *
 * 0. All functions
 *    - All methods should throwing an error (TypeError with the exact same message)
 *        if the `data` parameter is not an array.
 *
 * 1. Programatically create a record object with: `createRecordObject()`
 *    - Validating produced object's keys with its creation arguments.
 *    - The object created by `createRecordObject()` should be immutable.
 *
 * 2. Data initialization with: `loadRecords()`
 *    - Calling the function `loadRecords()` should generate a JSON file.
 *    - The array returned from `loadRecords()` should be empty in the first call.
 *
 * 3. Data insertion with: `insertRecord()`
 *    - Valid record object should satisfy `{id, email, message}` as its keys.
 *    - Function `insertRecord()` will mutates the original array and return it
 *        back when insertion succeed.
 *
 * 4. Inserting and writing the data with: `insertRecord()`, `loadRecords()`, and `getRecordDataById()`
 *    - Data insertion should be working just fine with object returned from `createRecordObject()`.
 *    - Finding specific id with `geRecordDataById()` should be working just fine.
 *    - If the given `recordId` to function `getRecordDataById()` does not exist in the database, then
 *        an error should be thrown.
 *
 * 5. Updating the data with: `updateRecord()`
 *    - Updating old record will replace the data index's value with the newest one.
 *        data[N] = oldData -> data[N] = newData
 *        The updating mechanism only rely on array index (`[]`) operator.
 *    - Updating with the exact same data does not trigger database to write the data.
 *    - Updating invalid or non exist id will throw an error.
 *
 * 6. Deleting specific data from the database with: `deleteRecord()`
 *    - `deleteRecord()` function should return a removed record object.
 *    - Removing the record should updates the data array too.
 */
describeClean("JsonDataHelper", () => {
  describeClean("Testing to create fake test scenario", () => {
    const length = 5;

    it(`The generated data length should be: \`${length}\``, () => {
      const records = createDummyFeedbackScenario(true, length);

      assert.strictEqual(records.length, length);
    });
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
  describe("createRecordObject(): Programatically creating a new record object.", () => {
    it(`Email property value equals to: \`${DUMMY_EMAIL}\``, () => {
      assert.strictEqual(DUMMY_RECORD.email, DUMMY_EMAIL);
    });

    it(`Message property value equals to: \`${DUMMY_MESSAGE}\``, () => {
      assert.strictEqual(DUMMY_RECORD.message, DUMMY_MESSAGE);
    });

    it("Produced object is immutable by default", () => {
      assert.throws(
        () => {
          DUMMY_RECORD.email = "";
          DUMMY_RECORD.message = "";
        },
        { name: "TypeError" }
      );
    });
  });
  // end-of: suite 1

  // start-of: suite 2
  describeClean("loadRecords(): Loading the data from filesystem.", () => {
    it("Writes a new file on filesystem", () => {
      loadRecords();

      assert.strictEqual(fs.existsSync(JSON_DATA_PATH), true);
    });

    it("Initial data is equal to empty array", () => {
      assert.deepStrictEqual(loadRecords(), []);
    });
  });
  // end-of: suite 2

  // start-of: suite 3
  describeClean("insertRecord(): Inserting new record into database.", () => {
    const records = createDummyFeedbackScenario(true);
    const validRecordKeys = Object.keys(records[0]).join(",");

    it("Record object without `email` property will throw an error", () => {
      assert.throws(
        () => {
          insertRecord(records, { message: "" });
        },
        {
          name: "Error",
          message: "The `newRecord` object has missing mandatory keys.",
        }
      );
    });

    it("Record object without `message` property will throw an error", () => {
      assert.throws(
        () => {
          insertRecord(records, { email: "" });
        },
        {
          name: "Error",
          message: "The `newRecord` object has missing mandatory keys.",
        }
      );
    });

    it("Record object without `id` property will throw an error", () => {
      assert.throws(
        () => {
          insertRecord(records, { email: "", message: "" });
        },
        {
          name: "Error",
          message: "The `newRecord` object has missing mandatory keys.",
        }
      );
    });

    it(`Record object should satisfy these properties: \`${validRecordKeys}\``, () => {
      assert.doesNotThrow(() => {
        insertRecord(records, records[0]);
      });
    });

    it("Returns array reference to its original data (mutates the `data` parameter)", () => {
      const latestRecords = insertRecord(records, records[0]);

      assert.deepStrictEqual(latestRecords, records);
    });
  });
  // end-of: suite 3

  // start-of: suite 4
  describeClean(
    "loadRecords(), getRecordDataById(): Reading record(s) from the database.",
    () => {
      const records = createDummyFeedbackScenario(true);

      it(`After insertion, the \`data\` array is now should have length of: \`${
        records.length + 1
      }\``, () => {
        const expectedLength = records.length + 1;
        insertRecord(records, DUMMY_RECORD);

        assert.strictEqual(records.length, expectedLength);
      });

      it(`Find by specific id should return the exact record object`, () => {
        const randomRecordIndex = ~~(Math.random() * records.length);
        const findRecord = records[randomRecordIndex];
        const foundRecord = getRecordDataById(records, findRecord.id);

        assert.deepStrictEqual(foundRecord, findRecord);
      });

      it("Throws an error if given `recordId` does not exist in the database", () => {
        assert.throws(
          () => {
            getRecordDataById(records, -1);
          },
          {
            name: "Error",
            message: `Record with id ${-1} does not exists.`,
          }
        );
      });
    }
  );
  // end-of: suite 4

  // start-of: suite 5
  describeClean(
    "updateRecord(): Updating specific data from the database.",
    () => {
      const records = createDummyFeedbackScenario(false, 3);
      const oldRecord = records[0];
      const newRecord = DUMMY_RECORD;

      it(`Updates a record with id of \`${oldRecord.id}\` with new record whose id \`${newRecord.id}\``, () => {
        const recordsCopy = [...records];

        assert.ok(updateRecord(recordsCopy, oldRecord.id, newRecord));
      });

      it("Updating data with existing record (`FeedbackRecord`) should not update the database", () => {
        const recordsCopy = [...records];
        const record = recordsCopy[0];

        assert.strictEqual(updateRecord(recordsCopy, record.id, record), false);
      });

      it("Updating data with NON existing record (`FeedbackRecord`) should throw an error", () => {
        const recordsCopy = [...records];

        assert.throws(
          () => {
            updateRecord(recordsCopy, -1, newRecord);
          },
          {
            name: "Error",
            message: "The record with an `id` of -1 does not exist!",
          }
        );
      });
    }
  );
  // end-of: suite 5

  // start-of: suite 6
  describeClean(
    "deleteRecord(): Deleting specific record from the database.",
    () => {
      const records = createDummyFeedbackScenario(true, 3);
      const targetDeleteRecord = records[0];

      it("Remove a record from the database and return the removed record objecte", () => {
        const recordsCopy = [...records];
        const deletedRecord = deleteRecord(recordsCopy, targetDeleteRecord.id);

        assert.deepStrictEqual(deletedRecord, targetDeleteRecord);
      });

      it("After removing single record, the length of the data is now should be `startLength - 1`", () => {
        const recordsCopy = [...records];
        const originalLength = records.length;
        deleteRecord(recordsCopy, targetDeleteRecord.id);

        assert.strictEqual(recordsCopy.length, originalLength - 1);
      });
    }
  );
  // end-of: suite 6
});

/**
 * Custom Mocha's `describe` function by wrapping it with
 *  filesystem cleanup. This approach is used to prevent DRY.
 *
 * @param {string} title Suite title
 * @param {Function} tests
 * @returns {import("mocha").Suite}
 */
function describeClean(title, tests) {
  const cleanUpFn = () => {
    try {
      fs.rmSync(JSON_DATA_PATH, { recursive: true });
    } catch {}
  };

  return describe(title, () => {
    before(() => cleanUpFn());
    after(() => cleanUpFn());

    tests();
  });
}

/**
 * Create new scenario (databases, dummy data, and random dummy data's index).
 * NOTE: This function will read/write the actual JSON file from filesystem.
 *
 * It is pretty neat and useful for checking record existance,
 *  getting a record by its id, updating and/or deleting a record.
 *
 * @param {boolean} shouldInsertData Insert generated dummy data into the JSON file.
 * @param {number} recordCount Total amount of dummy data.
 */
function createDummyFeedbackScenario(
  shouldInsertData = false,
  recordCount = 1
) {
  const records = loadRecords();

  if (shouldInsertData) {
    for (let i = 0; i < recordCount; ++i) {
      const dummyRecord = createRecordObject(
        DUMMY_EMAIL.replace(/\{id\}/, i),
        DUMMY_MESSAGE
      );

      insertRecord(records, dummyRecord);
    }
  }

  return records;
}
