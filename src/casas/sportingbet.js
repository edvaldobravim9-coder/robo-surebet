// ============================================
// SPORTINGBET - CAPTURA DE ODDS (CORRIGIDO)
// ============================================

const headers = {
    'accept': 'application/json',
    'x-bwin-accessid': process.env.SPORTINGBET_ACCESS || 'YTRhMjczYjctNTBlNy00MWZlLTliMGMtMWNkOWQxMThmZTI2',
    'x-device-type': 'desktop',
    'x-from-product': 'host-app',
    'x-correlation-id': '71f3aefbb353414fb1a7a07a8c1cd781',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
    'referer': 'https://www.sportingbet.bet.br/pt-br/sports'
    // ✅ document.cookie REMOVIDO (não precisa)
};

async function buscarOdds() {
    try {
        const jogos = [7752212, 7761352, 7758370, 7758714, 7759914];
        const odds = [];
        
        for (const jogoId of jogos) {
            const url = `https://www.sportingbet.bet.br/cds-api/bettingoffer/fixture-view?x-bwin-accessid=${headers['x-bwin-accessid']}&lang=pt-br&country=BR&fixtureIds=2:${jogoId}`;
            const res = await fetch(url, { headers });
            const data = await res.json();
            odds.push({ jogoId, data });
        }
        
        return odds;
    } catch (err) {
        console.error('Erro Sportingbet:', err.message);
        return [];
    }
}

module.exports = { buscarOdds };
