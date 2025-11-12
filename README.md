# 🎮 Games Collection

A collection of browser-based games that run on GitHub Pages.

## 🌐 Play Now

Visit the live site: [Games Collection](https://teslasolar.github.io/games/)

## 📂 Repository Structure

```
games/
├── index.html          # Main landing page
├── styles.css          # Styles for landing page
├── games/              # Directory containing all games
│   └── tic-tac-toe/    # Tic-Tac-Toe game
│       ├── index.html
│       ├── style.css
│       └── script.js
└── README.md
```

## 🎯 Available Games

- **Tic-Tac-Toe**: Classic two-player game

## 🚀 Adding New Games

To add a new game to this collection:

1. Create a new directory under `games/` with your game name
2. Add your game files (HTML, CSS, JavaScript) to that directory
3. Update the main `index.html` to include a card for your new game
4. Test locally by opening `index.html` in your browser
5. Commit and push your changes

## 💻 Local Development

1. Clone this repository:
   ```bash
   git clone https://github.com/teslasolar/games.git
   cd games
   ```

2. Open `index.html` in your browser to view the games collection

3. Navigate to individual games by clicking on their cards

## 📝 Game Template

Each game should follow this basic structure:

```
games/your-game-name/
├── index.html    # Main game page
├── style.css     # Game styles
└── script.js     # Game logic
```

Make sure to include a "Back to Games" link in each game that points to `../../index.html`

## 🤝 Contributing

Feel free to add new games! Each game should be:
- Self-contained in its own directory
- Playable in a modern web browser
- Include clear instructions if needed

## 📄 License

This project is open source and available for anyone to use and modify.
