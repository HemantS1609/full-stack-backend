import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      query,
      sortBy = "createdAt",
      sortType = "desc",
      userId,
    } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const sortOrder = sortType === "asc" ? 1 : -1;

    const pipeline = [];

    // full text search
    if (query) {
      pipeline.push({
        $search: {
          index: "video-search",
          text: {
            query: query.trim(),
            path: ["title", "description"],
            fuzzy: { maxEdits: 2 },
          },
        },
      });
    }

    if (userId) {
      if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId format");
      }

      // filter by userId
      pipeline.push({
        $match: { owner: new mongoose.Types.ObjectId(userId) },
      });
    }

    // only published videos
    pipeline.push({
      $match: { isPublished: true },
    });

    // for sorting
    pipeline.push({
      $sort: { [sortBy]: sortOrder },
    });

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$owner",
      }
    );

    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        "thumbnail.url": 1,
        duration: 1,
        views: 1,
        createdAt: 1,
        "owner.username": 1,
        "owner.fullName": 1,
        "owner.avatar": 1,
      },
    });

    const aggregate = Video.aggregate(pipeline);
    const options = {
      page,
      limit,
    };

    const result = await Video.aggregatePaginate(aggregate, options);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Videos fetched successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "An error occurred while fetching videos"
    );
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(
      400,
      "Title and description are required to publish a video"
    );
  }

  const localPathVideo = req.files?.videoFile?.[0]?.path;
  const localPathThumbnail = req.files?.thumbnail?.[0]?.path;

  if (!localPathVideo || !localPathThumbnail) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  const videoFile = await uploadOnCloudinary(localPathVideo);
  const thumbnail = await uploadOnCloudinary(localPathThumbnail);

  if (!videoFile?.url || !thumbnail?.url) {
    throw new ApiError(
      500,
      "Failed to upload video or thumbnail to cloudinary"
    );
  }

  const video = await Video.create({
    videoFile: {
      url: videoFile?.url,
      public_id: videoFile?.public_id,
    },
    thumbnail: {
      url: thumbnail?.url,
      public_id: thumbnail?.public_id,
    },
    title,
    description,
    duration: videoFile?.duration,
    owner: req?.user?._id,
    isPublished: true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId format");
  }
  if (!isValidObjectId(req.user?._id)) {
    throw new ApiError(400, "Invalid userId format");
  }

  const video = await Video.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(videoId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribersCount: { $size: "$subscribers" },
              isSubscribed: {
                $in: [req.user?._id, "$subscribers.subscribers"],
              },
            },
          },
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              subscribersCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
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
        likeCount: { $size: "$likes" },
        owner: { $first: "$owner" },
        isLiked: { $in: [req.user?._id, "$likes.likedBy"] },
      },
    },
    {
      $project: {
        "videoFile.url": 1,
        title: 1,
        description: 1,
        views: 1,
        createdAt: 1,
        duration: 1,
        comments: 1,
        owner: 1,
        likesCount: 1,
        isLiked: 1,
      },
    },
  ]);

  if (video?.length === 0) {
    throw new ApiError(404, "Video not found");
  }

  await Promise.allSettled([
    Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }),
    User.findByIdAndUpdate(req.user?._id, {
      $addToSet: { watchHistory: videoId },
    }),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video details fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  //TODO: update video details like title, description, thumbnail

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId format");
  }

  if (!(title && description)) {
    throw new ApiError(
      400,
      "Title and description are required to update video"
    );
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  const updatedData = {};
  if (title) updatedData.title = title;
  if (description) updatedData.description = description;

  if (req.file?.path) {
    const localPathThumbnail = req.file.path;
    const uploadedThumbnail = await uploadOnCloudinary(localPathThumbnail);
    if (!uploadedThumbnail?.url) {
      throw new ApiError(500, "Failed to upload thumbnail to cloudinary");
    }

    updatedData.thumbnail = {
      public_id: uploadedThumbnail?.public_id,
      url: uploadedThumbnail?.url,
    };

    if (video.thumbnail?.public_id) {
      await deleteOnCloudinary(video.thumbnail?.public_id);
    }
  }

  if (Object.keys(updatedData).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const updatedVideo = await Video.findByIdAndUpdate(videoId, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!updatedVideo) {
    throw new ApiError(500, "Failed to update video, please try again later");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId format");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }
  await Like.deleteMany({
    video: videoId,
  });

  await Comment.deleteMany({
    video: videoId,
  });

  await deleteOnCloudinary(video.videoFile?.public_id);
  await deleteOnCloudinary(video.thumbnail?.public_id);
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId format");
  }

  const video = await Video.findById(videoId).select("isPublished owner");

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  const update = await Video.updateOne(
    { _id: videoId },
    { $set: { isPublished: !video.isPublished, updatedAt: new Date() } }
  );

  if (update.modifiedCount === 0) {
    throw new ApiError(
      500,
      "Failed to toggle publish status, please try again"
    );
  }

  return res.status(200).json(
    new ApiResponse(200, {
      videoId,
      isPublished: !video.isPublished,
      message: `Video has been ${!video.isPublished ? "published" : "unpublished"} successfully`,
    })
  );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
