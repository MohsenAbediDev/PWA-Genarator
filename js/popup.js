// Select the PWA generator button
const pwaGeneratorButton = document.querySelector('#pwa-generator')

// Attach click event listener to the button
pwaGeneratorButton.addEventListener('click', () => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (!tabs || tabs.length === 0 || !tabs[0].id) {
			console.error('No active tab found.')
			return
		}

		const tabId = tabs[0].id

		// Script to inject into the active tab
		const injectManifestScript = () => {
			const themeColorMeta = document.querySelector('meta[name="theme-color"]')
			const themeColor = themeColorMeta?.content || '#000000'

			const manifest = {
				name: document.title || 'App Name',
				short_name: (document.title || 'App').substring(0, 12),
				start_url: location.origin,
				display: 'standalone',
				background_color: themeColor,
				theme_color: themeColor,
				icons: [],
			}

			// Gather icons from link tags
			document
				.querySelectorAll(
					"link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']"
				)
				.forEach((link) => {
					manifest.icons.push({
						src: link.href,
						sizes: link.sizes[0],
						type: link.type || 'image/png',
					})
				})

			// Create Blob and URL for the manifest
			const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
				type: 'application/json',
			})
			const manifestURL = URL.createObjectURL(manifestBlob)

			// Remove existing manifest links
			document
				.querySelectorAll('link[rel="manifest"]')
				.forEach((link) => link.remove())

			// Add new manifest link
			const manifestLink = document.createElement('link')
			manifestLink.rel = 'manifest'
			manifestLink.href = manifestURL
			document.head.appendChild(manifestLink)

			console.log('Manifest added to the page.')

			// Handle Install Prompt
			let deferredPrompt
			window.addEventListener('beforeinstallprompt', (event) => {
				event.preventDefault()
				deferredPrompt = event

				// Show the install prompt after manifest is added
				const installButton = document.createElement('button')
				installButton.textContent = 'Install PWA'
				installButton.style.position = 'fixed'
				installButton.style.bottom = '20px'
				installButton.style.right = '20px'
				installButton.style.zIndex = 1000
				installButton.style.padding = '10px 20px'
				installButton.style.background = themeColor
				installButton.style.color = '#fff'
				installButton.style.border = 'none'
				installButton.style.borderRadius = '5px'
				document.body.appendChild(installButton)

				installButton.addEventListener('click', () => {
					if (deferredPrompt) {
						deferredPrompt.prompt()
						deferredPrompt.userChoice.then((choiceResult) => {
							if (choiceResult.outcome === 'accepted') {
								console.log('User accepted the install prompt.')
							} else {
								console.log('User dismissed the install prompt.')
							}
							deferredPrompt = null
							installButton.remove()
						})
					}
				})
			})
		}

		// Inject script into the active tab
		chrome.scripting.executeScript(
			{
				target: { tabId },
				func: injectManifestScript,
			},
			() => {
				if (chrome.runtime.lastError) {
					console.error('Script injection failed:', chrome.runtime.lastError)
				} else {
					console.log('Manifest script injected and executed.')
				}
			}
		)
	})
})
