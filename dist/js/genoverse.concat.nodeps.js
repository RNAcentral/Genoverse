/*
  Based on Base.js 1.1a (c) 2006-2010, Dean Edwards
  Updated to pass JSHint and converted into a module by Kenneth Powers
  License: http://www.opensource.org/licenses/mit-license.php
*/
/*global define:true module:true*/
/*jshint eqeqeq:true*/
(function (name, global, definition) {
  if (typeof module !== 'undefined') {
    module.exports = definition();
  } else if (typeof define !== 'undefined' && typeof define.amd === 'object') {
    define(definition);
  } else {
    global[name] = definition();
  }
})('Base', this, function () {
  // Base Object
  var Base = function () {};

  // Implementation
  Base.extend = function (_instance, _static) { // subclass
    var extend = Base.prototype.extend;
    // build the prototype
    Base._prototyping = true;
    var proto = new this();
    extend.call(proto, _instance);
    proto.base = function () {
      // call this method from any other method to invoke that method's ancestor
    };
    delete Base._prototyping;
    // create the wrapper for the constructor function
    //var constructor = proto.constructor.valueOf(); //-dean
    var constructor = proto.constructor;
    var klass = proto.constructor = function () {
        if (!Base._prototyping) {
          if (this._constructing || this.constructor === klass) { // instantiation
            this._constructing = true;
            constructor.apply(this, arguments);
            delete this._constructing;
          } else if (arguments[0] !== null) { // casting
            return (arguments[0].extend || extend).call(arguments[0], proto);
          }
        }
      };
    // build the class interface
    klass.ancestor = this;
    klass.extend = this.extend;
    klass.forEach = this.forEach;
    klass.implement = this.implement;
    klass.prototype = proto;
    klass.toString = this.toString;
    klass.valueOf = function (type) {
      return (type === 'object') ? klass : constructor.valueOf();
    };
    extend.call(klass, _static);
    // class initialization
    if (typeof klass.init === 'function') klass.init();
    return klass;
  };

  Base.prototype = {
    extend: function (source, value) {
      if (arguments.length > 1) { // extending with a name/value pair
        var ancestor = this[source];
        if (ancestor && (typeof value === 'function') && // overriding a method?
        // the valueOf() comparison is to avoid circular references
        (!ancestor.valueOf || ancestor.valueOf() !== value.valueOf()) && /\bbase\b/.test(value)) {
          // get the underlying method
          var method = value.valueOf();
          // override
          value = function () {
            var previous = this.base || Base.prototype.base;
            this.base = ancestor;
            var returnValue = method.apply(this, arguments);
            this.base = previous;
            return returnValue;
          };
          // point to the underlying method
          value.valueOf = function (type) {
            return (type === 'object') ? value : method;
          };
          value.toString = Base.toString;
        }
        this[source] = value;
      } else if (source) { // extending with an object literal
        var extend = Base.prototype.extend;
        // if this object has a customized extend method then use it
        if (!Base._prototyping && typeof this !== 'function') {
          extend = this.extend || extend;
        }
        var proto = {
          toSource: null
        };
        // do the "toString" and other methods manually
        var hidden = ['constructor', 'toString', 'valueOf'];
        // if we are prototyping then include the constructor
        for (var i = Base._prototyping ? 0 : 1; i < hidden.length; i++) {
          var h = hidden[i];
          if (source[h] !== proto[h])
            extend.call(this, h, source[h]);
        }
        // copy each of the source object's properties to this object
        for (var key in source) {
          if (!proto[key]) extend.call(this, key, source[key]);
        }
      }
      return this;
    }
  };

  // initialize
  Base = Base.extend({
    constructor: function () {
      this.extend(arguments[0]);
    }
  }, {
    ancestor: Object,
    version: '1.1',
    forEach: function (object, block, context) {
      for (var key in object) {
        if (this.prototype[key] === undefined) {
          block.call(context, object[key], key, object);
        }
      }
    },
    implement: function () {
      for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === 'function') {
          // if it's a function, call it
          arguments[i](this.prototype);
        } else {
          // add the interface using the extend method
          this.prototype.extend(arguments[i]);
        }
      }
      return this;
    },
    toString: function () {
      return String(this.valueOf());
    }
  });

  // Return Base implementation
  return Base;
});

!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.RTree=e()}}(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}({1:[function(_dereq_,module,exports){"use strict";var rectangle=_dereq_("./rectangle");var bbox=function(ar,obj){if(obj&&obj.bbox){return{leaf:obj,x:obj.bbox[0],y:obj.bbox[1],w:obj.bbox[2]-obj.bbox[0],h:obj.bbox[3]-obj.bbox[1]}}var len=ar.length;var i=0;var a=new Array(len);while(i<len){a[i]=[ar[i][0],ar[i][1]];i++}var first=a[0];len=a.length;i=1;var temp={min:[].concat(first),max:[].concat(first)};while(i<len){if(a[i][0]<temp.min[0]){temp.min[0]=a[i][0]}else if(a[i][0]>temp.max[0]){temp.max[0]=a[i][0]}if(a[i][1]<temp.min[1]){temp.min[1]=a[i][1]}else if(a[i][1]>temp.max[1]){temp.max[1]=a[i][1]}i++}var out={x:temp.min[0],y:temp.min[1],w:temp.max[0]-temp.min[0],h:temp.max[1]-temp.min[1]};if(obj){out.leaf=obj}return out};var geoJSON={};geoJSON.point=function(obj,self){return self.insertSubtree({x:obj.geometry.coordinates[0],y:obj.geometry.coordinates[1],w:0,h:0,leaf:obj},self.root)};geoJSON.multiPointLineString=function(obj,self){return self.insertSubtree(bbox(obj.geometry.coordinates,obj),self.root)};geoJSON.multiLineStringPolygon=function(obj,self){return self.insertSubtree(bbox(Array.prototype.concat.apply([],obj.geometry.coordinates),obj),self.root)};geoJSON.multiPolygon=function(obj,self){return self.insertSubtree(bbox(Array.prototype.concat.apply([],Array.prototype.concat.apply([],obj.geometry.coordinates)),obj),self.root)};geoJSON.makeRec=function(obj){return rectangle(obj.x,obj.y,obj.w,obj.h)};geoJSON.geometryCollection=function(obj,self){if(obj.bbox){return self.insertSubtree({leaf:obj,x:obj.bbox[0],y:obj.bbox[1],w:obj.bbox[2]-obj.bbox[0],h:obj.bbox[3]-obj.bbox[1]},self.root)}var geos=obj.geometry.geometries;var i=0;var len=geos.length;var temp=[];var g;while(i<len){g=geos[i];switch(g.type){case"Point":temp.push(geoJSON.makeRec({x:g.coordinates[0],y:g.coordinates[1],w:0,h:0}));break;case"MultiPoint":temp.push(geoJSON.makeRec(bbox(g.coordinates)));break;case"LineString":temp.push(geoJSON.makeRec(bbox(g.coordinates)));break;case"MultiLineString":temp.push(geoJSON.makeRec(bbox(Array.prototype.concat.apply([],g.coordinates))));break;case"Polygon":temp.push(geoJSON.makeRec(bbox(Array.prototype.concat.apply([],g.coordinates))));break;case"MultiPolygon":temp.push(geoJSON.makeRec(bbox(Array.prototype.concat.apply([],Array.prototype.concat.apply([],g.coordinates)))));break;case"GeometryCollection":geos=geos.concat(g.geometries);len=geos.length;break}i++}var first=temp[0];i=1;len=temp.length;while(i<len){first.expand(temp[i]);i++}return self.insertSubtree({leaf:obj,x:first.x(),y:first.y(),h:first.h(),w:first.w()},self.root)};exports.geoJSON=function(prelim){var that=this;var features,feature;if(Array.isArray(prelim)){features=prelim.slice()}else if(prelim.features&&Array.isArray(prelim.features)){features=prelim.features.slice()}else if(prelim instanceof Object){features=[prelim]}else{throw"this isn't what we're looking for"}var len=features.length;var i=0;while(i<len){feature=features[i];if(feature.type==="Feature"){switch(feature.geometry.type){case"Point":geoJSON.point(feature,that);break;case"MultiPoint":geoJSON.multiPointLineString(feature,that);break;case"LineString":geoJSON.multiPointLineString(feature,that);break;case"MultiLineString":geoJSON.multiLineStringPolygon(feature,that);break;case"Polygon":geoJSON.multiLineStringPolygon(feature,that);break;case"MultiPolygon":geoJSON.multiPolygon(feature,that);break;case"GeometryCollection":geoJSON.geometryCollection(feature,that);break}}i++}};exports.bbox=function(){var x1,y1,x2,y2;switch(arguments.length){case 1:x1=arguments[0][0][0];y1=arguments[0][0][1];x2=arguments[0][1][0];y2=arguments[0][1][1];break;case 2:x1=arguments[0][0];y1=arguments[0][1];x2=arguments[1][0];y2=arguments[1][1];break;case 4:x1=arguments[0];y1=arguments[1];x2=arguments[2];y2=arguments[3];break}return this.search({x:x1,y:y1,w:x2-x1,h:y2-y1})}},{"./rectangle":3}],2:[function(_dereq_,module,exports){"use strict";var RTree=_dereq_("./rtree");var geojson=_dereq_("./geojson");RTree.prototype.bbox=geojson.bbox;RTree.prototype.geoJSON=geojson.geoJSON;RTree.Rectangle=_dereq_("./rectangle");module.exports=RTree},{"./geojson":1,"./rectangle":3,"./rtree":4}],3:[function(_dereq_,module,exports){"use strict";function Rectangle(x,y,w,h){if(!(this instanceof Rectangle)){return new Rectangle(x,y,w,h)}var x2,y2,p;if(x.x){w=x.w;h=x.h;y=x.y;if(x.w!==0&&!x.w&&x.x2){w=x.x2-x.x;h=x.y2-x.y}else{w=x.w;h=x.h}x=x.x;x2=x+w;y2=y+h;p=h+w?false:true}else{x2=x+w;y2=y+h;p=h+w?false:true}this.x1=this.x=function(){return x};this.y1=this.y=function(){return y};this.x2=function(){return x2};this.y2=function(){return y2};this.w=function(){return w};this.h=function(){return h};this.p=function(){return p};this.overlap=function(a){if(p||a.p()){return x<=a.x2()&&x2>=a.x()&&y<=a.y2()&&y2>=a.y()}return x<a.x2()&&x2>a.x()&&y<a.y2()&&y2>a.y()};this.expand=function(a){var nx,ny;var ax=a.x();var ay=a.y();var ax2=a.x2();var ay2=a.y2();if(x>ax){nx=ax}else{nx=x}if(y>ay){ny=ay}else{ny=y}if(x2>ax2){w=x2-nx}else{w=ax2-nx}if(y2>ay2){h=y2-ny}else{h=ay2-ny}x=nx;y=ny;return this}}Rectangle.overlapRectangle=function(a,b){if(a.h===0&&a.w===0||b.h===0&&b.w===0){return a.x<=b.x+b.w&&a.x+a.w>=b.x&&a.y<=b.y+b.h&&a.y+a.h>=b.y}else{return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}};Rectangle.containsRectangle=function(a,b){return a.x+a.w<=b.x+b.w&&a.x>=b.x&&a.y+a.h<=b.y+b.h&&a.y>=b.y};Rectangle.expandRectangle=function(a,b){var nx,ny;var axw=a.x+a.w;var bxw=b.x+b.w;var ayh=a.y+a.h;var byh=b.y+b.h;if(a.x>b.x){nx=b.x}else{nx=a.x}if(a.y>b.y){ny=b.y}else{ny=a.y}if(axw>bxw){a.w=axw-nx}else{a.w=bxw-nx}if(ayh>byh){a.h=ayh-ny}else{a.h=byh-ny}a.x=nx;a.y=ny;return a};Rectangle.makeMBR=function(nodes,rect){if(!nodes.length){return{x:0,y:0,w:0,h:0}}rect=rect||{};rect.x=nodes[0].x;rect.y=nodes[0].y;rect.w=nodes[0].w;rect.h=nodes[0].h;for(var i=1,len=nodes.length;i<len;i++){Rectangle.expandRectangle(rect,nodes[i])}return rect};Rectangle.squarifiedRatio=function(l,w,fill){var lperi=(l+w)/2;var larea=l*w;var lgeo=larea/(lperi*lperi);return larea*fill/lgeo};module.exports=Rectangle},{}],4:[function(_dereq_,module,exports){"use strict";var rectangle=_dereq_("./rectangle");function RTree(width){if(!(this instanceof RTree)){return new RTree(width)}var minWidth=3;var maxWidth=6;if(!isNaN(width)){minWidth=Math.floor(width/2);maxWidth=width}var rootTree={x:0,y:0,w:0,h:0,id:"root",nodes:[]};this.root=rootTree;var flatten=function(tree){var todo=tree.slice();var done=[];var current;while(todo.length){current=todo.pop();if(current.nodes){todo=todo.concat(current.nodes)}else if(current.leaf){done.push(current)}}return done};var removeSubtree=function(rect,obj,root){var hitStack=[];var countStack=[];var retArray=[];var currentDepth=1;var tree,i,ltree;if(!rect||!rectangle.overlapRectangle(rect,root)){return retArray}var retObj={x:rect.x,y:rect.y,w:rect.w,h:rect.h,target:obj};countStack.push(root.nodes.length);hitStack.push(root);while(hitStack.length>0){tree=hitStack.pop();i=countStack.pop()-1;if("target"in retObj){while(i>=0){ltree=tree.nodes[i];if(rectangle.overlapRectangle(retObj,ltree)){if(retObj.target&&"leaf"in ltree&&ltree.leaf===retObj.target||!retObj.target&&("leaf"in ltree||rectangle.containsRectangle(ltree,retObj))){if("nodes"in ltree){retArray=flatten(tree.nodes.splice(i,1))}else{retArray=tree.nodes.splice(i,1)}rectangle.makeMBR(tree.nodes,tree);delete retObj.target;break}else if("nodes"in ltree){currentDepth++;countStack.push(i);hitStack.push(tree);tree=ltree;i=ltree.nodes.length}}i--}}else if("nodes"in retObj){tree.nodes.splice(i+1,1);if(tree.nodes.length>0){rectangle.makeMBR(tree.nodes,tree)}for(var t=0;t<retObj.nodes.length;t++){insertSubtree(retObj.nodes[t],tree)}retObj.nodes=[];if(hitStack.length===0&&tree.nodes.length<=1){retObj.nodes=searchSubtree(tree,true,retObj.nodes,tree);tree.nodes=[];hitStack.push(tree);countStack.push(1)}else if(hitStack.length>0&&tree.nodes.length<minWidth){retObj.nodes=searchSubtree(tree,true,retObj.nodes,tree);tree.nodes=[]}else{delete retObj.nodes}}else{rectangle.makeMBR(tree.nodes,tree)}currentDepth-=1}return retArray};var chooseLeafSubtree=function(rect,root){var bestChoiceIndex=-1;var bestChoiceStack=[];var bestChoiceArea;var first=true;bestChoiceStack.push(root);var nodes=root.nodes;while(first||bestChoiceIndex!==-1){if(first){first=false}else{bestChoiceStack.push(nodes[bestChoiceIndex]);nodes=nodes[bestChoiceIndex].nodes;bestChoiceIndex=-1}for(var i=nodes.length-1;i>=0;i--){var ltree=nodes[i];if("leaf"in ltree){bestChoiceIndex=-1;break}var oldLRatio=rectangle.squarifiedRatio(ltree.w,ltree.h,ltree.nodes.length+1);var nw=Math.max(ltree.x+ltree.w,rect.x+rect.w)-Math.min(ltree.x,rect.x);var nh=Math.max(ltree.y+ltree.h,rect.y+rect.h)-Math.min(ltree.y,rect.y);var lratio=rectangle.squarifiedRatio(nw,nh,ltree.nodes.length+2);if(bestChoiceIndex<0||Math.abs(lratio-oldLRatio)<bestChoiceArea){bestChoiceArea=Math.abs(lratio-oldLRatio);bestChoiceIndex=i}}}return bestChoiceStack};var linearSplit=function(nodes){var n=pickLinear(nodes);while(nodes.length>0){pickNext(nodes,n[0],n[1])}return n};var pickNext=function(nodes,a,b){var areaA=rectangle.squarifiedRatio(a.w,a.h,a.nodes.length+1);var areaB=rectangle.squarifiedRatio(b.w,b.h,b.nodes.length+1);var highAreaDelta;var highAreaNode;var lowestGrowthGroup;for(var i=nodes.length-1;i>=0;i--){var l=nodes[i];var newAreaA={};newAreaA.x=Math.min(a.x,l.x);newAreaA.y=Math.min(a.y,l.y);newAreaA.w=Math.max(a.x+a.w,l.x+l.w)-newAreaA.x;newAreaA.h=Math.max(a.y+a.h,l.y+l.h)-newAreaA.y;var changeNewAreaA=Math.abs(rectangle.squarifiedRatio(newAreaA.w,newAreaA.h,a.nodes.length+2)-areaA);var newAreaB={};newAreaB.x=Math.min(b.x,l.x);newAreaB.y=Math.min(b.y,l.y);newAreaB.w=Math.max(b.x+b.w,l.x+l.w)-newAreaB.x;newAreaB.h=Math.max(b.y+b.h,l.y+l.h)-newAreaB.y;var changeNewAreaB=Math.abs(rectangle.squarifiedRatio(newAreaB.w,newAreaB.h,b.nodes.length+2)-areaB);if(!highAreaNode||!highAreaDelta||Math.abs(changeNewAreaB-changeNewAreaA)<highAreaDelta){highAreaNode=i;highAreaDelta=Math.abs(changeNewAreaB-changeNewAreaA);lowestGrowthGroup=changeNewAreaB<changeNewAreaA?b:a}}var tempNode=nodes.splice(highAreaNode,1)[0];if(a.nodes.length+nodes.length+1<=minWidth){a.nodes.push(tempNode);rectangle.expandRectangle(a,tempNode)}else if(b.nodes.length+nodes.length+1<=minWidth){b.nodes.push(tempNode);rectangle.expandRectangle(b,tempNode)}else{lowestGrowthGroup.nodes.push(tempNode);rectangle.expandRectangle(lowestGrowthGroup,tempNode)}};var pickLinear=function(nodes){var lowestHighX=nodes.length-1;var highestLowX=0;var lowestHighY=nodes.length-1;var highestLowY=0;var t1,t2;for(var i=nodes.length-2;i>=0;i--){var l=nodes[i];if(l.x>nodes[highestLowX].x){highestLowX=i}else if(l.x+l.w<nodes[lowestHighX].x+nodes[lowestHighX].w){lowestHighX=i}if(l.y>nodes[highestLowY].y){highestLowY=i}else if(l.y+l.h<nodes[lowestHighY].y+nodes[lowestHighY].h){lowestHighY=i}}var dx=Math.abs(nodes[lowestHighX].x+nodes[lowestHighX].w-nodes[highestLowX].x);var dy=Math.abs(nodes[lowestHighY].y+nodes[lowestHighY].h-nodes[highestLowY].y);if(dx>dy){if(lowestHighX>highestLowX){t1=nodes.splice(lowestHighX,1)[0];t2=nodes.splice(highestLowX,1)[0]}else{t2=nodes.splice(highestLowX,1)[0];t1=nodes.splice(lowestHighX,1)[0]}}else{if(lowestHighY>highestLowY){t1=nodes.splice(lowestHighY,1)[0];t2=nodes.splice(highestLowY,1)[0]}else{t2=nodes.splice(highestLowY,1)[0];t1=nodes.splice(lowestHighY,1)[0]}}return[{x:t1.x,y:t1.y,w:t1.w,h:t1.h,nodes:[t1]},{x:t2.x,y:t2.y,w:t2.w,h:t2.h,nodes:[t2]}]};var attachData=function(node,moreTree){node.nodes=moreTree.nodes;node.x=moreTree.x;node.y=moreTree.y;node.w=moreTree.w;node.h=moreTree.h;return node};var searchSubtree=function(rect,returnNode,returnArray,root){var hitStack=[];if(!rectangle.overlapRectangle(rect,root)){return returnArray}hitStack.push(root.nodes);while(hitStack.length>0){var nodes=hitStack.pop();for(var i=nodes.length-1;i>=0;i--){var ltree=nodes[i];if(rectangle.overlapRectangle(rect,ltree)){if("nodes"in ltree){hitStack.push(ltree.nodes)}else if("leaf"in ltree){if(!returnNode){returnArray.push(ltree.leaf)}else{returnArray.push(ltree)}}}}}return returnArray};var insertSubtree=function(node,root){var bc;if(root.nodes.length===0){root.x=node.x;root.y=node.y;root.w=node.w;root.h=node.h;root.nodes.push(node);return}var treeStack=chooseLeafSubtree(node,root);var retObj=node;var pbc;while(treeStack.length>0){if(bc&&"nodes"in bc&&bc.nodes.length===0){pbc=bc;bc=treeStack.pop();for(var t=0;t<bc.nodes.length;t++){if(bc.nodes[t]===pbc||bc.nodes[t].nodes.length===0){bc.nodes.splice(t,1);break}}}else{bc=treeStack.pop()}if("leaf"in retObj||"nodes"in retObj||Array.isArray(retObj)){if(Array.isArray(retObj)){for(var ai=0;ai<retObj.length;ai++){rectangle.expandRectangle(bc,retObj[ai])}bc.nodes=bc.nodes.concat(retObj)}else{rectangle.expandRectangle(bc,retObj);bc.nodes.push(retObj)}if(bc.nodes.length<=maxWidth){retObj={x:bc.x,y:bc.y,w:bc.w,h:bc.h}}else{var a=linearSplit(bc.nodes);retObj=a;if(treeStack.length<1){bc.nodes.push(a[0]);treeStack.push(bc);retObj=a[1]}}}else{rectangle.expandRectangle(bc,retObj);retObj={x:bc.x,y:bc.y,w:bc.w,h:bc.h}}}};this.insertSubtree=insertSubtree;this.getTree=function(){return rootTree};this.setTree=function(newTree,where){if(!where){where=rootTree}return attachData(where,newTree)};this.search=function(rect,returnNode,returnArray){returnArray=returnArray||[];return searchSubtree(rect,returnNode,returnArray,rootTree)};var removeArea=function(rect){var numberDeleted=1,retArray=[],deleted;while(numberDeleted>0){deleted=removeSubtree(rect,false,rootTree);numberDeleted=deleted.length;retArray=retArray.concat(deleted)}return retArray};var removeObj=function(rect,obj){var retArray=removeSubtree(rect,obj,rootTree);return retArray};this.remove=function(rect,obj){if(!obj||typeof obj==="function"){return removeArea(rect,obj)}else{return removeObj(rect,obj)}};this.insert=function(rect,obj){var retArray=insertSubtree({x:rect.x,y:rect.y,w:rect.w,h:rect.h,leaf:obj},rootTree);return retArray}}RTree.prototype.toJSON=function(printing){return JSON.stringify(this.root,false,printing)};RTree.fromJSON=function(json){var rt=new RTree;rt.setTree(JSON.parse(json));return rt};module.exports=RTree;if(typeof Array.isArray!=="function"){Array.isArray=function(a){return typeof a==="object"&&{}.toString.call(a)==="[object Array]"}}},{"./rectangle":3}]},{},[2])(2)});
(function(){function C(){}function A(){this.was=[0]}function B(a,b,c){this.hufts=new Int32Array(4320);this.window=new Uint8Array(c);this.end=c;this.checkfn=b;this.mode=0;this.reset(a,null);this.index=this.table=this.left=0;this.blens=null;this.bb=new Int32Array(1);this.tb=new Int32Array(1);this.codes=new D;this.check=this.write=this.read=this.bitb=this.bitk=this.last=0;this.inftree=new E}function D(){}function E(){}function y(a,b,c,d,h){if(0!=h){if(!a)throw"Undef src";if(!c)throw"Undef dest";if(0==
b&&h==a.length)c.set(a,d);else if(T)a=a.subarray(b,b+h),c.set(a,d);else if(1==a.BYTES_PER_ELEMENT&&100<h)a=new Uint8Array(a.buffer,a.byteOffset+b,h),c.set(a,d);else for(var f=0;f<h;++f)c[d+f]=a[b+f]}}function J(a,b,c,d){a=b?c?new Uint8Array(a,b,c):new Uint8Array(a,b,a.byteLength-b):new Uint8Array(a);c=new C;c.inflateInit(15,!0);c.next_in=a;c.next_in_index=0;c.avail_in=a.length;a=[];for(var h=0;;){var f=new Uint8Array(32E3);c.next_out=f;c.next_out_index=0;c.avail_out=f.length;var g=c.inflate(0);if(0!=
g&&1!=g&&-5!=g)throw c.msg;if(0!=c.avail_out){var e=new Uint8Array(f.length-c.avail_out);y(f,0,e,0,f.length-c.avail_out);f=e}a.push(f);h+=f.length;if(1==g||-5==g)break}d&&(d[0]=(b||0)+c.next_in_index);if(1==a.length)return a[0].buffer;b=new Uint8Array(h);for(c=d=0;c<a.length;++c)h=a[c],y(h,0,b,d,h.length),d+=h.length;return b.buffer}function K(a,b){this.block=a;this.offset=b}function G(a,b,c){var d=4294967296*(a[b+6]&255)+16777216*(a[b+5]&255)+65536*(a[b+4]&255)+256*(a[b+3]&255)+(a[b+2]&255);a=a[b+
1]<<8|a[b];return 0!=d||0!=a||c?new K(d,a):null}function L(a,b){b=Math.min(b||1,a.byteLength-50);for(var c=[],d=[0],h=0;d[0]<b;){var f=new Uint8Array(a,d[0],12),f=f[11]<<8|f[10],f=J(a,12+f+d[0],Math.min(65536,a.byteLength-12-f-d[0]),d);d[0]+=8;h+=f.byteLength;c.push(f)}if(1==c.length)return c[0];d=new Uint8Array(h);for(f=h=0;f<c.length;++f){var g=new Uint8Array(c[f]);y(g,0,d,h,g.length);h+=g.length}return d.buffer}function M(a,b){this.minv=a;this.maxv=b}function U(a,b){var c,d=[];--b;d.push(0);for(c=
1+(a>>26);c<=1+(b>>26);++c)d.push(c);for(c=9+(a>>23);c<=9+(b>>23);++c)d.push(c);for(c=73+(a>>20);c<=73+(b>>20);++c)d.push(c);for(c=585+(a>>17);c<=585+(b>>17);++c)d.push(c);for(c=4681+(a>>14);c<=4681+(b>>14);++c)d.push(c);return d}function F(a){this.blob=a}function z(a,b,c,d){d||("object"===typeof b?(d=b,b=void 0):d={});this.url=a;this.start=b||0;c&&(this.end=c);this.opts=d}function N(a){if(!a)return null;for(var b=new Uint8Array(a.length),c=0;c<b.length;++c)b[c]=a.charCodeAt(c);return b.buffer}function O(a,
b){var c=new ArrayBuffer(8),d=new Uint8Array(c),c=new Float32Array(c);d[0]=a[b];d[1]=a[b+1];d[2]=a[b+2];d[3]=a[b+3];return c[0]}function t(a,b){return a[b+3]<<24|a[b+2]<<16|a[b+1]<<8|a[b]}function P(a,b){return a[b+1]<<8|a[b]}function V(a,b){return a[b]}function H(){}function Q(a,b,c,d,h){function f(a){if(!a)return d(null,"Couldn't access BAM");a=L(a,a.byteLength);a=new Uint8Array(a);var b=t(a,0);if(21840194!=b)return d(null,"Not a BAM file, magic=0x"+b.toString(16));for(var c=t(a,4),e="",b=0;b<c;++b)e+=
String.fromCharCode(a[b+8]);e=t(a,c+8);c+=12;g.chrToIndex={};g.indexToChr=[];for(b=0;b<e;++b){for(var f=t(a,c),h="",k=0;k<f-1;++k)h+=String.fromCharCode(a[c+4+k]);t(a,c+f+4);g.chrToIndex[h]=b;0==h.indexOf("chr")?g.chrToIndex[h.substring(3)]=b:g.chrToIndex["chr"+h]=b;g.indexToChr.push(h);c=c+8+f}if(g.indices)return d(g)}var g=new H;g.data=a;g.bai=b;g.indexChunks=c;var e=g.indexChunks?g.indexChunks.minBlockIndex:1E9;if(g.indexChunks){b=g.indexChunks.chunks;g.indices=[];for(var k=0;k<b.length;k++)g.indices[k]=
null;g.data.slice(0,e).fetch(f)}else g.bai.fetch(function(b){var k,q,n;if(b){var l=new Uint8Array(b),u=t(l,0);if(21578050!=u)b=d(null,"Not a BAI file, magic=0x"+u.toString(16));else{u=t(l,4);g.indices=[];for(var s=8,w=0;w<u;++w){var I=s;k=l;var r=n=I;q=t(k,r);for(var r=r+4,v=0;v<q;++v){t(k,r);var x=t(k,r+4),r=r+(8+16*x)}for(var v=t(k,r),r=r+4,x=1E9,y=r,A=0;A<v;++A){var z=G(k,y),y=y+8;if(z){k=z.block;0<z.offset&&(k+=65536);k<x&&(x=k);break}}r+=8*v;k=x;n=r-n;s+=n;e=Math.min(k,e);0<q&&(g.indices[w]=
new Uint8Array(b,I,s-I))}b=!0}}else b="Couldn't access BAI";!0!==b?g.bai.url&&"undefined"===typeof h?(g.bai.url=g.data.url.replace(/.bam$/,".bai"),Q(a,g.bai,c,d,!0)):d(null,b):g.data.slice(0,e).fetch(f)})}function W(){}var x=[0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535],X=[96,7,256,0,8,80,0,8,16,84,8,115,82,7,31,0,8,112,0,8,48,0,9,192,80,7,10,0,8,96,0,8,32,0,9,160,0,8,0,0,8,128,0,8,64,0,9,224,80,7,6,0,8,88,0,8,24,0,9,144,83,7,59,0,8,120,0,8,56,0,9,208,81,7,17,0,8,104,0,8,40,
0,9,176,0,8,8,0,8,136,0,8,72,0,9,240,80,7,4,0,8,84,0,8,20,85,8,227,83,7,43,0,8,116,0,8,52,0,9,200,81,7,13,0,8,100,0,8,36,0,9,168,0,8,4,0,8,132,0,8,68,0,9,232,80,7,8,0,8,92,0,8,28,0,9,152,84,7,83,0,8,124,0,8,60,0,9,216,82,7,23,0,8,108,0,8,44,0,9,184,0,8,12,0,8,140,0,8,76,0,9,248,80,7,3,0,8,82,0,8,18,85,8,163,83,7,35,0,8,114,0,8,50,0,9,196,81,7,11,0,8,98,0,8,34,0,9,164,0,8,2,0,8,130,0,8,66,0,9,228,80,7,7,0,8,90,0,8,26,0,9,148,84,7,67,0,8,122,0,8,58,0,9,212,82,7,19,0,8,106,0,8,42,0,9,180,0,8,10,0,8,
138,0,8,74,0,9,244,80,7,5,0,8,86,0,8,22,192,8,0,83,7,51,0,8,118,0,8,54,0,9,204,81,7,15,0,8,102,0,8,38,0,9,172,0,8,6,0,8,134,0,8,70,0,9,236,80,7,9,0,8,94,0,8,30,0,9,156,84,7,99,0,8,126,0,8,62,0,9,220,82,7,27,0,8,110,0,8,46,0,9,188,0,8,14,0,8,142,0,8,78,0,9,252,96,7,256,0,8,81,0,8,17,85,8,131,82,7,31,0,8,113,0,8,49,0,9,194,80,7,10,0,8,97,0,8,33,0,9,162,0,8,1,0,8,129,0,8,65,0,9,226,80,7,6,0,8,89,0,8,25,0,9,146,83,7,59,0,8,121,0,8,57,0,9,210,81,7,17,0,8,105,0,8,41,0,9,178,0,8,9,0,8,137,0,8,73,0,9,242,
80,7,4,0,8,85,0,8,21,80,8,258,83,7,43,0,8,117,0,8,53,0,9,202,81,7,13,0,8,101,0,8,37,0,9,170,0,8,5,0,8,133,0,8,69,0,9,234,80,7,8,0,8,93,0,8,29,0,9,154,84,7,83,0,8,125,0,8,61,0,9,218,82,7,23,0,8,109,0,8,45,0,9,186,0,8,13,0,8,141,0,8,77,0,9,250,80,7,3,0,8,83,0,8,19,85,8,195,83,7,35,0,8,115,0,8,51,0,9,198,81,7,11,0,8,99,0,8,35,0,9,166,0,8,3,0,8,131,0,8,67,0,9,230,80,7,7,0,8,91,0,8,27,0,9,150,84,7,67,0,8,123,0,8,59,0,9,214,82,7,19,0,8,107,0,8,43,0,9,182,0,8,11,0,8,139,0,8,75,0,9,246,80,7,5,0,8,87,0,8,
23,192,8,0,83,7,51,0,8,119,0,8,55,0,9,206,81,7,15,0,8,103,0,8,39,0,9,174,0,8,7,0,8,135,0,8,71,0,9,238,80,7,9,0,8,95,0,8,31,0,9,158,84,7,99,0,8,127,0,8,63,0,9,222,82,7,27,0,8,111,0,8,47,0,9,190,0,8,15,0,8,143,0,8,79,0,9,254,96,7,256,0,8,80,0,8,16,84,8,115,82,7,31,0,8,112,0,8,48,0,9,193,80,7,10,0,8,96,0,8,32,0,9,161,0,8,0,0,8,128,0,8,64,0,9,225,80,7,6,0,8,88,0,8,24,0,9,145,83,7,59,0,8,120,0,8,56,0,9,209,81,7,17,0,8,104,0,8,40,0,9,177,0,8,8,0,8,136,0,8,72,0,9,241,80,7,4,0,8,84,0,8,20,85,8,227,83,7,43,
0,8,116,0,8,52,0,9,201,81,7,13,0,8,100,0,8,36,0,9,169,0,8,4,0,8,132,0,8,68,0,9,233,80,7,8,0,8,92,0,8,28,0,9,153,84,7,83,0,8,124,0,8,60,0,9,217,82,7,23,0,8,108,0,8,44,0,9,185,0,8,12,0,8,140,0,8,76,0,9,249,80,7,3,0,8,82,0,8,18,85,8,163,83,7,35,0,8,114,0,8,50,0,9,197,81,7,11,0,8,98,0,8,34,0,9,165,0,8,2,0,8,130,0,8,66,0,9,229,80,7,7,0,8,90,0,8,26,0,9,149,84,7,67,0,8,122,0,8,58,0,9,213,82,7,19,0,8,106,0,8,42,0,9,181,0,8,10,0,8,138,0,8,74,0,9,245,80,7,5,0,8,86,0,8,22,192,8,0,83,7,51,0,8,118,0,8,54,0,9,
205,81,7,15,0,8,102,0,8,38,0,9,173,0,8,6,0,8,134,0,8,70,0,9,237,80,7,9,0,8,94,0,8,30,0,9,157,84,7,99,0,8,126,0,8,62,0,9,221,82,7,27,0,8,110,0,8,46,0,9,189,0,8,14,0,8,142,0,8,78,0,9,253,96,7,256,0,8,81,0,8,17,85,8,131,82,7,31,0,8,113,0,8,49,0,9,195,80,7,10,0,8,97,0,8,33,0,9,163,0,8,1,0,8,129,0,8,65,0,9,227,80,7,6,0,8,89,0,8,25,0,9,147,83,7,59,0,8,121,0,8,57,0,9,211,81,7,17,0,8,105,0,8,41,0,9,179,0,8,9,0,8,137,0,8,73,0,9,243,80,7,4,0,8,85,0,8,21,80,8,258,83,7,43,0,8,117,0,8,53,0,9,203,81,7,13,0,8,101,
0,8,37,0,9,171,0,8,5,0,8,133,0,8,69,0,9,235,80,7,8,0,8,93,0,8,29,0,9,155,84,7,83,0,8,125,0,8,61,0,9,219,82,7,23,0,8,109,0,8,45,0,9,187,0,8,13,0,8,141,0,8,77,0,9,251,80,7,3,0,8,83,0,8,19,85,8,195,83,7,35,0,8,115,0,8,51,0,9,199,81,7,11,0,8,99,0,8,35,0,9,167,0,8,3,0,8,131,0,8,67,0,9,231,80,7,7,0,8,91,0,8,27,0,9,151,84,7,67,0,8,123,0,8,59,0,9,215,82,7,19,0,8,107,0,8,43,0,9,183,0,8,11,0,8,139,0,8,75,0,9,247,80,7,5,0,8,87,0,8,23,192,8,0,83,7,51,0,8,119,0,8,55,0,9,207,81,7,15,0,8,103,0,8,39,0,9,175,0,8,
7,0,8,135,0,8,71,0,9,239,80,7,9,0,8,95,0,8,31,0,9,159,84,7,99,0,8,127,0,8,63,0,9,223,82,7,27,0,8,111,0,8,47,0,9,191,0,8,15,0,8,143,0,8,79,0,9,255],Y=[80,5,1,87,5,257,83,5,17,91,5,4097,81,5,5,89,5,1025,85,5,65,93,5,16385,80,5,3,88,5,513,84,5,33,92,5,8193,82,5,9,90,5,2049,86,5,129,192,5,24577,80,5,2,87,5,385,83,5,25,91,5,6145,81,5,7,89,5,1537,85,5,97,93,5,24577,80,5,4,88,5,769,84,5,49,92,5,12289,82,5,13,90,5,3073,86,5,193,192,5,24577],Z=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,
115,131,163,195,227,258,0,0],aa=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,112,112],ba=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],ca=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];C.prototype.inflateInit=function(a,b){a||(a=15);b&&(b=!1);this.istate=new A;return this.istate.inflateInit(this,b?-a:a)};C.prototype.inflate=function(a){return null==this.istate?-2:this.istate.inflate(this,a)};C.prototype.inflateEnd=
function(){if(null==this.istate)return-2;var a=istate.inflateEnd(this);this.istate=null;return a};C.prototype.inflateSync=function(){return istate.inflateSync(this)};C.prototype.inflateSetDictionary=function(a,b){return istate.inflateSetDictionary(this,a,b)};A.prototype.inflateReset=function(a){if(null==a||null==a.istate)return-2;a.total_in=a.total_out=0;a.msg=null;a.istate.mode=0!=a.istate.nowrap?7:0;a.istate.blocks.reset(a,null);return 0};A.prototype.inflateEnd=function(a){null!=this.blocks&&this.blocks.free(a);
this.blocks=null;return 0};A.prototype.inflateInit=function(a,b){this.blocks=a.msg=null;nowrap=0;0>b&&(b=-b,nowrap=1);if(8>b||15<b)return this.inflateEnd(a),-2;this.wbits=b;a.istate.blocks=new B(a,0!=a.istate.nowrap?null:this,1<<b);this.inflateReset(a);return 0};A.prototype.inflate=function(a,b){var c,d;if(null==a||null==a.istate||null==a.next_in)return-2;b=4==b?-5:0;for(c=-5;;)switch(a.istate.mode){case 0:if(0==a.avail_in)return c;c=b;a.avail_in--;a.total_in++;if(8!=((a.istate.method=a.next_in[a.next_in_index++])&
15)){a.istate.mode=13;a.msg="unknown compression method";a.istate.marker=5;break}if((a.istate.method>>4)+8>a.istate.wbits){a.istate.mode=13;a.msg="invalid window size";a.istate.marker=5;break}a.istate.mode=1;case 1:if(0==a.avail_in)return c;c=b;a.avail_in--;a.total_in++;d=a.next_in[a.next_in_index++]&255;if(0!=((a.istate.method<<8)+d)%31){a.istate.mode=13;a.msg="incorrect header check";a.istate.marker=5;break}if(0==(d&32)){a.istate.mode=7;break}a.istate.mode=2;case 2:if(0==a.avail_in)return c;c=b;
a.avail_in--;a.total_in++;a.istate.need=(a.next_in[a.next_in_index++]&255)<<24&4278190080;a.istate.mode=3;case 3:if(0==a.avail_in)return c;c=b;a.avail_in--;a.total_in++;a.istate.need+=(a.next_in[a.next_in_index++]&255)<<16&16711680;a.istate.mode=4;case 4:if(0==a.avail_in)return c;c=b;a.avail_in--;a.total_in++;a.istate.need+=(a.next_in[a.next_in_index++]&255)<<8&65280;a.istate.mode=5;case 5:if(0==a.avail_in)return c;a.avail_in--;a.total_in++;a.istate.need+=a.next_in[a.next_in_index++]&255;a.adler=
a.istate.need;a.istate.mode=6;return 2;case 6:return a.istate.mode=13,a.msg="need dictionary",a.istate.marker=0,-2;case 7:c=a.istate.blocks.proc(a,c);if(-3==c){a.istate.mode=13;a.istate.marker=0;break}0==c&&(c=b);if(1!=c)return c;c=b;a.istate.blocks.reset(a,a.istate.was);if(0!=a.istate.nowrap){a.istate.mode=12;break}a.istate.mode=8;case 8:if(0==a.avail_in)return c;c=b;a.avail_in--;a.total_in++;a.istate.need=(a.next_in[a.next_in_index++]&255)<<24&4278190080;a.istate.mode=9;case 9:if(0==a.avail_in)return c;
c=b;a.avail_in--;a.total_in++;a.istate.need+=(a.next_in[a.next_in_index++]&255)<<16&16711680;a.istate.mode=10;case 10:if(0==a.avail_in)return c;c=b;a.avail_in--;a.total_in++;a.istate.need+=(a.next_in[a.next_in_index++]&255)<<8&65280;a.istate.mode=11;case 11:if(0==a.avail_in)return c;c=b;a.avail_in--;a.total_in++;a.istate.need+=a.next_in[a.next_in_index++]&255;if(a.istate.was[0]!=a.istate.need){a.istate.mode=13;a.msg="incorrect data check";a.istate.marker=5;break}a.istate.mode=12;case 12:return 1;
case 13:return-3;default:return-2}};A.prototype.inflateSetDictionary=function(a,b,c){var d=0,h=c;if(null==a||null==a.istate||6!=a.istate.mode)return-2;if(a._adler.adler32(1,b,0,c)!=a.adler)return-3;a.adler=a._adler.adler32(0,null,0,0);h>=1<<a.istate.wbits&&(h=(1<<a.istate.wbits)-1,d=c-h);a.istate.blocks.set_dictionary(b,d,h);a.istate.mode=7;return 0};var da=[0,0,255,255];A.prototype.inflateSync=function(a){var b,c,d;if(null==a||null==a.istate)return-2;13!=a.istate.mode&&(a.istate.mode=13,a.istate.marker=
0);if(0==(b=a.avail_in))return-5;c=a.next_in_index;for(d=a.istate.marker;0!=b&&4>d;)a.next_in[c]==da[d]?d++:d=0!=a.next_in[c]?0:4-d,c++,b--;a.total_in+=c-a.next_in_index;a.next_in_index=c;a.avail_in=b;a.istate.marker=d;if(4!=d)return-3;b=a.total_in;c=a.total_out;this.inflateReset(a);a.total_in=b;a.total_out=c;a.istate.mode=7;return 0};A.prototype.inflateSyncPoint=function(a){return null==a||null==a.istate||null==a.istate.blocks?-2:a.istate.blocks.sync_point()};var R=[16,17,18,0,8,7,9,6,10,5,11,4,
12,3,13,2,14,1,15];B.prototype.reset=function(a,b){b&&(b[0]=this.check);6==this.mode&&this.codes.free(a);this.read=this.write=this.bitb=this.bitk=this.mode=0;this.checkfn&&(a.adler=this.check=a._adler.adler32(0,null,0,0))};B.prototype.proc=function(a,b){var c,d,h,f,g,e,k;f=a.next_in_index;g=a.avail_in;d=this.bitb;h=this.bitk;e=this.write;for(k=e<this.read?this.read-e-1:this.end-e;;)switch(this.mode){case 0:for(;3>h;){if(0!=g)b=0;else return this.bitb=d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,
a.next_in_index=f,this.write=e,this.inflate_flush(a,b);g--;d|=(a.next_in[f++]&255)<<h;h+=8}c=d&7;this.last=c&1;switch(c>>>1){case 0:d>>>=3;h-=3;c=h&7;d>>>=c;h-=c;this.mode=1;break;case 1:var m=new Int32Array(1),p=new Int32Array(1),q=[],n=[];c=p;var l=q,u=n;m[0]=9;c[0]=5;l[0]=X;u[0]=Y;this.codes.init(m[0],p[0],q[0],0,n[0],0,a);d>>>=3;h-=3;this.mode=6;break;case 2:d>>>=3;h-=3;this.mode=3;break;case 3:return d>>>=3,h-=3,this.mode=13,a.msg="invalid block type",b=-3,this.bitb=d,this.bitk=h,a.avail_in=
g,a.total_in+=f-a.next_in_index,a.next_in_index=f,this.write=e,this.inflate_flush(a,b)}break;case 1:for(;32>h;){if(0!=g)b=0;else return this.bitb=d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,a.next_in_index=f,this.write=e,this.inflate_flush(a,b);g--;d|=(a.next_in[f++]&255)<<h;h+=8}if((~d>>>16&65535)!=(d&65535))return this.mode=13,a.msg="invalid stored block lengths",b=-3,this.bitb=d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,a.next_in_index=f,this.write=e,this.inflate_flush(a,
b);this.left=d&65535;d=h=0;this.mode=0!=this.left?2:0!=this.last?7:0;break;case 2:if(0==g)return this.bitb=d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,a.next_in_index=f,write=e,this.inflate_flush(a,b);if(0==k&&(e==end&&0!=read&&(e=0,k=e<this.read?this.read-e-1:this.end-e),0==k&&(this.write=e,b=this.inflate_flush(a,b),e=this.write,k=e<this.read?this.read-e-1:this.end-e,e==this.end&&0!=this.read&&(e=0,k=e<this.read?this.read-e-1:this.end-e),0==k)))return this.bitb=d,this.bitk=h,a.avail_in=
g,a.total_in+=f-a.next_in_index,a.next_in_index=f,this.write=e,this.inflate_flush(a,b);b=0;c=this.left;c>g&&(c=g);c>k&&(c=k);y(a.next_in,f,this.window,e,c);f+=c;g-=c;e+=c;k-=c;if(0!=(this.left-=c))break;this.mode=0!=this.last?7:0;break;case 3:for(;14>h;){if(0!=g)b=0;else return this.bitb=d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,a.next_in_index=f,this.write=e,this.inflate_flush(a,b);g--;d|=(a.next_in[f++]&255)<<h;h+=8}this.table=c=d&16383;if(29<(c&31)||29<(c>>5&31))return this.mode=
9,a.msg="too many length or distance symbols",b=-3,this.bitb=d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,a.next_in_index=f,this.write=e,this.inflate_flush(a,b);c=258+(c&31)+(c>>5&31);if(null==this.blens||this.blens.length<c)this.blens=new Int32Array(c);else for(k=0;k<c;k++)this.blens[k]=0;d>>>=14;h-=14;this.index=0;mode=4;case 4:for(;this.index<4+(this.table>>>10);){for(;3>h;){if(0!=g)b=0;else return this.bitb=d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,a.next_in_index=f,
this.write=e,this.inflate_flush(a,b);g--;d|=(a.next_in[f++]&255)<<h;h+=8}this.blens[R[this.index++]]=d&7;d>>>=3;h-=3}for(;19>this.index;)this.blens[R[this.index++]]=0;this.bb[0]=7;c=this.inftree.inflate_trees_bits(this.blens,this.bb,this.tb,this.hufts,a);if(0!=c)return b=c,-3==b&&(this.blens=null,this.mode=9),this.bitb=d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,a.next_in_index=f,write=e,this.inflate_flush(a,b);this.index=0;this.mode=5;case 5:for(;;){c=this.table;if(!(this.index<258+
(c&31)+(c>>5&31)))break;for(c=this.bb[0];h<c;){if(0!=g)b=0;else return this.bitb=d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,a.next_in_index=f,this.write=e,this.inflate_flush(a,b);g--;d|=(a.next_in[f++]&255)<<h;h+=8}c=this.hufts[3*(this.tb[0]+(d&x[c]))+1];p=this.hufts[3*(this.tb[0]+(d&x[c]))+2];if(16>p)d>>>=c,h-=c,this.blens[this.index++]=p;else{k=18==p?7:p-14;for(m=18==p?11:3;h<c+k;){if(0!=g)b=0;else return this.bitb=d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,a.next_in_index=
f,this.write=e,this.inflate_flush(a,b);g--;d|=(a.next_in[f++]&255)<<h;h+=8}d>>>=c;h-=c;m+=d&x[k];d>>>=k;h-=k;k=this.index;c=this.table;if(k+m>258+(c&31)+(c>>5&31)||16==p&&1>k)return this.blens=null,this.mode=9,a.msg="invalid bit length repeat",b=-3,this.bitb=d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,a.next_in_index=f,this.write=e,this.inflate_flush(a,b);p=16==p?this.blens[k-1]:0;do this.blens[k++]=p;while(0!=--m);this.index=k}}this.tb[0]=-1;m=new Int32Array(1);p=new Int32Array(1);q=
new Int32Array(1);n=new Int32Array(1);m[0]=9;p[0]=6;c=this.table;c=this.inftree.inflate_trees_dynamic(257+(c&31),1+(c>>5&31),this.blens,m,p,q,n,this.hufts,a);if(0!=c)return-3==c&&(this.blens=null,this.mode=13),b=c,this.bitb=d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,a.next_in_index=f,this.write=e,this.inflate_flush(a,b);this.codes.init(m[0],p[0],this.hufts,q[0],this.hufts,n[0],a);this.mode=6;case 6:this.bitb=d;this.bitk=h;a.avail_in=g;a.total_in+=f-a.next_in_index;a.next_in_index=f;
this.write=e;if(1!=(b=this.codes.proc(this,a,b)))return this.inflate_flush(a,b);b=0;this.codes.free(a);f=a.next_in_index;g=a.avail_in;d=this.bitb;h=this.bitk;e=this.write;k=e<this.read?this.read-e-1:this.end-e;if(0==this.last){this.mode=0;break}this.mode=7;case 7:this.write=e;b=this.inflate_flush(a,b);e=this.write;if(this.read!=this.write)return this.bitb=d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,a.next_in_index=f,this.write=e,this.inflate_flush(a,b);mode=12;case 8:return b=1,this.bitb=
d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,a.next_in_index=f,this.write=e,this.inflate_flush(a,b);case 9:return b=-3,this.bitb=d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,a.next_in_index=f,this.write=e,this.inflate_flush(a,b);default:return b=-2,this.bitb=d,this.bitk=h,a.avail_in=g,a.total_in+=f-a.next_in_index,a.next_in_index=f,this.write=e,this.inflate_flush(a,b)}};B.prototype.free=function(a){this.reset(a,null);this.hufts=this.window=null};B.prototype.set_dictionary=
function(a,b,c){y(a,b,window,0,c);this.read=this.write=c};B.prototype.sync_point=function(){return 1==this.mode};B.prototype.inflate_flush=function(a,b){var c,d,h;d=a.next_out_index;h=this.read;c=(h<=this.write?this.write:this.end)-h;c>a.avail_out&&(c=a.avail_out);0!=c&&-5==b&&(b=0);a.avail_out-=c;a.total_out+=c;null!=this.checkfn&&(a.adler=this.check=a._adler.adler32(this.check,this.window,h,c));y(this.window,h,a.next_out,d,c);d+=c;h+=c;h==this.end&&(h=0,this.write==this.end&&(this.write=0),c=this.write-
h,c>a.avail_out&&(c=a.avail_out),0!=c&&-5==b&&(b=0),a.avail_out-=c,a.total_out+=c,null!=this.checkfn&&(a.adler=this.check=a._adler.adler32(this.check,this.window,h,c)),y(this.window,h,a.next_out,d,c),d+=c,h+=c);a.next_out_index=d;this.read=h;return b};D.prototype.init=function(a,b,c,d,h,f,g){this.mode=0;this.lbits=a;this.dbits=b;this.ltree=c;this.ltree_index=d;this.dtree=h;this.dtree_index=f;this.tree=null};D.prototype.proc=function(a,b,c){var d,h,f=0,g=0,e=0,k,m,p,e=b.next_in_index;k=b.avail_in;
f=a.bitb;g=a.bitk;m=a.write;for(p=m<a.read?a.read-m-1:a.end-m;;)switch(this.mode){case 0:if(258<=p&&10<=k&&(a.bitb=f,a.bitk=g,b.avail_in=k,b.total_in+=e-b.next_in_index,b.next_in_index=e,a.write=m,c=this.inflate_fast(this.lbits,this.dbits,this.ltree,this.ltree_index,this.dtree,this.dtree_index,a,b),e=b.next_in_index,k=b.avail_in,f=a.bitb,g=a.bitk,m=a.write,p=m<a.read?a.read-m-1:a.end-m,0!=c)){this.mode=1==c?7:9;break}this.need=this.lbits;this.tree=this.ltree;this.tree_index=this.ltree_index;this.mode=
1;case 1:for(d=this.need;g<d;){if(0!=k)c=0;else return a.bitb=f,a.bitk=g,b.avail_in=k,b.total_in+=e-b.next_in_index,b.next_in_index=e,a.write=m,a.inflate_flush(b,c);k--;f|=(b.next_in[e++]&255)<<g;g+=8}d=3*(this.tree_index+(f&x[d]));f>>>=this.tree[d+1];g-=this.tree[d+1];h=this.tree[d];if(0==h){this.lit=this.tree[d+2];this.mode=6;break}if(0!=(h&16)){this.get=h&15;this.len=this.tree[d+2];this.mode=2;break}if(0==(h&64)){this.need=h;this.tree_index=d/3+this.tree[d+2];break}if(0!=(h&32)){this.mode=7;break}this.mode=
9;b.msg="invalid literal/length code";c=-3;a.bitb=f;a.bitk=g;b.avail_in=k;b.total_in+=e-b.next_in_index;b.next_in_index=e;a.write=m;return a.inflate_flush(b,c);case 2:for(d=this.get;g<d;){if(0!=k)c=0;else return a.bitb=f,a.bitk=g,b.avail_in=k,b.total_in+=e-b.next_in_index,b.next_in_index=e,a.write=m,a.inflate_flush(b,c);k--;f|=(b.next_in[e++]&255)<<g;g+=8}this.len+=f&x[d];f>>=d;g-=d;this.need=this.dbits;this.tree=this.dtree;this.tree_index=this.dtree_index;this.mode=3;case 3:for(d=this.need;g<d;){if(0!=
k)c=0;else return a.bitb=f,a.bitk=g,b.avail_in=k,b.total_in+=e-b.next_in_index,b.next_in_index=e,a.write=m,a.inflate_flush(b,c);k--;f|=(b.next_in[e++]&255)<<g;g+=8}d=3*(this.tree_index+(f&x[d]));f>>=this.tree[d+1];g-=this.tree[d+1];h=this.tree[d];if(0!=(h&16)){this.get=h&15;this.dist=this.tree[d+2];this.mode=4;break}if(0==(h&64)){this.need=h;this.tree_index=d/3+this.tree[d+2];break}this.mode=9;b.msg="invalid distance code";c=-3;a.bitb=f;a.bitk=g;b.avail_in=k;b.total_in+=e-b.next_in_index;b.next_in_index=
e;a.write=m;return a.inflate_flush(b,c);case 4:for(d=this.get;g<d;){if(0!=k)c=0;else return a.bitb=f,a.bitk=g,b.avail_in=k,b.total_in+=e-b.next_in_index,b.next_in_index=e,a.write=m,a.inflate_flush(b,c);k--;f|=(b.next_in[e++]&255)<<g;g+=8}this.dist+=f&x[d];f>>=d;g-=d;this.mode=5;case 5:for(d=m-this.dist;0>d;)d+=a.end;for(;0!=this.len;){if(0==p&&(m==a.end&&0!=a.read&&(m=0,p=m<a.read?a.read-m-1:a.end-m),0==p&&(a.write=m,c=a.inflate_flush(b,c),m=a.write,p=m<a.read?a.read-m-1:a.end-m,m==a.end&&0!=a.read&&
(m=0,p=m<a.read?a.read-m-1:a.end-m),0==p)))return a.bitb=f,a.bitk=g,b.avail_in=k,b.total_in+=e-b.next_in_index,b.next_in_index=e,a.write=m,a.inflate_flush(b,c);a.window[m++]=a.window[d++];p--;d==a.end&&(d=0);this.len--}this.mode=0;break;case 6:if(0==p&&(m==a.end&&0!=a.read&&(m=0,p=m<a.read?a.read-m-1:a.end-m),0==p&&(a.write=m,c=a.inflate_flush(b,c),m=a.write,p=m<a.read?a.read-m-1:a.end-m,m==a.end&&0!=a.read&&(m=0,p=m<a.read?a.read-m-1:a.end-m),0==p)))return a.bitb=f,a.bitk=g,b.avail_in=k,b.total_in+=
e-b.next_in_index,b.next_in_index=e,a.write=m,a.inflate_flush(b,c);c=0;a.window[m++]=this.lit;p--;this.mode=0;break;case 7:7<g&&(g-=8,k++,e--);a.write=m;c=a.inflate_flush(b,c);m=a.write;if(a.read!=a.write)return a.bitb=f,a.bitk=g,b.avail_in=k,b.total_in+=e-b.next_in_index,b.next_in_index=e,a.write=m,a.inflate_flush(b,c);this.mode=8;case 8:return c=1,a.bitb=f,a.bitk=g,b.avail_in=k,b.total_in+=e-b.next_in_index,b.next_in_index=e,a.write=m,a.inflate_flush(b,c);case 9:return c=-3,a.bitb=f,a.bitk=g,b.avail_in=
k,b.total_in+=e-b.next_in_index,b.next_in_index=e,a.write=m,a.inflate_flush(b,c);default:return c=-2,a.bitb=f,a.bitk=g,b.avail_in=k,b.total_in+=e-b.next_in_index,b.next_in_index=e,a.write=m,a.inflate_flush(b,c)}};D.prototype.free=function(a){};D.prototype.inflate_fast=function(a,b,c,d,h,f,g,e){var k,m,p,q,n,l,u,s,w,t,r,v;l=e.next_in_index;u=e.avail_in;q=g.bitb;n=g.bitk;s=g.write;w=s<g.read?g.read-s-1:g.end-s;a=x[a];t=x[b];do{for(;20>n;)u--,q|=(e.next_in[l++]&255)<<n,n+=8;k=q&a;m=c;p=d;v=3*(p+k);if(0==
(b=m[v]))q>>=m[v+1],n-=m[v+1],g.window[s++]=m[v+2],w--;else{do{q>>=m[v+1];n-=m[v+1];if(0!=(b&16)){b&=15;r=m[v+2]+(q&x[b]);q>>=b;for(n-=b;15>n;)u--,q|=(e.next_in[l++]&255)<<n,n+=8;k=q&t;m=h;p=f;v=3*(p+k);b=m[v];do if(q>>=m[v+1],n-=m[v+1],0!=(b&16)){for(b&=15;n<b;)u--,q|=(e.next_in[l++]&255)<<n,n+=8;k=m[v+2]+(q&x[b]);q>>=b;n-=b;w-=r;if(s>=k)k=s-k,g.window[s++]=g.window[k++],g.window[s++]=g.window[k++],r-=2;else{k=s-k;do k+=g.end;while(0>k);b=g.end-k;if(r>b){r-=b;if(0<s-k&&b>s-k){do g.window[s++]=g.window[k++];
while(0!=--b)}else y(g.window,k,g.window,s,b),s+=b;k=0}}do g.window[s++]=g.window[k++];while(0!=--r);break}else if(0==(b&64))k+=m[v+2],k+=q&x[b],v=3*(p+k),b=m[v];else return e.msg="invalid distance code",r=e.avail_in-u,r=n>>3<r?n>>3:r,u+=r,l-=r,n-=r<<3,g.bitb=q,g.bitk=n,e.avail_in=u,e.total_in+=l-e.next_in_index,e.next_in_index=l,g.write=s,-3;while(1);break}if(0==(b&64)){if(k+=m[v+2],k+=q&x[b],v=3*(p+k),0==(b=m[v])){q>>=m[v+1];n-=m[v+1];g.window[s++]=m[v+2];w--;break}}else{if(0!=(b&32))return r=e.avail_in-
u,r=n>>3<r?n>>3:r,u+=r,l-=r,n-=r<<3,g.bitb=q,g.bitk=n,e.avail_in=u,e.total_in+=l-e.next_in_index,e.next_in_index=l,g.write=s,1;e.msg="invalid literal/length code";r=e.avail_in-u;r=n>>3<r?n>>3:r;u+=r;l-=r;n-=r<<3;g.bitb=q;g.bitk=n;e.avail_in=u;e.total_in+=l-e.next_in_index;e.next_in_index=l;g.write=s;return-3}}while(1)}}while(258<=w&&10<=u);r=e.avail_in-u;r=n>>3<r?n>>3:r;l-=r;g.bitb=q;g.bitk=n-(r<<3);e.avail_in=u+r;e.total_in+=l-e.next_in_index;e.next_in_index=l;g.write=s;return 0};E.prototype.huft_build=
function(a,b,c,d,h,f,g,e,k,m,p){var q,n,l,u,s,w,t,r,v;w=0;n=c;do this.c[a[b+w]]++,w++,n--;while(0!=n);if(this.c[0]==c)return g[0]=-1,e[0]=0;s=e[0];for(l=1;15>=l&&0==this.c[l];l++);u=l;s<l&&(s=l);for(n=15;0!=n&&0==this.c[n];n--);m=n;s>n&&(s=n);e[0]=s;for(e=1<<l;l<n;l++,e<<=1)if(0>(e-=this.c[l]))return-3;if(0>(e-=this.c[n]))return-3;this.c[n]+=e;this.x[1]=l=0;w=1;for(t=2;0!=--n;)this.x[t]=l+=this.c[w],t++,w++;w=n=0;do 0!=(l=a[b+w])&&(this.v[this.x[l]++]=n),w++;while(++n<c);c=this.x[m];w=this.x[0]=n=
0;b=-1;r=-s;for(v=t=this.u[0]=0;u<=m;u++)for(a=this.c[u];0!=a--;){for(;u>r+s;){b++;r+=s;v=m-r;v=v>s?s:v;if((q=1<<(l=u-r))>a+1&&(q-=a+1,t=u,l<v))for(;++l<v&&!((q<<=1)<=this.c[++t]);)q-=this.c[t];v=1<<l;if(1440<this.hn[0]+v)return-3;this.u[b]=t=this.hn[0];this.hn[0]+=v;0!=b?(this.x[b]=n,this.r[0]=l,this.r[1]=s,l=n>>>r-s,this.r[2]=t-this.u[b-1]-l,y(this.r,0,k,3*(this.u[b-1]+l),3)):g[0]=t}this.r[1]=u-r;w>=c?this.r[0]=192:p[w]<d?(this.r[0]=256>this.v[w]?0:96,this.r[2]=this.v[w++]):(this.r[0]=f[this.v[w]-
d]+16+64,this.r[2]=h[this.v[w++]-d]);q=1<<u-r;for(l=n>>>r;l<v;l+=q)y(this.r,0,k,3*(t+l),3);for(l=1<<u-1;0!=(n&l);l>>>=1)n^=l;n^=l;for(l=(1<<r)-1;(n&l)!=this.x[b];)b--,r-=s,l=(1<<r)-1}return 0!=e&&1!=m?-5:0};E.prototype.inflate_trees_bits=function(a,b,c,d,h){this.initWorkArea(19);this.hn[0]=0;a=this.huft_build(a,0,19,19,null,null,c,b,d,this.hn,this.v);if(-3==a)h.msg="oversubscribed dynamic bit lengths tree";else if(-5==a||0==b[0])h.msg="incomplete dynamic bit lengths tree",a=-3;return a};E.prototype.inflate_trees_dynamic=
function(a,b,c,d,h,f,g,e,k){this.initWorkArea(288);this.hn[0]=0;f=this.huft_build(c,0,a,257,Z,aa,f,d,e,this.hn,this.v);if(0!=f||0==d[0])return-3==f?k.msg="oversubscribed literal/length tree":-4!=f&&(k.msg="incomplete literal/length tree",f=-3),f;this.initWorkArea(288);f=this.huft_build(c,a,b,0,ba,ca,g,h,e,this.hn,this.v);return 0!=f||0==h[0]&&257<a?(-3==f?k.msg="oversubscribed distance tree":-5==f?(k.msg="incomplete distance tree",f=-3):-4!=f&&(k.msg="empty distance tree with lengths",f=-3),f):0};
E.prototype.initWorkArea=function(a){null==this.hn&&(this.hn=new Int32Array(1),this.v=new Int32Array(a),this.c=new Int32Array(16),this.r=new Int32Array(3),this.u=new Int32Array(15),this.x=new Int32Array(16));this.v.length<a&&(this.v=new Int32Array(a));for(var b=0;b<a;b++)this.v[b]=0;for(b=0;16>b;b++)this.c[b]=0;for(b=0;3>b;b++)this.r[b]=0;y(this.c,0,this.u,0,15);y(this.c,0,this.x,0,16)};var T="function"===typeof(new Uint8Array(1)).subarray;K.prototype.toString=function(){return""+this.block+":"+this.offset};
F.prototype.slice=function(a,b){var c;c=this.blob.slice?b?this.blob.slice(a,a+b):this.blob.slice(a):b?this.blob.webkitSlice(a,a+b):this.blob.webkitSlice(a);return new F(c)};F.prototype.salted=function(){return this};F.prototype.fetch="undefined"!==typeof FileReader?function(a){var b=new FileReader;b.onloadend=function(c){a(N(b.result))};b.readAsBinaryString(this.blob)}:function(a){var b=new FileReaderSync;try{var c=b.readAsArrayBuffer(this.blob);a(c)}catch(d){a(null,d)}};z.prototype.slice=function(a,
b){if(0>a)throw"Bad slice "+a;var c=this.start,d=this.end,c=c&&a?c+a:a||c;return new z(this.url,c,b&&c?c+b-1:d||b-1,this.opts)};0<=navigator.userAgent.indexOf("Safari")&&navigator.userAgent.indexOf("Chrome");z.prototype.fetchAsText=function(a){var b=this;this.getURL().then(function(c){try{var d=new XMLHttpRequest;d.open("GET",c,!0);if(b.end){if(1E8<b.end-b.start)throw"Monster fetch!";d.setRequestHeader("Range","bytes="+b.start+"-"+b.end)}d.onreadystatechange=function(){if(4==d.readyState)return 200==
d.status||206==d.status?a(d.responseText):a(null)};b.opts.credentials&&(d.withCredentials=!0);d.send("")}catch(h){return a(null)}}).fail(function(b){console.log(b);return a(null,b)})};z.prototype.salted=function(){var a=this.opts,b={},c;for(c in a)b[c]=a[c];b.salt=!0;return new z(this.url,this.start,this.end,b)};z.prototype.getURL=function(){return this.opts.resolver?this.opts.resolver(this.url).then(function(a){return"string"===typeof a?a:a.url}):$.Deferred().resolve(this.url)};z.prototype.fetch=
function(a,b){var c=this;b=b||{};var d=b.attempt||1,h=b.truncatedLength;if(3<d)return a(null);this.getURL().then(function(f){try{var g;b.timeout&&!c.opts.credentials&&(g=setTimeout(function(){console.log("timing out "+f);e.abort();return a(null,"Timeout")},b.timeout));var e=new XMLHttpRequest,k;e.open("GET",f,!0);e.overrideMimeType("text/plain; charset=x-user-defined");if(c.end){if(1E8<c.end-c.start)throw"Monster fetch!";e.setRequestHeader("Range","bytes="+c.start+"-"+c.end);k=c.end-c.start+1}e.responseType=
"arraybuffer";e.onreadystatechange=function(){if(4==e.readyState){g&&clearTimeout(g);if(200==e.status||206==e.status){if(e.response){var b=e.response.byteLength;return!k||k==b||h&&b==h?a(e.response):c.fetch(a,{attempt:d+1,truncatedLength:b})}if(e.mozResponseArrayBuffer)return a(e.mozResponseArrayBuffer);b=e.responseText;return!k||k==b.length||h&&b.length==h?a(N(e.responseText)):c.fetch(a,{attempt:d+1,truncatedLength:b.length})}return c.fetch(a,{attempt:d+1})}};c.opts.credentials&&(e.withCredentials=
!0);e.send("")}catch(m){return a(null)}}).fail(function(b){console.log(b);return a(null,b)})};H.prototype.blocksForRange=function(a,b,c){var d=this.indices[a];if(!d)return[];a=U(b,c);for(var h=[],f=0;f<a.length;++f)h[a[f]]=!0;a=[];for(var g=[],f=t(d,0),e=4,k=0;k<f;++k){var m=t(d,e),p=t(d,e+4),e=e+8;if(h[m])for(var q=0;q<p;++q){var n=G(d,e),l=G(d,e+8);(4681>m?g:a).push(new M(n,l));e+=16}else e+=16*p}f=t(d,e);h=null;b=Math.min(b>>14,f-1);c=Math.min(c>>14,f-1);for(f=b;f<=c;++f)(b=G(d,e+4+8*f))&&(!h||
b.block<h.block||b.offset<h.offset)&&(h=b);d=[];if(null!=h)for(f=0;f<g.length;++f)c=g[f],c.maxv.block>=h.block&&c.maxv.offset>=h.offset&&d.push(c);g=d;d=[];for(f=0;f<g.length;++f)d.push(g[f]);for(f=0;f<a.length;++f)d.push(a[f]);d.sort(function(a,b){var c=a.minv.block-b.minv.block;return 0!=c?c:a.minv.offset-b.minv.offset});a=[];if(0<d.length){g=d[0];for(f=1;f<d.length;++f)c=d[f],c.minv.block==g.maxv.block?g=new M(g.minv,c.maxv):(a.push(g),g=c);a.push(g)}return a};H.prototype.fetch=function(a,b,c,
d,h){function f(){if(q>=k.length)return d(p);if(n){var a=new Uint8Array(n),a=g.readBamRecords(a,k[q].minv.offset,p,b,c,e,h);n=null;++q;return a?d(p):f()}var m=k[q],a=m.minv.block;g.data.slice(a,m.maxv.block+65536-a).fetch(function(a){n=L(a,m.maxv.block-m.minv.block+1);return f()})}var g=this;h=h||{};var e=this.chrToIndex[a],k;if(void 0===e)k=[];else{if(null===this.indices[e]&&this.indexChunks.chunks[e]){var m=this.indexChunks.chunks[e];return this.bai.slice(m[0],m[1]).fetch(function(f){f=new Uint8Array(f);
this.indices[e]=f;return this.fetch(a,b,c,d,h)}.bind(this))}(k=this.blocksForRange(e,b,c))||d(null,"Error in index fetch")}var p=[],q=0,n;f()};var S="=ACxGxxxTxxxxxxN".split(""),ea="MIDNSHP=X???????".split("");H.prototype.readBamRecords=function(a,b,c,d,h,f,g){for(;;){var e=t(a,b),e=b+e+4;if(e>=a.length)return!1;var k=new W,m=t(a,b+4),p=t(a,b+8),q=t(a,b+12),n=(q&65280)>>8,l=q&255,q=t(a,b+16),u=(q&4294901760)>>16,s=q&65535,q=t(a,b+20),w=t(a,b+24),x=t(a,b+28);t(a,b+32);k.segment=this.indexToChr[m];
k.flag=u;k.pos=p;k.mq=n;g.light&&(k.seqLength=q);if(!g.light){0<=w&&(k.nextSegment=this.indexToChr[w],k.nextPos=x);n="";for(p=0;p<l-1;++p)n+=String.fromCharCode(a[b+36+p]);k.readName=n;b=b+36+l;l="";for(p=0;p<s;++p)n=t(a,b),l=l+(n>>4)+ea[n&15],b+=4;k.cigar=l;s="";l=q+1>>1;for(p=0;p<l;++p)n=a[b+p],s+=S[(n&240)>>4],s.length<q&&(s+=S[n&15]);b+=l;k.seq=s;s="";for(p=0;p<q;++p)s+=String.fromCharCode(a[b+p]+33);b+=q;for(k.quals=s;b<e;){s=String.fromCharCode(a[b],a[b+1]);l=String.fromCharCode(a[b+2]);if("A"==
l)l=String.fromCharCode(a[b+3]),b+=4;else if("i"==l||"I"==l)l=t(a,b+3),b+=7;else if("c"==l||"C"==l)l=a[b+3],b+=4;else if("s"==l||"S"==l)l=P(a,b+3),b+=5;else if("f"==l)l=O(a,b+3),b+=7;else if("Z"==l||"H"==l)for(b+=3,l="";p=a[b++],0!=p;)l+=String.fromCharCode(p);else if("B"==l){l=String.fromCharCode(a[b+3]);p=t(a,b+4);if("i"==l||"I"==l||"f"==l)n=4,u="f"==l?O:t;else if("s"==l||"S"==l)n=2,u=P;else if("c"==l||"C"==l)n=1,u=V;else throw"Unknown array type "+l;b+=8;l=[];for(w=0;w<p;++w)l.push(u(a,b)),b+=
n}else throw"Unknown type "+l;k[s]=l}}if(!d||k.pos<=h&&k.pos+q>=d)void 0!==f&&m!=f||c.push(k);if(k.pos>h)return!0;b=e}};window.dallianceLib={URLFetchable:z,BlobFetchable:F,makeBam:function(a,b,c,d,h){a.slice(0,10).fetch(function(f){return f?Q(a,b,c,d,h):d(null,"Couldn't access BAM.")},{timeout:5E3})},inflateBuffer:J};"object"===typeof module&&"object"===typeof module.exports&&(module.exports=window.dallianceLib)})();

!function(a){var b=this;"object"==typeof exports?module.exports=a(b):"function"==typeof define&&define.amd?define([],function(){return a(b)}):b.jDataView=a(b)}(function(a){"use strict";function b(a,b){return"object"!=typeof a||null===a?!1:a.constructor===b||Object.prototype.toString.call(a)==="[object "+b.name+"]"}function c(a,c){return!c&&b(a,Array)?a:Array.prototype.slice.call(a)}function d(a,b){return void 0!==a?a:b}function e(a,c,f,g){if(e.is(a)){var h=a.slice(c,c+f);return h._littleEndian=d(g,h._littleEndian),h}if(!e.is(this))return new e(a,c,f,g);if(this.buffer=a=e.wrapBuffer(a),this._isArrayBuffer=j.ArrayBuffer&&b(a,ArrayBuffer),this._isPixelData=!0&&j.PixelData&&b(a,CanvasPixelArray),this._isDataView=j.DataView&&this._isArrayBuffer,this._isNodeBuffer=!1,!this._isArrayBuffer&&!this._isPixelData&&!b(a,Array))throw new TypeError("jDataView buffer has an incompatible type");this._littleEndian=!!g;var i="byteLength"in a?a.byteLength:a.length;this.byteOffset=c=d(c,0),this.byteLength=f=d(f,i-c),this._offset=this._bitOffset=0,this._isDataView?this._view=new DataView(a,c,f):this._checkBounds(c,f,i),this._engineAction=this._isDataView?this._dataViewAction:this._isArrayBuffer?this._arrayBufferAction:this._arrayAction}function f(a){for(var b=j.ArrayBuffer?Uint8Array:Array,c=new b(a.length),d=0,e=a.length;e>d;d++)c[d]=255&a.charCodeAt(d);return c}function g(a){return a>=0&&31>a?1<<a:g[a]||(g[a]=Math.pow(2,a))}function h(a,b){this.lo=a,this.hi=b}function i(){h.apply(this,arguments)}var j={NodeBuffer:!1,DataView:"DataView"in a,ArrayBuffer:"ArrayBuffer"in a,PixelData:!0&&"CanvasPixelArray"in a&&!("Uint8ClampedArray"in a)&&"document"in a},k=a.TextEncoder,l=a.TextDecoder;if(j.PixelData)var m=document.createElement("canvas").getContext("2d"),n=function(a,b){var c=m.createImageData((a+3)/4,1).data;if(c.byteLength=a,void 0!==b)for(var d=0;a>d;d++)c[d]=b[d];return c};var o={Int8:1,Int16:2,Int32:4,Uint8:1,Uint16:2,Uint32:4,Float32:4,Float64:8};e.wrapBuffer=function(a){switch(typeof a){case"number":if(j.ArrayBuffer)a=new Uint8Array(a).buffer;else if(j.PixelData)a=n(a);else{a=new Array(a);for(var d=0;d<a.length;d++)a[d]=0}return a;case"string":a=f(a);default:return"length"in a&&!(j.ArrayBuffer&&b(a,ArrayBuffer)||j.PixelData&&b(a,CanvasPixelArray))&&(j.ArrayBuffer?b(a,ArrayBuffer)||(a=new Uint8Array(a).buffer,b(a,ArrayBuffer)||(a=new Uint8Array(c(a,!0)).buffer)):a=j.PixelData?n(a.length,a):c(a)),a}},e.is=function(a){return a&&a.jDataView},e.from=function(){return new e(arguments)},e.Uint64=h,h.prototype={valueOf:function(){return this.lo+g(32)*this.hi},toString:function(){return Number.prototype.toString.apply(this.valueOf(),arguments)}},h.fromNumber=function(a){var b=Math.floor(a/g(32)),c=a-b*g(32);return new h(c,b)},e.Int64=i,i.prototype="create"in Object?Object.create(h.prototype):new h,i.prototype.valueOf=function(){return this.hi<g(31)?h.prototype.valueOf.apply(this,arguments):-(g(32)-this.lo+g(32)*(g(32)-1-this.hi))},i.fromNumber=function(a){var b,c;if(a>=0){var d=h.fromNumber(a);b=d.lo,c=d.hi}else c=Math.floor(a/g(32)),b=a-c*g(32),c+=g(32);return new i(b,c)};var p=e.prototype={compatibility:j,jDataView:!0,_checkBounds:function(a,b,c){if("number"!=typeof a)throw new TypeError("Offset is not a number.");if("number"!=typeof b)throw new TypeError("Size is not a number.");if(0>b)throw new RangeError("Length is negative.");if(0>a||a+b>d(c,this.byteLength))throw new RangeError("Offsets are out of bounds.")},_action:function(a,b,c,e,f){return this._engineAction(a,b,d(c,this._offset),d(e,this._littleEndian),f)},_dataViewAction:function(a,b,c,d,e){return this._offset=c+o[a],b?this._view["get"+a](c,d):this._view["set"+a](c,e,d)},_arrayBufferAction:function(b,c,e,f,g){var h,i=o[b],j=a[b+"Array"];if(f=d(f,this._littleEndian),1===i||(this.byteOffset+e)%i===0&&f)return h=new j(this.buffer,this.byteOffset+e,1),this._offset=e+i,c?h[0]:h[0]=g;var k=new Uint8Array(c?this.getBytes(i,e,f,!0):i);return h=new j(k.buffer,0,1),c?h[0]:(h[0]=g,void this._setBytes(e,k,f))},_arrayAction:function(a,b,c,d,e){return b?this["_get"+a](c,d):this["_set"+a](c,e,d)},_getBytes:function(a,b,e){e=d(e,this._littleEndian),b=d(b,this._offset),a=d(a,this.byteLength-b),this._checkBounds(b,a),b+=this.byteOffset,this._offset=b-this.byteOffset+a;var f=this._isArrayBuffer?new Uint8Array(this.buffer,b,a):(this.buffer.slice||Array.prototype.slice).call(this.buffer,b,b+a);return e||1>=a?f:c(f).reverse()},getBytes:function(a,b,e,f){var g=this._getBytes(a,b,d(e,!0));return f?c(g):g},_setBytes:function(a,b,e){var f=b.length;if(0!==f){if(e=d(e,this._littleEndian),a=d(a,this._offset),this._checkBounds(a,f),!e&&f>1&&(b=c(b,!0).reverse()),a+=this.byteOffset,this._isArrayBuffer)new Uint8Array(this.buffer,a,f).set(b);else for(var g=0;f>g;g++)this.buffer[a+g]=b[g];this._offset=a-this.byteOffset+f}},setBytes:function(a,b,c){this._setBytes(a,b,d(c,!0))},getString:function(a,b,c){var d=this._getBytes(a,b,!0);if(c="utf8"===c?"utf-8":c||"binary",l&&"binary"!==c)return new l(c).decode(this._isArrayBuffer?d:new Uint8Array(d));var e="";a=d.length;for(var f=0;a>f;f++)e+=String.fromCharCode(d[f]);return"utf-8"===c&&(e=decodeURIComponent(escape(e))),e},setString:function(a,b,c){c="utf8"===c?"utf-8":c||"binary";var d;k&&"binary"!==c?d=new k(c).encode(b):("utf-8"===c&&(b=unescape(encodeURIComponent(b))),d=f(b)),this._setBytes(a,d,!0)},getChar:function(a){return this.getString(1,a)},setChar:function(a,b){this.setString(a,b)},tell:function(){return this._offset},seek:function(a){return this._checkBounds(a,0),this._offset=a},skip:function(a){return this.seek(this._offset+a)},slice:function(a,b,c){function f(a,b){return 0>a?a+b:a}return a=f(a,this.byteLength),b=f(d(b,this.byteLength),this.byteLength),c?new e(this.getBytes(b-a,a,!0,!0),void 0,void 0,this._littleEndian):new e(this.buffer,this.byteOffset+a,b-a,this._littleEndian)},alignBy:function(a){return this._bitOffset=0,1!==d(a,1)?this.skip(a-(this._offset%a||a)):this._offset},_getFloat64:function(a,b){var c=this._getBytes(8,a,b),d=1-2*(c[7]>>7),e=((c[7]<<1&255)<<3|c[6]>>4)-1023,f=(15&c[6])*g(48)+c[5]*g(40)+c[4]*g(32)+c[3]*g(24)+c[2]*g(16)+c[1]*g(8)+c[0];return 1024===e?0!==f?0/0:1/0*d:-1023===e?d*f*g(-1074):d*(1+f*g(-52))*g(e)},_getFloat32:function(a,b){var c=this._getBytes(4,a,b),d=1-2*(c[3]>>7),e=(c[3]<<1&255|c[2]>>7)-127,f=(127&c[2])<<16|c[1]<<8|c[0];return 128===e?0!==f?0/0:1/0*d:-127===e?d*f*g(-149):d*(1+f*g(-23))*g(e)},_get64:function(a,b,c){c=d(c,this._littleEndian),b=d(b,this._offset);for(var e=c?[0,4]:[4,0],f=0;2>f;f++)e[f]=this.getUint32(b+e[f],c);return this._offset=b+8,new a(e[0],e[1])},getInt64:function(a,b){return this._get64(i,a,b)},getUint64:function(a,b){return this._get64(h,a,b)},_getInt32:function(a,b){var c=this._getBytes(4,a,b);return c[3]<<24|c[2]<<16|c[1]<<8|c[0]},_getUint32:function(a,b){return this._getInt32(a,b)>>>0},_getInt16:function(a,b){return this._getUint16(a,b)<<16>>16},_getUint16:function(a,b){var c=this._getBytes(2,a,b);return c[1]<<8|c[0]},_getInt8:function(a){return this._getUint8(a)<<24>>24},_getUint8:function(a){return this._getBytes(1,a)[0]},_getBitRangeData:function(a,b){var c=(d(b,this._offset)<<3)+this._bitOffset,e=c+a,f=c>>>3,g=e+7>>>3,h=this._getBytes(g-f,f,!0),i=0;(this._bitOffset=7&e)&&(this._bitOffset-=8);for(var j=0,k=h.length;k>j;j++)i=i<<8|h[j];return{start:f,bytes:h,wideValue:i}},getSigned:function(a,b){var c=32-a;return this.getUnsigned(a,b)<<c>>c},getUnsigned:function(a,b){var c=this._getBitRangeData(a,b).wideValue>>>-this._bitOffset;return 32>a?c&~(-1<<a):c},_setBinaryFloat:function(a,b,c,d,e){var f,h,i=0>b?1:0,j=~(-1<<d-1),k=1-j;0>b&&(b=-b),0===b?(f=0,h=0):isNaN(b)?(f=2*j+1,h=1):1/0===b?(f=2*j+1,h=0):(f=Math.floor(Math.log(b)/Math.LN2),f>=k&&j>=f?(h=Math.floor((b*g(-f)-1)*g(c)),f+=j):(h=Math.floor(b/g(k-c)),f=0));for(var l=[];c>=8;)l.push(h%256),h=Math.floor(h/256),c-=8;for(f=f<<c|h,d+=c;d>=8;)l.push(255&f),f>>>=8,d-=8;l.push(i<<d|f),this._setBytes(a,l,e)},_setFloat32:function(a,b,c){this._setBinaryFloat(a,b,23,8,c)},_setFloat64:function(a,b,c){this._setBinaryFloat(a,b,52,11,c)},_set64:function(a,b,c,e){"object"!=typeof c&&(c=a.fromNumber(c)),e=d(e,this._littleEndian),b=d(b,this._offset);var f=e?{lo:0,hi:4}:{lo:4,hi:0};for(var g in f)this.setUint32(b+f[g],c[g],e);this._offset=b+8},setInt64:function(a,b,c){this._set64(i,a,b,c)},setUint64:function(a,b,c){this._set64(h,a,b,c)},_setUint32:function(a,b,c){this._setBytes(a,[255&b,b>>>8&255,b>>>16&255,b>>>24],c)},_setUint16:function(a,b,c){this._setBytes(a,[255&b,b>>>8&255],c)},_setUint8:function(a,b){this._setBytes(a,[255&b])},setUnsigned:function(a,b,c){var d=this._getBitRangeData(c,a),e=d.wideValue,f=d.bytes;e&=~(~(-1<<c)<<-this._bitOffset),e|=(32>c?b&~(-1<<c):b)<<-this._bitOffset;for(var g=f.length-1;g>=0;g--)f[g]=255&e,e>>>=8;this._setBytes(d.start,f,!0)}};for(var q in o)!function(a){p["get"+a]=function(b,c){return this._action(a,!0,b,c)},p["set"+a]=function(b,c,d){this._action(a,!1,b,d,c)}}(q);p._setInt32=p._setUint32,p._setInt16=p._setUint16,p._setInt8=p._setUint8,p.setSigned=p.setUnsigned;for(var r in p)"set"===r.slice(0,3)&&!function(a){p["write"+a]=function(){Array.prototype.unshift.call(arguments,void 0),this["set"+a].apply(this,arguments)}}(r.slice(3));return e});
//# sourceMappingURL=jdataview.js.map

(function () {

if (typeof jDataView === 'undefined' && typeof require !== 'undefined') {
	jDataView = require('./jDataView.js');
}

// Extend code from underscorejs (modified for fast inheritance using prototypes)
function inherit(obj) {
  if ('create' in Object) {
    obj = Object.create(obj);
  } else {
    function ClonedObject() {}
    ClonedObject.prototype = obj;
    obj = new ClonedObject();
  }
  for (var i = 1; i < arguments.length; ++i) {
    var source = arguments[i];
    for (var prop in source) {
      if (source[prop] !== undefined) {
        obj[prop] = source[prop];
      }
    }
  }
  return obj;
}

function jParser(view, structure) {
  if (!(this instanceof arguments.callee)) {
    throw new Error("Constructor may not be called as a function");
  }
  if (!(view instanceof jDataView)) {
    view = new jDataView(view, undefined, undefined, true);
  }
  this.view = view;
  this.view.seek(0);
  this._bitShift = 0;
  this.structure = inherit(jParser.prototype.structure, structure);
}

function toInt(val) {
  return val instanceof Function ? val.call(this) : val;
}

jParser.prototype.structure = {
  uint8: function () { return this.view.getUint8(); },
  uint16: function () { return this.view.getUint16(); },
  uint32: function () { return this.view.getUint32(); },
  uint64 : function () { return parseInt(this.view.getUint64(),10); },
  int8: function () { return this.view.getInt8(); },
  int16: function () { return this.view.getInt16(); },
  int32: function () { return this.view.getInt32(); },
  float32: function () { return this.view.getFloat32(); },
  float64: function () { return this.view.getFloat64(); },
  char: function () { return this.view.getChar(); },
  string: function (length) {
    return this.view.getString(toInt.call(this, length));
  },
  array: function (type, length) {
    length = toInt.call(this, length);
    var results = [];
    for (var i = 0; i < length; ++i) {
      results.push(this.parse(type));
    }
    return results;
  },
  seek: function (position, block) {
    position = toInt.call(this, position);
    if (block instanceof Function) {
      var old_position = this.view.tell();
      this.view.seek(position);
      var result = block.call(this);
      this.view.seek(old_position);
      return result;
    } else {
      return this.view.seek(position);
    }
  },
  tell: function () {
    return this.view.tell();
  },
  skip: function (offset) {
    offset = toInt.call(this, offset);
    this.view.seek(this.view.tell() + offset);
    return offset;
  },
  err : function(e){
    this.current = { error : e };
    return;
  },
  if: function (predicate) {
    if (predicate instanceof Function ? predicate.call(this) : predicate) {
    return this.parse.apply(this, Array.prototype.slice.call(arguments, 1));
    }
  }
};

jParser.prototype.seek = jParser.prototype.structure.seek;
jParser.prototype.tell = jParser.prototype.structure.tell;
jParser.prototype.skip = jParser.prototype.structure.skip;
jParser.prototype.err  = jParser.prototype.structure.err;

jParser.prototype.parse = function (structure) {
  if (typeof structure === 'number') {
    var fieldValue = 0,
    bitSize = structure;

    if (this._bitShift < 0) {
      var byteShift = this._bitShift >> 3; // Math.floor(_bitShift / 8)
      this.skip(byteShift);
      this._bitShift &= 7; // _bitShift + 8 * Math.floor(_bitShift / 8)
    }
    if (this._bitShift > 0 && bitSize >= 8 - this._bitShift) {
      fieldValue = this.view.getUint8() & ~(-1 << (8 - this._bitShift));
      bitSize -= 8 - this._bitShift;
      this._bitShift = 0;
    }
    while (bitSize >= 8) {
      fieldValue = this.view.getUint8() | (fieldValue << 8);
      bitSize -= 8;
    }
    if (bitSize > 0) {
      fieldValue = ((this.view.getUint8() >>> (8 - (this._bitShift + bitSize))) & ~(-1 << bitSize)) | (fieldValue << bitSize);
      this._bitShift += bitSize - 8; // passing negative value for next pass
    }

    return fieldValue;
  }

  // f, 1, 2 means f(1, 2)
  if (structure instanceof Function) {
    return structure.apply(this, Array.prototype.slice.call(arguments, 1));
  }

  // 'int32', ... is a shortcut for ['int32', ...]
  if (typeof structure === 'string') {
    structure = Array.prototype.slice.call(arguments);
  }

  // ['string', 256] means structure['string'](256)
  if (structure instanceof Array) {
    var key = structure[0];
    if (!(key in this.structure)) {
      throw new Error("Missing structure for `" + key + "`");
    }
    return this.parse.apply(this, [this.structure[key]].concat(structure.slice(1)));
  }

  // {key: val} means {key: parse(val)}
  if (typeof structure === 'object') {
    var output = {},
    current = this.current;

    this.current = output;

    for (var key in structure) {
      if(this.current.error){
        output = this.current;
        return output;
      }
      var value = this.parse(structure[key]);

      // skipping undefined call results (useful for 'if' statement)
      if (value !== undefined) {
        output[key] = value;
      }
    }

    this.current = current;

    return output;
  }

  throw new Error("Unknown structure type `" + structure + "`");
};


var all;
if (typeof self !== 'undefined') {
  all = self;
} else if (typeof window !== 'undefined') {
  all = window;
} else if (typeof global !== 'undefined') {
  all = global;
}
// Browser + Web Worker
all.jParser = jParser;

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = jParser;
}

})();

(function () {
  var BWReader = function (data, callback) {
    // constants: bigwig/bigbed file header signatures (magic numbers) (32 bit) , can be swapped ( big-endian | BE )
    var BIG_WIG_MAGIC    = 0x888FFC26;
    var BIG_WIG_MAGIC_BE = 0x26FC8F88;

    var BIG_BED_MAGIC    = 0x8789F2EB;
    var BIG_BED_MAGIC_BE = 0xEBF28987;

    var CIRTREE_MAGIC = 0x78ca8c91;
    var IDXTREE_MAGIC = 0x2468ace0;

    // type of file converted to bigwig bedgraph |variable step wiggle | fixed step wiggle
    var BIG_WIG_TYPE_GRAPH = 1;
    var BIG_WIG_TYPE_VSTEP = 2;
    var BIG_WIG_TYPE_FSTEP = 3;

    // bigbed data color regex
    var BED_COLOR_REGEXP = new RegExp("^[0-9]+,[0-9]+,[0-9]+");

    var M1 = 256;
    var M2 = 256*256;
    var M3 = 256*256*256;
    var M4 = 256*256*256*256;

    var bbi = {
      fetchedData: new RTree()
    };

    function init() {
      checkSignature();
    }

    function getData(start, length, cb) {
      var end     = start + length;
      var fetched = bbi.fetchedData.search({ x: start, w: length, y: 0, h: 1 }).filter(function (d) { return d[0] <= start && d[1] >= end; });

      if (fetched.length == 1) {
        cb(fetched[0][2].slice(start - fetched[0][0], start + length));
      } else {
        data.slice(start, length).fetch(function (d) {
          bbi.fetchedData.insert({ x: start, w: length, y: 0, h: 1 }, [ start, start + length, d ]);
          cb(d);
        });
      }
    }

    function checkSignature() {
      getData(0, 512, function (header) {
        var ba    = new Uint8Array(header);
        var sa    = new Uint16Array(header);
        var la    = new Uint32Array(header);
        var magic = la[0];
        var error, reduction, dataOffset, indexOffset;

        if (magic === BIG_WIG_MAGIC) {
          bbi.type = 'bigwig';
        } else if (magic === BIG_BED_MAGIC) {
          bbi.type = 'bigbed';
        } else if (magic === BIG_WIG_MAGIC_BE || magic === BIG_BED_MAGIC_BE) {
          error = 'big-endian files not supported yet!';
        } else{
          error = 'unsupported file format';
        }

        if (error) {
          callback(null, error);
        }

        bbi.version             = sa[2];
        bbi.numZoomLevels       = sa[3];
        bbi.chromTreeOffset     = read64Bit(ba, 8);
        bbi.unzoomedDataOffset  = read64Bit(ba, 16);
        bbi.unzoomedIndexOffset = read64Bit(ba, 24);
        bbi.fieldCount          = sa[16];
        bbi.definedFieldCount   = sa[17];
        bbi.asOffset            = read64Bit(ba, 36);
        bbi.totalSummaryOffset  = read64Bit(ba, 44);
        bbi.uncompressBufSize   = la[13];
        bbi.extHeaderOffset     = read64Bit(ba, 56);
        bbi.compressed          = bbi.uncompressBufSize  > 0;
        bbi.summary             = bbi.totalSummaryOffset > 0;
        bbi.extHeader           = bbi.extHeaderOffset    > 0;
        bbi.zoomHeaders         = [];

        for (var i = 0; i < bbi.numZoomLevels; i++) {
          reduction   = la[16 + 6*i];
          dataOffset  = read64Bit(ba, 72 + 24*i);
          indexOffset = read64Bit(ba, 80 + 24*i);

          bbi.zoomHeaders.push({
            reductionLevel : reduction,
            dataOffset     : dataOffset,
            indexOffset    : indexOffset
          });
        }

        readAutoSQL(readChromTree); // reading autoSQL passing next task as callback
      });
    }

    // autoSQL could be present in some bigbed files
    function readAutoSQL(cb) {
      if (bbi.asOffset === 0) {
        cb(); // no autoSQL present
      } else {
        // autoSQL present, need to parse
        getData(bbi.asOffset, 2048, function (d) {
          var ba = new Uint8Array(d);
          var s  = '';

          for (var i = 0; i < ba.length; i++) {
            if (ba[i] === 0) {
              break;
            }

            s += String.fromCharCode(ba[i]);
          }

          var header_re   = /(\w+)\s+(\w+)\s+("([^"]+)")?\s*\(\s*/;
          var field_re    = /([\w\[\]]+)\s+(\w+)\s*;\s*("([^"]+)")?\s*/g;
          var headerMatch = header_re.exec(s);

          if (headerMatch) {
            var as = {
              declType : headerMatch[1],
              name     : headerMatch[2],
              comment  : headerMatch[4],
              fields   : []
            };

            s = s.substring(headerMatch[0]);

            for (var m = field_re.exec(s); m !== null; m = field_re.exec(s)) {
              as.fields.push({
                type    : m[1],
                name    : m[2],
                comment : m[4]
              });
            }

            bbi.schema = as;
          }

          cb();
        });
      }
    }

    // reading B+ tree which maps chrom names to ids used in R-tree
    function readChromTree() {
      var len = bbi.unzoomedDataOffset - bbi.chromTreeOffset;
          len = len + (4 - len%4);

      getData(bbi.chromTreeOffset, len, function (d) {
        var ba    = new Uint8Array(d);
        var sa    = new Uint16Array(d);
        var la    = new Uint32Array(d);
        var magic = la[0];
        var error;

        function readChromTreeLeaf(nodeOffset) {
          // padding 8 byte
          var children = sa[(nodeOffset/2) + 1];
          var offset   = nodeOffset + 4;
          var chrom, i, c, idx, len;

          while (children > 0) {
            children--;
            chrom = '';

            for (i = 0; i < bbi.bpTree.keySize; i++) {
              c = ba[offset + i];

              if (c !== 0) {
                chrom += String.fromCharCode(c);
              }
            }

            offset += bbi.bpTree.keySize;

            idx = (ba[offset + 3] << 24) | (ba[offset + 2] << 16) | (ba[offset + 1] << 8) | (ba[offset + 0]);
            len = (ba[offset + 7] << 24) | (ba[offset + 6] << 16) | (ba[offset + 5] << 8) | (ba[offset + 4]);

            offset += 8;

            bbi.chroms[idx]  = chrom;
            bbi.lengths[idx] = len;
          }
        }

        if (magic === CIRTREE_MAGIC) {
          bbi.bpTree = {
            itemsPerBlock : la[1],
            keySize       : la[2],
            valueSize     : la[3],
            itemCount     : read64Bit(ba, 16)
          };

          bbi.chroms  = new Array(bbi.bpTree.itemCount);
          bbi.lengths = new Array(bbi.bpTree.itemCount);
        } else {
          error = 'chromosome id B+ tree not found!';
        }

        if (error) {
          callback(null, error);
        } else {
          readChromTreeLeaf(32);
        }

        readRTreeIndex();
      });
    }

    function readRTreeIndex() {
      getData(bbi.unzoomedIndexOffset, 48, function (d) {
        var ba    = new Uint8Array(d);
        var la    = new Uint32Array(d);
        var magic = la[0];

        if (magic === IDXTREE_MAGIC) {
          bbi.Rheader = {
            blockSize     : la[1],
            nItems        : read64Bit(ba, 8),
            chrIdxStart   : la[4],
            baseStart     : la[5],
            chrIdxEnd     : la[6],
            baseEnd       : la[7],
            endFileOffset : read64Bit(ba, 32),
            nItemsPerSlot : la[10]
          };

          bbi.rootOffset = bbi.unzoomedIndexOffset + 48;
          bbi.getValues  = getValues;

          callback(bbi);
        } else {
          callback(null, 'R-tree not found!');
        }
      });
    }

    function getRTreeNode(treedata, offset) {
      var ba       = new Uint8Array(treedata);
      var sa       = new Uint16Array(treedata);
      var la       = new Uint32Array(treedata);
      var children = sa[offset/2 + 1];
      var lo, i;

      var node = {
        isLeaf      : ba[offset],
        children    : children,
        chrIdxStart : new Array(children),
        baseStart   : new Array(children),
        chrIdxEnd   : new Array(children),
        baseEnd     : new Array(children),
        dataOffset  : new Array(children),
        x           : {}
      };

      if (node.isLeaf) {
        node.x.size = new Array(children);
      } else {
        node.x.child = new Array(children);

        for (i = 0; i < children; i++) {
          node.x.child[i] = -1;
        }
      }

      offset += 4;

      for (i = 0; i < children; i++) {
        lo = offset / 4;

        node.chrIdxStart[i] = la[lo];
        node.baseStart[i]   = la[lo + 1];
        node.chrIdxEnd[i]   = la[lo + 2];
        node.baseEnd[i]     = la[lo + 3];
        node.dataOffset[i]  = read64Bit(ba, offset + 16);

        offset += 24;

        if (node.isLeaf) {
          node.x.size[i] = read64Bit(ba, offset);
          offset += 8;
        }
      }

      return node;
    }

    function getValues(chrom, start, end, cb) {
      var vals    = [];
      var chromid = bbi.chroms.indexOf(chrom);

      if (chromid == -1) {
        chromid = bbi.chroms.indexOf('chr' + chrom);

        if (chromid == -1) {
          return cb([], 'chrom not found');
        }
      }

      var query = {
        chrom : chromid,
        start : start,
        end   : end
      };

      function traverseRTree() {
        var outstanding = 0;

        function fetchRTreeKids(offset, level) {
          outstanding += offset.length;

          var min         = offset[0];
          var maxNodeSize = 4 + bbi.Rheader.blockSize*32;
          var max         = offset[offset.length - 1] + maxNodeSize;

          getData(min, max - min, function (treedata) {
            // traverse kids
            for (var i = 0; i < offset.length; i++) {
              traverseRTreeKids(treedata, offset[i] - min, level);

              if (--outstanding === 0) {
                fetchBlocks();
              }
            }
          });
        }

        function traverseRTreeKids(treedata, offset, level) {
          var node     = getRTreeNode(treedata, offset);
          var overlaps = findOverlaps(node);
          var i;

          if (node.isLeaf) {
            for (i = 0; i < overlaps.length; i++){
              vals.push({
                offset : node.dataOffset[overlaps[i]],
                size   : node.x.size[overlaps[i]]
              });
            }

            return [];
          } else {
            fetchRTreeKids(overlaps.map(function (o) { return node.dataOffset[o]; }), level + 1);
          }
        }

        function findOverlaps(node) {
          var children = node.children;
          var overlaps = [];

          for (var i = 0; i < children; i++) {
            var startChrom = node.chrIdxStart[i];
            var startBase  = node.baseStart[i];
            var endChrom   = node.chrIdxEnd[i];
            var endBase    = node.baseEnd[i];

            if (
              ((startChrom < query.chrom) || (startChrom == query.chrom && startBase <= query.end)) &&
              ((endChrom   > query.chrom) || (endChrom   == query.chrom && endBase   >= query.start))
            ) {
              overlaps.push(i);
            }
          }

          return overlaps;
        }

        fetchRTreeKids([bbi.rootOffset], 1);
      }

      function fetchBlocks() {
        vals.sort(function (b0, b1) {
          return (b0.offset | 0) - (b1.offset | 0);
        });

        if (vals.length === 0) {
          return getBlocks();
        }

        var totalSize = 0;
        var base      = vals[0].offset;

        for (var i = 0; i < vals.length; i++) {
          totalSize += vals[i].size;
        }

        getData(base, totalSize, function (buffer) {
          var ioffset = 0;
          var bi      = 0;
          var fb, blockData;

          while (ioffset < totalSize) {
            fb = vals[bi];

            if (bbi.uncompressBufSize > 0) {
              blockData = dallianceLib.inflateBuffer(buffer, ioffset + 2, fb.size - 2);
            } else {
              blockData = buffer.slice(ioffset, ioffset + fb.size);
            }

            vals[bi].data = blockData;
            ioffset      += fb.size;
            bi++;
          }

          getBlocks();
        });
      }

      function getBlocks() {
        var parser = bbi.type == 'bigwig' ? WiggleParser : bbi.type == 'bigbed' ? BEDParser : false;
        var result = [];

        if (parser && vals.length) {
          for (var i = 0; i < vals.length; i++) {
            result = result.concat(parser(vals[i].data, query));
          }
        }

        cb(result);
      }

      traverseRTree();
    }

    function WiggleParser(data, query) {
      var arr        = [];
      var ba         = new Uint8Array(data);
      var sa         = new Int16Array(data);
      var la         = new Int32Array(data);
      var fa         = new Float32Array(data);
      var chromId    = la[0];
      var chr        = parseInt(bbi.chroms[chromId].replace('chr', ''), 10);
      var blockStart = la[1] + 1;
      var itemStep   = la[3];
      var itemSpan   = la[4];
      var blockType  = ba[20];
      var itemCount  = sa[11];
      var i, start, end, score;

      if (blockType === BIG_WIG_TYPE_FSTEP) { // fixedStep wiggle
        for (i = 0; i < itemCount; i++) {
          start = blockStart + i*itemStep;
          end   = start + itemSpan - 1;
          score = fa[i + 6];

          if (chromId == query.chrom) {
            arr.push({
              chr    : chr,
              start  : start,
              end    : end,
              height : score
            });
          }
        }
      } else if (blockType === BIG_WIG_TYPE_VSTEP) { // variable step wiggle
        for (i = 0; i < itemCount; i++) {
          start = la[i*2 + 6] + 1;
          end   = start + itemSpan - 1;
          score = fa[i*2 + 7];

          if (chromId == query.chrom) {
            arr.push({
              chr    : chr,
              start  : start,
              end    : end,
              height : score
            });
          }
        }
      } else if (blockType === BIG_WIG_TYPE_GRAPH) { // bedGraph
        for (i = 0; i < itemCount; i++) {
          start = la[i*3 + 6] + 1;
          end   = la[i*3 + 7];
          score = fa[i*3 + 8];

          if (start > end) {
            start = end;
          }

          if (chromId == query.chrom) {
            arr.push({
              chr    : chr,
              start  : start,
              end    : end,
              height : score
            });
          }
        }
      }

      return arr;
    }

    function BEDParser(data, query) {
      var arr      = [];
      var ba       = new Uint8Array(data);
      var la       = new Int32Array(data);
      var offset   = 0;
      var bbRecord, ch, rest;

      while (offset < la.length) {
        bbRecord = {
          chromid : la[offset],
          chr     : bbi.chroms[la[offset]],
          start   : la[offset + 1],
          end     : la[offset + 2]
        };

        offset += 12;

        while (true) {
          ch = ba[offset++];

          if (ch !== 0) {
            rest += String.fromCharCode(ch);
          } else {
            break;
          }
        }

        if (bbRecord.chromid === query.chrom) {
          arr.push([ bbRecord.chr, bbRecord.start, bbRecord.end, rest ].join('\t'));
        }
      }

      return arr;
    }

    // reads 8 bytes from data
    function read64Bit(ba, o) {
      var val = ba[o] + ba[o+1]*M1 + ba[o+2]*M2 + ba[o+3]*M3 + ba[o+4]*M4;
      return val;
    }

    function readFloat(ba, o) {
      var a = new Uint8Array([ ba[o], ba[o+1], ba[o+2], ba[o+3] ]);
      var b = a.buffer;
      var c = new Float32Array(b);
      return c[0];
    }

    // reads 4 bytes from data
    function read32Bit(ba, o) {
      var a = ba[o];
      var b = ba[o+1];
      var c = ba[o+2];
      var d = ba[o+3];
      var r = (a | ((b << 8) >>> 0) | ((c << 16) >>> 0) | ((d << 24) >>> 0)) >>> 0;
      return r;
    }

     // reads 2 bytes from data
    function read16Bit(ba, o) {
      var r = ba[o] | (ba[o+1] << 8);
      return r;
    }

    // reads 1 byte from data
    function read8Bit(ba, o) {
      return ba[o];
    }

    init();
  };

  window.BWReader = BWReader;

  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = BWReader;
  }
})();

(function () {
  var tabi_fmt = {
    string0: function (size) {
      return this.parse(['string', size]).replace(/\0+$/, '');
    },
    header: {
      magic   : ['string', 4],
      n_ref   : 'int32',
      format  : 'int32',
      col_seq : 'int32',
      col_beg : 'int32',
      col_end : 'int32',
      meta    : 'int32',
      skip    : 'int32',
      l_nm    : 'int32',
      names   : ['string0', function () { return this.current.l_nm; }]
    },
    chunk: {
      cnk_beg: 'uint64',
      cnk_end: 'uint64'
    },
    bin: {
      bin      : 'uint32',
      n_chunk  : 'int32',
      chunkseq : ['array', 'chunk', function () { return this.current.n_chunk; }]
    },
    index: {
      n_bin     : 'int32',
      binseq    : ['array', 'bin', function () { return this.current.n_bin; }],
      n_intv    : 'int32',
      intervseq : ['array', 'uint64', function () { return this.current.n_intv; }]
    },
    tabix: {
      head     : 'header',
      indexseq : ['array', 'index', function () { return this.current.head.n_ref; }]
    }
  };

  var bgzf_hd_fmt = {
    header: {
      id1   : 'uint8',
      id2   : 'uint8',
      cm    : 'uint8',
      flg   : 'uint8',
      mtime : 'uint32',
      xfl   : 'uint8',
      os    : 'uint8',
      xlen  : 'uint16'
    },
    subheader: {
      si1   : 'uint8',
      si2   : 'uint8',
      slen  : 'uint16',
      bsize : 'uint16'
    },
    bgzfHd: { head: 'header', subhead: 'subheader' }
  };

  var hdSize  = 18;
  var inflate = dallianceLib.inflateBuffer;
  var _2p16   = 1 << 16;

  var VCFReader = function (vcf, tbi) {
    this.vcf_data = vcf;
    this.tbi_data = tbi;
  };

  VCFReader.prototype.readTabix = function (cb) {
    var bins2hash = function (binseq) {
      var hash = {};
      var i    = 0;
      var b;

      for (var x in binseq) {
        b       = binseq[x].bin;
        hash[b] = i;
        i++;
      }

      return hash;
    };

    var parse_tabix = function (tabix_buffer) {
      var tabix = new jParser(tabix_buffer, tabi_fmt).parse('tabix');

      tabix.head.names = tabix.head.names.split('\0');
      tabix.bhash = {};

      for (var i = 0; i < tabix.head.n_ref; i++){
        tabix.bhash[i] = bins2hash(tabix.indexseq[i].binseq);
      }

      cb(tabix);
    };

    this.inflateRegion(this.tbi_data, 0, 100000000, parse_tabix);
  };

  VCFReader.prototype.getRecords = function (ref, beg, end, callback) {
    var records = [];
    var chunks  = this.getChunks(ref, beg, end);
    var vcfThis = this;

    if (chunks == -1) {
      return callback([]);
    }

    (function loop(x) {
      if (x < chunks.length) {
        vcfThis.inflateRegion(vcfThis.vcf_data, chunks[x].start, chunks[x].end, function (record, ebsz) {
          var last = record.byteLength - ebsz + chunks[x].inner_end;
          record = vcfThis.buffer2String(record).slice(chunks[x].inner_start, last);

          if (record.length > 0) {
            record = record.split('\n').filter(function (rec) {
              if (rec.length > 0) {
                var n = parseInt(rec.split('\t')[1]);
                return ((beg <= n) && (n <= end));
              }
            }).join('\n');

            records.push(record);
          }

          loop(++x);
        });
      } else {
        callback(records.join('\n'));
      }
    })(0);
  };

  VCFReader.prototype.getChunks = function (ref, beg, end) {
    var tbi     = this.tabix;
    var vcfThis = this;

    ref = tbi.head.names.indexOf(ref.toString());

    if (ref == -1) {
      return -1;
    }

    var bids  = this.reg2bins(beg, end + 1).filter(function (x) { return typeof tbi.bhash[ref][x] != 'undefined'; });
    var bcnks = bids.map(function (x) { return vcfThis.bin2Ranges(tbi, ref, x); });
    var cnks  = bcnks.reduce(function (V, ranges) {
      ranges.forEach(function (item) { V.push(item); });
      return V;
    }, []);

    cnks = this.remove_duplicates(cnks);

    return cnks;
  };

  VCFReader.prototype.inflateRegion = function (d, beg, end, cbfn) {
    var blocks  = [];
    var vcfThis = this;

    var cb = function (block, nextBlockOffset) {
      blocks.push(block);

      if (nextBlockOffset == -1) {
        cbfn(vcfThis.appendBuffers(blocks), blocks[blocks.length - 1].byteLength);
      } else if (nextBlockOffset <= end) {
        vcfThis.inflateBlock(d, nextBlockOffset, cb);
      } else {
        cbfn(vcfThis.appendBuffers(blocks), blocks[blocks.length - 1].byteLength);
      }
    };

    this.inflateBlock(d, beg, cb);
  };

  VCFReader.prototype.inflateBlock = function (d, blockOffset, cbfn) {
    var cb2 = function (hdobj) {
      d.slice(blockOffset, hdobj.subhead.bsize + 1).fetch(function (block) {
        var inflated_block  = inflate(block, hdSize, block.byteLength - hdSize);
        var nextBlockOffset = blockOffset + hdobj.subhead.bsize + 1;

        if (hdobj.subhead.bsize == 27) {
          nextBlockOffset = -1; // last bgzf block
        }

        cbfn(inflated_block, nextBlockOffset);
      });
    };

    this.getBGZFHD(d, blockOffset, cb2);
  };

  VCFReader.prototype.getBGZFHD = function (d, offset, cbfn) {
    d.slice(offset, hdSize + 1).fetch(function (buf) {
      var parser = new jParser(buf, bgzf_hd_fmt);
      var hdobj  = parser.parse('bgzfHd');
      cbfn(hdobj);
    });
  };

  VCFReader.prototype.appendBuffers = function (bufferVec) {
    var totalSize = 0;

    for (var i = 0; i < bufferVec.length; i++) {
      totalSize = totalSize + bufferVec[i].byteLength;
    }

    var tmp    = new Uint8Array(totalSize);
    var offset = 0;

    for (i = 0; i < bufferVec.length; i++) {
      tmp.set(new Uint8Array(bufferVec[i]), offset);
      offset = offset + bufferVec[i].byteLength;
    }

    return tmp.buffer;
  };

  VCFReader.prototype.buffer2String = function (resultBuffer) {
    var s        = '';
    var resultBB = new Uint8Array(resultBuffer);

    for (var i = 0; i < resultBB.length; ++i) {
      s += String.fromCharCode(resultBB[i]);
    }

    return s;
  };

  VCFReader.prototype.remove_duplicates = function (objectsArray) {
    var usedObjects = {};

    for (var i = objectsArray.length - 1; i >= 0; i--) {
      var so = JSON.stringify(objectsArray[i]);

      if (usedObjects[so]) {
        objectsArray.splice(i, 1);
      } else {
        usedObjects[so] = true;
      }
    }

    return objectsArray;
  };

  VCFReader.prototype.bin2Ranges = function (tbi, ref, binid) {
    var ranges = [];
    var bs     = tbi.indexseq[ref].binseq;
    var cnkseq = bs[tbi.bhash[ref][binid]].chunkseq;
    var cnk;

    for (var i = 0; i < cnkseq.length; i++) {
      cnk = cnkseq[i];

      ranges.push({
        start       : Math.floor(cnk.cnk_beg / _2p16),
        inner_start : cnk.cnk_beg % _2p16,
        end         : Math.floor(cnk.cnk_end / _2p16),
        inner_end   : cnk.cnk_end % _2p16
      });
    }

    return ranges;
  };

  VCFReader.prototype.reg2bins = function (beg, end) {
    var list = [];
    var i;

    --end;

    list.push(0);

    for (i = 1    + (beg >> 26); i <= 1    + (end >> 26); ++i) { list.push(i); }
    for (i = 9    + (beg >> 23); i <= 9    + (end >> 23); ++i) { list.push(i); }
    for (i = 73   + (beg >> 20); i <= 73   + (end >> 20); ++i) { list.push(i); }
    for (i = 585  + (beg >> 17); i <= 585  + (end >> 17); ++i) { list.push(i); }
    for (i = 4681 + (beg >> 14); i <= 4681 + (end >> 14); ++i) { list.push(i); }

    return list;
  };

  window.VCFReader = VCFReader;

  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = VCFReader;
  }
})();

var Genoverse = Base.extend({
  // Defaults
  urlParamTemplate   : 'r=__CHR__:__START__-__END__', // Overwrite this for your URL style
  width              : 1000,
  longestLabel       : 30,
  defaultLength      : 5000,
  defaultScrollDelta : 100,
  tracks             : [],
  highlights         : [],
  plugins            : [],
  dragAction         : 'scroll',         // Options are: scroll, select, off
  wheelAction        : 'off',            // Options are: zoom, off
  isStatic           : false,            // If true, will stop drag, select and zoom actions occurring
  saveable           : false,            // If true, track configuration and ordering will be saved in sessionStorage/localStorage
  saveKey            : '',               // Default key for sessionStorage/localStorage configuration is 'genoverse'. saveKey will be appended to this if it is set
  storageType        : 'sessionStorage', // Set to localStorage for permanence
  autoHideMessages   : true,             // Determines whether to collapse track messages by default
  trackAutoHeight    : false,            // Determines whether to automatically resize tracks to show all their features (can be overridden by track.autoHeight)
  hideEmptyTracks    : true,             // Determines whether to hide an automatically resized tracks if it has no features, or to show it empty (can be overridden by track.hideEmpty)
  genome             : undefined,        // The genome used in the browser - can be an object or a string, which will be used to obtain a javascript file
  useHash            : undefined,        // If true, window.location.hash is changed on navigation. If false, window.history.pushState is used. If undefined, pushState will be used if present in the browser

  // Default coordinates for initial view, overwrite in your config
  chr   : 1,
  start : 1,
  end   : 1000000,

  constructor: function (config) {
    var browser = this;

    if (!this.supported()) {
      return this.die('Your browser does not support this functionality');
    }

    config = config || {};

    config.container = $(config.container); // Make sure container is a jquery object, jquery recognises itself automatically

    if (!(config.container && config.container.length)) {
      config.container = $('<div>').appendTo('body');
    }

    config.container.addClass('genoverse').data('genoverse', this);

    $.extend(this, config);

    this.eventNamespace = '.genoverse.' + (++Genoverse.id);
    this.events         = { browser: {}, tracks: {} };

    $.when(Genoverse.ready, this.loadGenome(), this.loadPlugins()).always(function () {
      Genoverse.wrapFunctions(browser);
      browser.init();
    });
  },

  loadGenome: function () {
    if (typeof this.genome === 'string') {
      var genomeName = this.genome;

      return $.ajax({
        url      : Genoverse.origin + 'js/genomes/' + genomeName + '.js',
        dataType : 'script',
        context  : this,
        success  : function () {
          this.genome = Genoverse.Genomes[genomeName];

          if (!this.genome) {
            this.die('Unable to load genome ' + genomeName);
          }
        }
      });
    }
  },

  loadPlugins: function (plugins) {
    var browser         = this;
    var loadPluginsTask = $.Deferred();

    plugins = plugins || this.plugins;

    this.loadedPlugins = this.loadedPlugins || {};

    for (var i in Genoverse.Plugins) {
      this.loadedPlugins[i] = this.loadedPlugins[i] || 'script';
    }

    if (typeof plugins === 'string') {
      plugins = [ plugins ];
    }

    function loadPlugin(plugin) {
      var css      = Genoverse.origin + 'css/'        + plugin + '.css';
      var js       = Genoverse.origin + 'js/plugins/' + plugin + '.js';
      var deferred = $.Deferred();

      function getCSS() {
        function done() {
          browser.loadedPlugins[plugin] = browser.loadedPlugins[plugin] || 'script';
          deferred.resolve(plugin);
        }

        if (Genoverse.Plugins[plugin].noCSS || $('link[href="' + css + '"]').length) {
          return done();
        }

        $('<link href="' + css + '" rel="stylesheet">').on('load', done).appendTo('body');
      }

      if (browser.loadedPlugins[plugin] || $('script[src="' + js + '"]').length) {
        getCSS();
      } else {
        $.getScript(js, getCSS);
      }

      return deferred;
    }

    function initializePlugin(plugin) {
      if (typeof Genoverse.Plugins[plugin] !== 'function' || browser.loadedPlugins[plugin] === true) {
        return [];
      }

      var requires = Genoverse.Plugins[plugin].requires;
      var deferred = $.Deferred();

      function init() {
        if (browser.loadedPlugins[plugin] !== true) {
          Genoverse.Plugins[plugin].call(browser);
          browser.container.addClass('gv-' + plugin.replace(/([A-Z])/g, '-$1').toLowerCase() + '-plugin');
          browser.loadedPlugins[plugin] = true;
        }

        deferred.resolve();
      }

      if (requires) {
        $.when(browser.loadPlugins(requires)).done(init);
      } else {
        init();
      }

      return deferred;
    }

    // Load plugins css file
    $.when.apply($, $.map(plugins, loadPlugin)).done(function () {
      var pluginsLoaded = [];
      var plugin;

      for (var i = 0; i < arguments.length; i++) {
        plugin = arguments[i];

        if (browser.loadedPlugins[plugin] !== true) {
          pluginsLoaded.push(initializePlugin(plugin));
        }
      }

      $.when.apply($, pluginsLoaded).always(loadPluginsTask.resolve);
    });

    return loadPluginsTask;
  },

  init: function () {
    var width = this.width;

    this.addDomElements(width);
    this.addUserEventHandlers();

    if (this.isStatic) {
      this.dragAction       = this.wheelAction = 'off';
      this.urlParamTemplate = false;
    }

    this.tracksById       = {};
    this.prev             = {};
    this.legends          = {};
    this.saveKey          = this.saveKey ? 'genoverse-' + this.saveKey : 'genoverse';
    this.urlParamTemplate = this.urlParamTemplate || '';
    this.useHash          = typeof this.useHash === 'boolean' ? this.useHash : typeof window.history.pushState !== 'function';
    this.textWidth        = document.createElement('canvas').getContext('2d').measureText('W').width;
    this.labelWidth       = this.labelContainer.outerWidth(true);
    this.width           -= this.labelWidth;
    this.paramRegex       = this.urlParamTemplate ? new RegExp('([?&;])' + this.urlParamTemplate
      .replace(/(\b(\w+=)?__CHR__(.)?)/,   '$2([\\w\\.]+)$3')
      .replace(/(\b(\w+=)?__START__(.)?)/, '$2(\\d+)$3')
      .replace(/(\b(\w+=)?__END__(.)?)/,   '$2(\\d+)$3') + '([;&])'
    ) : '';

    var urlCoords = this.getURLCoords();
    var coords    = urlCoords.chr && urlCoords.start && urlCoords.end ? urlCoords : { chr: this.chr, start: this.start, end: this.end };

    this.chr = coords.chr;

    if (this.genome) {
      this.chromosomeSize = this.genome[this.chr].size;
    }

    this.canChangeChr = !!this.genome;

    if (this.saveable) {
      this.loadConfig();
    } else {
      this.addTracks();
    }

    this.setRange(coords.start, coords.end);

    if (this.highlights.length) {
      this.addHighlights(this.highlights);
    }
  },

  loadConfig: function () {
    this.defaultTracks = $.extend([], true, this.tracks);

    var config = window[this.storageType].getItem(this.saveKey);

    if (config) {
      config = JSON.parse(config);
    } else {
      return this.addTracks();
    }

    var tracksByNamespace = Genoverse.getAllTrackTypes();
    var tracks            = [];
    var tracksById        = {};
    var savedConfig       = {};
    var i, prop, track;

    function setConfig(track, conf) {
      for (prop in conf) {
        if (prop === 'config') {
          savedConfig[conf.id] = conf[prop];
        } else {
          if (prop === 'height') {
            conf[prop] = parseInt(conf[prop], 10);

            if (isNaN(conf[prop])) {
              continue;
            }
          }

          track.prototype[prop] = conf[prop];
        }
      }
    }

    for (i = 0; i < this.tracks.length; i++) {
      if (this.tracks[i].prototype.id) {
        tracksById[this.tracks[i].prototype.id] = this.tracks[i];
      }
    }

    for (i = 0; i < config.length; i++) {
      track = tracksById[config[i].id];

      if (track) {
        setConfig(track, config[i]);
        track._fromStorage = true;
      } else if (tracksByNamespace[config[i].namespace]) {
        track = tracksByNamespace[config[i].namespace];

        this.trackIds = this.trackIds || {};
        this.trackIds[track.prototype.id] = this.trackIds[track.prototype.id] || 1;

        config[i].id = config[i].id || track.prototype.id;

        track = track.extend({ id: !tracksById[config[i].id] ? config[i].id : track.prototype.id + (tracksById[track.prototype.id] ? this.trackIds[track.prototype.id]++ : '') });

        setConfig(track, config[i]);
        tracks.push(track);
      }
    }

    for (i = 0; i < this.tracks.length; i++) {
      if (this.tracks[i].prototype.id && !this.tracks[i]._fromStorage) {
        continue;
      }

      tracks.push(this.tracks[i]);
    }

    this.tracks      = tracks;
    this.savedConfig = savedConfig;

    this.addTracks();
  },

  saveConfig: function () {
    if (this._constructing || !this.saveable) {
      return;
    }

    var config = [];
    var conf, j;

    for (var i = 0; i < this.tracks.length; i++) {
      if (this.tracks[i].id && !(this.tracks[i] instanceof Genoverse.Track.Legend) && !(this.tracks[i] instanceof Genoverse.Track.HighlightRegion)) {
        // when saving height, initialHeight is the height of the track once margins have been added, while defaultHeight is the DEFINED height of the track.
        // Subtracting the difference between them gives you back the correct height to input back into the track when loading configuration
        conf = {
          id         : this.tracks[i].id,
          namespace  : this.tracks[i].namespace,
          order      : this.tracks[i].order,
          autoHeight : this.tracks[i].autoHeight,
          height     : this.tracks[i].height - (this.tracks[i].initialHeight - this.tracks[i].defaultHeight)
        };

        if (this.tracks[i].config) {
          for (j in this.tracks[i].config) {
            conf.config    = conf.config || {};
            conf.config[j] = this.tracks[i].config[j];
          }
        }

        config.push(conf);
      }
    }

    // Safari in private browsing mode does not allow writes to storage, so wrap in a try/catch to stop errors occuring
    try {
      window[this.storageType].setItem(this.saveKey, JSON.stringify(config));
    } catch (e) {}
  },

  resetConfig: function () {
    // Non removable highlights should be re-added after reset
    var unremovableHighlights = [];

    if (this.tracksById.highlights) {
      this.tracksById.highlights.removeHighlights();
      unremovableHighlights = $.map(this.tracksById.highlights.prop('featuresById'), function (h) { return h; });
    }

    window[this.storageType].removeItem(this.saveKey);

    this._constructing = true;
    this.savedConfig   = {};

    this.removeTracks($.extend([],    this.tracks)); // Shallow clone to ensure that removeTracks doesn't hit problems when splicing this.tracks
    this.addTracks($.extend(true, [], this.defaultTracks));

    if (unremovableHighlights.length) {
      this.addHighlights(unremovableHighlights);
    }

    this._constructing = false;
  },

  addDomElements: function (width) {
    this.menus          = $();
    this.labelContainer = $('<ul class="gv-label-container">').appendTo(this.container).sortable({
      items  : 'li:not(.gv-unsortable)',
      handle : '.gv-handle',
      axis   : 'y',
      helper : 'clone',
      cursor : 'move',
      update : $.proxy(this.updateTrackOrder, this),
      start  : function (e, ui) {
        ui.placeholder.css({ height: ui.item.height(), visibility: 'visible' }).html(ui.item.html());
        ui.helper.hide();
      }
    });

    this.wrapper  = $('<div class="gv-wrapper">').appendTo(this.container);
    this.selector = $('<div class="gv-selector gv-crosshair">').appendTo(this.wrapper);

    this.selectorControls = this.zoomInHighlight = this.zoomOutHighlight = $();

    this.container.addClass('gv-canvas-container').width(width);

    if (!this.isStatic) {
      this.selectorControls = $(
        '<div class="gv-selector-controls gv-panel">'         +
        '  <div class="gv-button-set">'                       +
        '  <div class="gv-position">'                         +
        '    <div class="gv-chr"></div>'                      +
        '    <div class="gv-start-end">'                      +
        '      <div class="gv-start"></div>'                  +
        '      <div class="gv-end"></div>'                    +
        '    </div>'                                          +
        '  </div>'                                            +
        '  </div>'                                            +
        '  <div class="gv-button-set">'                       +
        '    <button class="gv-zoom-here">Zoom here</button>' +
        '  </div>'                                            +
        '  <div class="gv-button-set">'                       +
        '    <button class="gv-center">Center</button>'       +
        '  </div>'                                            +
        '  <div class="gv-button-set">'                       +
        '    <button class="gv-highlight">Highlight</button>' +
        '  </div>'                                            +
        '  <div class="gv-button-set">'                       +
        '    <button class="gv-cancel">Cancel</button>'       +
        '  </div>'                                            +
        '</div>'
      ).appendTo(this.selector);

      this.zoomInHighlight = $(
        '<div class="gv-canvas-zoom gv-i">' +
        '  <div class="gv-t gv-l gv-h"></div>' +
        '  <div class="gv-t gv-r gv-h"></div>' +
        '  <div class="gv-t gv-l gv-v"></div>' +
        '  <div class="gv-t gv-r gv-v"></div>' +
        '  <div class="gv-b gv-l gv-h"></div>' +
        '  <div class="gv-b gv-r gv-h"></div>' +
        '  <div class="gv-b gv-l gv-v"></div>' +
        '  <div class="gv-b gv-r gv-v"></div>' +
        '</div>'
      ).appendTo('body');

      this.zoomOutHighlight = this.zoomInHighlight.clone().toggleClass('gv-i gv-o').appendTo('body');
    }
  },

  addUserEventHandlers: function () {
    var browser        = this;
    var documentEvents = {};

    this.container.on({
      mousedown: function (e) {
        browser.hideMessages();

        // Only scroll on left click, and do nothing if clicking on a button in selectorControls
        if ((!e.which || e.which === 1) && !(this === browser.selector[0] && e.target !== this)) {
          browser.mousedown(e);
        }

        return false;
      },
      mousewheel: function (e, delta, deltaX, deltaY) {
        if (browser.noWheelZoom) {
          return true;
        }

        browser.hideMessages();

        if (deltaY === 0 && deltaX !== 0) {
          browser.startDragScroll(e);
          browser.move(-deltaX * 10);
          browser.stopDragScroll(false);
        } else if (browser.wheelAction === 'zoom') {
          return browser.mousewheelZoom(e, delta);
        }
      },
      dblclick: function (e) {
        if (browser.isStatic) {
          return true;
        }

        browser.hideMessages();
        browser.mousewheelZoom(e, 1);
      }
    }, '.gv-image-container, .gv-selector');

    this.selectorControls.on('click', function (e) {
      var pos = browser.getSelectorPosition();

      switch (e.target.className) {
        case 'gv-zoom-here' : browser.setRange(pos.start, pos.end, true); break;
        case 'gv-center'    : browser.moveTo(browser.chr, pos.start, pos.end, true, true); browser.cancelSelect(); break;
        case 'gv-highlight' : browser.addHighlight({ chr: browser.chr, start: pos.start, end: pos.end });
        case 'gv-cancel'    : browser.cancelSelect(); break;
        default             : break;
      }
    });

    documentEvents['mouseup'    + this.eventNamespace] = $.proxy(this.mouseup,   this);
    documentEvents['mousemove'  + this.eventNamespace] = $.proxy(this.mousemove, this);
    documentEvents['keydown'    + this.eventNamespace] = $.proxy(this.keydown,   this);
    documentEvents['keyup'      + this.eventNamespace] = $.proxy(this.keyup,     this);
    documentEvents['mousewheel' + this.eventNamespace] = function (e) {
      if (browser.wheelAction === 'zoom') {
        if (browser.wheelTimeout) {
          clearTimeout(browser.wheelTimeout);
        }

        browser.noWheelZoom  = browser.noWheelZoom || e.target !== browser.container[0];
        browser.wheelTimeout = setTimeout(function () { browser.noWheelZoom = false; }, 300);
      }
    };

    $(document).on(documentEvents);
    $(window).on((this.useHash ? 'hashchange' : 'popstate') + this.eventNamespace, $.proxy(this.popState, this));
  },

  onTracks: function () {
    var args = $.extend([], arguments);
    var func = args.shift();
    var mvc;

    for (var i = 0; i < this.tracks.length; i++) {
      if (this.tracks[i].disabled) {
        continue;
      }

      mvc = this.tracks[i]._interface[func];

      if (mvc) {
        this.tracks[i][mvc][func].apply(this.tracks[i][mvc], args);
      } else if (this.tracks[i][func]) {
        this.tracks[i][func].apply(this.tracks[i], args);
      }
    }
  },

  reset: function () {
    this.onTracks.apply(this, [ 'reset' ].concat([].slice.call(arguments)));
    this.prev  = {};
    this.scale = 9e99; // arbitrary value so that setScale resets track scales as well
    this.setRange(this.start, this.end);
  },

  setWidth: function (width) {
    this.width  = width;
    this.width -= this.labelWidth;

    if (this.controlPanel) {
      this.width -= this.controlPanel.width();
    }

    if (this.superContainer) {
      this.superContainer.width(width);
      this.container.width(this.width);
    } else {
      this.container.width(width);
    }

    this.onTracks('setWidth', this.width);
    this.reset('resizing');
  },

  mousewheelZoom: function (e, delta) {
    var browser = this;

    clearTimeout(this.zoomDeltaTimeout);
    clearTimeout(this.zoomTimeout);

    this.zoomDeltaTimeout = setTimeout(function () {
      if (delta > 0) {
        browser.zoomInHighlight.css({ left: e.pageX - 20, top: e.pageY - 20, display: 'block' }).animate({
          width: 80, height: 80, top: '-=20', left: '-=20'
        }, {
          complete: function () { $(this).css({ width: 40, height: 40, display: 'none' }); }
        });
      } else {
        browser.zoomOutHighlight.css({ left: e.pageX - 40, top: e.pageY - 40, display: 'block' }).animate({
          width: 40, height: 40, top: '+=20', left: '+=20'
        }, {
          complete: function () { $(this).css({ width: 80, height: 80, display: 'none' }); }
        });
      }
    }, 100);

    this.zoomTimeout = setTimeout(function () {
      browser[delta > 0 ? 'zoomIn' : 'zoomOut'](e.pageX - browser.container.offset().left - browser.labelWidth);

      if (browser.dragAction === 'select') {
        browser.moveSelector(e);
      }
    }, 300);

    return false;
  },

  startDragScroll: function (e) {
    this.dragging    = 'scroll';
    this.scrolling   = !e;
    this.dragOffset  = e ? e.pageX - this.left : 0;
    this.dragStart   = this.start;
    this.scrollDelta = Math.max(this.scale, this.defaultScrollDelta);
  },

  stopDragScroll: function (update) {
    this.dragging  = false;
    this.scrolling = false;

    if (update !== false) {
      if (this.start !== this.dragStart) {
        this.updateURL();
      }

      this.checkTrackHeights();
    }
  },

  startDragSelect: function (e) {
    if (!e) {
      return false;
    }

    var x = Math.max(0, e.pageX - this.wrapper.offset().left - 2);

    this.dragging        = 'select';
    this.selectorStalled = false;
    this.selectorStart   = x;

    this.selector.css({ left: x, width: 0 }).removeClass('gv-crosshair');
    this.selectorControls.hide();
  },

  stopDragSelect: function (e) {
    if (!e) {
      return false;
    }

    this.dragging        = false;
    this.selectorStalled = true;

    if (this.selector.outerWidth(true) < 2) {
      return this.cancelSelect();
    }

    // Calculate the position, so that selectorControls appear near the mouse cursor
    var top = Math.min(e.pageY - this.wrapper.offset().top, this.wrapper.outerHeight(true) - 1.2 * this.selectorControls.outerHeight(true));
    var pos = this.getSelectorPosition();

    this.selectorControls.find('.gv-chr').html(this.chr);
    this.selectorControls.find('.gv-start').html(pos.start);
    this.selectorControls.find('.gv-end').html(pos.end);

    this.selectorControls.find('.gv-selector-location').html(this.chr + ':' + pos.start + '-' + pos.end).end().css({
      top  : top,
      left : this.selector.outerWidth(true) / 2 - this.selectorControls.outerWidth(true) / 2
    }).show();
  },

  cancelSelect: function (keepDragging) {
    if (!keepDragging) {
      this.dragging = false;
    }

    this.selectorStalled = false;

    this.selector.addClass('gv-crosshair').width(0);
    this.selectorControls.hide();

    if (this.dragAction === 'scroll') {
      this.selector.hide();
    }
  },

  dragSelect: function (e) {
    var x = e.pageX - this.wrapper.offset().left;

    if (x > this.selectorStart) {
      this.selector.css({
        left  : this.selectorStart,
        width : Math.min(x - this.selectorStart, this.width - this.selectorStart - 1)
      });
    } else {
      this.selector.css({
        left  : Math.max(x, 1),
        width : Math.min(this.selectorStart - x, this.selectorStart - 1)
      });
    }
  },

  setDragAction: function (action, keepSelect) {
    this.dragAction = action;

    if (this.dragAction === 'select') {
      this.selector.addClass('gv-crosshair').width(0).show();
    } else if (keepSelect && !this.selector.hasClass('gv-crosshair')) {
      this.selectorStalled = false;
    } else {
      this.cancelSelect();
      this.selector.hide();
    }
  },

  toggleSelect: function (on) {
    if (on) {
      this.prev.dragAction = 'scroll';
      this.setDragAction('select');
    } else {
      this.setDragAction(this.prev.dragAction, true);
      delete this.prev.dragAction;
    }
  },

  setWheelAction: function (action) {
    this.wheelAction = action;
  },

  keydown: function (e) {
    if (e.which === 16 && !this.prev.dragAction && this.dragAction === 'scroll') { // shift key
      this.toggleSelect(true);
    } else if (e.which === 27) { // escape key
      this.cancelSelect();
      this.closeMenus();
    }
  },

  keyup: function (e) {
    if (e.which === 16 && this.prev.dragAction) { // shift key
      this.toggleSelect();
    }
  },

  mousedown: function (e) {
    if (e.shiftKey) {
      if (this.dragAction === 'scroll') {
        this.toggleSelect(true);
      }
    } else if (this.prev.dragAction) {
      this.toggleSelect();
    }

    switch (this.dragAction) {
      case 'select' : this.startDragSelect(e); break;
      case 'scroll' : this.startDragScroll(e); break;
      default       : break;
    }
  },

  mouseup: function (e) {
    switch (this.dragging) {
      case 'select' : this.stopDragSelect(e); break;
      case 'scroll' : this.stopDragScroll();  break;
      default       : break;
    }
  },

  mousemove: function (e) {
    if (this.dragging && !this.scrolling) {
      switch (this.dragAction) {
        case 'scroll' : this.move(e.pageX - this.dragOffset - this.left); break;
        case 'select' : this.dragSelect(e); break;
        default       : break;
      }
    } else if (this.dragAction === 'select') {
      this.moveSelector(e);
    }
  },

  moveSelector: function (e) {
    if (!this.selectorStalled) {
      this.selector.css('left', e.pageX - this.wrapper.offset().left - 2);
    }
  },

  move: function (delta) {
    var scale = this.scale;
    var start, end, left;

    if (scale > 1) {
      delta = Math.round(delta / scale) * scale; // Force stepping by base pair when in small regions
    }

    left = this.left + delta;

    if (left <= this.minLeft) {
      left  = this.minLeft;
      delta = this.minLeft - this.left;
    } else if (left >= this.maxLeft) {
      left  = this.maxLeft;
      delta = this.maxLeft - this.left;
    }

    start = Math.max(Math.round(this.start - delta / scale), 1);
    end   = start + this.length - 1;

    if (end > this.chromosomeSize) {
      end   = this.chromosomeSize;
      start = end - this.length + 1;
    }

    this.left = left;

    if (start !== this.dragStart) {
      this.closeMenus();
      this.cancelSelect(true);
    }

    this.onTracks('move', delta);
    this.setRange(start, end);
  },

  moveTo: function (chr, start, end, update, keepLength) {
    if (typeof chr !== 'undefined' && chr != this.chr) {
      if (this.canChangeChr) {
        if (this.genome && this.genome[chr]) {
          this.chr            = chr;
          this.chromosomeSize = this.genome[chr].size;
          this.start          = this.end = this.scale = -1;
        } else {
          this.die('Chromosome cannot be found in genome');
        }

        this.onTracks('changeChr');
      } else {
        this.die('Chromosome changing is not allowed');
      }
    }

    this.setRange(start, end, update, keepLength);

    if (this.prev.scale === this.scale) {
      this.left = Math.max(Math.min(this.left + Math.round((this.prev.start - this.start) * this.scale), this.maxLeft), this.minLeft);
      this.onTracks('moveTo', this.chr, this.start, this.end, (this.prev.start - this.start) * this.scale);
    }
  },

  setRange: function (start, end, update, keepLength) {
    this.prev.start = this.start;
    this.prev.end   = this.end;
    this.start      = Math.min(Math.max(typeof start === 'number' ? Math.floor(start) : parseInt(start, 10), 1), this.chromosomeSize);
    this.end        = Math.max(Math.min(typeof end   === 'number' ? Math.floor(end)   : parseInt(end,   10), this.chromosomeSize), 1);

    if (this.end < this.start) {
      this.end = Math.min(this.start + this.defaultLength - 1, this.chromosomeSize);
    }

    if (keepLength && this.end - this.start + 1 !== this.length) {
      if (this.end === this.chromosomeSize) {
        this.start = this.end - this.length + 1;
      } else {
        var center = (this.start + this.end) / 2;
        this.start = Math.max(Math.floor(center - this.length / 2), 1);
        this.end   = this.start + this.length - 1;

        if (this.end > this.chromosomeSize) {
          this.end   = this.chromosomeSize;
          this.start = this.end - this.length + 1;
        }
      }
    } else {
      this.length = this.end - this.start + 1;
    }

    this.setScale();

    if (update === true && (this.prev.start !== this.start || this.prev.end !== this.end)) {
      this.updateURL();
    }
  },

  setScale: function () {
    this.prev.scale  = this.scale;
    this.scale       = this.width / this.length;
    this.scaledStart = this.start * this.scale;

    if (this.prev.scale !== this.scale) {
      this.left        = 0;
      this.minLeft     = Math.round((this.end   - this.chromosomeSize) * this.scale);
      this.maxLeft     = Math.round((this.start - 1) * this.scale);
      this.labelBuffer = Math.ceil(this.textWidth / this.scale) * this.longestLabel;

      if (this.prev.scale) {
        this.cancelSelect();
        this.closeMenus();
      }

      this.onTracks('setScale');
      this.onTracks('makeFirstImage');
    }
  },

  checkTrackHeights: function () {
    if (this.dragging) {
      return;
    }

    this.onTracks('checkHeight');
  },

  resetTrackHeights: function () {
    this.onTracks('resetHeight');
  },

  zoomIn: function (x) {
    if (!x) {
      x = this.width / 2;
    }

    var start = Math.round(this.start + x / (2 * this.scale));
    var end   = this.length === 2 ? start : Math.round(start + (this.length - 1) / 2);

    this.setRange(start, end, true);
  },

  zoomOut: function (x) {
    if (!x) {
      x = this.width / 2;
    }

    var start = Math.round(this.start - x / this.scale);
    var end   = this.length === 1 ? start + 1 : Math.round(start + 2 * (this.length - 1));

    this.setRange(start, end, true);
  },

  addTrack: function (track, after) {
    return this.addTracks([ track ], after)[0];
  },

  addTracks: function (tracks, after) {
    var defaults = {
      browser : this,
      width   : this.width
    };

    var push = !!tracks;
    var order;

    tracks = tracks || $.extend([], this.tracks);

    if (push && !$.grep(this.tracks, function (t) { return typeof t === 'function'; }).length) {
      var insertAfter = (after ? $.grep(this.tracks, function (t) { return t.order < after; }) : this.tracks).sort(function (a, b) { return b.order - a.order; })[0];

      if (insertAfter) {
        order = insertAfter.order + 0.1;
      }
    }

    for (var i = 0; i < tracks.length; i++) {
      tracks[i] = new tracks[i]($.extend(defaults, {
        namespace : Genoverse.getTrackNamespace(tracks[i]),
        order     : typeof order === 'number' ? order : i,
        config    : this.savedConfig ? $.extend(true, {}, this.savedConfig[tracks[i].prototype.id]) : undefined
      }));

      if (tracks[i].id) {
        this.tracksById[tracks[i].id] = tracks[i];
      }

      if (push) {
        this.tracks.push(tracks[i]);
      } else {
        this.tracks[i] = tracks[i];
      }
    }

    this.sortTracks();
    this.saveConfig();

    return tracks;
  },

  removeTrack: function (track) {
    this.removeTracks((track.prop('childTracks') || []).concat(track));
  },

  removeTracks: function (tracks) {
    var i = tracks.length;
    var track, j;

    while (i--) {
      track = tracks[i];
      j     = this.tracks.length;

      while (j--) {
        if (track === this.tracks[j]) {
          this.tracks.splice(j, 1);
          break;
        }
      }

      if (track.id) {
        delete this.tracksById[track.id];
      }

      track.destructor(); // Destroy DOM elements and track itself
    }

    this.saveConfig();
  },

  sortTracks: function () {
    if ($.grep(this.tracks, function (t) { return typeof t !== 'object'; }).length) {
      return;
    }

    var sorted     = $.extend([], this.tracks).sort(function (a, b) { return a.order - b.order; });
    var labels     = $();
    var containers = $();
    var container;

    for (var i = 0; i < sorted.length; i++) {
      if (sorted[i].prop('parentTrack')) {
        continue;
      }

      if (!sorted[i].prop('fixedOrder')) {
        sorted[i].prop('order', i);
      }

      container = sorted[i].prop('superContainer') || sorted[i].prop('container');

      if (sorted[i].prop('menus').length) {
        sorted[i].prop('top', container.position().top);
      }

      labels.push(sorted[i].prop('label')[0]);
      containers.push(container[0]);
    }

    this.labelContainer.append(labels);
    this.wrapper.append(containers);

    // Correct the order
    this.tracks = sorted;

    labels.map(function () { return $(this).data('track'); }).each(function () {
      if (this.prop('menus').length) {
        var diff = (this.prop('superContainer') || this.prop('container')).position().top - this.prop('top');
        this.prop('menus').css('top', function (i, top) { return parseInt(top, 10) + diff; });
        this.prop('top', null);
      }
    });

    sorted = labels = containers = null;
  },

  updateTrackOrder: function (e, ui) {
    var track = ui.item.data('track');

    if (track.prop('unsortable') || track.prop('fixedOrder')) {
      return;
    }

    var prev = ui.item.prev().data('track');
    var next = ui.item.next().data('track');
    var p    = prev ? prev.prop('order') : 0;
    var n    = next ? next.prop('order') : 0;
    var o    = p || n;
    var order;

    if (prev && next && Math.floor(n) === Math.floor(p)) {
      order = p + (n - p) / 2;
    } else {
      order = o + (p ? 1 : -1) * Math.abs(Math.round(o) - o || 1) / 2;
    }

    track.prop('order', order);

    this.sortTracks();
    this.saveConfig();
  },

  updateURL: function () {
    if (this.urlParamTemplate) {
      if (this.useHash) {
        window.location.hash = this.getQueryString();
      } else {
        window.history.pushState({}, '', this.getQueryString());
      }
    }
  },

  popState: function () {
    var coords = this.getURLCoords();
    var start  = parseInt(coords.start, 10);
    var end    = parseInt(coords.end,   10);

    if (
      (coords.chr && coords.chr != this.chr) ||
      (coords.start && !(start === this.start && end === this.end))
    ) {
      // FIXME: a back action which changes scale or a zoom out will reset tracks, since scrollStart will not be the same as it was before
      this.moveTo(coords.chr, start, end);
    }

    this.closeMenus();
    this.hideMessages();
  },

  getURLCoords: function () {
    var match  = ((this.useHash ? window.location.hash.replace(/^#/, '?') || window.location.search : window.location.search) + '&').match(this.paramRegex);
    var coords = {};
    var i      = 0;

    if (!match) {
      return coords;
    }

    match = match.slice(2, -1);

    $.each(this.urlParamTemplate.split('__'), function () {
      var tmp = this.match(/^(CHR|START|END)$/);

      if (tmp) {
        coords[tmp[1].toLowerCase()] = tmp[1] === 'CHR' ? match[i++] : parseInt(match[i++], 10);
      }
    });

    return coords;
  },

  getQueryString: function () {
    var location = this.urlParamTemplate
      .replace('__CHR__',   this.chr)
      .replace('__START__', this.start)
      .replace('__END__',   this.end);

    return this.useHash ? location : window.location.search ? (window.location.search + '&').replace(this.paramRegex, '$1' + location + '$5').slice(0, -1) : '?' + location;
  },

  getChromosomeSize: function (chr) {
    return chr && this.genome && this.genome[chr] ? this.genome[chr].size : this.chromosomeSize;
  },

  supported: function () {
    var el = document.createElement('canvas');
    return !!(el.getContext && el.getContext('2d'));
  },

  die: function (error, el) {
    if (el && el.length) {
      el.html(error);
    } else {
      throw error;
    }

    this.failed = true;
  },

  menuTemplate: $(
    '<div class="gv-menu">'                                            +
      '<div class="gv-close gv-menu-button fa fa-times-circle"></div>' +
      '<div class="gv-menu-loading">Loading...</div>'                  +
      '<div class="gv-menu-content">'                                  +
        '<div class="gv-title"></div>'                                 +
        '<a class="gv-focus" href="#">Focus here</a>'                  +
        '<a class="gv-highlight" href="#">Highlight this feature</a>'  +
        '<table></table>'                                              +
      '</div>'                                                         +
    '</div>'
  ).on('click', function (e) {
    if ($(e.target).hasClass('gv-close')) {
      $(this).fadeOut('fast', function () {
        var data = $(this).data();

        if (data.track) {
          data.track.prop('menus', data.track.prop('menus').not(this));
        }

        data.browser.menus = data.browser.menus.not(this);
      });
    }
  }),

  makeMenu: function (features, event, track) {
    if (!features) {
      return false;
    }

    if (!Array.isArray(features)) {
      features = [ features ];
    }

    if (features.length === 0) {
      return false;
    } else if (features.length === 1) {
      return this.makeFeatureMenu(features[0], event, track);
    }

    var browser   = this;
    var menu      = this.menuTemplate.clone(true).data({ browser: this });
    var contentEl = $('.gv-menu-content', menu).addClass('gv-menu-content-first');
    var table     = $('table', contentEl);

    $('.gv-focus, .gv-highlight, .gv-menu-loading', menu).remove();
    $('.gv-title', menu).html(features.length + ' features');

    $.each(features.sort(function (a, b) { return a.start - b.start; }), function (i, feature) {
      var location = feature.chr + ':' + feature.start + (feature.end === feature.start ? '' : '-' + feature.end);
      var title    = feature.menuLabel || feature.name || (Array.isArray(feature.label) ? feature.label.join(' ') : feature.label) || (feature.id + '');

      $('<a href="#">').html(title.match(location) ? title : (location + ' ' + title)).on('click', function (e) {
        browser.makeFeatureMenu(feature, e, track);
        return false;
      }).appendTo($('<td>').appendTo($('<tr>').appendTo(table)));
    });

    $('<div class="gv-menu-scroll-wrapper">').append(table).appendTo(contentEl)

    menu.appendTo(this.superContainer || this.container).show();

    if (event) {
      menu.css({ left: 0, top: 0 }).position({ of: event, my: 'left top', collision: 'flipfit' });
    }

    this.menus = this.menus.add(menu);

    if (track) {
      track.prop('menus', track.prop('menus').add(menu));
    }

    return menu;
  },

  makeFeatureMenu: function (feature, e, track) {
    var browser   = this;
    var container = this.superContainer || this.container;
    var menu, content, loading, getMenu, isDeferred, i, j,  el, chr, start, end, linkData, key, columns, colspan;

    function focus() {
      var data    = $(this).data();
      var length  = data.end - data.start + 1;
      var context = Math.max(Math.round(length / 4), 25);

      browser.moveTo(data.chr, data.start - context, data.end + context, true);

      return false;
    }

    function highlight() {
      browser.addHighlight($(this).data());
      return false;
    }

    if (!feature.menuEl) {
      menu       = browser.menuTemplate.clone(true).data({ browser: browser, feature: feature });
      content    = $('.gv-menu-content', menu).remove();
      loading    = $('.gv-menu-loading', menu);
      getMenu    = track ? track.controller.populateMenu(feature) : feature;
      isDeferred = typeof getMenu === 'object' && typeof getMenu.promise === 'function';

      if (isDeferred) {
        loading.show();
      }

      $.when(getMenu).done(function (properties) {
        if (!Array.isArray(properties)) {
          properties = [ properties ];
        }

        for (i = 0; i < properties.length; i++) {
          table   = '';
          el      = content.clone().addClass(i ? '' : 'gv-menu-content-first').appendTo(menu);
          chr     = typeof properties[i].chr !== 'undefined' ? properties[i].chr : feature.chr;
          start   = parseInt(typeof properties[i].start !== 'undefined' ? properties[i].start : feature.start, 10);
          end     = parseInt(typeof properties[i].end   !== 'undefined' ? properties[i].end   : feature.end,   10);
          columns = Math.max.apply(Math, $.map(properties[i], function (v) { return Array.isArray(v) ? v.length : 1; }));

          $('.gv-title', el)[properties[i].title ? 'html' : 'remove'](properties[i].title);

          if (track && start && end && !browser.isStatic) {
            linkData = { chr: chr, start: start, end: Math.max(end, start), label: feature.label || (properties[i].title || '').replace(/<[^>]+>/g, ''), color: feature.color };

            $('.gv-focus',     el).data(linkData).on('click', focus);
            $('.gv-highlight', el).data(linkData).on('click', highlight);
          } else {
            $('.gv-focus, .gv-highlight', el).remove();
          }

          for (key in properties[i]) {
            if (/^start|end$/.test(key) && properties[i][key] === false) {
              continue;
            }

            if (key !== 'title') {
              colspan = properties[i][key] === '' ? ' colspan="' + (columns + 1) + '"' : '';
              table  += '<tr><td' + colspan + '>' + key + '</td>';

              if (!colspan) {
                if (Array.isArray(properties[i][key])) {
                  for (j = 0; j < properties[i][key].length; j++) {
                    table += '<td>' + properties[i][key][j] + '</td>';
                  }
                } else if (columns === 1) {
                  table += '<td>' + properties[i][key] + '</td>';
                } else {
                  table += '<td colspan="' + columns + '">' + properties[i][key] + '</td>';
                }
              }

              table += '</tr>';
            }
          }

          $('table', el)[table ? 'html' : 'remove'](table);
        }

        if (isDeferred) {
          loading.hide();
        }
      });

      if (track) {
        menu.addClass(track.id).data('track', track);
      }

      feature.menuEl = menu.appendTo(container);
    } else {
      feature.menuEl.appendTo(container); // Move the menu to the end of the container again, so that it will always be on top of other menus
    }

    browser.menus = browser.menus.add(feature.menuEl);

    if (track) {
      track.prop('menus', track.prop('menus').add(feature.menuEl));
    }

    feature.menuEl.show(); // Must show before positioning, else position will be wrong

    if (e) {
      feature.menuEl.css({ left: 0, top: 0 }).position({ of: e, my: 'left top', collision: 'flipfit' });
    }

    return feature.menuEl;
  },

  closeMenus: function (obj) {
    obj = obj || this;

    obj.menus.filter(':visible').children('.gv-close').trigger('click');
    obj.menus = $();
  },

  hideMessages: function () {
    if (this.autoHideMessages) {
      this.wrapper.find('.gv-message-container').addClass('gv-collapsed');
    }
  },

  getSelectorPosition: function () {
    var left  = this.selector.position().left;
    var width = this.selector.outerWidth(true);
    var start = Math.round(left / this.scale) + this.start;
    var end   = Math.round((left + width) / this.scale) + this.start - 1;
        end   = end <= start ? start : end;

    return { start: start, end: end, left: left, width: width };
  },

  addHighlight: function (highlight) {
    this.addHighlights([ highlight ]);
  },

  addHighlights: function (highlights) {
    if (!this.tracksById.highlights) {
      this.addTrack(Genoverse.Track.HighlightRegion);
    }

    this.tracksById.highlights.addHighlights(highlights);
  },

  on: function (events, obj, fn, once) {
    var browser  = this;
    var eventMap = {};
    var i, j, f, fnString, event;

    function makeEventMap(types, handler) {
      types = types.split(' ');

      for (var j = 0; j < types.length; j++) {
        eventMap[types[j]] = (eventMap[types[j]] || []).concat(handler);
      }
    }

    function makeFnString(func) {
      return func.toString();
    }

    function compare(func) {
      f = func.toString();

      for (j = 0; j < fnString.length; j++) {
        if (f === fnString[j]) {
          return true;
        }
      }
    }

    if (typeof events === 'object') {
      for (i in events) {
        makeEventMap(i, events[i]);
      }

      obj = obj || this;
    } else {
      if (typeof fn === 'undefined') {
        fn  = obj;
        obj = this;
      }

      makeEventMap(events, fn);
    }

    var type = obj instanceof Genoverse.Track || obj === 'tracks' ? 'tracks' : 'browser';

    for (i in eventMap) {
      event = i + (once ? '.once' : '');

      browser.events[type][event] = browser.events[type][event] || [];
      fnString = $.map(eventMap[i], makeFnString);

      if (!$.grep(browser.events[type][event], compare).length) {
        browser.events[type][event].push.apply(browser.events[type][event], eventMap[i]);
      }
    }
  },

  once: function (events, obj, fn) {
    this.on(events, obj, fn, true);
  },

  destroy: function () {
    this.onTracks('destructor');
    (this.superContainer || this.container).empty();

    if (this.zoomInHighlight) {
      this.zoomInHighlight.add(this.zoomOutHighlight).remove();
    }

    $(window).add(document).off(this.eventNamespace);

    for (var key in this) {
      delete this[key];
    }
  }
}, {
  id      : 0,
  ready   : $.Deferred(),
  origin  : (($('script[src]').filter(function () { return /\/(?:Genoverse|genoverse\.min.*|genoverse\.concat.*)\.js$/.test(this.src); }).attr('src') || '').match(/(.*)js\/\w+/) || [])[1] || '',
  Genomes : {},
  Plugins : {},

  wrapFunctions: function (obj) {
    for (var key in obj) {
      if (typeof obj[key] === 'function' && typeof obj[key].ancestor !== 'function' && !key.match(/^(base|extend|constructor|on|once|prop|loadPlugins|loadGenome)$/)) {
        Genoverse.functionWrap(key, obj);
      }
    }
  },

  /**
   * functionWrap - wraps event handlers and adds debugging functionality
   **/
  functionWrap: function (key, obj) {
    obj.functions = obj.functions || {};

    if (obj.functions[key] || /^(before|after)/.test(key)) {
      return;
    }

    var func      = key.substring(0, 1).toUpperCase() + key.substring(1);
    var isBrowser = obj instanceof Genoverse;
    var mainObj   = isBrowser || obj instanceof Genoverse.Track ? obj : obj.track;
    var events    = isBrowser ? obj.events.browser : obj.browser.events.tracks;
    var debug;

    if (mainObj.debug) {
      debug = [ isBrowser ? 'Genoverse' : mainObj.id || mainObj.name || 'Track' ];

      if (!isBrowser && obj !== mainObj) {
        debug.push(obj instanceof Genoverse.Track.Controller ? 'Controller' : obj instanceof Genoverse.Track.Model ? 'Model' : 'View');
      }

      debug = debug.concat(key).join('.');
    }

    obj.functions[key] = obj[key];

    obj[key] = function () {
      var args          = [].slice.call(arguments);
      var currentConfig = (this._currentConfig || (this.track ? this.track._currentConfig : {}) || {}).func;
      var rtn;

      // Debugging functionality
      // Enabled by "debug": true || 'time' || { functionName: true, ...} option
      if (mainObj.debug === true) { // if "debug": true, simply log function call
        console.log(debug);
      } else if (mainObj.debug === 'time' || (typeof mainObj.debug === 'object' && mainObj.debug[key])) { // if debug: 'time' || { functionName: true, ...}, log function time
        console.time('time: ' + debug);
      }

      function trigger(when) {
        var once  = events[when + func + '.once'] || [];
        var funcs = (events[when + func] || []).concat(once, typeof mainObj[when + func] === 'function' ? mainObj[when + func] : []);

        if (once.length) {
          delete events[when + func + '.once'];
        }

        for (var i = 0; i < funcs.length; i++) {
          funcs[i].apply(this, args);
        }
      }

      trigger.call(this, 'before');

      if (currentConfig && currentConfig[key]) {
         // override to add a value for this.base
        rtn = function () {
          this.base = this.functions[key] || function () {};
          return currentConfig[key].apply(this, arguments);
        }.apply(this, args);
      } else {
        rtn = this.functions[key].apply(this, args);
      }

      trigger.call(this, 'after');

      if (mainObj.debug === 'time' || (typeof mainObj.debug === 'object' && mainObj.debug[key])) {
        console.timeEnd('time: ' + debug);
      }

      return rtn;
    };
  },

  getAllTrackTypes: function (namespace, n) {
    namespace = namespace || Genoverse.Track;

    if (n) {
      namespace = namespace[n];
    }

    if (!namespace) {
      return [];
    }

    var trackTypes = {};

    $.each(namespace, function (type, func) {
      if (typeof func === 'function' && !Base[type] && !/^(Controller|Model|View)$/.test(type)) {
        $.each(Genoverse.getAllTrackTypes(namespace, type), function (subtype, fn) {
          if (typeof fn === 'function') {
            trackTypes[type + '.' + subtype] = fn;
          }
        });

        trackTypes[type] = func;
      }
    });

    return trackTypes;
  },

  getTrackNamespace: function (track) {
    var trackTypes = Genoverse.getAllTrackTypes();
    var namespaces = $.map(trackTypes, function (constructor, name) { return track === constructor || track.prototype instanceof constructor ? name : null }); // Find all namespaces which this track could be
    var j          = namespaces.length;
    var i;

    // Find the most specific namespace for this track - the one which isn't a parent of any other namespaces this track could be
    while (namespaces.length > 1) {
      for (i = 0; i < namespaces.length - 1; i++) {
        if (trackTypes[namespaces[i]].prototype instanceof trackTypes[namespaces[i + 1]]) {
          namespaces.splice(i + 1, 1);
          break;
        } else if (trackTypes[namespaces[i + 1]].prototype instanceof trackTypes[namespaces[i]]) {
          namespaces.splice(i, 1);
          break;
        }
      }

      if (j-- < 0) {
        break; // Stop infinite loop if something went really wrong
      }
    }

    return namespaces[0];
  }
});

$(function () {
  if ($('link[href$="genoverse.css"]').length) {
    Genoverse.ready.resolve();
  } else {
    $('<link href="' + Genoverse.origin + 'css/genoverse.css" rel="stylesheet">').appendTo('body').on('load', Genoverse.ready.resolve);
  }
});

window.Genoverse = Genoverse;

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = Genoverse;
}

Genoverse.Track = Base.extend({
  height     : 12,        // The height of the gv-track-container div
  margin     : 2,         // The spacing between this track and the next
  resizable  : true,      // Is the track resizable - can be true, false or 'auto'. Auto means the track will automatically resize to show all features, but the user cannot resize it themselves.
  border     : true,      // Does the track have a bottom border
  unsortable : false,     // Is the track unsortable by the user
  fixedOrder : false,     // Is the track unsortable by the user or automatically - use for tracks which always need to go at the top/bottom
  invert     : false,     // If true, features are drawn from the bottom of the track, rather than from the top. This is actually achieved by performing a CSS transform on the gv-image-container div
  legend     : false,     // Does the track have a legend - can be true, false, or a Genoverse.Track.Legend extension/child class.
  children   : undefined, // Does the track have any child tracks - can be one or an array of Genoverse.Track extension/child classes.
  name       : undefined, // The name of the track, which appears in its label
  autoHeight : undefined, // Does the track automatically resize so that all the features are visible
  hideEmpty  : undefined, // If the track automatically resizes, should it be hidden when there are no features, or should an empty track still be shown

  constructor: function (config) {
    if (this.stranded || config.stranded) {
      this.controller = this.controller || Genoverse.Track.Controller.Stranded;
      this.model      = this.model      || Genoverse.Track.Model.Stranded;
    }

    this.models = {};
    this.views  = {};

    this.setInterface();
    this.extend(config);
    this.setDefaults();
    this.setEvents();

    Genoverse.wrapFunctions(this);

    this.setLengthMap();
    this.setMVC();

    if (this.browser.scale) {
      this.controller.setScale();
      this.controller.makeFirstImage();
    }

    if (this.children) {
      this.addChildTracks();
    }

    if (this.legend) {
      this.addLegend();
    }
  },

  setEvents: $.noop,

  setDefaults: function () {
    this.config            = this.config         || {};
    this.configSettings    = this.configSettings || {};
    this.defaultConfig     = this.defaultConfig  || {};
    this.controls          = this.controls       || [];
    this.defaultHeight     = this.height;
    this.defaultAutoHeight = this.autoHeight;
    this.autoHeight        = typeof this.autoHeight !== 'undefined' ? this.autoHeight : this.browser.trackAutoHeight;
    this.hideEmpty         = typeof this.hideEmpty  !== 'undefined' ? this.hideEmpty  : this.browser.hideEmptyTracks;
    this.height           += this.margin;
    this.initialHeight     = this.height;

    if (this.resizable === 'auto') {
      this.autoHeight = true;
    }

    this.setDefaultConfig();
  },

  setDefaultConfig: function () {
    for (var i in this.defaultConfig) {
      if (typeof this.config[i] === 'undefined') {
        this.config[i] = this.defaultConfig[i];
      }
    }

    this._setCurrentConfig();
  },

  setInterface: function () {
    var mvc = [ 'Controller', 'Model', 'View', 'controller', 'model', 'view' ];
    var prop;

    this._interface = {};

    for (var i = 0; i < 3; i++) {
      for (prop in Genoverse.Track[mvc[i]].prototype) {
        if (!/^(constructor|init|reset|setDefaults|base|extend|lengthMap)$/.test(prop)) {
          this._interface[prop] = mvc[i + 3];
        }
      }
    }
  },

  setMVC: function () {
    if (this.model && typeof this.model.abort === 'function') { // TODO: don't abort unless model is changed?
      this.model.abort();
    }

    this._defaults = this._defaults || {};

    var settings           = $.extend(true, {}, this.constructor.prototype, this.getSettingsForLength()[1]); // model, view, options
    var controllerSettings = { prop: {}, func: {} };
    var trackSettings      = {};
    var i;

    settings.controller = settings.controller || this.controller || Genoverse.Track.Controller;

    for (i in settings) {
      if (!/^(constructor|init|reset|setDefaults|base|extend|lengthMap)$/.test(i) && isNaN(i)) {
        if (this._interface[i] === 'controller') {
          controllerSettings[typeof settings[i] === 'function' ? 'func' : 'prop'][i] = settings[i];
        }
        // If we allow trackSettings to overwrite the MVC properties, we will potentially lose of information about instantiated objects that the track needs to perform future switching correctly.
        else if (!Genoverse.Track.prototype.hasOwnProperty(i) && !/^(controller|models|views|config|disabled)$/.test(i)) {
          if (typeof this._defaults[i] === 'undefined') {
            this._defaults[i] = this[i];
          }

          trackSettings[i] = settings[i];
        }
      }
    }

    for (i in this._defaults) {
      if (typeof trackSettings[i] === 'undefined') {
        trackSettings[i] = this._defaults[i];
      }
    }

    // If there are configSettings for the track, ensure that any properties in _currentConfig are set for the model/view/controller/track as appropriate.
    // Functions in _currentConfig are accessed via Genoverse.functionWrap, so nothing needs to be done with them here.
    if (!$.isEmptyObject(this._currentConfig)) {
      var changed = {};
      var type;

      for (i in this._currentConfig.prop) {
        type = this._interface[i];

        if (/model|view/.test(type)) {
          if (trackSettings[type][i] !== this._currentConfig.prop[i]) {
            trackSettings[type][i] = this._currentConfig.prop[i];
            changed[type] = true;
          }
        } else if (type === 'controller') {
          controllerSettings.prop[i] = this._currentConfig.prop[i];
        } else {
          trackSettings[i] = this._currentConfig.prop[i];
        }
      }

      for (type in changed) {
        trackSettings[type].setDefaults(true);
      }
    }

    /*
     * Abandon all hope! If you've tracked a bug to this line of code, be afraid.
     * It will almost certainly be due to the wonderful way the javascript objects work.
     *
     * Consider the following:
     *
     * var Obj = function () {};
     *
     * Obj.prototype = {
     *   scalar : 1,
     *   array  : [ 1, 2, 3 ],
     *   hash   : { a: 1, b : 2 }
     * };
     *
     * var x = new Obj();
     *
     * x.scalar   = 10;
     * x.array[0] = 10;
     * x.hash.a   = 10;
     *
     * var y = new Obj();
     *
     * y is now { scalar: 1, array: [ 10, 2, 3 ], hash: { a: 10, b : 2 } }, since memory locations of objects in prototypes are shared.
     *
     * This has been the cause of numerous Genoverse bugs in the past, due to property sharing between different tracks, models, views, and controllers.
     */
    this.extend(trackSettings);

    this.model.setChrProps(); // make sure the data stores for the current chromsome are being used

    if (!this.controller || typeof this.controller === 'function') {
      this.controller = this.newMVC(settings.controller, controllerSettings.func, $.extend(controllerSettings.prop, { model: this.model, view: this.view }));
    } else {
      controllerSettings.prop.threshold = controllerSettings.prop.threshold || this.controller.constructor.prototype.threshold;
      $.extend(this.controller, controllerSettings.prop, { model: this.model, view: this.view });
    }
  },

  newMVC: function (object, functions, properties) {
    return new (object.extend(
      $.extend(true, {}, object.prototype, functions, {
        prop: $.proxy(this.prop, this)
      })
    ))(
      $.extend(properties, {
        browser : this.browser,
        width   : this.width,
        track   : this
      })
    );
  },

  setLengthMap: function () {
    var mv        = [ 'model', 'view' ];
    var lengthMap = [];
    var models    = {};
    var views     = {};
    var settings, value, deepCopy, prevLengthMap, mvSettings, type, prevType, i, j;

    function compare(a, b) {
      var checked = { browser: true, width: true, track: true }; // Properties set in newMVC should be ignored, as they will be missing if comparing an object with a prototype

      for (var key in a) {
        if (checked[key]) {
          continue;
        }

        checked[key] = true;

        if (typeof a[key] !== typeof b[key]) {
          return false;
        } else if (typeof a[key] === 'function' && typeof b[key] === 'function') {
          if (a[key].toString() !== b[key].toString()) {
            return false;
          }
        } else if (typeof a[key] === 'object' && !(a[key] instanceof $) && !compare(a[key], b[key])) {
          return false;
        } else if (a[key] !== b[key]) {
          return false;
        }
      }

      for (key in b) {
        if (!checked[key]) {
          return false;
        }
      }

      return true;
    }

    // Find all scale-map like keys
    for (var key in this) {
      if (!isNaN(key)) {
        key   = parseInt(key, 10);
        value = this[key];

        lengthMap.push([ key, value === false ? { threshold: key, resizable: 'auto', featureHeight: 0, model: Genoverse.Track.Model, view: Genoverse.Track.View } : $.extend(true, {}, value) ]);
      }
    }

    // Force at least one lengthMap entry to exist, containing the base model and view. lengthMap entries above -1 without a model or view will inherit from -1.
    lengthMap.push([ -1, { view: this.view || Genoverse.Track.View, model: this.model || Genoverse.Track.Model } ]);

    lengthMap = lengthMap.sort(function (a, b) { return b[0] - a[0]; });

    for (i = 0; i < lengthMap.length; i++) {
      if (lengthMap[i][1].model && lengthMap[i][1].view) {
        continue;
      }

      deepCopy = {};

      if (lengthMap[i][0] !== -1) {
        for (j in lengthMap[i][1]) {
          if (this._interface[j]) {
            deepCopy[this._interface[j]] = true;
          }

          if (deepCopy.model && deepCopy.view) {
            break;
          }
        }
      }

      // Ensure that every lengthMap entry has a model and view property, copying them from entries with smaller lengths if needed.
      for (j = i + 1; j < lengthMap.length; j++) {
        if (!lengthMap[i][1].model && lengthMap[j][1].model) {
          lengthMap[i][1].model = deepCopy.model ? Genoverse.Track.Model.extend($.extend(true, {}, lengthMap[j][1].model.prototype)) : lengthMap[j][1].model;
        }

        if (!lengthMap[i][1].view && lengthMap[j][1].view) {
          lengthMap[i][1].view = deepCopy.view ? Genoverse.Track.View.extend($.extend(true, {}, lengthMap[j][1].view.prototype)) : lengthMap[j][1].view;
        }

        if (lengthMap[i][1].model && lengthMap[i][1].view) {
          break;
        }
      }
    }

    // Now every lengthMap entry has a model and a view class, create instances of those classes.
    for (i = 0; i < lengthMap.length; i++) {
      prevLengthMap = lengthMap[i - 1] ? lengthMap[i - 1][1] : {};
      settings      = $.extend(true, {}, this.constructor.prototype, lengthMap[i][1]);
      mvSettings    = { model: { prop: {}, func: {} }, view: { prop: {}, func: {} } };

      // Work out which settings belong to models or views
      for (j in settings) {
        if (j !== 'constructor' && mvSettings[this._interface[j]]) {
          mvSettings[this._interface[j]][typeof settings[j] === 'function' ? 'func' : 'prop'][j] = settings[j];
        }
      }

      // Create models and views, if settings.model or settings.view is a class rather than an instance
      for (j = 0; j < mv.length; j++) {
        type = mv[j];

        if (typeof settings[type] === 'function') {
          prevType = this[mv[j] + 's'];

          // If the previous lengthMap contains an instance of the class in settings, it can be reused.
          // This allows sharing of models and views between lengthMap entries if they are the same, stopping the need to fetch identical data or draw identical images more than once
          if (prevLengthMap[type] instanceof settings[type]) {
            settings[type] = prevLengthMap[type];
          } else {
            // Make an instance of the model/view, based on the settings[type] class but with a prototype that contains the functions in mvSettings[type].func
            settings[type] = this.newMVC(settings[type], mvSettings[type].func, mvSettings[type].prop);

            // If the track already has this.models/this.views and the prototype of the new model/view is the same as the value of this.models/this.views for the same length key, reuse that value.
            // This can happen if the track has configSettings and the user changes config but that only affects one of the model and view.
            // Again, reusing the old value stops the need to fetch identical data or draw identical images more than once.
            if (prevType[lengthMap[i][0]] && compare(prevType[lengthMap[i][0]].constructor.prototype, $.extend({}, settings[type].constructor.prototype, mvSettings[type].prop))) {
              settings[type] = prevType[lengthMap[i][0]];
            }
          }
        }
      }

      models[lengthMap[i][0]] = lengthMap[i][1].model = settings.model;
      views[lengthMap[i][0]]  = lengthMap[i][1].view  = settings.view;
    }

    this.lengthMap = lengthMap;
    this.models    = models;
    this.views     = views;
  },

  getSettingsForLength: function () {
    var length = this.browser.length || (this.browser.end - this.browser.start + 1);

    for (var i = 0; i < this.lengthMap.length; i++) {
      if (length > this.lengthMap[i][0] || length === 1 && this.lengthMap[i][0] === 1) {
        return this.lengthMap[i];
      }
    }

    return [];
  },

  prop: function (key, value) {
    var mvc = [ 'controller', 'model', 'view' ];
    var obj;

    if (this._interface[key]) {
      obj = this[this._interface[key]];
    } else {
      for (var i = 0; i < 3; i++) {
        if (this[mvc[i]] && typeof this[mvc[i]][key] !== 'undefined') {
          obj = this[mvc[i]];
          break;
        }
      }

      obj = obj || this;
    }


    if (typeof value !== 'undefined') {
      if (value === null) {
        delete obj[key];
      } else {
        obj[key] = value;
      }
    }

    return obj ? obj[key] : undefined;
  },

  setHeight: function (height, forceShow) {
    if (this.disabled || (forceShow !== true && height < this.prop('featureHeight')) || (this.prop('threshold') && !this.prop('thresholdMessage') && this.browser.length > this.prop('threshold'))) {
      height = 0;
    } else {
      height = Math.max(height, this.prop('minLabelHeight'));
    }

    this.height = height;

    return height;
  },

  resetHeight: function () {
    if (this.resizable === true) {
      var resizer = this.prop('resizer');

      this.autoHeight = !!([ this.defaultAutoHeight, this.browser.trackAutoHeight ].sort(function (a, b) {
        return (typeof a !== 'undefined' && a !== null ? 0 : 1) - (typeof b !== 'undefined' && b !== null ?  0 : 1);
      })[0]);

      this.controller.resize(this.autoHeight ? this.prop('fullVisibleHeight') : this.defaultHeight + this.margin + (resizer ? resizer.height() : 0));
      this.initialHeight = this.height;
    }
  },

  setConfig: function (config) {
    if (typeof config === 'string' && arguments.length === 2) {
      var _config = {};
      _config[config] = arguments[1];
      config = _config;
    }

    var configChanged = false;
    var conf;

    for (var type in config) {
      conf = config[type];

      if (typeof this.configSettings[type] === 'undefined' || typeof this.configSettings[type][conf] === 'undefined' || this.config[type] === conf) {
        continue;
      }

      this.config[type] = conf;

      configChanged = true;
    }

    if (configChanged) {
      var features = this.prop('featuresById');

      for (var i in features) {
        delete features[i].menuEl;
      }

      this._setCurrentConfig();

      if (!this.disabled) {
        this.reset.apply(this, configChanged ? [ 'config', config ] : []);
      }

      (this.prop('childTracks') || []).forEach(function (track) {
        track.setConfig(config);
      });

      this.browser.saveConfig();
    }
  },

  _setCurrentConfig: function () {
    var settings       = [];
    var featureFilters = [];
    var conf;

    this._currentConfig = { prop: {}, func: {} };

    for (i in this.configSettings) {
      conf = this.getConfig(i);

      if (conf) {
        settings.push(conf);

        if (conf.featureFilter) {
          featureFilters.push(conf.featureFilter);
        }
      }
    }

    if (settings.length) {
      settings = $.extend.apply($, [ true, {} ].concat(settings, { featureFilters: featureFilters }));
      delete settings.featureFilter;
    }

    for (i in settings) {
      this._currentConfig[typeof settings[i] === 'function' && !/^(before|after)/.test(i) ? 'func' : 'prop'][i] = settings[i];
    }
  },

  getConfig: function (type) {
    return this.configSettings[type][this.config[type]];
  },

  addChildTracks: function () {
    if (!this.children) {
      return;
    }

    var track    = this;
    var browser  = this.browser;
    var children = (Array.isArray(this.children) ? this.children : [ this.children ]).filter(function (child) { return child.prototype instanceof Genoverse.Track; });
    var config   = {
      parentTrack : this,
      controls    : 'off',
      threshold   : this.prop('threshold')
    };

    setTimeout(function () {
      track.childTracks = children.map(function (child) {
        if (child.prototype instanceof Genoverse.Track.Legend || child === Genoverse.Track.Legend) {
          return track.addLegend(child.extend(config), true);
        } else {
          return browser.addTrack(child.extend(config));
        }
      });

      track.controller.setLabelHeight();
    }, 1);
  },

  addLegend: function (constructor, now) {
    if (!(constructor || this.legend)) {
      return;
    }

    constructor = constructor || (this.legend.prototype instanceof Genoverse.Track.Legend ? this.legend : Genoverse.Track.Legend);

    var track       = this;
    var legendType  = constructor.prototype.shared === true ? Genoverse.getTrackNamespace(constructor) : constructor.prototype.shared || this.id;
    var config      = {
      id   : legendType + 'Legend',
      name : constructor.prototype.name || (this.name + ' Legend'),
      type : legendType
    };

    this.legendType = legendType;

    function makeLegendTrack() {
      return track.legendTrack = track.browser.legends[config.id] || track.browser.addTrack(constructor.extend(config));
    }

    if (now === true) {
      return makeLegendTrack();
    } else {
      setTimeout(makeLegendTrack, 1);
    }
  },

  changeChr: function () {
    for (var i in this.models) {
      this.models[i].setChrProps();
    }
  },

  updateName: function (name) {
    this.controller.setName(name); // For ease of use in external code
  },

  enable: function () {
    if (this.disabled === true) {
      this.disabled = false;
      this.controller.resize(this.initialHeight);
      this.reset();
    }
  },

  disable: function () {
    if (!this.disabled) {
      this.disabled = true;
      this.controller.resize(0);
    }
  },

  reset: function () {
    this.setLengthMap();

    for (var i in this.models) {
      if (this.models[i].url !== false) {
        this.models[i].init(true);
      }
    }

    for (i in this.views) {
      this.views[i].init();
    }

    this.controller.reset.apply(this.controller, arguments);
  },

  remove: function () {
    this.browser.removeTrack(this);
  },

  destructor: function () {
    this.controller.destroy();

    var objs = [ this.view, this.model, this.controller, this ];

    for (var obj in objs) {
      for (var key in obj) {
        delete obj[key];
      }
    }
  }
});

Genoverse.Track.Controller = Base.extend({
  scrollBuffer   : 1.2,      // Number of widths, if left or right closer to the edges of viewpoint than the buffer, start making more images
  threshold      : Infinity, // Length above which the track is not drawn
  clickTolerance : 0,        // pixels of tolerance added to a click position when finding features for popup menus, when scale < 1
  messages       : undefined,

  constructor: function (properties) {
    $.extend(this, properties);
    Genoverse.wrapFunctions(this);
    this.init();
  },

  init: function () {
    this.setDefaults();
    this.addDomElements();
    this.addUserEventHandlers();

    this.deferreds = []; // tracks deferreds so they can be stopped if the track is destroyed
  },

  setDefaults: function () {
    this.imgRange    = {};
    this.scrollRange = {};
    this.messages    = this.messages || {
      error     : 'ERROR: ',
      threshold : 'Data for this track is not displayed in regions greater than ',
      resize    : 'Some features are currently hidden, <a class="gv-resize">resize to see all</a>'
    };
  },

  reset: function () {
    this.abort();
    this.setDefaults();
    this.resetImages();
    this.browser.closeMenus(this);

    if (arguments[0] !== 'resizing') {
      this.setScale();
      this.makeFirstImage();
    }
  },

  resetImages: function () {
    this.scrollContainer.empty();
    this.resetImageRanges();
  },

  resetImageRanges: function () {
    this.left        = 0;
    this.scrollStart = [ 'ss', this.browser.chr, this.browser.start, this.browser.end ].join('-');

    this.imgRange[this.scrollStart]    = this.imgRange[this.scrollStart]    || { left: this.width * -2, right: this.width * 2 };
    this.scrollRange[this.scrollStart] = this.scrollRange[this.scrollStart] || { start: this.browser.start - this.browser.length, end: this.browser.end + this.browser.length };
  },

  setName: function (name) {
    this.track.name = name;
    this.labelName  = this.labelName || $('<span class="gv-name">').appendTo(this.label);

    this.labelName.attr('title', name).html(name);

    this.minLabelHeight = Math.max(this.labelName.outerHeight(true), this.labelName.outerHeight());

    this.setLabelHeight(true);
  },

  addDomElements: function () {
    var name = this.track.name || '';

    this.menus            = $();
    this.container        = $('<div class="gv-track-container">').appendTo(this.browser.wrapper);
    this.scrollContainer  = $('<div class="gv-scroll-container">').appendTo(this.container);
    this.imgContainer     = $('<div class="gv-image-container">').width(this.width).addClass(this.prop('invert') ? 'gv-invert' : '');
    this.messageContainer = $('<div class="gv-message-container"><div class="gv-messages"></div><i class="gv-control gv-collapse fa fa-angle-double-left"></i><i class="gv-control gv-expand fa fa-angle-double-right"></i></div>').appendTo(this.container);
    this.label            = $('<li>').appendTo(this.browser.labelContainer).height(this.prop('height')).data('track', this.track);
    this.context          = $('<canvas>')[0].getContext('2d');

    if (this.prop('border')) {
      $('<div class="gv-track-border">').appendTo(this.container);
    }

    if (this.prop('unsortable')) {
      this.label.addClass('gv-unsortable');
    } else {
      $('<div class="gv-handle">').appendTo(this.label);
    }

    if (this.prop('children')) {
      this.superContainer = $('<div class="gv-track-container gv-track-super-container">').insertAfter(this.container);
      this.container.appendTo(this.superContainer);
    } else if (this.prop('parentTrack')) {
      this.superContainer = this.prop('parentTrack').prop('superContainer');

      this.container.appendTo(this.superContainer);
      this.label.remove();

      this.label = this.prop('parentTrack').prop('label');
    }

    this.setName(name);

    this.container.height(this.prop('disabled') ? 0 : Math.max(this.prop('height'), this.minLabelHeight));
  },

  addUserEventHandlers: function () {
    var controller = this;
    var browser    = this.browser;

    this.container.on('mouseup', '.gv-image-container', function (e) {
      if ((e.which && e.which !== 1) || (typeof browser.dragStart === 'number' && browser.start !== browser.dragStart) || (browser.dragAction === 'select' && browser.selector.outerWidth(true) > 2)) {
        return; // Only show menus on left click when not dragging and not selecting
      }

      controller.click(e);
    });

    this.messageContainer.children().on('click', function () {
      var collapsed = controller.messageContainer.children('.gv-messages').is(':visible') ? ' gv-collapsed' : '';
      var code      = controller.messageContainer.find('.gv-msg').data('code');

      controller.messageContainer.attr('class', 'gv-message-container' + collapsed);
      controller.checkHeight();

      if (code !== 'error') {
        document.cookie = [ 'gv_msg', code, controller.prop('id') ].join('_') + '=1; expires=' + (collapsed ? 'Tue, 19 Jan 2038' : 'Thu, 01 Jan 1970') + ' 00:00:00 GMT; path=/';
      }
    });
  },

  click: function (e) {
    var target = $(e.target);
    var x      = e.pageX - this.container.parent().offset().left + this.browser.scaledStart;
    var y      = e.pageY - target.offset().top;

    if (this.imgContainer.hasClass('gv-invert')) {
      y = target.height() - y;
    }

    return this.browser.makeMenu(this.getClickedFeatures(x, y, target), e, this.track);
  },

  getClickedFeatures: function (x, y, target) {
    var bounds    = { x: x, y: y, w: 1, h: 1 };
    var scale     = this.scale;
    var tolerance = scale < 1 ? this.clickTolerance : 0;

    if (tolerance) {
      bounds.x -= tolerance / 2;
      bounds.w += tolerance;
    }

    var features = this[target && target.hasClass('gv-labels') ? 'labelPositions' : 'featurePositions'].search(bounds);

    if (tolerance) {
      return features.sort(function (a, b) { return Math.abs(a.position[scale].start - x) - Math.abs(b.position[scale].start - x); });
    } else {
      return this.model.sortFeatures(features);
    }
  },

  // FIXME: messages are now hidden/shown instead of removed/added. This will cause a problem if a new message arrives with the same code as one that already exists.
  showMessage: function (code, additionalText) {
    var messages = this.messageContainer.children('.gv-messages');

    if (!messages.children('.gv-' + code).show().length) {
      var msg = $('<div class="gv-msg gv-' + code + '">' + this.messages[code] + (additionalText || '') + '</div>').data('code', code).prependTo(messages);

      if (code === 'resize') {
        msg.children('a.gv-resize').on('click', $.proxy(function () {
          this.resize(this.fullVisibleHeight);
        }, this));
      }

      this.messageContainer[document.cookie.match([ 'gv_msg', code, this.prop('id') ].join('_') + '=1') ? 'addClass' : 'removeClass']('gv-collapsed');
    }

    var height = this.messageContainer.show().outerHeight(true);

    if (height > this.prop('height')) {
      this.resize(height, undefined, false);
    }

    messages = null;
  },

  hideMessage: function (code) {
    var messages = this.messageContainer.find('.gv-msg');

    if (code) {
      messages = messages.filter('.gv-' + code).hide();

      if (messages.length && !messages.siblings().filter(function () { return this.style.display !== 'none'; }).length) {
        this.messageContainer.hide();
      }
    } else {
      messages.hide();
      this.messageContainer.hide();
    }

    messages = null;
  },

  showError: function (error) {
    this.showMessage('error', error);
  },

  checkHeight: function () {
    if (this.browser.length > this.threshold) {
      if (this.thresholdMessage) {
        this.showMessage('threshold', this.thresholdMessage);
        this.fullVisibleHeight = Math.max(this.messageContainer.outerHeight(true), this.minLabelHeight);
      } else {
        this.fullVisibleHeight = 0;
      }
    } else if (this.thresholdMessage) {
      this.hideMessage('threshold');
    }

    if (!this.prop('resizable')) {
      return;
    }

    var autoHeight;

    if (this.browser.length > this.threshold) {
      autoHeight = this.prop('autoHeight');
      this.prop('autoHeight', true);
    } else {
      this.fullVisibleHeight = this.visibleFeatureHeight() || (this.messageContainer.is(':visible') ? this.messageContainer.outerHeight(true) : this.prop('hideEmpty') ? 0 : this.minLabelHeight);
    }

    this.autoResize();

    if (typeof autoHeight !== 'undefined') {
      this.prop('autoHeight', autoHeight);
    }
  },

  visibleFeatureHeight: function () {
    var bounds    = { x: this.browser.scaledStart, w: this.width, y: 0, h: 9e99 };
    var scale     = this.scale;
    var features  = this.featurePositions.search(bounds);
    var minHeight = this.prop('hideEmpty') ? 0 : this.minLabelHeight;
    var height    = Math.max.apply(Math, $.map(features, function (feature) { return feature.position[scale].bottom; }).concat(minHeight));

    if (this.prop('labels') === 'separate') {
      this.labelTop = height;
      height += Math.max.apply(Math, $.map(this.labelPositions.search(bounds).concat(this.prop('repeatLabels') ? features : []), function (feature) { return feature.position[scale].label.bottom; }).concat(minHeight));
    }

    return height;
  },

  autoResize: function () {
    var autoHeight = this.prop('autoHeight');

    if (autoHeight || this.prop('labels') === 'separate') {
      this.resize(autoHeight ? this.fullVisibleHeight : this.prop('height'), this.labelTop, false);
    } else {
      this.toggleExpander(false);
    }
  },

  resize: function (height, arg, saveConfig) {
    height = this.track.setHeight(height, arg);

    if (typeof arg === 'number') {
      this.imgContainers.children('.gv-labels').css('top', arg);
    }

    this.container.height(height)[height ? 'show' : 'hide']();
    this.setLabelHeight();
    this.toggleExpander();

    if (saveConfig !== false) {
      this.browser.saveConfig();
    }
  },

  toggleExpander: function (saveConfig) {
    if (this.prop('resizable') !== true) {
      return;
    }

    var featureMargin = this.prop('featureMargin');
    var height        = this.prop('height');

    // Note: fullVisibleHeight - featureMargin.top - featureMargin.bottom is not actually the correct value to test against, but it's the easiest best guess to obtain.
    // fullVisibleHeight is the maximum bottom position of the track's features in the region, which includes margin at the bottom of each feature and label
    // Therefore fullVisibleHeight includes this margin for the bottom-most feature.
    // The correct value (for a track using the default positionFeatures code) is:
    // fullVisibleHeight - ([there are labels in this region] ? (labels === 'separate' ? 0 : featureMargin.bottom + 1) + 2 : featureMargin.bottom)
    if (this.fullVisibleHeight - featureMargin.top - featureMargin.bottom > height && !this.prop('disabled')) {
      this.showMessage('resize');

      var controller = this;
      var h          = this.messageContainer.outerHeight(true);

      if (h > height) {
        this.resize(h, undefined, saveConfig);
      }

      this.expander = (this.expander || $('<div class="gv-expander gv-static">').width(this.width).appendTo(this.container).on('click', function () {
        controller.resize(controller.fullVisibleHeight);
      }))[this.prop('height') === 0 ? 'hide' : 'show']();
    } else if (this.expander) {
      this.hideMessage('resize');
      this.expander.hide();
    }
  },

  setLabelHeight: function (enforceMinHeight) {
    var parent = this.prop('parentTrack');

    if (parent) {
      return parent.controller.setLabelHeight();
    }

    var tracks = [ this ].concat(this.prop('childTracks') || []);
    var height = tracks.reduce(function (h, track) { return h + (track.prop('disabled') ? 0 : track.prop('height')); }, 0);

    this.label.height(this.prop('disabled') ? 0 : enforceMinHeight && this.minLabelHeight ? Math.max(height, this.minLabelHeight) : height);

    if (tracks.length > 1) {
      var top = tracks[0].prop('height');

      tracks.slice(1).forEach(function (track) {
        var h = track.prop('height');

        track.prop('labelName').css('top', top)[h ? 'removeClass' : 'addClass']('gv-hide');
        top += h;
      });
    }
  },

  setWidth: function (width) {
    var track = this.track;

    $.each([ this, track, track.model, track.view ], function () {
      this.width = width;
    });

    this.imgContainer.add(this.expander).width(width);
  },

  setScale: function () {
    var controller = this;

    this.scale = this.browser.scale;

    this.track.setMVC();
    this.resetImageRanges();

    var labels = this.prop('labels');

    if (labels && labels !== 'overlay') {
      this.model.setLabelBuffer(this.browser.labelBuffer);
    }

    if (this.threshold !== Infinity && this.prop('resizable') !== 'auto') {
      this.thresholdMessage = this.view.formatLabel(this.threshold);
    }

    $.each(this.view.setScaleSettings(this.scale), function (k, v) { controller[k] = v; });

    this.hideMessage();
  },

  move: function (delta) {
    this.left += delta;
    this.scrollContainer.css('left', this.left);

    var scrollStart = this.scrollStart;

    if (this.imgRange[scrollStart] && this.imgRange[scrollStart].left + this.left > -this.scrollBuffer * this.width) {
      var end = this.scrollRange[scrollStart].start - 1;

      this.makeImage({
        scale : this.scale,
        chr   : this.browser.chr,
        start : end - this.browser.length + 1,
        end   : end,
        left  : this.imgRange[scrollStart].left,
        cls   : scrollStart
      });

      (this.imgRange[scrollStart]    || {}).left  -= this.width;
      (this.scrollRange[scrollStart] || {}).start -= this.browser.length;
    }

    if (this.imgRange[scrollStart] && this.imgRange[scrollStart].right + this.left < this.scrollBuffer * this.width) {
      var start = this.scrollRange[scrollStart].end + 1;

      this.makeImage({
        scale : this.scale,
        chr   : this.browser.chr,
        start : start,
        end   : start + this.browser.length - 1,
        left  : this.imgRange[scrollStart].right,
        cls   : scrollStart
      });

      (this.imgRange[scrollStart]    || {}).right += this.width;
      (this.scrollRange[scrollStart] || {}).end   += this.browser.length;
    }
  },

  moveTo: function (chr, start, end, delta) {
    var scrollRange = this.scrollRange[this.scrollStart];
    var scrollStart = [ 'ss', chr, start, end ].join('-');

    if (this.scrollRange[scrollStart] || start > scrollRange.end || end < scrollRange.start) {
      this.resetImageRanges();
      this.makeFirstImage(scrollStart);
    } else {
      this.move(typeof delta === 'number' ? delta : (start - this.browser.start) * this.scale);
      this.checkHeight();
    }
  },

  makeImage: function (params) {
    params.scaledStart   = params.scaledStart   || params.start * params.scale;
    params.width         = params.width         || this.width;
    params.height        = params.height        || this.prop('height');
    params.featureHeight = params.featureHeight || 0;
    params.labelHeight   = params.labelHeight   || 0;

    var deferred;
    var controller = this;
    var tooLarge   = this.browser.length > this.threshold;
    var div        = this.imgContainer.clone().addClass((params.cls + ' gv-loading').replace('.', '_')).css({ left: params.left, display: params.cls === this.scrollStart ? 'block' : 'none' });
    var bgImage    = params.background ? $('<img class="gv-bg">').hide().addClass(params.background).data(params).prependTo(div) : false;
    var image      = $('<img class="gv-data">').hide().data(params).appendTo(div).on('load', function () {
      $(this).fadeIn('fast').parent().removeClass('gv-loading');
      $(this).siblings('.gv-bg').show();
    });

    params.container = div;

    this.imgContainers.push(div[0]);
    this.scrollContainer.append(this.imgContainers);

    if (!tooLarge && !this.model.checkDataRange(params.chr, params.start, params.end)) {
      var buffer = this.prop('dataBuffer');

      params.start -= buffer.start;
      params.end   += buffer.end;
      deferred      = this.model.getData(params.chr, params.start, params.end);
    }

    if (!deferred) {
      deferred = $.Deferred();
      setTimeout($.proxy(deferred.resolve, this), 1); // This defer makes scrolling A LOT smoother, pushing render call to the end of the exec queue
    }

    this.deferreds.push(deferred);

    return deferred.done(function () {
      var features = tooLarge ? [] : controller.model.findFeatures(params.chr, params.start, params.end);
      controller.render(features, image);

      if (bgImage) {
        controller.renderBackground(features, bgImage);
      }
    }).fail(function (e) {
      controller.showError(e);
    });
  },

  makeFirstImage: function (moveTo) {
    var deferred = $.Deferred();

    if (this.scrollContainer.children().hide().filter('.' + (moveTo || this.scrollStart)).show().length) {
      this.scrollContainer.css('left', 0);
      this.checkHeight();

      return deferred.resolve();
    }

    var controller = this;
    var chr        = this.browser.chr;
    var start      = this.browser.start;
    var end        = this.browser.end;
    var length     = this.browser.length;
    var scale      = this.scale;
    var cls        = this.scrollStart;
    var images     = [{ chr: chr, start: start, end: end, scale: scale, cls: cls, left: 0 }];
    var left       = 0;
    var width      = this.width;

    if (!this.browser.isStatic) {
      if (start > 1) {
        images.push({ chr: chr, start: start - length, end: start - 1, scale: scale, cls: cls, left: -this.width });
        left   = -this.width;
        width += this.width;
      }

      if (end < this.browser.getChromosomeSize(chr)) {
        images.push({ chr: chr, start: end + 1, end: end + length, scale: scale, cls: cls, left: this.width });
        width += this.width;
      }
    }

    var loading = this.imgContainer.clone().addClass('gv-loading').css({ left: left, width: width }).prependTo(this.scrollContainer.css('left', 0));

    function makeImages() {
      $.when.apply($, images.map(function (image) {
        return controller.makeImage(image);
      })).done(deferred.resolve);

      loading.remove();
    }

    if (length > this.threshold || this.model.checkDataRange(chr, start, end)) {
      makeImages();
    } else {
      var buffer = this.prop('dataBuffer');

      this.model.getData(chr, start - buffer.start - length, end + buffer.end + length).done(makeImages).fail(function (e) {
        controller.showError(e);
      });
    }

    return deferred;
  },

  render: function (features, img) {
    var params         = img.data();
        features       = this.view.positionFeatures(this.view.scaleFeatures(features, params.scale), params); // positionFeatures alters params.featureHeight, so this must happen before the canvases are created
    var featureCanvas  = $('<canvas>').attr({ width: params.width, height: params.featureHeight || 1 });
    var labelCanvas    = this.prop('labels') === 'separate' && params.labelHeight ? featureCanvas.clone().attr('height', params.labelHeight) : featureCanvas;
    var featureContext = featureCanvas[0].getContext('2d');
    var labelContext   = labelCanvas[0].getContext('2d');

    featureContext.font = labelContext.font = this.prop('font');

    switch (this.prop('labels')) {
      case false     : break;
      case 'overlay' : labelContext.textAlign = 'center'; labelContext.textBaseline = 'middle'; break;
      default        : labelContext.textAlign = 'left';   labelContext.textBaseline = 'top';    break;
    }

    this.view.draw(features, featureContext, labelContext, params.scale);

    img.attr('src', featureCanvas[0].toDataURL());

    if (labelContext !== featureContext) {
      img.clone(true).attr({ 'class': 'gv-labels', src: labelCanvas[0].toDataURL() }).insertAfter(img);
    }

    this.checkHeight();

    featureCanvas = labelCanvas = img = null;
  },

  renderBackground: function (features, img, height) {
    var canvas = $('<canvas>').attr({ width: this.width, height: height || 1 })[0];
    this.view.drawBackground(features, canvas.getContext('2d'), img.data());
    img.attr('src', canvas.toDataURL());
    canvas = img = null;
  },

  populateMenu: function (feature) {
    var f    = $.extend(true, {}, feature);
    var menu = {
      title    : f.label ? f.label[0] : f.id,
      Location : f.chr + ':' + f.start + '-' + f.end
    };

    delete f.chr;
    delete f.start;
    delete f.end;
    delete f.sort;

    for (var i in f) {
      if (typeof f[i] === 'object' || menu.title === f[i]) {
        delete f[i];
      }
    }

    return $.extend(menu, f);
  },

  abort: function () {
    for (var i = 0; i < this.deferreds.length; i++) {
      if (this.deferreds[i].state() === 'pending') {
        this.deferreds[i].reject();
      }
    }

    this.deferreds = [];
  },

  destroy: function () {
    this.abort();
    this.container.add(this.label).add(this.menus).remove();
  }
});

Genoverse.Track.Model = Base.extend({
  dataType         : 'json',
  allData          : false,
  dataBuffer       : undefined, // e.g. { start: 0, end: 0 } - basepairs to extend data region for, when getting data from the origin
  xhrFields        : undefined,
  url              : undefined,
  urlParams        : undefined, // hash of URL params
  data             : undefined, // if defined, will be used instead of fetching data from a source
  dataRequestLimit : undefined, // if defined, multiple requests will be made by getData if the region size exceeds its value

  constructor: function (properties) {
    $.extend(this, properties);
    Genoverse.wrapFunctions(this);
    this.init();
  },

  init: function (reset) {
    this.setDefaults(reset);

    if (reset) {
      for (var i in this.featuresById) {
        delete this.featuresById[i].position;
      }
    }

    if (!reset || this.data) {
      delete this.dataRangesByChr;
      delete this.featuresByChr;
      this.featuresById = {};
      this.setChrProps();
    }

    this.dataLoading = []; // tracks incomplete requests for data
  },

  setDefaults: function (reset) {
    this.dataBuffer = this.dataBuffer || { start: 0, end: 0 }; // basepairs to extend data region for, when getting data from the origin
    this.urlParams  = this.urlParams  || {};                   // hash of URL params
    this.xhrFields  = this.xhrFields  || {};

    this.dataBufferStart = this.dataBuffer.start; // Remember original dataBuffer.start, since dataBuffer.start is updated based on browser scale, in setLabelBuffer

    if (!this._url) {
      this._url = this.url; // Remember original url
    }

    if (reset && !this.url && this._url) {
      this.url = this._url;
    }
  },

  setChrProps: function () {
    var chr = this.browser.chr;

    this.dataRangesByChr = this.dataRangesByChr || {};
    this.featuresByChr   = this.featuresByChr   || {};

    this.dataRangesByChr[chr] = this.dataRangesByChr[chr] || new RTree();
    this.featuresByChr[chr]   = this.featuresByChr[chr]   || new RTree();
  },

  features   : function (chr) { return this.featuresByChr[chr];   },
  dataRanges : function (chr) { return this.dataRangesByChr[chr]; },

  parseURL: function (chr, start, end, url) {
    if (this.allData) {
      start = 1;
      end   = this.browser.getChromosomeSize(chr);
    }

    return (url || this.url).replace(/__ASSEMBLY__/, this.browser.assembly).replace(/__CHR__/, chr).replace(/__START__/, start).replace(/__END__/, end);
  },

  setLabelBuffer: function (buffer) {
    this.dataBuffer.start = Math.max(this.dataBufferStart, buffer);
  },

  getData: function (chr, start, end, done) {
    start = Math.max(1, start);
    end   = Math.min(this.browser.getChromosomeSize(chr), end);

    var deferred = $.Deferred();

    if (typeof this.data !== 'undefined') {
      this.receiveData(typeof this.data.sort === 'function' ? this.data.sort(function (a, b) { return a.start - b.start; }) : this.data, chr, start, end);
      return deferred.resolveWith(this);
    }

    var model  = this;
    var bins   = [];
    var length = end - start + 1;

    if (!this.url) {
      return deferred.resolveWith(this);
    }

    if (this.dataRequestLimit && length > this.dataRequestLimit) {
      var i = Math.ceil(length / this.dataRequestLimit);

      while (i--) {
        bins.push([ start, i ? start += this.dataRequestLimit - 1 : end ]);
        start++;
      }
    } else {
      bins.push([ start, end ]);
    }

    $.when.apply($, $.map(bins, function (bin) {
      var request = $.ajax({
        url       : model.parseURL(chr, bin[0], bin[1]),
        data      : model.urlParams,
        dataType  : model.dataType,
        context   : model,
        xhrFields : model.xhrFields,
        success   : function (data) { this.receiveData(data, chr, bin[0], bin[1]); },
        error     : function (xhr, statusText) { this.track.controller.showError(statusText + ' while getting the data, see console for more details', arguments); },
        complete  : function (xhr) { this.dataLoading = $.grep(this.dataLoading, function (t) { return xhr !== t; }); }
      });

      request.coords = [ chr, bin[0], bin[1] ]; // store actual chr, start and end on the request, in case they are needed

      if (typeof done === 'function') {
        request.done(done);
      }

      model.dataLoading.push(request);

      return request;
    })).done(function () { deferred.resolveWith(model); });

    return deferred;
  },

  receiveData: function (data, chr, start, end) {
    start = Math.max(start, 1);
    end   = Math.min(end, this.browser.getChromosomeSize(chr));

    this.setDataRange(chr, start, end);
    this.parseData(data, chr, start, end);

    if (this.allData) {
      this.url = false;
    }
  },

  /**
  * parseData(data, chr, start, end) - parse raw data from the data source (e.g. online web service)
  * extract features and insert it into the internal features storage (RTree)
  *
  * >> data  - raw data from the data source (e.g. ajax response)
  * >> chr   - chromosome of the data
  * >> start - start location of the data
  * >> end   - end   location of the data
  * << nothing
  *
  * every feature extracted this routine must construct a hash with at least 3 values:
  *  {
  *    id    : [unique feature id, string],
  *    start : [chromosomal start position, integer],
  *    end   : [chromosomal end position, integer],
  *    [other optional key/value pairs]
  *  }
  *
  * and call this.insertFeature(feature)
  */
  parseData: function (data, chr, start, end) {
    var feature;

    // Example of parseData function when data is an array of hashes like { start: ..., end: ... }
    for (var i = 0; i < data.length; i++) {
      feature = data[i];

      feature.chr  = feature.chr || chr;
      feature.sort = start + i;

      this.insertFeature(feature);
    }
  },

  updateData: function (data) {
    this.data = data;
    this.track.reset();
  },

  setDataRange: function (chr, start, end) {
    if (this.allData) {
      start = 1;
      end   = this.browser.getChromosomeSize(chr);
    }

    this.dataRanges(chr).insert({ x: start, w: end - start + 1, y: 0, h: 1 }, [ start, end ]);
  },

  checkDataRange: function (chr, start, end) {
    start = Math.max(1, start);
    end   = Math.min(this.browser.getChromosomeSize(chr), end);

    var ranges = this.dataRanges(chr).search({ x: start, w: end - start + 1, y: 0, h: 1 }).sort(function (a, b) { return a[0] - b[0]; });

    if (!ranges.length) {
      return false;
    }

    var s = ranges.length === 1 ? ranges[0][0] : 9e99;
    var e = ranges.length === 1 ? ranges[0][1] : -9e99;

    for (var i = 0; i < ranges.length - 1; i++) {
      // s0 <= s1 && ((e0 >= e1) || (e0 + 1 >= s1))
      if (ranges[i][0] <= ranges[i + 1][0] && ((ranges[i][1] >= ranges[i + 1][1]) || (ranges[i][1] + 1 >= ranges[i + 1][0]))) {
        s = Math.min(s, ranges[i][0]);
        e = Math.max(e, ranges[i][1], ranges[i + 1][1]);
      } else {
        return false;
      }
    }

    return start >= s && end <= e;
  },

  insertFeature: function (feature) {
    if (!feature.chr) {
      return;
    }

    // Make sure we have a unique ID, this method is not efficient, so better supply your own id
    if (!feature.id) {
      feature.id = feature.ID || this.hashCode(JSON.stringify($.extend({}, feature, { sort: '' }))); // sort is dependant on the browser's region, so will change on zoom
    }

    var features = this.features(feature.chr);

    if (features && !this.featuresById[feature.id]) {
      if (feature.subFeatures) {
        feature.subFeatures.sort(function (a, b) { return a.start - b.start; });

        for (var i = 0; i < feature.subFeatures.length; i++) {
          feature.subFeatures[i].start = Math.min(Math.max(feature.subFeatures[i].start, feature.start), feature.end);
          feature.subFeatures[i].end   = Math.max(Math.min(feature.subFeatures[i].end,   feature.end),   feature.start);
        }

        // Add "fake" sub-features at the start and end of the feature - this will allow joins to be drawn when there are no sub-features in the current region.
        feature.subFeatures.unshift({ start: feature.start, end: feature.start, fake: true });
        feature.subFeatures.push   ({ start: feature.end,   end: feature.end,   fake: true });
      }

      features.insert({ x: feature.start, y: 0, w: feature.end - feature.start + 1, h: 1 }, feature);
      this.featuresById[feature.id] = feature;
    }
  },

  findFeatures: function (chr, start, end) {
    var features = this.features(chr).search({ x: start - this.dataBuffer.start, y: 0, w: end - start + this.dataBuffer.start + this.dataBuffer.end + 1, h: 1 });
    var filters  = this.prop('featureFilters') || [];

    for (var i = 0; i < filters.length; i++) {
      features = $.grep(features, $.proxy(filters[i], this));
    }

    return this.sortFeatures(features);
  },

  sortFeatures: function (features) {
    return features.sort(function (a, b) { return a.sort - b.sort; });
  },

  abort: function () {
    for (var i = 0; i < this.dataLoading.length; i++) {
      this.dataLoading[i].abort();
    }

    this.dataLoading = [];
  },

  hashCode: function (string) {
    var hash = 0;
    var c;

    if (!string.length) {
      return hash;
    }

    for (var i = 0; i < string.length; i++) {
      c    = string.charCodeAt(i);
      hash = ((hash << 5) - hash) + c;
      hash = hash & hash; // Convert to 32bit integer
    }

    return '' + hash;
  }
});

Genoverse.Track.View = Base.extend({
  fontHeight       : 10,
  fontFamily       : 'sans-serif',
  fontWeight       : 'normal',
  fontColor        : undefined, // label color defaults to this, or feature color, or track.color (below), in that order of precedence
  color            : '#000000',
  minScaledWidth   : 0.5,
  widthCorrection  : 1, // Pixels to add to the end of a feature when scale > 1 - ensures that 1bp features are always at least 1px wide
  labels           : true,
  repeatLabels     : false,
  bump             : false,
  alwaysReposition : false,
  depth            : undefined,
  featureHeight    : undefined, // defaults to track height
  featureMargin    : undefined, // e.g. { top: 3, right: 1, bottom: 1, left: 0 }

  subFeatureJoinStyle     : false, // Can be 'line', 'peak', 'curve'
  subFeatureJoinLineWidth : 0.5,

  constructor: function (properties) {
    $.extend(this, properties);
    Genoverse.wrapFunctions(this);
    this.init();
  },

  // difference between init and constructor: init gets called on reset, if reset is implemented
  init: function () {
    this.setDefaults();
    this.scaleSettings = {};
  },

  setDefaults: function () {
    this.featureMargin = this.featureMargin || { top: 3, right: 1, bottom: 1, left: 0 };

    var margin = [ 'top', 'right', 'bottom', 'left' ];

    for (var i = 0; i < margin.length; i++) {
      if (typeof this.featureMargin[margin[i]] !== 'number') {
        this.featureMargin[margin[i]] = 0;
      }
    }

    this.context       = $('<canvas>')[0].getContext('2d');
    this.featureHeight = typeof this.featureHeight !== 'undefined' ? this.featureHeight : this.prop('defaultHeight');
    this.font          = this.fontWeight + ' ' + this.fontHeight + 'px ' + this.fontFamily;
    this.labelUnits    = [ 'bp', 'kb', 'Mb', 'Gb', 'Tb' ];

    this.context.font = this.font;

    if (this.labels && this.labels !== 'overlay' && (this.depth || this.bump === 'labels')) {
      this.labels = 'separate';
    }
  },

  setScaleSettings: function (scale) {
    var chr = this.browser.chr;

    if (!this.scaleSettings[chr]) {
      this.scaleSettings[chr] = {};
    }

    if (!this.scaleSettings[chr][scale]) {
      var featurePositions = new RTree();

      this.scaleSettings[chr][scale] = {
        imgContainers    : $(),
        featurePositions : featurePositions,
        labelPositions   : this.labels === 'separate' ? new RTree() : featurePositions
      };
    }

    return this.scaleSettings[chr][scale];
  },

  scaleFeatures: function (features, scale) {
    var add = Math.max(scale, this.widthCorrection);
    var feature, j;

    for (var i = 0; i < features.length; i++) {
      feature = features[i];

      if (!feature.position) {
        feature.position = {};
      }

      if (!feature.position[scale]) {
        feature.position[scale] = {
          start  : feature.start * scale,
          width  : Math.max((feature.end - feature.start) * scale + add, this.minScaledWidth),
          height : feature.height || this.featureHeight
        };
      }

      if (feature.subFeatures) {
        for (j = 0; j < feature.subFeatures.length; j++) {
          if (typeof feature.subFeatures[j].height === 'undefined') {
            feature.subFeatures[j].height = feature.position[scale].height;
          }
        }

        this.scaleFeatures(feature.subFeatures, scale);
      }
    }

    return features;
  },

  positionFeatures: function (features, params) {
    params.margin = this.prop('margin');

    for (var i = 0; i < features.length; i++) {
      this.positionFeature(features[i], params);
    }

    params.width         = Math.ceil(params.width);
    params.height        = Math.ceil(params.height);
    params.featureHeight = Math.max(Math.ceil(params.featureHeight), this.prop('resizable') ? Math.max(this.prop('height'), this.prop('minLabelHeight')) : 0);
    params.labelHeight   = Math.ceil(params.labelHeight);

    return features;
  },

  positionFeature: function (feature, params) {
    var scale         = params.scale;
    var scaleSettings = this.scaleSettings[feature.chr][scale];

    if (!scaleSettings) {
      return;
    }

    var subFeatures = feature.subFeatures || [];
    var i;

    feature.position[scale].X = feature.position[scale].start - params.scaledStart; // FIXME: always have to reposition for X, in case a feature appears in 2 images. Pass scaledStart around instead?

    for (i = 0; i < subFeatures.length; i++) {
      subFeatures[i].position[scale].x = subFeatures[i].position[scale].start - params.scaledStart;

      if (this.subFeatureJoinStyle) {
        subFeatures[i].position[scale].join   = subFeatures[i].position[scale].join || {};
        subFeatures[i].position[scale].join.x = subFeatures[i].position[scale].start + subFeatures[i].position[scale].width - params.scaledStart;
      }
    }

    if (this.alwaysReposition || !feature.position[scale].positioned) {
      feature.position[scale].H = feature.position[scale].height + this.featureMargin.bottom;
      feature.position[scale].W = feature.position[scale].width  + (feature.marginRight || this.featureMargin.right);
      feature.position[scale].Y = (
        typeof feature.position[scale].y === 'number' ? feature.position[scale].y :
        typeof feature.y                 === 'number' ? feature.y * feature.position[scale].H : 0
      ) + (feature.marginTop || this.featureMargin.top);

      if (feature.label) {
        if (typeof feature.label === 'string') {
          feature.label = feature.label.split('\n');
        }

        var context = this.context;

        feature.labelHeight = feature.labelHeight || (this.fontHeight + 2) * feature.label.length;
        feature.labelWidth  = feature.labelWidth  || Math.max.apply(Math, $.map(feature.label, function (l) { return Math.ceil(context.measureText(l).width); })) + 1;

        if (this.labels === true) {
          feature.position[scale].H += feature.labelHeight;
          feature.position[scale].W  = Math.max(feature.labelWidth, feature.position[scale].W);
        } else if (this.labels === 'separate' && !feature.position[scale].label) {
          feature.position[scale].label = {
            x: feature.position[scale].start,
            y: feature.position[scale].Y,
            w: feature.labelWidth,
            h: feature.labelHeight
          };
        }
      }

      var bounds = {
        x: feature.position[scale].start,
        y: feature.position[scale].Y,
        w: feature.position[scale].W,
        h: feature.position[scale].H + (feature.marginTop || this.featureMargin.top)
      };

      feature.position[scale].bounds = bounds;

      if (this.bump === true) {
        this.bumpFeature(bounds, feature, scale, scaleSettings.featurePositions);
      }

      scaleSettings.featurePositions.insert(bounds, feature);

      feature.position[scale].bottom     = feature.position[scale].Y + bounds.h + params.margin;
      feature.position[scale].positioned = true;
    }

    var join = this.subFeatureJoinStyle && subFeatures.length ? {
      height : Math.max.apply(Math, subFeatures.map(function (c) { return c.fake ? 0 : c.position[scale].height; })) / 2 * (feature.strand > 0 ? -1 : 1),
      y      : feature.position[scale].Y + feature.position[scale].height / 2
    } : false;

    for (i = 0; i < subFeatures.length; i++) {
      subFeatures[i].position[scale].y = feature.position[scale].Y + (feature.position[scale].height - subFeatures[i].position[scale].height) / 2;

      if (join && subFeatures[i + 1]) {
        $.extend(subFeatures[i].position[scale].join, { width: subFeatures[i + 1].position[scale].x - subFeatures[i].position[scale].join.x }, join);
      }
    }

    if (this.labels === 'separate' && feature.position[scale].label) {
      if (this.alwaysReposition || !feature.position[scale].label.positioned) {
        this.bumpFeature(feature.position[scale].label, feature, scale, scaleSettings.labelPositions);

        feature.position[scale].label.bottom     = feature.position[scale].label.y + feature.position[scale].label.h + params.margin;
        feature.position[scale].label.positioned = true;

        scaleSettings.labelPositions.insert(feature.position[scale].label, feature);
      }

      params.labelHeight = Math.max(params.labelHeight, feature.position[scale].label.bottom);
    }

    params.featureHeight = Math.max(params.featureHeight, feature.position[scale].bottom);
    params.height        = Math.max(params.height, params.featureHeight + params.labelHeight);
  },

  // FIXME: should label bumping bounds be distinct from feature bumping bounds when label is smaller than feature?
  bumpFeature: function (bounds, feature, scale, tree) {
    var depth         = 0;
    var scaleSettings = this.scaleSettings[feature.chr][scale];
    var labels        = tree === scaleSettings.labelPositions && tree !== scaleSettings.featurePositions;
    var bump, clash;

    do {
      if (this.depth && ++depth >= this.depth) {
        if (!labels && $.grep(scaleSettings.featurePositions.search(bounds), function (f) { return f.position[scale].visible !== false; }).length) {
          feature.position[scale].visible = false;
        }

        break;
      }

      bump  = false;
      clash = tree.search(bounds)[0];

      if (clash && clash.id !== feature.id) {
        bounds.y = clash.position[scale][labels ? 'label' : 'bounds'].y + clash.position[scale][labels ? 'label' : 'bounds'].h;
        bump     = true;
      }
    } while (bump);

    if (!labels) {
      feature.position[scale].Y = bounds.y;
    }
  },

  draw: function (features, featureContext, labelContext, scale) {
    var feature, f;

    for (var i = 0; i < features.length; i++) {
      feature = features[i];

      if (feature.position[scale].visible !== false) {
        // TODO: extend with feature.position[scale], rationalize keys
        f = $.extend({}, feature, {
          x             : feature.position[scale].X,
          y             : feature.position[scale].Y,
          width         : feature.position[scale].width,
          height        : feature.position[scale].height,
          labelPosition : feature.position[scale].label
        });

        this.drawFeature(f, featureContext, labelContext, scale);

        if (f.legend !== feature.legend) {
          feature.legend      = f.legend;
          feature.legendColor = f.color;
        }
      }
    }
  },

  drawFeature: function (feature, featureContext, labelContext, scale) {
    if (feature.color !== false && !feature.color) {
      this.setFeatureColor(feature);
    }

    if (feature.subFeatures) {
      this.drawSubFeatures(feature, featureContext, labelContext, scale);
    } else {
      if (feature.x < 0 || feature.x + feature.width > this.width) {
        this.truncateForDrawing(feature);
      }

      if (feature.color !== false) {
        featureContext.fillStyle = feature.color;
        featureContext.fillRect(feature.x, feature.y, feature.width, feature.height);
      }

      if (feature.clear === true) {
        featureContext.clearRect(feature.x, feature.y, feature.width, feature.height);
      }

      if (feature.borderColor) {
        featureContext.strokeStyle = feature.borderColor;
        featureContext.strokeRect(feature.x, Math.floor(feature.y) + 0.5, feature.width, feature.height);
      }
    }

    if (this.labels && feature.label) {
      this.drawLabel(feature, labelContext, scale);
    }

    if (feature.decorations) {
      this.decorateFeature(feature, featureContext, scale);
    }
  },

  drawSubFeatures: function (feature, featureContext, labelContext, scale) {
    var subFeatures = $.extend(true, [], feature.subFeatures);
    var joinColor   = feature.joinColor || feature.color;

    for (var i = 0; i < subFeatures.length; i++) {
      if (!subFeatures[i].fake) {
        this.drawFeature($.extend(true, {}, feature, { subFeatures: false, label: false }, subFeatures[i].position[scale], subFeatures[i]), featureContext, labelContext, scale);
      }

      if (subFeatures[i].position[scale].join && subFeatures[i].position[scale].join.width > 0) {
        this.drawSubFeatureJoin($.extend({ color: joinColor }, subFeatures[i].position[scale].join), featureContext);
      }
    }
  },

  drawLabel: function (feature, context, scale) {
    var original = feature.untruncated;
    var width    = (original || feature).width;

    if (this.labels === 'overlay' && feature.labelWidth >= Math.floor(width)) {
      return;
    }

    if (feature.labelPosition) {
      context.labelPositions = context.labelPositions || new RTree();
    }

    if (typeof feature.label === 'string') {
      feature.label = [ feature.label ];
    }

    var x       = (original || feature).x;
    var n       = this.repeatLabels ? Math.ceil((width - Math.max(scale, 1) - (this.labels === 'overlay' ? feature.labelWidth : 0)) / this.width) || 1 : 1;
    var spacing = width / n;
    var label, start, j, y, currentY, h;

    if (this.repeatLabels && (scale > 1 || this.labels !== 'overlay')) { // Ensure there's always a label in each image
      spacing = this.browser.length * scale;
      n = Math.ceil(width / spacing);
    }

    if (!feature.labelColor) {
      this.setLabelColor(feature);
    }

    context.fillStyle = feature.labelColor;

    if (this.labels === 'overlay') {
      label = [ feature.label.join(' ') ];
      y     = feature.y + (feature.height + 1) / 2;
      h     = 0;
    } else {
      label = feature.label;
      y     = feature.labelPosition ? feature.labelPosition.y : feature.y + feature.height + this.featureMargin.bottom;
      h     = this.fontHeight + 2;
    }

    var i      = context.textAlign === 'center' ? 0.5 : 0;
    var offset = feature.labelWidth * i;

    if (n > 1) {
      i += Math.max(Math.floor(-(feature.labelWidth + x) / spacing), 0);
    }

    for (; i < n; i++) {
      start = x + (i * spacing);

      if (start + feature.labelWidth >= 0) {
        if ((start - offset > this.width) || (i >= 1 && start + feature.labelWidth > feature.position[scale].X + feature.position[scale].width)) {
          break;
        }

        for (j = 0; j < label.length; j++) {
          currentY = y + (j * h);

          if (context.labelPositions && context.labelPositions.search({ x: start, y: currentY, w: feature.labelWidth, h: h }).length) {
            feature.position[scale].label.visible = false;
            continue;
          }

          context.fillText(label[j], start, currentY);

          if (context.labelPositions) {
            context.labelPositions.insert({ x: start, y: currentY, w: feature.labelWidth, h: h }, label[j]);
          }
        }
      }
    }
  },

  setFeatureColor: function (feature) {
    feature.color = this.color;
  },

  setLabelColor: function (feature) {
    feature.labelColor = this.fontColor || feature.color || this.color;
  },

  // Method to lighten a color by an amount, adapted from http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
  shadeColor: function (color, percent) {
    var f = parseInt(color.slice(1), 16);
    var R = f >> 16;
    var G = f >> 8 & 0x00FF;
    var B = f & 0x0000FF;

    return '#' + (
      0x1000000 +
      (Math.round((255 - R) * percent) + R) * 0x10000 +
      (Math.round((255 - G) * percent) + G) * 0x100 +
      (Math.round((255 - B) * percent) + B)
    ).toString(16).slice(1);
  },

  // truncate features - make the features start at 1px outside the canvas to ensure no lines are drawn at the borders incorrectly
  truncateForDrawing: function (feature) {
    var start = Math.min(Math.max(feature.x, -1), this.width + 1);
    var width = feature.x - start + feature.width;

    if (width + start > this.width) {
      width = this.width - start + 1;
    }

    feature.untruncated = { x: feature.x, width: feature.width };
    feature.x           = start;
    feature.width       = Math.max(width, 0);
  },

  drawSubFeatureJoin: function (join, context) {
    var coords = this.truncateSubFeatureJoinForDrawing(join);

    if (!coords) {
      return;
    }

    var lineWidth = context.lineWidth;

    context.strokeStyle = join.color;
    context.lineWidth   = this.subFeatureJoinLineWidth;

    context.beginPath();
    context.moveTo(coords.x1, coords.y1);

    switch (this.subFeatureJoinStyle) {
      case 'line':
        context.lineTo(coords.x3, coords.y1);
        break;
      case 'peak':
        context.lineTo(coords.x2, coords.y2);
        context.lineTo(coords.x3, coords.y3);
        break;
      case 'curve':
        context.quadraticCurveTo(coords.x2, coords.y2, coords.x3, coords.y3);
        break;
      default: break;
    }

    context.stroke();

    context.lineWidth = lineWidth;
  },

  truncateSubFeatureJoinForDrawing: function (coords) {
    var y1 = coords.y; // y coord of the ends of the line (half way down the exon box)
    var y3 = y1;

    if (this.subFeatureJoinStyle === 'line') {
      this.truncateForDrawing(coords);
      y1 += 0.5; // Sharpen line
    }

    var x1 = coords.x;                // x coord of the right edge of the first exon
    var x3 = coords.x + coords.width; // x coord of the left edge of the second exon

    // Skip if completely outside the image's region
    if (x3 < 0 || x1 > this.width) {
      return false;
    }

    var x2, y2, xMid, yScale;

    // Truncate the coordinates of the line being drawn, so it is inside the image's region
    if (this.subFeatureJoinStyle === 'peak') {
      xMid   = (x1 + x3) / 2;
      x2     = xMid;                     // x coord of the peak of the peak/curve
      y2     = coords.y + coords.height; // y coord of the peak of the peak/curve (level with the top (forward strand) or bottom (reverse strand) of the exon box)
      yScale = (y2 - y1) / (xMid - x1);  // Scale factor for recalculating coords if points lie outside the image region

      if (xMid < 0) {
        y2 = coords.y + (yScale * x3);
        x2 = 0;
      } else if (xMid > this.width) {
        y2 = coords.y + (yScale * (this.width - coords.x));
        x2 = this.width;
      }

      if (x1 < 0) {
        y1 = xMid < 0 ? y2 : coords.y - (yScale * coords.x);
        x1 = 0;
      }

      if (x3 > this.width) {
        y3 = xMid > this.width ? y2 : y2 - (yScale * (this.width - x2));
        x3 = this.width;
      }
    } else if (this.subFeatureJoinStyle === 'curve') {
      // TODO: try truncating when style is curve
      x2 = coords.x + coords.width / 2;
      y2 = coords.y + coords.height;
    }

    return {
      x1: x1, y1: y1,
      x2: x2, y2: y2,
      x3: x3, y3: y3
    };
  },

  formatLabel: function (label) {
    var power = Math.floor((label.toString().length - 1) / 3);
    var unit  = this.labelUnits[power];

    label /= Math.pow(10, power * 3);

    return Math.floor(label) + (unit === 'bp' ? '' : '.' + (label.toString().split('.')[1] || '').concat('00').substring(0, 2)) + ' ' + unit;
  },

  drawBackground  : $.noop,
  decorateFeature : $.noop // decoration for the features
});

Genoverse.Track.Controller.Static = Genoverse.Track.Controller.extend({
  addDomElements: function () {
    this.base();

    this.image = $('<img>').appendTo(this.imgContainer);

    this.container.toggleClass('gv-track-container gv-track-container-static').prepend(this.imgContainer);
    this.scrollContainer.add(this.messageContainer).remove();
  },

  reset: function () {
    delete this.stringified;
    this.base.apply(this, arguments);
  },

  setWidth: function (width) {
    this.base(width);
    this.image.width = this.width;
  },

  makeFirstImage: function () {
    this.base.apply(this, arguments);
    this.container.css('left', 0);
    this.imgContainer.show();
  },

  makeImage: function (params) {
    if (this.prop('disabled')) {
      return $.Deferred().resolve();
    }

    var features = this.view.positionFeatures(this.model.findFeatures(params.chr, params.start, params.end), params);

    if (features) {
      var string = JSON.stringify(features);

      if (this.stringified !== string) {
        var height = this.prop('height');

        params.width         = this.width;
        params.featureHeight = height;

        this.render(features, this.image.data(params));
        this.imgContainer.children(':last').show();
        this.resize(height, undefined, false);

        this.stringified = string;
      }
    }

    return $.Deferred().resolve();
  }
});

Genoverse.Track.Model.Static = Genoverse.Track.Model.extend({
  url            : false,
  checkDataRange : function () { return true; }
});

Genoverse.Track.View.Static = Genoverse.Track.View.extend({
  featureMargin : { top: 0, right: 1, bottom: 0, left: 1 },

  positionFeature : $.noop,
  scaleFeatures   : function (features) { return features; },

  draw: function (features, featureContext, labelContext, scale) {
    for (var i = 0; i < features.length; i++) {
      this.drawFeature(features[i], featureContext, labelContext, scale);
    }
  }
});

Genoverse.Track.Static = Genoverse.Track.extend({
  controls   : 'off',
  resizable  : false,
  controller : Genoverse.Track.Controller.Static,
  model      : Genoverse.Track.Model.Static,
  view       : Genoverse.Track.View.Static
});

Genoverse.Track.Controller.Stranded = Genoverse.Track.Controller.extend({
  constructor: function (properties) {
    this.base(properties);

    if (typeof this._makeImage === 'function') {
      return;
    }

    var strand        = this.prop('strand');
    var featureStrand = this.prop('featureStrand');

    if (strand === -1) {
      this._makeImage = this.track.makeReverseImage ? $.proxy(this.track.makeReverseImage, this) : this.makeImage;
      this.makeImage  = $.noop;
    } else {
      strand = this.prop('strand', 1);

      this._makeImage = this.makeImage;
      this.makeImage  = this.makeForwardImage;

      var track = this.track;

      setTimeout(function () {
        track.reverseTrack = track.browser.addTrack(track.constructor.extend({
          id           : track.id ? track.id + 'Reverse' : undefined,
          strand       : -1,
          url          : false,
          order        : typeof track.orderReverse === 'number' ? track.orderReverse : track.order,
          forwardTrack : track
        }));

        $.each(track.controller._deferredReverseTrackImages, function (i, args) { track.controller._makeReverseTrackImage.apply(track.controller, args); });
        delete track.controller._deferredReverseTrackImages;
      }, 1);
    }

    if (!featureStrand) {
      this.prop('featureStrand', strand);
    }
  },

  makeForwardImage: function (params) {
    this._makeReverseTrackImage(params, this._makeImage(params));
  },

  _makeReverseTrackImage: function (params, deferred) {
    var reverseTrack = this.prop('reverseTrack');

    if (!reverseTrack) {
      this._deferredReverseTrackImages = (this._deferredReverseTrackImages || []).concat([[ params, deferred ]]);
      return;
    }

    if (deferred && typeof deferred.done === 'function') {
      deferred.done(function () {
        reverseTrack.controller._makeImage(params, deferred);
      });
    } else {
      reverseTrack.controller._makeImage(params, deferred);
    }
  },

  destroy: function () {
    if (this.removing) {
      return;
    }

    this.removing = true;

    this.browser.removeTrack(this.prop('forwardTrack') || this.prop('reverseTrack'));
    this.base();
  }
});
Genoverse.Track.Model.Stranded = Genoverse.Track.Model.extend({
  init: function (reset) {
    this.base(reset);

    if (!reset) {
      var otherTrack = this.prop('forwardTrack');

      if (otherTrack) {
        this.featuresByChr = otherTrack.prop('featuresByChr');
        this.features      = otherTrack.prop('features');
        this.featuresById  = otherTrack.prop('featuresById');
      }
    }
  },

  parseURL: function () {
    if (!this.urlParams.strand) {
      this.urlParams.strand = this.prop('featureStrand');
    }

    return this.base.apply(this, arguments);
  },

  findFeatures: function () {
    var strand = this.track.featureStrand;
    return $.grep(this.base.apply(this, arguments), function (feature) { return feature.strand === strand; });
  }
});

// These are abstract classes, implemented by Graph.Bar and Graph.Line. They will not work properly on their own.

Genoverse.Track.Controller.Graph = Genoverse.Track.Controller.extend({
  setYRange: function (min, max) {
    if (this.browser.dragging) {
      return;
    }

    if (this.prop('showZeroY')) {
      this.prop('range', [ Math.min(min, 0), Math.max(max, 0) ]);
    } else {
      this.prop('range', [ min, max ]);
    }

    this.track.reset();
  },

  yMinMaxFromFeatures: function (features) {
    var min =  Infinity;
    var max = -Infinity;
    var i, j;

    if (this.prop('type') === 'Line') {
      for (i = 0; i < features.length; i++) {
        for (j = 0; j < features[i].coords.length; j++) {
          if (!isNaN(features[i].coords[j][1])) {
            min = Math.min(min, features[i].coords[j][1]);
            max = Math.max(max, features[i].coords[j][1]);
          }
        }
      }
    } else {
      for (i = 0; i < features.length; i++) {
        if (!isNaN(features[i].height)) {
          min = Math.min(min, features[i].height);
          max = Math.max(max, features[i].height);
        }
      }
    }

    min = min ===  Infinity ? 0 : min;
    max = max === -Infinity ? 0 : max;

    return { min: min, max: max };
  },

  afterSetName: function () {
    this.minLabelHeight = Math.max(this.minLabelHeight, this.prop('fontHeight') * 2 + this.prop('margin') + this.prop('marginTop')); // Minimum height that can contain axis labels for range[0] and range[1]
  },

  visibleFeatureHeight: function () {
    if (this.prop('rescaleable') === 'auto') {
      var yScale = this.track.getYScale();
      var y      = this.yMinMaxFromFeatures(this.model.findFeatures(this.browser.chr, this.browser.start, this.browser.end));

      return Math.ceil(Math.max(yScale * (y.max - y.min), this.prop('hideEmpty') ? 0 : this.minLabelHeight));
    }

    return this.prop('height');
  },

  resize: function () {
    var prevHeight = this.prop('height');
    var rtn        = this.base.apply(this, arguments);
    var height     = this.prop('height');

    if (prevHeight !== height) {
      if (this.prop('rescaleable') === true) {
        var prevRange     = this.prop('range');
        var maxDP         = Math.max.apply(null, prevRange.map(function (r) { return (r.toString().split('.')[1] || '').length; }));
        var prevRangeSize = prevRange[1] - prevRange[0];
        var rangeChange   = Math.ceil((prevRangeSize * (height / prevHeight) - prevRangeSize) / 2);

        this.setYRange(
          parseFloat((prevRange[0] - rangeChange).toFixed(maxDP), 10),
          parseFloat((prevRange[1] + rangeChange).toFixed(maxDP), 10)
        );
      } else {
        this.track.reset();
      }
    }

    (this.prop('expander') || $()).hide();
    (this.prop('resizer')  || $()).removeClass('gv-resizer-expander');

    return rtn;
  },

  autoResize: function () {
    if (this.prop('rescaleable') === 'auto') {
      var visibleFeatures = this.model.findFeatures(this.browser.chr, this.browser.start, this.browser.end);

      if (visibleFeatures.length) {
        var range = this.prop('range');
        var y     = this.yMinMaxFromFeatures(visibleFeatures);

        if (y.min || y.max) {
          var maxDP = Math.max.apply(null, range.map(function (r) { return (r.toString().split('.')[1] || '').length; }));
          var round = Math.pow(10, maxDP);
          var minY  = parseFloat((Math.floor(y.min * round) / round).toFixed(maxDP), 10);
          var maxY  = parseFloat((Math.ceil (y.max * round) / round).toFixed(maxDP), 10);

          if (this.prop('showZeroY')) {
            minY = Math.min(minY, 0);
            maxY = Math.max(maxY, 0);
          }

          if (minY === maxY) {
            maxY++;
          }

          if (minY !== range[0] || maxY !== range[1]) {
            return this.setYRange(minY, maxY);
          }
        }
      }
    } else {
      return this.base.apply(this, arguments);
    }
  },

  makeFirstImage: function () {
    var controller = this;

    return this.base.apply(this, arguments).done(function () {
      controller.prop('yAxisPlaceholder').hide();
      controller.prop('offsetContainer')
        .prepend(controller.prop('guidelinesCanvas'))
        .before(controller.prop('yAxisCanvas').removeClass('gv-loading'));
    });
  },

  typeWrapper        : function (func, args) { return (Genoverse.Track.Controller.Graph[this.prop('type')][func] || Genoverse.Track.Controller.prototype[func]).apply(this, args); },
  click              : function () { return this.typeWrapper('click',              arguments); },
  getClickedFeatures : function () { return this.typeWrapper('getClickedFeatures', arguments); },
  populateMenu       : function () { return this.typeWrapper('populateMenu',       arguments); }
});

Genoverse.Track.Model.Graph = Genoverse.Track.Model.extend({
  dataBuffer     : { start: 1, end: 1 },
  setLabelBuffer : $.noop,
  sortFeatures   : function (features) { return features.sort(function (a, b) { return a.start - b.start; }); }
});

Genoverse.Track.View.Graph = Genoverse.Track.View.extend({
  featureMargin: {},

  featureDataSets: function (features) {
    var datasets = this.prop('datasets').concat({ name: '_default' });
    var setNames = {};
    var sets     = {};

    for (var i = 0; i < datasets.length; i++) {
      setNames[datasets[i].name] = true;
    }

    for (i = 0; i < features.length; i++) {
      set = setNames[features[i].dataset] ? features[i].dataset : '_default';

      sets[set] = sets[set] || [];
      sets[set].push(features[i]);
    }

    return { list: datasets, features: sets };
  }
});

Genoverse.Track.Graph = Genoverse.Track.extend({
  controller   : Genoverse.Track.Controller.Graph,
  margin       : 10,        // Same as fontHeight - needed to allow axis labels for range[0] and range[1] to be drawn without being cut off by the edge of the image
  invert       : true,
  yAxisLabels  : undefined, // An array of numerical labels for the y-axis. Should not be configured manually if the track is resizable.
  yRange       : undefined, // An array of [ minY, maxY ] for the graph
  showZeroY    : true,      // If true, 0 will always be included in auto-generated yRanges. If yRange is defined in configuration, this setting will be ignored.
  globalAlpha  : 1,
  axesSettings : { axisColor: 'black', axisLabelColor: 'black', scaleLineColor: '#E5E5E5' },
  datasets     : [],
  legend       : true,
  labels       : false,

  /*
   * resizable and rescaleableY combine to define what happens when the track "resizes", as follows:
   * resizable | rescaleableY | Effect
   * --------- | ------------ | ------
   * true      | true         | Users can change the track height, and doing so changes the y-axis range (y-axis range will change proportionally to track height change)
   * true      | 'auto'       | Users can change the track height, and doing so does not change the y-axis range. However, the y-axis range will automatically change so that no peaks are cut off.
   * true      | false        | Users can change the track height, and doing so does not change the y-axis range (peak heights will change proportionally to track height change)
   * false     | true         | Like true/true
   * false     | 'auto'       | Track height cannot be changed, but the y-axis range will automatically change so that no peaks are cut off
   * false     | false        | Neither track height nor y-axis range can be changed, either by users or automatically
   * 'auto'    | true         | Like false/'auto'
   * 'auto'    | 'auto'       | Like false/'auto'
   * 'auto'    | false        | Like false/'auto' (it is not possible to change a track's height such that no peaks are cut off without being able to change the y-axis range)
   */
  resizable    : true,
  rescaleableY : 'auto',

  setDefaults: function () {
    this.range       = this.yRange || [ 0, this.height ];
    this.rescaleable = this.rescaleableY;

    if ($.isPlainObject(this.margin)) {
      if (this.invert) {
        this.marginTop = this.margin.bottom;
        this.margin    = this.margin.top;
      } else {
        this.marginTop = this.margin.top;
        this.margin    = this.margin.bottom;
      }
    }

    this.marginTop = typeof this.marginTop === 'number' ? this.marginTop : this.margin;

    if (this.resizable === false) {
      this.resizable = this.rescaleable;
    } else if (this.resizable === 'auto') {
      this.rescaleable = 'auto';
    }

    this.base.apply(this, arguments);

    if (this.legend && !this.datasets.length) {
      this.legend = false;
    }

    this.height        += this.marginTop;
    this.initialHeight += this.marginTop;
  },

  setHeight: function (height) {
    return this.base(height, true); // always force show
  },

  setMVC: function () {
    var hadController = this.controller instanceof Genoverse.Track.Controller;
    var rtn           = this.base.apply(this, arguments);

    if (!hadController) {
      var scrollContainer = this.prop('scrollContainer');

      this.yAxisPlaceholder = $('<div class="gv-image-container gv-loading">');
      this.yAxisCanvas      = $('<canvas class="gv-image-container gv-barchart-axis">' ).attr('width', this.width);
      this.guidelinesCanvas = $('<canvas class="gv-image-container gv-barchart-guide">').attr('width', this.width);

      if (this.disabled) {
        this.yAxisCanvas.add(this.guidelinesCanvas).attr('height', 0);
      }

      this.offsetContainer = $('<div class="gv-scroll-container-offset">')
        .width(this.width)
        .insertAfter(scrollContainer)
        .append(scrollContainer)
        .before(this.yAxisPlaceholder);

      this.drawAxes();
    }

    return rtn;
  },

  afterSetMVC: function () {
    // Never show the control to switch between auto-height and manual resizing, since its behaviour is not the same here as for standard tracks, due to interactions between resizable and rescaleableY.
    (this.prop('heightToggler') || $()).addClass('gv-hidden');
    (this.prop('resizer')       || $()).off('click');
  },

  reset: function () {
    this.drawAxes();
    return this.base.apply(this, arguments);
  },

  enable: function () {
    var wasDisabled = this.disabled;
    var rtn         = this.base.apply(this, arguments);

    if (wasDisabled) {
      this.drawAxes();
    }

    return rtn;
  },

  getYScale: function () {
    var range  = this.prop('range');
    var yScale = (this.prop('height') - this.prop('margin') - this.prop('marginTop')) / (range[1] - range[0]);

    return yScale;
  },

  drawAxes: function () {
    if (this.prop('disabled')) {
      return;
    }

    var width        = this.width;
    var height       = this.prop('height');
    var invert       = this.prop('invert');
    var margin       = this.prop('margin');
    var marginTop    = this.prop('marginTop');
    var fontHeight   = this.prop('fontHeight');
    var range        = this.prop('range');
    var axesSettings = this.prop('axesSettings');
    var yAxisLabels  = this.prop('yAxisLabels');
    var yScale       = this.getYScale();
    var axisContext  = this.prop('yAxisCanvas'     ).attr('height', height)[0].getContext('2d');
    var linesContext = this.prop('guidelinesCanvas').attr('height', height)[0].getContext('2d');
    var y, n, i, interval, maxDP;

    if (!yAxisLabels) {
      n           = Math.floor((height - margin - marginTop) / (fontHeight * 2)); // number of labels that can be shown
      interval    = (range[1] - range[0]) / n;                                    // label incrementor
      yAxisLabels = [];

      if (interval !== Math.round(interval)) { // floats
        // Strenuously ensure that interval does not contain a floating point error.
        // Assumes that values in range do not contain floating point errors.
        maxDP = Math.max.apply(null, range.map(function (r) { return (r.toString().split('.')[1] || '').length; })) + 1;
      }

      for (i = 0; i <= n; i++) {
        yAxisLabels.push((range[0] + interval * i)[maxDP ? 'toFixed' : 'toString'](maxDP));
      }
    }

    var axisWidth = Math.max.apply(null, yAxisLabels.map(function (label) { return axisContext.measureText(label).width; })) + 10;

    this.prop('offsetContainer').css('marginLeft',  axisWidth).width(width - axisWidth);
    this.prop('scrollContainer').css('marginLeft', -axisWidth);

    this.prop('yAxisPlaceholder').width(axisWidth).show();

    axisContext.fillStyle = axesSettings.axisColor;
    axisContext.fillRect(axisWidth - 1, invert ? margin : marginTop, 1, height - margin - marginTop); // Vertical line

    linesContext.fillStyle  = axesSettings.scaleLineColor;
    axisContext.fillStyle    = axesSettings.axisLabelColor;
    axisContext.textBaseline = 'middle';
    axisContext.textAlign    = 'right';

    for (i = 0; i < yAxisLabels.length; i++) {
      y = marginTop + (parseFloat(yAxisLabels[i], 10) - range[0]) * yScale;
      y = invert ? height - y : y;

      linesContext.fillRect(0, y, width, 1);                  // Horizontal line, indicating the y-position of a numerical value
      axisContext.fillRect(axisWidth - 4, y, 4, 1);           // Horizontal line, indicating the y-position of a numerical value
      axisContext.fillText(yAxisLabels[i], axisWidth - 6, y); // The numerical value for the horizontal line
    }

    // Draw a horizontal line at y = 0
    y = (-range[0] * yScale) + marginTop;
    linesContext.fillStyle = axesSettings.axisColor;
    linesContext.fillRect(0, invert ? height - y : y, width, 1);
  }
});

Genoverse.Track.Controller.Graph.Line = {
  click: function () {
    if (this.prop('showPopups')) {
      this.prop('menus').hide(); // Hide first, because closeMenus causes fadeOut to happen, which doens't look great in this scenario
      this.browser.closeMenus(this);
      return Genoverse.Track.Controller.prototype.click.apply(this, arguments);
    }
  },

  getClickedFeatures: function (x) {
    var bounds    = { x: x, y: 0, w: 1, h: 9e99 };
    var tolerance = this.scale > 1 ? 0 : 1 / this.scale;
    var xMid      = bounds.x / this.scale;
    var xRange    = tolerance ? [ Math.floor(xMid - tolerance), Math.ceil(xMid + tolerance) ] : [ Math.floor(xMid), Math.floor(xMid) ];
    var features  = {};

    this.featurePositions.search(bounds).forEach(function (f) {
      if (!features[f.dataset]) {
        features[f.dataset] = f;
      }
    });

    return [
      this.model.sortFeatures(Object.keys(features).map(function (k) {
        return $.extend(true, {}, features[k], { clickedCoords: features[k].coords.filter(function (c) { return c[0] >= xRange[0] && c[0] <= xRange[1]; }) });
      }))
    ];
  },

  populateMenu: function (features) {
    if (!features.length || !features[0].clickedCoords.length) {
      return [];
    }

    var start = features[0].clickedCoords[0][0];
    var end   = features[0].clickedCoords[features[0].clickedCoords.length - 1][0];
    var avg   = start !== end;
    var menu  = { title: features[0].chr + ':' + (start === end ? start : start + '-' + end) };
    var m, values, i;

    function getValues(coords) {
      var values = coords.map(function (c) { return c[1]; }).sort(function (a, b) { return a - b; });

      return {
        avg: values.reduce(function (n, v) { return n + v; }, 0) / values.length,
        min: values[0],
        max: values[values.length - 1]
      };
    }

    if (avg) {
      if (features.length === 1) {
        values = getValues(features[0].clickedCoords);

        menu['Average value'] = values.avg;
        menu['Min value']     = values.min;
        menu['Max value']     = values.max;
      } else {
        menu = [ menu ];

        for (i = 0; i < features.length; i++) {
          values    = getValues(features[i].clickedCoords);
          m         = { title: features[i].dataset };
          m.Average = values.avg;
          m.Min     = values.min;
          m.Max     = values.max;

          menu.push(m);
        }
      }
    } else {
      if (features.length === 1) {
        menu.Value = features[0].clickedCoords[0][1];
      } else {
        for (i = 0; i < features.length; i++) {
          menu[features[i].dataset] = features[i].clickedCoords[0][1];
        }
      }
    }

    return menu;
  }
};

Genoverse.Track.Model.Graph.Line = Genoverse.Track.Model.Graph.extend({
  parseData: function (data, chr, start, end) {
    var features = [];
    var feature, x;

    function getX(f) {
      return typeof f.x !== 'undefined' ? f.x : f.start + (f.start === f.end ? 0 : (f.end - f.start + 1) / 2);
    }

    data.sort(function (a, b) { return (a.start - b.start) || (a.x - b.x); });

    for (i = 0; i < data.length; i++) {
      if (typeof data[i].y !== 'undefined' && !data[i].coords) {
        x = getX(data[i]);

        if (feature && feature.coords[feature.coords.length - 1][0] === x - 1) {
          feature.coords.push([ x, data[i].y ]);
          feature.end = x;
        } else {
          if (feature) {
            features.push(feature);
          }

          feature = $.extend({ coords: [[ x, data[i].y ]], start: x, end: x }, data[i]);
        }
      } else {
        if (feature) {
          features.push(feature);
          feature = undefined;
        }

        features.push(data[i]);
      }
    }

    if (feature) {
      features.push(feature);
    }

    return this.base(features, chr, start, end);
  },

  insertFeature: function (feature) {
    var datasets = this.prop('datasets');

    if (feature.coords) {
      feature.coords = feature.coords.map(function (c, i) { return c.length > 1 ? c : [ feature.start + i, c ]; }).filter(function (c) { return c[0] >= feature.start && c[0] <= feature.end; });
    } else if (feature.y) {
      feature.coords = [[ feature.start + (feature.start === feature.end ? 0 : (feature.end - feature.start + 1) / 2), feature.y ]];
    } else {
      feature.coords = [];
    }

    if (datasets.length) {
      feature.legend = feature.dataset;
      feature.color  = (datasets.filter(function (s) { return s.name === feature.dataset; })[0] || { color: this.color }).color;
    }

    feature.id = feature.id || [ feature.chr, feature.start, feature.end, feature.dataset || '' ].join(':');

    return this.base.apply(this, arguments);
  }
});

Genoverse.Track.View.Graph.Line = Genoverse.Track.View.Graph.extend({
  featureHeight: 1,

  positionFeatures: function (features, params) {
    var scale  = params.scale;
    var yScale = this.track.getYScale();
    var margin = this.prop('marginTop');
    var zeroY  = margin - this.prop('range')[0] * yScale;
    var add    = (scale > 1 ? scale / 2 : 0) - params.scaledStart;

    function setCoords(c) {
      return [ c[0] * scale + add, c[1] * yScale + zeroY ];
    }

    for (var i = 0; i < features.length; i++) {
      features[i].coordPositions = features[i].coords.map(setCoords);
    }

    params.featureHeight = this.prop('height');

    return this.base(features, params);
  },

  draw: function (features, featureContext, labelContext, scale) {
    if (!features.length) {
      return;
    }

    var datasets     = this.featureDataSets(features);
    var height       = this.prop('height');
    var marginTop    = this.prop('marginTop');
    var marginBottom = this.prop('margin');
    var baseline     = Math.min(Math.max(marginTop, marginTop - this.prop('range')[0] * this.track.getYScale()), height - marginTop);
    var binSize      = scale < 1 ? Math.floor(1 / scale) : 0;
    var set, conf, feature, coords, binnedFeatures, lastBinSize, j, k, binStart, bin, l;

    var defaults = {
      color       : this.color,
      fill        : this.prop('fill'),
      lineWidth   : this.prop('lineWidth'),
      globalAlpha : this.prop('globalAlpha')
    };

    for (var i = 0; i < datasets.list.length; i++) {
      set  = datasets.list[i].name;
      conf = $.extend({}, defaults, datasets.list[i]);

      for (j = 0; j < (datasets.features[set] || []).length; j++) {
        feature = datasets.features[set][j];
        coords  = feature.coordPositions;

        if (coords.length) {
          if (binSize) {
            binnedFeatures = [];
            k              = 0;

            while (k < coords.length) {
              binStart = feature.coords[k][0];
              bin      = [];

              while (coords[k] && feature.coords[k][0] - binStart < binSize) {
                bin.push(coords[k++]);
              }

              l      = bin.length;
              bin    = bin.reduce(function (arr, b) { arr[0] += b[0]; arr[1] += b[1]; return arr; }, [ 0, 0 ]);
              bin[0] = Math.round(bin[0] / l);

              if (binnedFeatures.length && bin[0] === binnedFeatures[binnedFeatures.length - 1][0]) {
                binnedFeatures[binnedFeatures.length - 1][1] = (binnedFeatures[binnedFeatures.length - 1][1] * lastBinSize + bin[1]) / (lastBinSize + l);
              } else {
                binnedFeatures.push([ bin[0], bin[1] / l ]);
              }

              lastBinSize = l;
            }

            coords = binnedFeatures;
          }

          featureContext.fillStyle = featureContext.strokeStyle = conf.color;
          featureContext.lineWidth = conf.lineWidth;

          if (conf.fill) {
            featureContext.globalAlpha = conf.globalAlpha;
          }

          featureContext.beginPath();

          if (conf.fill) {
            featureContext.moveTo(coords[0][0], baseline);
            featureContext.lineTo.apply(featureContext, coords[0]);
          } else {
            featureContext.moveTo.apply(featureContext, coords[0]);
          }

          for (k = 1; k < coords.length; k++) {
            featureContext.lineTo.apply(featureContext, coords[k]);
          }

          featureContext.stroke();

          if (conf.fill) {
            featureContext.lineTo(coords[coords.length - 1][0], baseline);
            featureContext.closePath();
            featureContext.fill();
            featureContext.globalAlpha = 1;
          }
        }
      }
    }

    // Don't allow features to be drawn in the margins
    featureContext.clearRect(0, 0,                     this.width, marginTop - 1);
    featureContext.clearRect(0, height - marginBottom, this.width, marginBottom);
  }
});

Genoverse.Track.Graph.Line = Genoverse.Track.Graph.extend({
  type       : 'Line',
  showPopups : true, // If true, clicking on the track will show popups. If false, popups will not appear.
  fill       : false,
  lineWidth  : 1,
  model      : Genoverse.Track.Model.Graph.Line,
  view       : Genoverse.Track.View.Graph.Line
});
Genoverse.Track.Controller.Graph.Bar = {
  getClickedFeatures: function (x, y) {
    var yZero     = this.prop('marginTop') - (this.prop('range')[0] * this.track.getYScale());
    var scale     = this.scale;
    var tolerance = scale > 1 ? 0 : 1;

    // Bars with negative values are stored in featurePositions with h < 0.
    // While this works to a certain degree (fillRect allows negative height, drawing upwards from y), it makes them hard to search for in the RTree - to find such a feature you need to search with y = -h and h = y - h + 1
    // It is therefore easier to search featuresByChr (i.e. the genomic positions) for a feature overlapping the x of the click, and then filter those results for y position manually.
    var features = this.prop('featuresByChr')[this.browser.chr].search({
      x: (x - (tolerance / 2)) / scale,
      y: 0,
      w: (1 + tolerance) / scale,
      h: 1
    });

    if (features.length) {
      if (
        (y <  yZero && features.filter(function (f) { return f.position[scale].bounds.y + f.position[scale].bounds.h <= y && f.position[scale].bounds.y >= y; }).length === 0) ||
        (y >= yZero && this.featurePositions.search({ x: x, y: y, w: 1, h: 1 }).length === 0)
      ) {
        features = [];
      }
    }

    return features.length ? [ this.model.sortFeatures(features) ] : [];
  },

  populateMenu: function (features) {
    if (!features.length) {
      return [];
    }

    var start = features[0].start;
    var end   = features[features.length - 1].end;
    var avg   = features[0].start !== features[features.length - 1].start;
    var menu  = { title: features[0].chr + ':' + (start === end ? start : start + '-' + end) };
    var values, i;

    function getValues(_features) {
      var values = _features.map(function (f) { return f.height; }).sort(function (a, b) { return a - b; });

      return {
        avg: values.reduce(function (n, v) { return n + v; }, 0) / values.length,
        min: values[0],
        max: values[values.length - 1]
      };
    }

    if (avg) {
      if (features.length === 1) {
        values = getValues(features);

        menu['Average value'] = values.avg;
        menu['Min value']     = values.min;
        menu['Max value']     = values.max;
      } else {
        menu = [ menu ];

        var datasets = this.prop('datasets');
        var featuresByDataset;

        if (datasets.length) {
          featuresByDataset = datasets.reduce(function (hash, d) { hash[d.name] = []; return hash; }, {});

          for (i = 0; i < features.length; i++) {
            featuresByDataset[features[i].dataset].push(features[i]);
          }
        } else {
          datasets          = [{ name: '' }];
          featuresByDataset = { '': features };
        }

        for (i = 0; i < datasets.length; i++) {
          values = getValues(featuresByDataset[datasets[i].name]);

          menu.push($.extend({
            Average : values.avg,
            Min     : values.min,
            Max     : values.max
          }, datasets[i].name ? { title: datasets[i].name } : {}));
        }
      }
    } else {
      if (features.length === 1) {
        menu.Value = features[0].height;
      } else {
        for (i = 0; i < features.length; i++) {
          menu[features[i].dataset] = features[i].height;
        }
      }
    }

    return menu;
  }
};

Genoverse.Track.Model.Graph.Bar = Genoverse.Track.Model.Graph.extend({
  insertFeature: function (feature) {
    var datasets = this.prop('datasets');

    if (datasets.length) {
      feature.legend = feature.dataset;
      feature.color  = (datasets.filter(function (s) { return s.name === feature.dataset; })[0] || { color: this.color }).color;
    }

    feature.id = feature.id || [ feature.chr, feature.start, feature.end, feature.dataset || '' ].join(':');

    return this.base.apply(this, arguments);
  }
});

Genoverse.Track.View.Graph.Bar = Genoverse.Track.View.Graph.extend({
  scaleFeatures: function (features, scale) {
    var yScale = this.track.getYScale();
    var zeroY  = this.prop('marginTop') - this.prop('range')[0] * yScale;

    features = this.base(features, scale);

    for (var i = 0; i < features.length; i++) {
      features[i].position[scale].height = features[i].height * yScale;
      features[i].position[scale].y      = zeroY;
    }

    return features;
  },

  draw: function (features, featureContext, labelContext, scale) {
    var datasets     = this.featureDataSets(features);
    var marginBottom = this.prop('margin');
    var binSize      = scale < 1 ? Math.ceil(1 / scale) : 0;
    var conf, set, setFeatures, j, binnedFeatures, binStart, bin, f;

    var defaults = {
      color       : this.color,
      globalAlpha : this.prop('globalAlpha')
    };

    for (var i = 0; i < datasets.list.length; i++) {
      conf        = $.extend({}, defaults, datasets.list[i]);
      set         = datasets.list[i].name;
      setFeatures = $.extend(true, [], datasets.features[set] || []);

      if (!setFeatures.length) {
        continue;
      }

      if (binSize) {
        binnedFeatures = [];
        j              = 0;

        while (j < setFeatures.length) {
          binStart = setFeatures[j].start;
          bin      = [];

          while (setFeatures[j] && setFeatures[j].start - binStart < binSize) {
            bin.push(setFeatures[j++]);
          }


          f = $.extend(true, {}, bin[0], {
            height : bin.reduce(function (a, b) { return a + b.height; }, 0) / bin.length,
            end    : bin[bin.length - 1].end
          });

          [ 'H', 'W', 'height', 'width' ].forEach(function (attr) {
            f.position[scale][attr] = bin.reduce(function (a, b) { return a + b.position[scale][attr]; }, 0) / bin.length;
          });

          binnedFeatures.push(f);
        }

        setFeatures = binnedFeatures;
      }

      for (j = 0; j < setFeatures.length; j++) {
        setFeatures[j].color = conf.color;
      }

      featureContext.globalAlpha = conf.globalAlpha;

      this.base(setFeatures, featureContext, labelContext, scale);
    }

    // Don't allow features to be drawn in the margins
    featureContext.clearRect(0, 0,                                  this.width, this.prop('marginTop') - 1);
    featureContext.clearRect(0, this.prop('height') - marginBottom, this.width, marginBottom);
  }
});

Genoverse.Track.Graph.Bar = Genoverse.Track.Graph.extend({
  type      : 'Bar',
  model     : Genoverse.Track.Model.Graph.Bar,
  view      : Genoverse.Track.View.Graph.Bar,
  threshold : 500000,

  10000: $.extend( // Switch to line graph at 10000bp region
    Object.keys(Genoverse.Track.Graph.Line.prototype).reduce(function (hash, key) {
      if (Genoverse.Track.Graph.Line.prototype.hasOwnProperty(key) && !Base.prototype[key]) {
        hash[key] = Genoverse.Track.Graph.Line.prototype[key];
      }

      return hash;
    }, {}), {
    fill  : true,
    model : Genoverse.Track.Model.Graph.Line.extend({
      parseData: function (data, chr, start, end) {
        var coords = [];
        var j;

        for (var i = 0; i < data.length; i++) {
          for (j = data[i].start; j < data[i].end; j++) {
            coords.push([ j, data[i].height ]);
          }
        }

        return this.base([{ chr: chr, start: start, end: end, coords: coords }], chr, start, end);
      }
    })
  }),
  50000: $.extend( // Switch to sparser line graph at 50000bp region
    Object.keys(Genoverse.Track.Graph.Line.prototype).reduce(function (hash, key) {
      if (Genoverse.Track.Graph.Line.prototype.hasOwnProperty(key) && !Base.prototype[key]) {
        hash[key] = Genoverse.Track.Graph.Line.prototype[key];
      }

      return hash;
    }, {}), {
    fill  : true,
    model : Genoverse.Track.Model.Graph.Line.extend({
      parseData: function (data, chr, start, end) {
        return this.base([{ chr: chr, start: start, end: end, coords: data.map(function (d) { return [ d.start, d.height ]; }) }], chr, start, end);
      }
    })
  })
});
Genoverse.Track.Controller.Sequence = Genoverse.Track.Controller.extend({
  getClickedFeatures: function (x, y) {
    var feature = this.base(x, y)[0];

    return feature ? this.makeSeqFeatureMenu(feature, Math.floor(x / this.scale)) : false;
  },

  makeSeqFeatureMenu: function (feature, pos) {
    feature.featureMenus      = feature.featureMenus      || {};
    feature.featureMenus[pos] = feature.featureMenus[pos] || {
      title    : feature.sequence.charAt(pos - feature.start),
      Location : feature.chr + ':' + pos
    }

    return feature.featureMenus[pos].title ? feature.featureMenus[pos] : undefined;
  }
});

// Abstract Sequence model
// assumes that the data source responds with raw sequence text
// see Fasta model for more specific example
Genoverse.Track.Model.Sequence = Genoverse.Track.Model.extend({
  threshold : 100000,
  chunkSize : 1000,
  buffer    : 0,
  dataType  : 'text',

  setChrProps: function () {
    var chr = this.browser.chr;

    this.base();

    this.chunksByChr      = this.chunksByChr || {};
    this.chunksByChr[chr] = this.chunksByChr[chr] || {};
  },

  getData: function (chr, start, end) {
    start = start - start % this.chunkSize + 1;
    end   = end + this.chunkSize - end % this.chunkSize;
    return this.base(chr, start, end);
  },

  parseData: function (data, chr, start, end) {
    data = data.replace(/\n/g, '');

    if (this.prop('lowerCase')) {
      data = data.toLowerCase();
    }

    for (var i = 0; i < data.length; i += this.chunkSize) {
      if (this.chunksByChr[chr][start + i]) {
        continue;
      }

      var feature = {
        id       : chr + ':' + start + i,
        chr      : chr,
        start    : start + i,
        end      : start + i + this.chunkSize,
        sequence : data.substr(i, this.chunkSize),
        sort     : start + i
      };

      this.chunksByChr[chr][feature.start] = feature;
      this.insertFeature(feature);
    }
  }
});

Genoverse.Track.Model.Sequence.Fasta = Genoverse.Track.Model.Sequence.extend({
  url  : 'http://genoverse.org/data/Homo_sapiens.GRCh37.72.dna.chromosome.1.fa', // Example url

  // Following settings could be left undefined and will be detected automatically via .getStartByte()
  startByte  : undefined, // Byte in the file where the sequence actually starts
  lineLength : undefined, // Length of the sequence line in the file

  // TODO: Check if URL provided

  getData: function (chr, start, end) {
    var deferred = $.Deferred();

    $.when(this.getStartByte()).done(function () {
      start = start - start % this.chunkSize + 1;
      end   = end + this.chunkSize - end % this.chunkSize;

      var startByte = start - 1 + Math.floor((start - 1) / this.lineLength) + this.startByte;
      var endByte   = end   - 1 + Math.floor((end   - 1) / this.lineLength) + this.startByte;

      $.ajax({
        url       : this.parseURL(),
        dataType  : this.dataType,
        context   : this,
        headers   : { 'Range' : 'bytes=' + startByte + '-' + endByte },
        xhrFields : this.xhrFields,
        success   : function (data) { this.receiveData(data, chr, start, end); },
        error     : this.track.controller.showError
      }).done(function () { deferred.resolveWith(this); }).fail(function () { deferred.rejectWith(this); });
    }).fail(function () { deferred.rejectWith(this); });

    return deferred;
  },

  getStartByte: function () {
    if (this.startByteRequest) {
      return this.startByteRequest;
    }

    if (this.startByte === undefined || this.lineLength === undefined) {
      this.startByteRequest = $.ajax({
        url       : this.parseURL(),
        dataType  : 'text',
        context   : this,
        headers   : { 'Range': 'bytes=0-300' },
        xhrFields : this.xhrFields,
        success   : function (data) {
          if (data.indexOf('>') === 0) {
            this.startByte = data.indexOf('\n') + 1;
          } else {
            this.startByte = 0;
          }

          this.lineLength = data.indexOf('\n', this.startByte) - this.startByte;
        }
      });

      return this.startByteRequest;
    }
  }
});

Genoverse.Track.Model.Sequence.Ensembl = Genoverse.Track.Model.Sequence.extend({
  url              : '//rest.ensembl.org/sequence/region/human/__CHR__:__START__-__END__?content-type=text/plain', // Example url
  dataRequestLimit : 10000000 // As per e! REST API restrictions
});

Genoverse.Track.View.Sequence = Genoverse.Track.View.extend({
  featureMargin : { top: 0, right: 0, bottom: 0, left: 0 },
  colors        : { 'default': '#CCCCCC', A: '#73E973', T: '#DE4C61', G: '#FFFF77', C: '#688EC0' },
  labelColors   : { 'default': '#000000', T: '#FFFFFF', C: '#FFFFFF' },
  labels        : 'overlay',

  setDefaults: function () {
    this.base.apply(this, arguments);

    var lowerCase = this.prop('lowerCase');

    this.labelYOffset = typeof this.labelYOffset === 'number' ? this.labelYOffset : (this.featureHeight + 1) / 2;
    this.widestLabel  = typeof this.widestLabel  === 'string' ? this.widestLabel : lowerCase ? 'g' : 'G';
    this.labelWidth   = {};

    this.labelWidth[this.widestLabel] = Math.ceil(this.context.measureText(this.widestLabel).width) + 1;

    if (lowerCase) {
      for (var key in this.colors) {
        this.colors[key.toLowerCase()] = this.colors[key];
      }

      for (key in this.labelColors) {
        this.labelColors[key.toLowerCase()] = this.labelColors[key];
      }
    }
  },

  draw: function (features, featureContext, labelContext, scale) {
    featureContext.textBaseline = 'middle';
    featureContext.textAlign    = 'left';

    var width = Math.max(scale, this.minScaledWidth);

    for (var i = 0; i < features.length; i++) {
      this.drawSequence(features[i], featureContext, scale, width);
    }
  },

  drawSequence: function (feature, context, scale, width) {
    var drawLabels = this.labelWidth[this.widestLabel] < width - 1;
    var start, bp;

    for (var i = 0; i < feature.sequence.length; i++) {
      start = feature.position[scale].X + i * scale;

      if (start < -scale || start > context.canvas.width) {
        continue;
      }

      bp = feature.sequence.charAt(i);

      context.fillStyle = this.colors[bp] || this.colors['default'];
      context.fillRect(start, feature.position[scale].Y, width, this.featureHeight);

      if (!this.labelWidth[bp]) {
        this.labelWidth[bp] = Math.ceil(context.measureText(bp).width) + 1;
      }

      if (drawLabels) {
        context.fillStyle = this.labelColors[bp] || this.labelColors['default'];
        context.fillText(bp, start + (width - this.labelWidth[bp]) / 2, feature.position[scale].Y + this.labelYOffset);
      }
    }
  }
});

Genoverse.Track.View.SequenceVariation = Genoverse.Track.View.Sequence.extend({
  featureHeight : 15,
  featureMargin : { top: 0, right: 0, bottom: 4, left: 0 },
  bump          : true,
  showLegend    : false,

  positionFeature: function (feature, params) {
    var position = feature.position[params.scale];

    if (feature.alt_allele) {
      if (!position.positioned) {
        position.reference = { end: position.start + feature.ref_allele.length * params.scale };
      }

      position.reference.x = position.reference.end - params.scaledStart;
    }

    this.base(feature, params);
  },

  bumpFeature: function (bounds, feature) {
    if (feature.alt_allele) {
      this.base.apply(this, arguments);
    }
  },

  draw: function (features, featureContext, labelContext, scale) {
    var drawing = { seq: [], snv: [] };

    for (var i = 0; i < features.length; i++) {
      drawing[features[i].alt_allele ? 'snv' : 'seq'].push(features[i]);
    }

    this.base(drawing.seq, featureContext, labelContext, scale);
    this.highlightSNVs(drawing.snv, featureContext, scale);
    this.base(drawing.snv, featureContext, labelContext, scale);
    this.outlineSNVs(drawing.snv, featureContext, scale); // Redraw the outline for SNVs, since the feature will have been drawn on top of some of the outline created by highlightSNVs
  },

  highlightSNVs: function (features, context, scale) {
    var position, positionX, positionY;

    for (var i = 0; i < features.length; i++) {
      position  = features[i].position[scale];
      positionX = [ position.X, position.reference.x, position.X + position.width ];

      if (positionX[2] < 0 || positionX[0] > this.width) {
        continue;
      }

      if (positionX[0] < 0 || positionX[2] > this.width) {
        this.truncateForDrawing(positionX);
      }

      positionY = [ 0, position.Y - this.featureMargin.bottom / 2, position.Y, position.Y + this.featureHeight ];

      if (!features[i].highlightColor) {
        this.setHighlightColor(features[i]);
      }

      context.strokeStyle = context.fillStyle = features[i].highlightColor;
      context.lineWidth   = 2;

      context.beginPath();
      context.moveTo(positionX[0], positionY[0]);
      context.lineTo(positionX[1], positionY[0]);
      context.lineTo(positionX[1], positionY[1]);
      context.lineTo(positionX[2], positionY[2]);
      context.lineTo(positionX[2], positionY[3]);
      context.lineTo(positionX[0], positionY[3]);
      context.closePath();
      context.stroke();

      context.lineWidth   = 1;
      context.globalAlpha = 0.5;

      context.fill();

      context.globalAlpha = 1;
    }
  },

  outlineSNVs: function (features, context, scale) {
    var position, positionX, positionY;

    for (var i = 0; i < features.length; i++) {
      position  = features[i].position[scale];
      positionX = [ position.X, position.X + position.width ];
      positionY = [ position.Y, position.Y + this.featureHeight ];

      context.strokeStyle = features[i].highlightColor;

      context.lineWidth = 2;

      context.beginPath();
      context.moveTo(positionX[1], positionY[0]);
      context.lineTo(positionX[1], positionY[1]);
      context.lineTo(positionX[0], positionY[1]);
      context.lineTo(positionX[0], positionY[0]);
      context.stroke();

      context.lineWidth = 1;
    }
  },

  truncateForDrawing: function (positionX) {
    for (var i in positionX) {
      positionX[i] = Math.min(Math.max(positionX[i], -1), this.width + 1);
    }
  },

  setHighlightColor: function (feature) {
    feature.highlightColor = feature.alt_allele === '-' || feature.alt_allele.length < feature.ref_allele.length ? '#D31D00' : '#1DD300';
  }
});

Genoverse.Track.Model.SequenceVariation = Genoverse.Track.Model.extend({
  seqModel: Genoverse.Track.Model.Sequence.Ensembl,

  getSeqModel: function () {
    var models = this.prop('models');
    return models.seq = models.seq || this.track.newMVC(this.seqModel);
  },

  getData: function (chr, start, end) {
    var deferred = $.Deferred();
    var seqData  = this.getSeqModel().checkDataRange(chr, start, end);

    this.base(chr, start, end).done(function () {
      if (seqData) {
        deferred.resolve();
      } else {
        this.getSeqModel().getData(chr, start, end).done(deferred.resolve);
      }
    });

    return deferred;
  },

  insertFeature: function (feature) {
    return this.base($.extend(feature, {
      end      : feature.start + feature.alt_allele.length - 1,
      length   : feature.alt_allele.length,
      sequence : feature.alt_allele
    }));
  },

  checkDataRange: function (chr, start, end) {
    return this.base(chr, start, end) && this.getSeqModel().checkDataRange(chr, start, end);
  },

  findFeatures: function (chr, start, end) {
    return this.getSeqModel().findFeatures(chr, start, end).concat(this.base(chr, start, end));
  }
});

// Abstract Gene model
// see sub-models for more specific examples
Genoverse.Track.Model.Gene = Genoverse.Track.Model.extend({

});
// Ensembl REST API Gene model
Genoverse.Track.Model.Gene.Ensembl = Genoverse.Track.Model.Gene.extend({
  url              : '//rest.ensembl.org/overlap/region/human/__CHR__:__START__-__END__?feature=gene;content-type=application/json',
  dataRequestLimit : 5000000, // As per e! REST API restrictions

  // The url above responds in json format, data is an array
  // We assume that parents always preceed children in data array, gene -> transcript -> exon
  // See rest.ensembl.org/documentation/info/feature_region for more details
  parseData: function (data, chr) {
    for (var i = 0; i < data.length; i++) {
      var feature = data[i];

      if (feature.feature_type === 'gene' && !this.featuresById[feature.id]) {
        feature.chr         = feature.chr || chr;
        feature.label       = parseInt(feature.strand, 10) === 1 ? (feature.external_name || feature.id) + ' >' : '< ' + (feature.external_name || feature.id);
        feature.transcripts = [];

        this.insertFeature(feature);
      }
    }
  }
});

Genoverse.Track.View.Gene = Genoverse.Track.View.extend({
  featureHeight : 5,
  labels        : true,
  repeatLabels  : true,
  bump          : true
});

Genoverse.Track.View.Gene.Ensembl = Genoverse.Track.View.Gene.extend({
  setFeatureColor: function (feature) {
    var processed_transcript = {
      'sense_intronic'           : 1,
      'sense_overlapping'        : 1,
      'processed_transcript'     : 1,
      'nonsense_mediated_decay'  : 1,
      'non_stop_decay'           : 1,
      'antisense'                : 1,
      'retained_intron'          : 1,
      'tec'                      : 1,
      'non_coding'               : 1,
      'ambiguous_orf'            : 1,
      'disrupted_domain'         : 1,
      '3prime_overlapping_ncrna' : 1
    };

    feature.color = '#000000';

    if (feature.logic_name.indexOf('ensembl_havana') === 0) {
      feature.color  = '#CD9B1D';
      feature.legend = 'Merged Ensembl/Havana';
    } else if (processed_transcript[feature.biotype]) {
      feature.color  = '#0000FF';
      feature.legend = 'Processed transcript';
    } else if (feature.biotype === 'protein_coding') {
      feature.color  = '#A00000';
      feature.legend = 'Protein coding';
    } else if (feature.biotype.indexOf('pseudogene') > -1) {
      feature.color  = '#666666';
      feature.legend = 'Pseudogene';
    } else if (/rna/i.test(feature.biotype)) {
      feature.color  = '#8B668B';
      feature.legend = 'RNA gene';
    } else if (/^tr_.+_gene$/i.test(feature.biotype)) {
      feature.color  = '#CD6600';
      feature.legend = 'TR gene';
    } else if (/^ig_.+_gene$/i.test(feature.biotype)) {
      feature.color  = '#8B4500';
      feature.legend = 'IG gene';
    }

    feature.labelColor = feature.color;
  }
});
// Abstract Transcript model
// see sub-models for more specific examples
Genoverse.Track.Model.Transcript = Genoverse.Track.Model.extend({

});
// Ensembl REST API Transcript model
Genoverse.Track.Model.Transcript.Ensembl = Genoverse.Track.Model.Transcript.extend({
  url              : '//rest.ensembl.org/overlap/region/human/__CHR__:__START__-__END__?feature=transcript;feature=exon;feature=cds;content-type=application/json',
  dataRequestLimit : 5000000, // As per e! REST API restrictions

  setDefaults: function () {
    this.geneIds   = {};
    this.seenGenes = 0;

    this.base.apply(this, arguments);
  },

  // The url above responds in json format, data is an array
  // See rest.ensembl.org/documentation/info/overlap_region for more details
  parseData: function (data, chr) {
    var model        = this;
    var featuresById = this.featuresById;
    var ids          = [];

    data.filter(function (d) { return d.feature_type === 'transcript'; }).forEach(function (feature, i) {
      if (!featuresById[feature.id]) {
        model.geneIds[feature.Parent] = model.geneIds[feature.Parent] || ++model.seenGenes;

        feature.chr         = feature.chr || chr;
        feature.label       = parseInt(feature.strand, 10) === 1 ? (feature.external_name || feature.id) + ' >' : '< ' + (feature.external_name || feature.id);
        feature.sort        = (model.geneIds[feature.Parent] * 1e10) + (feature.logic_name.indexOf('ensembl_havana') === 0 ? 0 : 2e9) + (feature.biotype === 'protein_coding' ? 0 : 1e9) + feature.start + i;
        feature.cdsStart    = Infinity;
        feature.cdsEnd      = -Infinity;
        feature.exons       = {};
        feature.subFeatures = [];

        model.insertFeature(feature);
      }

      ids.push(feature.id);
    });

    data.filter(function (d) { return d.feature_type === 'cds' && featuresById[d.Parent]; }).forEach(function (cds) {
      featuresById[cds.Parent].cdsStart = Math.min(featuresById[cds.Parent].cdsStart, cds.start);
      featuresById[cds.Parent].cdsEnd   = Math.max(featuresById[cds.Parent].cdsEnd,   cds.end);
    });

    data.filter(function (d) { return d.feature_type === 'exon' && featuresById[d.Parent] && !featuresById[d.Parent].exons[d.id]; }).forEach(function (exon) {
      if (exon.end < featuresById[exon.Parent].cdsStart || exon.start > featuresById[exon.Parent].cdsEnd) {
        exon.utr = true;
      } else if (exon.start < featuresById[exon.Parent].cdsStart) {
        featuresById[exon.Parent].subFeatures.push($.extend({ utr: true }, exon, { end: featuresById[exon.Parent].cdsStart }));

        exon.start = featuresById[exon.Parent].cdsStart;
      } else if (exon.end > featuresById[exon.Parent].cdsEnd) {
        featuresById[exon.Parent].subFeatures.push($.extend({ utr: true }, exon, { start: featuresById[exon.Parent].cdsEnd }));

        exon.end = featuresById[exon.Parent].cdsEnd;
      }

      featuresById[exon.Parent].subFeatures.push(exon);
      featuresById[exon.Parent].exons[exon.id] = exon;
    });

    ids.forEach(function (id) {
      featuresById[id].subFeatures.sort(function (a, b) { return a.start - b.start; });
    });
  }
});

Genoverse.Track.View.Transcript = Genoverse.Track.View.extend({
  featureHeight       : 10,
  utrHeight           : 7,
  labels              : true,
  repeatLabels        : true,
  bump                : true,
  subFeatureJoinStyle : 'curve',

  scaleFeatures: function (features, scale) {
    var subFeatures, j;

    for (var i = 0; i < features.length; i++) {
      subFeatures = features[i].subFeatures || [];

      if (subFeatures.length) {
        for (j = 0; j < subFeatures.length; j++) {
          if (subFeatures[j].utr) {
            subFeatures[j].height = this.utrHeight;
          }
        }

        features[i].height = Math.max.apply(Math, subFeatures.map(function (c) { return c.fake ? 0 : c.height || 0; }).concat(this.featureHeight));
      }
    }

    return this.base(features, scale);
  }
});
Genoverse.Track.View.Transcript.Ensembl = Genoverse.Track.View.Transcript.extend({
  setFeatureColor: function (feature) {
    Genoverse.Track.View.Gene.Ensembl.prototype.setFeatureColor(feature);

    for (var i = 0; i < (feature.subFeatures || []).length; i++) {
      if (feature.subFeatures[i].utr) {
        feature.subFeatures[i].color       = false;
        feature.subFeatures[i].borderColor = feature.color;
      }
    }
  }
});
Genoverse.Track.Model.File = Genoverse.Track.Model.extend({
  dataType: 'text',

  init: function () {
    if (this.isLocal) {
      this.url = false;
    }

    if (!(this.largeFile || this.indexFile)) {
      this.allData = true;
    }

    this.base.apply(this, arguments);
  },

  getData: function (chr) {
    var model = this;

    if (this.isLocal && this.dataFile) {
      var reader   = new FileReader();
      var deferred = $.Deferred();

      reader.onload = function (e) {
        deferred.done(function () {
          this.receiveData(e.target.result, chr, 1, this.browser.getChromosomeSize(chr));
        }).resolveWith(model);
      };

      reader.readAsText(this.dataFile);

      return deferred;
    } else {
      return this.base.apply(this, arguments);
    }
  }
});

Genoverse.Track.Model.File.BAM = Genoverse.Track.Model.File.extend({
  getData: function (chr, start, end) {
    var model    = this;
    var deferred = $.Deferred();

    if (!this.bamFile) {
      if (this.url) {
        this.bamFile = new dallianceLib.URLFetchable(this.url);
        this.baiFile = new dallianceLib.URLFetchable(this.url + this.prop('indexExt'));
      } else if (this.dataFile && this.indexFile) {
        this.bamFile = new dallianceLib.BlobFetchable(this.dataFile);
        this.baiFile = new dallianceLib.BlobFetchable(this.indexFile);
      } else {
        return deferred.rejectWith(model, [ 'BAM files must be accompanied by a .bai index file' ]);
      }
    }

    dallianceLib.makeBam(this.bamFile, this.baiFile, null, function (bam, makeBamError) {
      if (makeBamError) {
        console.log(makeBamError);
      } else {
        bam.fetch(chr, start, end, function (features, fetchBamError) {
          if (fetchBamError) {
            console.log(fetchBamError);
          } else {
            model.receiveData(features, chr, start, end);
            deferred.resolveWith(model);
          }
        });
      }
    });

    return deferred;
  },

  insertFeature: function (feature) {
    feature.id       = feature.chr + ':' + feature.readName + ':' + feature.pos;
    feature.start    = feature.pos + 1;
    feature.end      = feature.start + feature.seq.length;
    feature.sequence = feature.seq;

    return this.base(feature);
  }
});

Genoverse.Track.Model.File.BED = Genoverse.Track.Model.File.extend({
  parseData: function (data, chr) {
    var lines       = typeof data === 'string' ? data.split('\n') : data;
    var thinHeight  = this.prop('thinHeight');
    var thickHeight = this.prop('thickHeight');
    var fields, len, feature, subfeatures, subfeature, blockSizes, blockStarts, j, thinFeature, thinFeature1, thinFeature2, thickFeature;

    function filterNumber(n) {
      return !isNaN(n);
    }

    for (var i = 0; i < lines.length; i++) {
      fields = lines[i].split('\t').filter(function(f) { return f; });

      if (fields.length < 3 || fields[0] == 'track' || fields[0] == 'browser') {
        continue;
      }

      len = fields.length;

      if (fields[0] == chr || fields[0].toLowerCase() == 'chr' + chr || fields[0].match('[^1-9]' + chr + '$')) {
        feature = {
          chr             : chr,
          start           : parseInt(fields[1], 10),
          end             : parseInt(fields[2], 10),
          name            : fields[3],
          color           : '#000000',
          originalFeature : fields
        };

        if (len > 3) { feature.score  = parseFloat(fields[4], 10); }
        if (len > 5) { feature.strand = fields[5];                 }

        if (len > 7) {
          feature.thickStart = fields[6];
          feature.thickEnd   = fields[7];
          feature.drawThick  = (feature.thickStart === feature.thickEnd) ? false : true;
        }

        if (fields[8]) {
          feature.color = 'rgb(' + fields[8] + ')';
        } else {
          feature.color = this.scoreColor(isNaN(feature.score) ? 1000 : feature.score);
        }

        if (len == 12) { // subfeatures present
          feature.blockCount = parseInt(fields[9],10);

          subfeatures = [];
          blockSizes  = fields[10].split(',').filter(filterNumber);
          blockStarts = fields[11].split(',').filter(filterNumber);

          for (j = 0; j < blockSizes.length; j++) {
            subfeature = {
              start  : feature.start + parseInt(blockStarts[j], 10),
              height : thinHeight // if subfeature lies entirely left / right to [ thickStart, thickEnd ]
            };

            subfeature.end = subfeature.start + parseInt(blockSizes[j], 10);

            if (feature.drawThick && subfeature.start <= feature.thickEnd && subfeature.end >= feature.thickStart) {
              // some kind of an overlap for sure
              if (subfeature.start > feature.thickStart && subfeature.end < feature.thickEnd) {
                // subfeature within thickBlock, draw thick
                subfeature.height = thickHeight;
                subfeatures.push(subfeature);
              } else if (subfeature.start < feature.thickStart && subfeature.end <= feature.thickEnd) {
                // left overlap, split subfeature into 2 - thin | thick
                thinFeature  = $.extend({}, subfeature, { end: feature.thickStart });
                thickFeature = $.extend({}, subfeature, { start: feature.thickStart, height: thickHeight });

                subfeatures = subfeatures.concat([thinFeature, thickFeature]);
              } else if (subfeature.start >= feature.thickStart && subfeature.end > feature.thickEnd) {
                // right overlap, split subfeature into 2 - thick | thin
                thinFeature  = $.extend({}, subfeature, { start: feature.thickEnd });
                thickFeature = $.extend({}, subfeature, { end: feature.thickEnd, height: thickHeight });

                subfeatures = subfeatures.concat([ thickFeature, thinFeature ]);
              }else{
                // thickBlock lies within subfeature, split into 3 - thin | thick | thin
                // the least possible case but lets be prepared for the outliers
                thinFeature1 = $.extend({}, subfeature, { end: feature.thickStart });
                thinFeature2 = $.extend({}, subfeature, { start: feature.thickEnd });
                thickFeature = { start: feature.thickStart, end: feature.thickEnd, height: thickHeight };

                subfeatures = subfeatures.concat([ thinFeature1, thickFeature, thinFeature2 ]);
              }
            } else {
              // no thick block
              subfeatures.push(subfeature);
            }
          }

          if (subfeatures.length) {
            feature.subFeatures = subfeatures;
          }
        }

        this.insertFeature(feature);
      }
    }
  },

  // As per https://genome.ucsc.edu/FAQ/FAQformat.html#format1 specification
  scoreColor: function (score) {
    if (score <= 166) { return 'rgb(219,219,219)'; }
    if (score <= 277) { return 'rgb(186,186,186)'; }
    if (score <= 388) { return 'rgb(154,154,154)'; }
    if (score <= 499) { return 'rgb(122,122,122)'; }
    if (score <= 611) { return 'rgb(94,94,94)';    }
    if (score <= 722) { return 'rgb(67,67,67)';    }
    if (score <= 833) { return 'rgb(42,42,42)';    }
    if (score <= 944) { return 'rgb(21,21,21)';    }
    return '#000000';
  }
});

Genoverse.Track.Model.File.GFF = Genoverse.Track.Model.File.extend({
  parseData: function (text, chr) {
    var lines = text.split('\n');

    for (var i = 0; i < lines.length; i++) {
      if (!lines[i].length || lines[i].indexOf('#') === 0) {
        continue;
      }

      var fields = lines[i].split('\t');

      if (fields.length < 5) {
        continue;
      }

      var seqId = fields[0].toLowerCase();

      if (
        seqId == chr                      ||
        seqId == 'chr' + chr              ||
        seqId.match('[^1-9]' + chr + '$') ||
        seqId.match('^' + chr + '\\b')
      ) {
        this.insertFeature({
          id     : fields.slice(0, 5).join('|'),
          chr    : chr,
          start  : parseInt(fields[3], 10),
          end    : parseInt(fields[4], 10),
          source : fields[1],
          type   : fields[2],
          score  : fields[5],
          strand : fields[6] === '-' ? -1 : 1,
          label  : fields[1] + ' ' + fields[2] + ' ' + fields[3] + '-' + fields[4]
        });
      }
    }
  }
});

Genoverse.Track.Model.File.GTF = Genoverse.Track.Model.File.GFF;

Genoverse.Track.Model.File.VCF = Genoverse.Track.Model.File.extend({
  getData: function (chr, start, end) {
    var deferred = $.Deferred();
    var model    = this;

    if (!this.prop('gz')) {
      return this.base.apply(this, arguments);
    }

    if (!this.vcfFile) {
      if (this.url) {
        this.vcfFile = new dallianceLib.URLFetchable(this.url);
        this.tbiFile = new dallianceLib.URLFetchable(this.url + this.prop('indexExt'));
      } else if (this.dataFile && this.indexFile) {
        this.vcfFile = new dallianceLib.BlobFetchable(this.dataFile);
        this.tbiFile = new dallianceLib.BlobFetchable(this.indexFile);
      } else {
        return deferred.rejectWith(model, [ 'GZipped VCF files must be accompanied by a .tbi index file' ]);
      }
    }

    this.makeVCF(this.vcfFile, this.tbiFile).then(function (vcf) {
      model.cachedVCF = vcf;

      vcf.getRecords(chr, start, end, function (records) {
        model.receiveData(records, chr, start, end);
        deferred.resolveWith(model);
      });
    });

    return deferred;
  },

  makeVCF: function (vcfFile, tbiFile) {
    var deferred = $.Deferred();

    if (this.cachedVCF) {
      deferred.resolve(this.cachedVCF);
    } else {
      var vcf = new VCFReader(vcfFile, tbiFile);

      vcf.readTabix(function (tabix) {
        vcf.tabix = tabix;
        deferred.resolve(vcf);
      });
    }

    return deferred;
  },

  parseData: function (text, chr) {
    var lines   = text.split('\n');
    var maxQual = this.allData ? this.prop('maxQual') || 0 : false;

    for (var i = 0; i < lines.length; i++) {
      if (!lines[i].length || lines[i].indexOf('#') === 0) {
        continue;
      }

      var fields = lines[i].split('\t');

      if (fields.length < 5) {
        continue;
      }

      if (fields[0] == chr || fields[0] == 'chr' + chr) {
        var id      = fields.slice(0, 3).join('|');
        var start   = parseInt(fields[1], 10);
        var alleles = fields[4].split(',');

        alleles.unshift(fields[3]);

        for (var j = 0; j < alleles.length; j++) {
          var end = start + alleles[j].length - 1;

          this.insertFeature({
            id              : id + '|' + alleles[j],
            sort            : j,
            chr             : chr,
            start           : start,
            end             : end,
            width           : end - start,
            allele          : j === 0 ? 'REF' : 'ALT',
            sequence        : alleles[j],
            label           : alleles[j],
            labelColor      : '#FFFFFF',
            originalFeature : fields
          });
        }

        if (maxQual !== false) {
          maxQual = Math.max(maxQual, fields[5]);
        }
      }
    }

    if (maxQual) {
      this.prop('maxQual', maxQual);
    }
  }
});

Genoverse.Track.Model.File.WIG = Genoverse.Track.Model.Graph.Bar.extend({
  dataType: 'text',

  getData: function () {
    if (!this.url) {
      this.isLocal  = true;
      this.dataFile = this.track.dataFile;

      return Genoverse.Track.Model.File.prototype.getData.apply(this, arguments);
    }

    return this.base.apply(this, arguments);
  },

  parseData: function (text, chr, s, e) {
    var lines    = text.split('\n');
    var features = [];
    var fields, chrom, start, step, span, line, feature, i;

    while (lines.length && (line = lines.shift())) {
      if (line.indexOf('#') != -1 || line.indexOf('browser') != -1 || line.indexOf('track') != -1) {
        continue;
      } else {
        break;
      }
    }

    if (line) {
      fields = line.split(/\s+/);
      chrom  = parseInt(fields[1].split('=')[1].replace('chr',''));

      if (fields[0] == 'fixedStep') {
        start = parseInt(fields[2].split('=')[1]);
        step  = parseInt(fields[3].split('=')[1]);
        span  = fields[4] ? parseInt(fields[4].split('=')[1]) : 1;

        for (i = 0; i < lines.length; i++){
          features.push({
            chr    : chrom,
            start  : start,
            end    : start + span,
            height : parseFloat(lines[i])
          });

          start += step;
        }
      } else if (fields[0] == 'variableStep') {
        span = fields[2] ? parseInt(fields[2].split('=')[1]) : 1;

        for (i = 0; i < lines.length; i++){
          fields  = lines[i].split(/\s+/);
          feature = {
            chr    : chrom,
            start  : parseInt(fields[0], 10),
            height : parseFloat(fields[1])
          };

          feature.end = feature.start + span;

          features.push(feature);
        }
      }
    }

    return this.base.call(this, features, chr, s, e);
  }
});

Genoverse.Track.Chromosome = Genoverse.Track.extend({
  id            : 'chromosome',
  margin        : 1,
  featureMargin : { top: 0, right: 0, bottom: 0, left: 0 },
  labels        : 'overlay',
  url           : false,
  allData       : true,
  colors        : {
    acen    : '#708090',
    gneg    : '#FFFFFF',
    gpos    : '#000000',
    gpos100 : '#000000',
    gpos25  : '#D9D9D9',
    gpos33  : '#BFBFBF',
    gpos50  : '#999999',
    gpos66  : '#7F7F7F',
    gpos75  : '#666666',
    gvar    : '#E0E0E0',
    stalk   : '#708090'
  },
  labelColors: {
    gneg   : '#000000',
    gvar   : '#000000',
    gpos25 : '#000000',
    gpos33 : '#000000'
  },

  getData: function (chr, start, end) {
    this.receiveData($.extend(true, [], this.browser.genome[chr].bands), chr, start, end);
    return $.Deferred().resolveWith(this);
  },

  insertFeature: function (feature) {
    feature.label      = feature.type === 'acen' || feature.type === 'stalk' ? false : feature.id;
    feature.menuTitle  = feature.id ? feature.chr + feature.id : feature.chr + ':' + feature.start + '-' + feature.end;
    feature.color      = this.prop('colors')[feature.type]      || '#FFFFFF';
    feature.labelColor = this.prop('labelColors')[feature.type] || '#FFFFFF';

    if (feature.id) {
      feature.id = feature.chr + feature.id;
    }

    this.base(feature);
  },

  drawFeature: function (feature, featureContext, labelContext, scale) {
    featureContext.fillStyle   = feature.color;
    featureContext.strokeStyle = '#000000';

    if (feature.type === 'acen') {
      featureContext.beginPath();

      if (this.drawnAcen) {
        featureContext.moveTo(feature.x + feature.width, 0.5);
        featureContext.lineTo(feature.x, (feature.height + 0.5) / 2);
        featureContext.lineTo(feature.x + feature.width, feature.height + 0.5);
      } else {
        featureContext.moveTo(feature.x, 0.5);
        featureContext.lineTo(feature.x + feature.width, (feature.height + 0.5) / 2);
        featureContext.lineTo(feature.x, feature.height + 0.5);
        this.drawnAcen = true;
      }

      featureContext.fill();
      featureContext.stroke();
    } else if (feature.type === 'stalk') {
      for (var i = 0; i < 2; i++) {
        featureContext.beginPath();

        featureContext.moveTo(feature.x, 0.5);
        featureContext.lineTo(feature.x + feature.width * 0.25, feature.height * 0.25 + 0.5);
        featureContext.lineTo(feature.x + feature.width * 0.75, feature.height * 0.25 + 0.5);
        featureContext.lineTo(feature.x + feature.width, 0.5);

        featureContext[i ? 'moveTo' : 'lineTo'](feature.x + feature.width, feature.height + 0.5);
        featureContext.lineTo(feature.x + feature.width * 0.75, feature.height * 0.75 - 0.5);
        featureContext.lineTo(feature.x + feature.width * 0.25, feature.height * 0.75 - 0.5);
        featureContext.lineTo(feature.x, feature.height + 0.5);

        featureContext[i ? 'stroke' : 'fill']();
      }
    } else {
      this.base(feature, featureContext, labelContext, scale);

      featureContext.beginPath();

      var chrSize = this.browser.getChromosomeSize(feature.chr);

      if (feature.start === 1 || feature.end === chrSize) {
        if (feature.start === 1) {
          var end = feature.x + feature.width - (feature.end === chrSize ? 5 : 0);

          featureContext.clearRect(0, 0, 5, feature.height + 0.5);

          featureContext.fillStyle = feature.color;
          featureContext.moveTo(5,   0.5);
          featureContext.lineTo(end, 0.5);
          featureContext.moveTo(5,   feature.height + 0.5);
          featureContext.lineTo(end, feature.height + 0.5);
          featureContext.moveTo(5, 0.5);
          featureContext.bezierCurveTo(-1, 0.5, -1, feature.height + 0.5, 5, feature.height + 0.5);
          featureContext.fill();
        }

        if (feature.end === chrSize) {
          featureContext.clearRect(feature.x + feature.width - 5, 0, 5, feature.height + 0.5);

          if (feature.start !== 1) {
            featureContext.fillStyle = feature.color;
            featureContext.moveTo(feature.x, 0.5);
            featureContext.lineTo(feature.x + feature.width - 5, 0.5);
            featureContext.moveTo(feature.x, feature.height + 0.5);
            featureContext.lineTo(feature.x + feature.width - 5, feature.height + 0.5);
          }

          featureContext.moveTo(feature.x + feature.width - 5, 0.5);
          featureContext.bezierCurveTo(this.width + 1, 0.5, this.width + 1, feature.height + 0.5, feature.x + feature.width - 5, feature.height + 0.5);
          featureContext.fill();
        }
      } else {
        featureContext.moveTo(feature.x, 0.5);
        featureContext.lineTo(feature.x + feature.width, 0.5);
        featureContext.moveTo(feature.x, feature.height + 0.5);
        featureContext.lineTo(feature.x + feature.width, feature.height + 0.5);
      }

      featureContext.stroke();
    }
  },

  drawLabel: function (feature) {
    if ((feature.start === 1 || feature.end === this.browser.getChromosomeSize(feature.chr)) && feature.labelWidth >= Math.floor(feature.width - 5)) {
      return;
    }

    this.base.apply(this, arguments);
  },

  populateMenu: function (feature) {
    return {
      title    : feature.menuTitle,
      Position : feature.chr + ':' + feature.start + '-' + feature.end
    };
  }
});

Genoverse.Track.dbSNP = Genoverse.Track.extend({
  id               : 'dbSNP',
  name             : 'dbSNP',
  info             : 'All sequence variants from the database of Single Nucleotide Polymorphisms (dbSNP)',
  url              : '//rest.ensembl.org/overlap/region/human/__CHR__:__START__-__END__?feature=variation;content-type=application/json',
  dataRequestLimit : 5000000, // As per e! REST API restrictions
  threshold        : 1e5,
  labels           : false,
  legend           : true,
  autoHeight       : true,
  colorMap         : {
    transcript_ablation                : '#ff0000',
    splice_acceptor_variant            : '#FF581A',
    splice_donor_variant               : '#FF581A',
    stop_gained                        : '#ff0000',
    frameshift_variant                 : '#9400D3',
    stop_lost                          : '#ff0000',
    start_lost                         : '#ffd700',
    transcript_amplification           : '#ff69b4',
    inframe_insertion                  : '#ff69b4',
    inframe_deletion                   : '#ff69b4',
    missense_variant                   : '#ffd700',
    protein_altering_variant           : '#FF0080',
    splice_region_variant              : '#ff7f50',
    incomplete_terminal_codon_variant  : '#ff00ff',
    stop_retained_variant              : '#76ee00',
    synonymous_variant                 : '#76ee00',
    coding_sequence_variant            : '#458b00',
    mature_miRNA_variant               : '#458b00',
    '5_prime_UTR_variant'              : '#7ac5cd',
    '3_prime_UTR_variant'              : '#7ac5cd',
    non_coding_transcript_exon_variant : '#32cd32',
    intron_variant                     : '#02599c',
    NMD_transcript_variant             : '#ff4500',
    non_coding_transcript_variant      : '#32cd32',
    upstream_gene_variant              : '#a2b5cd',
    downstream_gene_variant            : '#a2b5cd',
    TFBS_ablation                      : '#a52a2a',
    TFBS_amplification                 : '#a52a2a',
    TF_binding_site_variant            : '#a52a2a',
    regulatory_region_ablation         : '#a52a2a',
    regulatory_region_amplification    : '#a52a2a',
    feature_elongation                 : '#7f7f7f',
    regulatory_region_variant          : '#a52a2a',
    feature_truncation                 : '#7f7f7f',
    intergenic_variant                 : '#636363'
  },

  insertFeature: function (feature) {
    feature.color  = this.prop('colorMap')[feature.consequence_type];
    feature.legend = feature.consequence_type;

    if (feature.start > feature.end) {
      feature.decorations = true;
    }

    this.base(feature);
  },

  decorateFeature: function (feature, context, scale) {
    context.fillStyle = feature.color;
    context.beginPath();
    context.moveTo(feature.position[scale].X - 3, feature.position[scale].Y + this.featureHeight);
    context.lineTo(feature.position[scale].X,     feature.position[scale].Y + this.featureHeight - 4);
    context.lineTo(feature.position[scale].X + 3, feature.position[scale].Y + this.featureHeight);
    context.fill();

    if (scale > 1) {
      context.fillRect(feature.position[scale].X - 0.5, feature.position[scale].Y, 1.5, feature.position[scale].height);
    }
  },

  populateMenu: function (feature) {
    var deferred = $.Deferred();
    var menu     = [{
      title       : '<a href="http://www.ensembl.org/Homo_sapiens/Variation/Summary?v=' + feature.id + '" target="_blank">' + feature.id + '</a>',
      Location    : feature.chr + ':' + feature.start + '-' + feature.end,
      Consequence : feature.consequence_type,
      Alleles     : feature.alleles.join(', ')
    }];

    $.ajax({
      url      : '//rest.ensembl.org/variation/human/' + feature.id + '?population_genotypes=1;content-type=application/json',
      dataType : 'json',
      success  : function (data) {
        var populationGenotypes = $.grep(data.population_genotypes, function (pop) { return /1000GENOMES.+ALL/.test(pop.population); }); // Only considering 1000 Genomes: ALL population
        var frequencies         = {};
        var pop, i, j;

        if (populationGenotypes.length) {
          for (i = 0; i < populationGenotypes.length; i++) {
            pop           = populationGenotypes[i];
            pop.frequency = parseFloat(pop.frequency, 10);
            pop.count     = parseInt(pop.count, 10);

            frequencies[pop.population] = frequencies[pop.population] || [];
            frequencies[pop.population].push(pop);
          }

          for (i in frequencies) {
            frequencies[i].sort(function (a, b) { return a.count < b.count; });

            pop = {
              title    : i + ' population genotypes',
              Genotype : [ 'Frequency', 'Count' ],
              start    : false,
              end      : false
            };

            for (j in frequencies[i]) {
              pop[frequencies[i][j].genotype] = [ (frequencies[i][j].frequency * 100).toFixed(2) + '%', frequencies[i][j].count ];
            }

            menu.push(pop);
          }

          pop = {
            start : false,
            end   : false
          };

          pop['<a href="http://www.ensembl.org/Homo_sapiens/Variation/Population?v=' + feature.id + '" target="_blank">See all population genotypes</a>'] = '';

          menu.push(pop);
        }

        deferred.resolve(menu);
      }
    });

    return deferred;
  },

  // Different settings for different zoom level
  5000: { // more than 5k
    bump: false
  },
  1: { // > 1 base-pair, but less then 5k
    bump: true
  }

});

Genoverse.Track.File = Genoverse.Track.extend({
  setInterface: function () {
    this.base();

    this._interface.isLocal   = 'model';
    this._interface.dataFile  = 'model';
    this._interface.indexFile = 'model';
    this._interface.largeFile = 'model';
  }
});

Genoverse.Track.File.BAM = Genoverse.Track.File.extend({
  name      : 'BAM',
  indexExt  : '.bai',
  threshold : 100000,
  largeFile : true,
  model     : Genoverse.Track.Model.File.BAM,
  view      : Genoverse.Track.View.Sequence.extend({
    bump       : true,
    autoHeight : true
  }),

  click: function () {
    var menu = this.base.apply(this, arguments);

    if (menu) {
      menu.addClass('gv-wrap-values');
    }

    return menu;
  },

  populateMenu: function (feature) {
    var f = $.extend({ title: feature.readName }, feature);

    delete f.sequence;
    delete f.id;

    return this.base(f);
  }
});

Genoverse.Track.File.BED = Genoverse.Track.File.extend({
  name                : 'BED',
  model               : Genoverse.Track.Model.File.BED,
  bump                : true,
  featureHeight       : 10,
  thickHeight         : 10,
  thinHeight          : 7,
  subFeatureJoinStyle : 'curve',

  populateMenu: function (feature) {
    var fields = [ false, false, false, 'name', 'score', 'strand', 'thickStart', 'thickEnd', 'itemRgb', 'blockCount', 'blockSizes', 'blockStarts' ]; // First three fields are chr, start, end which are covered by Location

    return feature.originalFeature.reduce(function (menu, val, i) {
      if (fields[i]) {
        menu[fields[i]] = val;
      }

      return menu;
    }, {
      title    : '<a target="_blank" href="https://genome.ucsc.edu/FAQ/FAQformat.html#format1">BED feature details</a>',
      Location : feature.chr + ':' + feature.start + '-' + feature.end
    });
  }
});

Genoverse.Track.File.BIGBED = Genoverse.Track.File.BED.extend({
  name  : 'bigbed',
  model : Genoverse.Track.Model.File.BED.extend({
    getData: function (chr, start, end) {
      var model    = this;
      var deferred = $.Deferred();

      if (!this.bigbedFile) {
        this.bigbedFile = this.bigbedFile || (this.url ? new dallianceLib.URLFetchable(this.url) : new dallianceLib.BlobFetchable(this.track.dataFile));
      }

      var d = $.Deferred().done(function () {
        model.bwReader.getValues(chr, start, end, function (features, error) {
          if (!error) {
            features.sort(function (a, b) { return a.start - b.start; });

            if (features.length) {
              model.receiveData(features, chr, features[0].start, features[features.length - 1].end);
            } else {
              model.receiveData(features, chr, start, end);
            }
          }

          deferred.resolveWith(model);
        });
      });

      if (this.bwReader) {
        d.resolve();
      } else {
        new BWReader(this.bigbedFile, function (bwReader) {
          if (bwReader) {
            model.bwReader = bwReader;
            d.resolve();
          } else {
            model.receiveData([], chr, start, end);
            return deferred.resolveWith(model);
          }
        });
      }

      return deferred;
    }
  })
});

Genoverse.Track.File.BB = Genoverse.Track.File.BIGBED;

Genoverse.Track.File.BIGWIG = Genoverse.Track.Graph.Bar.extend({
  name   : 'bigwig',
  height : 100,

  setDefaults: function () {
    this.bwReader = null; // Not part of model since it needs to be shared between bar and line graphs
    this.base.apply(this, arguments);
  },

  getData: function (chr, start, end) {
    var model    = this;
    var deferred = $.Deferred();

    if (!this.bigwigFile) {
      this.bigwigFile = this.bigwigFile || (this.url ? new dallianceLib.URLFetchable(this.url) : new dallianceLib.BlobFetchable(this.track.dataFile));
    }

    var d = $.Deferred().done(function () {
      model.prop('bwReader').getValues(chr, start, end, function (features, error) {
        if (!error) {
          features.sort(function (a, b) { return a.start - b.start; });

          if (features.length) {
            model.receiveData(features, chr, features[0].start, features[features.length - 1].end);
          } else {
            model.receiveData(features, chr, start, end);
          }
        }

        deferred.resolveWith(model);
      });
    });

    if (this.prop('bwReader')) {
      d.resolve();
    } else {
      new BWReader(this.bigwigFile, function (bwReader) {
        if (bwReader) {
          model.prop('bwReader', bwReader);
          d.resolve();
        } else {
          model.receiveData([], chr, start, end);
          return deferred.resolveWith(model);
        }
      });
    }

    return deferred;
  }
});

Genoverse.Track.File.BW = Genoverse.Track.File.BIGWIG;

Genoverse.Track.File.GFF = Genoverse.Track.File.extend({
  name          : 'GFF',
  model         : Genoverse.Track.Model.File.GFF,
  bump          : true,
  height        : 100,
  featureHeight : 5
});

Genoverse.Track.File.GTF = Genoverse.Track.File.GFF;
Genoverse.Track.File.VCF = Genoverse.Track.File.extend({
  name       : 'VCF',
  indexExt   : '.tbi',
  model      : Genoverse.Track.Model.File.VCF,
  autoHeight : false,
  maxQual    : undefined, // Set this to the maximum value of the QUAL field in the file in order to color features by QUAL. Only required for large (tabix indexed) files - small ones can calculate this value automatically

  afterSetMVC: function () {
    if (this.prop('gz')) {
      this.prop('threshold', 1e5);
    }
  },

  populateMenu: function (feature) {
    return {
      title  : '<a target="_blank" href="http://www.1000genomes.org/node/101">VCF feature details</a>',
      CHROM  : feature.originalFeature[0],
      POS    : feature.originalFeature[1],
      ID     : feature.originalFeature[2],
      REF    : feature.originalFeature[3],
      ALT    : feature.originalFeature[4],
      QUAL   : feature.originalFeature[5],
      FILTER : feature.originalFeature[6],
      INFO   : feature.originalFeature[7].split(';').join('<br />')
    };
  },

  1: {
    view: Genoverse.Track.View.Sequence.extend({
      bump          : true,
      labels        : false,
      featureMargin : { top: 0, right: 0, bottom: 0, left: 0 },

      draw: function (features, featureContext, labelContext, scale) {
        this.base.apply(this, arguments);
        this.highlightRef(features, featureContext, scale);
      },

      highlightRef: function (features, context, scale) {
        context.strokeStyle = 'black';

        for (var i = 0; i < features.length; i++) {
          if (features[i].allele === 'REF') {
            context.strokeRect(features[i].position[scale].X, features[i].position[scale].Y, features[i].position[scale].width, features[i].position[scale].height);
          }
        }
      }
    })
  },

  1000: {
    view: Genoverse.Track.View.extend({
      bump   : false,
      labels : false,

      drawFeature: function (feature) {
        var maxQual = this.prop('maxQual');

        if (maxQual && !feature.color) {
          var heat  = Math.min(255, Math.floor(255 * (feature.originalFeature[5] || 0) / maxQual)) - 127;
          var red   = heat > 0 ? 255 : 127 + heat;
          var green = heat < 0 ? 255 : 127 - heat;

          feature.color = 'rgb(' + red + ',' + green + ',0)';
        }

        this.base.apply(this, arguments);
      }
    })
  }
});

Genoverse.Track.File.WIG = Genoverse.Track.Graph.Bar.extend({
  model  : Genoverse.Track.Model.File.WIG,
  name   : 'wig',
  height : 100
});

Genoverse.Track.Gene = Genoverse.Track.extend({
  id     : 'genes',
  name   : 'Genes',
  height : 200,
  legend : true,

  populateMenu: function (feature) {
    var url  = 'http://www.ensembl.org/Homo_sapiens/' + (feature.feature_type === 'transcript' ? 'Transcript' : 'Gene') + '/Summary?' + (feature.feature_type === 'transcript' ? 't' : 'g') + '=' + feature.id;
    var menu = {
      title    : '<a target="_blank" href="' + url + '">' + (feature.external_name ? feature.external_name + ' (' + feature.id + ')' : feature.id) + '</a>',
      Location : feature.chr + ':' + feature.start + '-' + feature.end,
      Source   : feature.source,
      Biotype  : feature.biotype
    };

    if (feature.feature_type === 'transcript') {
      menu.Gene = '<a target="_blank" href="http://www.ensembl.org/Homo_sapiens/Gene/Summary?g=' + feature.Parent + '">' + feature.Parent + '</a>';
    }

    return menu;
  },

  // Different settings for different zoom level
  2000000: { // This one applies when > 2M base-pairs per screen
    labels : false
  },
  100000: { // more than 100K but less then 2M
    labels : true,
    model  : Genoverse.Track.Model.Gene.Ensembl,
    view   : Genoverse.Track.View.Gene.Ensembl
  },
  1: { // > 1 base-pair, but less then 100K
    labels : true,
    model  : Genoverse.Track.Model.Transcript.Ensembl,
    view   : Genoverse.Track.View.Transcript.Ensembl
  }
});

Genoverse.Track.HighlightRegion = Genoverse.Track.extend({
  id               : 'highlights',
  unsortable       : true,
  fixedOrder       : true,
  repeatLabels     : true,
  resizable        : false,
  border           : false,
  alwaysReposition : true,
  height           : 15,
  featureHeight    : 2,
  order            : -1,
  orderReverse     : 9e99,
  controls         : 'off',
  colors           : [ '#777777', '#F08080', '#3CB371', '#6495ED', '#FFA500', '#9370DB' ],
  labels           : 'separate',
  depth            : 1,
  featureMargin    : { top: 13, right: 0, bottom: 0, left: 0 },
  margin           : 0,

  constructor: function () {
    this.colorIndex = 0;
    return this.base.apply(this, arguments);
  },

  addHighlights: function (highlights) {
    for (var i = 0; i < highlights.length; i++) {
      this.model.insertFeature($.extend({ label: (highlights[i].start + '-' + highlights[i].end) }, highlights[i]));
    }

    this.reset();
  },

  removeHighlights: function (highlights) {
    var featuresByChr = this.prop('featuresByChr');
    var featuresById  = this.prop('featuresById');
    var features, bounds, h;

    highlights = highlights || $.map(featuresById, function (f) { return f; });

    for (var i = 0; i < highlights.length; i++) {
      if (highlights[i].removable === false) {
        continue;
      }

      features = featuresByChr[highlights[i].chr];
      bounds   = { x: highlights[i].start, y: 0, w: highlights[i].end - highlights[i].start + 1, h: 1 };

      // RTree.remove only works if the second argument (the object to be removed) === the object found in the tree.
      // Here, while highlight is effectively the same object as the one in the tree, it has been cloned, so the === check fails.
      // To fix this, search for the feature to remove in the location of highlight.
      h = $.grep(features.search(bounds), function (item) { return item.id === highlights[i].id; });

      if (h.length) {
        features.remove(bounds, h[0]);
      }

      delete featuresById[highlights[i].id];
    }

    if (this.prop('strand') === 1) {
      this.prop('reverseTrack').removeHighlights(highlights);
    }

    this.reset();
  },

  controller: Genoverse.Track.Controller.Stranded.extend({
    setDefaults: function () {
      if (this.prop('strand') === -1) {
        this.prop('labels', false);
        this.prop('border', false);
        this.prop('height', 2);
        this.prop('featureMargin').top = 0;
      }

      this.base();
    },

    setName: function (name) {
      if (this.prop('strand') === -1) {
        this.base('');
        this.minLabelHeight = 0;
        this.label.height(0);
      } else {
        this.base(name);
      }
    },

    makeImage: function (params) {
      if (this.prop('strand') === 1) {
        params.background = 'gv-full-height';
      }

      var rtn = this.base(params);
      params.container.addClass(params.background);
      return rtn;
    },

    render: function (features, img) {
      this.base(features, img);
      img.siblings('.gv-labels').css('top', this.prop('featureHeight') - this.prop('featureMargin').top);
    },

    renderBackground: function (f, img) {
      this.base(f, img);
      img.height(this.browser.wrapper.outerHeight(true));
    },

    populateMenu: function (features) {
      var menu = [];
      var location, m;

      if (features.length > 1) {
        menu.push({ title: 'Highlights' });
      }

      for (var i = 0; i < features.length; i++) {
        location = features[i].start + '-' + features[i].end;
        m        = {
          title: features[i].label ? features[i].label[0] : location,
          start: false
        };

        m[m.title === location ? 'title' : 'Location'] = features[i].chr + ':' + location;
        m['<a class="gv-focus-highlight" href="#" data-chr="' + features[i].chr + '" data-start="' + features[i].start + '" data-end="' + features[i].end + '">Focus here</a>'] = '';

        if (features[i].removable !== false) {
          m['<a class="gv-remove-highlight"  href="#" data-id="' + features[i].id + '">Remove this highlight</a>'] = '';
          m['<a class="gv-remove-highlights" href="#">Remove all highlights</a>'] = '';
        }

        menu.push(m);
      }

      return menu;
    },

    click: function () {
      if (this.prop('strand') !== 1) {
        return;
      }

      var menuEl = this.base.apply(this, arguments);

      if (menuEl && !menuEl.data('highlightEvents')) {
        var track = this.track;

        menuEl.find('.gv-remove-highlight').on('click', function () {
          var id = $(this).data('id');
          track.removeHighlights($.grep(menuEl.data('feature'), function (f) { return f.id === id; }));
          return false;
        });

        menuEl.find('.gv-remove-highlights').on('click', function () {
          track.removeHighlights();
          return false;
        });

        menuEl.find('.gv-focus-highlight').on('click', function () {
          var data    = $(this).data();
          var length  = data.end - data.start + 1;
          var context = Math.max(Math.round(length / 4), 25);

          track.browser.moveTo(data.chr, data.start - context, data.end + context, true);

          return false;
        });

        menuEl.data('highlightEvents', true);
      }
    },

    getClickedFeatures: function (x, y, target) {
      var seen     = {};
      var scale    = this.scale;
      var features = $.grep(
        // feature positions
        this.featurePositions.search({ x: x, y: y, w: 1, h: 1 }).concat(
          // plus label positions where the labels are visible
          $.grep(this.labelPositions.search({ x: x, y: y, w: 1, h: 1 }), function (f) {
            return f.position[scale].label.visible !== false;
          })
        ), function (f) {
        // with duplicates removed
        var rtn = !seen[f.id];
        seen[f.id] = true;
        return rtn;
      });

      return features.length ? [ this.model.sortFeatures(features) ] : false;
    }
  }),

  model: Genoverse.Track.Model.Stranded.extend({
    url: false,

    insertFeature: function (feature) {
      feature.id   = feature.chr + ':' + feature.start + '-' + feature.end;
      feature.sort = feature.start;

      if (!feature.color) {
        var colors = this.prop('colors');
        var i      = this.prop('colorIndex');

        feature.color = colors[i++];

        this.prop('colorIndex', colors[i] ? i : 0);
      }

      if (!this.featuresById[feature.id]) {
        this.base(feature);
      }
    },

    findFeatures: function () {
      return Genoverse.Track.Model.prototype.findFeatures.apply(this, arguments);
    }
  }),

  view: Genoverse.Track.View.extend({
    positionFeatures: function (features, params) {
      var rtn = this.base.apply(this, arguments);

      // featureMargin.top gets used to define params.featureHeight, which is used to determine canvas height.
      // Since featureMargin.top = 13 on forward strand, the canvas has a 13px space at the bottom, meaning there is a gap before the background starts.
      // Reducing params.featureHeight here fixes that.
      params.featureHeight = Math.max(params.featureHeight - this.featureMargin.top, 0);

      return rtn;
    },

    draw: function (features, featureContext, labelContext, scale) {
      if (this.prop('strand') === 1) {
        featureContext.fillStyle = '#FFF';
        featureContext.fillRect(0, 0, featureContext.canvas.width, featureContext.canvas.height);
      }

      this.base(features, featureContext, labelContext, scale);
    },

    drawBackground: function (features, context, params) {
      if (this.prop('strand') === -1) {
        return;
      }

      for (var i = 0; i < features.length; i++) {
        context.fillStyle = features[i].color;

        this.drawFeature($.extend(true, {}, features[i], {
          x           : features[i].position[params.scale].X,
          y           : 0,
          width       : features[i].position[params.scale].width,
          height      : context.canvas.height,
          color       : this.shadeColor(context.fillStyle, 0.8),
          border      : features[i].color,
          label       : false,
          decorations : true
        }), context, false, params.scale);
      }
    },

    decorateFeature: function (feature, context, scale) {
      var x1   = feature.x + 0.5;
      var x2   = x1 + feature.width;
      var draw = false;

      context.strokeStyle = feature.border;
      context.lineWidth   = 2;
      context.beginPath();

      if (x1 >= 0 && x1 <= this.width) {
        context.moveTo(x1, feature.y);
        context.lineTo(x1, feature.y + feature.height);
        draw = true;
      }

      if (x2 >= 0 && x2 <= this.width) {
        context.moveTo(x2, feature.y);
        context.lineTo(x2, feature.y + feature.height);
        draw = true;
      }

      if (draw) {
        context.stroke();
      }

      context.lineWidth = 1;
    }
  })
});

Genoverse.Track.Controller.Legend = Genoverse.Track.Controller.Static.extend({
  init: function () {
    this.base();

    this.container.addClass('gv-track-container-legend');

    this.browser.legends[this.track.id] = this.track;

    this.track.setTracks();
  },

  destroy: function () {
    delete this.browser.legends[this.prop('id')];
    this.base();
  }
});

Genoverse.Track.Model.Legend = Genoverse.Track.Model.Static.extend({
  findFeatures: function () {
    var bounds   = { x: this.browser.scaledStart, y: 0, w: this.width };
    var features = {};

    $.each($.map(this.track.tracks, function (track) {
      var featurePositions = track.prop('featurePositions');
      bounds.h = track.prop('height');
      return featurePositions ? featurePositions.search(bounds).concat(track.prop('labelPositions').search(bounds)) : [];
    }), function () {
      if (this.legend) {
        features[this.legend] = this.legendColor || this.color;
      }
    });

    return this.sortFeatures($.map(features, function (color, text) { return [[ text, color ]]; }));
  },

  sortFeatures: function (features) {
    // sort legend alphabetically
    return features.sort(function (a, b) {
      var x = a[0].toLowerCase();
      var y = b[0].toLowerCase();
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }
});

Genoverse.Track.View.Legend = Genoverse.Track.View.Static.extend({
  textColor     : '#000000',
  labels        : 'overlay',
  featureHeight : 12,

  positionFeatures: function (f, params) {
    if (params.positioned) {
      return f;
    }

    var cols     = 2;
    var pad      = 5;
    var w        = 20;
    var x        = 0;
    var y        = 0;
    var xScale   = this.width / cols;
    var yScale   = this.fontHeight + pad;
    var features = [];
    var xOffest  = params.xOffset || 0;
    var xPos, yPos, labelWidth;

    for (var i = 0; i < f.length; i++) {
      xPos       = (x * xScale) + pad;
      yPos       = (y * yScale) + pad;
      labelWidth = this.context.measureText(f[i][0]).width;

      features.push(
        { x: xPos + xOffest,           y: yPos, width: w,              height: this.featureHeight, color: f[i][1] },
        { x: xPos + xOffest + pad + w, y: yPos, width: labelWidth + 1, height: this.featureHeight, color: false, labelColor: this.textColor, labelWidth: labelWidth, label: f[i][0] }
      );

      if (++x === cols) {
        x = 0;
        y++;
      }
    }

    params.height     = this.prop('height', f.length ? ((y + (x ? 1 : 0)) * yScale) + pad : 0);
    params.width      = this.width;
    params.positioned = true;

    return this.base(features, params);
  }
});

Genoverse.Track.Legend = Genoverse.Track.Static.extend({
  unsortable  : true,
  lockToTrack : true, // Always put the legend just below the last track that the legend is for
  removable   : false,

  controller : Genoverse.Track.Controller.Legend,
  model      : Genoverse.Track.Model.Legend,
  view       : Genoverse.Track.View.Legend,

  setDefaults: function () {
    this.order = typeof this.order !== 'undefined' ? this.order : 9e99;
    this.id    = this.id   || 'legend';
    this.type  = this.type || 'legend';
    this.base();
  },

  setEvents: function () {
    this.browser.on({
      'afterAddTracks afterRemoveTracks': function (tracks) {
        for (var i in this.legends) {
          this.legends[i].setTracks();
        }

        this.sortTracks();
      },
      afterRemoveTracks: function (tracks) {
        for (var i in tracks) {
          if (tracks[i].legendTrack && tracks[i].legendTrack.tracks.length === 0) {
            tracks[i].legendTrack.remove();
          }
        }

        for (var i in this.legends) {
          this.legends[i].controller.makeImage({});
        }
      },
      afterUpdateTrackOrder: function (e, ui) {
        var track       = ui.item.data('track');
        var legendTrack = this.legends[track.id] || track.legendTrack;

        // If a legend track, or a track with a sortable legend has been reordered, its lockToTrack status is ignored from now on.
        // This allows a legend to initially be locked to a track, but then to be reordered once the browser has been initialized
        if (legendTrack && legendTrack.lockToTrack && legendTrack.unsortable === false) {
          legendTrack.lockToTrack = false;
        }

        for (var i in this.legends) {
          this.legends[i].updateOrder();
        }

        this.sortTracks();
      }
    });

    this.browser.on({
      afterPositionFeatures: function (features, params) {
        var legend = this.prop('legendTrack');

        if (legend) {
          setTimeout(function () { legend.controller.makeImage(params); }, 1);
        }
      },
      afterResize: function (height, userResize) {
        var legend = this.prop('legendTrack');

        if (legend && userResize === true) {
          legend.controller.makeImage({});
        }
      },
      afterCheckHeight: function () {
        var legend = this.prop('legendTrack');

        if (legend) {
          legend.controller.makeImage({});
        }
      },
      afterSetMVC: function () {
        var legend = this.prop('legendTrack');

        if (legend && legend.tracks.length) {
          legend.disable();

          if (this.legend !== false) {
            legend.enable();
          }
        }
      }
    }, this);
  },

  setTracks: function () {
    var legend = this;
    var type   = this.type;

    this.tracks = $.map(this.browser.tracks.filter(function (t) {
      if (t.legendType === type) {
        t.legendTrack = t.legendTrack || legend;
        return true;
      }
    }), function (track) {
      return [ track ].concat(track.prop('childTracks'), track.prop('parentTrack')).filter(function (t) { return t && t !== legend && !t.prop('disabled'); })
    });

    this.updateOrder();

    if (typeof this.controller === 'object') {
      this[this.tracks.length ? 'enable' : 'disable']();
    } else {
      this.disabled = !this.tracks.length;
    }
  },

  updateOrder: function () {
    if (this.lockToTrack) {
      var tracks = this.tracks.filter(function (t) { return !t.prop('parentTrack'); });

      if (tracks.length) {
        this.order = tracks[tracks.length - 1].order + 0.1;
      }
    }
  },

  enable: function () {
    this.base();
    this.controller.makeImage({});
  },

  disable: function () {
    delete this.controller.stringified;
    this.base();
  }
});

Genoverse.Track.Scaleline = Genoverse.Track.Static.extend({
  strand     : 1,
  color      : '#000000',
  height     : 12,
  labels     : 'overlay',
  unsortable : true,
  fixedOrder : true,

  resize: $.noop,

  makeFirstImage: function () {
    this.prop('scaleline', false);
    this.base.apply(this, arguments);
  },

  render: function (f, img) {
    this.base(f, img);
    this.prop('drawnScale', img.data('scale'));
  },

  positionFeatures: function (features, params) {
    var scaleline = this.prop('scaleline');

    if (params.scale === this.drawnScale) {
      return false;
    } else if (scaleline) {
      return scaleline;
    }

    var strand = this.prop('strand');
    var height = this.prop('height');
    var text   = this.formatLabel(this.browser.length);
    var text2  = strand === 1 ? 'Forward strand' : 'Reverse strand';
    var width1 = this.context.measureText(text).width;
    var width2 = this.context.measureText(text2).width;
    var x1, x2;

    if (strand === 1) {
      x1 = 0;
      x2 = this.width - width2 - 40;
    } else {
      x1 = 25;
      x2 = 30;
    }

    scaleline = [
      { x: x1,                             y: height / 2, width: this.width - 25, height: 1, decorations: true },
      { x: (this.width - width1 - 10) / 2, y: 0,          width: width1 + 10,     height: height, clear: true, color: false, labelColor: this.color, labelWidth: width1, label: text  },
      { x: x2,                             y: 0,          width: width2 + 10,     height: height, clear: true, color: false, labelColor: this.color, labelWidth: width2, label: text2 }
    ];

    return this.base(this.prop('scaleline', scaleline), params);
  },

  decorateFeature: function (feature, context) {
    var strand = this.prop('strand');
    var height = this.prop('height');
    var x      = strand === 1 ? this.width - 25 : 25;

    context.strokeStyle = this.color;

    context.beginPath();
    context.moveTo(x,                 height * 0.25);
    context.lineTo(x + (strand * 20), height * 0.5);
    context.lineTo(x,                 height * 0.75);
    context.closePath();
    context.stroke();
    context.fill();
  }
});
Genoverse.Track.Scalebar = Genoverse.Track.extend({
  unsortable     : true,
  fixedOrder     : true,
  order          : 0,
  orderReverse   : 1e5,
  featureStrand  : 1,
  controls       : 'off',
  height         : 20,
  featureHeight  : 3,
  featureMargin  : { top: 0, right: 0, bottom: 2, left: 0 },
  margin         : 0,
  minPixPerMajor : 100, // Least number of pixels per written number
  color          : '#000000',
  autoHeight     : false,
  labels         : true,
  bump           : false,
  resizable      : false,
  click          : $.noop,
  colors         : {
    majorGuideLine : '#CCCCCC',
    minorGuideLine : '#E5E5E5'
  },

  setEvents: function () {
    var browser = this.browser;

    function resize() {
      $('.gv-bg.gv-full-height', browser.container).height(function () {
        return browser.wrapper.outerHeight(true) - $(this).parents('.gv-track-container').position().top;
      });
    }

    browser.on('afterAddTracks', resize);
    browser.on('afterResize', this, resize);
  },

  setScale: function () {
    var max       = this.prop('width') / this.prop('minPixPerMajor');
    var divisor   = 5;
    var majorUnit = -1;
    var fromDigit = ('' + this.browser.start).split(''); // Split into array of digits
    var toDigit   = ('' + this.browser.end).split('');
    var features  = {};
    var divisions, i;

    for (i = fromDigit.length; i < toDigit.length; i++) {
      fromDigit.unshift('0');
    }

    for (i = toDigit.length; i < fromDigit.length; i++) {
      toDigit.unshift('0');
    }

    // How many divisions would there be if we only kept i digits?
    for (i = 0; i < fromDigit.length; i++) {
      divisions = parseInt(toDigit.slice(0, fromDigit.length - i).join(''), 10) - parseInt(fromDigit.slice(0, fromDigit.length - i).join(''), 10);

      if (divisions && divisions <= max) {
        majorUnit = parseInt('1' + $.map(new Array(i), function () { return '0'; }).join(''), 10);
        break;
      }
    }

    if (majorUnit === -1) {
      majorUnit = this.browser.length === 1 ? 1 : parseInt('1' + $.map(new Array(fromDigit.length), function () { return '0'; }).join(''), 10);
      divisor   = 1;
    } else {
      // Improve things by trying simple multiples of 1<n zeroes>.
      // (eg if 100 will fit will 200, 400, 500).
      if (divisions * 5 <= max) {
        majorUnit /= 5;
        divisor    = 2;
      } else if (divisions * 4 <= max) {
        majorUnit /= 4;
        divisor    = 1;
      } else if (divisions * 2 <= max) {
        majorUnit /= 2;
      }
    }

    majorUnit = Math.max(majorUnit, 1);

    features[this.browser.chr] = new RTree();

    this.prop('minorUnit',     Math.max(majorUnit / divisor, 1));
    this.prop('majorUnit',     majorUnit);
    this.prop('featuresByChr', features);
    this.prop('featuresById',  {});
    this.prop('seen',          {});

    this.base();
  },

  setFeatures: function (chr, start, end) {
    var minorUnit = this.prop('minorUnit');
    var majorUnit = this.prop('majorUnit');
    var seen      = this.prop('seen');

    start = Math.max(start - (start % minorUnit) - majorUnit, 0);

    var flip = (start / minorUnit) % 2 ? 1 : -1;
    var feature, major, label;

    for (var x = start; x < end + minorUnit; x += minorUnit) {
      flip *= -1;

      if (seen[x]) {
        continue;
      }

      seen[x] = 1;

      feature = { id: chr + ':' + x, chr: chr, strand: 1, sort: x };
      major   = x && x % majorUnit === 0;

      if (flip === 1) {
        feature.start = x;
        feature.end   = x + minorUnit - 1;
      }

      if (major) {
        label = this.view.formatLabel(x);

        if (label !== this.lastLabel) {
          feature.label = label;

          if (!feature.end) {
            feature.start = x;
            feature.end   = x - 1;
          }
        }

        this.lastLabel = label;
      }

      if (feature.end) {
        this.model.insertFeature(feature);
      }
    }
  },

  makeFirstImage: function (moveTo) {
    if (this.prop('strand') === -1) {
      moveTo = this.track.forwardTrack.prop('scrollStart');
    }

    return this.base(moveTo);
  },

  makeImage: function (params) {
    params.background    = 'gv-guidelines gv-full-height';
    params.featureHeight = this.prop('height');

    this.track.setFeatures(params.chr, params.start, params.end);

    var rtn = this.base(params);

    params.container.addClass('gv-full-height');

    return rtn;
  },

  makeReverseImage: function (params) {
    this.imgContainers.push(params.container.clone().html(params.container.children('.gv-data').clone(true).css({ opacity: 1, background: this.browser.wrapper.css('backgroundColor') }))[0]);
    this.scrollContainer.append(this.imgContainers);
  },

  renderBackground: function (f, bgImage) {
    this.base(f, bgImage);
    bgImage.height(this.browser.wrapper.outerHeight(true));
  },

  draw: function (features, featureContext, labelContext, scale) {
    var i         = features.length;
    var minorUnit = this.prop('minorUnit');
    var width     = Math.ceil(minorUnit * scale);
    var feature, start, end;

    featureContext.textBaseline = 'top';
    featureContext.fillStyle    = this.color;

    this.guideLines = { major: {} }; // FIXME: pass params to draw, rather than scale. set guideLines on params

    while (i--) {
      feature = features[i];
      start   = Math.round(feature.position[scale].X);
      end     = start + width - 1;

      this.drawFeature($.extend({}, feature, {
        x      : start,
        y      : 0,
        width  : Math.ceil(feature.position[scale].width),
        height : this.featureHeight
      }), featureContext, labelContext, scale);

      if (feature.label) {
        if (start > -1) {
          featureContext.fillRect(start, this.featureHeight, 1, this.featureHeight);
        }

        this.guideLines.major[feature.start] = true;
      }

      // Fiddle the location so that these [additional major] lines overlap with normal lines
      if (feature.end < feature.start) {
        start--;
        end++;
      }

      this.guideLines[feature.start]             = start;
      this.guideLines[feature.start + minorUnit] = end;
    }

    featureContext.fillRect(0, 0, featureContext.canvas.width, 1);
    featureContext.fillRect(0, this.featureHeight, featureContext.canvas.width, 1);
  },

  // Draw guidelines
  drawBackground: function (f, context) {
    for (var i in this.guideLines) {
      if (this.guideLines[i] >= 0 && this.guideLines[i] <= this.width) {
        context.fillStyle = this.track.colors[this.guideLines.major[i] ? 'majorGuideLine' : 'minorGuideLine' ];
        context.fillRect(this.guideLines[i], 0, 1, context.canvas.height);
      }
    }
  },

  formatLabel: function (label) {
    return this.prop('minorUnit') < 1000 ? label.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') : this.base(label);
  }
});

Genoverse.Plugins.controlPanel = function () {
  var genoverse = this;

  this.controls = [
    // Scroll left/right
    {
      name    : 'Scroll left and right by pressing and holding these buttons',
      buttons : [{
        name    : 'Scroll left',
        icon    : '<i class="fa fa-chevron-left"></i>',
        'class' : 'gv-scroll-left'
      }, {
        name    : 'Scroll right',
        icon    : '<i class="fa fa-chevron-right"></i>',
        'class' : 'gv-scroll-right'
      }],
      init: function (browser) {
        var el = $(this);

        el.find('.gv-scroll-left, .gv-scroll-right').on({
          mousedown : function () { browser.startDragScroll(); },
          mouseup   : function () { browser.stopDragScroll();  }
        });

        el.find('.gv-scroll-left').mousehold(50, function () {
          browser.move(browser.scrollDelta);
        });

        el.find('.gv-scroll-right').mousehold(50, function () {
          browser.move(-browser.scrollDelta);
        });
      }
    },

    // Zoom in/out
    {
      name    : 'Zoom-in and zoom-out',
      buttons : [{
        name    : 'Zoom in',
        icon    : '<i class="fa fa-search-plus"></i>',
        'class' : 'gv-zoom-in',
        action  : function (browser) { browser.zoomIn(); }
      }, {
        name    : 'Zoom out',
        icon    : '<i class="fa fa-search-minus"></i>',
        'class' : 'gv-zoom-out',
        action  : function (browser) { browser.zoomOut(); }
      }]
    },

    // Toogle drag action
    {
      name    : 'Toggle your mouse drag action between scroll left/right and select region',
      buttons : [{
        name    : 'Mouse drag action to scroll the browser left or right',
        icon    : '<i class="fa fa-arrows-h"></i>',
        'class' : 'gv-drag-scroll',
        action  : function (browser) {
          browser.setDragAction('scroll');
          $(this).addClass('gv-active').siblings().removeClass('gv-active');
        }
      }, {
        name    : 'Mouse drag action to select a region',
        icon    : '<i></i>',
        'class' : 'gv-drag-select',
        action  : function (browser) {
          browser.setDragAction('select');
          $(this).addClass('gv-active').siblings().removeClass('gv-active');
        }
      }],
      init: function (browser) {
        $(this).find('.gv-drag-' + browser.dragAction).addClass('gv-active').siblings().removeClass('gv-active');
      }
    },

    // Toogle wheel action
    {
      name    : 'Toggle your mouse wheel action between zoom in/out and default page scroll',
      buttons : [{
        name    : 'Mouse wheel action to scroll the page up and down',
        icon    : '<i class="fa fa-arrows-v"></i>',
        'class' : 'gv-wheel-off',
        action  : function (browser) {
          browser.setWheelAction('off');
          $(this).addClass('gv-active').siblings().removeClass('gv-active');
        }
      }, {
        name    : 'Mouse wheel to zoom in and out',
        icon    : '&#177;',
        'class' : 'gv-wheel-zoom',
        action  : function (browser) {
          browser.setWheelAction('zoom');
          $(this).addClass('gv-active').siblings().removeClass('gv-active');
        }
      }],
      init: function (browser) {
        $(this).find('.gv-wheel-' + browser.wheelAction).addClass('gv-active').siblings().removeClass('gv-active');
      }
    }
  ];

  if (this.saveable) {
    this.controls.push({
      icon   : '<i class="fa fa-undo"></i>',
      name   : 'Reset tracks and configuration',
      action : function (browser) { browser.resetConfig(); }
    });
  }

  this.on({
    beforeInit: function () {
      var browser = this;

      if (!this.tracksLibrary) {
        this.tracksLibrary = $.grep(this.tracks, function (track) { return track.prototype.name; });
      }

      var panel = $(
        '<table cellspacing=0 cellpadding=0 class="gv">' +
        '  <tr>' +
        '    <td class="gv-panel gv-panel-left"></td>' +
        '    <td class="gv-canvas-container"></td>' +
        '    <td class="gv-panel gv-panel-right"></td>' +
        '  </tr>' +
        '</table>'
      ).appendTo(this.container).find('.gv-panel-right');

      this.controlPanel   = panel;
      this.superContainer = this.container;
      this.container      = $('.gv-canvas-container', this.container);

      for (var i = 0; i < browser.controls.length; i++) {
        (function (control) {
          var buttonSet = $('<div class="gv-button-set">').attr('title', control.name).appendTo(browser.superContainer.find('.gv-panel-right'));
          var buttons   = control.buttons || [ control ];
          var el;

          $.each(buttons, function (i, button) {
            var el = $('<button>' + button.icon + '</button>').addClass(button['class']).attr('title', button.name).appendTo(buttonSet);

            if (button.action) {
              el.on('click', function () {
                button.action.call(this, browser);
              });
            }

            if (button.init && button !== control) {
              button.init.call(el[0], browser);
            }
          });

          if (control.init) {
            control.init.call(buttonSet, browser);
          }
        })(browser.controls[i]);
      }

      this.superContainer.width(this.width);

      this.width -= panel.width();

      // ESC key to toggle crosshair select to drag mode and close menus
      $(document).on('keydown', function (e) {
        if (e.keyCode === 27) {
          if (panel.find('button.gv-drag-select').hasClass('gv-active')) {
            panel.find('button.gv-drag-scroll').trigger('click');
          }

          $('.gv-menu .gv-close').trigger('click');
        }
      });
    },

    afterInit: function () {
      var browser      = this;
      var tracksButton = $('<button title="Tracks menu"><i class="fa fa-navicon"></i> Tracks</button>').on('click', function () {
        var button = this;

        function getTrackTags(track, tags) {
          if (track.constructor && track.constructor.ancestor && track.constructor.ancestor.prototype) {
            tags = getTrackTags(track.constructor.ancestor.prototype, tags.concat(track.constructor.ancestor.prototype.tags || []));
          }

          return tags;
        }

        if ($(this).hasClass('gv-active')) {
          $('.gv-menu.gv-tracks-menu .gv-close').trigger('click');
          $(this).removeClass('gv-active');
        } else {
          var menu = $(this).data('menu');

          if (menu) {
            menu.show();
          } else {
            menu = browser.makeMenu({
              'Currently enabled tracks:'             : 'Available tracks:',
              '<div class="gv-current-tracks"></div>' : '<input placeholder="Search"><div class="gv-available-tracks"></div>'
            }).addClass('gv-tracks-menu');

            menu.css({ marginLeft: menu.width() / -2 });

            $('input[placeholder=Search]', menu).on('keyup', function () {
              var str = this.value.toLowerCase();

              $('.gv-tracks-library-item', menu).each(function () {
                var track = $(this).data('track');
                var match = false;

                if (track.name && track.name.toLowerCase().indexOf(str) >= 0) {
                  match = true;
                } else {
                  var tags = getTrackTags(track, []).concat(track.tags || []);

                  for (var i = 0; i < tags.length; i++) {
                    if (tags[i].toLowerCase().indexOf(str) >= 0) {
                      match = true;
                      break;
                    }
                  }
                }

                $(this)[match ? 'show' : 'hide']();
              });
            });

            $('.gv-close', menu).on('click', function () {
              $(button).removeClass('gv-active');
            });

            var availableTracks = $('.gv-available-tracks', menu);
            var currentTracks   = $('.gv-current-tracks',   menu).data({
              reload     : function () { $(this).empty().data('listTracks')(); },
              listTracks : function () {
                for (var i = 0; i < browser.tracks.length; i++) {
                  if (browser.tracks[i].name && browser.tracks[i].removable !== false && !browser.tracks[i].parentTrack) {
                    (function (track) {
                      $('<div>')
                        .append($('<i class="gv-remove-track gv-menu-button fa fa-times-circle">').on('click', function () { track.remove(); }))
                        .append('<span>' + track.name + '</span>')
                        .appendTo(currentTracks)
                        .data('track', track)
                        .addClass(track.unsortable ? 'gv-unsortable' : '');
                    })(browser.tracks[i]);
                  }
                }
              }
            }).sortable({
              items  : 'div:not(.gv-unsortable)',
              cursor : 'move',
              axis   : 'y',
              handle : 'span',
              update : $.proxy(browser.updateTrackOrder, browser)
            });

            currentTracks.data('listTracks')();

            if (browser.tracksLibrary && browser.tracksLibrary.length) {
              var tracksLibrary = $.map(browser.tracksLibrary, function (track) {
                return track.prototype.name && track.prototype.removable !== false ? [[ track.prototype.name.toLowerCase(), track ]] : undefined;
              }).sort(function (a, b) { return a[0] > b[0] ? 1 : -1; });

              for (var i = 0; i < tracksLibrary.length; i++) {
                (function (track) {
                  $('<div class="gv-tracks-library-item">').append(
                    $('<i class="gv-add-track gv-menu-button fa fa-plus-circle"> ').on('click', function () {
                      var sortableTracks = browser.tracks.filter(function (t) { return !(t.fixedOrder || t.unsortable); });

                      browser.trackIds = browser.trackIds || {};
                      browser.trackIds[track.prototype.id] = browser.trackIds[track.prototype.id] || 1;

                      browser.addTrack(track.extend({ id: track.prototype.id + (browser.tracksById[track.prototype.id] ? browser.trackIds[track.prototype.id]++ : '') }));
                    })
                  ).append('<span>' + track.prototype.name + '</span>').appendTo(availableTracks).data('track', track.prototype);
                })(tracksLibrary[i][1]);
              }
            }

            $(this).data('menu', menu);
          }

          $(this).addClass('gv-active');
        }
      });

      this.labelContainer.prepend(
        $('<li class="gv-unsortable">').append(
          $('<div class="gv-button-set" title="Tracks menu">').append(tracksButton)
        )
      );
    },

    afterAddDomElements: function () {
      this.wrapper.after('<div class="gv-powered-by">Powered by <a target="_blank" href="http://genoverse.org">Genoverse</a></div>');
      this.superContainer.find('.gv-panel-left').append(this.labelContainer);
    },

    'afterAddTracks afterRemoveTracks': function () {
      var currentTracks = this.superContainer.find('.gv-tracks-menu .gv-current-tracks');

      if (currentTracks.length) {
        currentTracks.data('reload').call(currentTracks);
      }
    }
  });
};

Genoverse.Plugins.controlPanel.requires = 'karyotype';

Genoverse.Plugins.fileDrop = function () {
  this.on('afterInit', function () {
    var browser = this;
    var wrapper = this.wrapper;

    $(window).on('dragenter', function (e) {
      var dataTransfer = e.originalEvent.dataTransfer;

      if (dataTransfer && dataTransfer.types && (dataTransfer.types[0] === 'Files' || dataTransfer.types[1] === 'Files' || dataTransfer.types[2] === 'Files') && !$('.gv-file-drop-total-overlay').length) {
        var fileDropDiv      = $('<div class="gv-file-drop">').appendTo(wrapper);
        var totalDropOverlay = $('<div class="gv-file-drop-total-overlay">').prependTo('body');

        var dragleave = function () {
          fileDropDiv.remove();
          totalDropOverlay.remove();
        };

        totalDropOverlay.on('dragenter', function (e) { e.preventDefault(); e.stopPropagation(); });
        totalDropOverlay.on('dragover',  function (e) { e.preventDefault(); e.stopPropagation(); });
        totalDropOverlay.on('dragleave', dragleave);
        totalDropOverlay.on('drop', function (e) {
          dragleave();
          e.preventDefault();
          e.stopPropagation();

          // Sort in order to ensure that .bam files are before their .bam.bai files
          var files = $.map(e.originalEvent.dataTransfer.files, function (f) { return f; }).sort(function (a, b) { return a.name < b.name ? -1 : 1 });

          for (var i = 0; i < files.length; i++) {
            var file  = files[i];
            var parts = file.name.split('.').reverse();
            var gz    = parts[0] === 'gz';
            var ext   = parts[gz ? 1 : 0];
            var track = Genoverse.Track.File[ext.toUpperCase()];
            var indexFile;

            if (typeof track === 'undefined') {
              return;
            }

            if (track.prototype.indexExt && (files[i + 1] || {}).name === file.name + track.prototype.indexExt) {
              indexFile = files[++i];
            }

            track = track.extend({
              name      : file.name,
              info      : 'Local file `' + file.name + '`, size: ' + file.size + ' bytes',
              isLocal   : true,
              dataFile  : file,
              indexFile : indexFile,
              gz        : gz
            });

            browser.addTrack(track, browser.tracks.length - 1);
          }

          return false;
        });
      }
    });
  });
};

Genoverse.Plugins.focusRegion = function () {
  this.controls.push({
    icon    : '<i class="fa fa-map-marker"></i>',
    'class' : 'gv-button-large',
    name    : 'Reset focus to ' + (this.focusRegion && this.focusRegion.name ? this.focusRegion.name : this.chr + ':' + this.start + '-' + this.end),
    action  : function (browser) { browser.moveTo(browser.focusRegion.chr, browser.focusRegion.start, browser.focusRegion.end, true); },
    init    : function (browser) { browser.focusRegion = browser.focusRegion || { chr: browser.chr, start: browser.start, end: browser.end }; }
  });
};

Genoverse.Plugins.focusRegion.requires = 'controlPanel';
Genoverse.Plugins.focusRegion.noCSS    = true;

Genoverse.Plugins.fullscreen = function () {
  var browser     = this;
  var supported   = true;
  var eventName   = 'fullscreenchange';  // All the browsers have different names
  var elemName    = 'fullscreenElement'; // ... even the capitalisation varies!
  var requestName = 'requestFullscreen';
  var cancelName  = 'exitFullscreen';

  if (document.onmsfullscreenchange || document.onmsfullscreenchange === null) {
    // We need the IE11 version of this to work; IE9-10 have the actions but not the events.
    // The key must be present, i.e. value may be null but it must not return undefined
    eventName   = 'MSFullscreenChange';
    elemName    = 'msFullscreenElement';
    cancelName  = 'msExitFullscreen';
    requestName = 'msRequestFullscreen';
  } else if (document.body.mozRequestFullScreen) {
    eventName   = 'mozfullscreenchange';
    elemName    = 'mozFullScreenElement';
    cancelName  = 'mozCancelFullScreen';
    requestName = 'mozRequestFullScreen';
  } else if (document.body.webkitRequestFullscreen) {
    eventName   = 'webkitfullscreenchange';
    elemName    = 'webkitFullscreenElement';
    cancelName  = 'webkitCancelFullScreen';
    requestName = 'webkitRequestFullscreen';
  } else if (!document.onfullscreenchange) {
    supported = false;
  }

  browser.fullscreenVars = {
    eventName   : eventName,
    elemName    : elemName,
    cancelName  : cancelName,
    requestName : requestName,

    enterEvent: function (browser) {
      browser.preFullscreenWidth = browser.superContainer.width();
      browser.superContainer.addClass('gv-fullscreen');
      browser.setWidth(window.innerWidth);
      browser.controlPanel.find('.gv-fullscreen-button .fa').removeClass('fa-expand').addClass('fa-compress');
    },

    exitEvent: function (browser) {
      if (browser.superContainer.hasClass('gv-fullscreen')) {
        browser.superContainer.removeClass('gv-fullscreen');
        browser.setWidth(browser.preFullscreenWidth);
        browser.controlPanel.find('.gv-fullscreen-button .fa').removeClass('fa-compress').addClass('fa-expand');
      }
    },

    eventListener: function () {
      if (!browser.superContainer.is(document[browser.fullscreenVars.elemName])) {
        browser.fullscreenVars.exitEvent(browser);
        document.removeEventListener(browser.fullscreenVars.eventName, browser.fullscreenVars.eventListener);
      }
    }
  };

  if (supported) {
    browser.controls.push({
      icon    : '<i class="fa fa-expand"></i>',
      'class' : 'gv-fullscreen-button',
      name    : 'Toggle fullscreen view',
      action  : function (browser) {
        if (browser.superContainer.hasClass('gv-fullscreen')) {
          document[browser.fullscreenVars.cancelName]();
        } else {
          document.addEventListener(browser.fullscreenVars.eventName, browser.fullscreenVars.eventListener);
          browser.superContainer[0][browser.fullscreenVars.requestName]();
          browser.fullscreenVars.enterEvent(browser);
        }
      }
    });
  }
};

Genoverse.Plugins.fullscreen.requires = 'controlPanel';

Genoverse.Plugins.karyotype = function () {
  function createKaryotype() {
    var chromosome = $('<div class="gv-chromosome">');
    var container  = $('<div class="gv-karyotype-container">').html(chromosome).insertBefore(this.wrapper);

    this.karyotype = new Genoverse({
      parent    : this,
      container : chromosome,
      width     : chromosome.width(),
      genome    : this.genome,
      chr       : this.chr,
      start     : 1,
      end       : this.chromosomeSize,
      isStatic  : true,
      tracks    : [
        Genoverse.Track.Chromosome.extend({
          name          : 'Chr ' + this.chr,
          height        : 20,
          featureHeight : 20,
          border        : false,
          legend        : false,
          unsortable    : true,

          click: function (e) {
            var offset = this.container.parent().offset().left;
            var x      = e.pageX - offset;
            var f      = this.featurePositions.search({ x: x, y: 1, w: 1, h: 1 })[0];

            if (f) {
              if (e.type === 'mouseup') {
                if (!this.browser.parent.isStatic) {
                  this.browser.parent.moveTo(f.chr, f.start, f.end, true);
                }
              } else if (this.hoverFeature !== f && !this.browser.hideTooltip) {
                this.container.tipsy('hide');

                if (f.label) {
                  var left = offset + f.position[this.scale].start + f.position[this.scale].width / 2;
                  this.container.attr('title', f.label[0]).tipsy({ trigger: 'manual', container: 'body' }).tipsy('show').data('tipsy').$tip.css('left', function () { return left - $(this).width() / 2; });
                }

                this.hoverFeature = f;
              }
            }
          },

          addUserEventHandlers: function () {
            var track = this;

            this.base();

            this.container.on({
              mousemove : function (e) { track.click(e); },
              mouseout  : function (e) {
                if (track.browser.viewPoint.is(e.relatedTarget) || track.browser.viewPoint.find(e.relatedTarget).length) {
                  return true;
                }

                track.container.tipsy('hide');
                track.hoverFeature = false;
              }
            }, '.gv-image-container');

            // Don't allow zooming in and out on the karyotype image
            this.container.on('mousewheel', '.gv-image-container, .gv-selector', function (e) {
              e.stopPropagation();
            });
          },

          afterSetName: function () {
            this.label.css('lineHeight', this.label.height() + 'px');
          }
        })
      ],

      addUserEventHandlers: $.noop,

      afterInit: function () {
        this.updatePosition();
        this.viewPoint.fadeIn();
      },

      afterAddTracks: function () {
        this.track = this.tracks[0];
      },

      afterAddDomElements: function () {
        var karyotype = this;
        var parent    = this.parent;

        function hideTooltip() {
          karyotype.hideTooltip = true;
          karyotype.track.prop('container').tipsy('hide');
        }

        function updateLocation(e, ui) {
          karyotype.hideTooltip = false;

          if (e.type === 'resizestop') {
            var axis = $(this).data('ui-resizable').axis;

            if ((axis === 'e' && parent.end === karyotype.chromosomeSize) || (axis === 'w' && parent.start === 1)) {
              return; // Don't change location if the position didn't change (dragging off the right or left edges)
            }
          }

          var scale = karyotype.chromosomeSize / karyotype.width;
          var start = Math.max(Math.floor(ui.position.left * scale), 1);
          var end   = e.type === 'dragstop' ? start + parent.length - 1 : Math.floor(ui.helper.outerWidth(true) * scale) + start;

          parent.moveTo(karyotype.chr, start, end, true, e.type === 'dragstop');
        }

        if (parent.karyotypeLabel === false) {
          this.labelContainer.remove();
          this.labelContainer = $();
          container.addClass('gv-no-label');
        }

        this.viewPoint = $('<div class="gv-karyotype-viewpoint-wrapper"><div class="gv-karyotype-viewpoint"></div></div>').appendTo(container).children().on({
          mousemove : function (e) { karyotype.track.controller.click(e); },
          mouseout  : function (e) {
            var el = $(e.relatedTarget);

            if (karyotype.viewPoint.is(el) || karyotype.viewPoint.find(el).length || (el.prop('nodeName') === 'IMG' && el.parent().is(karyotype.track.prop('imgContainers')[0]))) {
              return true;
            }

            karyotype.track.prop('container').tipsy('hide');
            karyotype.track.prop('hoverFeature', false);
          }
        });

        if (!parent.isStatic) {
          this.viewPoint.draggable({
            axis        : 'x',
            containment : this.wrapper,
            start       : hideTooltip,
            stop        : updateLocation
          }).resizable({
            handles     : 'e, w',
            containment : 'parent',
            start       : hideTooltip,
            stop        : updateLocation,
            resize      : function (e, ui) {
              ui.element.css('left', Math.max(0, ui.position.left));

              if (ui.position.left > 0) {
                ui.element.width(Math.min(ui.size.width, ui.element.parent().width() - ui.position.left));
              } else {
                ui.element.width(ui.size.width + ui.position.left);
              }
            }
          });
        }
      },

      updatePosition: function () {
        var left  =  this.parent.start * this.scale;
        var width = (this.parent.end   * this.scale) - left;

        this.viewPoint.css({ left: left, width: width });
      }
    });

    if (!this.loadedPlugins.controlPanel) {
      $('<li class="gv-unsortable">').height(function (i, h) {
        return h + container.height();
      }).prependTo(this.labelContainer);
    }
  }

  function recreateKaryotype() {
    var container = this.karyotype.container.parent();

    this.karyotype.destroy();
    container.remove();

    createKaryotype.call(this);
  }

  this.on({
    afterInit: createKaryotype,

    afterSetRange: function () {
      if (this.karyotype) {
        this.karyotype.updatePosition();
      }
    },

    afterSetWidth: recreateKaryotype,

    afterMoveTo: function (chr) {
      if (this.karyotype && this.karyotype.chr !== chr) {
        recreateKaryotype.call(this);
      }
    }
  });
};

Genoverse.Plugins.resizer = function () {
  this.on('afterSetMVC', 'tracks', function () {
    if (this.prop('resizable') !== true) {
      return;
    }

    var track      = this;
    var controller = this.controller;
    var resizer    = this.prop('resizer');
    var height     = this.prop('height');

    if (!resizer) {
      resizer = this.prop('resizer', $('<div class="gv-resizer gv-static"><div class="gv-handle"></div></div>').appendTo(track.prop('container')).draggable({
        axis  : 'y',
        start : function () { $('body').addClass('gv-dragging'); },
        stop  : function (e, ui) {
          $('body').removeClass('gv-dragging');
          controller.resize(track.prop('height') + ui.position.top - ui.originalPosition.top, true);
          $(this).css({ top: 'auto', bottom: 0 }); // returns the resizer to the bottom of the container - needed when the track is resized to 0
        }
      }).on('click', function () {
        var h = track.prop('fullVisibleHeight');

        if (h) {
          controller.resize(h, true);
        }
      }));
    }

    resizer.css({ width: this.width, left: 0 })[this.prop('autoHeight') ? 'hide' : 'show']();

    if (!this.prop('autoHeight') && height - this.prop('margin') === this.prop('featureHeight')) {
      controller.resize(height + resizer.height());
      this.prop('initialHeight', this.prop('height'));
    }
  });

  this.on('afterToggleExpander', 'tracks', function () {
    var resizer = this.prop('resizer');

    if (resizer) {
      resizer[this.expander && this.expander.is(':visible') ? 'addClass' : 'removeClass']('gv-resizer-expander');
    }
  });
};
// tipsy, facebook style tooltips for jquery
// version 1.0.0a
// (c) 2008-2010 jason frame [jason@onehackoranother.com]
// released under the MIT license

Genoverse.Plugins.tooltips = function () {
  var browser = this;

  function toggleTooltips(browser, tooltips, action) {
    var offset = browser.superContainer.offset();

    tooltips = tooltips || browser.superContainer.find('.gv-tooltip');
    action   = action   || $(this).toggleClass('gv-active').hasClass('gv-active') ? 'show' : 'hide';

    tooltips.each(function () {
      $(this).tipsy(action).data('tipsy').$tip.appendTo(browser.superContainer).css({ marginTop: -offset.top, marginLeft: -offset.left });
    });
  }

  function updateTooltips() {
    var tooltips = $();

    $.each([
      [ browser.labelContainer.find('.gv-handle'), { gravity: 'w', fade: true, trigger: 'manual', fallback: 'Reorder tracks by dragging this handle' }],
      [ browser.container.find('.gv-resizer'),     { gravity: 'n', fade: true, trigger: 'manual', fallback: 'Resize track by dragging this handle'   }]
    ], function () {
      var el = this[0].first();

      if (!el.hasClass('gv-tooltip')) {
        this[0].filter('.gv-tooltip').removeClass('gv-tooltip').tipsy('hide').removeData('tipsy');
        el.tipsy(this[1]).addClass('gv-tooltip');
      }

      tooltips = tooltips.add(el);
    });

    if (browser.controlPanel.find('.gv-tooltips').hasClass('gv-active')) {
      toggleTooltips(browser, tooltips, 'show');
    }

    return tooltips;
  }

  this.controls.push({
    icon    : '<i class="fa fa-info-circle"></i>',
    'class' : 'gv-tooltips',
    name    : 'Tooltips',
    action  : toggleTooltips
  });

  this.on('afterInit', function () {
    this.superContainer.find('.gv-panel-left  .gv-button-set[title]').tipsy({ gravity: 'w', fade: true, trigger: 'manual' }).addClass('gv-tooltip');
    this.superContainer.find('.gv-panel-right .gv-button-set[title]').tipsy({ gravity: 'e', fade: true, trigger: 'manual' }).addClass('gv-tooltip');

    // In order to force placement of this tooltip to be inside the superContainer boundaries, and just below the karyotype, create a hidden element, positioned where we want the tooltip to appear
    $('<i class="gv-wrapper-tooltip">').prependTo(this.wrapper).tipsy({
      gravity  : 's',
      fade     : true,
      trigger  : 'manual',
      fallback : 'Scroll left and right by dragging with your mouse, click on any feature in any track for more info'
    }).addClass('gv-tooltip');

    updateTooltips();
  });

  this.on('beforeSetWidth', function () {
    this.controlPanel.find('.gv-tooltips.gv-active').trigger('click');
  });

  this.on('afterSortTracks', function () {
    updateTooltips();
  });

  this.on('afterResize', 'tracks', function () {
    updateTooltips();
  });
};

Genoverse.Plugins.tooltips.requires = 'controlPanel';

Genoverse.Plugins.trackControls = function () {
  var defaultControls = [
    $('<a title="More info" class="fa fa-info-circle">').on('click', function () {
      var track = $(this).data('track');
      var menu  = track.prop('menus').filter('.gv-track-info');

      if (!menu.length) {
        menu = { title : track.name };
        menu[track.prop('info') || ''] = '';

        menu = track.prop('menus', track.prop('menus').add(track.browser.makeMenu(menu).addClass('gv-track-info')));
      }

      menu.show().position({ of: track.prop('container'), at: 'center top', my: 'center top', collision: 'none' });
    }),

    $([
      '<a class="gv-height-toggle">',
        '<i class="fa fa-sort"></i>',
        '<i class="fa fa-sort-desc"></i>',
        '<i class="fa fa-sort-asc"></i>',
      '</a>'
    ].join('')).on({
      click: function () {
        var track = $(this).data('track');
        var height;

        if (track.prop('autoHeight', !track.prop('autoHeight'))) {
          track.prop('heightBeforeToggle', track.prop('height'));
          height = track.prop('fullVisibleHeight');
        } else {
          height = track.prop('heightBeforeToggle') || track.prop('initialHeight');
        }

        $(this).trigger('toggleState');

        track.controller.resize(height, true);
      },
      toggleState: function () { // custom event to set title and change the icon
        var track      = $(this).data('track');
        var autoHeight = track.prop('autoHeight');
        var resizer    = track.prop('resizer');

        this.title = autoHeight ? 'Set track to fixed height' : 'Set track to auto-adjust height';
        $(this)[autoHeight ? 'addClass' : 'removeClass']('gv-auto-height');

        if (resizer) {
          resizer[autoHeight ? 'hide' : 'show']();
        }
      }
    })
  ];

  var remove = $('<a title="Remove track" class="fa fa-trash">').on('click', function () {
    $(this).data('track').remove();
  });

  var toggle = $([
    '<a class="gv-track-controls-toggle">',
      '<span><i class="fa fa-angle-double-left"></i><i class="fa fa-cog"></i></span>',
      '<span><i class="fa fa-angle-double-right"></i></span>',
    '</a>'
  ].join('')).on('click', function () {
    $(this).parent().toggleClass('gv-maximized');
  });

  this.on({
    afterAddDomElements: function () {
      var controls = this.prop('controls');

      if (controls === 'off') {
        return;
      }

      var defaultConfig = this.prop('defaultConfig');
      var savedConfig   = this.browser.savedConfig ? this.browser.savedConfig[this.prop('id')] || {} : {};
      var prop, el, j;

      controls = (controls || []).concat(defaultControls, this.prop('removable') === false ? [] : remove);

      this.trackControls = $('<div class="gv-track-controls">').prependTo(this.container);

      var controlsContainer = $('<div class="gv-track-controls-container">').appendTo(this.trackControls);

      for (var i = 0; i < controls.length; i++) {
        if ($.isPlainObject(controls[i]) && controls[i].type) {
          el = $('<' + controls[i].type + '>').data('control', controls[i].name);

          if (controls[i].options) {
            for (j = 0; j < controls[i].options.length; j++) {
              el.append('<option value="' + controls[i].options[j].value + '">' + controls[i].options[j].text + '</option>');
            }
          }
        } else if (typeof controls[i] === 'string') {
          el = $(controls[i]);
        } else if (typeof controls[i] === 'object' && controls[i].constructor && controls[i] instanceof $) {
          el = controls[i].clone(true);
        }

        el.data('track', this.track).appendTo(controlsContainer);

        // TODO: other control types
        if (el.is('select')) {
          prop = el.data('control');

          el.find('option[value=' + (savedConfig[prop] || defaultConfig[prop] || 'all') + ']').attr('selected', true).end().change(function () {
            $(this).data('track').setConfig($(this).data('control'), this.value);
          });
        }
      }

      this.prop('heightToggler', controlsContainer.children('.gv-height-toggle').trigger('toggleState'));

      var toggler = toggle.clone(true).data('track', this.track).appendTo(this.trackControls);

      toggler.trigger('click');
      this.minLabelHeight = Math.max(this.minLabelHeight, this.trackControls.outerHeight(true) + this.prop('margin'));
      toggler.trigger('click');

    },
    afterResize: function () {
      if (this.trackControls) {
        this.trackControls[this.prop('height') < this.trackControls.outerHeight(true) ? 'hide' : 'show']();
      }
    },
    afterResetHeight: function () {
      var heightToggler = this.prop('heightToggler');

      if (this.prop('resizable') === true && heightToggler) {
        heightToggler[this.prop('autoHeight') ? 'addClass' : 'removeClass']('gv-auto-height');
        heightToggler.trigger('toggleState');
      }
    },
    afterSetMVC: function () {
      var heightToggler = this.prop('heightToggler');

      if (heightToggler) {
        heightToggler.trigger('toggleState')[this.prop('resizable') === true ? 'removeClass' : 'addClass']('gv-hide');
      }
    }
  }, 'tracks');
};