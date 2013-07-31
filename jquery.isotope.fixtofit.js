/*!
 * Fix to Fit extension for Isotope
 *
 * Does similar things as the Isotopes "masonry" layoutmode, except that this one will actually go back and plug the holes
 * left by bigger elements, thus making a perfect brick wall. 
 * 
 * Usage:
 * 	$('#grid').isotope({
 * 		layoutMode: 'fixToFit',
 *		fixToFit: {
 *			columnWidth: 200,			// Set/Prefer columns to x wide (default: width of first tile)
 *			rowHeight: 200,				// Set/Prefer rows to y high (default: height of first tile)
 * 		}
 * 	});
 *
 *
 * @author Jose Miguel Arroyave, <cjmarroyave@gmail.com>
 */
;(function($, undefined) {
	var isotope = null;
	var $context = null;
	var $container = null;
	
	$.extend($.Isotope.prototype, {

    // ====================== Fix To Fit ======================

	    _fixToFitReset : function() {
	      // layout-specific props
	      this.fixToFit = this.fixToFit || {};
	      this._getSegments();
	      this.fixToFit.rowHeight = this.options.fixToFit.rowHeight;
	      this.fixToFit.columnWidth = this.options.fixToFit.columnWidth;
	      this.fixToFit.spaces = '';
	      var i = this.fixToFit.cols;
	      this.fixToFit.colYs = [];
	      while (i--) {
	        this.fixToFit.colYs.push( 0 );
	      }
	    },

	    _fixToFitLayout : function( $elems ) {
	      var instance = this,
	      props = instance.fixToFit;
	      $elems.each(function(){
	      var $this  = $(this);
	      //how many columns does this brick span
	      var colSpan = Math.ceil( $this.outerWidth(true) / props.columnWidth);
	      colSpan = Math.min( colSpan, props.cols );

	      if ( colSpan === 1 ) {
	        // if brick spans only one column, just like singleMode
	        instance._fixToFitPlaceBrick( $this, props.colYs );
	      } else {
	        // brick spans more than one column
	        // how many different places could this brick fit horizontally
	        var groupCount = props.cols + 1 - colSpan,
	            groupY = [],
	            groupColY,
	            i;

	        // for each group potential horizontal position
	        for ( i=0; i < groupCount; i++ ) {
	          // make an array of colY values for that one group
	          groupColY = props.colYs.slice( i, i+colSpan );
	          // and get the max value of the array

	          groupY[i] = Math.max.apply( Math, groupColY );
	         }

	        instance._fixToFitPlaceBrick( $this, groupY );
	        }
	      });
	    },

	    // worker method that places brick in the columnSet
	    //   with the the minY
	    _fixToFitPlaceBrick : function( $brick, setY ) {
	      // get the minimum Y value from the columns
	      var minimumY = Math.min.apply( Math, setY ),
	          shortCol = 0,
	          rowSpan = Math.ceil( $brick.outerHeight(true) / this.fixToFit.rowHeight),
	          colSpan = Math.ceil( $brick.outerWidth(true) / this.fixToFit.columnWidth);

	      // Find index of short column, the first from the left
	      for (var i=0, len = setY.length; i < len; i++) {
	        if ( setY[i] === minimumY ) {
	          shortCol = i;
	          break;
	        }
	      }

	      // look if there is an empty space to fit in
	      if(this._fixToFitPlaceInSpace($brick, colSpan, rowSpan)){
	        return;
	      }

	      // position the brick
	      var x = this.fixToFit.columnWidth * shortCol,
	          y = this.fixToFit.rowHeight * minimumY;
	      this._pushPosition( $brick, x, y );

	      // apply setHeight to necessary columns
	      var setHeight = minimumY + rowSpan,
	          setSpan = this.fixToFit.cols + 1 - len;

	      for ( i=0; i < setSpan; i++ ) {
	        if(this.fixToFit.colYs[ shortCol + i ] < minimumY){
	          for(var j = this.fixToFit.colYs[ shortCol + i ]; j < minimumY; j++){
	            this._fixToFitPushSpace(shortCol + i, j);  
	          }
	        }
	        this.fixToFit.colYs[ shortCol + i ] = setHeight;
	      }

	    },

	    _fixToFitGetContainerSize : function() {
	      var containerHeight = Math.max.apply( Math, this.fixToFit.colYs ) * this.fixToFit.rowHeight;
	      return { height: containerHeight };
	    },

	    _fixToFitResizeChanged : function() {
	      return this._checkIfSegmentsChanged();
	    },

	    _fixToFitPlaceInSpace : function($brick, width, height){
	      var str, i, result, pointer, point,
	      	pattern = '';

	      for(i = 0; i < height; i++){
	        pattern += '0{' + width + '}';
	        if(i + 1 < height){
	          pattern += '.{' + (this.fixToFit.cols - width) + '}';
	        }
	      }

	      pattern = new RegExp(pattern);
	      result = pattern.exec(this.fixToFit.spaces);
	      if(result != null) {
	        point = this._fixToFitTo2D(result.index);       
	        this._pushPosition($brick, point.x * this.fixToFit.columnWidth, point.y * this.fixToFit.rowHeight);
	        str = this._fixToFitReplicate('X',width);
	        pointer = result.index;
	        for(i = 0; i < height; i++){
	          pointer += this.fixToFit.cols * i;
	          this.fixToFit.spaces = this.fixToFit.spaces.substr(0, pointer) + str + this.fixToFit.spaces.substr(pointer + str.length);
	          pointer += width * i;
	        }
	        return true;
	      }
	      return false;
	    },

	    // save the new space location
	    _fixToFitPushSpace : function(x, y){
	      var spaceLastPosition = this.fixToFit.spaces.length,
	      	newSpacePosition = (y * this.fixToFit.cols) + x,
	      	i;
	      if(spaceLastPosition < newSpacePosition){
	        for(i = spaceLastPosition; i < newSpacePosition; i++){
	          this.fixToFit.spaces += 'X';  
	        }
	        this.fixToFit.spaces += '0';
	      } 
	      else {
	        this.fixToFit.spaces = this.fixToFit.spaces.substr(0, newSpacePosition) + '0' + this.fixToFit.spaces.substr(newSpacePosition + 1);
	      }
	    },

	    _fixToFitTo2D : function(offset){
	    	var x, y;
	        x = offset % this.fixToFit.cols;
	        y = Math.floor(offset / this.fixToFit.cols);
			return {x:x, y:y};	    	
	    },

	    _fixToFitReplicate : function(character, length){
	    	var str = '', i;
	        for(i = 0; i < length; i++){
	          str += character;
	        }
	        return str;
	    }
	});
	
	
})(jQuery);