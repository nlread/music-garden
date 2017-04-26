# Music Garden
Plant flowers to create a "garden" that produces ambient music. JavaScript/HTML5 web app, built with Paper.js (graphics) and Howler.js (audio). Check out our [demo here ] (https://nlread.github.io/music-garden/)

## How does it work? 
Each flower has a different sound associated with it. Depending on where you place your flower along the y-axis, the pitch will be different. You can resize flowers by clicking and dragging - larger flowers will loop over their sound slower, and smaller ones will loop faster. Have fun creating your own unique mini-garden/musical piece!

## Want to play with code?
Fork us, and feel free to play around with the code. No installations needed - the libraries are all in the repo - though you will need a web server to test your code. We used Brackets, which has a web server built in and a nice live update feature, but feel free to use whatever you're comfortable with. Take a look at the technical notes below for a few important notes about the code.

## Technical Notes
### Changes to Libraries
We've made a few changes to Howler.js and Chardin.js to fit the needs of this project. This means you should NOT use a CDN or your own local copy for these libraries - you'll need to use the versions in this repo. If you want to use a CDN or your own copy, all the changes are marked in comments with [ADDED] at the end. If you search howler.js, chardinjs.js, and chardinjs.css, you'll find the exact lines where code was changed (and what they do). A brief summary is below.

#### howler.js
+ Added sound.\_space to keep track of the size of the loop for a flower's sound. 
+ Added new function called soundLength to put more space in the looping mechanism. It uses sound.\_space to keep track of the current spacing.

#### chardinjs.js
+ Added two elements to the overlay, the center dismiss button and the text that explains what to do on the canvas ("Click in this area to...") because the Chardin positioning for those elements wasn't working right.
+ Disable pointer events during overlay and reenable them after the overlay disappears
+ Trigger a couple of clicks on dismissal of the overlay in order to default-select the first flower and plant mode

#### chardinjs.css
+ Disabled the I-bar cursor when hovering over text
+ Changed font face to match rest of app
+ Styling for the two elements added in chardinjs.js
+ Removed the perpendicular part of the Chardin pointer for aesthetic reasons
