(function() {
  'use strict';

  var tracks = document.querySelectorAll('.marquee-track');

  tracks.forEach(function(track) {
    // Clone all children and append to create seamless loop
    var children = track.innerHTML;
    track.innerHTML = children + children;
  });
})();
