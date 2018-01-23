class Slider {
  
  constructor(options) {
    this.settings = options;
  }

  getSvg() {
    // Create backgound dashed circle
    var backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    backgroundCircle.setAttribute('class', 'circle');
    backgroundCircle.setAttribute('r', this.settings.radius);
    backgroundCircle.setAttribute('fill', 'none');
    
    return backgroundCircle;
  }
}