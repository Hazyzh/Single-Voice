const switchBtn = document.getElementById('switch')
const labelText = document.getElementById('labelText')

switchBtn.onclick = e => {
  if (!this.toggle) {
    this.toggle = true
    labelText.innerText = '/on'
    chrome.runtime.sendMessage({ event: 'start' })
  } else {
    this.toggle = false
    labelText.innerText = '/off'
    chrome.runtime.sendMessage({ event: 'end' })
  }
}

