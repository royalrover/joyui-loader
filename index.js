var path = require('path');
var log = require('npmlog');
var loaderUtils = require("loader-utils");
var SourceNode = require("source-map").SourceNode;
var SourceMapConsumer = require("source-map").SourceMapConsumer;
var HEADER = "/*** ADDED BY joyui-loader ***/\n";

module.exports = function(content, sourceMap) {
  if(this.cacheable) this.cacheable();
  var imports = [];
  var postfixes = [];
  var joyui;
  try{
    // 过滤引用的OYUI模块的其他文件
    if(['.less','.css','.tmpl'].indexOf(path.extname(this.resourcePath)) > -1){
      return content;
    }

    this.resourcePath.replace(/joyui\/[^\/]+?\/\d+\.\d+\.\d+/i,function(ui){
      joyui = ui;
    });

    if(joyui && process.joyuis && process.joyuis[joyui]){

      process.joyuis[joyui].forEach(function(ui){
        var value = "require(" + JSON.stringify(ui) + ")";
        imports.push(value + ";");
      });

      var prefix = HEADER + imports.join("\n") + "\n\n";
      var postfix = "\n" + postfixes.join("\n");
      if(sourceMap) {
        var currentRequest = loaderUtils.getCurrentRequest(this);
        var node = SourceNode.fromStringWithSourceMap(content, new SourceMapConsumer(sourceMap));
        node.prepend(prefix);
        node.add(postfix);
        var result = node.toStringWithSourceMap({
          file: currentRequest
        });
        this.callback(null, result.code, result.map.toJSON());
        return;
      }
      return prefix + content + postfix;
    }

    
  }catch(e){
    log.error('spon:webpack: ',e);
    process.exit(1);
  }
  return content;
}