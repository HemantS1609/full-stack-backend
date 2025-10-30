import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user?._id;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }
  if (!subscriberId) {
    throw new ApiError(401, "Unauthorized request");
  }

  if (channelId.toString() === subscriberId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: subscriberId,
  });
  if (existingSubscription) {
    await existingSubscription.deleteOne();
    return res
      .status(200)
      .json(
        new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
      );
  }

  await Subscription.create({
    channel: channelId,
    subscriber: subscriberId,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, { subscribed: true }, "Subscribed successfully")
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const channelObjectId = new mongoose.Types.ObjectId(channelId);

  const subscribers = await Subscription.aggregate([
    {
      $match: { channel: channelObjectId },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeLine: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribersList",
            },
          },
          {
            $addFields: {
              subscribersCount: { $size: "$subscribersList" },
              subscribedToSubscriber: {
                $cond: {
                  if: { $in: [channelObjectId, "$subscribersList.subscriber"] },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              fullName: 1,
              "avatar.url": 1,
              subscribersCount: 1,
              subscribedToSubscriber: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscriber",
    },
    {
      $project: {
        _id: 0,
        subscriber: 1,
      },
    },
  ]);
  if (!subscribers.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No subscribers found for this channel"));
  }

  // ✅ Success response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "Channel subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const subscriberObjectId = new mongoose.Types.ObjectId(subscriberId);
  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: subscriberObjectId,
      },
    },
    {
      // ✅ Join with users collection to fetch channel info
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannel",
        pipeline: [
          {
            // ✅ Fetch only the latest video for each channel efficiently
            $lookup: {
              from: "videos",
              localField: "_id",
              foreignField: "owner",
              as: "latestVideo",
              pipeline: [
                { $sort: { createdAt: -1 } }, // sort by newest first
                { $limit: 1 }, // take only the latest video
                {
                  $project: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    createdAt: 1,
                    views: 1,
                  },
                },
              ],
            },
          },
          {
            // ✅ Extract the first (latest) video directly
            $addFields: {
              latestVideo: { $first: "$latestVideo" },
            },
          },
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              "avatar.url": 1,
              latestVideo: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscribedChannel", // flatten joined channel
    },
    {
      $replaceRoot: { newRoot: "$subscribedChannel" }, // return only channel data
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
