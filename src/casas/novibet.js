// ============================================
// NOVIBET - CAPTURA DE ODDS (CORRIGIDO)
// ============================================

// Parse dos headers salvos no secret
let customHeaders = {};
try {
    customHeaders = JSON.parse(process.env.NOVIBET_HEADERS || '{}');
} catch (e) {
    console.error('Erro ao parsear NOVIBET_HEADERS');
}

const headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'pt-BR,pt;q=0.9',
    ...customHeaders,
    'cookie': process.env.NOVIBET_COOKIE  // ✅ Usando o Secret
};

async function buscarOdds() {
    try {
        const url = 'https://www.novibet.bet.br/spt/feed/marketviews/location/v2/4324/6051394/?lang=pt-BR&oddsR=1';
        const res = await fetch(url, { headers });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Erro Novibet:', err.message);
        return [];
    }
}

module.exports = { buscarOdds };
