import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { Holder } from "@/types/LeaderBoardTypes";
import { UserProfileInterface } from "@/types/UserProfileTypes";
import {
  DynamicAttendeeInterface,
  SessionInterface,
} from "@/types/MeetingTypes";
interface Attendee extends DynamicAttendeeInterface {
  profileInfo: UserProfileInterface;
}

interface Meeting extends SessionInterface {
  attendees: Attendee[];
  hostProfileInfo: UserProfileInterface;
}

// Deprecated: Wallet logic removed for GitHub-only authentication
export default function WatchCollectibleInfo() {
  return null;
}
