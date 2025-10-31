import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user?._id;

  if (!userId) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid user ID"));
  }

  const [subscribersAgg, videoAgg] = await Promise.all([
    Subscription.aggregate([
      {
        $match: { channel: new mongoose.Types.ObjectId(userId) },
      },
      {
        $count: "subscribersCount",
      },
    ]),

    Video.aggregate([
      {
        $match: { owner: new mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: { $size: "$likes" } },
          totalViews: { $sum: "$views" },
          totalVideos: { $sum: 1 },
        },
      },
    ]),
  ]);

  const channelStats = {
    totalSubscribers: subscribersAgg[0]?.subscribersCount || 0,
    totalLikes: videoAgg[0]?.totalLikes || 0,
    totalViews: videoAgg[0]?.totalViews || 0,
    totalVideos: videoAgg[0]?.totalVideos || 0,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "Channel stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const userId = req.user?._id;

  if (!userId) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid user ID"));
  }

  const videos = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
      },
    },
    {
      $project: {
        _id: 1,
        "videoFile.url": 1,
        "thumbnail.url": 1,
        title: 1,
        description: 1,
        createdAt: 1,
        isPublished: 1,
        likesCount: 1,
        views: 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
