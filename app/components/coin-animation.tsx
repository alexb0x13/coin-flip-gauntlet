"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type CoinSide = "heads" | "tails" | null

interface CoinAnimationProps {
  isFlipping: boolean
  result: CoinSide
}

export function CoinAnimation({ isFlipping, result }: CoinAnimationProps) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (isFlipping) {
      // Random number of rotations between 5 and 10 full spins
      const randomRotations = 5 + Math.floor(Math.random() * 5)
      const newRotation = randomRotations * 360 + (result === "tails" ? 180 : 0)
      setRotation(newRotation)
    }
  }, [isFlipping, result])

  return (
    <div className="relative h-40 w-40 perspective-1000">
      <AnimatePresence>
        {isFlipping ? (
          <motion.div
            key="flipping"
            className="absolute inset-0 w-full h-full"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: rotation }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <div className="coin-container">
              <div className="coin">
                <div className="coin-side coin-heads">
                  <div className="coin-face">H</div>
                </div>
                <div className="coin-side coin-tails">
                  <div className="coin-face">T</div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {result ? (
              <div className={`coin-static ${result === "heads" ? "coin-heads-static" : "coin-tails-static"}`}>
                <div className="coin-face">{result === "heads" ? "H" : "T"}</div>
              </div>
            ) : (
              <div className="coin-static coin-idle">
                <div className="coin-face">?</div>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .coin-container {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
        }
        
        .coin {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.1s;
        }
        
        .coin-side {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: bold;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        }
        
        .coin-heads {
          background: linear-gradient(45deg, #ffd700, #ffb700);
          transform: rotateY(0deg);
        }
        
        .coin-tails {
          background: linear-gradient(45deg, #c0c0c0, #a0a0a0);
          transform: rotateY(180deg);
        }
        
        .coin-static {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: bold;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        }
        
        .coin-heads-static {
          background: linear-gradient(45deg, #ffd700, #ffb700);
        }
        
        .coin-tails-static {
          background: linear-gradient(45deg, #c0c0c0, #a0a0a0);
        }
        
        .coin-idle {
          background: linear-gradient(45deg, #e0e0e0, #c0c0c0);
          opacity: 0.7;
        }
        
        .coin-face {
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
