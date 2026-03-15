// ============================================
// BETFAIR - CAPTURA DE ODDS (GRAPHQL)
// ============================================

const headers = {
    'accept': '*/*',
    'accept-language': 'pt-BR,pt;q=0.9',
    'content-type': 'application/json',
    'x-application': 'K61C39rIC0WKzoQ7',
    'cookie': 'vid=8641340d-ee93-43d2-a352-8aea866be6db; bfsd=ts=1768333192040|st=reg; ccawa=01204401140077866223266312590351112384028; betexPtk=betexLocale%3Dpt%7EbetexRegion%3DGBR%7EbetexCurrency%3DBRL; RuK=YPUm4sXNxXMAfRMlDuZCNDDCxTHBUG2myGPE4UK%2BjViWJrQReoZPjtuCq%2FAm4UZMinz2ZiFPmRQh5wO%2BJi2nCW3e6hOtXOXKhLfn0TsNZTcvmc9W%0Apmu2vHye1A%3D%3D; locale=pt_BR; language=pt_BR; __cf_bm=QWYOGt_OarpMlfZzmFXIw7cmBSmuSp4JCZ21TFHe3fo-1773600564-1.0.1.1-xJKZXwUEli5knzZ_kZwVP64iJkzD1gR5gFQ9K9WWIZcPnKrPiu7odKxYggajTmqoh0bbpa7uBoXbfwYo_1NhAsp6sG9hVlp.bpvxe7evppk; exp=bf; theme=1; mp_ec0f5c39312fa476b16b86e4f6a1c9dd_mixpanel=%7B%22distinct_id%22%3A%20%22%24device%3A19a0737bb5f58f-06a41d348088108-26061851-384000-19a0737bb5f58f%22%2C%22%24device_id%22%3A%20%2219a0737bb5f58f-06a41d348088108-26061851-384000-19a0737bb5f58f%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsearch.brave.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22search.brave.com%22%2C%22__mps%22%3A%20%7B%7D%2C%22__mpso%22%3A%20%7B%22initial_utm_source%22%3A%20%22adobe_campaign%22%2C%22initial_utm_medium%22%3A%20%22em%22%2C%22initial_utm_campaign%22%3A%20null%2C%22initial_utm_content%22%3A%20null%2C%22initial_utm_term%22%3A%20null%7D%2C%22__mpus%22%3A%20%7B%7D%2C%22__mpa%22%3A%20%7B%7D%2C%22__mpu%22%3A%20%7B%7D%2C%22__mpr%22%3A%20%5B%5D%2C%22__mpap%22%3A%20%5B%5D%7D; storageSSC=lsSSC%3D1'
};

// IDs de eventos de exemplo (podemos pegar mais depois)
const eventIds = [
    '35274357',
    '35274346',
    '35274387'
];

async function buscarOdds() {
    try {
        const odds = [];
        
        // Query GraphQL para buscar odds
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
            query: `query ScaUpdates($footballEventIds: [ID!]!, $tennisEventIds: [ID!]!, $raceIds: [ID!]!, $baseballEventIds: [ID!]!, $basketballEventIds: [ID!]!, $cricketEventIds: [ID!]!, $tableTennisEventIds: [ID!]!, $iceHockeyEventIds: [ID!]!, $americanFootballEventIds: [ID!]!, $rugbyUnionEventIds: [ID!]!, $rugbyLeagueEventIds: [ID!]!, $snookerEventIds: [ID!]!, $volleyballEventIds: [ID!]!, $australianRulesEventIds: [ID!]!, $dartsEventIds: [ID!]!, $isLite: Boolean!, $includeStats: Boolean!, $includePlayers: Boolean!, $footballPlayerIds: [ID!]!, $includePlayerStats: Boolean!, $includeSubstitutions: Boolean!) {
                football { fixture(ids: $footballEventIds) { ...footballFixture __typename } }
            }
            
            fragment footballFixture on FootballFixture {
                id
                score { home away }
                duration { period status clock { minute second } }
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
