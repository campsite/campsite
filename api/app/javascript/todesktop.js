const googleForm = document.querySelector('.js-google-oauth2')

if (googleForm && window.todesktop) {
  const template = document.querySelector('.js-desktop-template')

  if (template) {
    const node = template.content.cloneNode(true)
    const input = node.querySelector('.js-redirect-uri')

    if (input) {
      const url = new URL(googleForm.action)

      url.searchParams.append('redirect_uri', input.value)

      googleForm.addEventListener('submit', (event) => {
        event.preventDefault()

        window.todesktop.contents.openUrlInBrowser(url.toString())
      })
    }
  }
}

const authButton = document.querySelector('.js-auth-desktop-app')

if (authButton) {
  window.location.href = authButton.href
}

const openDesktopSignIn = document.querySelector('.js-desktop-sign-in-with-browser')

if (openDesktopSignIn) {
  const template = document.querySelector('.js-desktop-sign-in-template')

  if (template) {
    const node = template.content.cloneNode(true)
    const anchor = node.querySelector('.js-desktop-session-url')

    if (anchor) {
      openDesktopSignIn.addEventListener('click', (event) => {
        event.preventDefault()

        window.todesktop.contents.openUrlInBrowser(anchor.href)
      })
    }
  }
}
