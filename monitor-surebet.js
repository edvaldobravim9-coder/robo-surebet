// ============================================
// 🎯 MONITOR CONTÍNUO DE SUREBETS
// ============================================

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configurações
const CONFIG = {
    intervalo: 60000,  // 60 segundos entre cada verificação
    lucroMinimo: 1.0,  // só mostra surebets com lucro >= 1%
    historicoPath: './historico_surebets.json'
};

// Cache para evitar repetir notificações
let ultimasSurebets = [];
let historico = {};

// ============================================
// 🏥 HEALTH CHECK DAS CASAS
// ============================================
function verificarCasas(dados) {
    const status = {
        '1xBet': { ativa: false, jogos: 0 },
        'Betano': { ativa: false, jogos: 0 },
        'Betfair': { ativa: false, jogos: 0 },
        'Sportingbet': { ativa: false, jogos: 0 },
        'Novibet': { ativa: false, jogos: 0 },
        'Superbet': { ativa: false, jogos: 0 },
        timestamp: Date.now()
    };
    
    // Conta jogos de cada casa
    if (dados['1xbet']?.length > 0) {
        status['1xBet'].ativa = true;
        status['1xBet'].jogos = dados['1xbet'].length;
    }
    if (dados['betano']?.length > 0) {
        status['Betano'].ativa = true;
        status['Betano'].jogos = dados['betano'].length;
    }
    if (dados['betfair']?.length > 0) {
        status['Betfair'].ativa = true;
        status['Betfair'].jogos = dados['betfair'].length;
    }
    if (dados['sportingbet']?.length > 0) {
        status['Sportingbet'].ativa = true;
        status['Sportingbet'].jogos = dados['sportingbet'].length;
    }
    if (dados['novibet'] && typeof dados['novibet'] === 'object') {
        status['Novibet'].ativa = true;
        status['Novibet'].jogos = 1;
    }
    if (dados['superbet']?.length > 0) {
        status['Superbet'].ativa = true;
        status['Superbet'].jogos = dados['superbet'].length;
    }
    
    return status;
}

// ============================================
// 🔍 EXTRAIR NOMES DOS TIMES
// ============================================
function extrairNomesTimes(jogo, casa) {
    try {
        switch(casa) {
            case '1xBet':
                return {
                    timeCasa: jogo.timeCasa || jogo.O1,
                    timeFora: jogo.timeFora || jogo.O2
                };
            
            case 'Betano':
                return {
                    timeCasa: jogo.participants?.[0]?.name || jogo.timeCasa,
                    timeFora: jogo.participants?.[1]?.name || jogo.timeFora
                };
            
            case 'Betfair':
                // Adaptar conforme estrutura da Betfair
                return {
                    timeCasa: jogo.homeTeam,
                    timeFora: jogo.awayTeam
                };
            
            case 'Sportingbet':
                return {
                    timeCasa: jogo.data?.fixture?.participants?.[0]?.name,
                    timeFora: jogo.data?.fixture?.participants?.[1]?.name
                };
            
            case 'Novibet':
                return {
                    timeCasa: jogo.additionalCaptions?.competitor1,
                    timeFora: jogo.additionalCaptions?.competitor2
                };
            
            case 'Superbet':
                // Adaptar conforme estrutura da Superbet
                return {
                    timeCasa: jogo.homeTeam,
                    timeFora: jogo.awayTeam
                };
            
            default:
                return { timeCasa: null, timeFora: null };
        }
    } catch (e) {
        return { timeCasa: null, timeFora: null };
    }
}

