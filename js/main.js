/* -*- mode: javascript; js-indent-level: 2 -*- */

// Copyright 2022 Stefan Zager <szager@gmail.com>
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var main = main || {};

/**
 * Scale the content inside #scalable-wrapper so that it fits the browser window
 * while maintaining its aspect ratio.
 */
function scaleToFitWindow() {
  const wrapper = document.getElementById('scalable-wrapper');

  // Temporarily disable transform to measure natural size
  wrapper.style.transform = 'none';

  const contentWidth = wrapper.scrollWidth;
  const contentHeight = wrapper.scrollHeight;

  const scaleX = window.innerWidth / contentWidth;
  const scaleY = window.innerHeight / contentHeight;
  const scale = Math.min(scaleX, scaleY);

  // Center horizontally, top-align vertically
  const translateX = (window.innerWidth / 2) - (contentWidth * scale / 2);
  const translateY = 0;

  wrapper.style.transformOrigin = 'top left';
  wrapper.style.transform =
    `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

/**
 * Reads the resolution of the active camera stream
 * and updates the UI with the resolution info.
 */
function updateCameraResolution(videoElement) {
  const stream = videoElement.srcObject;
  if (!stream) return;

  const track = stream.getVideoTracks()[0];
  if (!track) return;

  const settings = track.getSettings();
  const width = settings.width || videoElement.videoWidth || 1280;
  const height = settings.height || videoElement.videoHeight || 720;

  const resolutionDisplay = document.getElementById('camera-resolution');
  if (resolutionDisplay) {
    resolutionDisplay.textContent = `${width}×${height}`;
  }

  // Re-scale content after resolution update
  requestAnimationFrame(scaleToFitWindow);
}

// Rescale content whenever the window is resized
window.addEventListener('resize', () => {
  requestAnimationFrame(scaleToFitWindow);
});

// Perform initial scaling on load
window.addEventListener('load', scaleToFitWindow);

/**
 * Once DOM is ready, initialize button icons from assets/images.
 */
document.addEventListener('DOMContentLoaded', evt => {
  const buttonIds = [
    'toggleButton',
    'captureButton',
    'undoButton',
    'playButton',
    'clearButton',
    'saveButton',
    'loadButton',
    'flipButton',
    'clockButton',
    'recordAudioButton',
    'clearAudioButton'
  ];

  buttonIds.forEach(id => {
    const button = document.getElementById(id);
    if (!button) {
      console.warn(`Button with ID ${id} not found.`);
      return;
    }

    const img = button.querySelector('img');
    if (!img) {
      console.warn(`No <img> found inside button with ID ${id}`);
      return;
    }

    const key = id.replace('Button', '');
    if (assets.images[key]) {
      img.src = assets.images[key];
    } else {
      console.warn(`No image found in assets for key "${key}"`);
    }
  });
});

/**
 * Once the window is fully loaded, initialize the Animator
 * and wire up UI event handlers.
 */
window.addEventListener('load', evt => {
  // --- Animator setup ---
  let video = document.getElementById('video');
  let snapshotCanvas = document.getElementById('snapshot-canvas');
  let playCanvas = document.getElementById('play-canvas');
  let videoMessage = document.getElementById('video-message');
  let an = new animator.Animator(video, snapshotCanvas, playCanvas, videoMessage);
  main.animator = an;

  // --- Playback speed selector ---
  let playbackSpeedSelector = document.getElementById('playbackSpeed');
  let playbackSpeed = () => Number(playbackSpeedSelector.value);
  let fps = document.getElementById('fps');

  playbackSpeedSelector.addEventListener('input', evt => {
    an.setPlaybackSpeed(playbackSpeed());
    fps.innerText = Math.round(playbackSpeed());
  });
  an.setPlaybackSpeed(playbackSpeed());

  // --- Capture & Undo buttons ---
  let captureButton = document.getElementById('captureButton');
  let undoButton = document.getElementById('undoButton');

  // Onion skin toggle button
  let toggleButton = document.getElementById('toggleButton');
  toggleButton.addEventListener('click', evt => {
    an.toggleOnionSkin();
    toggleButton.firstChild.src = an.onionSkinEnabled
      ? assets.images['on']
      : assets.images['off'];
  });

  if (toggleButton && toggleButton.firstElementChild) {
    toggleButton.firstElementChild.src = an.onionSkinEnabled
      ? assets.images['on']
      : assets.images['off'];
  }

  // Helper for visual feedback (button press effect)
  let pressButton = button => {
    button.classList.add('pressed');
    setTimeout(() => { button.classList.remove('pressed'); }, 250);
  };

  // Thumbnails for captured frames
  let thumbnailContainer = document.getElementById('thumbnail-container');
  let thumbnailWidth = 96;
  let thumbnailHeight = 72;

  captureButton.addEventListener('click', evt => {
    an.capture();

    let thumbnail = document.createElement('canvas');
    thumbnail.width = thumbnailWidth;
    thumbnail.height = thumbnailHeight;
    thumbnail.getContext('2d', { alpha: false }).drawImage(
      an.frames[an.frames.length - 1], 0, 0, thumbnailWidth, thumbnailHeight
    );
    thumbnailContainer.appendChild(thumbnail);

    pressButton(captureButton);
  });

  undoButton.addEventListener('click', evt => {
    an.undoCapture();
    if (thumbnailContainer.lastElementChild) {
      thumbnailContainer.removeChild(thumbnailContainer.lastElementChild);
    }
    pressButton(undoButton);
  });

  // --- Progress marker animation ---
  let progressMarker = document.getElementById('progress-marker');
  progressMarker.addEventListener('animationend', () => {
    progressMarker.classList.toggle('slide-right');
    progressMarker.style.transform = 'translateX(0px)';
    setTimeout(() => { progressMarker.style.transform = ''; }, 1000);
  });

  // --- Flip video orientation ---
  let flipButton = document.getElementById('flipButton');
  flipButton.addEventListener('click', evt => {
    let style = video.attributeStyleMap;
    let transform = style.get('transform');
    if (!transform) {
      transform = new CSSTransformValue([new CSSRotate(CSS.deg(0))]);
    }
    let angle = transform[0].angle.value;
    angle = (angle + 180) % 360;
    transform[0] = new CSSRotate(CSS.deg(angle));
    style.set('transform', transform);

    an.flip();
  });

  // --- Clock animation (for playback timing visualization) ---
  let clockContainer = document.getElementById('clockContainer');
  let clockHand = document.getElementById('clock-hand');
  let clockNumRotations = 1000;
  let clockZeroTime = 0;

  let startClock = (t, skew) => {
    skew = skew ? Number(skew) : 0;
    clockZeroTime = t - skew;
    let angle = 360 * clockNumRotations;
    let duration = clockNumRotations - (skew / 1000);
    clockHand.style.transition = `transform ${String(duration)}s linear`;
    clockHand.style.transform = `rotate(${String(angle)}deg)`;
  };

  let resetClock = () => {
    clockHand.style.transition = '';
    clockHand.style.transform = '';
  };

  clockHand.addEventListener('transitionend', evt => {
    resetClock();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        let t = performance.now();
        let skew = (t - clockZeroTime) % 1000;
        startClock(t, skew);
      });
    });
  });

  let clockButton = document.getElementById('clockButton');
  clockButton.addEventListener('click', evt => {
    clockContainer.style.display =
      clockContainer.style.display == 'none' ? '' : 'none';
  });

  // --- Play button ---
  playButton.addEventListener('click', evt => {
    let p = an.togglePlay();
    if (an.isPlaying) {
      progressMarker.style.animationDuration =
        (an.frames.length / playbackSpeed()) + 's';
      startClock(performance.now(), 0);
      p.then(resetClock);
    } else {
      resetClock();
    }
  });

  // --- Clear animation confirm dialog ---
  let clearConfirmDialog = document.getElementById('clearConfirmDialog');
  let clearButton = document.getElementById('clearButton');
  clearButton.addEventListener('click', evt => {
    if (!an.frames.length) return;
    clearConfirmDialog.showModal();
  });

  let clearConfirmButton = document.getElementById('clearConfirmButton');
  clearConfirmButton.addEventListener('click', evt => {
    an.clear();
    thumbnailContainer.innerHTML = '';
    clearConfirmDialog.close();
  });

  let clearCancelButton = document.getElementById('clearCancelButton');
  clearCancelButton.addEventListener('click', evt => {
    clearConfirmDialog.close();
  });

  // --- Save dialog ---
  let saveDialog = document.getElementById('saveDialog');
  let fileNameInput = saveDialog.querySelector('input');
  let saveButton = document.getElementById('saveButton');
  let saveConfirmButton = document.getElementById('saveConfirmButton');
  let saveCancelButton = document.getElementById('saveCancelButton');

  saveCancelButton.addEventListener('click', () => {
    saveDialog.close();
  });

  saveButton.addEventListener('click', evt => {
    if (!an.frames.length) return;
    if (an.name) fileNameInput.value = an.name;
    saveDialog.showModal();
  });

  const stopPropagationHandler = e => e.stopPropagation();

  saveConfirmButton.addEventListener('click', () => {
    let value = fileNameInput.value;
    if (!value.length) value = 'StopMotion';
    value = value.replace(/\s+/g, '_');
    value = value.replace(/[^\w\-\.]+/g, '');
    if (value.endsWith('.mng')) value = value.substring(0, value.length - 4);
    if (!value.endsWith('.webm')) value += '.webm';

    saveDialog.close();

    let topContainer = document.getElementById('top-container');
    topContainer.style.opacity = 0.5;
    topContainer.addEventListener('click', stopPropagationHandler, true);

    an.save(value).then(() => {
      topContainer.style.opacity = null;
      topContainer.removeEventListener('click', stopPropagationHandler, true);
    }).catch(err => {
      console.log(err);
      topContainer.style.opacity = null;
      topContainer.removeEventListener('click', stopPropagationHandler, true);
    });
  });

  // --- Load dialog ---
  let loadButton = document.getElementById('loadButton');
  loadButton.addEventListener('click', evt => {
    let fileInput = document.createElement('input');
    fileInput.type = 'file';

    fileInput.addEventListener('change', evt => {
      if (evt.target.files[0]) {
        let topContainer = document.getElementById('top-container');
        topContainer.style.opacity = 0.5;
        topContainer.addEventListener('click', stopPropagationHandler, true);

        an.load(evt.target.files[0], () => {
          topContainer.style.opacity = null;
          topContainer.removeEventListener('click', stopPropagationHandler, true);
        }, frameRate => {
          playbackSpeedSelector.value = frameRate;
        });
      }
    }, false);

    fileInput.click();
  });

  // --- Audio recording UI ---
  let audioStream;
  let isRecording = false;
  let recordingIcons = document.querySelectorAll('.recording');
  let notRecordingIcons = document.querySelectorAll('.not-recording');
  let countdown = document.getElementById('countdown');

  let updateRecordingIcons =
    (showNotRecording, showCountdown, showRecording) => {
      recordingIcons.forEach(e => {
        e.style.display = showRecording ? '' : 'none';
      });
      notRecordingIcons.forEach(e => {
        e.style.display = showNotRecording ? '' : 'none';
      });
      countdown.style.display = showCountdown ? '' : 'none';
    };

  updateRecordingIcons(true, false, false);

  countdown.addEventListener('animationstart', evt => {
    evt.currentTarget.firstElementChild.innerHTML = '3';
  });
  countdown.addEventListener('animationiteration', evt => {
    let t = evt.currentTarget.firstElementChild;
    t.innerHTML = (parseInt(t.innerHTML) - 1).toString();
  });
  countdown.addEventListener('animationend', evt => {
    evt.currentTarget.firstElementChild.innerHTML = '';
    if (isRecording) {
      progressMarker.style.animationDuration =
        (an.frames.length / playbackSpeed()) + 's';
      progressMarker.classList.add('slide-right');
      startClock();
      an.recordAudio(audioStream).then(() => {
        isRecording = false;
        updateRecordingIcons(true, false, false);
        audioStream.getAudioTracks()[0].stop();
        audioStream = null;
        resetClock();
      });
      updateRecordingIcons(false, false, true);
    } else {
      updateRecordingIcons(true, false, false);
    }
  });

  let recordAudioButton = document.getElementById('recordAudioButton');
  let clearAudioButton = document.getElementById('clearAudioButton');

  recordAudioButton.addEventListener('click', evt => {
    if (!an.frames.length) return;

    if (isRecording) {
      an.endPlay();
      updateRecordingIcons(true, false, false);
      isRecording = false;
    } else if (self.navigator &&
               navigator.mediaDevices &&
               navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
          audioStream = stream;
          updateRecordingIcons(false, true, false);
        });
      isRecording = true;
    } else {
      isRecording = false;
    }
  });

  clearAudioButton.addEventListener('click', an.clearAudio.bind(an));

  // --- Camera selection and setup ---
  let setUpCameraSelectAndAttach = cameras => {
    if (!cameras || cameras.length < 2) {
      an.attachStream().then(() => {
        updateCameraResolution(document.getElementById('video'));
      });
      return;
    }

    let videoColumnDiv = document.getElementById('video-column');
    let selectDiv = document.createElement('div');
    videoColumnDiv.appendChild(selectDiv);

    let cameraSelect = document.createElement('select');
    cameraSelect.id = 'camera-select';
    selectDiv.appendChild(cameraSelect);

    for (let i = 0; i < cameras.length; i++) {
      let cameraOption = document.createElement('option');
      cameraOption.value = cameras[i].deviceId;
      cameraOption.innerText = 'Camera ' + (i + 1);
      cameraSelect.appendChild(cameraOption);
      if (i === 0) cameraOption.selected = true;
    }

    cameraSelect.onchange = e => {
      an.detachStream();
      an.attachStream(e.target.value).then(() => {
        updateCameraResolution(document.getElementById('video'));
      });
    };

    an.attachStream(cameras[0].deviceId).then(() => {
      updateCameraResolution(document.getElementById('video'));
    });
  };

  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      setUpCameraSelectAndAttach(
        devices.filter(d => d.kind === 'videoinput').map(d => d.deviceId)
      );
    });
  } else {
    setUpCameraSelectAndAttach();
  }
});
