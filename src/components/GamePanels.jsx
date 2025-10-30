// src/components/GamePanels.jsx
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./GamePanels.css";
import React from "react"; // Added React import for useEffect

export default function GamePanels({
  showWin,
  showLose,
  onCloseWin,
  onCloseLose,
  onRestart,
  movesLeft, // 🧮 Added prop for Moves Counter
}) {
  // Prevent background scrolling when panels are open
  React.useEffect(() => {
    if (showWin || showLose) {
      document.body.classList.add('panel-open');
    } else {
      document.body.classList.remove('panel-open');
    }

    return () => {
      document.body.classList.remove('panel-open');
    };
  }, [showWin, showLose]);

  return (
    <AnimatePresence>
      {/* 🔢 Floating Moves Counter */}
      {typeof movesLeft === "number" && (
        <motion.div
          key="movesCounter"
          className="moves-counter"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          Moves Left: <span>{movesLeft}</span>
        </motion.div>
      )}

      {/* 🎉 Win Celebration Panel */}
      {showWin && (
        <motion.div
          key="win"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="celebration-overlay"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="celebration-card"
          >
            <button onClick={onCloseWin} className="close-button" aria-label="Close">
              <X size={20} />
            </button>

            <div className="celebration-content">
              <Sparkles className="sparkle-icon" />
              <h2>🎉 PokéDoku Complete!</h2>
              <p>You filled the entire grid correctly. Great job, Trainer!</p>

              <div className="button-group">
                <Button onClick={onRestart} className="primary-button">
                  Play Again
                </Button>
                <Button onClick={onCloseWin} className="secondary-button">
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 💀 Lose / Game Over Panel */}
      {showLose && (
        <motion.div
          key="lose"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lose-overlay"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="lose-card"
          >
            <button onClick={onCloseLose} className="close-button" aria-label="Close">
              <X size={20} />
            </button>

            <div className="lose-content">
              <Skull className="skull-icon" />
              <h2>💀 Game Over!</h2>
              <p>Looks like you ran out of moves, Trainer.</p>
              <p className="lose-tip">Don't worry — you can try a fresh puzzle!</p>

              <div className="button-group">
                <Button onClick={onRestart} className="primary-button">
                  Try Again
                </Button>
                <Button onClick={onCloseLose} className="secondary-button">
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}