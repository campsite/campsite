function postProductLog({ name, data, session_id, user_id }) {
  return fetch('/v1/product_logs', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Campsite-PWA': true },
    body: JSON.stringify({
      events: [{ name, data, session_id, user_id, log_ts: new Date().getTime() / 1000 }]
    })
  })
}

self.addEventListener('push', function (event) {
  try {
    if (!event.data) return

    const json = event.data.json()
    const { session_id, user_id, ...notificationData } = json
    const { title, app_badge_count, target_url, ...options } = notificationData

    event.waitUntil(
      postProductLog({
        name: 'pwa_push_event_received',
        data: { title, app_badge_count, target_url },
        session_id,
        user_id
      })
    )

    if (app_badge_count != null && 'setAppBadge' in navigator) {
      navigator.setAppBadge(app_badge_count)
    }

    event.waitUntil(
      self.registration
        .showNotification(title, { data: { app_badge_count, target_url }, ...options })
        .then(
          () => postProductLog({ name: 'pwa_show_notification_resolved', session_id, user_id }),
          (val) =>
            postProductLog({ name: 'pwa_show_notification_rejected', data: { value: `${val}` }, session_id, user_id })
        )
        .catch((e) =>
          postProductLog({ name: 'pwa_show_notification_errored', data: { error: `${e}` }, session_id, user_id })
        )
    )
  } catch (e) {
    postProductLog({ name: 'pwa_push_event_listener_errored', data: { error: `${e}` } })
  }
})

self.addEventListener('notificationclick', function (event) {
  try {
    // Android doesn't close the notification when you click on it
    // See: http://crbug.com/463146
    event.notification.close()

    if (!event.notification.data) return

    const { target_url } = event.notification.data

    // See: https://developer.mozilla.org/en-US/docs/Web/API/Clients/openWindow#examples
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientsArr) => {
        // If a Window tab matching the targeted URL already exists, focus that;
        const hadWindowToFocus = clientsArr.some((windowClient) =>
          windowClient.url === target_url ? (windowClient.focus(), true) : false
        )
        // Otherwise, open a new tab to the applicable URL and focus it.
        if (!hadWindowToFocus) {
          const firstUrlClient = clientsArr.find((client) => client.url)

          // attempt to navigate so that history is preserved
          if (firstUrlClient && 'navigate' in firstUrlClient) {
            firstUrlClient.focus()
            firstUrlClient.navigate(target_url)
          } else {
            clients.openWindow(target_url).then((windowClient) => (windowClient ? windowClient.focus() : null))
          }
        }
      })
    )
  } catch (e) {
    postProductLog({ name: 'pwa_notification_click_event_listener_errored', data: { error: `${e}` } })
  }
})

self.addEventListener('pushsubscriptionchange', function (event) {
  try {
    if (!event.newSubscription) return

    const conv = (val) => btoa(String.fromCharCode.apply(null, new Uint8Array(val)))

    event.waitUntil(
      fetch('/v1/push_subscriptions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          old_endpoint: event.oldSubscription ? event.oldSubscription.endpoint : null,
          new_endpoint: event.newSubscription.endpoint,
          p256dh: conv(event.newSubscription.getKey('p256dh')),
          auth: conv(event.newSubscription.getKey('auth'))
        })
      })
    )
  } catch (e) {
    postProductLog({ name: 'pwa_push_subscription_change_event_listener_errored', data: { error: `${e}` } })
  }
})
