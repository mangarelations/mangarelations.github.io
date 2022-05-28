// Program starts here. Creates a sample graph in the
// DOM node with the specified ID. This function is invoked
// from the onLoad event handler of the document (see below).
var globalStyle;
var currentlySelectedCell;
var cells;
var reasons = {};
var highlightedCells = ["test"];

function main(container) {
    // Checks if browser is supported
    if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is
        // not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    }
    else {
        // Creates the graph inside the given container
        var graph = new mxGraph(container);

        graph.setEnabled(false);
        graph.setPanning(true);
        graph.setTooltips(true);
        graph.panningHandler.useLeftButtonForPanning = true;

        // Adds a highlight on the cell under the mousepointer
        new mxCellTracker(graph);

        // Changes the default vertex style in-place
        var style = graph.getStylesheet().getDefaultVertexStyle();
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ROUNDED;
        style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
        style[mxConstants.STYLE_PERIMETER_SPACING] = 4;
        style[mxConstants.STYLE_STROKECOLOR] = '#676767';
        style[mxConstants.STYLE_STROKEWIDTH] = 4;
        style[mxConstants.STYLE_FILLCOLOR] = 'white';
        style[mxConstants.STYLE_FONTCOLOR] = 'black';
        style[mxConstants.STYLE_FONTSIZE] = 16;
        console.log(style);

        style = graph.getStylesheet().getDefaultEdgeStyle();
        style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white';
        style[mxConstants.STYLE_STROKEWIDTH] = 10;

        style = mxUtils.clone(style);
        style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_CLASSIC;
        graph.getStylesheet().putCellStyle('2way', style);

        graph.isHtmlLabel = function(cell) {
            return true;
        };

        // Larger grid size yields cleaner layout result
        graph.gridSize = 80;

        // Creates a layout algorithm to be used
        // with the graph
        var layout = new mxFastOrganicLayout(graph);
        //var layout = new mxParallelEdgeLayout(graph);
        document.body.appendChild(mxUtils.button('Go To Random Author', function(evt) {
            navigateToRandomCell(graph)
        }));

        document.body.appendChild(mxUtils.button('Reset View', function(evt) {
            graph.fit();
            graph.view.rendering = true;
            graph.refresh();
        }));

        document.body.appendChild(mxUtils.button('Re-arrange', function(evt) {
            var parent = graph.getDefaultParent();
            layout.execute(parent);
        }));

        let insutructions = document.createElement("span")
        insutructions.innerText = "Click and drag to move, scroll to zoom. Double click arrows for info on connection.";
        insutructions.style.paddingLeft = "15%";
        insutructions.style.fontWeight = "bold";
        document.body.appendChild(insutructions);

        // Moves stuff wider apart than usual
        layout.forceConstant = 1200;
        //check overlapping
        layout.MinDistanceLimit = 10050;
        layout.maxIterations = 10000;


        // Load cells and layouts the graph
        graph.getModel().beginUpdate();
        try {
            // Loads the custom file format (TXT file)
            parse(graph, 'graphdata.txt');

            // Loads the mxGraph file format (XML file)
            //read(graph, 'test.xml');

            // Gets the default parent for inserting new cells. This
            // is normally the first child of the root (ie. layer 0).
            var parent = graph.getDefaultParent();

            // Executes the layout
            layout.execute(parent);

            //this is for the xml, use to generate when you have a good graph
            var enc = new mxCodec(mxUtils.createXmlDocument());
            var node = enc.encode(graph.getModel());
            var xml = mxUtils.getXml(node);
            console.log(xml);
            console.log(graph.getView())

        }
        finally {
            // Updates the display
            graph.getModel().endUpdate();
            graph.fit();
            graph.view.rendering = true;
            graph.refresh();
        }
        graph.addListener(mxEvent.CLICK, function(sender, evt) {

            var cell = evt.getProperty("cell"); // cell may be null
            console.log("fsdda");
            if (cell != null) {
                highlightCell(graph, cell);
            }
            evt.consume();
        });
        graph.dblClick = function(evt, cell) {
            var mxe = new mxEventObject(mxEvent.DOUBLE_CLICK, 'event', evt, 'cell', cell);
            this.fireEvent(mxe);

            if (!mxEvent.isConsumed(evt) &&
                !mxe.isConsumed() &&
                cell != null) {
                mxUtils.alert(reasons[cell.getId()].replace("[break]", "\n"));
            }
        };

        if (mxClient.IS_QUIRKS) {
            document.body.style.overflow = 'hidden';
            new mxDivResizer(container);
        }
    }
    mxEvent.addMouseWheelListener((evt, up) => {
        if (mxEvent.isConsumed(evt)) {
            return;
        }

        let gridEnabled = graph.gridEnabled;

        // disable snapping
        graph.gridEnabled = false;

        let p1 = graph.getPointForEvent(evt, false);

        if (up) {
            graph.zoomIn();
        }
        else {
            graph.zoomOut();
        }

        let p2 = graph.getPointForEvent(evt, false);
        let deltaX = p2.x - p1.x;
        let deltaY = p2.y - p1.y;
        let view = graph.view;

        view.setTranslate(view.translate.x + deltaX, view.translate.y + deltaY);

        graph.gridEnabled = gridEnabled;

        mxEvent.consume(evt);
    }, container);
};

