// ============================================
// SPORTINGBET - CAPTURA DE ODDS (2093 jogos!)
// ============================================

const headers = {
    'accept': 'application/json',
    'x-bwin-accessid': 'YTRhMjczYjctNTBlNy00MWZlLTliMGMtMWNkOWQxMThmZTI2',
    'x-device-type': 'desktop',
    'x-from-product': 'host-app'
};

async function buscarOdds() {
    try {
        const jogos = [
            19026293, 19026294, 19026295, 19026296, 19026297,
            11549948, 11545078, 11545081, 11545103, 11549937
        ]; // 10 exemplos
        
        const odds = [];
        
        for (const jogoId of jogos) {
            const res = await fetch(`https://www.sportingbet.bet.br/cds-api/bettingoffer/fixture-view?fixtureIds=2:${jogoId}&lang=pt-br&country=BR`, { headers });
            const data = await res.json();
            odds.push({ jogoId, data });
        }
        
        return odds;
    } catch (err) {
        console.error('Erro Sportingbet:', err);
        return [];
    }
}

module.exports = { buscarOdds };
