import ipywidgets as widgets
from traitlets import Unicode, Integer, List

@widgets.register
class ColorPicker(widgets.DOMWidget):
    """A color picker widget for Jupyter Notebook."""

    _view_name = Unicode('ColorPickerView').tag(sync=True)
    _model_name = Unicode('ColorPickerModel').tag(sync=True)
    _view_module = Unicode('colorpicker').tag(sync=True)
    _model_module = Unicode('colorpicker').tag(sync=True)
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    value = List([0, 0, 0]).tag(sync=True)
