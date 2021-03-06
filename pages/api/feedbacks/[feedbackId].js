import nc from "next-connect";
import { sendErrorResponse } from "../../../lib/Utils";
import {
  loadRecords,
  getRecordDataById,
  updateRecord,
  createRecordObject,
} from "../../../lib/JsonDataHelper";

const data = loadRecords();

/**
 * GET /api/feedbacks/[id: number]
 * Status: 200, 404
 * Output:
 *  - 200: The requested feedback data (JSON).
 *  - 404: Not found message (JSON).
 *
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
function getHandler(req, res) {
  try {
    const numberFeedbackId = Number.parseInt(req.query?.feedbackId || -1);
    const requestedData = getRecordDataById(data, numberFeedbackId);
    res.status(200).json({ message: "OK", data: requestedData });
  } catch (e) {
    sendErrorResponse(e, 404, res);
  }
}

/**
 * PUT /api/feedbacks/[id: number]
 * Status: 201, 204, 404
 * Input: Feedback data from form input and should be JSON serialized.
 * Output:
 *  - 201: The newest data that has been successfully inserted into the database (JSON).
 *  - 204: No content.
 *  - 404: Not found message (JSON).
 *
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
function putHandler(req, res) {
  try {
    const numberFeedbackId = Number.parseInt(req.query?.feedbackId || -1);
    const newRecord = createRecordObject(req.body?.email, req.body?.message);
    console.log({ data, numberFeedbackId, newRecord });
    const isDataUpdated = updateRecord(data, numberFeedbackId, newRecord);

    if (isDataUpdated) {
      res.status(201).json({ message: "OK", data: data[data.length - 1] });
    } else {
      res.status(204);
    }
  } catch (e) {
    console.error(e);
    sendErrorResponse(e, 404, res);
  }
}

/**
 * DELETE /api/feedbacks/[id: number]
 * Status: 200, 404
 * Output:
 *  - 200: The deleted feedback data (JSON).
 *  - 404: Not found message (JSON).
 *
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
function deleteHandler(req, res) {
  res
    .status(200)
    .json({ message: "echo delete method", feedbackId: req.query?.feedbackId });
}

const handler = nc().get(getHandler).put(putHandler).delete(deleteHandler);

export default handler;
