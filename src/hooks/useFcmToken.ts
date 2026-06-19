'use client';

import { useEffect, useRef } from 'react';
import { getToken } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase';
import { registerDevice } from '@/api/notification';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const SW_PATH = '/firebase-messaging-sw.js';
const SESSION_KEY = 'fcm_registered';

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
    if (!enabled || attemptedRef.current) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    attemptedRef.current = true;

    void (async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const sw = await navigator.serviceWorker.register(SW_PATH);
        sw.active?.postMessage({ type: 'FIREBASE_CONFIG', config: firebaseConfig });

        const messaging = getFirebaseMessaging();
        if (!messaging) return;

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: sw,
        });

        if (!token) return;

        await registerDevice(token);
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // 알림 거부 또는 SW 등록 실패는 무시
      }
    })();
  }, [enabled]);
}
