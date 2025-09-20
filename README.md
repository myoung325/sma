This fork started as a project to use genAI to turn the original project into a PWA (Progressive Web App) for app-like, offline use on Chromebooks and other PWA-supporting devices.  Since that original intent, additional features and tweaks were made.

Available at:

https://myoung325.github.io/sma/

Additional changes made on Sept. 13-19, 2025 with lots of genAI (mostly ChatGPT-4.1-mini, some Gemini 2.5 Flash) assistance:

* Shrunk and moved control buttons to above the preview window.
* Added graphics for clock and flip buttons.
* Added support for higher resolution cameras.  The app will select the highest supported resolution from a preset list and display the selected resolution at the top-right.
* Added scaling of the GUI, preview window, and placeholder for frames timeline.
* Specified "0.99999" in "imageCanvas.toBlob(blob => { resolve(blob) }, 'image/webp', 0.99999);" in animator.js for higher frame image quality.
* Changed selectable FPS range from 5fps to 30fps, in single frame increments.
* Made the On/Off button control enabling/disabling onion skinning.
* Added some different button graphics.
* Disabled/hid the clock feature.
* Disabled the red progress line/dot when playing footage.
* Changed audio recording buttons from SVGs to PNGs.
* Made audio recording countdown appear over the video preview.

Currently needing to be fixed:

* The red progress line/dot when playing footage isn't rendering properly.
* The audio recording countdown doesn't appear in the same vertical location and seems to depend on the camera resolution.  That could be further fixed, though it's a very minor issue.

Original README.md

A simple tool for creating stop motion animation sequences using a webcam.

Try it:

https://szager.github.io/stop-motion/

Animation sequences can be saved to a video file in the widely-supported webm format.  Previously-saved videos can be loaded into the app and extended. When complete, an audio track may be recorded (audio support is a bit buggy at the moment, YMMV).

This is free, open-source, non-commercial software (see LICENSE file).  It does not collect any information, and once downloaded, it operates completely offline.

The source code lives here (patches welcome):

https://github.com/szager/stop-motion
