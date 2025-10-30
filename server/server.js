// ✅ server/server.js (Production-Ready with Enhanced Error Handling)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import pokemonRoutes from "./pokemonRoutes.js";

// 🧩 Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

/* -------------------------------------------------------------------------- */
/* 🧱 Middleware Setup                                                        */
/* -------------------------------------------------------------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(helmet());

// 🧠 Define allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
].filter(Boolean);

// ✅ CORS configuration
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`🚫 CORS blocked: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

// ✅ Preflight requests
app.options("*", cors());

/* -------------------------------------------------------------------------- */
/* 🧭 Routes                                                                  */
/* -------------------------------------------------------------------------- */
app.use("/api/pokemon", pokemonRoutes);

/* -------------------------------------------------------------------------- */
/* 📚 Root & Health Endpoints                                                 */
/* -------------------------------------------------------------------------- */
app.get("/", (req, res) => {
  try {
    res.json({
      message: "✅ PokéDoku API is running",
      health: `${req.protocol}://${req.get("host")}/health`,
      endpoints: {
        allPokemon: "/api/pokemon/all",
        species: "/api/pokemon/species/:name",
        byId: "/api/pokemon/id/:id",
      },
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Root endpoint error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/health", (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    res.json({
      status: "OK",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
    });
  } catch (error) {
    console.error("❌ Health check error:", error);
    res.status(500).json({ status: "ERROR", error: "Health check failed" });
  }
});

/* -------------------------------------------------------------------------- */
/* ⚠️ Error Handling                                                         */
/* -------------------------------------------------------------------------- */
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    method: req.method,
    path: req.originalUrl,
    available: [
      "GET /",
      "GET /health",
      "GET /api/pokemon/all",
      "GET /api/pokemon/species/:name",
      "GET /api/pokemon/id/:id",
    ],
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`💥 Server Error: ${err.message}`, err.stack);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS policy violation" });
  }

  const message = NODE_ENV === "development" ? err.message : "Something went wrong. Please try again later.";

  res.status(500).json({ 
    error: "Internal Server Error", 
    message,
    ...(NODE_ENV === "development" && { stack: err.stack })
  });
});

/* -------------------------------------------------------------------------- */
/* 🚀 Server Startup                                                         */
/* -------------------------------------------------------------------------- */
const server = app.listen(PORT, () => {
  console.log(`\n🎯 PokéDoku Backend Ready!`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${NODE_ENV.toUpperCase()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;