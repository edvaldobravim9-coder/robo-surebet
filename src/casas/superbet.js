// ============================================
// SUPERBET - CAPTURA DE ODDS (2306 IDs!)
// ============================================

const headers = {
    'accept': 'application/json',
    'origin': 'https://superbet.bet.br',
    'referer': 'https://superbet.bet.br/'
};

const ids = [
    11408276, 11408327, 11408331, 11408332, 11408334,
    11408340, 11408341, 11408354, 11408356, 11499830
]; // 10 exemplos

async function buscarOdds() {
    try {
        const odds = [];
        
        for (const id of ids) {
            const res = await fetch(`https://production-superbet-bmb.freetls.fastly.net/betbuilder/v2/getBetbuilderMarketsForMatch?match_id=${id}&lang=pt-BR&target=SB_BR`, { headers });
            const data = await res.json();
            odds.push({ id, data });
        }
        
        return odds;
    } catch (err) {
        console.error('Erro Superbet:', err);
        return [];
    }
}

module.exports = { buscarOdds };