/** Class representing a slider. */
class Slider {
  
  /**
   * Create new slider.
   * @param {Object} options - Information about the slider.
   * @param {number} options.radius - Radius of slider circle.
   */
  constructor(options) {
    this.settings = options;
  }

  /**
   * Get svg elements of slider.
   * @param  {number} containerWidth - Width of container.
   * @param  {number} dashesWidth - Width of dashes in circle.
   * @param  {number} wantedSpacesWidth - Wanted width of spaces between dashes.
   */
  getSvg(containerWidth, dashesWidth, wantedSpacesWidth) {
    // Create backgound dashed circle
    const spacesWidth = this.calcSpaceWidth(
      dashesWidth,
      wantedSpacesWidth
    )
    var backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    backgroundCircle.setAttribute('class', 'circle');
    backgroundCircle.setAttribute('cx', containerWidth / 2);
    backgroundCircle.setAttribute('cy', containerWidth / 2);
    backgroundCircle.setAttribute('r', this.settings.radius);
    backgroundCircle.setAttribute('fill', 'none');
    backgroundCircle.setAttribute('stroke-dasharray', `${dashesWidth}, ${spacesWidth}`);
    
    return backgroundCircle;
  }

  /**
   * Calculate space width between dashes in background circle.
   * @param  {number} dashesWidth - Width of dashes in circle.
   * @param  {number} wantedSpacesWidth - Wanted width of spaces between dashes.
   * @return {number} Returns correct width of spaces between dashes.
   */
  calcSpaceWidth(dashesWidth, wantedSpacesWidth) {
    const circumference = (2 * Math.PI * this.settings.radius);
    const numberOfDashes = circumference / (dashesWidth + wantedSpacesWidth);
    return (circumference / Math.floor(numberOfDashes)) - dashesWidth;
  }
}