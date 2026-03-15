const casas = {
    '1xbet': require('./casas/1xbet'),
    'betano': require('./casas/betano'),
    'betfair': require('./casas/betfair'),
    'sportingbet': require('./casas/sportingbet'),
    'novibet': require('./casas/novibet'),
    'superbet': require('./casas/superbet')
};

async function executarRobo() {
    console.log('🤖 ROBÔ INICIADO -', new Date().toISOString());
    
    const resultados = {};
    
    for (const [nome, casa] of Object.entries(casas)) {
        try {
            console.log(`📡 Buscando ${nome}...`);
            resultados[nome] = await casa.buscarOdds();
            console.log(`✅ ${nome}: ${resultados[nome].length} odds`);
        } catch (err) {
            console.log(`❌ ${nome}:`, err.message);
        }
    }
    
    // Salva resultados
    const fs = require('fs');
    fs.writeFileSync(
        `./dados/odds_${Date.now()}.json`,
        JSON.stringify(resultados, null, 2)
    );
    
    console.log('🏆 ROBÔ FINALIZADO!');
}

executarRobo();