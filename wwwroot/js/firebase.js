// Verifica se o navegador suporta Service Worker e registra
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(function(registration) {
            console.log('Service Worker registrado com sucesso:', registration);
        })
        .catch(function(error) {
            console.error('Erro ao registrar o Service Worker:', error);
        });
}

// Configuração do Firebase SDK
const firebaseConfig = {
    apiKey: "AIzaSyCz01zlwSeLQv9xZikTDd0FxMbHkSLNR3Q",
    authDomain: "financialplannerapi.firebaseapp.com",
    databaseURL: "https://financialplannerapi-default-rtdb.firebaseio.com",
    projectId: "financialplannerapi",
    storageBucket: "financialplannerapi.appspot.com",
    messagingSenderId: "216295449023",
    appId: "1:216295449023:web:7ee4c554a9f6e1b08e010a"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

/// Inicializa o Firebase Messaging, database  e Firestore
const database = firebase.database();
const messaging = firebase.messaging();
const firestore = firebase.firestore();

// Solicita permissão para notificações (somente se ainda não tiver sido concedida)
if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log("Permissão para notificações concedida.");
            obterToken();
        } else {
            console.warn("Permissão para notificações negada.");
        }
    });
} else if (Notification.permission === 'granted') {
    obterToken();
}

// Função para obter o token FCM e salvar no Firestore
function obterToken() {
    messaging.getToken({ vapidKey: 'BMtr1VeKl-iQ0ODbeJJhewdxw0d_yaAkXdrPObqEtq9ekOXT_v_kuqBBt_C6iNaX3run_3uE2Ah3OLQf1t-aAXA' })
        .then((currentToken) => {
            if (currentToken) {
                console.log('Token FCM:', currentToken);

                // Salva o token diretamente no Firestore
                firestore.collection("tokens").doc(currentToken).set({
                    token: currentToken,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    console.log("Token enviado para Firestore com sucesso.");
                }).catch((error) => {
                    console.error("Erro ao enviar o token para Firestore:", error);
                });
            } else {
                console.warn('Nenhum token disponível.');
            }
        })
        .catch((err) => {
            console.error('Erro ao buscar token FCM:', err);
        });
}
// Lida com mensagens em primeiro plano quando esta ativa
messaging.onMessage((payload) => {
    console.log('Mensagem recebida em primeiro plano(teste1):', payload);

    // Verifica se o navegador suporta notificações e se a permissão foi concedida
    if (Notification.permission === 'granted') {
        // Cria a notificação com os dados do payload
        const notification = new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: payload.notification.icon,
            data: { url: 'http://localhost:5173/login' } // URL que será aberta ao clicar
        });

        // Evento de clique para abrir a URL em uma nova aba
        notification.onclick = (event) => {
            event.preventDefault(); // Evita o comportamento padrão
            
            // Tenta abrir a nova aba
            const newTab = window.open(notification.data.url, '_blank');
            
            // Verifica se a nova aba foi bloqueada
            if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
                alert('Não foi possível abrir a nova aba. Por favor, verifique as configurações de bloqueio de pop-ups do seu navegador.');
            }
            
            notification.close(); // Fecha a notificação após o clique
        };
    } else {
        console.warn("Permissão para notificações não foi concedida.");
    }
});


// Lida com mensagens em primeiro plano
/* messaging.onMessage((payload) => {
    console.log('Mensagem recebida em primeiro plano:', payload);
}); */

   // Função para verificar se o usuário já está cadastrado
function checkIfUserExists(email) {
    return firebase.database().ref('users').orderByChild('email').equalTo(email).once('value')
        .then(function(snapshot) {
            return snapshot.exists();
        })
        .catch(function(error) {
            console.error("Erro ao verificar usuário: ", error);
            return false;
        });
}

// Função JavaScript para salvar o usuário no Firebase Realtime Database
function saveUserToRealtimeDatabase(name, email) {
    // Converter o email para minúsculo
    email = email.toLowerCase();

    // Verifica se o email já existe
    checkIfUserExists(email).then(function(exists) {
        if (exists) {
            console.log("Usuário com este e-mail já está cadastrado.");
            alert("Este e-mail já está cadastrado. Por favor, use outro e-mail.");
        } else {
            // Se o email não existe, salva o novo usuário
            const database = firebase.database();
            const newUserRef = database.ref('users').push();

            // Obtém a data atual
            const currentDate = new Date().toISOString();

            // Obtém a cidade do usuário usando o ipinfo.io
            fetch('https://ipinfo.io/json?token=2e337157c07dd1')
                .then(response => response.json())
                .then(data => {
                    const cidade = data.city || "Cidade desconhecida"; // Captura a cidade ou define um valor padrão

                    // Salva o usuário no Firebase com as informações de cidade
                    newUserRef.set({
                        name: name,
                        email: email,
                        city: cidade,       // Adiciona a cidade do usuário
                        registeredAt: currentDate // Adiciona a data de registro
                    }).then(() => {
                        console.log("Usuário salvo com sucesso no Realtime Database.");
                    }).catch((error) => {
                        console.error("Erro ao salvar usuário: ", error);
                    });
                })
                .catch((error) => {
                    console.error("Erro ao obter localização do usuário: ", error);
                });
        }
    }).catch(function(error) {
        console.error("Erro ao verificar ou salvar usuário: ", error);
    });
}


