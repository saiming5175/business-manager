export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="skel h-6 w-32" />
      <div className="card flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between border-t border-hair pt-3 first:border-t-0 first:pt-0">
            <div className="flex flex-col gap-2">
              <div className="skel h-4 w-40" />
              <div className="skel h-3 w-28" />
            </div>
            <div className="skel h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
