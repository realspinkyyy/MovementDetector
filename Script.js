const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const alarm = document.getElementById("alarm");
const settingsBtn = document.getElementById("settingsIcon");
const settingsPanel = document.getElementById("settings");
const soundPicker = document.getElementById("soundPicker");

let previousFrame = null;
let motionDetected = false;
let motionTimeout = null;

// Toggle settings panel
settingsBtn.addEventListener("click", () => {
  settingsPanel.style.display = settingsPanel.style.display === "none" ? "block" : "none";
});

// Allow custom alarm sound
soundPicker.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    alarm.src = URL.createObjectURL(file);
  }
});

// Start video stream
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
  video.play();
  detectMotion();
}).catch(console.error);

// Motion detection loop
function detectMotion() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  setInterval(() => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (previousFrame) {
      let diff = 0;
      for (let i = 0; i < currentFrame.data.length; i += 4) {
        const avgCurrent = (currentFrame.data[i] + currentFrame.data[i+1] + currentFrame.data[i+2]) / 3;
        const avgPrev = (previousFrame.data[i] + previousFrame.data[i+1] + previousFrame.data[i+2]) / 3;
        if (Math.abs(avgCurrent - avgPrev) > 25) {
          diff++;
        }
      }

      if (diff > 10000) { // motion threshold
        if (!motionDetected) {
          motionDetected = true;
          alarm.loop = true;
          alarm.play();
        }
        clearTimeout(motionTimeout);
        motionTimeout = setTimeout(() => {
          motionDetected = false;
          setTimeout(() => alarm.pause(), 2000); // Play 2 sec after no motion
        }, 200);
      }
    }

    previousFrame = currentFrame;
  }, 150);
}
