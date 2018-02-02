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
   * @param {number} [options.bcDashesWidth=6] - Width of dashes
   * @param {number} [options.bcWantedSpacesWidth=3] - Wanted spaces width.
   * @param {number} [options.bcStrokeWidth=20] - Stroke width.
   * @param {string} [options.bcStrokeColor=#D5D5D5] - Stroke color.
   * @param {number} [options.hodlerDiameter=24] - Holder diameter.
   * @param {string} [options.holderFillColor=white] - Holder fill color.
   * @param {string} [options.holderStrokeColor=#C0C0C0] - Holder stroke color.
   * @param {number} [options.holderStrokeWidth=2] - Holder stroke width.
   * @param {number} [options.svgWidth=400] - SVG width
   * @param {number} [options.sidebarWidth=200] - sidebar width.
   * @param {number} [options.opacity=0.7] - Opacity of sliders bacground bar.
   */
  constructor(options) {
    // Default settings
    this.settings = {
      label: 'Unknown Expense',
      bcDashesWidth: 6,
      bcWantedSpacesWidth: 3,
      bcStrokeWidth: 20,
      bcStrokeColor: '#D5D5D5',
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
    this.checkSettings();

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
      this.svgElem.setAttribute('viewPort', `${this.settings.svgWidth}, ${this.settings.svgWidth}`);
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
    backgroundCircle.setAttribute('stroke-dasharray', `${this.settings.bcDashesWidth}, ${spacesWidth}`);
    backgroundCircle.style.strokeWidth = this.settings.bcStrokeWidth;
    backgroundCircle.style.stroke = this.settings.bcStrokeColor;
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
    this.backgoundArcPath.style.strokeWidth = this.settings.bcStrokeWidth;
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
    const stepAngle = this.calcStepAngle(angle).angle;
    const positionOnBackgroundCircle = this.getCenterOnBackgroundCircle(stepAngle);
    this.holderCircle.setAttribute('cx', positionOnBackgroundCircle.x);
    this.holderCircle.setAttribute('cy', positionOnBackgroundCircle.y);
    this.backgoundArcPath.setAttribute('d', this.describeArc(0, 0, stepAngle));

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
    const twoPi = 2 * Math.PI;
    const stepAngleCoefficient = twoPi  / (steps + stepsReminder);

    for(var step = 0; step <= steps; step++) {
      const angleInGrad = step * stepAngleCoefficient;
      if (step === steps) { 
        if(stepsReminder === 0) {
          return {angle: twoPi * 0.9999, value: this.settings.maxValue};
        }
        if (mouseAngle < angleInGrad + (stepsReminder*stepAngleCoefficient/2))
          return {angle: stepAngleCoefficient * step, value: step * this.settings.step + this.settings.minValue};
        else
          return {angle: twoPi *0.9999, value: this.settings.maxValue};
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
    const numberOfDashes = circumference / (this.settings.bcDashesWidth + this.settings.bcWantedSpacesWidth);
    return (circumference / Math.floor(numberOfDashes)) - this.settings.bcDashesWidth;
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

  /**
   * Check if coordinated are inside slider bar.
   * @param  {Point} coords - Coordinates of mouse position.
   * @returns {boolean} 
   */
  areCoordsInsideSliderBar(coords) {
    const radiusLength = Math.abs(coords.y / Math.sin(this.getAngleFromXAndY(coords)));
    const outsideR = this.settings.radius + (this.settings.bcStrokeWidth / 2);
    const insideR = this.settings.radius - (this.settings.bcStrokeWidth / 2);

    return (radiusLength > insideR) && (radiusLength < outsideR);
  }
  
  /**
   * Calculate angle of mouse position.
   * @param  {Point} coords - Coordinates of mouse position.
   * @returns {number} Angle in gradians.
   */
  getAngleFromXAndY(coords) {
    const angle = Math.asin(coords.y / (Math.sqrt(Math.pow(coords.x, 2) + Math.pow(coords.y, 2))));

    // Get full angle :)
    if (coords.x < 0) {
      return Math.PI - angle;
    } else if (coords.y < 0) {
      return 2*Math.PI + angle;
    }
    return angle
  }

  
  /**
   * Get right coordinates with translated and transformed coordinate system.
   * @param  {object} event - Mouse event
   * @returns {Point} Point of mouse in right coordinate system.
   */
  getCoordsRelativelyToElementsCenter(event) {
    const rectangle = this.svgElem.getBoundingClientRect();

    let out = {x: 0, y: 0};
    if(event.type == 'touchstart' || event.type == 'touchmove' || event.type == 'touchend'){
      var touch = event.touches[0] || event.changedTouches[0];
      out.x = touch.clientX;
      out.y = touch.clientY;
    } else if (event.type == 'mousedown' || event.type == 'mouseup' || event.type == 'mousemove') {
      out.x = event.clientX;
      out.y = event.clientY;
    }
    // TODO throwing error
    var x = out.x - rectangle.x - (rectangle.width / 2);
    var y = out.y - rectangle.y - (rectangle.height / 2);
    
    // Change x and y and inverse them relative to window coordinate system
    const z = x;
    x = -y;
    y = z;
    return {x, y};
  }
  
  /**
   * Get ordered list of sliders from outside to inside.
   */
  pushToAndSortSliders() {
    if(!(this.settings.container in slidersPerContainer))
      slidersPerContainer[this.settings.container] = []
    slidersPerContainer[this.settings.container].push(this);
    slidersPerContainer[this.settings.container].sort(this.compare);
  }
  /**
   * Compare function for sorting sliders.
   */
  compare(aSlider, bSlider) {
    if (aSlider.settings.radius < bSlider.settings.radius) {
      return 1;
    }
    if (aSlider.settings.radius > bSlider.settings.radius) {
      return -1;
    }
    return 0;
  }

  
  /**
   * Angle normalizer.
   * @param  {number} angle - Mouse angle.
   */
  normalize(angle) {
    return (angle-2*Math.PI)/(2*Math.PI)+1;
  }

  checkSettings() {
    const container = document.getElementById(this.settings.container);
    if (container===null) throw new Error(this.errorMsg('container_not_found', this.settings.container));
    if (this.settings.color === undefined) throw new Error(this.errorMsg('not_specified', 'color'));
    if (this.settings.minValue === undefined) throw new Error(this.errorMsg('not_specified', 'minValue'));
    if (this.settings.maxValue === undefined) throw new Error(this.errorMsg('not_specified', 'maxValue'));
    if (isNaN(this.settings.minValue)) throw new Error(this.errorMsg('not_a_number', 'minValue'));
    if (isNaN(this.settings.maxValue)) throw new Error(this.errorMsg('not_a_number', 'maxValue'));
    if (this.settings.minValue >= this.settings.maxValue) throw new Error(this.errorMsg('min_gte_max'));
    if (this.settings.step === undefined) throw new Error(this.errorMsg('not_specified', 'step'));
    if (isNaN(this.settings.step)) throw new Error(this.errorMsg('not_a_number', 'step'));
    if (this.settings.radius === undefined) throw new Error(this.errorMsg('not_specified', 'radius'));
    if (isNaN(this.settings.radius)) throw new Error(this.errorMsg('not_a_number', 'radius'));
  }

  errorMsg(id, valueName) {
    const errorMessages = {
      container_not_found: `Container with id '${valueName}' doesnt exist in DOM.`,
      not_specified: `'${valueName}' must be declared in Slider options.`,
      not_a_number: `'${valueName}' must be number.`,
      min_gte_max: `'minValue' should not be greater or equal 'maxValue'`
    };
    return errorMessages[id];
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
  label: 'Transportation1',

  bcDashesWidth: 16,
  bcWantedSpacesWidth: 13,
  bcStrokeWidth: 30,
  bcStrokeColor: 'red',
  hodlerDiameter: 34,
  holderFillColor: 'orange',
  holderStrokeColor: '#C0C0C0',
  holderStrokeWidth: 5,
  svgWidth: 400,
  sidebarWidth: 200,
  opacity: 1

});
new Slider({
  container: 'container2',
  color: 'blue',
  minValue: 25,
  maxValue: 725,
  step: 25,
  radius: 20,
  label: 'Food1',

  bcDashesWidth: 16,
  bcWantedSpacesWidth: 13,
  bcStrokeWidth: 30,
  bcStrokeColor: 'red',
  hodlerDiameter: 34,
  holderFillColor: 'orange',
  holderStrokeColor: '#C0C0C0',
  holderStrokeWidth: 5,
  svgWidth: 400,
  sidebarWidth: 200,
  opacity: 1
});

new Slider({
  container: 'container2',
  color: 'brown',
  minValue: 25,
  maxValue: 725,
  step: 25,
  radius: 120,
  label: 'Food1',

  bcDashesWidth: 16,
  bcWantedSpacesWidth: 13,
  bcStrokeWidth: 30,
  bcStrokeColor: 'red',
  hodlerDiameter: 34,
  holderFillColor: 'orange',
  holderStrokeColor: '#C0C0C0',
  holderStrokeWidth: 5,
  svgWidth: 400,
  sidebarWidth: 200,
  opacity: 1
});
