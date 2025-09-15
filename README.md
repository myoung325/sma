This fork is solely to add PWA (Progressive Web App) functionality for app-like, offline use on Chromebooks and other PWA-supporting devices.

Available at:

https://myoung325.github.io/sma/

Additional changes made on Sept. 13-15, 2025 with lots of genAI assistance:

* Moved control buttons to above the preview window.
* Added graphics for clock and flip buttons.
* Added support for higher resolution cameras.  The app will select the highest supported resolution and display the selected resolution.
* Added scaling of the GUI and preview window and placeholder for frames timeline.
* Specifying "0.99999" in "imageCanvas.toBlob(blob => { resolve(blob) }, 'image/webp', 0.99999);" in animator.js for higher frame image quality.
* Changed selectable FPS range from 5fps to 30fps in single frame increments.

Currently needing to be fixed:

* The red progress line/dot when playing footage isn't rendering properly.

Original README.md

A simple tool for creating stop motion animation sequences using a webcam.

Try it:

https://szager.github.io/stop-motion/

Animation sequences can be saved to a video file in the widely-supported webm format.  Previously-saved videos can be loaded into the app and extended. When complete, an audio track may be recorded (audio support is a bit buggy at the moment, YMMV).

This is free, open-source, non-commercial software (see LICENSE file).  It does not collect any information, and once downloaded, it operates completely offline.

The source code lives here (patches welcome):

https://github.com/szager/stop-motion
