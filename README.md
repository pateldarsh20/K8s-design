# ☸️ K8s Canvas

**A beautiful, interactive visual designer for Kubernetes cluster architecture**

[![React](https://img.shields.io/badge/React-18.x-61dafb?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

![K8s Canvas Demo](https://via.placeholder.com/800x400?text=K8s+Canvas+Demo+Screenshot)

## ✨ Features

- 🎨 **Drag & Drop** - Drag Kubernetes components from sidebar to canvas
- 🔗 **Smart Connections** - Connect components with animated dashed lines
- 🖱️ **Pan & Zoom** - Drag background to pan, scroll wheel to zoom
- 🎯 **Connection Points** - 4 connection dots on each component (top, right, bottom, left)
- ✏️ **Rename Components** - Double-click any component name to customize it
- 🎨 **Color Fill** - Right-click shapes to add aesthetic glass/transparent colors
- 🔍 **Search Components** - Quick search to find any Kubernetes component
- 💾 **Save/Load** - Auto-save to localStorage, load on refresh
- 🧩 **Shapes Library** - Add rectangles and circles with border-only selection
- 📝 **Custom Text** - Add editable text boxes anywhere on canvas
- 🖼️ **Official K8s Icons** - Uses real Kubernetes community icons

## 🚀 Live Demo

[View Live Demo](https://k8s-canvas.vercel.app) *(update with your Vercel URL after deployment)*

## 📸 Screenshots

| Canvas View | Component Sidebar |
|-------------|-------------------|
| ![Canvas](https://via.placeholder.com/400x250?text=Canvas+with+Components) | ![Sidebar](https://via.placeholder.com/200x250?text=Component+Menu) |

| Connection Lines | Color Fill |
|-----------------|------------|
| ![Connections](https://via.placeholder.com/400x250?text=Animated+Connections) | ![Colors](https://via.placeholder.com/400x250?text=Color+Fills) |

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool |
| **TailwindCSS** | Styling |
| **Zustand** | State Management |
| **Framer Motion** | Animations |
| **Lucide React** | Icons |
| **React Flow** (custom) | Canvas & Connections |

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/pateldarsh20/K8s-design.git

# Navigate to project
cd K8s-design

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
