// ✅ server/pokemonRoutes.js (With Validation Endpoint)
import express from "express";
import {
  getAllPokemonNames,
  getPokemonSpecies,
  getPokemonById,
  validatePokemonCriteria, // ✅ NEW IMPORT
  testPokemon,
  bulkTestPokemon,
  debugEvolution,
  graphqlHealthCheck,
  getCacheStats,
  clearCache,
} from "./controllers/pokemonController.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🛡️ INPUT VALIDATION MIDDLEWARE                                            */
/* -------------------------------------------------------------------------- */
const validateNameParam = (req, res, next) => {
  try {
    const name = req.params.name?.trim();
    if (!name || name.length === 0 || name.length > 50) {
      return res.status(400).json({
        status: "error",
        error: "Pokémon name must be between 1 and 50 characters"
      });
    }
    next();
  } catch (error) {
    res.status(400).json({
      status: "error",
      error: "Invalid Pokémon name parameter"
    });
  }
};

const validateIdParam = (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1 || id > 2000) {
      return res.status(400).json({
        status: "error",
        error: "Pokémon ID must be a number between 1 and 2000"
      });
    }
    next();
  } catch (error) {
    res.status(400).json({
      status: "error",
      error: "Invalid Pokémon ID parameter"
    });
  }
};

/* -------------------------------------------------------------------------- */
/* 🚀 Core Pokémon API Routes */
/* -------------------------------------------------------------------------- */

// ✅ Get all Pokémon names
router.get("/all", getAllPokemonNames);

// ✅ Get Pokémon species details
router.get("/species/:name", validateNameParam, getPokemonSpecies);

// ✅ Get Pokémon by ID
router.get("/id/:id", validateIdParam, getPokemonById);

// ✅ NEW: Server-side Pokédoku validation
router.post("/validate", validatePokemonCriteria);

/* -------------------------------------------------------------------------- */
/* 🧪 Debug / Testing Endpoints (Only active in development) */
/* -------------------------------------------------------------------------- */
if (process.env.NODE_ENV === "development") {
  router.get("/test-:name", validateNameParam, testPokemon);
  router.get("/test-bulk", bulkTestPokemon);
  router.get("/debug-evolution/:name", validateNameParam, debugEvolution);
  router.get("/debug-graphql-health", graphqlHealthCheck);
  router.get("/debug/cache-stats", getCacheStats);
  router.delete("/debug/cache/clear", clearCache);
}

export default router;