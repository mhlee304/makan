export default function CardSkeleton() {
  return (
    <div className="relative flex-1 min-w-0 min-h-72 sm:min-h-0 bg-ink/10 overflow-hidden">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
      {/* Bottom content placeholder */}
      <div className="absolute bottom-0 inset-x-0 p-6 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-white/10" />
          <div className="h-5 w-12 rounded-full bg-white/10" />
        </div>
        <div className="h-7 w-3/4 rounded bg-white/10" />
        <div className="h-4 w-full rounded bg-white/10" />
        <div className="h-4 w-2/3 rounded bg-white/10" />
      </div>
    </div>
  )
}
