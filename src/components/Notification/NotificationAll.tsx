import React from "react";
import NotificationTile from "./NotificationTile";
import { NotificationProps } from "./NotificationTypeUtils";

function NotificationAll({ notifications }: NotificationProps) {
  return (
    <div className="rounded-2xl w-full mt-8">
      {notifications.map((item, index) => (
        <NotificationTile
          key={index}
          data={item}
          index={index}
          length={notifications.length}
        />
      ))}
    </div>
  );
}

export default NotificationAll;