// Custom parser for simple file format
function parse(graph, filename) {
    var model = graph.getModel();

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    var parent = graph.getDefaultParent();

    var req = mxUtils.load(filename);
    var text = req.getText();
    console.log(text)

    var lines = text.split('\n');

    // Creates the lookup table for the vertices
    var vertices = [];

    // Parses all lines (vertices must be first in the file)
    graph.getModel().beginUpdate();
    try {
        for (var i = 0; i < lines.length; i++) {
            // Ignores comments (starting with #)
            var colon = lines[i].indexOf('|');

            if (lines[i].substring(0, 1) != "#" ||
                colon == -1) {
                var comma = lines[i].indexOf(',');
                var value = lines[i].substring(colon + 2, lines[i].length);

                if (comma == -1 || comma > colon) {
                    var key = lines[i].substring(0, colon);

                    if (key.length > 0) {
                        vertices[key] = graph.insertVertex(parent, null, value, 0, 0, 400, 200, 'whiteSpace=wrap;');
                    }
                }
                else if (comma < colon) {
                    // Looks up the vertices in the lookup table
                    var source = vertices[lines[i].substring(0, comma)];
                    var target = vertices[lines[i].substring(comma + 1, colon)];

                    if (source != null && target != null) {
                        var e = graph.insertEdge(parent, null, "", source, target);
                        reasons[e.getId()] = value;
                        console.log(reasons)

                        // Uses the special 2-way style for 2-way labels
                        if (value.indexOf('2-Way') >= 0) {
                            e.style = '2way';
                        }
                    }
                }
            }
        }
    }
    finally {
        graph.getModel().endUpdate();
        globalStyle = graph.getChildVertices(graph.getDefaultParent())[0].getStyle();
        cells = graph.getChildVertices(graph.getDefaultParent());
    }
};

function resetStylesKeepHighlight(graph, cells) {
    for (const cell of highlightedCells) {
        cells = removeFromArray(cells, cell);
    }
    graph.setCellStyle(globalStyle, cells);
}


function navigateToRandomCell(graph) {
    //reset view
    graph.fit();
    graph.view.rendering = true;
    graph.refresh();

    // disable snapping
    let gridEnabled = graph.gridEnabled;
    graph.gridEnabled = false;


    let cells = graph.getChildVertices(graph.getDefaultParent());
    resetStylesKeepHighlight(graph, cells);

    //get values of random cell
    let randomCell = cells[Math.floor(Math.random() * cells.length)];
    var x = graph.view.getState(randomCell).x;
    var y = graph.view.getState(randomCell).y;
    var width = graph.view.getState(randomCell).width;
    var height = graph.view.getState(randomCell).height;

    //scale factor allows the node to be somewhat in the middle, and zoomed out so you can see other connections
    var scaleFactor = 4;
    var rect = new mxRectangle(x - (width / scaleFactor), y - (height / scaleFactor), width * scaleFactor, height * scaleFactor);

    var style = graph.getModel().getStyle(randomCell);
    console.log(style);
    var newStyle = mxUtils.setStyle(style, mxConstants.STYLE_STROKECOLOR, 'red');
    var cs = new Array();
    cs[0] = randomCell;
    graph.setCellStyle(newStyle, cs);

    graph.zoomToRect(rect);
    currentlySelectedCell = randomCell;
}

function highlightCell(graph, cell) {
    var style = graph.getModel().getStyle(cell);
    console.log(highlightedCells);
    if (!highlightedCells.includes(cell)) {
        highlightedCells.push(cell)
        graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, 'red', [cell])
        graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, 'red', [cell])
    }
    else {
        graph.setCellStyle(globalStyle, [cell]);
        highlightedCells = removeFromArray(highlightedCells, cell);
    }
}

function removeFromArray(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        }
    }
    return arr;
}