// ============================================
// NOVIBET - CAPTURA DE ODDS
// ============================================

const headers = {
    'accept': 'application/json',
    'x-gw-application-name': 'NoviBR',
    'x-gw-channel': 'WebPC',
    'x-gw-country-sysname': 'BR',
    'x-gw-currency-sysname': 'BRL',
    'x-gw-language-sysname': 'pt-BR',
    'x-gw-odds-representation': 'Decimal'
};

async function buscarOdds() {
    try {
        const res = await fetch('https://www.novibet.bet.br/spt/feed/marketviews/location/v2/4324/6051394/?lang=pt-BR&oddsR=1', { headers });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Erro Novibet:', err);
        return [];
    }
}

module.exports = { buscarOdds };