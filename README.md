# Deal With It emoji generator

Fully client-side Deal With It emoji generator hosted at https://emoji.build/deal-with-it-generator/

## Over-engineered features

- All operations done fully client-side - no backend, no private data leaves your browser.
- Uses [Tensorflow.js' face-detection model](https://github.com/tensorflow/tfjs-models/tree/master/face-detection) to automatically scale and position glasses on the detected faces.
- Extensive customization options for glasses:
  - Placement of glasses anywhere on the input image (including slightly going outside it).
  - Change the size of glasses.
  - No limit on the number of glasses.
  - Flip the glasses vertically or horizontally.
  - Customize the direction from which the glasses appear on the image.
  - Different types of glasses.
- GIF output options:
  - Looping mode.
  - Number of frames.
  - Frame delay.
  - Separate delay setting for last frame.
  - Output size.
- Celebration confetti 🎉
- Easter eggs.

## Development

Uses [Vite](https://vitejs.dev/), so the usual dance is enough:

```
nvm use
npm install
npm run dev
```

Then visit http://localhost:5173/deal-with-it-generator/ (note the subdirectory).
