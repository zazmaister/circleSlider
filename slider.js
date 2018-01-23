/** Class representing a slider. */
class Slider {
  
  /**
   * Create new slider.
   * @param {Object} options - Information about the slider.
   * @param {string} options.container - Container name.
   * @param {number} options.minValue - Minimum value.
   * @param {number} options.maxValue - Maximum value.
   * @param {number} options.step - Step of slider.
   * @param {number} options.radius - Radius of slider circle.
   */
  constructor(options) {
    this.settings = {
      backgroundCircleDashesWidth: 6,
      backgroundCircleWantedSpacesWidth: 3,
      hodlerDiameter: 24,
      holderFillColor: 'white',
      holderStrokeColor: 'grey',
      holderStrokeWidth: 2,
      containerWidth: 400,
    };
    this.settings = Object.assign({}, this.settings, options);

    this.xmlns = 'http://www.w3.org/2000/svg';
    
    this.container = {};
    this.container.element = document.getElementById(this.settings.container);
    // Check if container exists, if not throw an error
    if(!this.container.element) {
      throw new Error('There is no such container. Change container name.');
    }
    
    // Create svg element if it doesnt exists inside this container
    this.svgElem = document.getElementById(this.settings.container).getElementsByTagName('svg')[0];
    if(!this.svgElem) {
      this.svgElem = document.createElementNS(this.xmlns, 'svg');
      this.svgElem.setAttribute('version', 1.1);
      this.svgElem.setAttribute('width', this.settings.containerWidth);
      this.svgElem.setAttribute('height', this.settings.containerWidth);
      this.svgElem.setAttribute('viewPort', `${this.settings.containerWidth}, ${this.settings.containerWidth}` );
      this.container.element.appendChild(this.svgElem);
    }

    this.renderSlider(
      this.settings.containerWidth, 
      this.settings.backgroundCircleDashesWidth,
      this.settings.backgroundCircleWantedSpacesWidth  
    );
  }

  /**
   * Append and render slider elements to svg in this container
   * @param  {number} containerWidth - Width of container.
   * @param  {number} dashesWidth - Width of dashes in circle.
   * @param  {number} wantedSpacesWidth - Wanted width of spaces between dashes.
   */
  renderSlider(containerWidth, dashesWidth, wantedSpacesWidth) {
    // Create slider group of all slider elements
    var svgGroup = document.createElementNS(this.xmlns, "g");
    
    // Create backgound dashed circle
    const spacesWidth = this.calcSpaceWidth(
      dashesWidth,
      wantedSpacesWidth
    )
    var backgroundCircle = document.createElementNS(this.xmlns, 'circle');
    backgroundCircle.setAttribute('class', 'circle');
    backgroundCircle.setAttribute('cx', containerWidth / 2);
    backgroundCircle.setAttribute('cy', containerWidth / 2);
    backgroundCircle.setAttribute('r', this.settings.radius);
    backgroundCircle.setAttribute('fill', 'none');
    backgroundCircle.setAttribute('stroke-dasharray', `${dashesWidth}, ${spacesWidth}`);
    svgGroup.appendChild(backgroundCircle);

    // Create holder
    var holderCenter = this.getHolderCenter(0);
    var holderCircle = document.createElementNS(this.xmlns, 'circle');
    holderCircle.setAttribute('cx', holderCenter.x);
    holderCircle.setAttribute('cy', holderCenter.y);
    holderCircle.setAttribute('r', this.settings.hodlerDiameter / 2);
    holderCircle.style.fill = this.settings.holderFillColor;
    holderCircle.style.stroke = this.settings.holderStrokeColor;
    holderCircle.style.strokeWidth = this.settings.holderStrokeWidth;
    svgGroup.appendChild(holderCircle);

    this.svgElem.appendChild(svgGroup);
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

  getHolderCenter(angle) {
    const x = this.settings.containerWidth / 2 + this.settings.radius * Math.cos(angle);
    const y = this.settings.containerWidth / 2 + this.settings.radius * Math.sin(angle);

    return {x,y};
  }

  getChildByClassName(element, childClassName) {
    var found = null;
    for (var i = 0; i < element.childNodes.length; i++) {
      if (element.childNodes[i].className == childClassName) {
        found = element.childNodes[i];
        break;
      }        
    }
    return found;
  } 
}

new Slider({
  container: 'container',
  radius: 100
});
new Slider({
  container: 'container',
  radius: 50
});