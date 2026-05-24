const { getRecommendations, getSimilarProducts } = require("../services/recommendation.service");
const ApiResponse  = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// ── GET /api/recommendations ──────────────────────────────────────────────
// Returns personalised recommendations based on the authenticated user's
// browsing history and past orders.
const getPersonalised = asyncHandler(async (req, res) => {
  const { limit = 12 } = req.query;
  const products = await getRecommendations(req.user, parseInt(limit));
  return new ApiResponse(200, "Recommendations fetched.", products).send(res);
});

// ── GET /api/recommendations/similar/:productId ───────────────────────────
// Returns products similar to the given product (same category / tags).
const getSimilar = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;
  const products = await getSimilarProducts(req.params.productId, parseInt(limit));
  return new ApiResponse(200, "Similar products fetched.", products).send(res);
});

module.exports = { getPersonalised, getSimilar };
