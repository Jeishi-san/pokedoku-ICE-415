// src/components/RulesPanel.jsx
import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import "./RulesPanel.css";

export default function RulesPanel({ onClose }) {
  return (
    <motion.div
      className="rules-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="rules-panel"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 🔘 Close Button */}
        <button onClick={onClose} className="close-button">
          ✕
        </button>

        {/* 🧭 Header */}
        <div className="rules-header">
          <Info className="info-icon" />
          <h2>📘 How to Play PokéDoku</h2>
        </div>

        {/* 📜 Main Content */}
        <div className="rules-content">
          <p>
            PokéDoku is a 3×3 logic puzzle where you fill each cell with a Pokémon
            that fits <strong>both the row and column criteria</strong>.
          </p>

          <ul>
            <li>Each Pokémon can only be used once per puzzle.</li>
            <li>
              Rows and columns represent <strong>specific categories</strong> — such as types,
              regions, or special classifications.
            </li>
            <li>
              Some Pokémon have unique tags like <strong>Legendary</strong>,{" "}
              <strong>Mythical</strong>, or <strong>Regional Forms</strong>.
            </li>
            <li>
              When a <strong>specific region</strong> is a category, choose a Pokémon that{" "}
              <strong>originated from that region</strong>.
            </li>
            <li>
              <strong>Mega</strong> and <strong>Gigantamax (GMAX)</strong> Pokémon are counted under
              the region where their <strong>normal form originated</strong>.
            </li>
            <li>
              We base all categories on the <strong>Main Series Pokémon Games</strong> for
              accuracy and consistency.
            </li>
            <li>Fill all 9 cells correctly to complete the puzzle!</li>
          </ul>

          <p className="rules-tip">
            💡 Tip: Think strategically — some Pokémon can fit multiple categories!
          </p>
        </div>

        {/* ✅ Footer Button */}
        <div className="rules-footer">
          <button onClick={onClose} className="primary-button">
            Got it!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
