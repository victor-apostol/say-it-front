'use client'

import { useEffect, useState } from "react";
import PopUpMessage from "../ui/errors/popUpMessage";
import Notification from "./notification";
import NoDataInfo from "../ui/informative/noDataInfo";
import InfiniteScroll from "react-infinite-scroll-component";
import { AxiosError } from "axios";
import SpinningLoader from "../ui/loaders/spinningLoader";
import { Session } from "next-auth";
import { INotification, INotificationResponse } from "@/types/notification.interface";
import { getUserNotifications } from "@/services/user.service";
import { FETCH_NOTIFICATIONS_TAKE } from "@/constants/tweets/notification.constants";
import { setInitialNotificationsCount } from "@/redux/features/userNotificationsSlice";
import { useDispatch } from "react-redux";

type Props = { 
  session: Session;
  fetchedNotificationsResponse: INotificationResponse;
}

const NotificationsSection = ({ session, fetchedNotificationsResponse }: Props) => {
  const [notifications, setNotifications] = useState<Array<INotification>>(fetchedNotificationsResponse.notifications);
  const [pageOffSet, setPageOffSet] = useState<number>(FETCH_NOTIFICATIONS_TAKE);
  const [hasMore, setHasMore] = useState<boolean>(fetchedNotificationsResponse.hasMore);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setInitialNotificationsCount({ initState: 0 }));
  }, []);

  const handlefFetchUserNotifications = async () => {   
    try {
      const response = await getUserNotifications(session.accessToken, pageOffSet, FETCH_NOTIFICATIONS_TAKE);

      setNotifications(prev => [...prev, ...response.data.notifications]);
      setPageOffSet(prev => prev + FETCH_NOTIFICATIONS_TAKE);
      setHasMore(response.data.hasMore);

      return [...notifications, ...response.data.notifications];
    }catch (err: any) {
      if (err instanceof AxiosError) setApiError(err.response?.data.message)
    }
  } 

  return ( 
    <div className={`${notifications.length === 0 ? 'flex items-center justify-center h-[100vh]' : ''}`}>
      {notifications.length > 0 ?
        (
          <InfiniteScroll 
            dataLength={notifications.length}
            next={handlefFetchUserNotifications}
            hasMore={hasMore}
            loader={<SpinningLoader />}
          >
          {
            notifications.map(notification => {
              return (
                <div key={notification.id} className="tweet_section hover:bg-hover_tweet_gray"> 
                  <Notification  
                    session={session} 
                    notification={notification}
                  />
                </div>
              ) 
            })
          }
          </InfiniteScroll>
        )
        : <NoDataInfo text="Oops, Nothing yet to see here yet"/>
      }  

      { apiError && <PopUpMessage text={apiError} setText={setApiError} />}
    </div> 
  )
}

export default NotificationsSection;
