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

    const records = loadRecords();
    const record = createRecordObject(
      dummyRecordData.email,
      dummyRecordData.message
    );
    const recordKeysString = Object.keys(record).join(",");

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

    it(`Record object should satisfy these properties: \`${recordKeysString}\``, () => {
      assert.doesNotThrow(() => {
        insertRecord(records, record);
      });
    });

    it("Returns array reference to its original data (mutates the `data` parameter)", () => {
      const latestRecords = insertRecord(records, record);
      assert.deepStrictEqual(latestRecords, records);
    });
  });
  // end-of: suite 3

  // start-of: suite 4
  describe("loadRecords(), getRecordDataById(): Reading record(s) from the database.", () => {
    after(() => cleanUpTestFile());

    const records = loadRecords();
    const dummyRecords = [
      createRecordObject("dummy0@example.com", "A dummy message"),
      createRecordObject("dummy1@example.com", "A dummy message"),
      createRecordObject("dummy2@example.com", "A dummy message"),
    ];
    const dummyRecordsLength = dummyRecords.length;
    const randomIndex = Math.floor(Math.random() * dummyRecordsLength);
    const findRecordTarget = dummyRecords[randomIndex];

    dummyRecords.forEach((dummyRecord) => {
      insertRecord(records, dummyRecord);
    });

    it(`After insertion, the \`data\` array is now should have length of: \`${dummyRecordsLength}\``, () => {
      assert.strictEqual(records.length, dummyRecordsLength);
    });

    it(`Find by specific id: \`${findRecordTarget.id}\` should return the exact record object`, () => {
      const foundRecord = getRecordDataById(records, findRecordTarget.id);
      assert.deepStrictEqual(foundRecord, findRecordTarget);
    });

    it("Throws an error if given `recordId` does not exist in the database", () => {
      const validIds = dummyRecords.map((dummyRecord) => dummyRecord.id);
      let randomId = 0;
      while (validIds.includes(randomId)) {
        randomId = ~~(Math.random() * (1 << 30));
      }

      assert.throws(
        () => {
          getRecordDataById(records, randomId);
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
