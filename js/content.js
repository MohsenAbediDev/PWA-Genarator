const themeColor = document.querySelector('meta[name="theme-color"]').content

const siteInfo = {
	name: document.title || 'App Name',
	short_name: (document.title || 'App').substring(0, 12),

	start_url: location.origin,
	display: 'standalone',
	background_color: `'${themeColor}'` || '#ffffff',
	theme_color: `'${themeColor}'` || '#000000',
	icons: [],
}

// Get icons
const linkTags = document.querySelectorAll(
	"link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']"
)
linkTags.forEach((link) => {
	siteInfo.icons.push({
		src: link.href,
		sizes: '192x192',
		type: 'image/png',
	})
})

// 
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'GET_SITE_INFO') {
		sendResponse({ data: siteInfo })
	}
})
