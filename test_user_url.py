import asyncio
import httpx

# User's confirmed working URL:
# https://resultadoelectoral.onpe.gob.pe/presentacion-backend/ubigeos/provincias?idEleccion=10&idAmbitoGeografico=1&idUbigeoDepartamento=010000

BASE_URL = "https://resultadoelectoral.onpe.gob.pe/presentacion-backend"
ID_ELECCION = "10"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Origin": "https://resultadoelectoral.onpe.gob.pe",
    "Referer": "https://resultadoelectoral.onpe.gob.pe/main/presidenciales"
}

async def test_user_url():
    async with httpx.AsyncClient(headers=HEADERS, timeout=15.0, verify=False) as client:
        # 1. Test the PROVINCIAS URL the user says works
        url_prov = f"{BASE_URL}/ubigeos/provincias?idEleccion={ID_ELECCION}&idAmbitoGeografico=1&idUbigeoDepartamento=010000"
        print(f"Testing PROVINCIAS URL: {url_prov}")
        res_prov = await client.get(url_prov)
        print(f"Status Prov: {res_prov.status_code}")
        print(f"Content-Type Prov: {res_prov.headers.get('Content-Type')}")
        if 'json' in res_prov.headers.get('Content-Type', '').lower():
            print("SUCCESS on Provincias!")
        else:
            print("FAILED on Provincias (HTML received)")
            print(f"Body: {res_prov.text[:100]}")

        # 2. Test the DEPARTAMENTOS URL again
        url_dep = f"{BASE_URL}/ubigeos/departamentos?idEleccion={ID_ELECCION}&idAmbitoGeografico=1"
        print(f"\nTesting DEPARTAMENTOS URL: {url_dep}")
        res_dep = await client.get(url_dep)
        print(f"Status Dep: {res_dep.status_code}")
        print(f"Content-Type Dep: {res_dep.headers.get('Content-Type')}")
        if 'json' in res_dep.headers.get('Content-Type', '').lower():
            print("SUCCESS on Departamentos!")
        else:
            print("FAILED on Departamentos (HTML received)")
            print(f"Body: {res_dep.text[:100]}")

if __name__ == "__main__":
    asyncio.run(test_user_url())
