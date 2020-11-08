/* eslint-disable prefer-promise-reject-errors */
const { getVideoMeta } = require('tiktok-scraper')
const { fetchJson } = require('../utils/fetcher')
const { promisify } = require('util')
const { instagram, twitter } = require('video-url-link')

const igGetInfo = promisify(instagram.getInfo)
const twtGetInfo = promisify(twitter.getInfo)

/**
 * Get Tiktok Metadata
 *
 * @param  {String} url
 */
const tiktok = (url) => new Promise((resolve, reject) => {
    console.log('Get metadata from =>', url)
    getVideoMeta(url, { noWaterMark: true, hdVideo: true })
        .then(async (result) => {
            console.log('Get Video From', '@' + result.authorMeta.name, 'ID:', result.id)
            if (result.videoUrlNoWaterMark) {
                result.url = result.videoUrlNoWaterMark
                result.NoWaterMark = true
            } else {
                result.url = result.videoUrl
                result.NoWaterMark = false
            }
            resolve(result)
        }).catch((err) => {
            console.error(err)
            reject(err)
        })
})

/**
 * Get Instagram Metadata
 *
 * @param  {String} url
 */
const insta = (url) => new Promise((resolve, reject) => {
    console.log('Get metadata from =>', url)
    const uri = url.replace(/\?.*$/g, '')
    igGetInfo(uri, {})
        .then((result) => resolve(result))
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})

/**
 * Get Twitter Metadata
 *
 * @param  {String} url
 */
const tweet = (url) => new Promise((resolve, reject) => {
    console.log('Get metadata from =>', url)
    twtGetInfo(url, {})
        .then((content) => resolve(content))
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})

/**
 * Get Facebook Metadata
 *
 * @param  {String} url
 */
const facebook = (url) => new Promise((resolve, reject) => {
    console.log('Get metadata from =>', url)
    const apikey = '3tgDBIOPAPl62b0zuaWNYog2wvRrc4V414AjMi5zdHbU4a'
    fetchJson('http://keepsaveit.com/api/?api_key=' + apikey + '&url=' + url, { method: 'GET' })
        .then((result) => {
            const key = result.code
            switch (key) {
            case 212:
                    return reject('ãäÚ ÇáæÕæá ÈÇáäÓÈÉ áß ¡ áÞÏ æÕáÊ Åáì ÇáÍÏ ÇáÃÞÕì 5 ãÑÇÊ Ýí ÇáÏÞíÞÉ ¡ íÑÌì ÅíÞÇÝ ÇáÒíÇÑÇÊ ÇáÅÖÇÝíÉ.')
            case 101:
                    return reject('ÎØÃ ãÝÊÇÍ API: ãÝÊÇÍ ÇáæÕæá ÇáÎÇÕ Èß ÎÇØÆ')
            case 102:
                    return reject('ÍÓÇÈß ÛíÑ ãÝÚá.')
            case 103:
                    return reject('ÍÓÇÈß ãÚáÞ áÈÚÖ ÇáÇÓÈÇÈ.')
            case 104:
                    return reject('ÎØÃ ãÝÊÇÍ API: áã ÊÞã ÈÊÚííä api_key ÇáÎÇÕ Èß Ýí ÇáãÚáãÇÊ.')
            case 111:
                    return reject('ÇáæÕæá ÇáßÇãá ÛíÑ ãÓãæÍ Èå ÈÇÓÊÎÏÇã ãÝÊÇÍ DEMO API')
            case 112:
                    return reject('ãÚÐÑÉ ¡ åäÇß ÎØÃ ãÇ ¡ Ãæ ÑÇÈØ ÛíÑ ÕÇáÍ. íÑÌì ÇáãÍÇæáÉ ãÑÉ ÃÎÑì Ãæ ÇáÊÍÞÞ ãä ÚäæÇä url ÇáÎÇÕ Èß.')
            case 113:
                    return reject('ÂÓÝ åÐÇ ÇáãæÞÚ ÛíÑ ãÚÊãÏ.')
            case 404:
                    return reject('ÑÈãÇ íßæä ÇáÇÑÊÈÇØ ÇáÐí ÇÊÈÚÊå ãÚØáÇð ¡ Ãæ ÑÈãÇ ÊãÊ ÅÒÇáÉ ÇáÕÝÍÉ.')
            case 405:
                    return reject('áÇ íãßäß ÊäÒíá ÇáæÓÇÆØ Ýí ãáÝ ÇáÊÚÑíÝ ÇáÎÇÕ. íÈÏæ Ãä ÇáÝíÏíæ ÇáÐí ÊÑíÏ ÊäÒíáå ÎÇÕ æáÇ íãßä ÇáæÕæá Åáíå ãä ÎÇÏãäÇ.')
            default:
                return resolve(result)
            }
        }).catch((err) => {
            console.error(err)
            reject(err)
        })
})

module.exports = {
    tiktok,
    insta,
    tweet,
    facebook
}
