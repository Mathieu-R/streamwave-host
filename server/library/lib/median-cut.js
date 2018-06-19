// https://en.wikipedia.org/wiki/Median_cut
const {promisify} = require('util');
const commandLineArgs = require('command-line-args');
const getPixels = require('get-pixels');
const MAX_DEPTH = 4;

const options = [
  {name: 'image', alias: 'i', type: String}
];

const parsedOptions = commandLineArgs(options);

function main (path) {
  if (!path) {
    console.log('image path required.');
  }
  medianCut(path);
}

// source can be a path or url
function medianCut (source) {
  return promisify(getPixels)(source)
    .then(pixels => {
      console.log(pixels);
      return pixelsRGB(pixels)
    })
    .then(pixels => quantize(pixels, 0))
    .then(quantizedPixels => sortByLuminance(quantizedPixels))
    .then(sorted => {
      const primary = getMostVariantColor(sorted);
      return primary;
    })
    .catch(err => console.error('Median Cut: ', err));
}

function pixelsRGB ({shape, data}) {
  const width = shape[0];
  const heigth = shape[1];
  const pixels = [];

  for (let y = 0; y < heigth; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      pixels.push({
        r: data[index],
        g: data[index + 1],
        b: data[index + 2]
      });
    }
  }
  return pixels;
}

function quantize(pixels, depth) {
  // beginning
  if (depth === 0) {
    console.log(`Quantizing to ${Math.pow(2, MAX_DEPTH)} buckets.`);
  }

  // end
  if (depth === MAX_DEPTH) {
    const average = {
      r: 0, g: 0, b: 0
    };

    for (const pixel of pixels) {
      average.r += pixel.r;
      average.g += pixel.g;
      average.b += pixel.b;
    }

    average.r = Math.round(average.r / pixels.length);
    average.g = Math.round(average.g / pixels.length);
    average.b = Math.round(average.b / pixels.length);

    return [average];
  }

  // between
  // find which color channel (in the bucket) has the greatest range (r, g or b).
  color = findBiggestRange(pixels);

  // sort pixels according that channel value
  pixels.sort((pixelA, pixelB) => pixelA[color] - pixelB[color]);

  // move the each half of the pixels in a new bucket
  const middle = Math.floor(pixels.length / 2);
  return [
    ...quantize(pixels.slice(0, middle), depth + 1),
    ...quantize(pixels.slice(middle + 1), depth + 1)
  ];
}

function findBiggestRange (pixels) {
  let color;

  let rMin = Number.POSITIVE_INFINITY;
  let gMin = Number.POSITIVE_INFINITY;
  let bMin = Number.POSITIVE_INFINITY;

  let rMax = Number.NEGATIVE_INFINITY;
  let gMax = Number.NEGATIVE_INFINITY;
  let bMax = Number.NEGATIVE_INFINITY;

  for (const pixel of pixels) {
    rMin = Math.min(rMin, pixel.r);
    gMin = Math.min(gMin, pixel.g);
    bMin = Math.min(bMin, pixel.b);

    rMax = Math.max(rMax, pixel.r);
    gMax = Math.max(gMax, pixel.g);
    bMax = Math.max(bMax, pixel.b);
  }

  const rRange = rMax - rMin;
  const gRange = gMax - gMin;
  const bRange = bMax - bMin;

  const biggestRange = Math.max(rRange, gRange, bRange);

  switch (biggestRange) {
    case biggestRange === rRange:
      color = 'r';
      break;
    case biggestRange === gRange:
      color = 'g';
      break;
    case biggestRange === bRange:
      color = 'b';
      break;
  }

  return color;
}

function sortByLuminance (pixels) {
  return pixels.sort((pixelA, pixelB) => luminance(pixelA) - luminance(pixelB));
}

function luminance (pixel) {
  return (0.2126 * pixel.r + 0.7152 * pixel.g + 0.0722 * pixel.b);
}

function getMostVariantColor (colors) {
  let index = 0;
  let max = Number.NEGATIVE_INFINITY;
  colors
    .map(c => Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b))
    .forEach((c, i) => {
      if (c > max) {
        index = i;
        max = c;
      }
    });

  return colors[index];
}

module.exports = {
  medianCut
};
