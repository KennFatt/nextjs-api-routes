import fs from "fs";
import path from "path";
import assert from "assert/strict";
import axios from "axios";

const API_ENDPOINT = "http://localhost:3000/api/feedbacks";
const DATA_PATH_PRODUCTION = path.join(process.cwd(), "data", "data.json");
const DUMMY_PAYLOAD = {
  email: "dummy@example.com",
  message: "Ex do nostrud laboris deserunt tempor labore.",
};

function urlWithId(feedbackId) {
  if (typeof feedbackId !== "number") {
    throw new TypeError("`feedbackId` is must be a number!");
  }

  return `${API_ENDPOINT}/${feedbackId}`;
}

function cleanUp() {
  try {
    fs.rmSync(DATA_PATH_PRODUCTION, { recursive: true });
  } catch {}
}

describe("API Route: GET,POST /api/feedbacks", () => {
  describe("Initial GET request", () => {
    after(() => cleanUp());

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
    after(() => cleanUp());

    /** @type {import("axios").AxiosResponse<any>} */
    let response = null;

    /** Init the request once */
    beforeEach(async () => {
      if (response === null) {
        response = await axios.post(API_ENDPOINT, DUMMY_PAYLOAD, {
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

      assert.strictEqual(email, DUMMY_PAYLOAD.email);
      assert.strictEqual(message, DUMMY_PAYLOAD.message);
    });

    it("The `data` property should have `id` (number) as its property", () => {
      assert.ok("id" in response.data.data);
      assert.strictEqual(typeof response.data.data.id, "number");
    });
  });
});

describe("API Route: GET /api/feedbacks/[id]", () => {
  describe("with existing data", () => {
    after(() => cleanUp());

    /** @type {import("axios").AxiosResponse<any>} */
    let postResponse = null;
    /** @type {import("axios").AxiosResponse<any>} */
    let getResponse = null;

    beforeEach(async () => {
      if (postResponse === null) {
        postResponse = await axios.post(API_ENDPOINT, DUMMY_PAYLOAD, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        getResponse = await axios.get(urlWithId(postResponse.data.data.id));
      }
    });

    it("Should be returning 200 status if the feedback exists", () => {
      assert.strictEqual(getResponse.status, 200);
    });

    it("Should be returning a JSON", () => {
      const contentType = getResponse.headers["content-type"];

      // axios automatically parse "application/json" into JS object.
      // no need to check whether it is an object or not.
      assert.strictEqual(typeof contentType, "string");
      assert.ok(contentType.startsWith("application/json"));
      assert.strictEqual(typeof getResponse.data, "object");
    });

    it("Should be returning an object with `message` and `data` property", () => {
      assert.ok("data" in getResponse.data);
    });

    it("The `data` object should have `id`, `email`, and `message` property", () => {
      const responseData = getResponse.data.data;

      assert.ok("id" in responseData);
      assert.ok("email" in responseData);
      assert.ok("message" in responseData);
    });
  });

  describe("WITHOUT existing data", () => {
    after(() => cleanUp());

    /** @type {import("axios").AxiosResponse<any>} */
    let getResponse = null;
    beforeEach(async () => {
      if (getResponse === null) {
        /**
         * Axios will throw an error whenever the request is not succeed (status is not 2xx).
         * And fortunately, it still gives the response inside the error object with `response` property.
         *
         * @see https://stackoverflow.com/a/48299140/6569706
         * @see https://github.com/axios/axios#handling-errors
         */
        try {
          getResponse = await axios.get(urlWithId(-1));
        } catch (err) {
          // we can still accessing the response
          getResponse = err.response;
        }
      }
    });

    it("Should be returning 404 status if the feedback DOES NOT exists", () => {
      assert.strictEqual(getResponse.status, 404);
    });

    it("Should be returning a JSON", () => {
      const contentType = getResponse.headers["content-type"];

      // axios automatically parse "application/json" into JS object.
      // no need to check whether it is an object or not.
      assert.strictEqual(typeof contentType, "string");
      assert.ok(contentType.startsWith("application/json"));
      assert.strictEqual(typeof getResponse.data, "object");
    });

    it("The response object should have and only `message` property", () => {
      const keys = Object.keys(getResponse.data);

      assert.strictEqual(keys.length, 1);
      assert.strictEqual(keys[0], "message");
    });
  });
});
