exports.textTnC = () => {
    return `
This bot has been designed by KINGMAN to serve premium users on WhatsApp`
}

exports.textMenu = (pushname) => {
    return `
Hi, ${pushname || ''}! 👋️
هاي ميزات البوت! ✨

صنع الستكرات:
1. *#sticker*
لتحويل صورة إلى ملصق ، أرسل الصورة مع التسمية التوضيحية #sticker أو قم بالرد على الصورة التي تم إرسالها باستخدام #sticker.

2. *#stickers* _<Image Url>_
لتغيير الصورة من عنوان url إلى ملصق.

3. *#gifsticker* _<Giphy URL>_ / *#stickergif* _<Giphy URL>_
لتحويل صورة gif إلى ملصق (Giphy only)

تنزيل:
1. *#tiktok* _<post / video url>_
بتنزل فيديو تيكتوك.

2. *#fb* _<post / video url>_
بتنزا فيديو فيسببوك.

3. *#ig* _<post / video url>_
بتنزل فيديو انستقرام.

4. *#twt* _<post / video url>_
بتنزل فيديو تويتر.

بتمنى تحصل على يوم حلو!✨`
}

exports.textAdmin = () => {
    return `
⚠ [ *قوانين لادمنية القروبات* ] ⚠ 
هاي شوية اوامر بتسهل على الادمن!

1. *#kick* @user
عشان يزيل العضو من المجموعة (can be more than 1).

2. *#promote* @user
بخلي العضو ادمن.

3. *#demote* @user
ازالة صلاحية الادمن .

3. *#tagall*
بمنشن كل الاعظاء.`
}
