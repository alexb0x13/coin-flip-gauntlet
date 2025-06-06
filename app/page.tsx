"use client"

import { CoinFlipGame } from "@/components/coin-flip-game"
import { useEffect } from "react"
import { useMiniKit, useAddFrame, useOpenUrl } from "@coinbase/onchainkit/minikit"

export default function Home() {
  const { setFrameReady, isFrameReady } = useMiniKit()
  const addFrame = useAddFrame()
  const openUrl = useOpenUrl()

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [isFrameReady, setFrameReady])

  const handleAddFrame = async () => {
    const result = await addFrame()
    if (result) {
      console.log("Frame added:", result.url, result.token)
    }
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
      {/* Add Frame button */}
      <button
        onClick={handleAddFrame}
        className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-2xl border border-black/40 bg-white/60 backdrop-blur hover:bg-white"
      >
        Save Frame
      </button>
      <div className="max-w-md w-full mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-amber-600 dark:text-amber-400">Coin Flip Game</h1>
        <CoinFlipGame />
      </div>
      {/* Footer */}
      <footer className="absolute bottom-4 flex items-center w-screen max-w-[520px] justify-center">
        <button
          type="button"
          className="mt-4 ml-4 px-2 py-1 flex justify-start rounded-2xl font-semibold opacity-40 border border-black text-xs"
          onClick={() => openUrl("https://base.org/builders/minikit")}
        >
          BUILT ON BASE WITH MINIKIT
        </button>
      </footer>
    </main>
  )
}
