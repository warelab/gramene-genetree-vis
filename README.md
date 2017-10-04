# Gramene Gene Tree Visualization

![gene tree visualization example](https://raw.githubusercontent.com/warelab/gramene-genetree-vis/master/genetree_vis_example.png)



The Gramene Gene Tree Visualization is a JavaScript library for interactive visualization of gene tree data. It is primarily developed for use on the [Cold Spring Harbor Laboratory](http://cshl.edu)’s [Gramene](http://gramene.org) web site, but it is self-contained and can be dropped into any other web site.

## Running the Visualization

The gene tree visualization can be run locally in a stand-alone mode for testing/viewing/developing.

1. Install [Yarn](http://yarnpkg.com), a JavaScript dependency manager.

2. From the project root directory, run Yarn to load dependencies (or install, as needed).

   ```bash
   % yarn
   ```

3. Compile and run standalone application in development mode:

    ```bash
    % yarn run start
    ```


​    Note that the application will connect to `devdata.gramene.org` to load sample data to display.

4. Connect to `http://localhost:3000/` to view the visualization.



## Misc.

The development project was created with [Create React App](https://github.com/facebookincubator/create-react-app). You can view [this guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md) to for details about that environment.