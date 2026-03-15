// ============================================
// 🎯 CRUZADOR INTELIGENTE DE MERCADOS
// ============================================

const fs = require('fs');
const path = require('path');

// ============================================
// 1. MAPEAMENTO DE MERCADOS ENTRE AS CASAS
// ============================================
const MERCADOS = {
    // MERCADOS PRINCIPAIS (1X2)
    '1x2': {
        nome: 'Resultado Final',
        casas: {
            '1xBet': {
                localizacao: ['GE[0].E'],
                extracao: (data) => {
                    try {
                        const mercado = data.Value?.GE?.find(m => m.G === 1);
                        if (!mercado) return null;
                        return {
                            casa: mercado.E[0]?.[0]?.C || 0,
                            empate: mercado.E[1]?.[0]?.C || 0,
                            fora: mercado.E[2]?.[0]?.C || 0
                        };
                    } catch { return null; }
                }
            },
            'Betano': {
                localizacao: ['markets[?]'],
                extracao: (data) => {
                    try {
                        if (Array.isArray(data) && data[0]?.marketIds) {
                            return null; // Precisa buscar odds detalhadas
                        }
                        return null;
                    } catch { return null; }
                }
            },
            'Betfair': {
                localizacao: ['graphql'],
                extracao: (data) => {
                    try {
                        const fixture = data?.data?.football?.[0]?.fixture;
                        if (!fixture) return null;
                        return {
                            casa: fixture.score?.home || 0,
                            // Betfair precisa de outra query para odds
                        };
                    } catch { return null; }
                }
            },
            'Sportingbet': {
                localizacao: ['fixture.markets'],
                extracao: (data) => {
                    try {
                        const mercado = data.fixture?.markets?.find(m => 
                            m.name?.includes('Resultado') || m.name?.includes('Vencedor')
                        );
                        if (!mercado) return null;
                        return {
                            casa: mercado.outcomes?.find(o => o.type === 'Home')?.odds,
                            empate: mercado.outcomes?.find(o => o.type === 'Draw')?.odds,
                            fora: mercado.outcomes?.find(o => o.type === 'Away')?.odds
                        };
                    } catch { return null; }
                }
            },
            'Novibet': {
                localizacao: ['betViews[].competitions[].events[].markets'],
                extracao: (data) => {
                    try {
                        const odds = {};
                        data.betViews?.forEach(view => {
                            view.competitions?.forEach(comp => {
                                comp.events?.forEach(event => {
                                    event.markets?.forEach(market => {
                                        if (market.betTypeSysname === 'SOCCER_MATCH_RESULT') {
                                            market.betItems?.forEach(item => {
                                                if (item.code === '1') odds.casa = item.price;
                                                if (item.code === 'X') odds.empate = item.price;
                                                if (item.code === '2') odds.fora = item.price;
                                            });
                                        }
                                    });
                                });
                            });
                        });
                        return odds;
                    } catch { return null; }
                }
            },
            'Superbet': {
                localizacao: ['markets'],
                extracao: (data) => {
                    try {
                        if (data.data?.markets) {
                            const mercado = data.data.markets.find(m => m.name === 'Resultado Final');
                            if (mercado) {
                                const odds = {};
                                mercado.odds?.forEach(o => {
                                    if (o.name === '1') odds.casa = o.price;
                                    if (o.name === 'X') odds.empate = o.price;
                                    if (o.name === '2') odds.fora = o.price;
                                });
                                return odds;
                            }
                        }
                        return null;
                    } catch { return null; }
                }
            }
        }
    },
    
    // MERCADO DE TOTAL DE GOLS (MAIS/MENOS)
    'total_gols': {
        nome: 'Total de Gols',
        casas: {
            '1xBet': {
                localizacao: ['GE[2]'],
                extracao: (data) => {
                    try {
                        const mercado = data.Value?.GE?.find(m => m.G === 2);
                        if (!mercado) return null;
                        return {
                            mais: mercado.E[0]?.[0]?.C || 0,
                            menos: mercado.E[1]?.[0]?.C || 0
                        };
                    } catch { return null; }
                }
            },
            'Betano': {
                localizacao: ['markets[?].outcomes'],
                extracao: (data) => {
                    // Implementar
                    return null;
                }
            },
            'Sportingbet': {
                localizacao: ['fixture.markets'],
                extracao: (data) => {
                    try {
                        const mercado = data.fixture?.markets?.find(m => 
                            m.name?.includes('Total') || m.name?.includes('Mais/Menos')
                        );
                        if (!mercado) return null;
                        return {
                            mais: mercado.outcomes?.find(o => o.type === 'Over')?.odds,
                            menos: mercado.outcomes?.find(o => o.type === 'Under')?.odds
                        };
                    } catch { return null; }
                }
            },
            'Novibet': {
                localizacao: ['betViews[].competitions[].events[].markets'],
                extracao: (data) => {
                    try {
                        const odds = {};
                        data.betViews?.forEach(view => {
                            view.competitions?.forEach(comp => {
                                comp.events?.forEach(event => {
                                    event.markets?.forEach(market => {
                                        if (market.betTypeSysname === 'SOCCER_UNDER_OVER') {
                                            market.betItems?.forEach(item => {
                                                if (item.code === 'O') odds.mais = item.price;
                                                if (item.code === 'U') odds.menos = item.price;
                                            });
                                        }
                                    });
                                });
                            });
                        });
                        return odds;
                    } catch { return null; }
                }
            }
        }
    },
    
    // HANDICAP ASIÁTICO
    'handicap': {
        nome: 'Handicap',
        casas: {
            '1xBet': {
                localizacao: ['GE[3]'],
                extracao: (data) => {
                    try {
                        const mercado = data.Value?.GE?.find(m => m.G === 3);
                        if (!mercado) return null;
                        return {
                            casa_handicap: mercado.E.map(e => ({
                                valor: e[0]?.P,
                                odd: e[0]?.C
                            }))
                        };
                    } catch { return null; }
                }
            },
            'Sportingbet': {
                localizacao: ['fixture.markets'],
                extracao: (data) => {
                    try {
                        const mercado = data.fixture?.markets?.find(m => 
                            m.name?.includes('Handicap')
                        );
                        if (!mercado) return null;
                        return {
                            handicap: mercado.outcomes?.map(o => ({
                                nome: o.name,
                                valor: o.handicap,
                                odd: o.odds
                            }))
                        };
                    } catch { return null; }
                }
            }
        }
    },
    
    // CANTOS
    'escanteios': {
        nome: 'Escanteios',
        casas: {
            '1xBet': {
                localizacao: ['GE[4]'],
                extracao: (data) => {
                    try {
                        const mercado = data.Value?.GE?.find(m => m.G === 4);
                        if (!mercado) return null;
                        return {
                            mais: mercado.E[0]?.[0]?.C,
                            menos: mercado.E[1]?.[0]?.C
                        };
                    } catch { return null; }
                }
            },
            'Novibet': {
                localizacao: ['betViews[].competitions[].events[].markets'],
                extracao: (data) => {
                    try {
                        const odds = {};
                        data.betViews?.forEach(view => {
                            view.competitions?.forEach(comp => {
                                comp.events?.forEach(event => {
                                    event.markets?.forEach(market => {
                                        if (market.betTypeSysname === 'SOCCER_CORNERS_UNDER_OVER') {
                                            market.betItems?.forEach(item => {
                                                if (item.code === 'O') odds.mais = item.price;
                                                if (item.code === 'U') odds.menos = item.price;
                                            });
                                        }
                                    });
                                });
                            });
                        });
                        return odds;
                    } catch { return null; }
                }
            }
        }
    },
    
    // AMBAS MARCAM
    'ambas_marcam': {
        nome: 'Ambas Marcam',
        casas: {
            '1xBet': {
                localizacao: ['GE[130]'],
                extracao: (data) => {
                    try {
                        const mercado = data.Value?.GE?.find(m => m.G === 130);
                        if (!mercado) return null;
                        return {
                            sim: mercado.E[0]?.[0]?.C,
                            nao: mercado.E[1]?.[0]?.C
                        };
                    } catch { return null; }
                }
            },
            'Novibet': {
                localizacao: ['betViews[].competitions[].events[].markets'],
                extracao: (data) => {
                    try {
                        const odds = {};
                        data.betViews?.forEach(view => {
                            view.competitions?.forEach(comp => {
                                comp.events?.forEach(event => {
                                    event.markets?.forEach(market => {
                                        if (market.betTypeSysname === 'SOCCER_BOTH_TEAMS_TO_SCORE') {
                                            market.betItems?.forEach(item => {
                                                if (item.code === 'Y') odds.sim = item.price;
                                                if (item.code === 'N') odds.nao = item.price;
                                            });
                                        }
                                    });
                                });
                            });
                        });
                        return odds;
                    } catch { return null; }
                }
            }
        }
    },
    
    // CARTÕES
    'cartoes': {
        nome: 'Cartões',
        casas: {
            '1xBet': {
                localizacao: ['GE[5]'],
                extracao: (data) => {
                    try {
                        const mercado = data.Value?.GE?.find(m => m.G === 5);
                        if (!mercado) return null;
                        return {
                            mais: mercado.E[0]?.[0]?.C,
                            menos: mercado.E[1]?.[0]?.C
                        };
                    } catch { return null; }
                }
            }
        }
    }
};

