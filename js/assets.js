/* -*- mode: javascript; js-indent-level: 2 -*- */

// Copyright 2022 Stefan Zager <szager@gmail.com>
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/**
 * Global `assets` object.
 * 
 * Holds references to image asset paths used throughout the application.
 * 
 * These are typically icons for UI buttons (capture, play, undo, etc.).
 * Centralizing them here makes it easier to manage file paths and
 * update resources without needing to change them in multiple places.
 */
var assets = {
  images: {
    // Capture a frame (camera shutter icon)
    capture: 'images/capture72.png',

    // Clear all frames / reset animation
    clear: 'images/clear72.png',

    // Load an animation file from disk
    load: 'images/load72.png',

    // Toggle "off" state (e.g., onion skin disabled)
    off: 'images/off72.png',

    // Toggle "on" state (e.g., onion skin enabled)
    on: 'images/on72.png',

    // Play/pause button (shared icon for both states)
    playpause: 'images/playpause72.png',

    // Alias for play icon (same as playpause)
    play: 'images/playpause72.png',

    // Generic toggle button (defaulted to "off" image)
    toggle: 'images/off72.png',

    // Save animation to file
    save: 'images/save72.png',

    // Undo last action (remove last captured frame)
    undo: 'images/undo72.png',

    // Flip camera orientation (rotate capture)
    flip: 'images/flip72.png',

    // Adjust playback speed (clock icon)
    clock: 'images/clock72.png',

    // Start recording audio
    recordAudio: 'images/recordAudio.png',

    // Clear recorded audio
    clearAudio: 'images/clearAudio.png'
  }
};
