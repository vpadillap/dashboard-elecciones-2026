# Consideraciones adicionales

## Obtener el numero de actas impugnadas

Los datos relevantes son 'enviadasJee' (enviadas por impugnacion al Jurado electoral especial) y 'pendientesJEE' (pendientes de resolver)
En la llamada regular de distritos:
{
    "success": true,
    "message": "",
    "data": {
        "actasContabilizadas": 83.333,
        "contabilizadas": 10,
        "totalActas": 12,
        "participacionCiudadana": 32.678,
        "actasEnviadasJee": 8.333,
        "enviadasJee": 1,
        "actasPendientesJee": 8.334,
        "pendientesJee": 1,
        "fechaActualizacion": 1776271808754,
        "idUbigeoDepartamento": 140000,
        "idUbigeoProvincia": 140100,
        "idUbigeoDistrito": 140101,
        "idUbigeoDistritoElectoral": 15,
        "totalVotosEmitidos": 1131,
        "totalVotosValidos": 769,
        "porcentajeVotosEmitidos": 100,
        "porcentajeVotosValidos": 100
    }
}


## Como obtener el estado de las actas.

El ubigeo permite obtener el numero total de mesas de votacion.

### Ejemplo de llamada

https://resultadoelectoral.onpe.gob.pe/presentacion-backend/actas?pagina=0&tamanio=15&idAmbitoGeografico=1&idUbigeo=10205

Respuesta