// ============================================
// 2. EXTRAIR TODOS OS MERCADOS DE UM JOGO
// ============================================
function extrairTodosMercados(dados, casa) {
    const mercados = {};
    
    for (const [tipo, mercado] of Object.entries(MERCADOS)) {
        if (mercado.casas[casa]) {
            try {
                const odds = mercado.casas[casa].extracao(dados);
                if (odds && Object.keys(odds).length > 0) {
                    mercados[tipo] = {
                        nome: mercado.nome,
                        odds
                    };
                }
            } catch (e) {
                // Ignora erros de extração
            }
        }
    }
    
    return mercados;
}

// ============================================
// 3. NORMALIZAR TIMES
// ============================================
function normalizarTime(nome) {
    if (!nome) return '';
    return nome.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .replace(/\s+/g, '');
}

// ============================================
// 4. CRUZAR MERCADOS ENTRE CASAS
// ============================================
function cruzarMercados(jogosPorCasa) {
    const resultados = {};
    
    // Primeiro, normaliza todos os jogos por time
    for (const [casa, jogos] of Object.entries(jogosPorCasa)) {
        for (const jogo of jogos) {
            const timeCasa = normalizarTime(jogo.timeCasa || jogo.timeCasa);
            const timeFora = normalizarTime(jogo.timeFora || jogo.timeFora);
            const chave = `${timeCasa}-${timeFora}`;
            
            if (!resultados[chave]) {
                resultados[chave] = {
                    timeCasa: jogo.timeCasa,
                    timeFora: jogo.timeFora,
                    mercados: {}
                };
            }
            
            // Extrai todos os mercados deste jogo
            const mercados = extrairTodosMercados(jogo, casa);
            
            for (const [tipo, dados] of Object.entries(mercados)) {
                if (!resultados[chave].mercados[tipo]) {
                    resultados[chave].mercados[tipo] = {
                        nome: dados.nome,
                        odds: {}
                    };
                }
                resultados[chave].mercados[tipo].odds[casa] = dados.odds;
            }
        }
    }
    
    return resultados;
}

