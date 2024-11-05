// Importa o Firebase e o SDK de mensagens
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Configuração do Firebase - igual à que está no seu app principal
firebase.initializeApp({
    apiKey: "AIzaSyCz01zlwSeLQv9xZikTDd0FxMbHkSLNR3Q",
    authDomain: "financialplannerapi.firebaseapp.com",
    databaseURL: "https://financialplannerapi-default-rtdb.firebaseio.com",
    projectId: "financialplannerapi",
    storageBucket: "financialplannerapi.appspot.com",
    messagingSenderId: "216295449023",
    appId: "1:216295449023:web:7ee4c554a9f6e1b08e010a"
});

// Inicializa o Firebase Messaging
const messaging = firebase.messaging();

// Listener para mensagens em segundo plano quando o app está fechado ou em segundo plano
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Mensagem recebida em segundo plano', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'logo_192.png', // Verifique o caminho correto para o ícone
        data: { url: 'http://localhost:5173/login' } // URL para onde direcionar ao clicar
    };

    // Mostra a notificação
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Adiciona o listener para capturar o clique na notificação
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Fecha a notificação

    // Verifica se a URL está definida no `data`
    const url = event.notification.data?.url;

    if (url) {
        // Abre a URL em uma nova aba ou foca em uma aba já aberta com a mesma URL
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
        );
    } else {
        console.log('URL de redirecionamento não definida.');
    }
});
