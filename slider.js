var mouseDown = false;
var slidersPerContainer = {};
/** Class representing a slider. */
class Slider {
  
  /**
   * Create new slider.
   * @param {Object} options - Information about the slider.
   * @param {string} options.container - Container name.
   * @param {string} options.color - Container name.
   * @param {number} options.minValue - Minimum value.
   * @param {number} options.maxValue - Maximum value.
   * @param {number} options.step - Step of slider.
   * @param {number} options.radius - Radius of slider circle.
   */
  constructor(options) {
    this.settings = {
      backgroundCircleDashesWidth: 6,
      backgroundCircleWantedSpacesWidth: 3,
      backgroundCircleStrokeWidth: 20,
      backgroundCircleStrokeColor: 'grey',
      hodlerDiameter: 24,
      holderFillColor: 'white',
      holderStrokeColor: 'grey',
      holderStrokeWidth: 2,
      containerWidth: 400,
      color: 'red',
      opacity: 0.5,
      label: 'Unknown Expense'
    };
    this.settings = Object.assign({}, this.settings, options);

    this.isActive = false;

    this.xmlns = 'http://www.w3.org/2000/svg';
    
    this.container = {};
    this.container.element = document.getElementById(this.settings.container);
    // Check if container exists, if not throw an error
    if(!this.container.element) {
      throw new Error('There is no such container. Change container name.');
    }
    
    
    // Create svg element if it doesnt exists inside this container
    const svgElementId = this.settings.container + '__svg-slider';
    this.svgElem = document.getElementById(svgElementId);
    if(!this.svgElem) {
      this.svgElem = document.createElementNS(this.xmlns, 'svg');
      this.svgElem.setAttribute('id', svgElementId);
      this.svgElem.setAttribute('version', 1.1);
      this.svgElem.setAttribute('transform', 'rotate(-90)');
      this.svgElem.setAttribute('width', this.settings.containerWidth);
      this.svgElem.setAttribute('height', this.settings.containerWidth);
      this.svgElem.setAttribute('viewPort', `${this.settings.containerWidth}, ${this.settings.containerWidth}` );
      this.container.element.appendChild(this.svgElem);
    }

    this.pushToAndSortSliders();
    
    this.renderLabels();

    this.renderSlider(
      this.settings.containerWidth, 
      this.settings.backgroundCircleDashesWidth,
      this.settings.backgroundCircleWantedSpacesWidth  
    );
    // Add to slidersPerContainer table object and sort them
    

    this.svgElem.addEventListener('mousedown', this.mouseDown.bind(this));
    window.addEventListener('mouseup', this.mouseUp.bind(this));
    window.addEventListener('mousemove', this.mouseMove.bind(this));
  }

