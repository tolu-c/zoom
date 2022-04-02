import moment from 'moment';

const localeDict = {
        'en-US': 'English',
        'es': 'Español',
        'fr-FR': 'Français',
        'ru-RU': 'Pусский',
        'ja-JP': '日本人',
        'id-ID': 'Indonesia',
        'hr-HR': 'Croatian',
        'zh-CN': '中文',
        'sv-SE': 'Svenska',
        'ar': 'الْحُرُوف الْعَرَبِيَّة',
};

const rtlLocateDict = ['he', 'ar'];

export function formatLocale(locale) {
    return localeDict[locale] || 'English';
}

export function isRTL(locale) {
    return locale && rtlLocateDict.indexOf(locale) >=0;
}

export function generateMomentLocaleSettings(locale) {
    var localeData = moment.localeData('en');
    let response = { 
        ordinal: localeData.ordinal()
    };
    return response;
}