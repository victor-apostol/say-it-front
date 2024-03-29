import TweetsSection from "@/components/tweets/tweetsSection";
import StickyTitle from "@/components/ui/errors/stickyTitle";
import UserProfileSection from "@/components/user/userProfileSection";
import { TweetProvider } from "@/context/tweetContext";
import { authOptions } from "@/lib/auth";
import { getUserTweets } from "@/services/tweets.service";
import { getUserProfileInfo } from "@/services/user.service";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const User = async ({ params }: {params: { username: string }}) => {
  const session = await getServerSession(authOptions); 
  if(!session) redirect(`/auth/?callbackUrl=/user/${params.username}`);
  console.log("user render")
  const [targetProfileInfoResponse, tweetsResponse] = await Promise.all([
    getUserProfileInfo(session.accessToken, params.username),
    getUserTweets(session.accessToken, params.username),
  ]);

  return (
    <TweetProvider fetchedTweetsServer={tweetsResponse.tweets} >
      <section className="text-white col-span-2">
        <StickyTitle title={targetProfileInfoResponse.data.user.name}/>

        <UserProfileSection 
          session={session}
          targetProfileInfo={targetProfileInfoResponse.data}
        />
        
        <TweetsSection 
          fetchNewTweets={getUserTweets}
          funcArgs={[session.accessToken, params.username]}
          session={session} 
          hasMoreToFetch={tweetsResponse.hasMore}
        />
      </section>
    </TweetProvider>
  )
}

export default User;