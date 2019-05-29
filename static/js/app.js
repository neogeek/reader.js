const htmlElem = document.querySelector('html');
const feedElem = document.querySelector('.feed');
const navElem = document.querySelector('nav ul');

const template = Handlebars.compile(
    document.querySelector('#stories-template').innerHTML
);

document
    .querySelector('a[href="#menu-toggle"]')
    .addEventListener('click', e => {
        event.preventDefault();

        navElem.classList.toggle('visible');
    });

document.querySelector('a[href="#reload"]').addEventListener('click', e => {
    event.preventDefault();

    window.location.reload();
});

const renderError = message => {
    htmlElem.classList.remove('loading');

    feedElem.innerHTML = `<p>${message}</p>`;
};

const renderFeed = stories => {
    htmlElem.classList.remove('loading');

    feedElem.innerHTML = template({
        stories
    });
};

const loadFeed = viewed => {
    htmlElem.classList.add('loading');

    fetch('/feed')
        .then(res => res.json())
        .then(stories => {
            document
                .querySelector('a[href="#markallasread"]')
                .addEventListener('click', e => {
                    event.preventDefault();

                    firebase
                        .database()
                        .ref(`viewed/${firebase.auth().currentUser.uid}`)
                        .set(stories.map(story => story.hash))
                        .then(() => window.location.reload());
                });

            return stories.filter(story => viewed.indexOf(story.hash) === -1);
        })
        .then(renderFeed)
        .catch(() => {
            renderError('Error processing request.');
        });
};

firebase.initializeApp({
    apiKey: 'AIzaSyDHRGCLwdLLoiA_r8svYRIe4xC9rTBNDZs',
    authDomain: 'reader-js.firebaseapp.com',
    databaseURL: 'https://reader-js.firebaseio.com',
    storageBucket: 'reader-js.appspot.com'
});

const provider = new firebase.auth.FacebookAuthProvider();

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
                renderError('Error authenticating.');
            });
    } else {
        firebase
            .auth()
            .signInWithPopup(provider)
            .catch(error => {
                if (error.code === 'auth/popup-blocked') {
                    firebase.auth().signInWithRedirect(provider);
                }

                console.log(error);
            });
    }
});
