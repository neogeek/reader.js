const raspar = require('raspar');

const restify = require('restify');
const server = restify.createServer();

const { feeds } = require('./config.json');
const convert = require('./src/utils/convert');

server.get(
    '/*',
    restify.plugins.serveStatic({
        directory: './static'
    })
);

server.get('/feed', (req, res) => {
    raspar
        .fetch(feeds, {
            ttl: 300
        })
        .then(response =>
            Promise.all(
                response.map(contents =>
                    convert.convertFeedFromXMLtoJSON(contents)
                )
            )
        )
        .then(final => res.send([].concat(...final)));
});

server.listen(process.env.PORT || '5000');
