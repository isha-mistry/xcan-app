import React, { useState, useRef, useEffect } from "react";
import VideoJs from "../ComponentUtils/VideoJs";
import videojs from "video.js";
import { v4 as uuidv4 } from "uuid";
import {
  DynamicAttendeeInterface,
  SessionInterface,
} from "@/types/MeetingTypes";
import { UserProfileInterface } from "@/types/UserProfileTypes";
import { useAccount } from "wagmi";

interface Attendee extends DynamicAttendeeInterface {
  profileInfo: UserProfileInterface;
}

interface Meeting extends SessionInterface {
  attendees: Attendee[];
  hostProfileInfo: UserProfileInterface;
}

// Extract YouTube video ID from various URL formats
function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

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

// Check if URL is a YouTube link
function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

function WatchSessionVideo({
  data,
  collection,
  autoplay,
  sessionDetails,
}: {
  data: Meeting;
  collection: string;
  autoplay: boolean;
  sessionDetails: { title: string; description: string; image: string };
}) {
  const playerRef = React.useRef(null);
  const { address } = useAccount();
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);

  // Check if video is a YouTube link
  useEffect(() => {
    if (data.video_uri) {
      const youtubeId = extractYouTubeVideoId(data.video_uri);
      if (youtubeId) {
        setIsYouTube(true);
        setYoutubeVideoId(youtubeId);
      } else {
        setIsYouTube(false);
        setYoutubeVideoId(null);
      }
    }
  }, [data.video_uri]);

  const videoJsOptions = {
    autoplay: autoplay,
    controls: true,
    responsive: true,
    fluid: true,
    controlBar: {
      skipButtons: {
        backward: 10,
        forward: 10,
      },
    },
    poster: sessionDetails.image
      ? `https://gateway.lighthouse.storage/ipfs/${sessionDetails.image}`
      : `https://gateway.lighthouse.storage/ipfs/${data.thumbnail_image}`,
    sources: [
      {
        src: data.video_uri,
        type: "video/mp4",
      },
    ],
    playbackRates: [0.5, 1, 1.5, 2],
  };

  const handlePlayerReady = (player: any) => {
    playerRef.current = player;

    let totalWatchTime = 0;
    let lastRecordedTime = 0;
    let hasCalledApi = false;
    let isPlaying = false;
    let startTime: number | null = null;
    let stopTime: number | null = null;

    let startRealTime: number | null = null;
    let stopRealTime: number | null = null;

    player.on("play", function () {
      isPlaying = true;
      lastRecordedTime = player.currentTime();

      startRealTime = Date.now();

      if (startTime === null) {
        startTime = player.currentTime();
      } else {
        startTime = player.currentTime();
      }
    });

    player.on("pause", function () {
      isPlaying = false;
      stopTime = player.currentTime();
      stopRealTime = Date.now();

      // Calculate video watch duration
      let diffTime = (stopTime ?? 0) - (startTime ?? 0);

      // Calculate real-world duration
      let realTimeDiff =
        ((stopRealTime ?? Date.now()) - (startRealTime ?? Date.now())) / 1000;

      //Determine which time to send
      let watchTime = diffTime <= realTimeDiff ? diffTime : realTimeDiff;

      //Call the watch log api here
      if (startTime !== null && stopTime !== null && realTimeDiff > 0) {
        sendWatchLog(startTime, stopTime, watchTime);
      }
    });

    player.on("timeupdate", function () {
      if (isPlaying) {
        var currentTime = player.currentTime();
        var timeDiff = currentTime - lastRecordedTime;

        // Handle both forward and backward seeking, and ensure we only count actual playback
        if (Math.abs(timeDiff) < 1) {
          totalWatchTime += timeDiff;
        }

        lastRecordedTime = currentTime;

        if (!hasCalledApi && totalWatchTime >= 15) {
          hasCalledApi = true;
          try {
            countAsView(data.meetingId);
          } catch (error) {
            console.error("Error calling CountAsView:", error);
          }
        }
      }
    });
  };


  async function sendWatchLog(startTime: number, stopTime: number, realTimeDiff: number) {
    try {
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
      };

      const raw = JSON.stringify({
        meeting_id: data.meetingId,
        meeting_type: collection, // Or whatever your meeting type is
        video_uri: data.video_uri,
        watch_logs: [
          {
            user_address: address || "",
            watch_session: [
              {
                start_time: startTime,
                end_time: stopTime,
                duration: realTimeDiff,
              },
            ],
            total_watch_time: realTimeDiff, // This will accumulate over multiple sessions
          },
        ],
      });

      const requestOptions: any = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const response = await fetch("/api/video-watch-logs", requestOptions);
      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to send watch log:", result);
      } else {
        console.log("Watch log sent successfully:", result);
      }
    } catch (error) {
      console.error("Error sending watch log:", error);
    }
  }

  async function countAsView(meetingId: string) {
    try {
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
      };
      let clientToken = localStorage.getItem("clientToken");
      if (!clientToken) {
        clientToken = uuidv4();
        localStorage.setItem("clientToken", clientToken);
      }
      const raw = JSON.stringify({
        meetingId: meetingId,
        clientToken: clientToken,
        collection: collection,
      });

      const requestOptions: any = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      const response = await fetch("/api/counting-views", requestOptions);
      const data = await response.json();
    } catch (error) {
      console.error("Error in views:", error);
    }
  }
  // If it's a YouTube video, use iframe embed
  if (isYouTube && youtubeVideoId) {
    const embedUrl = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`;

    return (
      <div>
        <div className="rounded-3xl overflow-hidden" style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={data.title || "YouTube video player"}
          />
        </div>
      </div>
    );
  }

  // For non-YouTube videos, use Video.js
  return (
    <div>
      <div className="rounded-3xl">
        <VideoJs options={videoJsOptions} onReady={handlePlayerReady} />
      </div>
    </div>
  );
}

export default WatchSessionVideo;