// ============================================
// 5. CALCULAR SUREBETS POR MERCADO
// ============================================
function calcularSurebetMercado(jogo, tipo, oddsPorCasa) {
    const casas = Object.keys(oddsPorCasa);
    if (casas.length < 2) return null;
    
    const todasOdds = {};
    let melhorCombinacao = null;
    let melhorLucro = 0;
    
    // Para mercado 1X2
    if (tipo === '1x2') {
        // Testa todas as combinações de casas
        for (const casaCasa of casas) {
            for (const casaEmpate of casas) {
                for (const casaFora of casas) {
                    // Pega as odds de cada casa
                    const oddCasa = oddsPorCasa[casaCasa]?.casa;
                    const oddEmpate = oddsPorCasa[casaEmpate]?.empate;
                    const oddFora = oddsPorCasa[casaFora]?.fora;
                    
                    if (!oddCasa || !oddEmpate || !oddFora) continue;
                    
                    const soma = 1/oddCasa + 1/oddEmpate + 1/oddFora;
                    if (soma >= 1) continue;
                    
                    const lucro = ((1 / soma) - 1) * 100;
                    if (lucro > melhorLucro) {
                        melhorLucro = lucro;
                        melhorCombinacao = {
                            casa: { nome: casaCasa, odd: oddCasa },
                            empate: { nome: casaEmpate, odd: oddEmpate },
                            fora: { nome: casaFora, odd: oddFora },
                            lucro: lucro.toFixed(2),
                            investimento: {
                                casa: (100 / soma) * (1/oddCasa),
                                empate: (100 / soma) * (1/oddEmpate),
                                fora: (100 / soma) * (1/oddFora)
                            }
                        };
                    }
                }
            }
        }
    }
    
    // Para mercados binários (Mais/Menos, Sim/Não)
    if (tipo === 'total_gols' || tipo === 'ambas_marcam' || tipo === 'cartoes' || tipo === 'escanteios') {
        for (const casa1 of casas) {
            for (const casa2 of casas) {
                if (casa1 === casa2) continue;
                
                const odd1 = oddsPorCasa[casa1]?.mais || oddsPorCasa[casa1]?.sim;
                const odd2 = oddsPorCasa[casa2]?.menos || oddsPorCasa[casa2]?.nao;
                
                if (!odd1 || !odd2) continue;
                
                const soma = 1/odd1 + 1/odd2;
                if (soma >= 1) continue;
                
                const lucro = ((1 / soma) - 1) * 100;
                if (lucro > melhorLucro) {
                    melhorLucro = lucro;
                    melhorCombinacao = {
                        opcao1: { nome: casa1, odd: odd1, tipo: 'mais/sim' },
                        opcao2: { nome: casa2, odd: odd2, tipo: 'menos/não' },
                        lucro: lucro.toFixed(2),
                        investimento: {
                            opcao1: (100 / soma) * (1/odd1),
                            opcao2: (100 / soma) * (1/odd2)
                        }
                    };
                }
            }
        }
    }
    
    return melhorCombinacao;
}

