import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message
  const healthStatus = {
    status: "ok",
    uptime: process.uptime(), // Server uptime in seconds
    timestamp: new Date().toISOString(), // Current server time
    message: "Server is healthy and running",
  };
  return res
    .status(200)
    .json(new ApiResponse(200, healthStatus, "Health check successful"));
});

export { healthcheck };
