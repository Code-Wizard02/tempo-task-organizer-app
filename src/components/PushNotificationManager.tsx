import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  VAPID_PUBLIC_KEY,
  urlBase64ToUint8Array,
  isPushSupported,
  saveSubscription,
  deleteSubscription,
  testVapidKey
} from '../services/push-notification-service';
import type { PushSubscriptionData } from '@/types/app-types';

export function PushNotificationManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Comprobar el estado de suscripción cuando se carga el componente
  useEffect(() => {
    if (!user || !isPushSupported()) {
      setSubscriptionLoading(false);
      return;
    }

    navigator.serviceWorker.ready.then(registration => {
      registration.pushManager.getSubscription().then(subscription => {
        setIsSubscribed(!!subscription);
        setSubscriptionLoading(false);
      });
    });
  }, [user]);

  const handleSubscribe = async () => {
    const browser = navigator.userAgent;
    console.log('Navegador utilizado:', browser);

    // Firefox tiene requisitos especiales para push
    if (browser.includes('Firefox')) {
      console.log('Firefox detectado - verificando características especiales');
    }

    // Chrome en Android puede requerir permisos adicionales
    if (browser.includes('Chrome') && browser.includes('Android')) {
      console.log('Chrome en Android detectado - puede requerir permisos adicionales');
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para activar notificaciones.",
        variant: "destructive"
      });
      return;
    }

    if (!isPushSupported()) {
      toast({
        title: "Error",
        description: "Tu navegador no soporta notificaciones push.",
        variant: "destructive"
      });
      return;
    }
    const isVapidKeyValid = testVapidKey(VAPID_PUBLIC_KEY);
    console.log('¿La clave VAPID es válida?', isVapidKeyValid);

    if (!isVapidKeyValid) {
      toast({
        title: "Error de configuración",
        description: "La clave de aplicación no es válida",
        variant: "destructive"
      });
      return;
    }
    try {
      // Solicitar permiso de notificaciones
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        toast({
          title: "Permiso denegado",
          description: "Se requiere permiso para enviar notificaciones.",
          variant: "destructive"
        });
        console.warn('Permiso de notificaciones denegado');
        return;
      }

      const swRegistration = await navigator.serviceWorker.ready;
      console.log('Service Worker registrado:', swRegistration);
      //HASTA AQUI SI FUNCIONA EL SERVICE WORKER

      // Obtener el serviceWorker y comprobar si hay una suscripción existente
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      console.log('Registro del Service Worker:', registration);
      console.log('Suscripción existente:', existingSubscription);

      if (existingSubscription) {
        toast({
          title: "Ya suscrito",
          description: "Ya estás recibiendo notificaciones."
        });
        console.log('Ya existe una suscripción:', existingSubscription);
        setIsSubscribed(true);
        return;
      }

      console.log('VAPID Public Key:', VAPID_PUBLIC_KEY);
      const keyArray = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      console.log('Clave VAPID convertida a Uint8Array:', keyArray);

      // Crear una nueva suscripción
      try {
        console.log('Intentando crear suscripción...');
        console.log('Parámetros de suscripción:', {
          userVisibleOnly: true,
          applicationServerKey: keyArray.length + ' bytes'
        });

        let newSubscription;
        try {
          // Primero intenta sin applicationServerKey (algunos navegadores lo prefieren así)
          try {
            newSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
            });
            console.log('✅ Suscripción creada sin clave VAPID');
          } catch (e) {
            // Si falla, intenta con la clave VAPID
            console.log('Intentando con clave VAPID explícita...');
            newSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: keyArray
            });
            console.log('✅ Suscripción creada con clave VAPID');
          }
        } catch (subscribeError: any) {
          console.error('❌ Error específico en pushManager.subscribe:', subscribeError);
          console.error('Nombre del error:', subscribeError.name);
          console.error('Mensaje del error:', subscribeError.message);
          console.error('Stack trace:', subscribeError.stack);

          // Verificar el estado del service worker
          console.log('Estado del Service Worker:', registration.active ? 'Activo' : 'No activo');

          throw subscribeError; // Re-lanzar para que el catch exterior lo maneje
        }

        console.log('Detalles de la suscripción:');
        console.log('Endpoint:', newSubscription.endpoint);

        // Preparar los datos para guardar en Supabase
        const subscriptionJSON = newSubscription.toJSON();
        console.log('- Keys disponibles:', subscriptionJSON.keys ? 'Si' : 'No');

        const subscriptionData: PushSubscriptionData = {
          user_id: user.id,
          endpoint: newSubscription.endpoint,
          keys: subscriptionJSON.keys as any,
          subscription: subscriptionJSON
        };

        // Guardar la suscripción en la base de datos
        await saveSubscription(subscriptionData);

        setIsSubscribed(true);
        toast({
          title: "Notificaciones activadas",
          description: "Recibirás avisos sobre tus tareas pendientes."
        });

      } catch (error) {
        console.error('Error al suscribirse a notificaciones push:', error);
        toast({
          title: "Error",
          description: "No se pudo activar las notificaciones.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error general en el proceso de suscripción:', error);
      toast({
        title: "Error",
        description: "No se pudo activar las notificaciones.",
        variant: "destructive"
      });
    }
  };



  const handleUnsubscribe = async () => {
    if (!user) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Cancelar la suscripción en el navegador
        await subscription.unsubscribe();

        // Eliminar la suscripción de la base de datos
        await deleteSubscription(subscription.endpoint);

        setIsSubscribed(false);
        toast({
          title: "Notificaciones desactivadas",
          description: "Ya no recibirás avisos de tareas."
        });
      }
    } catch (error) {
      console.error('Error al cancelar la suscripción:', error);
      toast({
        title: "Error",
        description: "No se pudo desactivar las notificaciones.",
        variant: "destructive"
      });
    }
  };

  // Si el navegador no soporta notificaciones push
  if (!isPushSupported()) {
    return (
      <p className="text-sm text-muted-foreground">
        Tu navegador no soporta notificaciones push.
      </p>
    );
  }

  // Mientras se comprueba el estado de la suscripción
  if (subscriptionLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Comprobando estado de notificaciones...
      </p>
    );
  }

  return (
    <div style={{ width: "100%", overflow: "hidden", boxSizing: "border-box" }}>
      {isSubscribed ? (
      <Button
        variant="outline"
        onClick={handleUnsubscribe}
        style={{ width: "100%", maxWidth: "100%" }}
      >
        Desactivar notificaciones
      </Button>
      ) : (
      <Button
        onClick={handleSubscribe}
        style={{ width: "100%", maxWidth: "100%" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
          style={{ marginRight: 8 }}
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Activar notificaciones
      </Button>
      )}
    </div>
  );
}
