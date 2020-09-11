let widgets = require('@jupyter-widgets/base');
let _ = require('lodash');

function setStyle() {
    let style = document.createElement('style');
    style.type = 'text/css';

    // Set the contents of the new style element.
    style.innerHTML = `
        #color-picker {
            display: grid;
            position: relative;

            grid-template-areas:
                "colorDisplay . rRange . rLabel"
                "colorDisplay .    .   .    .  "
                "colorDisplay . gRange . gLabel"
                "colorDisplay .    .   .    .  "
                "colorDisplay . bRange . bLabel";
        }
        .common {
            border: 1px solid #000;
            box-sizing: border-box;
        }
        #color-display {
            grid-area: colorDisplay;
            border: 1px solid #000;
        }
        #r-track { grid-area: rRange; }
        #g-track { grid-area: gRange; }
        #b-track { grid-area: bRange; }

        .track {
            z-index: 0;
        }
        #r-dummy-range { grid-area: rRange; }
        #g-dummy-range { grid-area: gRange; }
        #b-dummy-range { grid-area: bRange; }

        .dummy-range {
            z-index: 2;
            height: 33px;
            width: calc(100% + 2px);
            justify-self: center;
            opacity: 0;
        }
        #r-input-label { grid-area: rLabel; }
        #g-input-label { grid-area: gLabel; }
        #b-input-label { grid-area: bLabel; }

        .input-label {
            background-color: #fff;
            border: 1px solid #000;
            height: 90%;
            align-self: center;
            outline: none;
        }

        #r-thumb-canvas { grid-area: rRange; }
        #g-thumb-canvas { grid-area: gRange; }
        #b-thumb-canvas { grid-area: bRange; }

        canvas {
            z-index: 1;
            position: absolute;
            background-color: rgba(0, 0, 0, 0);
        }
    `;
    // Append the new style element to the head.
    document.getElementsByTagName('head')[0].append(style);
}

function createColorDisplay() {
    let colorDisplay = document.createElement('div');
    colorDisplay.classList.add('common');
    return colorDisplay;
}

function createTrack(letter) {
    let track = document.createElement('div');
    track.setAttribute('id', letter + '-track');
    track.classList.add('track');
    track.classList.add('common');
    return track;
}

function createDummyRange(letter) {
    let dummyRange = document.createElement('input');
    dummyRange.setAttribute('id', letter + '-dummy-range');
    dummyRange.setAttribute('type', 'range');
    dummyRange.setAttribute('value', '0');
    dummyRange.setAttribute('min', '0');
    dummyRange.setAttribute('max', '255');
    dummyRange.setAttribute('step', '1');
    dummyRange.classList.add('dummy-range');
    dummyRange.classList.add('common');
    return dummyRange;
}

function createInputLabel(letter) {
    let inputLabel = document.createElement('input');
    inputLabel.setAttribute('id', letter + '-input-label');
    inputLabel.setAttribute('type', 'number');
    inputLabel.setAttribute('value', '0');
    inputLabel.setAttribute('min', '0');
    inputLabel.setAttribute('max', '255');
    inputLabel.setAttribute('step', '1');
    inputLabel.classList.add('input-label');
    inputLabel.classList.add('common');
    return inputLabel;
}

function createColorDisplay() {
    let colorDisplay = document.createElement('div');
    colorDisplay.setAttribute('id', 'color-display');
    colorDisplay.classList.add('common');
    return colorDisplay;
}

function createThumbCanvas(letter, width, height) {
    let thumbCanvas = document.createElement('canvas');
    thumbCanvas.setAttribute('id', letter + '-thumb-canvas');
    thumbCanvas.width = width;
    thumbCanvas.height = height;
    return thumbCanvas;
}

function createColorPicker(width, height, pad, c1, c5, r) {
    let colorPicker = document.createElement('div');
    colorPicker.setAttribute('id', 'color-picker');
    colorPicker.style.width = width + 'px';
    colorPicker.style.height = height + 'px';
    colorPicker.style.gridTemplateColumns = `${c1}px ${pad}px auto ${pad}px ${c5}px`;
    colorPicker.style.gridTemplateRows = `${r}px ${pad}px ${r}px ${pad}px ${r}px`;
    return colorPicker;
}

function drawTriangle(ctx, x0, y0, x1, y1, x2, y2, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x0, y0);
    ctx.fill();
    ctx.restore();
}


var ColorPickerModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name : 'ColorPickerModel',
        _view_name : 'ColorPickerView',
        _model_module : 'colorpicker',
        _view_module : 'colorpicker',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0',
        value : [0, 0, 0],
    })
});


