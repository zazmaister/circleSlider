/**
 * @typedef {Object} Point
 * @property {number} x The X Coordinate
 * @property {number} y The Y Coordinate
 */

var mouseDown = false;
var slidersPerContainer = {};
window.blockMenuHeaderScroll = false;
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
   * @param {string} [options.label=Unknown Expense] - Slider expense label.
   * @param {number} [options.backgroundCircleDashesWidth=6] - Slider expense label.
   * @param {number} [options.backgroundCircleWantedSpacesWidth=3] - Slider expense label.
   * @param {number} [options.backgroundCircleStrokeWidth=20] - Slider expense label.
   * @param {string} [options.backgroundCircleStrokeColor=#D5D5D5] - Slider expense label.
   * @param {number} [options.hodlerDiameter=24] - Slider expense label.
   * @param {string} [options.holderFillColor=white] - Slider expense label.
   * @param {string} [options.holderStrokeColor=#C0C0C0] - Slider expense label.
   * @param {number} [options.holderStrokeWidth=2] - Slider expense label.
   * @param {number} [options.svgWidth=400] - Slider expense label.
   * @param {number} [options.sidebarWidth=200] - Slider expense label.
   * @param {number} [options.opacity=0.7] - Slider expense label.
   */
  constructor(options) {
    // Default settings
    this.settings = {
      label: 'Unknown Expense',
      backgroundCircleDashesWidth: 6,
      backgroundCircleWantedSpacesWidth: 3,
      backgroundCircleStrokeWidth: 20,
      backgroundCircleStrokeColor: '#D5D5D5',
      hodlerDiameter: 24,
      holderFillColor: 'white',
      holderStrokeColor: '#C0C0C0',
      holderStrokeWidth: 2,
      svgWidth: 400,
      sidebarWidth: 200,
      opacity: 0.7
    };
    // Overrider settings with options if any
    this.settings = Object.assign({}, this.settings, options);

    this.isActive = false;

    this.xmlns = 'http://www.w3.org/2000/svg';
     
    this.container = document.getElementById(this.settings.container);
    // Check if container exists, if not throw an error
    if(!this.container) {
      throw new Error('There is no such container. Change container name.');
    }

    this.container.style.width = this.settings.sidebarWidth + this.settings.svgWidth;
    this.container.style.display = 'flex';
    this.container.style.height = this.settings.svgWidth;

    // Create svg element if it doesnt exists inside this container
    const svgElementId = this.settings.container + '__svg-slider';
    this.svgElem = document.getElementById(svgElementId);
    if(!this.svgElem) {
      this.svgElem = document.createElementNS(this.xmlns, 'svg');
      this.svgElem.setAttribute('id', svgElementId);
      this.svgElem.setAttribute('version', 1.1);
      this.svgElem.setAttribute('width', this.settings.svgWidth);
      this.svgElem.setAttribute('height', this.settings.svgWidth);
      this.svgElem.setAttribute('viewPort', `${this.settings.svgWidth}, ${this.settings.svgWidth}` );
      this.svgElem.style.margin = 'auto 0';
      this.container.appendChild(this.svgElem);
    }

    this.pushToAndSortSliders();
    
    this.renderLabels();
    this.renderSlider();
    
    // Add event listeners to window and this.svgElem. Set passive to false because of thrown warnings.
    this.svgElem.addEventListener('mousedown', this.mouseDown.bind(this),  { passive: false });
    window.addEventListener('mouseup', this.mouseUp.bind(this),  { passive: false });
    window.addEventListener('mousemove', this.mouseMove.bind(this),  { passive: false });
    this.svgElem.addEventListener('touchstart', this.mouseDown.bind(this),  { passive: false });
    window.addEventListener('touchend', this.mouseUp.bind(this),  { passive: false });
    window.addEventListener('touchmove', this.mouseMove.bind(this),  { passive: false });
  }

  /**
   * Append and render slider elements to svg in this container
   */
  renderSlider() {
    // Create slider group of all slider elements
    var svgGroup = document.createElementNS(this.xmlns, 'g');
    
    // Create backgound dashed circle
    const spacesWidth = this.calcSpaceWidth();
    var backgroundCircle = document.createElementNS(this.xmlns, 'circle');
    backgroundCircle.setAttribute('class', 'circle');
    backgroundCircle.setAttribute('r', this.settings.radius);
    backgroundCircle.setAttribute('cx', this.settings.svgWidth / 2);
    backgroundCircle.setAttribute('cy', this.settings.svgWidth / 2);
    backgroundCircle.setAttribute('fill', 'none');
    backgroundCircle.setAttribute('stroke-dasharray', `${this.settings.backgroundCircleDashesWidth}, ${spacesWidth}`);
    backgroundCircle.style.strokeWidth = this.settings.backgroundCircleStrokeWidth;
    backgroundCircle.style.stroke = this.settings.backgroundCircleStrokeColor;
    svgGroup.appendChild(backgroundCircle);

    //Create background arc path
    this.backgoundArcPath = document.createElementNS(this.xmlns, 'path');
    this.backgoundArcPath.setAttribute(
      'd', 
      this.describeArc(
        0, 
        0, 
        this.getAngleFromXAndY({x: this.settings.radius, y: 0})
      )
    );
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

  /**
   * Rerender slider method.
   * @param  {object} coords - Coordinates of mouse position
   * @param  {number} coords.x - x coordinate.
   * @param  {number} coords.y - y coordinate. 
   */
  rerenderSlider(coords) {
    const angle = this.getAngleFromXAndY(coords);
    const positionOnBackgroundCircle = this.getCenterOnBackgroundCircle(this.calcStepAngle(angle).angle);
    this.holderCircle.setAttribute('cx', positionOnBackgroundCircle.x);
    this.holderCircle.setAttribute('cy', positionOnBackgroundCircle.y);
    this.backgoundArcPath.setAttribute('d', this.describeArc(0, 0,this.calcStepAngle(this.getAngleFromXAndY(coords)).angle));

    // Update vslues of labels.
    const labelStr = this.settings.label.trim().toLowerCase().replace(' ', '_');
    var label = document.getElementById('label__' + labelStr);
    label.innerHTML = '$' + this.calcStepAngle(angle).value;
  }
  
  /**
   * First render of labels
   */
  renderLabels() {
    var container = this.container;
    var labelsDiv = document.getElementById(this.settings.container+'__labels');
    if (labelsDiv)
      container.removeChild(labelsDiv);
    labelsDiv = document.createElement('div');
    labelsDiv.setAttribute('id', this.settings.container+'__labels');
    var center = document.createElement('div');
    center.setAttribute('class', 'center');
    center.style.width = '200px';
    labelsDiv.appendChild(center);
    container.insertBefore(labelsDiv, this.container.firstChild);

    // Create all labels
    for (var i = 0; i < slidersPerContainer[this.settings.container].length; i++) {
      // Create label div for each slider
      var slider = slidersPerContainer[this.settings.container][i];
      var labelDiv = document.createElement('div');
      labelDiv.setAttribute('class', 'label');
      labelDiv.style.display = 'flex';
      labelDiv.style.alignItems = 'baseline';
      center.appendChild(labelDiv);

      // Create number div for each slider
      const labelStr = slider.settings.label.trim().toLowerCase().replace(' ', '_');
      var numberDiv = document.createElement('div');
      numberDiv.setAttribute('id', 'label__' + labelStr);
      numberDiv.style.width = '40%';
      numberDiv.style.textAlign = 'right';
      numberDiv.style.fontSize = '30px';
      numberDiv.style.fontWeight = 900;
      numberDiv.innerHTML = '$' + slider.settings.minValue;
      labelDiv.appendChild(numberDiv);
      

      // Create rectangle TODO
      var svg = document.createElementNS(this.xmlns, 'svg');
      svg.setAttribute('version', 1.1);
      svg.setAttribute('width', 15);
      svg.setAttribute('height', 9);
      svg.setAttribute('viewPort', `${15}, ${9}` );
      svg.setAttribute('class', i);
      svg.style.width = '20%';
      svg.style.maxWidth = '15px';
      svg.style.display = 'block';
      svg.style.position = 'relative';
      svg.style.bottom = '-6px';
      svg.style.margin = 'auto';

      var rect = document.createElementNS(this.xmlns, 'rect');
      rect.setAttribute('width', 15);
      rect.setAttribute('height', 9);
      rect.setAttribute('fill', slider.settings.color);
      svg.appendChild(rect);
      labelDiv.appendChild(svg);

      // Create text div
      var textDiv = document.createElement('p');
      textDiv.setAttribute('class', 'text');
      textDiv.style.width = '40%';
      textDiv.style.textAlign = 'left';
      textDiv.style.fontSize = '12px';
      textDiv.innerHTML = slider.settings.label;
      labelDiv.appendChild(textDiv);

    }

    // Applying styles
    labelsDiv = document.getElementById(this.settings.container + '__labels');
    labelsDiv.style.width = this.settings.sidebarWidth;
    labelsDiv.style.height = this.settings.svgWidth;
    labelsDiv.style.display = 'flex';
    labelsDiv.style.alignItems = 'center';

  }

  
  /**
   * Calculation of step relative to mouse angle.
   * @param  {number} mouseAngle - Mouse angle in gradians
   */
  calcStepAngle(mouseAngle) {
    const range = this.settings.maxValue - this.settings.minValue;
    const steps = Math.floor(range / this.settings.step);
    const stepsReminder = (range % this.settings.step) / this.settings.step;
    const stepAngleCoefficient = 2*Math.PI / (steps + stepsReminder);

    for(var step = 0; step <= steps; step++) {
      const angleInGrad = step * stepAngleCoefficient;
      if (step === steps) { 
        if(stepsReminder === 0) {
          return {angle: 2*Math.PI*0.9999, value: this.settings.maxValue};
        }
        if (mouseAngle < angleInGrad + (stepsReminder*stepAngleCoefficient/2))
          return {angle: stepAngleCoefficient * step, value: step*this.settings.step + this.settings.minValue};
        else
          return {angle: 2*Math.PI*0.9999, value: this.settings.maxValue};
      }
      if ( mouseAngle < angleInGrad + (stepAngleCoefficient / 2)) {
        return {angle: stepAngleCoefficient * step, value: step*this.settings.step+ this.settings.minValue};
      }
      
    }

  }

  /**
   * Calculate space width between dashes in background circle.
   * @return {number} Returns correct width of spaces between dashes.
   */
  calcSpaceWidth() {
    const circumference = (2 * Math.PI * this.settings.radius);
    const numberOfDashes = circumference / (this.settings.backgroundCircleDashesWidth + this.settings.backgroundCircleWantedSpacesWidth);
    return (circumference / Math.floor(numberOfDashes)) - this.settings.backgroundCircleDashesWidth;
  }

  /**
   * Calculate coordinates of holder center.
   * @param  {number} angle - Angle of mouse position in gradians.
   * @returns {Point} Calculated location.
   */
  getCenterOnBackgroundCircle(angle) {
    const x = this.settings.svgWidth / 2 + this.settings.radius * Math.cos(angle);
    const y = this.settings.svgWidth / 2 + this.settings.radius * Math.sin(angle);

    return {x, y};
  }
  
  /**
   * Calculate value of the slider in dollars
   * @param  {number} coefficient - Normalized value of slider angle(mouse position).
   * @returns {number} Value in dollars
   */
  getValueInDollars(coefficient) {
    const range = this.settings.maxValue - this.settings.minValue;
    const value = range * coefficient + this.settings.minValue;
    return value;
  }

  /**
   * Description of arc for svg element(Arc between zero and holder(background)).
   * @param  {number} x - x coordinate.
   * @param  {number} y - y coordinate.
   * @param  {number} endAngle - Angle of mouse position.
   * @returns {string} String of arc description.
   */
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

  /**
   * Trigger method on mousedown or touchstart event. On event rerenderSlider 
   * and set state of slider.
   * @param  {object} event - Event object.
   */
  mouseDown(event) {
    event.preventDefault();
    const coords = this.getCoordsRelativelyToElementsCenter(event);
    mouseDown = true;
    window.blockMenuHeaderScroll = true;
    this.isActive = this.areCoordsInsideSliderBar(coords);
    if (this.isActive) {
      this.rerenderSlider(coords);
    }
  }

  /**
   * Trigger method on mouseup or touchend event. On event set state of slider.
   * @param  {object} event - Event object.
   */
  mouseUp(event) {
    event.preventDefault();
    const coords = this.getCoordsRelativelyToElementsCenter(event);
    mouseDown = false;
    window.blockMenuHeaderScroll = false;
    this.isActive = false;
  }
  
  /**
   * Trigger method on mousemove or touchmove event. On event rerenderSlider.
   * @param  {object} event - Event object.
   */
  mouseMove(event) {
    const coords = this.getCoordsRelativelyToElementsCenter(event);

    if(mouseDown && this.isActive) {
      this.rerenderSlider(coords);
    }
  }

  areCoordsInsideSliderBar(coords) {//check
    const radiusLength = Math.abs(coords.y / Math.sin(this.getAngleFromXAndY(coords)));
    const outsideR = this.settings.radius + (this.settings.backgroundCircleStrokeWidth / 2);
    const insideR = this.settings.radius - (this.settings.backgroundCircleStrokeWidth / 2);

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

    // TODO throwing error
    var x = (event.clientX||event.changedTouches[0].pageX)  - rectangle.x - (rectangle.width / 2);
    var y = (event.clientY||event.changedTouches[0].pageY) - rectangle.y - (rectangle.height / 2);
    
    // Change x and y and inverse them relative to window coordinate system
    const z = x;
    x = -y;
    y = z;
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

  normalize(angle) {
    return (angle-2*Math.PI)/(2*Math.PI)+1;
  }
}

new Slider({
  container: 'container',
  color: '#F3781C',
  minValue: 25,
  maxValue: 725,
  step: 25,
  radius: 70,
  label: 'Transportation'
});
new Slider({
  container: 'container',
  color: 'red',
  minValue: 0,
  maxValue: 100,
  step: 5,
  radius: 40,
  label: 'Food'
});

new Slider({
  container: 'container',
  color: 'green',
  minValue: 5,
  maxValue: 50,
  step: 5,
  radius: 100,
  label: 'Insurance'
});

new Slider({
  container: 'container',
  color: '#0074B3',
  minValue: 0,
  maxValue: 11,
  step: 2.5,
  radius: 130,
  label: 'Health care'
});

new Slider({
  container: 'container',
  color: '#674079',
  minValue: 0,
  maxValue: 11,
  step: 2.5,
  radius: 160,
  label: 'Entertainment'
});

new Slider({
  container: 'container2',
  color: '#F3781C',
  minValue: 25,
  maxValue: 725,
  step: 25,
  radius: 70,
  label: 'Transportation1'
});
new Slider({
  container: 'container2',
  color: 'blue',
  minValue: 25,
  maxValue: 725,
  step: 25,
  radius: 40,
  label: 'Food1'
});

new Slider({
  container: 'container3',
  color: 'red',
  minValue: 25,
  maxValue: 725,
  step: 25,
  radius: 70,
  label: 'Transportation2'
});
new Slider({
  container: 'container3',
  color: 'blue',
  minValue: 25,
  maxValue: 725,
  step: 25,
  radius: 40,
  label: 'Food2'
});

new Slider({
  container: 'container4',
  color: 'red',
  minValue: 25,
  maxValue: 725,
  step: 25,
  radius: 70,
  label: 'Transportation3'
});
new Slider({
  container: 'container4',
  color: 'blue',
  minValue: 25,
  maxValue: 725,
  step: 25,
  radius: 40,
  label: 'Food3'
});

new Slider({
  container: 'container5',
  color: 'red',
  minValue: 25,
  maxValue: 725,
  step: 25,
  radius: 70,
  label: 'Transportation4'
});
new Slider({
  container: 'container5',
  color: 'blue',
  minValue: 25,
  maxValue: 725,
  step: 25,
  radius: 40,
  label: 'Food4'
});