  /**
   * Append and render slider elements to svg in this container
   * @param  {number} containerWidth - Width of container.
   * @param  {number} dashesWidth - Width of dashes in circle.
   * @param  {number} wantedSpacesWidth - Wanted width of spaces between dashes.
   */
  renderSlider(containerWidth, dashesWidth, wantedSpacesWidth) {
    // Create slider group of all slider elements
    var svgGroup = document.createElementNS(this.xmlns, 'g');
    
    // Create backgound dashed circle
    const spacesWidth = this.calcSpaceWidth(
      dashesWidth,
      wantedSpacesWidth
    )
    var backgroundCircle = document.createElementNS(this.xmlns, 'circle');
    backgroundCircle.setAttribute('class', 'circle');
    backgroundCircle.setAttribute('r', this.settings.radius);
    backgroundCircle.setAttribute('cx', containerWidth / 2);
    backgroundCircle.setAttribute('cy', containerWidth / 2);
    backgroundCircle.setAttribute('fill', 'none');
    backgroundCircle.setAttribute('stroke-dasharray', `${dashesWidth}, ${spacesWidth}`);
    backgroundCircle.style.strokeWidth = this.settings.backgroundCircleStrokeWidth;
    backgroundCircle.style.stroke = this.settings.backgroundCircleStrokeColor;
    svgGroup.appendChild(backgroundCircle);

    //Create background arc path
    this.backgoundArcPath = document.createElementNS(this.xmlns, 'path');
    this.backgoundArcPath.setAttribute('d', this.describeArc(0, 0, this.getAngleFromXAndY({x: this.settings.radius, y: 0})));
    this.backgoundArcPath.style.fill = 'none';
    this.backgoundArcPath.style.stroke = this.settings.color;
    this.backgoundArcPath.style.strokeWidth = this.settings.backgroundCircleStrokeWidth;
    this.backgoundArcPath.style.opacity = this.settings.opacity;
    svgGroup.appendChild(this.backgoundArcPath);

    // Create holder
    var holderCenter = this.getCenterOnBackgroundCircle(0);
    this.holderCircle = document.createElementNS(this.xmlns, 'circle');
    this.holderCircle.setAttribute('r', this.settings.hodlerDiameter / 2);
    this.holderCircle.setAttribute('cx', holderCenter.x);
    this.holderCircle.setAttribute('cy', holderCenter.y);
    this.holderCircle.style.fill = this.settings.holderFillColor;
    this.holderCircle.style.stroke = this.settings.holderStrokeColor;
    this.holderCircle.style.strokeWidth = this.settings.holderStrokeWidth;
    svgGroup.appendChild(this.holderCircle);

    this.svgElem.appendChild(svgGroup);
  }
  //TODO:coords are here temporary till i find the solution where to store them
  rerenderSlider(coords) {
    const angle = this.getAngleFromXAndY(coords);
    const positionOnBackgroundCircle = this.getCenterOnBackgroundCircle(angle);
    this.holderCircle.setAttribute('cx', positionOnBackgroundCircle.x);
    this.holderCircle.setAttribute('cy', positionOnBackgroundCircle.y);
    this.backgoundArcPath.setAttribute('d', this.describeArc(0, 0,this.getAngleFromXAndY(coords)));

    //rerender labels
    const labelStr = this.settings.label.trim().toLowerCase().replace(' ', '_');
    var label = document.getElementById('label__' + labelStr);
    label.innerHTML = angle;
  }