// ============================================
// 📊 EXTRAIR ODDS 1X2
// ============================================
function extrairOdds1X2(dados) {
    const resultados = [];
    
    // 1xBet
    if (dados['1xbet']) {
        dados['1xbet'].forEach(jogo => {
            try {
                if (jogo.odds?.Value?.GE) {
                    const mercado = jogo.odds.Value.GE.find(m => m.G === 1);
                    if (mercado) {
                        resultados.push({
                            casa: '1xBet',
                            id: jogo.id,
                            timeCasa: jogo.timeCasa,
                            timeFora: jogo.timeFora,
                            odds: {
                                casa: mercado.E[0]?.[0]?.C || 0,
                                empate: mercado.E[1]?.[0]?.C || 0,
                                fora: mercado.E[2]?.[0]?.C || 0
                            },
                            dados: jogo,
                            timestamp: Date.now()
                        });
                    }
                }
            } catch (e) {}
        });
    }
    
    // Betano
    if (dados.betano && Array.isArray(dados.betano)) {
        dados.betano.forEach(item => {
            try {
                if (item.id && item.timeCasa) {
                    resultados.push({
                        casa: 'Betano',
                        id: item.id,
                        timeCasa: item.timeCasa,
                        timeFora: item.timeFora,
                        odds: {
                            casa: item.odds?.casa || 0,
                            empate: item.odds?.empate || 0,
                            fora: item.odds?.fora || 0
                        },
                        dados: item,
                        timestamp: Date.now()
                    });
                }
            } catch (e) {}
        });
    }
    
    // Betfair
    if (dados.betfair && dados.betfair[0]?.data?.data?.football) {
        // Adaptar conforme estrutura da Betfair
    }
    
    // Sportingbet
    if (dados.sportingbet && Array.isArray(dados.sportingbet)) {
        dados.sportingbet.forEach(jogo => {
            try {
                if (jogo.data?.fixture?.markets) {
                    const mercado1x2 = jogo.data.fixture.markets.find(m => 
                        m.name?.includes('Resultado') || m.name?.includes('Vencedor')
                    );
                    if (mercado1x2) {
                        resultados.push({
                            casa: 'Sportingbet',
                            id: jogo.jogoId,
                            timeCasa: jogo.data.fixture.participants?.[0]?.name,
                            timeFora: jogo.data.fixture.participants?.[1]?.name,
                            odds: {
                                casa: mercado1x2.outcomes?.find(o => o.type === 'Home')?.odds || 0,
                                empate: mercado1x2.outcomes?.find(o => o.type === 'Draw')?.odds || 0,
                                fora: mercado1x2.outcomes?.find(o => o.type === 'Away')?.odds || 0
                            },
                            dados: jogo,
                            timestamp: Date.now()
                        });
                    }
                }
            } catch (e) {}
        });
    }
    
    // Novibet
    if (dados.novibet && typeof dados.novibet === 'object') {
        try {
            const betViews = dados.novibet.betViews || [];
            betViews.forEach(view => {
                view.competitions?.forEach(comp => {
                    comp.events?.forEach(event => {
                        event.markets?.forEach(market => {
                            if (market.betTypeSysname === 'SOCCER_MATCH_RESULT') {
                                const odds = {};
                                market.betItems?.forEach(item => {
                                    if (item.code === '1') odds.casa = item.price;
                                    if (item.code === 'X') odds.empate = item.price;
                                    if (item.code === '2') odds.fora = item.price;
                                });
                                
                                resultados.push({
                                    casa: 'Novibet',
                                    id: event.betContextId,
                                    timeCasa: event.additionalCaptions?.competitor1,
                                    timeFora: event.additionalCaptions?.competitor2,
                                    odds,
                                    dados: event,
                                    timestamp: Date.now()
                                });
                            }
                        });
                    });
                });
            });
        } catch (e) {}
    }
    
    // Superbet
    if (dados.superbet && Array.isArray(dados.superbet)) {
        dados.superbet.forEach(item => {
            try {
                if (item.data?.markets) {
                    const mercado = item.data.markets.find(m => m.name === 'Resultado Final');
                    if (mercado) {
                        const odds = {};
                        mercado.odds?.forEach(o => {
                            if (o.name === '1') odds.casa = o.price;
                            if (o.name === 'X') odds.empate = o.price;
                            if (o.name === '2') odds.fora = o.price;
                        });
                        
                        resultados.push({
                            casa: 'Superbet',
                            id: item.id,
                            timeCasa: 'Time Casa', // Adaptar
                            timeFora: 'Time Fora', // Adaptar
                            odds,
                            dados: item,
                            timestamp: Date.now()
                        });
                    }
                }
            } catch (e) {}
        });
    }
    
    return resultados;
}

// ============================================
// 🔄 NORMALIZAR NOMES DE TIMES
// ============================================
function normalizarTime(nome) {
    if (!nome) return '';
    return nome.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
}

