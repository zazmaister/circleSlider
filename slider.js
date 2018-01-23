class Slider {
  
  constructor(options) {
    this.settings = options;
  }

  getSvg(options) {
    // Create backgound dashed circle
    const spacesWidth = this.calcSpaceWidth( 
      (2 * Math.PI * this.settings.radius),
      options.dashesWidth,
      options.wantedSpacesWidth
    )
    var backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    backgroundCircle.setAttribute('class', 'circle');
    backgroundCircle.setAttribute('cx', options.containerWidth / 2);
    backgroundCircle.setAttribute('cy', options.containerWidth / 2);
    backgroundCircle.setAttribute('r', this.settings.radius);
    backgroundCircle.setAttribute('fill', 'none');
    backgroundCircle.setAttribute('stroke-dasharray', `${options.dashesWidth}, ${spacesWidth}`);
    
    return backgroundCircle;
  }

  // Calculate space width between dashes in background circle
  calcSpaceWidth(circumference, dashesWidth, wantedSpacesWidth) {
    var numberOfDashes = circumference / (dashesWidth + wantedSpacesWidth);

    return (circumference / Math.floor(numberOfDashes)) - dashesWidth;
  }
}