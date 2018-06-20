const rgbcss = dust => {
  dust.filters.rgbcss = ({r, g, b}) => {
    return `rgb(${r}, ${g}, ${b})`;
  }
}

module.exports = rgbcss;
