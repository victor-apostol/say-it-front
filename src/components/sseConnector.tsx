'use client'

import { incrementNotificationsCount } from "@/redux/features/userNotificationsSlice";
import { useAppDispatch } from "@/redux/hooks";
import { Session } from "next-auth";
import { useEffect } from "react";

const SseConnector = ({ session }: { session: Session }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    document.cookie = `auth=${session.accessToken}; expires=Thu, 01 Jan 2024 00:00:00 UTC; path=/`;
    const eventSource = new EventSource('http://localhost:7777/api/notifications/sse',{
      withCredentials: true
    });
    
    console.log('Established connection', eventSource);

    eventSource.onerror = (event) => {
      console.log("EVENT ERROR", event);
    }

    eventSource.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data);
        dispatch(incrementNotificationsCount());
        console.log("EVENT DATA", eventData);
      } catch(err) {
        console.log(err);
      }
    }

    return () => {
      eventSource.close();
    }
  }, []);

  return <></>
}

export default SseConnector;