{
    "success": true,
    "message": "",
    "data": {
        "paginaActual": 0,
        "totalRegistros": 360,
        "totalPaginas": 24,
        "content": [
            {
                "id": 22701020510,
                "idMesa": 227,
                "codigoMesa": "000227",
                "numeroCopia": "11",
                "idUbigeoEleccion": null,
                "idEleccion": 10,
                "idAmbitoGeografico": 1,
                "idUbigeo": 10205,
                "centroPoblado": null,
                "nombreLocalVotacion": null,
                "codigoLocalVotacion": null,
                "totalElectoresHabiles": null,
                "totalVotosEmitidos": null,
                "totalVotosValidos": null,
                "totalAsistentes": null,
                "porcentajeParticipacionCiudadana": null,
                "estadoActa": "D",
                "estadoComputo": "N",
                "codigoEstadoActa": "C",
                "descripcionEstadoActa": "Contabilizada",
                "detalle": null,
                "lineaTiempo": null
            },
            {
                "id": 22701020515,
                "idMesa": 227,
                "codigoMesa": "000227",
                "numeroCopia": "",
                "idUbigeoEleccion": null,
                "idEleccion": 15,
                "idAmbitoGeografico": 1,
                "idUbigeo": 10205,
                "centroPoblado": null,
                "nombreLocalVotacion": null,
                "codigoLocalVotacion": null,
                "totalElectoresHabiles": null,
                "totalVotosEmitidos": null,
                "totalVotosValidos": null,
                "totalAsistentes": null,
                "porcentajeParticipacionCiudadana": null,
                "estadoActa": "A",
                "estadoComputo": "N",
                "codigoEstadoActa": "E",
                "descripcionEstadoActa": "Para envío al JEE",
                "detalle": null,
                "lineaTiempo": null
            },
            {
                "id": 22701020514,
                "idMesa": 227,
                "codigoMesa": "000227",
                "numeroCopia": "",
                "idUbigeoEleccion": null,
                "idEleccion": 14,
                "idAmbitoGeografico": 1,
                "idUbigeo": 10205,
                "centroPoblado": null,
                "nombreLocalVotacion": null,
                "codigoLocalVotacion": null,
                "totalElectoresHabiles": null,
                "totalVotosEmitidos": null,
                "totalVotosValidos": null,
                "totalAsistentes": null,
                "porcentajeParticipacionCiudadana": null,
                "estadoActa": "A",
                "estadoComputo": "N",
                "codigoEstadoActa": "P",
                "descripcionEstadoActa": "Pendiente",
                "detalle": null,
                "lineaTiempo": null
            },
            {
                "id": 22701020513,
                "idMesa": 227,
                "codigoMesa": "000227",
                "numeroCopia": "",
                "idUbigeoEleccion": null,
                "idEleccion": 13,
                "idAmbitoGeografico": 1,
                "idUbigeo": 10205,
                "centroPoblado": null,
                "nombreLocalVotacion": null,
                "codigoLocalVotacion": null,
                "totalElectoresHabiles": null,
                "totalVotosEmitidos": null,
                "totalVotosValidos": null,
                "totalAsistentes": null,
                "porcentajeParticipacionCiudadana": null,
                "estadoActa": "A",
                "estadoComputo": "N",
                "codigoEstadoActa": "P",
                "descripcionEstadoActa": "Pendiente",
                "detalle": null,
                "lineaTiempo": null
            },
            {
                "id": 22701020512,
                "idMesa": 227,
                "codigoMesa": "000227",
                "numeroCopia": "",
                "idUbigeoEleccion": null,
                "idEleccion": 12,
                "idAmbitoGeografico": 1,
                "idUbigeo": 10205,
                "centroPoblado": null,
                "nombreLocalVotacion": null,
                "codigoLocalVotacion": null,
                "totalElectoresHabiles": null,
                "totalVotosEmitidos": null,
                "totalVotosValidos": null,
                "totalAsistentes": null,
                "porcentajeParticipacionCiudadana": null,
                "estadoActa": "A",
                "estadoComputo": "N",
                "codigoEstadoActa": "P",
                "descripcionEstadoActa": "Pendiente",
                "detalle": null,
                "lineaTiempo": null
            },
            {
                "id": 22801020510,
                "idMesa": 228,
                "codigoMesa": "000228",
                "numeroCopia": "12",
                "idUbigeoEleccion": null,
                "idEleccion": 10,
                "idAmbitoGeografico": 1,
                "idUbigeo": 10205,
                "centroPoblado": null,
                "nombreLocalVotacion": null,
                "codigoLocalVotacion": null,
                "totalElectoresHabiles": null,
                "totalVotosEmitidos": null,
                "totalVotosValidos": null,
                "totalAsistentes": null,
                "porcentajeParticipacionCiudadana": null,
                "estadoActa": "D",
                "estadoComputo": "N",
                "codigoEstadoActa": "C",
                "descripcionEstadoActa": "Contabilizada",
                "detalle": null,
                "lineaTiempo": null
            },
            {
                "id": 22801020515,
                "idMesa": 228,
                "codigoMesa": "000228",
                "numeroCopia": "",
                "idUbigeoEleccion": null,
                "idEleccion": 15,
                "idAmbitoGeografico": 1,
                "idUbigeo": 10205,
                "centroPoblado": null,
                "nombreLocalVotacion": null,
                "codigoLocalVotacion": null,
                "totalElectoresHabiles": null,
                "totalVotosEmitidos": null,
                "totalVotosValidos": null,
                "totalAsistentes": null,
                "porcentajeParticipacionCiudadana": null,
                "estadoActa": "A",
                "estadoComputo": "N",
                "codigoEstadoActa": "P",
                "descripcionEstadoActa": "Pendiente",
                "detalle": null,
                "lineaTiempo": null
            },
            {
                "id": 22801020514,
                "idMesa": 228,
                "codigoMesa": "000228",
                "numeroCopia": "",
                "idUbigeoEleccion": null,
                "idEleccion": 14,
                "idAmbitoGeografico": 1,
                "idUbigeo": 10205,
                "centroPoblado": null,
                "nombreLocalVotacion": null,
                "codigoLocalVotacion": null,
                "totalElectoresHabiles": null,
                "totalVotosEmitidos": null,
                "totalVotosValidos": null,
                "totalAsistentes": null,
                "porcentajeParticipacionCiudadana": null,
                "estadoActa": "A",
                "estadoComputo": "N",
                "codigoEstadoActa": "P",
                "descripcionEstadoActa": "Pendiente",
                "detalle": null,
                "lineaTiempo": null
            },
            {
                "id": 22801020513,
                "idMesa": 228,
                "codigoMesa": "000228",
                "numeroCopia": "",
                "idUbigeoEleccion": null,
                "idEleccion": 13,
                "idAmbitoGeografico": 1,
                "idUbigeo": 10205,
                "centroPoblado": null,
                "nombreLocalVotacion": null,
                "codigoLocalVotacion": null,
                "totalElectoresHabiles": null,
                "totalVotosEmitidos": null,
                "totalVotosValidos": null,
                "totalAsistentes": null,
                "porcentajeParticipacionCiudadana": null,
                "estadoActa": "A",
                "estadoComputo": "N",
                "codigoEstadoActa": "P",
                "descripcionEstadoActa": "Pendiente",
                "detalle": null,
                "lineaTiempo": null
            },
            {
                "id": 22801020512,
                "idMesa": 228,
                "codigoMesa": "000228",
                "numeroCopia": "",
                "idUbigeoEleccion": null,
                "idEleccion": 12,
                "idAmbitoGeografico": 1,
                "idUbigeo": 10205,
                "centroPoblado": null,
                "nombreLocalVotacion": null,
                "codigoLocalVotacion": null,
                "totalElectoresHabiles": null,
                "totalVotosEmitidos": null,
                "totalVotosValidos": null,
                "totalAsistentes": null,
                "porcentajeParticipacionCiudadana": null,
                "estadoActa": "A",
                "estadoComputo": "N",
                "codigoEstadoActa": "P",
                "descripcionEstadoActa": "Pendiente",
                "detalle": null,
                "lineaTiempo": null
            },
            {
                "id": 22901020510,
                "idMesa": 229,
                "codigoMesa": "000229",
                "numeroCopia": "06",
                "idUbigeoEleccion": null,
                "idEleccion": 10,
                "idAmbitoGeografico": 1,
                "idUbigeo": 10205,
                "centroPoblado": null,
                "nombreLocalVotacion": null,
                "codigoLocalVotacion": null,
                "totalElectoresHabiles": null,
                "totalVotosEmitidos": null,
                "totalVotosValidos": null,
                "totalAsistentes": null,
                "porcentajeParticipacionCiudadana": null,
                "estadoActa": "D",
                "estadoComputo": "N",
                "codigoEstadoActa": "C",
                "descripcionEstadoActa": "Contabilizada",
                "detalle": null,
                "lineaTiempo": null
            },
            {
                "id": 22901020515,
                "idMesa": 229,
                "codigoMesa": "000229",
                "numeroCopia": "",
                "idUbigeoEleccion": null,
                "idEleccion": 15,
                "idAmbitoGeografico": 1,
                "idUbigeo": 10205,
                "centroPoblado": null,
                "nombreLocalVotacion": null,
                "codigoLocalVotacion": null,
                "totalElectoresHabiles": null,
                "totalVotosEmitidos": null,
                "totalVotosValidos": null,
                "totalAsistentes": null,
                "porcentajeParticipacionCiudadana": null,
                "estadoActa": "A",
                "estadoComputo": "N",
                "codigoEstadoActa": "P",
                "descripcionEstadoActa": "Pendiente",
                "detalle": null,
                "lineaTiempo": null
            },
            {
                "id": 22901020514,
                "idMesa": 229,
                "codigoMesa": "000229",
                "numeroCopia": "79",
                "idUbigeoEleccion": null,
                "idEleccion": 14,
                "idAmbitoGeografico": 1,
                "idUbigeo": 10205,
                "centroPoblado": null,
                "nombreLocalVotacion": null,
                "codigoLocalVotacion": null,
                "totalElectoresHabiles": null,
                "totalVotosEmitidos": null,
                "totalVotosValidos": null,
                "totalAsistentes": null,
                "porcentajeParticipacionCiudadana": null,
                "estadoActa": "D",
                "estadoComputo": "N",
                "codigoEstadoActa": "C",
                "descripcionEstadoActa": "Contabilizada",
                "detalle": null,
                "lineaTiempo": null
            },
            {
                "id": 22901020513,
                "idMesa": 229,
                "codigoMesa": "000229",
                "numeroCopia": "",
                "idUbigeoEleccion": null,
                "idEleccion": 13,
                "idAmbitoGeografico": 1,
                "idUbigeo": 10205,
                "centroPoblado": null,
                "nombreLocalVotacion": null,
                "codigoLocalVotacion": null,
                "totalElectoresHabiles": null,
                "totalVotosEmitidos": null,
                "totalVotosValidos": null,
                "totalAsistentes": null,
                "porcentajeParticipacionCiudadana": null,
                "estadoActa": "A",
                "estadoComputo": "N",
                "codigoEstadoActa": "P",
                "descripcionEstadoActa": "Pendiente",
                "detalle": null,
                "lineaTiempo": null
            },
            {
                "id": 22901020512,
                "idMesa": 229,
                "codigoMesa": "000229",
                "numeroCopia": "",
                "idUbigeoEleccion": null,
                "idEleccion": 12,
                "idAmbitoGeografico": 1,
                "idUbigeo": 10205,
                "centroPoblado": null,
                "nombreLocalVotacion": null,
                "codigoLocalVotacion": null,
                "totalElectoresHabiles": null,
                "totalVotosEmitidos": null,
                "totalVotosValidos": null,
                "totalAsistentes": null,
                "porcentajeParticipacionCiudadana": null,
                "estadoActa": "A",
                "estadoComputo": "N",
                "codigoEstadoActa": "P",
                "descripcionEstadoActa": "Pendiente",
                "detalle": null,
                "lineaTiempo": null
            }
        ],
        "contabilizada": 220,
        "observada": 30,
        "pendiente": 110
    }
}