// ============================================
// 📊 AGRUPAR JOGOS IGUAIS
// ============================================
function agruparJogos(odds) {
    const grupos = {};
    
    odds.forEach(jogo => {
        if (!jogo.odds?.casa || !jogo.odds?.fora) return;
        if (jogo.odds.casa < 1.1 || jogo.odds.casa > 15) return;
        
        const timeCasa = jogo.timeCasa || 'Time Casa';
        const timeFora = jogo.timeFora || 'Time Fora';
        
        const chave = `${normalizarTime(timeCasa)}-${normalizarTime(timeFora)}`;
        if (!grupos[chave]) {
            grupos[chave] = {
                jogos: [],
                timeCasa: timeCasa,
                timeFora: timeFora
            };
        }
        grupos[chave].jogos.push(jogo);
    });
    
    return grupos;
}

// ============================================
// 💰 CALCULAR SUREBET
// ============================================
function calcularSurebet(grupo) {
    const jogos = grupo.jogos;
    if (jogos.length < 2) return null;
    
    // Verifica se são casas diferentes
    const casasUnicas = new Set(jogos.map(j => j.casa)).size;
    if (casasUnicas < 2) return null;
    
    const melhorCasa = Math.max(...jogos.map(j => j.odds.casa));
    const melhorEmpate = Math.max(...jogos.map(j => j.odds.empate || 0));
    const melhorFora = Math.max(...jogos.map(j => j.odds.fora));
    
    const temEmpate = melhorEmpate > 0;
    const soma = temEmpate ? 
        1/melhorCasa + 1/melhorEmpate + 1/melhorFora : 
        1/melhorCasa + 1/melhorFora;
    
    if (soma >= 1) return null;
    
    const lucro = ((1 / soma) - 1) * 100;
    if (lucro < CONFIG.lucroMinimo) return null;
    
    const base = 100 / soma;
    
    // Encontra as casas de cada odd
    const casaCasa = jogos.find(j => j.odds.casa === melhorCasa)?.casa;
    const casaEmpate = temEmpate ? jogos.find(j => j.odds.empate === melhorEmpate)?.casa : null;
    const casaFora = jogos.find(j => j.odds.fora === melhorFora)?.casa;
    
    return {
        jogo: `${grupo.timeCasa} x ${grupo.timeFora}`,
        odds: {
            casa: melhorCasa,
            empate: temEmpate ? melhorEmpate : null,
            fora: melhorFora
        },
        casas: {
            casa: casaCasa,
            empate: casaEmpate,
            fora: casaFora
        },
        lucro: lucro.toFixed(2),
        investimento: {
            casa: (base * (1/melhorCasa)).toFixed(2),
            empate: temEmpate ? (base * (1/melhorEmpate)).toFixed(2) : null,
            fora: (base * (1/melhorFora)).toFixed(2),
            total: base.toFixed(2)
        },
        timestamp: Date.now(),
        id: `${normalizarTime(grupo.timeCasa)}-${normalizarTime(grupo.timeFora)}`
    };
}

// ============================================
// 🔔 VERIFICAR MUDANÇAS
// ============================================
function verificarMudancas(novasSurebets) {
    const mudancas = [];
    
    const novoMapa = {};
    novasSurebets.forEach(s => novoMapa[s.id] = s);
    
    ultimasSurebets.forEach(s => {
        if (!novoMapa[s.id]) {
            mudancas.push({
                tipo: '❌ SUMIU',
                surebet: s
            });
        }
    });
    
    novasSurebets.forEach(s => {
        const antiga = ultimasSurebets.find(u => u.id === s.id);
        if (!antiga) {
            mudancas.push({
                tipo: '🎯 NOVA',
                surebet: s
            });
        } else if (antiga.lucro !== s.lucro) {
            mudancas.push({
                tipo: '📊 ODDS MUDARAM',
                antes: antiga,
                depois: s
            });
        }
    });
    
    return mudancas;
}

