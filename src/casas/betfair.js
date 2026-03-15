// ============================================
// BETFAIR - CAPTURA DE ODDS
// ============================================

const headers = {
    'accept': '*/*',
    'content-type': 'application/json',
    'x-application': 'K61C39rIC0WKzoQ7',
    'cookie': 'vid=8641340d-ee93-43d2-a352-8aea866be6db; locale=pt_BR'
};

const marketIds = ['924.507729310', '924.507899250'];

async function buscarOdds() {
    try {
        const odds = [];
        
        for (const marketId of marketIds) {
            const res = await fetch('https://smp.betfair.bet.br/www/sports/fixedodds/readonly/v1/getMarketPrices?priceHistory=1&_ak=K61C39rIC0WKzoQ7', {
                method: 'POST',
                headers,
                body: JSON.stringify({ marketIds: [marketId] })
            });
            
            const data = await res.json();
            odds.push({ marketId, data });
        }
        
        return odds;
    } catch (err) {
        console.error('Erro Betfair:', err);
        return [];
    }
}

module.exports = { buscarOdds };