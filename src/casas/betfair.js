// ============================================
// BETFAIR - CAPTURA DE ODDS (CORRIGIDO)
// ============================================

const headers = {
    'accept': '*/*',
    'accept-language': 'pt-BR,pt;q=0.9',
    'content-type': 'application/json',
    'x-application': process.env.BETFAIR_TOKEN || 'K61C39rIC0WKzoQ7',
    'cookie': process.env.BETFAIR_COOKIE  // ✅ Usando o Secret
};

const eventIds = ['35274357', '35274346', '35274387'];

async function buscarOdds() {
    try {
        const odds = [];
        
        const query = {
            operationName: 'ScaUpdates',
            variables: {
                footballEventIds: eventIds,
                tennisEventIds: [],
                raceIds: [],
                baseballEventIds: [],
                basketballEventIds: [],
                cricketEventIds: [],
                tableTennisEventIds: [],
                iceHockeyEventIds: [],
                americanFootballEventIds: [],
                rugbyUnionEventIds: [],
                rugbyLeagueEventIds: [],
                snookerEventIds: [],
                volleyballEventIds: [],
                australianRulesEventIds: [],
                dartsEventIds: [],
                isLite: false,
                includeStats: false,
                includePlayers: false,
                footballPlayerIds: [],
                includePlayerStats: false,
                includeSubstitutions: false
            },
            query: `query ScaUpdates($footballEventIds: [ID!]!) {
                football { fixture(ids: $footballEventIds) { 
                    id
                    score { home away }
                    duration { period status clock { minute second } }
                } }
            }`
        };
        
        const res = await fetch('https://sca.betfair.bet.br/graphql/', {
            method: 'POST',
            headers,
            body: JSON.stringify(query)
        });
        
        const data = await res.json();
        odds.push({ data });
        
        return odds;
    } catch (err) {
        console.error('Erro Betfair:', err.message);
        return [];
    }
}

module.exports = { buscarOdds };
