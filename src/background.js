const mutedInfoMap = new Map()

/**
 * Get all tabs id and mute info and saved in mutedInfoMap map.
 * @return {Promise}
 */
const saveInitTabInfo = () => new Promise((r) => {
  chrome.tabs.query({}, infoArray => {
    infoArray.forEach(item => {
      const muted = item.mutedInfo.muted
      mutedInfoMap.set(item.id, muted)
      r(true)
    })
  })
})

/**
 * Get current all tabs ids.
 * @return {Promise}
 */
const getCurrentTabsIds = () => new Promise((r) => {
  chrome.tabs.query({}, infoArray => r(infoArray.map(item => item.id)))
})

/**
 * To muted all tabs in all windows.
 * Trigger saveInitTabInfo function and get all tabs id from mutedInfoMap.
 * @return {Promise}
 */
const mutedAllTabs = () => new Promise(async r => {
  const allTabIds = await getCurrentTabsIds()
  await Promise.all(
    allTabIds.map(id => 
      new Promise(resolve => {
        chrome.tabs.update(id, { muted: true }, tab => resolve(tab))
      })
    )
  )
  r(true)
})

/**
 * To unmuted the selected tab of the current window.
 * @return {Promise}
 */
const unMutedCurrentTab = () => new Promise(async r => {
  chrome.windows.getCurrent(windowInfo => {
    chrome.tabs.query({
      windowId: windowInfo.id,
      active: true
    }, tabInfo => {
      console.log(tabInfo)
      const id = tabInfo[0] && tabInfo[0].id
      const params = [{ muted: false }, info => r(info)]
      if (id) params.unshift(id)
      chrome.tabs.update(...params)
    }) 
  })
})

/**
 * handler for tab on active event.
 * @param {Object} param 
 */
const listener = async ({tabId}) => {
  await mutedAllTabs()
  const info = await new Promise(r => {
    chrome.tabs.update(tabId, { muted: false }, tab => r(tab))
  })
}

/**
 * Regain initialization audio settings by the info saved in mutedInfoMap map.
 * @return {Promise}
 */
const regainInitializationAudioSettings = () => new Promise(async r => {
  const allTabIds = await getCurrentTabsIds()
  await Promise.all(
    allTabIds.map(id => 
      new Promise(resolve => {
        chrome.tabs.update(id, { muted: !!mutedInfoMap.get(id) }, tab => resolve(tab))
      })
    )
  )
  mutedInfoMap.clear()
  r(true)
}) 

/**
 * Initialize event handler
 */
const initHandler = async () => {
  chrome.runtime.onMessage.addListener( async ({event}, ...rest) => {
    console.info(event, rest)

    switch (event) {
      case 'start':
        await saveInitTabInfo()
        await mutedAllTabs()
        chrome.tabs.update({ muted: false })
        await unMutedCurrentTab()
        chrome.tabs.onActivated.addListener(listener)
        return
      case 'end' :
        await regainInitializationAudioSettings();
        chrome.tabs.onActivated.removeListener(listener)
        return
      default :
        return
    }
  })
}


chrome.runtime.onInstalled.addListener(
  async function() {
    initHandler();
  }
)



