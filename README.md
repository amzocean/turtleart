# 🎨 Turtle Art Builder

A visual, no-code interface for children ages 8-13 to create digital art by clicking commands and coordinate points. Kids design pictures on a coordinate grid and see their visual program translated to Python Turtle code in real-time.

## Features

✨ **Visual Command Builder** - Click buttons to create sequences of drawing commands without typing  
🎯 **Coordinate Grid** - Click labeled points to move the turtle  
🖌️ **Color & Pen Control** - Change colors and pen sizes with one click  
🐍 **Live Python Generation** - See equivalent Python Turtle code as you build  
↶ **Undo & Clear** - Easy mistake recovery  
💾 **Copy Code** - Export generated Python to clipboard  
📱 **Responsive Design** - Works on laptops and tablets  
⚡ **No Account Required** - Instant access, no sign-up

## How It Works

1. **Click Commands**: Select "Pen Up" or "Pen Down" from the left panel
2. **Click Points**: Click anywhere on the coordinate grid to add a "Go To" command
3. **Change Style**: Choose colors and pen sizes
4. **Watch the Preview**: See your drawing appear in real-time on the canvas
5. **Read the Code**: Python equivalent appears automatically on the right
6. **Copy & Share**: Export the Python code to use in PyWebLib or other Python environments

## Usage

### Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Coordinate System

- **Origin (0, 0)** is in the center (marked with a red square)
- **X-axis** runs left ↔ right (positive right, negative left)
- **Y-axis** runs down ↔ up (positive up, negative down)
- **Grid spacing**: Points are labeled from -120 to +120 in both directions

## Example: Draw a Triangle

1. Click "Pen Up"
2. Click point (-50, -50)
3. Click "Pen Down"
4. Click (0, 75)
5. Click (50, -50)
6. Click (-50, -50) to close it
7. Click "Run" to replay

Your generated Python:
```python
import turtle

t = turtle.Turtle()
t.speed(0)

t.penup()
t.goto(-50, -50)
t.pendown()
t.goto(0, 75)
t.goto(50, -50)
t.goto(-50, -50)

turtle.done()
```

## Educational Goals

- Understand programs as sequences of instructions
- Learn coordinate systems and how they identify points
- See how visual commands map directly to code
- Build confidence with visual programming before text-based code
- Create artwork as motivation and proof of concept

## Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

[Vercel Dashboard](https://vercel.com/dashboard)

### Deploy to Netlify

```bash
npm run build
# Drag & drop the 'dist' folder to Netlify.com
```

Or use the Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Deploy to GitHub Pages

```bash
# Add to package.json: "homepage": "https://yourusername.github.io/turtle-art-builder"
npm run build
# Push the dist folder to gh-pages branch
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- All modern mobile browsers

## Project Structure

```
turtle-art-builder/
├── index.html          # Main HTML structure
├── style.css           # Styling and layout
├── main.js             # Application logic and state
├── package.json        # Dependencies
├── vercel.json         # Vercel deployment config
└── README.md           # This file
```

## Technical Details

- **Framework**: Vanilla JavaScript (no frameworks needed!)
- **Rendering**: HTML5 Canvas API
- **State Management**: Class-based command queue
- **Build Tool**: Vite (optional, for development)
- **Deployment**: Vercel, Netlify, or GitHub Pages

## Future Enhancements

- 🔁 Loop/repeat command builder
- 📐 Mirror/symmetry helpers
- 🎯 Pre-made design templates
- ⌨️ Keyboard shortcuts for commands
- 🎬 Animated turtle drawing during replay
- 📥 Load/save projects to localStorage
- 🖼️ Export artwork as PNG
- 📋 Print coordinate worksheet

## License

MIT License - feel free to use and modify!

## Created with 💙

Built for children learning that programming is creative and visual.
