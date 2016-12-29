/* eslint no-console: 0 */
/* eslint no-undef: 0 */
/* eslint no-param-reassign: 0 */
/* eslint no-unused-vars: 0 */

const renderFeedView = viewed => {

    const $html = $('html');
    const $feed = $('.feed');
    const template = Handlebars.compile($('#stories-template').html());

    $html.addClass('loading');

    $.getJSON('/feed').done(stories => {

        $html.removeClass('loading');

        $feed.html(template({
            'stories': stories.filter(story => viewed.indexOf(story.hash) === -1)
        }));

        $(document).on('click', 'a[href="#menu-toggle"]', event => {

            event.preventDefault();

            $('nav ul').toggle();

        })
        .on('click', 'a[href="#reload"]', event => {

            event.preventDefault();

            window.location.reload();

        })
        .on('click', 'a[href="#markallasread"]', event => {

            event.preventDefault();

            firebase.database().ref(`viewed/${firebase.auth().currentUser.uid}`)
                .set(stories.map(story => story.hash))
                .then(() => window.location.reload());

        });

    })
    .fail(() => {

        $html.removeClass('loading');

        $feed.html('<p>Error processing request.</p>');

    });

};

firebase.initializeApp({
    'apiKey': 'AIzaSyDHRGCLwdLLoiA_r8svYRIe4xC9rTBNDZs',
    'authDomain': 'reader-js.firebaseapp.com',
    'databaseURL': 'https://reader-js.firebaseio.com',
    'storageBucket': 'reader-js.appspot.com'
});

const provider = new firebase.auth.FacebookAuthProvider();

firebase.auth().onAuthStateChanged(user => {

    if (user) {

        const database = firebase.database();

        firebase.database().ref(`viewed/${user.uid}`)
            .once('value')
            .then(items => {

                items = items.val();

                return Object.keys(items).map(item => items[item]);

            })
            .then(viewed => {

                renderFeedView(viewed);

            })
            .catch(() => {

                renderFeedView([]);

            });

    } else {

        firebase.auth().signInWithPopup(provider)
            .catch(error => {

                if (error.code === 'auth/popup-blocked') {

                    firebase.auth().signInWithRedirect(provider);

                }

                console.log(error);

            });

    }

});
