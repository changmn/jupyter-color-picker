jupyter-color-picker
===============================

A color picker widget for Jupyter Notebook.

Well, this is my first widget for Jupyter so any feedback is welcome and appreciated. It was created using the widget-cookiecutter from @jupyter-widgets. Unfortunately the example notebook probably won't show the widget in Github so here's a screenshot of how the widget actually looks:

[[/example/example.png|Screenshot from example.ipynb]]

To Do
-----
* Add different types of color pickers, or at least an HSV color picker
* Allow for changing the size of the widget
* Add options for changing some CSS properties

Installation
------------

To install use pip:

    $ pip install jupyter_color_picker
    $ jupyter nbextension enable --py --sys-prefix jupyter_color_picker

To install for jupyterlab

    $ jupyter labextension install jupyter_color_picker

For a development installation (requires npm),

    $ git clone https://github.com//jupyter-color-picker.git
    $ cd jupyter-color-picker
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --sys-prefix jupyter_color_picker
    $ jupyter nbextension enable --py --sys-prefix jupyter_color_picker
    $ jupyter labextension install js

When actively developing your extension, build Jupyter Lab with the command:

    $ jupyter lab --watch

This takes a minute or so to get started, but then automatically rebuilds JupyterLab when your javascript changes.

Note on first `jupyter lab --watch`, you may need to touch a file to get Jupyter Lab to open.

