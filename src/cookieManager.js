// ============================================
// 🍪 GERENCIADOR AUTOMÁTICO DE COOKIES
// ============================================

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class CookieManager {
    constructor() {
        this.cookiesPath = path.join(__dirname, '../.cookies');
        this.ports = [];
        this.ensureDirectoryExists();
    }

    ensureDirectoryExists() {
        if (!fs.existsSync(this.cookiesPath)) {
            fs.mkdirSync(this.cookiesPath, { recursive: true });
        }
    }

    // Inicia o CookieMonster para uma casa específica
    async iniciarCookieMonster(casa, numBrowsers = 3) {
        console.log(`🍪 Iniciando CookieMonster para ${casa} com ${numBrowsers} browsers...`);
        
        // O CookieMonster gerencia browsers stealth em portas diferentes [citation:5]
        const processo = spawn('python3', [
            'start.py', 
            '--num_parallel', numBrowsers.toString(),
            '--base_port', this.getBasePort(casa)
        ]);
        
        processo.stdout.on('data', (data) => {
            console.log(`[CookieMonster-${casa}] ${data}`);
        });
        
        // Aguarda os browsers ficarem prontos
        await this.aguardarBrowsersProntos(casa);
    }

    getBasePort(casa) {
        const portMap = {
            '1xbet': 8010,
            'betano': 8020,
            'betfair': 8030,
            'sportingbet': 8040,
            'novibet': 8050,
            'superbet': 8060
        };
        return portMap[casa] || 8010;
    }

    async aguardarBrowsersProntos(casa) {
        // Aguarda até que o arquivo de portas seja criado
        const portFile = path.join(this.cookiesPath, `${casa}_ports.json`);
        let tentativas = 0;
        
        while (tentativas < 30) {
            if (fs.existsSync(portFile)) {
                const portData = JSON.parse(fs.readFileSync(portFile, 'utf8'));
                this.ports = portData.ports || [];
                console.log(`✅ ${casa}: ${this.ports.length} browsers prontos`);
                return true;
            }
            await this.sleep(1000);
            tentativas++;
        }
        throw new Error(`Timeout aguardando browsers do ${casa}`);
    }

    // Pega cookies frescos de um browser aleatório [citation:5]
    async pegarCookiesFrescos(casa) {
        if (this.ports.length === 0) {
            throw new Error(`Nenhum browser disponível para ${casa}`);
        }
        
        // Escolhe uma porta aleatória (round-robin)
        const port = this.ports[Math.floor(Math.random() * this.ports.length)];
        const cookieFile = path.join(this.cookiesPath, `${casa}_cookie_${port}.json`);
        
        // O CookieMonster salva cookies em arquivos JSON [citation:5]
        if (fs.existsSync(cookieFile)) {
            return JSON.parse(fs.readFileSync(cookieFile, 'utf8'));
        }
        
        return null;
    }

    // Mata todos os browsers
    matarTodos() {
        spawn('python3', ['start.py', '--kill']);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = CookieManager;