  renderLabels() {
    var container = this.container.element;
    var labelsDiv = document.getElementById(this.settings.container+'__labels');
    if (labelsDiv)
      container.removeChild(labelsDiv);
    labelsDiv = document.createElement('div');
    labelsDiv.setAttribute('id', this.settings.container+'__labels');
    container.insertBefore(labelsDiv, this.container.element.firstChild);

    // Create all labels
    for (var i = 0; i < slidersPerContainer[this.settings.container].length; i++) {
      // Create label div for each slider
      var slider = slidersPerContainer[this.settings.container][i];
      var labelDiv = document.createElement('div');
      labelDiv.setAttribute('class', 'label');
      labelsDiv.appendChild(labelDiv);

      // Create number div for each slider
      const labelStr = slider.settings.label.trim().toLowerCase().replace(' ', '_');
      var numberDiv = document.createElement('div');
      numberDiv.setAttribute('id', 'label__' + labelStr);
      labelDiv.appendChild(numberDiv);

      // Create rectangle TODO
      var svg = document.createElementNS(this.xmlns, 'svg');
      svg.setAttribute('version', 1.1);
      svg.setAttribute('width', 10);
      svg.setAttribute('height', 5);
      svg.setAttribute('viewPort', `${10}, ${5}` );
      svg.setAttribute('class', i);

      var rect = document.createElementNS(this.xmlns, 'rect');
      rect.setAttribute('width', 10);
      rect.setAttribute('height', 5);
      rect.setAttribute('fill', slider.settings.color);
      svg.appendChild(rect);
      labelDiv.appendChild(svg);

      // Create text div
      var textDiv = document.createElement('div');
      textDiv.setAttribute('class', 'text');
      textDiv.innerHTML = slider.settings.label;
      labelDiv.appendChild(textDiv);

    }
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

  getCenterOnBackgroundCircle(angle) {
    const x = this.settings.containerWidth / 2 + this.settings.radius * Math.cos(angle);
    const y = this.settings.containerWidth / 2 + this.settings.radius * Math.sin(angle);

    return {x, y};
  }

  describeArc(x, y, endAngle){
    const start = this.getCenterOnBackgroundCircle(endAngle);
    const end = this.getCenterOnBackgroundCircle(0);
    const largeArcFlag = endAngle <= Math.PI ? '0' : '1';

    const d = [
        'M', start.x, start.y, 
        'A', this.settings.radius, this.settings.radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');

    return d;       
  }

  // TODO
  mouseDown(event) {
    const coords = this.getCoordsRelativelyToElementsCenter(event);
    mouseDown = true;
    this.isActive = this.areCoordsInsideSliderBar(coords);
    if (this.isActive) {
      this.rerenderSlider(coords);
    }
  }
  // TODO
  mouseUp(event) {
    const coords = this.getCoordsRelativelyToElementsCenter(event);
    mouseDown = false;
    this.isActive = false;
  }
  // TODO
  mouseMove(event) {
    const coords = this.getCoordsRelativelyToElementsCenter(event);

    if(mouseDown && this.isActive) {
      this.rerenderSlider(coords);
    }
  }

  areCoordsInsideSliderBar(coords) {//check
    //console.log('ANGLE: ',this.getAngleFromXAndY(coords)*180/Math.PI);
    const radiusLength = Math.abs(coords.y / Math.sin(this.getAngleFromXAndY(coords)));
    const outsideR = this.settings.radius + (this.settings.backgroundCircleStrokeWidth / 2);
    const insideR = this.settings.radius - (this.settings.backgroundCircleStrokeWidth / 2);
    //console.log('radius: ', radiusLength, 'outside: ', outsideR, 'inside: ', insideR);
    return (radiusLength > insideR) && (radiusLength < outsideR);
  }
  
  getAngleFromXAndY(coords) {
    const angle = Math.asin(coords.y/(Math.sqrt(Math.pow(coords.x, 2)+Math.pow(coords.y, 2))));

    // Get full angle :)
    if (coords.x < 0) {
      return Math.PI - angle;
    } else if (coords.y < 0) {
      return 2*Math.PI + angle;
    }
    return angle
  }

  getCoordsRelativelyToElementsCenter(event) {
    const rectangle = this.svgElem.getBoundingClientRect();
    var x = event.clientX - rectangle.x - (rectangle.width / 2);
    var y = event.clientY - rectangle.y - (rectangle.height / 2);
    
    // Change x and y and inverse them relative to window coordinate system
    const z = x;
    x = -y;
    y = z;
    //console.log('COORDS',x,y);
    return {x, y};
  }
  
  pushToAndSortSliders() {
    if(!(this.settings.container in slidersPerContainer))
      slidersPerContainer[this.settings.container] = []
    slidersPerContainer[this.settings.container].push(this);
    slidersPerContainer[this.settings.container].sort(this.compare);
  }

  compare(aSlider, bSlider) {
    if (aSlider.settings.radius < bSlider.settings.radius) {
      return 1;
    }
    if (aSlider.settings.radius > bSlider.settings.radius) {
      return -1;
    }
    return 0;
  }
}

new Slider({
  container: 'container',
  color: 'red',
  radius: 70,
  label: 'Transportation'
});
new Slider({
  container: 'container',
  color: 'blue',
  radius: 40,
  label: 'Food'
});

new Slider({
  container: 'container',
  color: 'green',
  radius: 100,
  label: 'Insurance'
});

new Slider({
  container: 'container',
  color: 'green',
  radius: 130,
  label: 'Health care'
});

new Slider({
  container: 'container2',
  color: 'red',
  radius: 70,
  label: 'Transportation1'
});
new Slider({
  container: 'container2',
  color: 'blue',
  radius: 40,
  label: 'Food1'
});

console.log(slidersPerContainer);