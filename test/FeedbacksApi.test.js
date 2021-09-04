import fs from "fs";
import path from "path";
import assert from "assert/strict";
import axios from "axios";

const API_ENDPOINT = "http://localhost:3000/api/feedbacks";
const DATA_PATH_PRODUCTION = path.join(process.cwd(), "data", "data.json");

describe("API Route: /api/feedbacks", () => {
  describe("Initial GET request", () => {
    /** @type {import("axios").AxiosResponse<any>} */
    let response = null;

    /** Init the request once */
    beforeEach(async () => {
      if (response === null) {
        response = await axios.get(API_ENDPOINT);
      }
    });

    it("Should be and always be returning 200 status", () => {
      assert.strictEqual(response.status, 200);
    });

    it("The response should be a JSON", () => {
      const contentType = response.headers["content-type"];

      // axios automatically parse "application/json" into JS object.
      // no need to check whether it is an object or not.
      assert.strictEqual(typeof contentType, "string");
      assert.ok(contentType.startsWith("application/json"));
      assert.strictEqual(typeof response.data, "object");
    });

    it("The response should have a `message` and `data` property", () => {
      assert.ok("message" in response.data);
      assert.ok("data" in response.data);
    });

    it("The `message` property should be a string: OK", () => {
      assert.strictEqual(response.data.message, "OK");
    });

    it("The `data` property should be an array", () => {
      assert.ok(response.data.data instanceof Array);
    });
  });

  describe("Storing the data with POST method", () => {
    after(() => {
      try {
        fs.rmSync(DATA_PATH_PRODUCTION, { recursive: true });
      } catch {}
    });

    /** @type {import("axios").AxiosResponse<any>} */
    let response = null;

    let input = {
      email: "dummy@example.com",
      message: "Ex do nostrud laboris deserunt tempor labore.",
    };

    /** Init the request once */
    beforeEach(async () => {
      if (response === null) {
        response = await axios.post(API_ENDPOINT, input, {
          headers: { "Content-Type": "application/json" },
        });
      }
    });

    it("Should be and always be returning 201 status", () => {
      assert.strictEqual(response.status, 201);
    });

    it("The response thould be a JSON", () => {
      const contentType = response.headers["content-type"];

      // axios automatically parse "application/json" into JS object.
      // no need to check whether it is an object or not.
      assert.strictEqual(typeof contentType, "string");
      assert.ok(contentType.startsWith("application/json"));
      assert.strictEqual(typeof response.data, "object");
    });

    it("The response should have a `message` and `data` property", () => {
      assert.ok("message" in response.data);
      assert.ok("data" in response.data);
    });

    it("The `message` property should be a string: OK", () => {
      assert.strictEqual(response.data.message, "OK");
    });

    it("The `data` property should be an object", () => {
      assert.strictEqual(typeof response.data.data, "object");
    });

    it("The `data` property should be equals to the input object", () => {
      const { email, message } = response.data.data;

      assert.strictEqual(email, input.email);
      assert.strictEqual(message, input.message);
    });
  });
});
