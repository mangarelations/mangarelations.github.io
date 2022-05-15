function main(container) {
  var width = 1200;
  var height = 1200;
  var centerWidth = width / 2;
  var centerHeight = height / 2;
    if (!mxClient.isBrowserSupported()) {
      mxUtils.error('Browser not supported. fuck off!!', 200, false);
    }
    else {
      var graph = new mxGraph(container);
      new mxHeirarchicalLayout(graph);

      graph.getModel().beginUpdate();
      try {
        parent = graph.getDefaultParent(); 
        var doc = mxUtils.parseXml("temp data, goes here later")
        var decoder = mxCodec(doc)
        var node = doc.documentElement;
        decoder.decode()
      }
      finally {
        graph.getModel().endUpdate();
      }
    }
}