const btn1 = document.getElementById('btn1')
const btn2 = document.getElementById('btn2')

btn1.onclick = () => chrome.runtime.sendMessage({ event: 'start' })
btn2.onclick = () => chrome.runtime.sendMessage({ event: 'end' })
