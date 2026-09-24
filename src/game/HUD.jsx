export function HUD({ collected, total }) {
  const allCollected = collected >= total

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 font-sans text-white">
      <div className="flex justify-center">
        <div className="rounded-full bg-black/40 px-6 py-2 backdrop-blur-sm">
          <span className="text-lg font-semibold tracking-wide">
            Orbs collected: {collected} / {total}
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        {allCollected ? (
          <div className="rounded-xl bg-black/50 px-8 py-4 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold text-yellow-300">All orbs collected!</p>
          </div>
        ) : (
          <div className="rounded-full bg-black/30 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm">
            W/&uarr; accelerate &middot; S/&darr; brake &middot; A/D or &larr;/&rarr; steer
          </div>
        )}
      </div>
    </div>
  )
}
