const url = require('url');

const crypto = require('crypto');

const {parseString} = require('xml2js');

const convertFeedFromXMLtoJSON = response => new Promise((resolve, reject) => {

    parseString(response.body, {}, (err, result) => {

        if (err) {

            return reject(err);

        }

        if (result.feed && result.feed.entry) {

            resolve(result.feed.entry.map(entry => {

                const link = entry.link[0].$.href;

                const hash = crypto.createHash('sha1')
                    .update(link)
                    .digest('hex');

                return {
                    hash,
                    link,
                    'origin': response.request.uri.href,
                    'site': url.parse(link).hostname,
                    'title': entry.title[0]
                };

            }));

        } else if (result.rss && result.rss.channel && result.rss.channel[0].item) {

            resolve(result.rss.channel[0].item.map(item => {

                const link = item.link[0];

                const hash = crypto.createHash('sha1')
                    .update(link)
                    .digest('hex');

                return {
                    hash,
                    link,
                    'origin': response.request.uri.href,
                    'site': url.parse(link).hostname,
                    'title': item.title[0]
                };

            }));

        }

        return reject(new Error('Invalid XML/RSS feed.'));

    });

});

module.exports = {
    convertFeedFromXMLtoJSON
};
