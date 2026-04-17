import asyncio
from playwright.async_api import async_playwright
import json

async def main():
    with open('network_log.txt', 'w') as f:
        pass
        
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        async def on_response(response):
            if response.request.resource_type in ["fetch", "xhr"]:
                try:
                    data = await response.json()
                    with open('network_log.txt', 'a', encoding='utf-8') as f:
                        f.write(f"URL: {response.url}\n")
                        f.write(json.dumps(data)[:200] + "...\n")
                        f.write("-" * 50 + "\n")
                except Exception:
                    with open('network_log.txt', 'a', encoding='utf-8') as f:
                        f.write(f"URL (No JSON): {response.url}\n")
                        f.write("-" * 50 + "\n")

        page.on("response", on_response)
        
        print("Navigating...")
        await page.goto("https://resultadoelectoral.onpe.gob.pe/main/presidenciales", wait_until="networkidle")
        await asyncio.sleep(5)
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
