// ============================================
// SUPERBET - CAPTURA DE ODDS (JÁ FUNCIONA)
// ============================================

const headers = {
    'accept': 'application/json',
    'origin': 'https://superbet.bet.br',
    'referer': 'https://superbet.bet.br/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

const ids = [11408276, 11408327, 11408331, 11408332, 11408334];

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
        console.error('Erro Superbet:', err.message);
        return [];
    }
}

module.exports = { buscarOdds };
