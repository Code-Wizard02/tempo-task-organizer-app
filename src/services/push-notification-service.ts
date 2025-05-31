import { supabase } from "@/integrations/supabase/client";
import type { PushSubscriptionData } from "@/types/app-types";

export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "BHmZnvIr0uTSoiMH7pjZ2CPaAx14_X0aaTUVJXM-nTm7Tp3--Oeb1nk2YnmcBXHG3xrsjTi6w23vwhlhmBaNsHA";
// export const VAPID_PUBLIC_KEY = "BHmZnvIr0uTSoiMH7pjZ2CPaAx14_X0aaTUVJXM-nTm7Tp3--Oeb1nk2YnmcBXHG3xrsjTi6w23vwhlhmBaNsHA";


export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  try {
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (e) {
    console.error("Error al convertir la clave VAPID:", e);
    throw new Error("Error al procesar la clave de aplicación");
  }
}

export function isPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  return await Notification.requestPermission();
}

export async function saveSubscription(
  subscriptionData: PushSubscriptionData
): Promise<void> {
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(subscriptionData, { onConflict: "endpoint" });

  if (error) {
    console.error("Error al guardar la suscripción:", error);
    throw new Error("Error al guardar la suscripción");
  }
}

export async function deleteSubscription(endpoint: string): Promise<void> {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);

  if (error) {
    console.error('Error al eliminar la suscripción:', error);
    throw new Error('Error al eliminar la suscripción');
  }
}

// En push-notification-service.ts, añade esta función de diagnóstico
export function testVapidKey(vapidKey: string): boolean {
  try {
    const array = urlBase64ToUint8Array(vapidKey);
    console.log('VAPID Key convertida correctamente:', {
      original: vapidKey,
      longitud: array.length,
      primeros5Bytes: array.slice(0, 5)
    });
    
    // Una clave VAPID válida típicamente tiene 65 bytes
    return array.length === 65;
  } catch (error) {
    console.error('Error al convertir VAPID Key:', error);
    return false;
  }
}
