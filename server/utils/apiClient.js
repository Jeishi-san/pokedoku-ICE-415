// ✅ server/utils/apiClient.js (FIXED - Build/Bundling Errors Resolved)
import fetch from "node-fetch";

/* -------------------------------------------------------------------------- */
/* 🌐 GraphQL Endpoints (Primary → Backup Order) */
/* -------------------------------------------------------------------------- */
const ENDPOINTS = [
  "https://graphql-pokeapi.graphcdn.app/",      // ✅ Most reliable
  "https://beta.pokeapi.co/graphql/v1beta",     // ✅ Official but may be unstable
  "https://graphql-pokeapi.vercel.app/api/graphql",
];

/* -------------------------------------------------------------------------- */
/* ⏱️ Default Timeout for Fetch Requests */
/* -------------------------------------------------------------------------- */
const DEFAULT_TIMEOUT = 8000;

/* -------------------------------------------------------------------------- */
/* 🧠 Environment-Aware Logger */
/* -------------------------------------------------------------------------- */
const log = (...args) => {
  // ✅ FIX: Safe process.env access for different environments
  const isProduction = typeof process !== 'undefined' && 
                       process.env && 
                       process.env.NODE_ENV === 'production';
  if (!isProduction) {
    console.log('[API Client]', ...args);
  }
};

const warn = (...args) => {
  console.warn('[API Client]', ...args);
};

const error = (...args) => {
  console.error('[API Client]', ...args);
};

/* -------------------------------------------------------------------------- */
/* ⏱️ Fetch with Timeout Helper */
/* -------------------------------------------------------------------------- */
export async function fetchWithTimeout(resource, options = {}, timeout = DEFAULT_TIMEOUT) {
  // ✅ FIX: Better AbortController compatibility
  if (typeof AbortController === 'undefined') {
    warn('AbortController not available, proceeding without timeout');
    return fetch(resource, options);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    warn(`Request timeout after ${timeout}ms: ${resource}`);
  }, timeout);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    
    // ✅ FIX: Better error handling for different environments
    if (err.name === 'AbortError') {
      throw new Error(`Request timeout: ${resource}`);
    }
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* 🧩 Universal GraphQL Fetcher (Resilient + Load-Balanced) */
/* -------------------------------------------------------------------------- */
export async function graphqlFetch(query, variables = {}) {
  // ✅ FIX: Validate input parameters
  if (typeof query !== 'string' || query.trim().length === 0) {
    error('Invalid GraphQL query provided');
    return {};
  }

  // Randomize endpoints to distribute load
  const endpoints = [...ENDPOINTS].sort(() => Math.random() - 0.5);
  
  const errors = [];

  for (const endpoint of endpoints) {
    try {
      log(`Trying endpoint: ${endpoint}`);
      
      const res = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "User-Agent": "PokeDoku-Server/1.0" // ✅ ADD: Identify our requests
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!res.ok) {
        const errorMsg = `HTTP ${res.status} from ${endpoint}`;
        warn(errorMsg);
        errors.push(errorMsg);
        continue;
      }

      let json;
      try {
        json = await res.json();
      } catch (parseError) {
        const errorMsg = `Invalid JSON response from ${endpoint}: ${parseError.message}`;
        warn(errorMsg);
        errors.push(errorMsg);
        continue;
      }

      // ✅ FIX: Better GraphQL error handling
      if (json?.errors?.length) {
        const graphqlErrors = json.errors.map(err => err.message).join(', ');
        const errorMsg = `GraphQL errors from ${endpoint}: ${graphqlErrors}`;
        warn(errorMsg);
        errors.push(errorMsg);
        continue;
      }

      if (json?.data) {
        log(`✅ Success from ${endpoint}`);
        return json.data;
      } else {
        const errorMsg = `No data in response from ${endpoint}`;
        warn(errorMsg);
        errors.push(errorMsg);
      }
    } catch (err) {
      // ✅ FIX: Comprehensive error categorization
      let errorMsg;
      if (err.name === 'AbortError') {
        errorMsg = `Timeout from ${endpoint}`;
      } else if (err.code === 'ENOTFOUND') {
        errorMsg = `Network error from ${endpoint}: ${err.message}`;
      } else {
        errorMsg = `Unexpected error from ${endpoint}: ${err.message}`;
      }
      
      warn(errorMsg);
      errors.push(errorMsg);
    }
  }

  // ✅ FIX: Return structured error information instead of empty object
  error(`All GraphQL endpoints failed. Errors: ${errors.join('; ')}`);
  
  return {
    _error: true,
    message: 'All GraphQL endpoints failed',
    errors: errors,
    timestamp: new Date().toISOString()
  };
}

/* -------------------------------------------------------------------------- */
/* 🔄 REST API Fallback Fetcher */
/* -------------------------------------------------------------------------- */
export async function restFetch(resource, options = {}) {
  try {
    const res = await fetchWithTimeout(resource, {
      headers: {
        "User-Agent": "PokeDoku-Server/1.0",
        ...options.headers
      },
      ...options
    });

    if (!res.ok) {
      throw new Error(`REST API error: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    error(`REST fetch failed for ${resource}:`, err.message);
    throw err; // Re-throw for calling code to handle
  }
}

/* -------------------------------------------------------------------------- */
/* 🧪 Health Check for GraphQL Endpoints */
/* -------------------------------------------------------------------------- */
export async function checkGraphQLHealth() {
  const testQuery = `
    query HealthCheck {
      pokemon(name: "pikachu") {
        id
        name
      }
    }
  `;

  const healthResults = {};
  
  for (const endpoint of ENDPOINTS) {
    try {
      const startTime = Date.now();
      const res = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: testQuery }),
      }, 5000); // Shorter timeout for health check
      
      const responseTime = Date.now() - startTime;
      
      if (res.ok) {
        const data = await res.json();
        healthResults[endpoint] = {
          status: 'healthy',
          responseTime: `${responseTime}ms`,
          data: !!data?.data
        };
      } else {
        healthResults[endpoint] = {
          status: 'unhealthy',
          error: `HTTP ${res.status}`,
          responseTime: `${responseTime}ms`
        };
      }
    } catch (err) {
      healthResults[endpoint] = {
        status: 'unhealthy',
        error: err.message
      };
    }
  }

  return healthResults;
}

// ✅ FIX: Export constants for testing and configuration
export const API_CONSTANTS = {
  ENDPOINTS,
  DEFAULT_TIMEOUT,
  VERSION: '1.0.0'
};

// ✅ FIX: Default export for compatibility
export default {
  graphqlFetch,
  fetchWithTimeout,
  restFetch,
  checkGraphQLHealth,
  constants: API_CONSTANTS
};