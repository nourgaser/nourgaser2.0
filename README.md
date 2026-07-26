# nourgaser.com

Source code for my personal website and portfolio, built with **Astro**, **Svelte**, and **TypeScript**.

The site showcases my projects, experience, and experiments through **ngxos** — a custom terminal-inspired interface that lets visitors explore the site using shell-like commands, themes, keyboard shortcuts, and interactive navigation.

## Features

* 🚀 Astro for fast static generation
* ⚡ Svelte islands for interactive components
* 🖥️ **ngxOS** — a custom terminal-like UI framework
* 📚 MDX-powered project and content collections
* 🎨 Theme switching and animations
* 📱 Responsive, modern design
* 🐳 Docker support for deployment

## Tech Stack

* Astro
* Svelte
* TypeScript
* Bun
* MDX
* Docker + Nginx

## Development

```bash
bun install
bun dev
```

Build for production:

```bash
bun run build
```

## Project Structure

```text
src/
├── components/
├── content/
├── lib/
│   └── ngxos/
├── pages/
└── styles/
```

The `ngxOS` module is an experimental UI framework that powers the interactive terminal experience, including command handling, navigation, themes, persistence, and shell-like behaviour.

## License

This repository is provided as a reference for learning and inspiration. Please do not copy the site's design or branding directly.
