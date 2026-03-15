// ============================================
// NOVIBET - CAPTURA DE ODDS (HEADERS ATUALIZADOS)
// ============================================

const headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'pt-BR,pt;q=0.9',
    'x-gw-application-name': 'NoviBR',
    'x-gw-channel': 'WebPC',
    'x-gw-client-timezone': 'America/Sao_Paulo',
    'x-gw-cms-key': '_BR',
    'x-gw-country-sysname': 'BR',
    'x-gw-currency-sysname': 'BRL',
    'x-gw-domain-key': '_BR',
    'x-gw-language-sysname': 'pt-BR',
    'x-gw-odds-representation': 'Decimal',
    'x-gw-state-sysname': '',
    'cookie': 'affUrlC=value%3dhttps%3a%2f%2fwww.novibet.bet.br%2fapostas-esportivas; BBPreferences=lang%3dpt-BR%3btimeZone%3dE.+South+America+Standard+Time%3bcountry%3dBR; registerOrLogin=true; _fs_sample_user=false; fbm_642374058934228=base_domain=.novibet.bet.br; tutorial_header_promotions_button=acceptCookies; tutorial_header_promotions_button_loggedIn=acceptCookies; tutorial_special_competitions_statistics=acceptCookies; AGE_CHECK_PASSED=true; __cf_bm=fBNputfumnpu1wWJtxZfBoibQ_olxhVNyMopCZHgMuk-1773601021-1.0.1.1-wRM.DhALQF1QnlZF5P5ohwsgxar3v50OdUWNefy0_BNnLaZc0U56Y4DWas9TjnrhHK2ZymnY42N5VHjQo0ZoFCd3Apy1Jfv2gmy61ZlGsoY; _cfuvid=m2X6itlOnF73_C8tcbEvZmcZ4hZ8wBr5LunyX4HeO88-1773601021694-0.0.1.1-604800000; mp_ec0f5c39312fa476b16b86e4f6a1c9dd_mixpanel=%7B%22distinct_id%22%3A%20%22%24device%3A19cc2f52e22222-04695776d9d6e48-26061c51-384000-19cc2f52e22222%22%2C%22%24device_id%22%3A%20%2219cc2f52e22222-04695776d9d6e48-26061c51-384000-19cc2f52e22222%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fsearch.brave.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22search.brave.com%22%7D; cf_clearance=KJk4eUX8N0HU10b9FLACz2sX3CFllJ4WZRPbyqDRS3c-1773601022-1.2.1.1-4zNJRKlIhY6nIW9pvGnMsn69pcX.VvSUaDd5peJp1tK.XRoDfhG4cTMDYzzQy.JoOfH4A9.UEsouF18Wi..QAHTFTieRYaFGjKIr66EeE.or.YaZKe0iaDoPQ3rBefGXgZGfXKodVTLZRhU7P6xgHfBPH6cJbJ0kLtf8MZjf1.FzX5flW1yw.H5o9zBwtkIowc0jvZkNZMJmPgxMVmqrnQZSOT7iucwE_c5OhH7h9lE; srv_id-api=6d4f12d062d6851f65842c9ba1691ced; ASP.NET_SessionId=e4vmszai215qyblcuefp31rn'
};

async function buscarOdds() {
    try {
        // Endpoint de eventos ao vivo da Novibet
        const url = 'https://www.novibet.bet.br/spt/feed/marketviews/location/v2/4324/6051394/?lang=pt-BR&oddsR=1';
        
        const res = await fetch(url, { headers });
        const data = await res.json();
        
        return data;
    } catch (err) {
        console.error('Erro Novibet:', err.message);
        return [];
    }
}

module.exports = { buscarOdds };
