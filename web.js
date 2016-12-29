const {feeds} = require('./config.json');

const raspar = require('raspar');

const express = require('express');
const app = express();

const convert = require('./src/utils/convert');

app.use(express.static(`${__dirname}/static`));

app.get('/feed', (req, res) => {

    raspar.fetch(feeds)
        .then(response =>
            Promise.all(response.map(contents =>
                convert.convertFeedFromXMLtoJSON(contents)))
        )
        .then(final => res.send([].concat(...final)));

});

app.listen(process.env.PORT || '5000');
