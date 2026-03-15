# ============================================
# 🍪 COOKIEMONSTER - GERENCIADOR DE BROWSERS STEALTH
# ============================================

import asyncio
import json
import os
from playwright.async_api import async_playwright
import argparse
import time

class CookieMonster:
    def __init__(self, name, num_browsers=3, base_port=8010):
        self.name = name
        self.num_browsers = num_browsers
        self.base_port = base_port
        self.browsers = []
        self.cookie_dir = f".cookies/{name}"
        os.makedirs(self.cookie_dir, exist_ok=True)
        
    async def iniciar_browser(self, port):
        """Inicia um browser stealth com Playwright [citation:7]"""
        playwright = await async_playwright().start()
        
        # Configurações para parecer um browser real [citation:5]
        browser = await playwright.chromium.launch(
            headless=True,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        )
        
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
        )
        
        return {
            'playwright': playwright,
            'browser': browser,
            'context': context,
            'port': port
        }
    
    async def capturar_cookies(self, browser_info):
        """Captura cookies frescos do browser [citation:3]"""
        try:
            page = await browser_info['context'].new_page()
            
            # Define qual site acessar baseado no nome
            urls = {
                '1xbet': 'https://1xbet.bet.br',
                'betano': 'https://www.betano.bet.br',
                'betfair': 'https://www.betfair.bet.br',
                'sportingbet': 'https://www.sportingbet.bet.br',
                'novibet': 'https://www.novibet.bet.br',
                'superbet': 'https://superbet.bet.br'
            }
            
            url = urls.get(self.name, urls['sportingbet'])
            print(f"🌐 Acessando {url}...")
            
            # Navega para o site
            await page.goto(url, wait_until='networkidle')
            
            # Aguarda um pouco para carregar tudo
            await page.wait_for_timeout(5000)
            
            # Pega os cookies [citation:3]
            cookies = await page.context.cookies()
            
            # Salva em arquivo
            cookie_file = f"{self.cookie_dir}/cookie_{browser_info['port']}.json"
            with open(cookie_file, 'w') as f:
                json.dump({
                    'timestamp': time.time(),
                    'cookies': cookies,
                    'url': url
                }, f, indent=2)
            
            print(f"✅ Cookies salvos em {cookie_file}")
            
            await page.close()
            return cookies
            
        except Exception as e:
            print(f"❌ Erro capturando cookies: {e}")
            return None
    
    async def manter_cookies_frescos(self):
        """Mantém os cookies sempre frescos, reiniciando periodicamente [citation:5]"""
        print(f"🍪 Iniciando CookieMonster para {self.name}")
        
        # Inicia os browsers
        for i in range(self.num_browsers):
            port = self.base_port + i
            browser_info = await self.iniciar_browser(port)
            self.browsers.append(browser_info)
            
            # Captura cookies iniciais
            await self.capturar_cookies(browser_info)
        
        # Salva informações das portas
        with open(f"{self.cookie_dir}/ports.json", 'w') as f:
            json.dump({
                'ports': [self.base_port + i for i in range(self.num_browsers)]
            }, f)
        
        # Loop principal - recaptura cookies periodicamente [citation:5]
        while True:
            await asyncio.sleep(3600)  # 1 hora
            
            for browser_info in self.browsers:
                print(f"🔄 Renovando cookies na porta {browser_info['port']}...")
                await self.capturar_cookies(browser_info)
    
    async def cleanup(self):
        """Limpa tudo ao finalizar"""
        for browser_info in self.browsers:
            await browser_info['context'].close()
            await browser_info['browser'].close()
            await browser_info['playwright'].stop()

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--name', required=True, help='Nome da casa (1xbet, betano, etc)')
    parser.add_argument('--num_browsers', type=int, default=3, help='Número de browsers')
    parser.add_argument('--base_port', type=int, default=8010, help='Porta base')
    
    args = parser.parse_args()
    
    monster = CookieMonster(args.name, args.num_browsers, args.base_port)
    
    try:
        await monster.manter_cookies_frescos()
    except KeyboardInterrupt:
        await monster.cleanup()

if __name__ == '__main__':
    asyncio.run(main())