// ============================================
// 📢 MOSTRAR NOTIFICAÇÃO
// ============================================
function mostrarNotificacao(mudanca) {
    const sb = mudanca.surebet || mudanca.depois;
    
    console.log('\n' + '🔔'.repeat(10));
    console.log(`${mudanca.tipo}`);
    console.log('🔔'.repeat(10));
    console.log(`⚔️  ${sb.jogo}`);
    console.log(`💰 Lucro: ${sb.lucro}%`);
    console.log(`🎲 Odds: ${sb.odds.casa.toFixed(2)} | ${sb.odds.empate?.toFixed(2) || '---'} | ${sb.odds.fora.toFixed(2)}`);
    console.log(`🏢 Casas:`);
    console.log(`   Casa: ${sb.casas.casa} (R$ ${sb.investimento.casa})`);
    if (sb.casas.empate) console.log(`   Empate: ${sb.casas.empate} (R$ ${sb.investimento.empate})`);
    console.log(`   Fora: ${sb.casas.fora} (R$ ${sb.investimento.fora})`);
    console.log('🔔'.repeat(10) + '\n');
}

// ============================================
// 🚀 MONITOR PRINCIPAL
// ============================================
async function monitorar() {
    console.log('🎯 MONITOR CONTÍNUO DE SUREBETS INICIADO');
    console.log(`⏱️  Verificando a cada ${CONFIG.intervalo/1000} segundos\n`);
    
    // Carrega histórico se existir
    if (fs.existsSync(CONFIG.historicoPath)) {
        historico = JSON.parse(fs.readFileSync(CONFIG.historicoPath, 'utf8'));
    }
    
    while (true) {
        try {
            console.log('🔄 Buscando novas odds...');
            
            exec('node src/robo.js', async (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Erro ao executar robô:', error);
                    return;
                }
                
                // Encontra o arquivo mais recente
                const arquivos = fs.readdirSync('./dados')
                    .filter(f => f.startsWith('odds_') && f.endsWith('.json'))
                    .map(f => ({
                        nome: f,
                        data: fs.statSync(`./dados/${f}`).mtime
                    }))
                    .sort((a, b) => b.data - a.data);
                
                if (arquivos.length === 0) {
                    console.log('⚠️ Nenhum arquivo de odds encontrado');
                    return;
                }
                
                // Carrega os dados
                const dados = JSON.parse(fs.readFileSync(`./dados/${arquivos[0].nome}`, 'utf8'));
                
                // 🏥 MOSTRA STATUS DAS CASAS
                const status = verificarCasas(dados);
                console.log('\n🏥 STATUS DAS CASAS:');
                Object.entries(status).forEach(([casa, info]) => {
                    if (casa !== 'timestamp') {
                        const icone = info.ativa ? '✅' : '❌';
                        console.log(`${icone} ${casa}: ${info.jogos} jogos`);
                    }
                });
                console.log('');
                
                // Extrai odds
                const odds = extrairOdds1X2(dados);
                
                // Agrupa e calcula surebets
                const grupos = agruparJogos(odds);
                const novasSurebets = [];
                
                for (const [_, grupo] of Object.entries(grupos)) {
                    const sb = calcularSurebet(grupo);
                    if (sb) novasSurebets.push(sb);
                }
                
                // Ordena por lucro
                novasSurebets.sort((a, b) => parseFloat(b.lucro) - parseFloat(a.lucro));
                
                // Verifica mudanças
                const mudancas = verificarMudancas(novasSurebets);
                
                // Mostra mudanças
                if (mudancas.length > 0) {
                    mudancas.forEach(m => mostrarNotificacao(m));
                    
                    // Salva no histórico
                    mudancas.forEach(m => {
                        const id = m.surebet?.id || m.depois?.id;
                        if (id) {
                            if (!historico[id]) historico[id] = [];
                            historico[id].push({
                                timestamp: Date.now(),
                                tipo: m.tipo,
                                lucro: m.surebet?.lucro || m.depois?.lucro
                            });
                        }
                    });
                    
                    fs.writeFileSync(CONFIG.historicoPath, JSON.stringify(historico, null, 2));
                } else {
                    console.log('⏳ Nenhuma mudança detectada');
                }
                
                // Atualiza cache
                ultimasSurebets = novasSurebets;
                
                console.log(`✅ Verificação concluída - ${novasSurebets.length} surebets ativas\n`);
            });
            
        } catch (err) {
            console.error('❌ Erro no monitor:', err.message);
        }
        
        // Aguarda o próximo ciclo
        await new Promise(resolve => setTimeout(resolve, CONFIG.intervalo));
    }
}

// ============================================
// 🏁 INICIAR MONITOR
// ============================================
monitorar();