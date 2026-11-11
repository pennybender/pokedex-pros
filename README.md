# Pokédex Pros

A Pokémon trivia game that installs on your phone as a web app. No build step, no accounts, no server — just static files.

- Three difficulties (Easy, Medium, Hard), chosen before you start
- Eight categories you can mix and match: Types, Evolution, Type Matchups, Pokédex Entries, Regions & Places, Gyms & Trainers, Moves & Items, Legends & Lore
- Levels of seven questions that get tougher, with points, speed and streak bonuses
- Top-ten high score table for each difficulty
- Two saved trivia teams of up to six Pokémon. Each teammate can suggest an answer once per level, and is most reliable on its own type and evolutionary family
- Works offline once installed

Every question is about the Pokémon world itself (species, types, evolutions, places, people, legends) — nothing about the real-world games, shows or cards.

## Put it on GitHub Pages

1. On github.com, create a new **public** repository, e.g. `pokedex-pros`.
2. Open the repository, choose **Add file → Upload files**, and drag in every file from this folder. Commit.
3. Go to **Settings → Pages**. Under *Build and deployment*, set **Source** to *Deploy from a branch*, pick the `main` branch and `/ (root)`, and save.
4. After a minute or so the game is live at `https://YOUR-USERNAME.github.io/pokedex-pros/`.

## Install on a phone

- **iPhone / iPad (Safari):** open the link, tap Share, then *Add to Home Screen*.
- **Android (Chrome):** open the link, tap the menu, then *Install app* (or *Add to Home screen*).

## Files

| File | What it is |
| --- | --- |
| `index.html`, `style.css` | The screens and how they look |
| `app.js` | Game logic: setup, scoring, levels, teams, high scores |
| `data.js` | All the trivia facts — add Pokémon or questions here |
| `questions.js` | Turns the facts into multiple-choice questions |
| `manifest.webmanifest`, `sw.js` | Make it installable and playable offline |
| `icon-*.png`, `maskable-512.png`, `apple-touch-icon.png`, `favicon-32.png` | App icon in each size (`icon.svg` is the source) |

When you change any file, bump `VERSION` at the top of `sw.js` so installed phones fetch the new copy.

Scores and teams are stored on the device only (browser local storage).

---

Unofficial fan-made quiz. Pokémon and all related names are trademarks of their respective owners; this project is not affiliated with or endorsed by them.
