"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CoinAnimation } from "@/components/coin-animation"
import { Confetti } from "@/components/confetti"
import { useToast } from "@/hooks/use-toast"
import { Slider } from "@/components/ui/slider"
import { DollarSign } from "lucide-react"

type CoinSide = "heads" | "tails"

export function CoinFlipGame() {
  const [userChoice, setUserChoice] = useState<CoinSide | null>(null)
  const [result, setResult] = useState<CoinSide | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)
  const [score, setScore] = useState({ wins: 0, losses: 0 })
  const [showConfetti, setShowConfetti] = useState(false)
  const [streak, setStreak] = useState(0)
  const [balance, setBalance] = useState(10.0) // Starting balance of $10
  const [betAmount, setBetAmount] = useState(0.25) // Default bet of 25 cents
  const [currentWinnings, setCurrentWinnings] = useState(0)
  const [canCashOut, setCanCashOut] = useState(false)
  const { toast } = useToast()

  // Sound effects with error handling
  const playSound = (soundFile: string) => {
    if (typeof Audio !== "undefined") {
      try {
        const audio = new Audio(soundFile)
        audio.play().catch(() => {
          // Silently fail if audio can't be played
        })
      } catch (error) {
        // Silently fail if audio creation fails
      }
    }
  }

  useEffect(() => {
    // Load data from localStorage if available
    const savedData = localStorage.getItem("coinFlipGameData")
    if (savedData) {
      const data = JSON.parse(savedData)
      setScore(data.score)
      setStreak(data.streak)
      setBalance(data.balance)
    }
  }, [])

  useEffect(() => {
    // Save data to localStorage
    localStorage.setItem(
      "coinFlipGameData",
      JSON.stringify({
        score,
        streak,
        balance,
      }),
    )
  }, [score, streak, balance])

  // Calculate multiplier based on streak
  const getMultiplier = (streakCount: number) => {
    if (streakCount === 1) return 2 // First win: 2x
    if (streakCount === 2) return 3 // Second win: 3x
    if (streakCount === 3) return 4 // Third win: 4x
    if (streakCount >= 4) return 20 // Fourth+ win: 20x
    return 1
  }

  // Calculate potential winnings
  const getPotentialWinnings = () => {
    const nextMultiplier = getMultiplier(streak + 1)
    return betAmount * nextMultiplier
  }

  const flipCoin = () => {
    if (!userChoice || isFlipping) return

    // Check if user has enough balance
    if (balance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough money to place this bet.",
        variant: "destructive",
      })
      return
    }

    // Deduct bet amount from balance if this is a new bet sequence
    if (streak === 0) {
      setBalance((prev) => prev - betAmount)
    }

    setIsFlipping(true)
    playSound("/flip-sound.mp3")

    // Random result (50% chance)
    setTimeout(() => {
      const randomResult: CoinSide = Math.random() < 0.5 ? "heads" : "tails"
      setResult(randomResult)

      const isWin = userChoice === randomResult

      if (isWin) {
        setScore((prev) => ({ ...prev, wins: prev.wins + 1 }))
        const newStreak = streak + 1
        setStreak(newStreak)
        setShowConfetti(true)
        playSound("/win-sound.mp3")

        const newMultiplier = getMultiplier(newStreak)
        const winAmount = betAmount * newMultiplier
        setCurrentWinnings(winAmount)
        setCanCashOut(true)

        // Auto cash out and reset after 4th flip
        if (newStreak >= 4) {
          setTimeout(() => {
            playSound("/cash-sound.mp3")
            setBalance((prev) => prev + winAmount)

            toast({
              title: "Maximum Multiplier Reached!",
              description: `Congratulations! You won $${winAmount.toFixed(2)} with 20x multiplier! Game automatically reset.`,
              variant: "default",
            })

            // Reset everything
            setCurrentWinnings(0)
            setCanCashOut(false)
            setStreak(0)
          }, 2500) // Give time for the result to show
        } else {
          toast({
            title: `Win! (${newStreak} in a row)`,
            description: `You won $${winAmount.toFixed(2)}! Current multiplier: ${newMultiplier}x`,
            variant: "default",
          })
        }
      } else {
        setScore((prev) => ({ ...prev, losses: prev.losses + 1 }))
        setStreak(0)
        setCurrentWinnings(0)
        setCanCashOut(false)
        playSound("/lose-sound.mp3")

        toast({
          title: "You Lost!",
          description: "Better luck next time!",
          variant: "destructive",
        })
      }

      // Reset for next flip
      setTimeout(() => {
        setIsFlipping(false)
        setUserChoice(null)
        setResult(null)
        setShowConfetti(false)
      }, 2000)
    }, 2000) // Flip animation time
  }

  const selectChoice = (choice: CoinSide) => {
    if (isFlipping) return
    setUserChoice(choice)
  }

  const cashOut = () => {
    if (!canCashOut) return

    playSound("/cash-sound.mp3")
    setBalance((prev) => prev + currentWinnings)

    toast({
      title: "Cashed Out!",
      description: `$${currentWinnings.toFixed(2)} has been added to your balance.`,
      variant: "default",
    })

    setCurrentWinnings(0)
    setCanCashOut(false)
    setStreak(0)
  }

  const resetGame = () => {
    setScore({ wins: 0, losses: 0 })
    setStreak(0)
    setBalance(10.0)
    setCurrentWinnings(0)
    setCanCashOut(false)
    setBetAmount(0.25)

    toast({
      title: "Game Reset",
      description: "Your game has been reset with $10.00 balance.",
      variant: "default",
    })
  }

  const handleBetChange = (value: number[]) => {
    // Only allow changing bet amount when not in the middle of a streak
    if (streak === 0) {
      setBetAmount(value[0])
    }
  }

  const winPercentage = score.wins + score.losses > 0 ? Math.round((score.wins / (score.wins + score.losses)) * 100) : 0
  const currentMultiplier = getMultiplier(streak)
  const nextMultiplier = getMultiplier(streak === 0 ? 1 : streak + 1)

  return (
    <Card className="shadow-lg border-amber-200 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="text-center">Coin Flip Multiplier</CardTitle>
        <CardDescription className="text-center">Win up to 20x your bet with consecutive wins!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showConfetti && <Confetti />}

        <div className="flex justify-between items-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-600 mr-1" />
            <span className="text-lg font-bold">{balance.toFixed(2)}</span>
          </div>
          {canCashOut && (
            <div className="flex items-center">
              <span className="text-sm mr-2">Winnings: ${currentWinnings.toFixed(2)}</span>
              <Button onClick={cashOut} className="bg-green-600 hover:bg-green-700" size="sm">
                Cash Out
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Bet Amount: ${betAmount.toFixed(2)}</span>
              <span className="text-sm">
                {streak > 0 ? (
                  <Badge variant="outline" className="bg-amber-200 dark:bg-amber-800">
                    Current Streak: {streak} (Multiplier: {currentMultiplier}x)
                  </Badge>
                ) : (
                  <span>Next win: ${(betAmount * nextMultiplier).toFixed(2)}</span>
                )}
              </span>
            </div>
            <Slider
              disabled={streak > 0 || isFlipping}
              value={[betAmount]}
              min={0.25}
              max={Math.min(1, balance)}
              step={0.05}
              onValueChange={handleBetChange}
              className={streak > 0 ? "opacity-50" : ""}
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-xs">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div
                className={`transition-all duration-300 ${streak >= 1 ? "text-amber-600 dark:text-amber-400 font-bold bg-amber-200 dark:bg-amber-800 px-2 py-1 rounded shadow-lg" : ""}`}
              >
                1 Win: 2x
              </div>
              <div
                className={`transition-all duration-300 ${streak >= 2 ? "text-amber-600 dark:text-amber-400 font-bold bg-amber-200 dark:bg-amber-800 px-2 py-1 rounded shadow-lg" : ""}`}
              >
                2 Wins: 3x
              </div>
              <div
                className={`transition-all duration-300 ${streak >= 3 ? "text-amber-600 dark:text-amber-400 font-bold bg-amber-200 dark:bg-amber-800 px-2 py-1 rounded shadow-lg" : ""}`}
              >
                3 Wins: 4x
              </div>
              <div
                className={`transition-all duration-300 ${streak >= 4 ? "text-amber-600 dark:text-amber-400 font-bold bg-amber-200 dark:bg-amber-800 px-2 py-1 rounded shadow-lg" : ""}`}
              >
                4 Wins: 20x
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <CoinAnimation isFlipping={isFlipping} result={result} />
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={() => selectChoice("heads")}
            variant={userChoice === "heads" ? "default" : "outline"}
            className={`h-20 w-24 ${userChoice === "heads" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
            disabled={isFlipping}
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">🪙</span>
              <span>Heads</span>
            </div>
          </Button>

          <Button
            onClick={() => selectChoice("tails")}
            variant={userChoice === "tails" ? "default" : "outline"}
            className={`h-20 w-24 ${userChoice === "tails" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
            disabled={isFlipping}
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">💰</span>
              <span>Tails</span>
            </div>
          </Button>
        </div>

        {userChoice && !isFlipping && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={flipCoin}
              className="bg-amber-500 hover:bg-amber-600"
              size="lg"
              disabled={balance < betAmount && streak === 0}
            >
              {streak === 0 ? `Bet $${betAmount.toFixed(2)}` : `Continue (${nextMultiplier}x)`}
            </Button>
          </div>
        )}

        {canCashOut && !isFlipping && streak < 4 && (
          <div className="flex justify-center mt-2">
            <Button
              onClick={cashOut}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              Cash Out ${currentWinnings.toFixed(2)}
            </Button>
          </div>
        )}

        {result && (
          <div className="text-center mt-4 animate-fade-in">
            <p className="text-lg font-medium">
              Result: <span className="font-bold">{result.toUpperCase()}</span>
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mt-6 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
          <div>
            <p className="text-sm font-medium">
              Wins: <span className="text-green-600 dark:text-green-400">{score.wins}</span>
            </p>
            <p className="text-sm font-medium">
              Losses: <span className="text-red-600 dark:text-red-400">{score.losses}</span>
            </p>
          </div>
          <div>
            <Badge variant="outline" className="bg-amber-200 dark:bg-amber-800 font-medium">
              Win Rate: {winPercentage}%
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" size="sm" onClick={resetGame}>
          Reset Game
        </Button>
      </CardFooter>
    </Card>
  )
}
