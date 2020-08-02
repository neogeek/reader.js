firebase.initializeApp({
    apiKey: 'AIzaSyDHRGCLwdLLoiA_r8svYRIe4xC9rTBNDZs',
    authDomain: 'reader-js.firebaseapp.com',
    databaseURL: 'https://reader-js.firebaseio.com',
    storageBucket: 'reader-js.appspot.com'
});

const provider = new firebase.auth.GoogleAuthProvider();

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        firebase
            .database()
            .ref(`viewed/${user.uid}`)
            .once('value')
            .then(items => {
                items = items.val();

                return Object.keys(items).map(item => items[item]);
            })
            .then(viewed => {
                loadFeed(viewed);
            })
            .catch(() => {
                loadFeed([]);
            });
    } else {
        firebase
            .auth()
            .signInWithPopup(provider)
            .catch(error => {
                if (error.code === 'auth/popup-blocked') {
                    firebase.auth().signInWithRedirect(provider);
                }
            });
    }
});