let ColorPickerView = widgets.DOMWidgetView.extend({
    // Render the widget into the DOM
    render: function() {
        const width = 450;

        // Calculate appropriate sizes for each element based on the total width.
        // These magic numbers are just sizes I thought looked good. If the width
        // is ever allowed to be user specified, these values will probably have
        // to be clamped to make sure the color picker is still usable.
        const height = width * 0.255;
        const pad = 3;
        const c1 = 0.1875 * width;
        const c5 = 0.1102 * width;
        const r = (height-2*pad) / 3;
        const canvasWidth = width - 2*pad - c1 - c5;
        this.thumbSize = [0, r/5];
        this.trackSize = [canvasWidth, r];
        this.thumbSize[0] = this.thumbSize[1] * 2.2;

        // Create a style element with some CSS and add it to the document.
        setStyle();

        // Create the parent color picker div and the color display div.
        this.colorPicker = createColorPicker(width, height, pad, c1, c5, r);
        this.colorDisplay = createColorDisplay();

        this.thumbCanvases = [];
        this.thumbContexts = [];
        this.dummyRanges = [];
        this.inputLabels = [];
        this.tracks = [];

        // Create the tracks, thumb canvases, and input labels.
        ['r', 'g', 'b'].forEach((letter, i) => {
            this.tracks[i] = createTrack(letter);
            this.dummyRanges.push(createDummyRange(letter));
            this.inputLabels.push(createInputLabel(letter));
            this.thumbCanvases.push(createThumbCanvas(letter, ...this.trackSize));
            this.thumbContexts.push(this.thumbCanvases[i].getContext('2d'));
        });

        // Add everything to the parent color picker div.
        this.colorPicker.append(this.colorDisplay,
                                ...this.thumbCanvases,
                                ...this.tracks,
                                ...this.dummyRanges,
                                ...this.inputLabels);

        // Add the parent div to the widget.
        this.el.append(this.colorPicker);

        // Get the distance in pixels that the thumb should move for each unit
        // change in the color channel value.
        this.STEP = this.trackSize[0] / 0xFF;

        // Setup the event handlers.
        this.dummyRanges.forEach((dummyRange, i) => {
            dummyRange.addEventListener('input', (event) => {
                this.updateChannel(i, event.target.value);
            }, false);
        });
        this.inputLabels.forEach((inputLabel, i) => {
            inputLabel.addEventListener('input', (event) => {
                this.updateChannel(i, event.target.value);
            }, false);
        });

        // Make sure all components are self-consistant and reflect the color
        // stored in the model.
        this.value_changed();

        this.model.on('change:value', this.value_changed, this);
    },

    updateChannel: function(i, value) {

        // Clamp the value to [0, 255].
        value = Math.min(Math.max(value, 0x00), 0xFF);

        // Sync up the range and label inputs.
        this.dummyRanges[i].value = value;
        this.inputLabels[i].value = value;

        // Get the full color.
        let color = [
            this.dummyRanges[0].value,
            this.dummyRanges[1].value,
            this.dummyRanges[2].value,
        ];
        for (let j = 0; j < color.length; j++) {
            // Copy the color so we don't change its value. c0 and c1 represent
            // the left and right stops of the gradient, respectively.
            let c0 = color.slice();
            let c1 = color.slice();

            // Holding the other 2 channels fixed, make the gradient span from 0 to
            // 255 in the target channel j so we can see what the color would look
            // like at each possible value.
            c0[j] = 0x00;
            c1[j] = 0xFF;
            let rgb0 = `rgb(${c0.join(',')})`;
            let rgb1 = `rgb(${c1.join(',')})`;

            // Set the gradient.
            this.tracks[j].style.background = `linear-gradient(to right, ${rgb0}, ${rgb1})`;
        }
        // Clear the canvas.
        let ctx = this.thumbContexts[i];
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw the upper thumb triangle. Each triangle is drawn twice to harden
        // the antialiasing.
        let x0 = value*this.STEP - 0.5*this.thumbSize[0];
        let x2 = x0 + this.thumbSize[0];
        let x1 = 0.5 * (x0+x2);
        let y0 = 1;
        let y1 = y0 + this.thumbSize[1];
        drawTriangle(ctx, x0, y0, x2, y0, x1, y1, '#fff');
        drawTriangle(ctx, x0, y0, x2, y0, x1, y1, '#fff');

        // Draw the lower thumb triangle.
        y0 = ctx.canvas.height;
        y1 = y0 - this.thumbSize[1];
        drawTriangle(ctx, x0, y0, x2, y0, x1, y1, '#000');
        drawTriangle(ctx, x0, y0, x2, y0, x1, y1, '#000');

        // Update the color display.
        let [r, g, b] = color;
        this.colorDisplay.style.backgroundColor = `rgb(${r},${g},${b})`;

        // Sync the value with Python.
        this.model.set({ value: [+r, +g, +b] });
        this.model.save_changes();
    },
    value_changed: function() {
        let value = this.model.get('value');

        // Update the frontend display.
        this.updateChannel(0, value[0]);
        this.updateChannel(1, value[1]);
        this.updateChannel(2, value[2]);
    },
});


module.exports = {
    ColorPickerModel: ColorPickerModel,
    ColorPickerView: ColorPickerView,
};
