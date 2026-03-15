// ============================================
// BETANO - CAPTURA DE ODDS (COOKIES ATUALIZADOS)
// ============================================

const headers = {
    'accept': 'application/json',
    'accept-language': 'pt-BR,pt;q=0.9',
    'x-language': '5',
    'x-operator': '8',
    'referer': 'https://www.betano.bet.br/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
    'cookie': 'ageVerificationModal=true; sb_landing=true; dcdd218e08cf151d113eb4b0a7bebd11d0f5821ef82424f966adbfce5971964c=SZxT2v5TLsupe3JSRgRtfUjB9RIvZoQo4e7VcP/zeWa/j9xlcZzvQsNJLvdUzq3cbIAUwlIU33RGjux5+bCpW4gWEA9GRRcR6qYLdYbn.MaZpy2vH38egqkE8HIg3uTSx4CamVB0o.; _cnv_id.7118=822951be-2741-4c97-9e08-63fd116038a2.1764788982.1.1764789191..ccf02af3-2ff4-42b4-abff-2374aa60c96a...; kz_trusted_device_98933098=oQ1iLx2ByEwah00p7EwavfPcnlhYUVHZTVFwua9l8qAOUGszJSxViriCgfCbnDCuxaYAPw9IJRbJngOIbB2wwwZbdCOPP7+52stRR0zO3e0M+kd/uhiV6gBRa5avE3G1qefIU5vzG7T6KWoswlpAK5Ry71G1FLaeNpjuVGTaN0tpPxNAAUhikeHkp4hi93zoTIiBVXL3EZezC60yZzzmfTGtKfoxMd31+Dg2NwmBdyBeBvRPBgQ5WceEwGwiCbwYojky21TMXbNkVfJpfmPCQor8rf0sgUJFrjGUOQnEIIUsXr7tyyQ7jhWOdAmcnwrMdhxOXA9vdua+HIS3iCUIMLncMRi1YY/rfsww5TmPc7KEgPX3GEhJJDfdFiKsCIGAEvSKUuG1awz2f6qb/pzzCgaEHdfk2OEjRYTiWPLJDSCGFhULcrJUL9hn76HFkvtc3nVsRC+j2qbu2S0CQiNkCvsQs9oaOcbo/4iz4TElU5JXJQaqgaLQp2nqBq7lpp/FyKdMYwZH6GLnXPNlCRlm5uhmB82JyoMf9Ovs3I0QOzxgnI2YGLAUfXJHGFzkm0dUmB7P+RB+G2DZdKEOm4byt4UOSHkjQwkH9QQ5mLLsx6VRjsvjSnLtlhgGKz5cYBTg; datadome=uwyrqqSrNlrAeE8gSi~Caa2b8Qf6RZKe8j6y4WwdTxU8KeZgKiEWnPVhIPl7aSYvJu6rk_bz9UtmyvRBziGJ8AJB71t~qYSThjdElZiXpVx~KygmhkmmijgznTWzf67l; hasSeenTopEventsV2Onboarding=true; sticky_sb=2f75958628b5ac2694463531761ad5d8; cf_clearance=Lm18symy7XayfbN4_ybpjlMoTqGAnV2q_yaYGvyxDNQ-1773596986-1.2.1.1-IDtb3AkTyfATqXWATWjHuK5JPeuOeWEen6IFkmfG0ICSuLiQTHR2N1ELfrU6UACj3z2HH6I.bpwZK8KjCvVM.x6zQjj.XCkhUmjWdl5F5JLz8hwrVlYe22k0ZsOSSJrFgtezsIBp84sHDd7WijzM1BRNO39hgrWXrNqeRTw.h2nlaZVFVFaO3foIap0FYOW6ZxqKhKB4uDilqKRbfVePRRJAFit31DouF5d0hj1HiZ0; mp_ec0f5c39312fa476b16b86e4f6a1c9dd_mixpanel=%7B%22distinct_id%22%3A%20%22oEnq0MKkiqUzrVvO%22%2C%22%24device_id%22%3A%20%2219ad138b8a63c7458-03e359f0b847d38-26061b51-384000-19ad138b8a63c7458%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%2C%22%24user_id%22%3A%20%22oEnq0MKkiqUzrVvO%22%2C%22%24search_engine%22%3A%20%22google%22%7D; _cfuvid=ayiK_qIueuKUCCq_JvWYEaiaLzBeO.omyjdMRWjeqy8-1773597017619-0.0.1.1-604800000'
};

async function buscarOdds() {
    try {
        // Busca lista de eventos
        const listaRes = await fetch('https://www.betano.bet.br/api/home/top-events-v2?req=s,stnf,c,mb,mbl', { headers });
        const lista = await listaRes.json();
        
        const odds = [];
        const eventos = lista.data?.topEventsV2?.events || {};
        
        for (const [id, evento] of Object.entries(eventos)) {
            if (!evento.participants) continue;
            
            odds.push({
                id,
                timeCasa: evento.participants[0]?.name,
                timeFora: evento.participants[1]?.name,
                liga: evento.leagueName,
                marketIds: evento.marketIdList
            });
        }
        
        return odds;
    } catch (err) {
        console.error('Erro Betano:', err.message);
        return [];
    }
}

module.exports = { buscarOdds };
