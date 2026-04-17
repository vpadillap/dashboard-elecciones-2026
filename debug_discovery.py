import asyncio
import httpx

BASE_URL = "https://resultadoelectoral.onpe.gob.pe/presentacion-backend"
ID_ELECCION = "10"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://resultadoelectoral.onpe.gob.pe",
    "Referer": "https://resultadoelectoral.onpe.gob.pe/"
}

async def debug_discovery():
    async with httpx.AsyncClient(headers=HEADERS, timeout=10.0) as client:
        # Test Departments
        url = f"{BASE_URL}/ubigeos/departamentos?idEleccion={ID_ELECCION}&idAmbitoGeografico=1"
        print(f"Testing URL: {url}")
        try:
            res = await client.get(url)
            print(f"Status: {res.status_code}")
            print(f"Response: {res.text[:200]}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_discovery())
