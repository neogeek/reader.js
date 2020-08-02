const url = require('url');

const crypto = require('crypto');

const { parseString } = require('xml2js');

const parseFormatFeed = result =>
    result.feed.entry.map(entry => {
        const link = entry.link[0].$.href;

        const hash = crypto.createHash('sha1').update(link).digest('hex');

        return {
            hash,
            link,
            site: url.parse(link).hostname,
            title: entry.title[0]
        };
    });

const parseFormatChannel = result =>
    result.rss.channel[0].item.map(item => {
        const [link] = item.link;

        const hash = crypto.createHash('sha1').update(link).digest('hex');

        return {
            hash,
            link,
            site: url.parse(link).hostname,
            title: item.title[0]
        };
    });

const convertFeedFromXMLtoJSON = response =>
    new Promise((resolve, reject) => {
        parseString(response, {}, (err, result) => {
            if (err) {
                return reject(err);
            }

            console.log(result);

            if (result && result.feed && result.feed.entry) {
                resolve(parseFormatFeed(result));
            } else if (
                result.rss &&
                result.rss.channel &&
                result.rss.channel[0].item
            ) {
                resolve(parseFormatChannel(result));
            }

            return reject(new Error('Invalid XML/RSS feed.'));
        });
    });

module.exports = {
    convertFeedFromXMLtoJSON
};
