# 3D Particle Song Generator

An immersive audiovisual experience that combines particle physics, 3D world exploration, and music generation. Create melodies through particle interactions in a beautiful cosmic environment.

## Features

### Particle System (6000+ particles)
- **Attract Mode**: Particles follow your cursor
- **Repel Mode**: Push particles away
- **Orbit Mode**: Particles spiral around the mouse
- **Wave Mode**: Sinusoidal wave motion
- **Spiral Mode**: Vortex-like particle behavior

### Sound Generation
- **Synth Mode**: Sawtooth synthesizer with pentatonic scales
- **Ambient Mode**: Layered sine waves for atmospheric sounds
- **Drums Mode**: Kick, snare, and hi-hat triggered by particle positions
- **Melody Mode**: Random instrument selection for varied melodies

### World Styles
- **Cosmic**: Deep space with cyan/blue particles
- **Ocean**: Underwater ambiance with blue-green tones
- **Fire**: Fiery atmosphere with red/orange particles
- **Forest**: Natural green environment

### Additional Features
- Load your own audio files for audio-reactive visualizations
- Real-time frequency visualizer
- Adjustable particle size, volume, and tempo
- Camera controls with arrow keys
- FPS counter and note statistics

## Controls

| Input | Action |
|-------|--------|
| Mouse Move | Attract/interact with particles |
| Click | Trigger sound burst + explosion |
| 1-5 | Change particle mode |
| Q/W/E/R | Change sound mode |
| Arrow Keys | Move camera |
| Space | Reset particles |

## Technology

- Three.js r128 for 3D rendering
- Web Audio API for sound synthesis
- BufferGeometry for efficient particle rendering
- Additive blending for glowing effects
- Real-time FFT analysis for audio visualization

## How It Works

Particles generate musical notes based on their position:
- **Y position** determines the base note (pitch)
- **X position** selects the scale degree
- **Z position** affects note duration
- **Velocity** triggers sounds when particles move fast

The musical scale changes based on the world style:
- Cosmic: Pentatonic (dreamy)
- Ocean: Minor (melancholic)
- Fire: Chromatic (intense)
- Forest: Major (uplifting)
