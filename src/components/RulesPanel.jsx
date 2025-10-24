import React from "react";
import { motion } from "framer-motion";
import "./RulesPanel.css";

export default function RulesPanel({ onClose }) {
  return (
    <motion.div
      className="rules-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="rules-panel"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
      >
        <button onClick={onClose} className="close-button">
          ✕
        </button>
        
        <h2>📘 How to Play Pokédoku</h2>
        <ul>
          <li>Fill each cell with a Pokémon that matches both row and column criteria.</li>
          <li>You can't use the same Pokémon twice.</li>
          <li>Some Pokémon have special categories like Legendary, Mythical, or Regional Forms.</li>
          <li>Complete all 9 cells correctly to finish the puzzle!</li>
        </ul>
        <button
          onClick={onClose}
          className="primary-button"
        >
          Got it!
        </button>
      </motion.div>
    </motion.div>
  );
}