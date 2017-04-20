# Music Garden
Plant flowers to create a "garden" that produces ambient music. JavaScript/HTML5 web app, built with Paper.js (graphics) and Howler.js (audio)

## How does it work? 


## Want to play with code?
Fork us, and feel free to play around with the code. No installations needed - the libraries are all in the repo - though you will need a web server to test your code. We used Brackets, which has a web server built in and a nice live update feature, but feel free to use whatever you're comfortable with.

## Technical Notes
### Changes to Libraries
We've made a few changes to Howler.js and Chardin.js to fit the needs of this project. This means you should NOT use a CDN or your own local copy for these libraries - you'll need to use the versions in this repo. If you want to use a CDN or your own copy, this is where the changes are in our code:

#### howler.js
Line 689 a variable called sound._space that is initiated at 0 in order to keep track of the size of the loop we are using for a flower's sound. 

Lines 788-801 a new function called soundLength that can be used by a Howler object in order to put more space in the looping mechanism. It uses sound._space to keep track of the current spacing in the loop.

#### chardinjs.js
Lines 99-101 disable mouse events on the buttons and menu while the overlay is displayed

Lines 117-124 reenable click/hover events and make sure the default buttons are selected after you dismiss the overlay. 
