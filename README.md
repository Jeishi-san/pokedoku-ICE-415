# PokéDoku

A project/Learning Evidence for ICE-414

A full-stack Pokémon-themed logic puzzle game inspired by Sudoku, built with modern web technologies.

## 🎮 About the Game

PokéDoku challenges players to fill a 3×3 grid with Pokémon that match both row and column criteria. Each Pokémon can only be used once, and players must use their Pokémon knowledge to complete the puzzle successfully.

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Styling**: Tailwind CSS + Custom CSS
- **Data**: Pokémon API integration
- **State Management**: React Hooks

## 🏗️ Project Structure

```
pokedoku/
├── server/          # Express backend with Pokémon API routes
├── src/
│   ├── components/  # React components (grid, panels, search)
│   ├── utils/       # Game logic & Pokémon data utilities
│   ├── hooks/       # Custom React hooks
│   └── styles/      # CSS and styling files
```

## 🚀 Features

- Interactive 3×3 puzzle grid
- Real-time Pokémon search and selection
- Criteria matching validation
- Celebration animations on completion
- Responsive design
- Pokémon data caching for performance

## 🎯 How to Play

1. Each cell must contain a Pokémon that matches both its row and column criteria
2. Pokémon cannot be reused in the same puzzle
3. Complete all 9 cells to win
4. Criteria include types, regions, legendary status, and more

Built for Pokémon fans who love logic puzzles!  
