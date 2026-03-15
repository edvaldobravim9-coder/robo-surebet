// ============================================
// BETANO - CAPTURA DE ODDS (CORRIGIDO)
// ============================================

const headers = {
    'accept': 'application/json',
    'accept-language': 'pt-BR,pt;q=0.9',
    'x-language': '5',
    'x-operator': '8',
    'referer': 'https://www.betano.bet.br/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
    'cookie': process.env.BETANO_COOKIE  // ✅ Usando o Secret
};

async function buscarOdds() {
    try {
        const listaRes = await fetch('https://www.betano.bet.br/api/home/top-events-v2?req=s,stnf,c,mb,mbl', { headers });
        const lista = await listaRes.json();
        
        const odds = [];
        const eventos = lista.data?.topEventsV2?.events || {};
        
        for (const [id, evento] of Object.entries(eventos)) {
            if (!evento.participants) continue;
            odds.push({
                id,
                timeCasa: evento.participants[0]?.name,
                timeFora: evento.participants[1]?.name,
                liga: evento.leagueName,
                marketIds: evento.marketIdList
            });
        }
        
        return odds;
    } catch (err) {
        console.error('Erro Betano:', err.message);
        return [];
    }
}

module.exports = { buscarOdds };
