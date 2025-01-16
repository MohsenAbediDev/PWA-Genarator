// Select the PWA generator button
const pwaGenerator = document.querySelector('#pwa-generator')

// Add click event listener to the button
pwaGenerator.addEventListener('click', handleGeneratePWA)

// Main function to handle the button click
function handleGeneratePWA() {
	getActiveTab((tab) => {
		if (!tab) {
			console.error('No active tab found.')
			return
		}

		sendMessageToContentScript(
			tab.id,
			{ type: 'GET_SITE_INFO' },
			(response) => {
				if (response?.data) {
					displaySiteInfo(response.data)
				} else {
					console.error('Failed to receive site info.')
				}
			}
		)
	})
}

// Function to get the active tab in the current window
function getActiveTab(callback) {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		callback(tabs[0])
	})
}

// Function to send a message to the content script in the active tab
function sendMessageToContentScript(tabId, message, callback) {
	chrome.tabs.sendMessage(tabId, message, (response) => {
		callback(response)
	})
}

// Function to display site information in the <pre> element
function displaySiteInfo(siteInfo) {
	const pre = document.querySelector('.pre')
	pre.textContent = JSON.stringify(siteInfo, null, 2)
	console.log('Received site info:', siteInfo)
}
