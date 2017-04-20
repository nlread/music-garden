# Music Garden
Plant flowers to create a "garden" that produces ambient music. JavaScript/HTML5 web app, built with Paper.js (graphics) and Howler.js (audio)

## How does it work? 


## Want to play with code?
Fork us, and feel free to play around with the code. No installations needed - the libraries are all in the repo - though you will need a web server to test your code. We used Brackets, which has a web server built in and a nice live update feature, but feel free to use whatever you're comfortable with.

## Changes to howler.js
In line 689 we added a variable called sound._space that is initiated at 0 in order to keep track of the size of the loop we are using for a flower's sound. In line 788 we added a new function called soundLength that can be used by a Howler object in order to put more space in the looping mechanism. It uses sound._space to keep track of the current spacing in the loop.
