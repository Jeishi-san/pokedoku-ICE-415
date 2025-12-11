Here is a clean, professional `README.md` file for your Pokedoku project. It covers your tech stack, features, and the specific setup instructions we established during our debugging sessions.

-----

# 🧩 Pokedoku

A full-stack Pokémon-themed logic puzzle game inspired by Sudoku. Players fill a 3x3 grid by selecting Pokémon that match specific criteria for each row and column (e.g., "Fire Type" + "Kanto Region").

Built with **Next.js**, **Node.js/Express**, and **PostgreSQL**.

## 🚀 Tech Stack

  * **Frontend:** Next.js 14, TypeScript, Tailwind CSS
  * **Backend:** Node.js, Express.js
  * **Database:** PostgreSQL
  * **Data Source:** Hybrid approach (PokeAPI for images/search, Local DB for strict validation)

## ✨ Key Features

  * **Smart Puzzle Generation:** Uses a backend algorithm to ensure every generated grid is 100% solvable by checking database intersections.
  * **Database-First Validation:** Validates answers against a local PostgreSQL database to ensure accuracy for edge cases (e.g., *Omastar* is a Fossil, *Zygarde-50* is valid).
  * **Puzzle Constructor:** A "Workshop" mode allowing users to design, validate, and save their own custom puzzles.
  * **User Profiles:** Tracks win rates, streaks, unique Pokémon used, and match history.
  * **Dynamic Criteria:** Supports complex criteria like *Dual Types*, *Evolution Stages*, *Fossils*, *Paradox Forms*, and *Regions*.

## 🛠️ Prerequisites

  * [Node.js](https://nodejs.org/) (v18+)
  * [PostgreSQL](https://www.postgresql.org/) (Local or Cloud)
  * A package manager (npm or pnpm)
  * Pokemon API (PokeAPI)

## 📦 Installation & Setup

### 1\. Database Setup

1.  Create a PostgreSQL database (e.g., named `pokedoku`).
2.  The tables will be automatically managed, but ensure you have the credentials ready.

### 2\. Backend (Server)

The server handles puzzle generation, validation logic, and database connections.

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create a .env file
touch .env
```

**Configure `.env` in `/server`:**

```env
PORT=3001
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pokedoku
```

**Populate the Database:**
Run the scraper script to fetch data from PokeAPI and fill your local database with accurate data.

```bash
node utils/populate_db.js
```

**Start the Server:**

```bash
npm start
# Server runs on http://localhost:3001
```

### 3\. Frontend (Client)

The Next.js application for the user interface.

```bash
# Navigate to project root (or frontend folder)
cd pokedoku-frontend

# Install dependencies
npm install

# Create a .env.local file
touch .env.local
```

**Configure `.env.local`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Start the Client:**

```bash
npm run dev
# App runs on http://localhost:3000
```

## 📂 Project Structure

```
pokedoku/
├── server/                 # Express Backend
│   ├── controllers/        # Route logic (Pokemon, Grid)
│   ├── database/           # DB Config & Connection
│   ├── utils/
│   │   ├── puzzleGenerator.js # Smart grid generation logic
│   │   └── populate_db.js     # Data scraping script
│   └── pokemonRoutes.js    # API Endpoints
│
└── src/                    # Next.js Frontend
    ├── app/                # Pages & Routes
    ├── components/         # UI Components (Grid, Cell, Search)
    ├── hooks/              # Custom React Hooks (useAuth)
    └── utils/              # Frontend Logic (API calls, Validation)
```

## 🐛 Troubleshooting

  * **"Connection Refused" Error:** Ensure the Backend server is running on Port 3001 while you use the Frontend on Port 3000. You need two terminal windows open.
  * **Validation Errors (False Negatives):** If valid answers are marked wrong, re-run `node server/utils/populate_db.js` to ensure your local database has the latest Pokémon data.
  * **Grid Not Updating:** If the grid is the same on refresh, ensure your browser isn't caching the API response. The backend includes `no-cache` headers to prevent this.

## 🤝 Contributing

Feel free to submit issues or pull requests. Major changes should be discussed in an issue first.

## 📝 License

[MIT](https://choosealicense.com/licenses/mit/)
