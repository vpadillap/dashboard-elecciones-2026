import asyncio
import httpx

BASE_URL = "https://resultadoelectoral.onpe.gob.pe/presentacion-backend"
ID_ELECCION = "10"

# Headers exactly as captured from the browser
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "Origin": "https://resultadoelectoral.onpe.gob.pe",
    "Referer": "https://resultadoelectoral.onpe.gob.pe/main/presidenciales",
    "Sec-CH-UA": '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
    "Sec-CH-UA-Mobile": "?0",
    "Sec-CH-UA-Platform": '"Windows"',
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
}

# Example cookie from capture (might expire, but good for testing)
COOKIES = {
    "_ga": "GA1.1.1037448659.1776179367",
    "_ga_7X9XC2V582": "GS2.1.s1776258737$o5$g1$t1776259851$j58$l0$h1864381952"
}

async def debug_fix():
    async with httpx.AsyncClient(headers=HEADERS, cookies=COOKIES, timeout=15.0, verify=False) as client:
        url = f"{BASE_URL}/ubigeos/departamentos?idEleccion={ID_ELECCION}&idAmbitoGeografico=1"
        print(f"Testing URL with revised headers: {url}")
        try:
            res = await client.get(url)
            print(f"Status Code: {res.status_code}")
            content_type = res.headers.get('Content-Type', '')
            print(f"Content-Type: {content_type}")
            
            if 'application/json' in content_type:
                data = res.json()
                print(f"SUCCESS! Received JSON. Count: {len(data.get('data', []))}")
                print(f"Sample: {data.get('data', [])[:2]}")
            else:
                print(f"FAILURE! Still received {content_type}")
                print(f"Body snippet: {res.text[:200]}")
        except Exception as e:
            print(f"Exception: {e}")

if __name__ == "__main__":
    asyncio.run(debug_fix())
