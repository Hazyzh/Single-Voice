const switchBtn = document.getElementById('switch')
const labelText = document.getElementById('labelText')

switchBtn.onclick = e => {
  const checked = e.target.checked
  if (checked) {
    labelText.innerText = '/on'
    chrome.runtime.sendMessage({ event: 'start' })
  } else {
    labelText.innerText = '/off'
    chrome.runtime.sendMessage({ event: 'end' })
  }
  chrome.storage.sync.set({voiceToggle: checked}, function() {
    console.log('@:Current setting is ' + checked)
  })
}
chrome.storage.sync.get('voiceToggle', function(data) {
  if (data.voiceToggle) {
    switchBtn.checked = data.voiceToggle
  }
});

