import { CurrencyRates } from '../data/models';

export async function getCurrencyDetails() {
    let baseCurrency, rates = {};

    // Currency Rates & information
    const currencyRatesData = await CurrencyRates.findAll({
        attributes: ['currencyCode', 'rate', 'isBase'],
        raw: true
    });

    baseCurrency = currencyRatesData.find(o => o && o.isBase);
    baseCurrency = baseCurrency.currencyCode;

    currencyRatesData.map((item) => { rates[item.currencyCode] = item.rate });

    return await {
        baseCurrency,
        rates
    };
}