

# Baonote

**A creative workspace and visual board for developers, students, and everyone who thinks better on a canvas.**

Plan projects, map out ideas, collect snippets, and keep everything in one place, on an infinite board that feels fast.


<!-- Add a screenshot or demo GIF here -->
<!-- ![Baonote screenshot](./docs/screenshot.png) -->

</div>

---

## Why Baonote?

Most note apps are linear: pages, bullets, folders. But real projects aren't linear. You have a half-written API idea, a schema screenshot, three links you'll need later, a todo list, and a code snippet you don't want to lose. They belong next to each other, not buried in different tabs.

Baonote gives you a visual board where all of that lives together. It's built with developers and students in mind (project planning, study boards, system design notes, hackathon brainstorms), but it works just as well for writers, designers, and anyone who likes to see the whole picture.

## Features

- **Infinite canvas** with smooth pan and zoom
- **Card types** for different kinds of thoughts: notes, todos, links, images, and code
- **Nested boards**, so a card can open into a whole sub-board
- **Dark and light themes**
- **Keyboard-first tools** with shortcuts for every action
- **Clean, floating UI** that stays out of the way of your content

> Baonote is in early development. Features marked in the [roadmap](#roadmap) are planned, not finished.

## Who is it for?

- **Developers** planning a side project, mapping architecture, or collecting snippets and references
- **Students** organizing coursework, study plans, and project ideas
- **Teams and hobbyists** brainstorming, moodboarding, and sketching ideas visually
- **Anyone** who finds blank documents boring

## Tech Stack

| Area | Tools |
|---|---|
| Frontend | React, JavaScript (JSX), Vite, Tailwind CSS |
| State | Zustand |
| Backend (planned) | Node.js, Express or Fastify |
| Database (planned) | PostgreSQL |
| Auth (planned) | JWT with httpOnly cookies |
| Storage (planned) | Cloudflare R2, S3, or Cloudinary |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm (comes with Node)

### Installation

```bash
# Clone the repository
git clone https://github.com/Mecha-rahul/Baonote.git
cd baonote

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open the URL shown in your terminal (usually `http://localhost:5173`).

### Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Creates a production build |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint |

## Keyboard Shortcuts

| Key | Tool |
|---|---|
| `V` | Select |
| `N` | Note |
| `T` | Todo |
| `L` | Link |
| `I` | Image |
| `C` | Code |

More shortcuts will be added as the canvas grows.

## Project Structure

```
baonote/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components
│   ├── layout/        # App shell: sidebar, top bar, toolbar
│   ├── store/         # Zustand stores
│   ├── lib/           # Helpers and utilities
│   └── main.jsx       # App entry point
├── index.html
└── package.json
```



## Roadmap

**Frontend**
- [x] App shell: sidebar, top bar, bottom toolbar, zoom control
- [x] Canvas with pan and zoom
- [x] Drag, resize, and select cards
- [x] Note, todo, link, image, and code cards
- [ ] Nested boards and breadcrumbs
- [x] Undo and redo
- [ ] Command palette
- [ ] Dark and light theme polish

**Backend**
- [ ] User accounts and authentication
- [ ] Save and load boards from a database
- [ ] Image uploads
- [ ] Link previews

**Later**


## Contributing

Contributions, ideas, and bug reports are welcome. Baonote is a young project, so things will change quickly.

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a pull request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Author

Built by **<rahul>**, a student developer building the tool i wished existed.


---

If you find Baonote useful, consider giving it a star. It really helps.

