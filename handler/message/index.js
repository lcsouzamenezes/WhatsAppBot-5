require('dotenv').config()
const { decryptMedia, Client } = require('@open-wa/wa-automate')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
const { downloader, cekResi, removebg, urlShortener, meme, translate, getLocationData } = require('../../lib')
const { msgFilter, color, processTime, is } = require('../../utils')
const mentionList = require('../../utils/mention')
const { uploadImages } = require('../../utils/fetcher')

const { menuId, menuEn } = require('./text') // 

module.exports = msgHandler = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, isGif, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account
        const botNumber = await client.getHostNumber() + '@c.us'
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const groupMembers = isGroupMsg ? await client.getGroupMembersId(groupId) : ''
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false

        // Bot Prefix
        const prefix = '#'
        body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
        const url = args.length !== 0 ? args[0] : ''
        const uaOverride = process.env.UserAgent

        // [BETA] Avoid Spam Message
        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        //
        if (!isCmd && !isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname)) }
        if (!isCmd && isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname), 'in', color(name || formattedTitle)) }
        if (isCmd && !isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        // [BETA] Avoid Spam Message
        msgFilter.addFilter(from)

        switch (command) {
        // Menu and TnC
        case 'speed':
        case 'ping':
            await client.sendText(from, `Ping!!!!\nSpeed: ${processTime(t, moment())} _Second_`)
            break
        case 'tnc':
            await client.sendText(from, menuId.textTnC())
            break
        case 'menu':
        case 'help':
            await client.sendText(from, menuId.textMenu(pushname))
                .then(() => ((isGroupMsg) && (isGroupAdmins)) ? client.sendText(from, 'مجموعة إدارة القائمة: *#menuadmin*') : null)
            break
        case 'menuadmin':
            if (!isGroupMsg) return client.reply(from, 'عذرًا ، لا يمكن استخدام هذا الأمر إلا داخل المجموعة! [Group Only]', id)
            if (!isGroupAdmins) return client.reply(from, 'فشل ، لا يمكن استخدام هذا الأمر إلا من قبل مسؤولي المجموعة! [Admin Group Only]', id)
            await client.sendText(from, menuId.textAdmin())
            break
        case 'donate':
        case 'donasi':
            await client.sendText(from, menuId.textDonasi())
            break
        // Sticker Creator
        case 'sticker':
        case 'stiker': {
            if ((isMedia || isQuotedImage) && args.length === 0) {
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                client.sendImageAsSticker(from, imageBase64).then(() => {
                    client.reply(from, 'Here\'s your sticker')
                    console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                })
            } else if (args[0] === 'nobg') {
                /**
                * This is Premium feature.
                * Check premium feature at https://trakteer.id/red-emperor/showcase or chat Author for Information.
                */
                client.reply(from, 'إيه ، ما هذا???', id)
            } else if (args.length === 1) {
                if (!is.Url(url)) { await client.reply(from, 'عذرا ، الرابط الذي قدمته غير صالح. [Invalid Link]', id) }
                client.sendStickerfromUrl(from, url).then((r) => (!r && r !== undefined)
                    ? client.sendText(from, 'عذرا ، الرابط الذي أرسلته لا يحتوي على صورة. [No Image]')
                    : client.reply(from, 'Here\'s your sticker')).then(() => console.log(`Sticker Processed for ${processTime(t, moment())} Second`))
            } else {
                await client.reply(from, 'لا توجد صورة! لفتح قائمة أوامر الإرسال #menu [Wrong Format]', id)
            }
            break
        }
        case 'stikergif':
        case 'stickergif':
        case 'gifstiker':
        case 'gifsticker': {
            if (args.length !== 1) return client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format]', id)
            if (is.Giphy(url)) {
                const getGiphyCode = url.match(new RegExp(/(\/|\-)(?:.(?!(\/|\-)))+$/, 'gi'))
                if (!getGiphyCode) { return client.reply(from, 'فشل استرداد رمز giphy', id) }
                const giphyCode = getGiphyCode[0].replace(/[-\/]/gi, '')
                const smallGifUrl = 'https://media.giphy.com/media/' + giphyCode + '/giphy-downsized.gif'
                client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                    client.reply(from, 'هي ستيكر تبعك')
                    console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                }).catch((err) => console.log(err))
            } else if (is.MediaGiphy(url)) {
                const gifUrl = url.match(new RegExp(/(giphy|source).(gif|mp4)/, 'gi'))
                if (!gifUrl) { return client.reply(from, 'فشل استرداد رمز giphy', id) }
                const smallGifUrl = url.replace(gifUrl[0], 'giphy-downsized.gif')
                client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                    client.reply(from, 'هي ستيكر تبعك')
                    console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                }).catch((err) => console.log(err))
            } else {
                await client.reply(from, 'آسف ، في الوقت الحالي ، لا يمكن لملصقات gif سوى استخدام الرابط من giphy.  [Giphy Only]', id)
            }
            break
        }
        // Video Downloader
        case 'tiktok':
            if (args.length !== 1) return client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format]', id)
            if (!is.Url(url) && !url.includes('tiktok.com')) return client.reply(from, 'عذرا ، الرابط الذي قدمته غير صالح. [Invalid Link]', id)
            await client.reply(from, `_Scraping Metadata..._ \n\n${menuId.textDonasi()}`, id)
            downloader.tiktok(url).then(async (videoMeta) => {
                const filename = videoMeta.authorMeta.name + '.mp4'
                const caps = `*Metadata:*\nUsername: ${videoMeta.authorMeta.name} \nMusic: ${videoMeta.musicMeta.musicName} \nView: ${videoMeta.playCount.toLocaleString()} \nLike: ${videoMeta.diggCount.toLocaleString()} \nComment: ${videoMeta.commentCount.toLocaleString()} \nShare: ${videoMeta.shareCount.toLocaleString()} \nCaption: ${videoMeta.text.trim() ? videoMeta.text : '-'}`
                await client.sendFileFromUrl(from, videoMeta.url, filename, videoMeta.NoWaterMark ? caps : `⚠ Video tanpa watermark tidak tersedia. \n\n${caps}`, '', { headers: { 'User-Agent': 'okhttp/4.5.0', referer: 'https://www.tiktok.com/' } }, true)
                    .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            }).catch(() => client.reply(from, 'فشل إحضار البيانات الوصفية ، الرابط الذي أرسلته غير صالح. [Invalid Link]', id))
            break
        case 'ig':
        case 'instagram':
            if (args.length !== 1) return client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format]', id)
            if (!is.Url(url) && !url.includes('instagram.com')) return client.reply(from, 'عذرا ، الرابط الذي قدمته غير صالح. [Invalid Link]', id)
            await client.reply(from, `_Scraping Metadata..._ \n\n${menuId.textDonasi()}`, id)
            downloader.insta(url).then(async (data) => {
                if (data.type == 'GraphSidecar') {
                    if (data.image.length != 0) {
                        data.image.map((x) => client.sendFileFromUrl(from, x, 'photo.jpg', '', null, null, true))
                            .then((serialized) => console.log(`تم بنجاح إرسال الملفات ذات المعرف: ${serialized} معالجتها خلال ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                    if (data.video.length != 0) {
                        data.video.map((x) => client.sendFileFromUrl(from, x.videoUrl, 'video.jpg', '', null, null, true))
                            .then((serialized) => console.log(`تم بنجاح إرسال الملفات ذات المعرف: ${serialized} معالجتها خلال ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                } else if (data.type == 'GraphImage') {
                    client.sendFileFromUrl(from, data.image, 'photo.jpg', '', null, null, true)
                        .then((serialized) => console.log(`تم بنجاح إرسال الملفات ذات المعرف: ${serialized} معالجتها خلال ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                } else if (data.type == 'GraphVideo') {
                    client.sendFileFromUrl(from, data.video.videoUrl, 'video.mp4', '', null, null, true)
                        .then((serialized) => console.log(`تم بنجاح إرسال الملفات ذات المعرف: ${serialized} معالجتها خلال ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                }
            })
                .catch((err) => {
                    console.log(err)
                    if (err === 'Not a video') { return client.reply(from, 'خطأ ، لا يوجد فيديو على الرابط الذي أرسلته. [Invalid Link]', id) }
                    client.reply(from, 'خطأ ، ارتباط خاص بالمستخدم أو ارتباط خاطئ [Private or Invalid Link]', id)
                })
            break
        case 'twt':
        case 'twitter':
            if (args.length !== 1) return client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format]', id)
            if (!is.Url(url) & !url.includes('twitter.com') || url.includes('t.co')) return client.reply(from, 'عذرا ، عنوان url الذي قدمته غير صالح. [Invalid Link]', id)
            await client.reply(from, `_Scraping Metadata..._ \n\n${menuId.textDonasi()}`, id)
            downloader.tweet(url).then(async (data) => {
                if (data.type === 'video') {
                    const content = data.variants.filter(x => x.content_type !== 'application/x-mpegURL').sort((a, b) => b.bitrate - a.bitrate)
                    const result = await urlShortener(content[0].url)
                    console.log('Shortlink: ' + result)
                    await client.sendFileFromUrl(from, content[0].url, 'video.mp4', `Link Download: ${result} \n\nProcessed for ${processTime(t, moment())} _Second_`, null, null, true)
                        .then((serialized) => console.log(`تم بنجاح إرسال الملفات ذات المعرف: ${serialized} معالجتها خلال ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                } else if (data.type === 'photo') {
                    for (let i = 0; i < data.variants.length; i++) {
                        await client.sendFileFromUrl(from, data.variants[i], data.variants[i].split('/media/')[1], '', null, null, true)
                            .then((serialized) => console.log(`تم بنجاح إرسال الملفات ذات المعرف: ${serialized} معالجتها خلال ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                }
            })
                .catch(() => client.sendText(from, 'عذرًا ، الرابط غير صالح أو لا توجد وسائط في الرابط الذي أرسلته. [Invalid Link]'))
            break
        case 'fb':
        case 'facebook':
            if (args.length !== 1) return client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format]', id)
            if (!is.Url(url) && !url.includes('facebook.com')) return client.reply(from, 'عذرا ، عنوان url الذي قدمته غير صالح. [Invalid Link]', id)
            await client.reply(from, '_Scraping Metadata..._ \n\nTerimakasih telah menggunakan bot ini, kamu dapat membantu pengembangan bot ini dengan menyawer melalui https://saweria.co/donate/yogasakti atau mentrakteer melalui https://trakteer.id/red-emperor \nTerimakasih.', id)
            downloader.facebook(url).then(async (videoMeta) => {
                const title = videoMeta.response.title
                const thumbnail = videoMeta.response.thumbnail
                const links = videoMeta.response.links
                const shorts = []
                for (let i = 0; i < links.length; i++) {
                    const shortener = await urlShortener(links[i].url)
                    console.log('Shortlink: ' + shortener)
                    links[i].short = shortener
                    shorts.push(links[i])
                }
                const link = shorts.map((x) => `${x.resolution} Quality: ${x.short}`)
                const caption = `Text: ${title} \n\nLink Download: \n${link.join('\n')} \n\nProcessed for ${processTime(t, moment())} _Second_`
                await client.sendFileFromUrl(from, thumbnail, 'videos.jpg', caption, null, null, true)
                    .then((serialized) => console.log(`تم بنجاح إرسال الملفات ذات المعرف: ${serialized} معالجتها خلال ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            })
                .catch((err) => client.reply(from, `خطأ ، عنوان url غير صالح أو لم يتم تحميل الفيديو. [Invalid Link or No Video] \n\n${err}`, id))
            break
        // Other Command
        case 'meme':
            if ((isMedia || isQuotedImage) && args.length >= 2) {
                const top = arg.split('|')[0]
                const bottom = arg.split('|')[1]
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const getUrl = await uploadImages(mediaData, false)
                const ImageBase64 = await meme.custom(getUrl, top, bottom)
                client.sendFile(from, ImageBase64, 'image.png', '', null, true)
                    .then((serialized) => console.log(`تم بنجاح إرسال الملفات ذات المعرف: ${serialized} معالجتها خلال ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            } else {
                await client.reply(from, 'لا توجد صورة! لفتح طريق استعمال الكريم #menu [Wrong Format]', id)
            }
            break
        case 'resi':
            if (args.length !== 2) return client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format]', id)
            const kurirs = ['jne', 'pos', 'tiki', 'wahana', 'jnt', 'rpx', 'sap', 'sicepat', 'pcp', 'jet', 'dse', 'first', 'ninja', 'lion', 'idl', 'rex']
            if (!kurirs.includes(args[0])) return client.sendText(from, `عذرًا ، نوع بعثة الشحن غير مدعوم. تدعم هذه الخدمة خدمة الشحن فقط ${kurirs.join(', ')} يرجى التحقق مرة أخرى.`)
            console.log('Memeriksa No Resi', args[1], 'dengan ekspedisi', args[0])
            cekResi(args[0], args[1]).then((result) => client.sendText(from, result))
            break
        case 'translate':
            if (args.length != 1) return client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format]', id)
            if (!quotedMsg) return client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format]', id)
            const quoteText = quotedMsg.type == 'chat' ? quotedMsg.body : quotedMsg.type == 'image' ? quotedMsg.caption : ''
            translate(quoteText, args[0])
                .then((result) => client.sendText(from, result))
                .catch(() => client.sendText(from, '[Error] رمز لغة خاطئ أو خادم به مشكلة.'))
            break
        case 'ceklok':
        case 'ceklokasi':
            if (!quotedMsg || quotedMsg.type !== 'location') return client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format]', id)
            console.log(`Request Status Zona Penyebaran Covid-19 (${quotedMsg.lat}, ${quotedMsg.lng}).`)
            const zoneStatus = await getLocationData(quotedMsg.lat, quotedMsg.lng)
            if (zoneStatus.kode !== 200) client.sendText(from, 'عذرا ، كان هناك خطأ في التحقق من الموقع الذي قدمته.')
            let data = ''
            for (let i = 0; i < zoneStatus.data.length; i++) {
                const { zone, region } = zoneStatus.data[i]
                const _zone = zone == 'green' ? 'Hijau* (Aman) \n' : zone == 'yellow' ? 'Kuning* (Waspada) \n' : 'Merah* (Bahaya) \n'
                data += `${i + 1}. Kel. *${region}* Berstatus *Zona ${_zone}`
            }
            const text = `*CEK LOKASI PENYEBARAN COVID-19*\nHasil pemeriksaan dari lokasi yang anda kirim adalah *${zoneStatus.status}* ${zoneStatus.optional}\n\nInformasi lokasi terdampak disekitar anda:\n${data}`
            client.sendText(from, text)
            break
        // Group Commands (group admin only)
        case 'kick':
            if (!isGroupMsg) return client.reply(from, 'عذرًا ، لا يمكن استخدام هذا الأمر إلا داخل المجموعة! [Group Only]', id)
            if (!isGroupAdmins) return client.reply(from, 'فشل ، لا يمكن استخدام هذا الأمر إلا من قبل مسؤولي المجموعة! [Admin Group Only]', id)
            if (!isBotGroupAdmins) return client.reply(from, 'فشل ، يرجى إضافة الروبوت كمسؤول المجموعة! [Bot Not Admin]', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format]', id)
            if (mentionedJidList[0] === botNumber) return await client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format]', id)
            await client.sendTextWithMentions(from, `Request diterima, mengeluarkan:\n${mentionedJidList.map(x => `@${x.replace('@c.us', '')}`).join('\n')}`)
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return await client.sendText(from, 'فشل ، لا يمكنك إزالة مسؤول المجموعة.')
                await client.removeParticipant(groupId, mentionedJidList[i])
            }
            break
        case 'promote':
            if (!isGroupMsg) return await client.reply(from, 'عذرًا ، لا يمكن استخدام هذا الأمر إلا داخل المجموعة! [Group Only]', id)
            if (!isGroupAdmins) return await client.reply(from, 'فشل ، لا يمكن استخدام هذا الأمر إلا من قبل مسؤولي المجموعة! [Admin Group Only]', id)
            if (!isBotGroupAdmins) return await client.reply(from, 'فشل ، يرجى إضافة الروبوت كمسؤول المجموعة! [Bot not Admin]', id)
            if (mentionedJidList.length != 1) return client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format, Only 1 user]', id)
            if (groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'عذرا ، المستخدم هو بالفعل مشرف. [Bot is Admin]', id)
            if (mentionedJidList[0] === botNumber) return await client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format]', id)
            await client.promoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Request diterima, menambahkan @${mentionedJidList[0].replace('@c.us', '')} sebagai admin.`)
            break
        case 'demote':
            if (!isGroupMsg) return client.reply(from, 'عذرًا ، لا يمكن استخدام هذا الأمر إلا داخل المجموعة! [Group Only]', id)
            if (!isGroupAdmins) return client.reply(from, 'فشل ، لا يمكن استخدام هذا الأمر إلا من قبل مسؤولي المجموعة! [Admin Group Only]', id)
            if (!isBotGroupAdmins) return client.reply(from, 'فشل ، يرجى إضافة الروبوت كمسؤول المجموعة! [Bot not Admin]', id)
            if (mentionedJidList.length !== 1) return client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format, Only 1 user]', id)
            if (!groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'عذرا ، المستخدم ليس مسؤول. [user not Admin]', id)
            if (mentionedJidList[0] === botNumber) return await client.reply(from, 'عذرا ، صيغة الرسالة خاطئة ، برجاء مراجعة القائمة . [Wrong Format]', id)
            await client.demoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Request diterima, menghapus jabatan @${mentionedJidList[0].replace('@c.us', '')}.`)
            break
        case 'bye':
            if (!isGroupMsg) return client.reply(from, 'عذرًا ، لا يمكن استخدام هذا الأمر إلا داخل المجموعات! [Group Only]', id)
            if (!isGroupAdmins) return client.reply(from, 'فشل ، لا يمكن استخدام هذا الأمر إلا من قبل مسؤولي المجموعة! [Admin Group Only]', id)
            client.sendText(from, 'Good bye... ( ⇀‸↼‶ )').then(() => client.leaveGroup(groupId))
            break
        case 'del':
            if (!isGroupAdmins) return client.reply(from, 'فشل ، لا يمكن استخدام هذا الأمر إلا من قبل مسؤولي المجموعة! [Admin Group Only]', id)
            if (!quotedMsg) return client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format]', id)
            if (!quotedMsgObj.fromMe) return client.reply(from, 'عذرًا ، تنسيق الرسالة خاطئ ، يرجى التحقق من القائمة. [Wrong Format]', id)
            client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break
        case 'tagall':
        case 'everyone':
            /**
            * This is Premium feature.
            * Check premium feature at https://trakteer.id/red-emperor/showcase or chat Author for Information.
            */
            client.reply(from, 'ما هذا؟', id)
            break
        case 'botstat': {
            const loadedMsg = await client.getAmountOfLoadedMessages()
            const chatIds = await client.getAllChatIds()
            const groups = await client.getAllGroups()
            client.sendText(from, `Status :\n- *${loadedMsg}* Loaded Messages\n- *${groups.length}* Group Chats\n- *${chatIds.length - groups.length}* Personal Chats\n- *${chatIds.length}* Total Chats`)
            break
        }
        default:
            console.log(color('[ERROR]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Unregistered Command from', color(pushname))
            break
        }
    } catch (err) {
        console.error(color(err, 'red'))
    }
}