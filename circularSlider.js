class CircularSlider {
  constructor(containerId) {
    this.xmlns = 'http://www.w3.org/2000/svg';
    
    this.sliders = [];
    this.settings = {
      backgroundCircleDashesWidth: 6,
      backgroundCircleWantedSpacesWidth: 3,
      containerWidth: 400
    };
    this.container = document.getElementById(containerId);
    
    var svgElem = document.createElementNS(this.xmlns, 'svg');
    svgElem.setAttribute('version', 1.1);
    svgElem.setAttribute('width', this.settings.containerWidth);
    svgElem.setAttribute('height', this.settings.containerWidth);
    svgElem.setAttribute('viewPort', `${this.settings.containerWidth}, ${this.settings.containerWidth}` );
    this.container.appendChild(svgElem);

    this.svgGroup = document.createElementNS(this.xmlns, "g");
    svgElem.appendChild(this.svgGroup);
  }

  addSlider(slider) {
    this.sliders.push(slider);
    // TODO: check if slider already exists in array... check settings and 
    // print errors in case that slider overlaps another one
    this.renderSlider(slider);
  }

  renderSlider(slider) {
    var sliderSvg = slider.getSvg({
      containerWidth: this.settings.containerWidth,
      dashesWidth: this.settings.backgroundCircleDashesWidth,
      wantedSpacesWidth: this.settings.backgroundCircleWantedSpacesWidth
    });
    this.svgGroup.appendChild(sliderSvg);
  }
}
var circularSlider = new CircularSlider('container');

var slider = new Slider({radius: 100});

var slider2 = new Slider({radius: 70});

var slider3 = new Slider({radius: 40});

console.log(circularSlider.container);

circularSlider.addSlider(slider);
circularSlider.addSlider(slider2);
circularSlider.addSlider(slider3);