export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="skel h-6 w-40" />
      <div className="skel h-4 w-64" />

      <div className="grid grid-cols-2 gap-[14px] md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="metric flex flex-col gap-3">
            <div className="skel h-3 w-20" />
            <div className="skel h-6 w-24" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <div className="card flex flex-col gap-3">
          <div className="skel h-4 w-28" />
          <div className="skel h-3 w-48" />
          <div className="mt-2 flex flex-col gap-3">
            <div className="skel h-4 w-full" />
            <div className="skel h-4 w-full" />
            <div className="skel h-4 w-3/4" />
          </div>
        </div>
        <div className="card flex flex-col gap-3">
          <div className="skel h-4 w-28" />
          <div className="skel h-3 w-40" />
          <div className="mt-2 flex flex-col gap-3">
            <div className="skel h-4 w-full" />
            <div className="skel h-4 w-full" />
            <div className="skel h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
