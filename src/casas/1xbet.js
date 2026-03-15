// ============================================
// 1XBET - CAPTURA DE ODDS (COOKIES ATUALIZADOS)
// ============================================

const headers = {
    'accept': 'application/json',
    'x-language': 'pt_BR',
    'x-location-latitude': '-23.7717',
    'x-location-longitude': '-46.6827',
    'cookie': '_iidt=DxGNf8JIlyXAJJJwzy5RYO6kImVQ2QEPVWI5zu0Xb7TwHd5S+SnCm5qP32N8a7h0kGGdhU97ki+cRw==; sh.session.id=d81c3bb3-efa2-4707-b2d2-8f515ef45142'
};

async function buscarOdds() {
    try {
        // Busca lista de jogos
        const listaRes = await fetch('https://1xbet.bet.br/service/LiveFeed/Get1x2_VZip?count=50&lng=pt&partner=394', { headers });
        const lista = await listaRes.json();
        
        const odds = [];
        
        for (const jogo of lista.Value || []) {
            const detalhesRes = await fetch(`https://1xbet.bet.br/service/LiveFeed/GetGameZip?id=${jogo.I}&lng=pt&partner=394`, { headers });
            const detalhes = await detalhesRes.json();
            
            odds.push({
                id: jogo.I,
                timeCasa: jogo.O1,
                timeFora: jogo.O2,
                liga: jogo.L,
                odds: detalhes
            });
        }
        
        return odds;
    } catch (err) {
        console.error('Erro 1xBet:', err.message);
        return [];
    }
}

module.exports = { buscarOdds };
