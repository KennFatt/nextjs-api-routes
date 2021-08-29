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

function cleanUpTestFile() {
  try {
    fs.rmSync(JSON_DATA_PATH, { recursive: true });
  } catch {}
}

/**
 * Create new scenario (databases, dummy data, and random dummy data's index).
 *
 * It is pretty neat and useful for checking record existance,
 *  getting a record by its id, updating and/or deleting a record.
 *
 * @param {boolean} shouldInsertData
 * @param {number} recordCount
 */
function createDummyFeedbackScenario(
  shouldInsertData = false,
  recordCount = 3
) {
  const validRecords = loadRecords();
  const dummyRecords = Array(recordCount)
    .fill(null)
    .map((_, idx) => {
      const dummyRecord = createRecordObject(
        `dummy${idx}@example.com`,
        "A dummy message"
      );

      if (shouldInsertData) {
        insertRecord(validRecords, dummyRecord);
      }

      return dummyRecord;
    });
  const randomDummyRecordIndex = ~~(Math.random() * dummyRecords.length);

  return { validRecords, dummyRecords, randomDummyRecordIndex };
}

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
 */
describe("JsonDataHelper", () => {
  after(() => cleanUpTestFile());

  const dummyRecordData = {
    email: "dummy@example.com",
    message: "Consequat proident cupidatat amet non.",
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
  describe("createRecordObject(): Programatically creating a new record object.", () => {
    const record = createRecordObject(
      dummyRecordData.email,
      dummyRecordData.message
    );

    it(`Email property value equals to: \`${dummyRecordData.email}\``, () => {
      assert.strictEqual(record.email, dummyRecordData.email);
    });

    it(`Message property value equals to: \`${dummyRecordData.message}\``, () => {
      assert.strictEqual(record.message, dummyRecordData.message);
    });

    it("Produced object is immutable by default", () => {
      assert.throws(
        () => {
          record.email = "";
          record.message = "";
        },
        { name: "TypeError" }
      );
    });
  });
  // end-of: suite 1

  // start-of: suite 2
  describe("loadRecords(): Loading the data from filesystem.", () => {
    after(() => cleanUpTestFile());

    const records = loadRecords();

    it("Writes a new file on filesystem", () => {
      assert.strictEqual(fs.existsSync(JSON_DATA_PATH), true);
    });

    it("Initial data is equal to empty array", () => {
      assert.deepStrictEqual(records, []);
    });
  });
  // end-of: suite 2

  // start-of: suite 3
  describe("insertRecord(): Inserting new record into database.", () => {
    after(() => cleanUpTestFile());

    const { validRecords, dummyRecords } = createDummyFeedbackScenario(
      false,
      1
    );
    const validRecordKeys = Object.keys(dummyRecords[0]).join(",");

    it("Record object without `email` property will throw an error", () => {
      assert.throws(
        () => {
          insertRecord(validRecords, { message: "" });
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
          insertRecord(validRecords, { email: "" });
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
          insertRecord(validRecords, { email: "", message: "" });
        },
        {
          name: "Error",
          message: "The `newRecord` object has missing mandatory keys.",
        }
      );
    });

    it(`Record object should satisfy these properties: \`${validRecordKeys}\``, () => {
      assert.doesNotThrow(() => {
        insertRecord(validRecords, dummyRecords[0]);
      });
    });

    it("Returns array reference to its original data (mutates the `data` parameter)", () => {
      const latestRecords = insertRecord(validRecords, dummyRecords[0]);

      assert.deepStrictEqual(latestRecords, validRecords);
    });
  });
  // end-of: suite 3

  // start-of: suite 4
  describe("loadRecords(), getRecordDataById(): Reading record(s) from the database.", () => {
    after(() => cleanUpTestFile());

    const { validRecords, dummyRecords, randomDummyRecordIndex } =
      createDummyFeedbackScenario(true);

    it(`After insertion, the \`data\` array is now should have length of: \`${dummyRecords.length}\``, () => {
      assert.strictEqual(validRecords.length, dummyRecords.length);
    });

    it(`Find by specific id: \`${dummyRecords[randomDummyRecordIndex].id}\` should return the exact record object`, () => {
      const foundRecord = getRecordDataById(
        validRecords,
        dummyRecords[randomDummyRecordIndex].id
      );

      assert.deepStrictEqual(foundRecord, dummyRecords[randomDummyRecordIndex]);
    });

    it("Throws an error if given `recordId` does not exist in the database", () => {
      const randomId = dummyRecords.reduce((delegateId, rec) => {
        if (rec.id !== delegateId) {
          return delegateId;
        }

        do {
          let newDelegateId = ~~(Math.random() * (1 << 30));
          if (newDelegateId !== rec.id) {
            return newDelegateId;
          }
        } while (true);
      }, 0);

      assert.throws(
        () => {
          getRecordDataById(validRecords, randomId);
        },
        {
          name: "Error",
          message: `Record with id ${randomId} does not exists.`,
        }
      );
    });
  });
  // end-of: suite 4
});
