import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const container = document.getElementById("root");
if (!container) {
  console.log("container:", container);
  throw new Error("Failed to find the root element");
}

createRoot(container).render(<App />);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
    }).catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.getRegistrations().then(function(registrations) {
//     for(let registration of registrations) {
//       registration.unregister();
//       console.log('Service Worker desregistrado');
//     }
//   });
// }