import React, { useState, useRef } from "react";
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
        console.log(
          `Video started at: ${startTime} (Clock time: ${startRealTime / 1000})`
        );
      } else {
        startTime = player.currentTime();
        console.log(
          `Video resumed at: ${startTime} (Clock time: ${startRealTime / 1000})`
        );
      }
    });

    player.on("pause", function () {
      isPlaying = false;
      stopTime = player.currentTime();
      stopRealTime = Date.now();
      console.log(
        `Video paused at: ${stopTime} (Clock time: ${stopRealTime / 1000})`
      );

      // Calculate video watch duration
      let diffTime = (stopTime ?? 0) - (startTime ?? 0);
      console.log(`Video watched for: ${diffTime} seconds`);

      // Calculate real-world duration
      let realTimeDiff =
        ((stopRealTime ?? Date.now()) - (startRealTime ?? Date.now())) / 1000;
      console.log(`Real-world time difference: ${realTimeDiff} seconds`);

       //Call the watch log api here
       if (startTime !== null && stopTime !== null && realTimeDiff > 0) {
        sendWatchLog(startTime, stopTime, realTimeDiff);
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
    //   player.on("seeking", function () {
    //     const newTime = player.currentTime();
    //     const seekDifference = Math.abs(newTime - lastRecordedTime);

    //     if (seekDifference > 2) { // Ignore very small jumps
    //       skippedTime += seekDifference;
    //       // console.log(`User skipped: ${seekDifference} seconds`);
    //       // console.log(`Total skipped time: ${skippedTime} seconds`);
    //     }

    //     lastRecordedTime = newTime; // Update last recorded time
    //   });
    //   player.on("seeked", function () {
    //     lastRecordedTime = player.currentTime(); // Update last known position
    //   });
  };


  async function sendWatchLog(startTime:number, stopTime:number, realTimeDiff:number) {
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
            user_address: address,
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
  return (
    <div>
      <div className="rounded-3xl">
        <VideoJs options={videoJsOptions} onReady={handlePlayerReady} />
      </div>
    </div>
  );
}

export default WatchSessionVideo;
