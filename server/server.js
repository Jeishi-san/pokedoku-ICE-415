import express from "express";
import cors from "cors";
import pokemonRoutes from "./pokemonRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/pokemon", pokemonRoutes);

const PORT = 3001;
app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));
