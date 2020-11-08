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
                    return reject('��� ������ ������� �� � ��� ���� ��� ���� ������ 5 ���� �� ������� � ���� ����� �������� ��������.')
            case 101:
                    return reject('��� ����� API: ����� ������ ����� �� ����')
            case 102:
                    return reject('����� ��� ����.')
            case 103:
                    return reject('����� ���� ���� �������.')
            case 104:
                    return reject('��� ����� API: �� ��� ������ api_key ����� �� �� ��������.')
            case 111:
                    return reject('������ ������ ��� ����� �� �������� ����� DEMO API')
            case 112:
                    return reject('����� � ���� ��� �� � �� ���� ��� ����. ���� �������� ��� ���� �� ������ �� ����� url ����� ��.')
            case 113:
                    return reject('��� ��� ������ ��� �����.')
            case 404:
                    return reject('���� ���� �������� ���� ������ ������ � �� ���� ��� ����� ������.')
            case 405:
                    return reject('�� ����� ����� ������� �� ��� ������� �����. ���� �� ������� ���� ���� ������ ��� ��� ���� ������ ���� �� ������.')
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
