jupyter-color-picker
===============================

A color picker widget for Jupyter Notebook.

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

