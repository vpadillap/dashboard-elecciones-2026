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

async def debug_departments():
    async with httpx.AsyncClient(headers=HEADERS, timeout=15.0, verify=False) as client:
        # Test Peru Departments
        url = f"{BASE_URL}/ubigeos/departamentos?idEleccion={ID_ELECCION}&idAmbitoGeografico=1"
        print(f"Testing URL: {url}")
        try:
            res = await client.get(url)
            print(f"Status Code: {res.status_code}")
            print(f"Headers: {dict(res.headers)}")
            print(f"Response Body (First 500 chars): {res.text[:500]}")
            if res.status_code == 200:
                data = res.json()
                print(f"Success key: {data.get('success')}")
                print(f"Data count: {len(data.get('data', []))}")
        except Exception as e:
            print(f"Exception: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(debug_departments())
