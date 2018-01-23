class CircularSlider {
  constructor(containerId) {
    this.xmlns = 'http://www.w3.org/2000/svg';
    
    this.options = {
      backgroundCircleDashesWidth: 6,
      backgroundCircleWantedSpacesWidth: 3
    };
    this.container = document.getElementById(containerId);
    
    this.svgElem = document.createElementNS (this.xmlns, 'svg');
    this.svgElem.setAttribute('version', 1.1);
    this.svgElem.setAttribute('width', 400);
    this.svgElem.setAttribute('height', 400);
    this.svgElem.setAttribute('viewPort', `${400}, ${400}` );

    this.container.appendChild(this.svgElem);
  }

  drawSlider(slider) {
    // Create backgound dashed circle
    var backgrounfCircleSpacesWidth = this.calcSpaceWidth( 2 * Math.PI * slider.settings.radius);
    var sliderSvg = slider.getSvg();
    sliderSvg.setAttribute('width', 400);
    sliderSvg.setAttribute('height', 400);
    sliderSvg.setAttribute('cx', 200);
    sliderSvg.setAttribute('cy', 200);
    sliderSvg.setAttribute('stroke-dasharray', `${this.options.backgroundCircleDashesWidth}, ${backgrounfCircleSpacesWidth}` );
    this.svgElem.appendChild(sliderSvg);
  }

  // Calculate space widthbetween dashes in background circle
  calcSpaceWidth(circumference) {
    var numberOfDashes = circumference / (this.options.backgroundCircleDashesWidth + this.options.backgroundCircleWantedSpacesWidth);

    return (circumference / Math.floor(numberOfDashes)) - this.options.backgroundCircleDashesWidth;
  }
}
var circularSlider = new CircularSlider('container');

var slider = new Slider({radius: 105});


console.log(circularSlider.container);

circularSlider.drawSlider(slider);