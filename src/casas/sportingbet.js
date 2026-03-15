// ============================================
// SPORTINGBET - CAPTURA DE ODDS (ACCESS ID ATUALIZADO)
// ============================================

const headers = {
    'accept': 'application/json',
    'x-bwin-accessid': 'YTRhMjczYjctNTBlNy00MWZlLTliMGMtMWNkOWQxMThmZTI2',
    'x-device-type': 'desktop',
    'x-from-product': 'host-app',
    'x-correlation-id': '71f3aefbb353414fb1a7a07a8c1cd781',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
    'referer': 'https://www.sportingbet.bet.br/pt-br/sports',
    'cookie': document.cookie // O GitHub vai usar os cookies salvos
};

async function buscarOdds() {
    try {
        // IDs de exemplo da Sportingbet (use os que você já tem)
        const jogos = [
            7752212,  // Este veio na sua URL
            7761352,
            7758370,
            7758714,
            7759914
        ];
        
        const odds = [];
        
        for (const jogoId of jogos) {
            const url = `https://www.sportingbet.bet.br/cds-api/bettingoffer/fixture-view?x-bwin-accessid=${headers['x-bwin-accessid']}&lang=pt-br&country=BR&fixtureIds=2:${jogoId}`;
            
            const res = await fetch(url, { headers });
            const data = await res.json();
            
            odds.push({
                jogoId,
                data
            });
        }
        
        return odds;
    } catch (err) {
        console.error('Erro Sportingbet:', err.message);
        return [];
    }
}

module.exports = { buscarOdds };
