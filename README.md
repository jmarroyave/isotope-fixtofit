Fix to fit extension for Isotope
========

**Extension for creating fix to fit layouts with Isotope, based on perfect masonry https://github.com/zonear/isotope-perfectmasonry**


## Prerequisites

* jQuery javascript library (http://jquery.com/)
* Isotope jQuery plugin (http://isotope.metafizzy.co/)



## Usage

1. Include fitToFix just after jQuery and Isotope.
```html
<script src="js/jquery.isotope.fixToFit.js"></script>
```

2. Define Isotope's layout mode to fixToFit
```javascript
$('#tiles').isotope({
    layoutMode: "fixToFit",
    fixToFit:{
        columnWidth: 100,
        rowHeight: 100
    }
});
```

3. All set

## Licensing

Use in commercial and personal applications is free.

**Note:** Isotope has it's own licesing. Read more at: http://isotope.metafizzy.co/



## Changelog

+ **v1.0**
  [2013-07-29] - Public release

