import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import toast from 'react-hot-toast'

export function initPushNotifications() {
  if (!Capacitor.isNativePlatform()) return

  PushNotifications.requestPermissions().then(result => {
    if (result.receive === 'granted') {
      PushNotifications.register()
    } else {
      console.warn('Push notification permission denied')
    }
  })

  PushNotifications.addListener('registration', token => {
    console.log('Push registration success, token: ' + token.value)
  })

  PushNotifications.addListener('registrationError', error => {
    console.error('Error on registration: ' + JSON.stringify(error))
  })

  PushNotifications.addListener('pushNotificationReceived', notification => {
    console.log('Push received: ' + JSON.stringify(notification))
    toast(
      (t) => (
        <div className="flex flex-col">
          <span className="font-bold">{notification.title}</span>
          <span className="text-xs text-gray-500 mt-0.5">{notification.body}</span>
        </div>
      ),
      { duration: 5000, icon: '🔔' }
    )
  })

  PushNotifications.addListener('pushNotificationActionPerformed', action => {
    console.log('Push action performed: ' + JSON.stringify(action))
  })
}
