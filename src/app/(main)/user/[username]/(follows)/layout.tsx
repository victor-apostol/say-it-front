export default function FollowsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="flex items-center border-b-2 border-zinc-800 h-10 z-10 sticky top-0 bg-black bg-opacity-75 backdrop-blur-[1px]">
        <p className="font-semibold text-lg pl-2">My name</p>
      </div>
      { children }
    </>
  )
}