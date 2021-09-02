import nc from "next-connect";

/**
 * GET /api/feedbacks
 * Status: 200
 * Output: List of all the data from the database (JSON).
 *
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
async function getHandler(req, res) {
  res.status(200).json({ message: "echo get method" });
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
  res.status(200).json({ message: "echo post method" });
}

const handler = nc().get(getHandler).post(postHandler);

export default handler;