La respuesta proporciona el numero total de paginas navegables dice total 24 entonces puede ir de 0 al 23.
Es importante notar que solamente importan las actas con idEleccion 10

El 'codigoEstadoActa' puede indicar P (Pendiente), C (Contabilizada), o E(Para envio al JEE).

Luego otro punto a notar es que las actas no arrojan asi de simple el total de electores habiles. Sino que hay que llamar especificamente al acta mediante el id por ejemplo:

https://resultadoelectoral.onpe.gob.pe/presentacion-backend/actas/90002101020513

Lo que nos arroja no solamente esta data con los electores habiles del acta impugnada en 'totalElectoresHabiles' sino que ademas tambien nos devuelve resultados preliminares (los que han sido escritos pero estan impugnados)

{
    "success": true,
    "message": "",
    "data": {
        "id": 26001020510,
        "idMesa": null,
        "codigoMesa": "000260",
        "descripcionMesa": "000260",
        "idEleccion": 10,
        "ubigeoNivel01": "AMAZONAS",
        "ubigeoNivel02": "BAGUA",
        "ubigeoNivel03": "BAGUA",
        "centroPoblado": "",
        "nombreLocalVotacion": "IE TECNICO INDUSTRIAL BAGUA",
        "totalElectoresHabiles": 299,
        "totalVotosEmitidos": null,
        "totalVotosValidos": null,
        "totalAsistentes": null,
        "porcentajeParticipacionCiudadana": 0.0,
        "estadoActa": "I",
        "estadoComputo": "N",
        "codigoEstadoActa": "E",
        "descripcionEstadoActa": "Para envío al JEE",
        "estadoActaResolucion": "E",
        "estadoDescripcionActaResolucion": "Acta con error aritmético",
        "descripcionSubEstadoActa": null,
        "detalle": [
            {
                "descripcion": "ALIANZA ELECTORAL VENCEREMOS",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "ATENCIO",
                        "apellidoMaterno": "SOTOMAYOR",
                        "nombres": "RONALD DARWIN",
                        "cdocumentoIdentidad": "41373494"
                    }
                ],
                "ccodigo": "00000003",
                "nposicion": 1,
                "nvotos": 0,
                "nagrupacionPolitica": 3,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO PATRIÓTICO DEL PERÚ",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "CALLER",
                        "apellidoMaterno": "GUTIERREZ",
                        "nombres": "HERBERT",
                        "cdocumentoIdentidad": "43409673"
                    }
                ],
                "ccodigo": "00000024",
                "nposicion": 2,
                "nvotos": 0,
                "nagrupacionPolitica": 24,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO CÍVICO OBRAS",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "BELMONT",
                        "apellidoMaterno": "CASSINELLI",
                        "nombres": "RICARDO PABLO",
                        "cdocumentoIdentidad": "09177250"
                    }
                ],
                "ccodigo": "00000014",
                "nposicion": 3,
                "nvotos": 0,
                "nagrupacionPolitica": 14,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "FRENTE POPULAR AGRÍCOLA FÍA DEL PERÚ",
                "estado": 20,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [],
                "ccodigo": "00000006",
                "nposicion": 4,
                "nvotos": 0,
                "nagrupacionPolitica": 6,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO DEMÓCRATA VERDE",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "GONZALES",
                        "apellidoMaterno": "CASTILLO",
                        "nombres": "ALEX",
                        "cdocumentoIdentidad": "09307547"
                    }
                ],
                "ccodigo": "00000018",
                "nposicion": 5,
                "nvotos": 0,
                "nagrupacionPolitica": 18,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO DEL BUEN GOBIERNO",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "NIETO",
                        "apellidoMaterno": "MONTESINOS",
                        "nombres": "JORGE",
                        "cdocumentoIdentidad": "06506278"
                    }
                ],
                "ccodigo": "00000016",
                "nposicion": 6,
                "nvotos": 0,
                "nagrupacionPolitica": 16,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO POLÍTICO PERÚ ACCIÓN",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "DIEZ-CANSECO",
                        "apellidoMaterno": "TÁVARA",
                        "nombres": "FRANCISCO ERNESTO",
                        "cdocumentoIdentidad": "08263758"
                    }
                ],
                "ccodigo": "00000028",
                "nposicion": 7,
                "nvotos": 0,
                "nagrupacionPolitica": 28,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO POLÍTICO PRIN",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "CHIRINOS",
                        "apellidoMaterno": "PURIZAGA",
                        "nombres": "WALTER GILMER",
                        "cdocumentoIdentidad": "18870364"
                    }
                ],
                "ccodigo": "00000030",
                "nposicion": 8,
                "nvotos": 0,
                "nagrupacionPolitica": 30,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PROGRESEMOS",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "JAIMES",
                        "apellidoMaterno": "BLANCO",
                        "nombres": "PAUL DAVIS",
                        "cdocumentoIdentidad": "40139245"
                    }
                ],
                "ccodigo": "00000034",
                "nposicion": 9,
                "nvotos": 0,
                "nagrupacionPolitica": 34,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO SICREO",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "ESPA",
                        "apellidoMaterno": "Y GARCES-ALVEAR",
                        "nombres": "ALFONSO CARLOS",
                        "cdocumentoIdentidad": "10266270"
                    }
                ],
                "ccodigo": "00000031",
                "nposicion": 10,
                "nvotos": 0,
                "nagrupacionPolitica": 31,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO PAÍS PARA TODOS",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "ALVAREZ",
                        "apellidoMaterno": "LOAYZA",
                        "nombres": "CARLOS GONSALO",
                        "cdocumentoIdentidad": "06002034"
                    }
                ],
                "ccodigo": "00000023",
                "nposicion": 11,
                "nvotos": 0,
                "nagrupacionPolitica": 23,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO FRENTE DE LA ESPERANZA 2021",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "OLIVERA",
                        "apellidoMaterno": "VEGA",
                        "nombres": "LUIS FERNANDO",
                        "cdocumentoIdentidad": "06280714"
                    }
                ],
                "ccodigo": "00000021",
                "nposicion": 12,
                "nvotos": 0,
                "nagrupacionPolitica": 21,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO POLÍTICO NACIONAL PERÚ LIBRE",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "CERRON",
                        "apellidoMaterno": "ROJAS",
                        "nombres": "VLADIMIR ROY",
                        "cdocumentoIdentidad": "06466585"
                    }
                ],
                "ccodigo": "00000027",
                "nposicion": 13,
                "nvotos": 0,
                "nagrupacionPolitica": 27,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO CIUDADANOS POR EL PERÚ",
                "estado": 20,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [],
                "ccodigo": "00000013",
                "nposicion": 14,
                "nvotos": 0,
                "nagrupacionPolitica": 13,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PRIMERO LA GENTE – COMUNIDAD, ECOLOGÍA, LIBERTAD Y PROGRESO",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "PEREZ",
                        "apellidoMaterno": "TELLO",
                        "nombres": "MARIA SOLEDAD",
                        "cdocumentoIdentidad": "07867789"
                    }
                ],
                "ccodigo": "00000033",
                "nposicion": 15,
                "nvotos": 0,
                "nagrupacionPolitica": 33,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "JUNTOS POR EL PERÚ",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "SANCHEZ",
                        "apellidoMaterno": "PALOMINO",
                        "nombres": "ROBERTO HELBERT",
                        "cdocumentoIdentidad": "16002918"
                    }
                ],
                "ccodigo": "00000010",
                "nposicion": 16,
                "nvotos": 0,
                "nagrupacionPolitica": 10,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PODEMOS PERÚ",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "LUNA",
                        "apellidoMaterno": "GALVEZ",
                        "nombres": "JOSE LEON",
                        "cdocumentoIdentidad": "07246887"
                    }
                ],
                "ccodigo": "00000032",
                "nposicion": 17,
                "nvotos": 0,
                "nagrupacionPolitica": 32,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO DEMOCRATICO FEDERAL",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "MASSE",
                        "apellidoMaterno": "FERNANDEZ",
                        "nombres": "ARMANDO JOAQUIN",
                        "cdocumentoIdentidad": "08255194"
                    }
                ],
                "ccodigo": "00000019",
                "nposicion": 18,
                "nvotos": 0,
                "nagrupacionPolitica": 19,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "FE EN EL PERÚ",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "PAZ DE LA BARRA",
                        "apellidoMaterno": "FREIGEIRO",
                        "nombres": "ALVARO GONZALO",
                        "cdocumentoIdentidad": "41904418"
                    }
                ],
                "ccodigo": "00000005",
                "nposicion": 19,
                "nvotos": 0,
                "nagrupacionPolitica": 5,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO POLÍTICO INTEGRIDAD DEMOCRÁTICA",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "GROZO",
                        "apellidoMaterno": "COSTA",
                        "nombres": "WOLFGANG MARIO",
                        "cdocumentoIdentidad": "07260881"
                    }
                ],
                "ccodigo": "00000026",
                "nposicion": 20,
                "nvotos": 0,
                "nagrupacionPolitica": 26,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "FUERZA POPULAR",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "FUJIMORI",
                        "apellidoMaterno": "HIGUCHI",
                        "nombres": "KEIKO SOFIA",
                        "cdocumentoIdentidad": "10001088"
                    }
                ],
                "ccodigo": "00000008",
                "nposicion": 21,
                "nvotos": 0,
                "nagrupacionPolitica": 8,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "ALIANZA PARA EL PROGRESO",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "ACUÑA",
                        "apellidoMaterno": "PERALTA",
                        "nombres": "CESAR",
                        "cdocumentoIdentidad": "17903382"
                    }
                ],
                "ccodigo": "00000001",
                "nposicion": 22,
                "nvotos": 0,
                "nagrupacionPolitica": 1,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO POLÍTICO COOPERACIÓN POPULAR",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "LESCANO",
                        "apellidoMaterno": "ANCIETA",
                        "nombres": "YONHY",
                        "cdocumentoIdentidad": "01211014"
                    }
                ],
                "ccodigo": "00000025",
                "nposicion": 23,
                "nvotos": 0,
                "nagrupacionPolitica": 25,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "AHORA NACIÓN - AN",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "LOPEZ CHAU",
                        "apellidoMaterno": "NAVA",
                        "nombres": "PABLO ALFONSO",
                        "cdocumentoIdentidad": "25331980"
                    }
                ],
                "ccodigo": "00000002",
                "nposicion": 24,
                "nvotos": 0,
                "nagrupacionPolitica": 2,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "LIBERTAD POPULAR",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "BELAUNDE",
                        "apellidoMaterno": "LLOSA",
                        "nombres": "RAFAEL JORGE",
                        "cdocumentoIdentidad": "10219647"
                    }
                ],
                "ccodigo": "00000011",
                "nposicion": 25,
                "nvotos": 0,
                "nagrupacionPolitica": 11,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "UN CAMINO DIFERENTE",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "FERNANDEZ",
                        "apellidoMaterno": "BAZAN",
                        "nombres": "ROSARIO DEL PILAR",
                        "cdocumentoIdentidad": "18141156"
                    }
                ],
                "ccodigo": "00000037",
                "nposicion": 26,
                "nvotos": 0,
                "nagrupacionPolitica": 37,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "AVANZA PAÍS - PARTIDO DE INTEGRACIÓN SOCIAL",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "WILLIAMS",
                        "apellidoMaterno": "ZAPATA",
                        "nombres": "JOSE DANIEL",
                        "cdocumentoIdentidad": "43287528"
                    }
                ],
                "ccodigo": "00000007",
                "nposicion": 27,
                "nvotos": 0,
                "nagrupacionPolitica": 7,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PERÚ MODERNO",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "JAICO",
                        "apellidoMaterno": "CARRANZA",
                        "nombres": "CARLOS ERNESTO",
                        "cdocumentoIdentidad": "06529088"
                    }
                ],
                "ccodigo": "00000004",
                "nposicion": 28,
                "nvotos": 0,
                "nagrupacionPolitica": 4,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO POLÍTICO PERÚ PRIMERO",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "VIZCARRA",
                        "apellidoMaterno": "CORNEJO",
                        "nombres": "MARIO ENRIQUE",
                        "cdocumentoIdentidad": "04411300"
                    }
                ],
                "ccodigo": "00000029",
                "nposicion": 29,
                "nvotos": 0,
                "nagrupacionPolitica": 29,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "SALVEMOS AL PERÚ",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "ORTIZ",
                        "apellidoMaterno": "VILLANO",
                        "nombres": "ANTONIO",
                        "cdocumentoIdentidad": "08587486"
                    }
                ],
                "ccodigo": "00000036",
                "nposicion": 30,
                "nvotos": 0,
                "nagrupacionPolitica": 36,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO DEMOCRÁTICO SOMOS PERÚ",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "FORSYTH",
                        "apellidoMaterno": "SOMMER",
                        "nombres": "GEORGE PATRICK",
                        "cdocumentoIdentidad": "41265978"
                    }
                ],
                "ccodigo": "00000020",
                "nposicion": 31,
                "nvotos": 0,
                "nagrupacionPolitica": 20,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO APRISTA PERUANO",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "VALDERRAMA",
                        "apellidoMaterno": "PEÑA",
                        "nombres": "PITTER ENRIQUE",
                        "cdocumentoIdentidad": "43632186"
                    }
                ],
                "ccodigo": "00000012",
                "nposicion": 32,
                "nvotos": 0,
                "nagrupacionPolitica": 12,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "RENOVACIÓN POPULAR",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "LÓPEZ ALIAGA",
                        "apellidoMaterno": "CAZORLA",
                        "nombres": "RAFAEL BERNARDO",
                        "cdocumentoIdentidad": "07845838"
                    }
                ],
                "ccodigo": "00000035",
                "nposicion": 33,
                "nvotos": 0,
                "nagrupacionPolitica": 35,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO DEMÓCRATA UNIDO PERÚ",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "CARRASCO",
                        "apellidoMaterno": "SALAZAR",
                        "nombres": "CHARLIE",
                        "cdocumentoIdentidad": "40799023"
                    }
                ],
                "ccodigo": "00000017",
                "nposicion": 34,
                "nvotos": 0,
                "nagrupacionPolitica": 17,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "FUERZA Y LIBERTAD",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "MOLINELLI",
                        "apellidoMaterno": "ARISTONDO",
                        "nombres": "FIORELLA GIANNINA",
                        "cdocumentoIdentidad": "25681995"
                    }
                ],
                "ccodigo": "00000009",
                "nposicion": 35,
                "nvotos": 0,
                "nagrupacionPolitica": 9,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO DE LOS TRABAJADORES Y EMPRENDEDORES PTE - PERÚ",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "BECERRA",
                        "apellidoMaterno": "GARCIA",
                        "nombres": "NAPOLEON",
                        "cdocumentoIdentidad": "08058852"
                    }
                ],
                "ccodigo": "00000015",
                "nposicion": 36,
                "nvotos": 0,
                "nagrupacionPolitica": 15,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "UNIDAD NACIONAL",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "CHIABRA",
                        "apellidoMaterno": "LEON",
                        "nombres": "ROBERTO ENRIQUE",
                        "cdocumentoIdentidad": "40728264"
                    }
                ],
                "ccodigo": "00000038",
                "nposicion": 37,
                "nvotos": 0,
                "nagrupacionPolitica": 38,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "PARTIDO MORADO",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [
                    {
                        "apellidoPaterno": "GUEVARA",
                        "apellidoMaterno": "AMASIFUEN",
                        "nombres": "MESIAS ANTONIO",
                        "cdocumentoIdentidad": "09871134"
                    }
                ],
                "ccodigo": "00000022",
                "nposicion": 38,
                "nvotos": 0,
                "nagrupacionPolitica": 22,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "VOTOS EN BLANCO",
                "estado": 1,
                "grafico": 0,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [],
                "ccodigo": "80",
                "nposicion": 80,
                "nvotos": 0,
                "nagrupacionPolitica": 80,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "VOTOS NULOS",
                "estado": 1,
                "grafico": 0,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [],
                "ccodigo": "81",
                "nposicion": 81,
                "nvotos": 0,
                "nagrupacionPolitica": 81,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            },
            {
                "descripcion": "VOTOS IMPUGNADOS",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": [],
                "ccodigo": "82",
                "nposicion": 82,
                "nvotos": 0,
                "nagrupacionPolitica": 82,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null
            }
        ],
        "lineaTiempo": [
            {
                "codigoEstadoActa": "T",
                "descripcionEstadoActa": "Digitalización",
                "descripcionEstadoActaResolucion": null,
                "fechaRegistro": 1776054467000
            },
            {
                "codigoEstadoActa": "D",
                "descripcionEstadoActa": "Digitación",
                "descripcionEstadoActaResolucion": null,
                "fechaRegistro": 1776054712000
            },
            {
                "codigoEstadoActa": "H",
                "descripcionEstadoActa": "Observada",
                "descripcionEstadoActaResolucion": "Acta con error aritmético",
                "fechaRegistro": 1776054826000
            },
            {
                "codigoEstadoActa": "E",
                "descripcionEstadoActa": "Para envío al JEE",
                "descripcionEstadoActaResolucion": "Acta con error aritmético",
                "fechaRegistro": 1776089700000
            }
        ],
        "archivos": [],
        "codigoSolucionTecnologica": 3,
        "descripcionSolucionTecnologica": "Convencional"
    }
}

