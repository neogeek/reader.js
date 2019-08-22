const htmlElem = document.querySelector('html');
const feedElem = document.querySelector('.feed');
const navElem = document.querySelector('nav ul');

const renderStory = ({hash, origin, link, title, site}) =>
    `<li class="story" data-hash="${hash}" data-origin="${origin}">
  <span class="icon"></span>
  <a href="${link}" target="_blank">${title}</a>
  <i class="site"><a href="http://${site}" target="_blank">${site}</a></i>
</li>`;

const renderStories = stories =>
    `<ul>${stories.map(renderStory).join('\n')}</ul>`;

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

    if (stories.length <= 0) {

        feedElem.innerHTML = '<p>No new stories.</p>';

        return;

    }

    feedElem.innerHTML = renderStories(stories);

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
