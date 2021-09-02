import nc from "next-connect";

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
async function getHandler(req, res) {
  res
    .status(200)
    .json({ message: "echo get method", feedbackId: req.query?.feedbackId });
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
async function putHandler(req, res) {
  res
    .status(200)
    .json({ message: "echo put method", feedbackId: req.query?.feedbackId });
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
async function deleteHandler(req, res) {
  res
    .status(200)
    .json({ message: "echo delete method", feedbackId: req.query?.feedbackId });
}

const handler = nc().get(getHandler).put(putHandler).delete(deleteHandler);

export default handler;