{
    "success": true,
    "message": "",
    "data": {
        "id": 90002101020513,
        "idMesa": null,
        "codigoMesa": "900021",
        "descripcionMesa": "900021",
        "idEleccion": 13,
        "ubigeoNivel01": "AMAZONAS",
        "ubigeoNivel02": "BAGUA",
        "ubigeoNivel03": "BAGUA",
        "centroPoblado": "PECA PALACIOS",
        "nombreLocalVotacion": "IE 16195 PECA PALACIOS",
        "totalElectoresHabiles": 154,
        "totalVotosEmitidos": null,
        "totalVotosValidos": null,
        "totalAsistentes": null,
        "porcentajeParticipacionCiudadana": 0.0,
        "estadoActa": "I",
        "estadoComputo": "N",
        "codigoEstadoActa": "E",
        "descripcionEstadoActa": "Para envío al JEE",
        "estadoActaResolucion": "E",
        "estadoDescripcionActaResolucion": "Acta con error aritmético",
        "descripcionSubEstadoActa": null,
        "detalle": [
            {
                "descripcion": "ALIANZA ELECTORAL VENCEREMOS",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 3,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000003",
                "nposicion": 1,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO PATRIÓTICO DEL PERÚ",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 3,
                "candidato": null,
                "nagrupacionPolitica": 24,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000024",
                "nposicion": 2,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO CÍVICO OBRAS",
                "estado": 20,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": null,
                "nagrupacionPolitica": 14,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000014",
                "nposicion": 3,
                "nvotos": 0
            },
            {
                "descripcion": "FRENTE POPULAR AGRÍCOLA FÍA DEL PERÚ",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 6,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000006",
                "nposicion": 4,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO DEMÓCRATA VERDE",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 3,
                "candidato": null,
                "nagrupacionPolitica": 18,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000018",
                "nposicion": 5,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO DEL BUEN GOBIERNO",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 16,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000016",
                "nposicion": 6,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO POLÍTICO PERÚ ACCIÓN",
                "estado": 20,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": null,
                "nagrupacionPolitica": 28,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000028",
                "nposicion": 7,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO POLÍTICO PRIN",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 30,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000030",
                "nposicion": 8,
                "nvotos": 0
            },
            {
                "descripcion": "PROGRESEMOS",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 3,
                "candidato": null,
                "nagrupacionPolitica": 34,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000034",
                "nposicion": 9,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO SICREO",
                "estado": 20,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": null,
                "nagrupacionPolitica": 31,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000031",
                "nposicion": 10,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO PAÍS PARA TODOS",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 1,
                "candidato": null,
                "nagrupacionPolitica": 23,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000023",
                "nposicion": 11,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO FRENTE DE LA ESPERANZA 2021",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 21,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000021",
                "nposicion": 12,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO POLÍTICO NACIONAL PERÚ LIBRE",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 2,
                "candidato": null,
                "nagrupacionPolitica": 27,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000027",
                "nposicion": 13,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO CIUDADANOS POR EL PERÚ",
                "estado": 20,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": null,
                "nagrupacionPolitica": 13,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000013",
                "nposicion": 14,
                "nvotos": 0
            },
            {
                "descripcion": "PRIMERO LA GENTE – COMUNIDAD, ECOLOGÍA, LIBERTAD Y PROGRESO",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 3,
                "candidato": null,
                "nagrupacionPolitica": 33,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000033",
                "nposicion": 15,
                "nvotos": 0
            },
            {
                "descripcion": "JUNTOS POR EL PERÚ",
                "estado": 20,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": null,
                "nagrupacionPolitica": 10,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000010",
                "nposicion": 16,
                "nvotos": 0
            },
            {
                "descripcion": "PODEMOS PERÚ",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 3,
                "candidato": null,
                "nagrupacionPolitica": 32,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000032",
                "nposicion": 17,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO DEMOCRATICO FEDERAL",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 3,
                "candidato": null,
                "nagrupacionPolitica": 19,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000019",
                "nposicion": 18,
                "nvotos": 0
            },
            {
                "descripcion": "FE EN EL PERÚ",
                "estado": 20,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": null,
                "nagrupacionPolitica": 5,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000005",
                "nposicion": 19,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO POLÍTICO INTEGRIDAD DEMOCRÁTICA",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 26,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000026",
                "nposicion": 20,
                "nvotos": 0
            },
            {
                "descripcion": "FUERZA POPULAR",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 8,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000008",
                "nposicion": 21,
                "nvotos": 0
            },
            {
                "descripcion": "ALIANZA PARA EL PROGRESO",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 3,
                "candidato": null,
                "nagrupacionPolitica": 1,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000001",
                "nposicion": 22,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO POLÍTICO COOPERACIÓN POPULAR",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 25,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000025",
                "nposicion": 23,
                "nvotos": 0
            },
            {
                "descripcion": "AHORA NACIÓN - AN",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 2,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000002",
                "nposicion": 24,
                "nvotos": 0
            },
            {
                "descripcion": "LIBERTAD POPULAR",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 1,
                "candidato": null,
                "nagrupacionPolitica": 11,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000011",
                "nposicion": 25,
                "nvotos": 0
            },
            {
                "descripcion": "UN CAMINO DIFERENTE",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 37,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000037",
                "nposicion": 26,
                "nvotos": 0
            },
            {
                "descripcion": "AVANZA PAÍS - PARTIDO DE INTEGRACIÓN SOCIAL",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 7,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000007",
                "nposicion": 27,
                "nvotos": 0
            },
            {
                "descripcion": "PERÚ MODERNO",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 4,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000004",
                "nposicion": 28,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO POLÍTICO PERÚ PRIMERO",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 29,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000029",
                "nposicion": 29,
                "nvotos": 0
            },
            {
                "descripcion": "SALVEMOS AL PERÚ",
                "estado": 20,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": null,
                "nagrupacionPolitica": 36,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000036",
                "nposicion": 30,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO DEMOCRÁTICO SOMOS PERÚ",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 2,
                "candidato": null,
                "nagrupacionPolitica": 20,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000020",
                "nposicion": 31,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO APRISTA PERUANO",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 3,
                "candidato": null,
                "nagrupacionPolitica": 12,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000012",
                "nposicion": 32,
                "nvotos": 0
            },
            {
                "descripcion": "RENOVACIÓN POPULAR",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 35,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000035",
                "nposicion": 33,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO DEMÓCRATA UNIDO PERÚ",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 17,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000017",
                "nposicion": 34,
                "nvotos": 0
            },
            {
                "descripcion": "FUERZA Y LIBERTAD",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 9,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000009",
                "nposicion": 35,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO DE LOS TRABAJADORES Y EMPRENDEDORES PTE - PERÚ",
                "estado": 20,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": null,
                "nagrupacionPolitica": 15,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000015",
                "nposicion": 36,
                "nvotos": 0
            },
            {
                "descripcion": "UNIDAD NACIONAL",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 2,
                "candidato": null,
                "nagrupacionPolitica": 38,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000038",
                "nposicion": 37,
                "nvotos": 0
            },
            {
                "descripcion": "PARTIDO MORADO",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 4,
                "candidato": null,
                "nagrupacionPolitica": 22,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "00000022",
                "nposicion": 38,
                "nvotos": 0
            },
            {
                "descripcion": "VOTOS EN BLANCO",
                "estado": 1,
                "grafico": 0,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": null,
                "nagrupacionPolitica": 80,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "80",
                "nposicion": 80,
                "nvotos": 0
            },
            {
                "descripcion": "VOTOS NULOS",
                "estado": 1,
                "grafico": 0,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": null,
                "nagrupacionPolitica": 81,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "81",
                "nposicion": 81,
                "nvotos": 0
            },
            {
                "descripcion": "VOTOS IMPUGNADOS",
                "estado": 1,
                "grafico": 1,
                "cargo": null,
                "sexo": null,
                "totalCandidatos": 0,
                "candidato": null,
                "nagrupacionPolitica": 82,
                "nporcentajeVotosValidos": null,
                "nporcentajeVotosEmitidos": null,
                "ccodigo": "82",
                "nposicion": 82,
                "nvotos": 0
            }
        ],
        "lineaTiempo": [
            {
                "codigoEstadoActa": "T",
                "descripcionEstadoActa": "Digitalización",
                "descripcionEstadoActaResolucion": null,
                "fechaRegistro": 1776061880000
            },
            {
                "codigoEstadoActa": "D",
                "descripcionEstadoActa": "Digitación",
                "descripcionEstadoActaResolucion": null,
                "fechaRegistro": 1776061921000
            },
            {
                "codigoEstadoActa": "E",
                "descripcionEstadoActa": "Para envío al JEE",
                "descripcionEstadoActaResolucion": "Acta con error aritmético",
                "fechaRegistro": 1776093189000
            }
        ],
        "archivos": [],
        "codigoSolucionTecnologica": 3,
        "descripcionSolucionTecnologica": "Convencional"
    }
}

