/**
 * A utility function to help us responding an error properly.
 * Use this method either in `getServerSideProps` or API routes.
 *
 * It will wrap the error message from `err` into a JSON response body.
 * {
 *    message: err.message
 * }
 *
 * @param {Error} err
 * @param {number} statusCode
 * @param {import("next").NextApiResponse} res
 */
function sendErrorResponse(err, statusCode, res) {
  /**
   * It's important to use `.end()` to end the stream when an error occurs.
   * Otherwise, it will broke the whole application.
   */
  res.setHeader("Content-Type", "application/json");
  res.status(statusCode).end(
    JSON.stringify({
      message: err.message,
    })
  );
}

export { sendErrorResponse };
