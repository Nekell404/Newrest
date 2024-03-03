setInterval(function() {
  const activeTimeElement = document.getElementById('active-time');
  const currentActiveTime = parseInt(activeTimeElement.textContent);
  activeTimeElement.textContent = currentActiveTime + 1 + ' seconds';
}, 1000);

function copyTextToClipboard() {
  var textElement = document.querySelector(".apikey");

  var textArea = document.createElement("textarea");

  textArea.value = textElement.innerText;

  document.body.appendChild(textArea);

  textArea.select();

  document.execCommand('copy');

  document.body.removeChild(textArea);

  alert("Teks telah disalin ke clipboard: " + textElement.innerText);
}