// ============================================
// 6. FUNÇÃO PRINCIPAL
// ============================================
function processarArquivoOdds(caminhoArquivo) {
    console.log('🎯 CRUZADOR INTELIGENTE DE MERCADOS');
    console.log('='.repeat(60));
    
    const dados = JSON.parse(fs.readFileSync(caminhoArquivo, 'utf8'));
    
    // Organiza odds por casa
    const jogosPorCasa = {
        '1xBet': dados['1xbet'] || [],
        'Betano': dados['betano'] || [],
        'Betfair': dados['betfair'] || [],
        'Sportingbet': dados['sportingbet'] || [],
        'Novibet': dados['novibet'] || [],
        'Superbet': dados['superbet'] || []
    };
    
    // Cruza mercados
    const jogosCruzados = cruzarMercados(jogosPorCasa);
    
    console.log(`📊 ${Object.keys(jogosCruzados).length} jogos encontrados\n`);
    
    // Calcula surebets por mercado
    const todasSurebets = [];
    
    for (const [chave, jogo] of Object.entries(jogosCruzados)) {
        for (const [tipo, mercado] of Object.entries(jogo.mercados)) {
            const surebet = calcularSurebetMercado(jogo, tipo, mercado.odds);
            if (surebet) {
                todasSurebets.push({
                    jogo: `${jogo.timeCasa} x ${jogo.timeFora}`,
                    mercado: mercado.nome,
                    ...surebet
                });
            }
        }
    }
    
    // Ordena por lucro
    todasSurebets.sort((a, b) => parseFloat(b.lucro) - parseFloat(a.lucro));
    
    // Mostra resultados
    console.log('🏆 SUREBETS ENCONTRADAS POR MERCADO:\n');
    
    if (todasSurebets.length === 0) {
        console.log('❌ Nenhuma surebet encontrada');
    } else {
        todasSurebets.forEach((sb, i) => {
            console.log(`${i+1}. ${sb.jogo}`);
            console.log(`   📊 Mercado: ${sb.mercado}`);
            console.log(`   💰 Lucro: ${sb.lucro}%`);
            
            if (sb.casa) { // Mercado 1X2
                console.log(`   🏢 Casa: ${sb.casa.nome} (${sb.casa.odd})`);
                console.log(`   🏢 Empate: ${sb.empate.nome} (${sb.empate.odd})`);
                console.log(`   🏢 Fora: ${sb.fora.nome} (${sb.fora.odd})`);
                console.log(`   💵 Investimento:`);
                console.log(`      Casa: R$ ${sb.investimento.casa.toFixed(2)}`);
                console.log(`      Empate: R$ ${sb.investimento.empate.toFixed(2)}`);
                console.log(`      Fora: R$ ${sb.investimento.fora.toFixed(2)}`);
            } else { // Mercado binário
                console.log(`   🏢 ${sb.opcao1.tipo}: ${sb.opcao1.nome} (${sb.opcao1.odd})`);
                console.log(`   🏢 ${sb.opcao2.tipo}: ${sb.opcao2.nome} (${sb.opcao2.odd})`);
                console.log(`   💵 Investimento:`);
                console.log(`      ${sb.opcao1.tipo}: R$ ${sb.investimento.opcao1.toFixed(2)}`);
                console.log(`      ${sb.opcao2.tipo}: R$ ${sb.investimento.opcao2.toFixed(2)}`);
            }
            console.log('   ' + '-'.repeat(50));
        });
    }
    
    // Salva resultados
    const resultado = {
        timestamp: Date.now(),
        totalSurebets: todasSurebets.length,
        surebets: todasSurebets
    };
    
    fs.writeFileSync(`surebets_todos_mercados_${Date.now()}.json`, JSON.stringify(resultado, null, 2));
    
    return resultado;
}

// ============================================
// 7. EXECUTAR
// ============================================
const arquivos = fs.readdirSync('./dados')
    .filter(f => f.startsWith('odds_') && f.endsWith('.json'))
    .map(f => ({
        nome: f,
        data: fs.statSync(`./dados/${f}`).mtime
    }))
    .sort((a, b) => b.data - a.data);

if (arquivos.length > 0) {
    processarArquivoOdds(`./dados/${arquivos[0].nome}`);
} else {
    console.log('❌ Nenhum arquivo de odds encontrado');
}