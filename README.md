# Interior Design Planner

A modern web-based Interior Design Planner built with React that allows users to upload floor plans, place interior assets, create editable zones, and manage multiple design projects. The application provides a Canva-inspired project dashboard where each design is automatically saved and can be reopened later.

---

# Features

## Project Management

- Canva-style landing page
- Create unlimited design projects
- Search projects
- Grid and list view
- Rename projects
- Delete projects
- Automatic project persistence using Local Storage

---

## Blueprint Management

- Upload blueprint or floor plan images
- Blueprint displayed with adjustable transparency
- Grid overlay support
- Blueprint automatically saved with the project
- Reloads exactly as previously saved

---

## Interior Asset Placement

Place and manage various interior objects including:

- TV
- Speaker
- Camera
- Light
- AC Unit
- Door
- Chair
- Refrigerator
- Bed
- Bathtub

Features:

- Drag and drop placement
- Rotation support
- Delete objects
- Live object count
- Placement summary

---

## Zone Drawing Tools

Three different zone creation tools are available:

### Rectangle Zone

Create rectangular areas by dragging on the canvas.

### Circle / Ellipse Zone

Create circular or elliptical areas.

### Free-form Polygon Zone

Create irregular areas by selecting multiple points.

Additional capabilities:

- Move zones
- Resize zones
- Edit polygon vertices
- Color-coded zones
- Zone list panel
- Automatic project persistence

---

## Canvas Tools

- Select Tool
- Rectangle Tool
- Circle Tool
- Polygon Tool
- Pan Tool
- Zoom support
- Grid toggle
- Clear canvas

---

## Project Persistence

Every project stores independently:

- Blueprint image
- Interior objects
- Zone drawings
- Object positions
- Rotations
- Canvas state

All data is automatically saved in browser Local Storage.

---

# Technology Stack

## Frontend

- React
- JavaScript (ES6+)
- Vite

## Routing

- React Router DOM

## State Management

- React Context API
- React Hooks

## Styling

- CSS3
- Flexbox
- CSS Grid

## Storage

- Browser Local Storage

## Drawing

- HTML5 Canvas
- SVG

---

# Application Structure

```
src/
│
├── components/
├── context/
├── hooks/
├── pages/
├── utils/
├── assets/
└── App.jsx
```

---

# Project Workflow

1. Open the landing page.
2. Create a new project.
3. Upload a blueprint.
4. Place interior objects.
5. Draw required zones.
6. Save automatically.
7. Reopen the project anytime.

---

# Local Storage Keys

The application stores data using the following keys:

```
idt_projects
idt_board_{projectId}
idt_zones_{projectId}
```

---

# Installation

Clone the repository

```bash
git clone <repository-url>
```

Navigate to the project

```bash
cd interior-design-app
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm run dev
```

Build for production

```bash
npm run build
```

Preview production build

```bash
npm run preview
```

---

# Browser Support

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Brave

Latest versions are recommended.

---

# Future Enhancements

- PDF export with zone rendering
- Cloud database integration
- User authentication
- Real-time collaboration
- Undo / Redo functionality
- Layer management
- Measurement tools
- Object library expansion
- Project sharing
- Template gallery

---

# Highlights

- Canva-inspired project dashboard
- Interactive floor plan editor
- Multi-project support
- Automatic project saving
- Rectangle, Circle and Polygon zone tools
- Drag-and-drop interior assets
- Responsive user interface
- Local Storage persistence
- Modern React architecture

---

# Author

**Created by:** Ravinder Nath

- Full Stack Developer
- React.js Developer
- Interior Design Planner Project

---

# License

This project is intended for educational and portfolio purposes.

© 2026 Ravinder Nath. All rights reserved.