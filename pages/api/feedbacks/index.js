import nc from "next-connect";
import {
  loadRecords,
  insertRecord,
  createRecordObject,
} from "../../../lib/JsonDataHelper";

const data = loadRecords();

/**
 * GET /api/feedbacks
 * Status: 200
 * Output: List of all the data from the database (JSON).
 *
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
async function getHandler(req, res) {
  res.status(200).json({ message: "OK", data });
}

/**
 * POST /api/feedbacks
 * Status: 201
 * Input: Feedback data from form input and should be JSON serialized.
 * Output: The newest data that has been successfully inserted into the database (JSON).
 *
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
async function postHandler(req, res) {
  try {
    const parsedRecord = createRecordObject(req.body?.email, req.body?.message);
    const insertedData = insertRecord(data, parsedRecord)[0];

    res.status(201).json({ message: "OK", data: insertedData });
  } catch (e) {
    res.status(400).json({ message: e.getMessage() });
  }
}

const handler = nc().get(getHandler).post(postHandler);

export default handler;
