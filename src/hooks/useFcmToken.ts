'use client';

import { useEffect, useRef } from 'react';
import { getToken } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase';
import { registerDevice } from '@/api/notification';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const SW_PATH = '/firebase-messaging-sw.js';
const SESSION_KEY = 'fcm_registered';
const DEVICE_ID_KEY = 'fcm_device_id';

function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function useFcmToken(enabled: boolean) {
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[FCM] enabled:', enabled);
    }
    if (!enabled || attemptedRef.current) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    attemptedRef.current = true;

    void (async () => {
      const dev = process.env.NODE_ENV === 'development';
      try {
        const permission = await Notification.requestPermission();
        if (dev) console.log('[FCM] permission:', permission);
        if (permission !== 'granted') return;

        await navigator.serviceWorker.register(SW_PATH);
        const swReg = await navigator.serviceWorker.ready;
        swReg.active?.postMessage({ type: 'FIREBASE_CONFIG', config: firebaseConfig });

        const messaging = getFirebaseMessaging();
        if (!messaging) return;

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });
        if (dev) console.log('[FCM] token:', token ? token.slice(0, 20) + '…' : 'null');

        if (!token) return;

        await registerDevice(token, getOrCreateDeviceId());
        if (dev) console.log('[FCM] device registered ✓');
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch (err) {
        if (dev) console.error('[FCM]', err);
      }
    })();
  }, [enabled]);
}
