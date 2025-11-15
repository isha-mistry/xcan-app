import { connectDB } from "@/config/connectDB";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { UploadedVideo, YouTubeVideoData } from "@/types/UploadedVideoTypes";

// Extract YouTube video ID from various URL formats
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Fetch YouTube video metadata
async function fetchYouTubeVideoData(
  videoId: string
): Promise<YouTubeVideoData | null> {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!YOUTUBE_API_KEY) {
    console.error("YouTube API key is not configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,statistics`
    );

    const data = await response.json();

    if (!response.ok) {
      // Log detailed error information
      console.error("YouTube API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        videoId: videoId,
        apiKeyPresent: !!YOUTUBE_API_KEY,
        apiKeyLength: YOUTUBE_API_KEY?.length,
      });

      // Provide specific error messages based on the error reason
      if (data.error?.errors?.[0]?.reason) {
        const reason = data.error.errors[0].reason;
        const message = data.error.message || "Unknown error";

        if (reason === "quotaExceeded") {
          throw new Error(
            "YouTube API quota exceeded. Please check your API quota or wait before trying again."
          );
        } else if (reason === "keyInvalid") {
          throw new Error(
            "Invalid YouTube API key. Please check your YOUTUBE_API_KEY environment variable."
          );
        } else if (reason === "forbidden") {
          throw new Error(
            "YouTube API access forbidden. Please ensure YouTube Data API v3 is enabled in your Google Cloud project."
          );
        } else if (reason === "ipRefererBlocked") {
          throw new Error(
            "API key restrictions are blocking the request. Please check your API key restrictions in Google Cloud Console."
          );
        } else {
          throw new Error(
            `YouTube API error (${response.status}): ${message} (Reason: ${reason})`
          );
        }
      } else {
        throw new Error(
          `YouTube API error (${response.status}): ${
            data.error?.message || response.statusText
          }`
        );
      }
    }

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const statistics = video.statistics;

    return {
      title: snippet.title || "",
      description: snippet.description || "",
      viewCount: parseInt(statistics.viewCount || "0", 10),
      thumbnailUrl:
        snippet.thumbnails?.maxres?.url ||
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        "",
      videoId: videoId,
    };
  } catch (error) {
    console.error("Error fetching YouTube video data:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  let client;

  try {
    const {
      video_link,
      user_address,
    }: { video_link: string; user_address: string } = await req.json();

    if (!video_link || !user_address) {
      return NextResponse.json(
        { error: "Video link and user address are required" },
        { status: 400 }
      );
    }

    // Extract YouTube video ID
    const videoId = extractYouTubeVideoId(video_link);

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube video URL" },
        { status: 400 }
      );
    }

    // Fetch YouTube video metadata
    const youtubeData = await fetchYouTubeVideoData(videoId);

    if (!youtubeData) {
      return NextResponse.json(
        { error: "Failed to fetch video information from YouTube" },
        { status: 500 }
      );
    }

    // Connect to database
    client = await connectDB();
    const db = client.db();
    const collection = db.collection<UploadedVideo>("uploaded_videos");

    // Check if video already exists for this user
    const existingVideo = await collection.findOne({
      user_address: user_address.toLowerCase(),
      youtube_video_id: videoId,
    });

    if (existingVideo) {
      return NextResponse.json(
        { error: "This video has already been uploaded" },
        { status: 409 }
      );
    }

    // Create new video document
    const newVideo: Omit<UploadedVideo, "_id"> = {
      video_link,
      user_address: user_address.toLowerCase(),
      uuid: uuidv4(),
      timestamp: new Date(),
      title: youtubeData.title,
      description: youtubeData.description,
      views: youtubeData.viewCount,
      thumbnail_url: youtubeData.thumbnailUrl,
      youtube_video_id: videoId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await collection.insertOne(newVideo as any);

    await client.close();

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: result.insertedId,
          ...newVideo,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading video:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
