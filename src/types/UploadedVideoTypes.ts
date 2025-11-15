export interface UploadedVideo {
  _id?: string;
  video_link: string;
  user_address: string;
  uuid: string;
  timestamp: Date;
  title: string;
  description: string;
  views: number;
  thumbnail_url?: string;
  youtube_video_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UploadVideoRequestBody {
  video_link: string;
  user_address: string;
}

export interface YouTubeVideoData {
  title: string;
  description: string;
  viewCount: number;
  thumbnailUrl: string;
  videoId: string;
}

