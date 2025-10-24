// src/components/GamePanels.jsx
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Info, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./GamePanels.css";

export default function GamePanels({
  showWin,
  showLose,
  showRules,
  onCloseWin,
  onCloseLose,
  onCloseRules,
  onRestart,
}) {
  return (
    <AnimatePresence>
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
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="celebration-card"
          >
            <button onClick={onCloseWin} className="close-button">
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
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="lose-card"
          >
            <button onClick={onCloseLose} className="close-button">
              <X size={20} />
            </button>

            <div className="lose-content">
              <Skull className="skull-icon" />
              <h2>💀 Game Over!</h2>
              <p>Looks like you ran out of moves, Trainer.</p>
              <p className="lose-tip">Don’t worry — you can try a fresh puzzle!</p>

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

      {/* 📜 Rules Panel */}
      {showRules && (
        <motion.div
          key="rules"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="rules-overlay"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="rules-panel"
          >
            <button onClick={onCloseRules} className="close-button">
              <X size={20} />
            </button>

            <div className="rules-header">
              <Info className="info-icon" />
              <h2>How to Play PokéDoku</h2>
            </div>

            <div className="rules-content">
              <p>
                PokéDoku is a logic puzzle where you fill a 3×3 grid with Pokémon that fit both
                the row and column criteria.
              </p>
              <ul>
                <li>Each Pokémon can only be used once.</li>
                <li>Rows and columns represent categories (types, regions, teams, etc.).</li>
                <li>Select a square, then choose a Pokémon that matches both criteria.</li>
              </ul>
              <p className="rules-tip">
                💡 Tip: Use your Pokédex knowledge to fill all squares without repeats!
              </p>
            </div>

            <div className="rules-footer">
              <Button onClick={onCloseRules} className="primary-button">
                Got it!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
