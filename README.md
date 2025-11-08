# A-tower

A-tower is a parametric tower massing playground built with React, Vite, and Three.js that lets you stack and twist floor slabs in real time. Use it to explore how gradient-based rotation, scale, and color profiles transform the overall tower expression without leaving the browser.

## Features

- Responsive WebGL viewport powered by @react-three/fiber, Drei helpers, and high-quality physically based lighting.
- Gradient-aware slab generator that interpolates twist angles, plan scale, and material colors per floor with multiple easing curves.
- Dedicated control panel with sliders, numeric inputs, and color pickers for floors, story height, base radius, twist/scale ranges, and gradient palettes.
- Preset manager with localStorage persistence so you can stash multiple tower studies and reload them instantly.
- Procedural core and plaza plane to ground the visualization plus orbit controls and stats overlay for navigation feedback.
- Modular state management via Zustand and utility helpers so new parameters or animation ideas can be added quickly.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the printed localhost URL in your browser to interact with the generator. The scene hot-reloads as you tweak parameters or edit code.

## Controls

- **Floors / Floor Height / Base Radius** - Define the overall stack density and envelope.
- **Presets** - Save the current slider state, switch between studies, reset to defaults, or delete unused variations; presets persist in local storage.
- **Twist Gradient** - Set minimum/maximum rotation (in degrees) and pick an easing curve to control how the twisting ramps up the higher you go.
- **Scale Gradient** - Shape the taper or bulge of the tower by interpolating slab footprint scales with the same easing presets.
- **Gradient Colors** - Choose bottom and top colors; slabs interpolate between them using perceptual Lab color space for smooth fades.
