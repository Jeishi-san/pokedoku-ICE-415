// ✅ server/utils/evolutionUtils.js
// Enhanced evolution chain analyzer with GraphQL + REST compatibility and proper branch detection.

/**
 * 🔍 Analyze Pokémon evolution chain
 * Determines evolution stage (Base/Middle/Final), evolution method, and branch structure.
 */
export function analyzeEvolutionChain(chain, targetName) {
  const result = {
    stage: "Unknown",
    evolvedBy: "None",
    isBranched: false,
    error: null
  };

  if (!chain) {
    result.error = "No evolution chain provided";
    return result;
  }

  if (!targetName) {
    result.error = "No target Pokémon name provided";
    return result;
  }

  // Enhanced logging with safety checks
  const safeTargetName = targetName || 'unknown';
  console.log(`🔍 Analyzing evolution chain for: ${safeTargetName}`);
  console.log(`🔗 Chain structure:`, chain.species?.name || 'unknown');

  // Normalize Pokémon names to handle alternate forms
  const nameVariants = normalizeNameVariants(safeTargetName);
  let found = false;
  let branchDetectionDone = false;

  /**
   * 🧩 Recursive traversal of evolution chain
   */
  function traverse(node, parent = null, depth = 0) {
    if (!node || !node.species) return;

    const currentName = node.species.name?.toLowerCase?.() || "";
    const isTarget = nameVariants.some(
      (variant) =>
        variant === currentName ||
        currentName.includes(variant) ||
        variant.includes(currentName)
    );

    // Safe logging - limit depth to avoid console overflow
    if (depth < 5) { // Prevent infinite recursion logs
      const indent = "  ".repeat(depth);
      console.log(`${indent}- ${currentName}${isTarget ? " ← TARGET" : ""}`);
    }

    // ✅ Found the target Pokémon
    if (isTarget) {
      found = true;

      const isBase = !parent;
      const hasEvos = Array.isArray(node.evolves_to) && node.evolves_to.length > 0;
      const isFinal = !hasEvos;

      if (isBase) result.stage = "Base Stage";
      else if (isFinal) result.stage = "Final Stage";
      else result.stage = "Middle Stage";

      // 🔎 Determine evolution method from parent (if available)
      if (parent?.evolves_to?.length) {
        const evoData = parent.evolves_to.find((e) => {
          const evoName = e.species?.name?.toLowerCase?.() || "";
          return nameVariants.some(
            (variant) =>
              evoName === variant ||
              evoName.includes(variant) ||
              variant.includes(evoName)
          );
        });

        if (evoData?.evolution_details?.length) {
          const detail = evoData.evolution_details[0];
          result.evolvedBy = determineEvolutionMethod(detail);
        }
      }
    }

    // 🧬 Detect branching (only once per analysis)
    if (!branchDetectionDone && Array.isArray(node.evolves_to) && node.evolves_to.length > 1) {
      result.isBranched = true;
      branchDetectionDone = true; // Prevent multiple detections
    }

    // Continue traversing with depth limit for safety
    if (depth < 10) { // Prevent stack overflow on malformed chains
      for (const evo of node.evolves_to || []) {
        traverse(evo, node, depth + 1);
      }
    } else {
      console.warn(`⚠️ Depth limit reached at ${currentName}, stopping traversal`);
    }
  }

  try {
    traverse(chain);
  } catch (error) {
    console.error(`💥 Error during evolution chain traversal:`, error.message);
    result.error = `Traversal error: ${error.message}`;
    return result;
  }

  if (!found) {
    console.log(`⚠️ Target ${safeTargetName} not found in evolution chain. Variants tried:`, nameVariants);
    result.error = `Target Pokémon not found in evolution chain`;
  } else {
    console.log(`🎯 Final analysis for ${safeTargetName}:`, {
      stage: result.stage,
      evolvedBy: result.evolvedBy,
      branched: result.isBranched
    });
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* 🧩 Normalize Pokémon name variants */
/* -------------------------------------------------------------------------- */
function normalizeNameVariants(name) {
  if (!name || typeof name !== 'string') return [];
  
  const cleanName = name.toLowerCase().trim();
  const base = cleanName.split("-")[0];
  
  const variants = [
    cleanName,                    // "arcanine-hisui"
    base,                         // "arcanine"
    cleanName.replace(/-hisui$/g, ""), // "arcanine" (remove regional)
    cleanName.replace(/-/g, " "), // "arcanine hisui"
    cleanName.replace(/-(mega|gmax|alola|galar|hisui|paldea)/g, ""), // "arcanine"
  ];

  // Remove duplicates and empty strings
  return [...new Set(variants.filter(v => v && v.length > 0))];
}

/* -------------------------------------------------------------------------- */
/* 🧬 Determine the evolution method based on API details */
/* -------------------------------------------------------------------------- */
function determineEvolutionMethod(detail) {
  if (!detail) return "Unknown Method";

  // Safe property access
  const trigger = detail.trigger?.name;
  const item = detail.item?.name;
  const heldItem = detail.held_item?.name;
  const minLevel = detail.min_level;
  const location = detail.location?.name;
  const moveType = detail.known_move_type?.name;

  if (trigger === "trade") return "Trade";
  if (item) return `Use Item: ${item}`;
  if (heldItem) return `Held Item: ${heldItem}`;
  if (trigger === "level-up" && minLevel) return `Level ${minLevel}`;
  if (detail.min_happiness) return "Friendship";
  if (detail.min_beauty) return "Beauty";
  if (moveType) return `Knows Move Type: ${moveType}`;
  if (location) return `At Location: ${location}`;
  if (trigger === "use-item") return "Use Evolution Item";

  return "Level Up"; // Default for level-up without specified level
}

/* -------------------------------------------------------------------------- */
/* 🧮 Count all species in a chain - FIXED VERSION */
/* -------------------------------------------------------------------------- */
export function countChainSpecies(chain) {
  if (!chain) {
    console.warn('⚠️ countChainSpecies: No chain provided');
    return 0;
  }

  function traverse(node) {
    if (!node || !node.species) return 0;
    
    let count = 1; // Count current node
    
    if (Array.isArray(node.evolves_to)) {
      for (const evo of node.evolves_to) {
        count += traverse(evo);
      }
    }
    
    return count;
  }

  const count = traverse(chain);
  console.log(`📊 Chain species count: ${count} for chain starting with ${chain.species?.name || 'unknown'}`);
  return count;
}

/* -------------------------------------------------------------------------- */
/* 📏 Get maximum depth of an evolution chain */
/* -------------------------------------------------------------------------- */
export function getChainDepth(chain) {
  if (!chain) {
    console.warn('⚠️ getChainDepth: No chain provided');
    return 0;
  }

  let maxDepth = 0;
  
  function traverse(node, depth = 0) {
    if (!node) return;
    
    maxDepth = Math.max(maxDepth, depth);
    
    if (Array.isArray(node.evolves_to) && depth < 20) { // Safety limit
      for (const evo of node.evolves_to) {
        traverse(evo, depth + 1);
      }
    }
  }

  traverse(chain);
  console.log(`📏 Chain depth: ${maxDepth} for ${chain.species?.name || 'unknown'}`);
  return maxDepth;
}

/* -------------------------------------------------------------------------- */
/* 🧾 Simplify evolution chain for easier debugging - ENHANCED */
/* -------------------------------------------------------------------------- */
export function simplifyChainForDebug(chain) {
  if (!chain) {
    console.warn('⚠️ simplifyChainForDebug: No chain provided');
    return [{ error: "No chain data", species: "unknown", depth: 0 }];
  }

  const result = [];
  let nodeCount = 0;
  const MAX_NODES = 50; // Prevent infinite loops

  function traverse(node, depth = 0) {
    if (!node?.species || nodeCount >= MAX_NODES) return;
    nodeCount++;

    result.push({
      species: node.species.name || "unknown",
      depth,
      evolves_to_count: Array.isArray(node.evolves_to) ? node.evolves_to.length : 0,
      evolves_to: Array.isArray(node.evolves_to) 
        ? node.evolves_to.map((e) => e.species?.name || "unknown").filter(Boolean) 
        : [],
      evolution_details: node.evolution_details?.[0] ? {
        trigger: node.evolution_details[0].trigger?.name,
        min_level: node.evolution_details[0].min_level,
        item: node.evolution_details[0].item?.name
      } : null
    });

    if (Array.isArray(node.evolves_to) && depth < 10) { // Safety depth limit
      for (const evo of node.evolves_to) {
        traverse(evo, depth + 1);
      }
    }
  }

  traverse(chain);
  
  if (nodeCount >= MAX_NODES) {
    result.push({ warning: `Stopped at ${MAX_NODES} nodes to prevent overflow` });
  }

  console.log(`📋 Simplified chain: ${result.length} nodes`);
  return result;
}

/* -------------------------------------------------------------------------- */
/* 🧠 Normalize GraphQL evolutionChain response - ENHANCED */
/* -------------------------------------------------------------------------- */
export function normalizeGraphQLEvolutionResponse(evoData) {
  if (!evoData) {
    console.warn('⚠️ normalizeGraphQLEvolutionResponse: No data provided');
    return null;
  }

  try {
    // Handle stringified JSON (common in GraphQL)
    if (typeof evoData === "string") {
      console.log('📦 Processing stringified evolution data');
      const parsed = JSON.parse(evoData);
      return parsed?.chain || parsed;
    }

    // Already parsed and contains the `chain`
    if (evoData?.chain) {
      console.log('✅ Found chain in evolution data');
      return evoData.chain;
    }

    // Direct chain object
    if (evoData.species) {
      console.log('✅ Using direct chain object');
      return evoData;
    }

    console.warn('❓ Unknown evolution data format:', typeof evoData, Object.keys(evoData));
    return null;

  } catch (err) {
    console.error("💥 Failed to normalize GraphQL evolution chain:", err.message);
    console.error('Raw data that failed:', typeof evoData, evoData?.substring?.(0, 200) || evoData);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* 🆕 NEW: Validate evolution chain structure */
/* -------------------------------------------------------------------------- */
export function validateEvolutionChain(chain) {
  if (!chain) {
    return { isValid: false, error: "Chain is null or undefined" };
  }

  if (!chain.species) {
    return { isValid: false, error: "Chain missing species property" };
  }

  if (!chain.species.name) {
    return { isValid: false, error: "Chain species missing name" };
  }

  // Check for circular references (basic check)
  const visited = new Set();
  function checkCircular(node, path = []) {
    if (!node) return null;
    
    const nodeId = node.species?.name;
    if (visited.has(nodeId)) {
      return `Circular reference detected: ${path.join(' -> ')} -> ${nodeId}`;
    }
    
    visited.add(nodeId);
    path.push(nodeId);
    
    if (Array.isArray(node.evolves_to)) {
      for (const evo of node.evolves_to) {
        const circularError = checkCircular(evo, [...path]);
        if (circularError) return circularError;
      }
    }
    
    visited.delete(nodeId);
    return null;
  }

  const circularError = checkCircular(chain);
  if (circularError) {
    return { isValid: false, error: circularError };
  }

  return { isValid: true, speciesCount: countChainSpecies(chain), depth: getChainDepth(chain) };
}

/* -------------------------------------------------------------------------- */
/* 🆕 NEW: Safe evolution analysis with error recovery */
/* -------------------------------------------------------------------------- */
export function safeAnalyzeEvolutionChain(chain, targetName) {
  try {
    // Validate chain first
    const validation = validateEvolutionChain(chain);
    if (!validation.isValid) {
      console.error(`❌ Evolution chain validation failed:`, validation.error);
      return {
        stage: "Unknown",
        evolvedBy: "None", 
        isBranched: false,
        error: `Invalid chain: ${validation.error}`,
        validated: false
      };
    }

    // Perform analysis
    const result = analyzeEvolutionChain(chain, targetName);
    result.validated = true;
    result.chainStats = {
      speciesCount: validation.speciesCount,
      depth: validation.depth
    };

    return result;

  } catch (error) {
    console.error(`💥 Critical error in safeAnalyzeEvolutionChain:`, error);
    return {
      stage: "Unknown",
      evolvedBy: "None",
      isBranched: false,
      error: `Analysis crashed: ${error.message}`,
      validated: false,
      chainStats: { speciesCount: 0, depth: 0 }
    };
  }
}

// ✅ ADDED: Get evolution stage from Pokémon data
/* -------------------------------------------------------------------------- */
/* 🆕 NEW: Get evolution stage from Pokémon data */
/* -------------------------------------------------------------------------- */
export function getEvolutionStage(pokemonData) {
  if (!pokemonData) {
    console.warn('⚠️ getEvolutionStage: No Pokémon data provided');
    return "Unknown";
  }

  try {
    // Check if evolution data is directly available
    if (pokemonData.evolution) {
      return pokemonData.evolution;
    }

    // Check evolution chain summary
    if (pokemonData.evolution_chain_summary) {
      return pokemonData.evolution_chain_summary;
    }

    // Try to determine from evolution chain analysis
    if (pokemonData.evolution_chain?.url) {
      // This would require fetching the chain, but for simplicity:
      const name = pokemonData.name || 'unknown';
      
      // Simple heuristic based on common patterns
      if (name.includes('-mega') || name.includes('-gmax')) {
        return "Final Stage"; // Mega/Gigantamax forms are typically final
      }
      
      // Basic stage detection from name patterns (fallback)
      const baseName = name.split('-')[0];
      const finalStages = [
        'charizard', 'blastoise', 'venusaur', 'butterfree', 'beedrill',
        'pidgeot', 'fearow', 'arbok', 'raichu', 'sandslash', 'nidoqueen',
        'nidoking', 'clefable', 'ninetales', 'wigglytuff', 'golbat', 'vileplume'
        // Add more as needed
      ];
      
      if (finalStages.includes(baseName)) {
        return "Final Stage";
      }
      
      return "Base Stage"; // Default fallback
    }

    console.log(`🔍 No evolution data found for ${pokemonData.name}, using fallback`);
    return "Unknown";

  } catch (error) {
    console.error(`💥 Error in getEvolutionStage for ${pokemonData?.name}:`, error);
    return "Unknown";
  }
}