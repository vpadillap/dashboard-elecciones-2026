To get the data the site uses ubigeo atribute. These are ubigeos we need to fetch
[
    {
        "ubigeo": "010000",
        "nombre": "AMAZONAS"
    },
    {
        "ubigeo": "020000",
        "nombre": "ÁNCASH"
    },
    {
        "ubigeo": "030000",
        "nombre": "APURÍMAC"
    },
    {
        "ubigeo": "040000",
        "nombre": "AREQUIPA"
    },
    {
        "ubigeo": "050000",
        "nombre": "AYACUCHO"
    },
    {
        "ubigeo": "060000",
        "nombre": "CAJAMARCA"
    },
    {
        "ubigeo": "240000",
        "nombre": "CALLAO"
    },
    {
        "ubigeo": "070000",
        "nombre": "CUSCO"
    },
    {
        "ubigeo": "080000",
        "nombre": "HUANCAVELICA"
    },
    {
        "ubigeo": "090000",
        "nombre": "HUÁNUCO"
    },
    {
        "ubigeo": "100000",
        "nombre": "ICA"
    },
    {
        "ubigeo": "110000",
        "nombre": "JUNÍN"
    },
    {
        "ubigeo": "120000",
        "nombre": "LA LIBERTAD"
    },
    {
        "ubigeo": "130000",
        "nombre": "LAMBAYEQUE"
    },
    {
        "ubigeo": "140000",
        "nombre": "LIMA"
    },
    {
        "ubigeo": "150000",
        "nombre": "LORETO"
    },
    {
        "ubigeo": "160000",
        "nombre": "MADRE DE DIOS"
    },
    {
        "ubigeo": "170000",
        "nombre": "MOQUEGUA"
    },
    {
        "ubigeo": "180000",
        "nombre": "PASCO"
    },
    {
        "ubigeo": "190000",
        "nombre": "PIURA"
    },
    {
        "ubigeo": "200000",
        "nombre": "PUNO"
    },
    {
        "ubigeo": "210000",
        "nombre": "SAN MARTÍN"
    },
    {
        "ubigeo": "220000",
        "nombre": "TACNA"
    },
    {
        "ubigeo": "230000",
        "nombre": "TUMBES"
    },
    {
        "ubigeo": "250000",
        "nombre": "UCAYALI"
    }
]


## The with that data the following calls are made

### Getting votes example (010000 is Amazonas)

https://resultadoelectoral.onpe.gob.pe/presentacion-backend/eleccion-presidencial/participantes-ubicacion-geografica-nombre?tipoFiltro=ubigeo_nivel_01&idAmbitoGeografico=1&ubigeoNivel1=010000&listRegiones=TODOS,PER%C3%9A,EXTRANJERO&listDepartamento=%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D,%5Bobject%20Object%5D&idEleccion=10

### Getting results example (total votos validos is the key point)

{
    "success": true,
    "message": "",
    "data": [
        {
            "nombreAgrupacionPolitica": "JUNTOS POR EL PERÚ",
            "codigoAgrupacionPolitica": "10",
            "nombreCandidato": "ROBERTO HELBERT SANCHEZ PALOMINO",
            "dniCandidato": "16002918",
            "totalVotosValidos": 27782,
            "porcentajeVotosValidos": 29.2,
            "porcentajeVotosEmitidos": 22.472
        },
        {
            "nombreAgrupacionPolitica": "VOTOS EN BLANCO",
            "codigoAgrupacionPolitica": "80",
            "nombreCandidato": "",
            "dniCandidato": "",
            "totalVotosValidos": 19906,
            "porcentajeVotosEmitidos": 16.101
        },
        {
            "nombreAgrupacionPolitica": "FUERZA POPULAR",
            "codigoAgrupacionPolitica": "8",
            "nombreCandidato": "KEIKO SOFIA FUJIMORI HIGUCHI",
            "dniCandidato": "10001088",
            "totalVotosValidos": 19183,
            "porcentajeVotosValidos": 20.162,
            "porcentajeVotosEmitidos": 15.516
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO CÍVICO OBRAS",
            "codigoAgrupacionPolitica": "14",
            "nombreCandidato": "RICARDO PABLO BELMONT CASSINELLI",
            "dniCandidato": "09177250",
            "totalVotosValidos": 10951,
            "porcentajeVotosValidos": 11.51,
            "porcentajeVotosEmitidos": 8.858
        },
        {
            "nombreAgrupacionPolitica": "VOTOS NULOS",
            "codigoAgrupacionPolitica": "81",
            "nombreCandidato": "",
            "dniCandidato": "",
            "totalVotosValidos": 8581,
            "porcentajeVotosEmitidos": 6.941
        },
        {
            "nombreAgrupacionPolitica": "AHORA NACIÓN - AN",
            "codigoAgrupacionPolitica": "2",
            "nombreCandidato": "PABLO ALFONSO LOPEZ CHAU NAVA",
            "dniCandidato": "25331980",
            "totalVotosValidos": 6601,
            "porcentajeVotosValidos": 6.938,
            "porcentajeVotosEmitidos": 5.339
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO DEL BUEN GOBIERNO",
            "codigoAgrupacionPolitica": "16",
            "nombreCandidato": "JORGE NIETO MONTESINOS",
            "dniCandidato": "06506278",
            "totalVotosValidos": 4406,
            "porcentajeVotosValidos": 4.631,
            "porcentajeVotosEmitidos": 3.564
        },
        {
            "nombreAgrupacionPolitica": "RENOVACIÓN POPULAR",
            "codigoAgrupacionPolitica": "35",
            "nombreCandidato": "RAFAEL BERNARDO LÓPEZ ALIAGA CAZORLA",
            "dniCandidato": "07845838",
            "totalVotosValidos": 3977,
            "porcentajeVotosValidos": 4.18,
            "porcentajeVotosEmitidos": 3.217
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO PAÍS PARA TODOS",
            "codigoAgrupacionPolitica": "23",
            "nombreCandidato": "CARLOS GONSALO ALVAREZ LOAYZA",
            "dniCandidato": "06002034",
            "totalVotosValidos": 2750,
            "porcentajeVotosValidos": 2.89,
            "porcentajeVotosEmitidos": 2.224
        },
        {
            "nombreAgrupacionPolitica": "ALIANZA PARA EL PROGRESO",
            "codigoAgrupacionPolitica": "1",
            "nombreCandidato": "CESAR ACUÑA PERALTA",
            "dniCandidato": "17903382",
            "totalVotosValidos": 2136,
            "porcentajeVotosValidos": 2.245,
            "porcentajeVotosEmitidos": 1.728
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO DEMOCRÁTICO SOMOS PERÚ",
            "codigoAgrupacionPolitica": "20",
            "nombreCandidato": "GEORGE PATRICK FORSYTH SOMMER",
            "dniCandidato": "41265978",
            "totalVotosValidos": 2075,
            "porcentajeVotosValidos": 2.181,
            "porcentajeVotosEmitidos": 1.678
        },
        {
            "nombreAgrupacionPolitica": "PRIMERO LA GENTE – COMUNIDAD, ECOLOGÍA, LIBERTAD Y PROGRESO",
            "codigoAgrupacionPolitica": "33",
            "nombreCandidato": "MARIA SOLEDAD PEREZ TELLO",
            "dniCandidato": "07867789",
            "totalVotosValidos": 1972,
            "porcentajeVotosValidos": 2.073,
            "porcentajeVotosEmitidos": 1.595
        },
        {
            "nombreAgrupacionPolitica": "PODEMOS PERÚ",
            "codigoAgrupacionPolitica": "32",
            "nombreCandidato": "JOSE LEON LUNA GALVEZ",
            "dniCandidato": "07246887",
            "totalVotosValidos": 1714,
            "porcentajeVotosValidos": 1.801,
            "porcentajeVotosEmitidos": 1.386
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO SICREO",
            "codigoAgrupacionPolitica": "31",
            "nombreCandidato": "ALFONSO CARLOS ESPA Y GARCES-ALVEAR",
            "dniCandidato": "10266270",
            "totalVotosValidos": 1639,
            "porcentajeVotosValidos": 1.723,
            "porcentajeVotosEmitidos": 1.326
        },
        {
            "nombreAgrupacionPolitica": "ALIANZA ELECTORAL VENCEREMOS",
            "codigoAgrupacionPolitica": "3",
            "nombreCandidato": "RONALD DARWIN ATENCIO SOTOMAYOR",
            "dniCandidato": "41373494",
            "totalVotosValidos": 1176,
            "porcentajeVotosValidos": 1.236,
            "porcentajeVotosEmitidos": 0.951
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO PATRIÓTICO DEL PERÚ",
            "codigoAgrupacionPolitica": "24",
            "nombreCandidato": "HERBERT CALLER GUTIERREZ",
            "dniCandidato": "43409673",
            "totalVotosValidos": 1072,
            "porcentajeVotosValidos": 1.127,
            "porcentajeVotosEmitidos": 0.867
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO POLÍTICO COOPERACIÓN POPULAR",
            "codigoAgrupacionPolitica": "25",
            "nombreCandidato": "YONHY LESCANO ANCIETA",
            "dniCandidato": "01211014",
            "totalVotosValidos": 916,
            "porcentajeVotosValidos": 0.963,
            "porcentajeVotosEmitidos": 0.741
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO POLÍTICO NACIONAL PERÚ LIBRE",
            "codigoAgrupacionPolitica": "27",
            "nombreCandidato": "VLADIMIR ROY CERRON ROJAS",
            "dniCandidato": "06466585",
            "totalVotosValidos": 887,
            "porcentajeVotosValidos": 0.932,
            "porcentajeVotosEmitidos": 0.717
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO FRENTE DE LA ESPERANZA 2021",
            "codigoAgrupacionPolitica": "21",
            "nombreCandidato": "LUIS FERNANDO OLIVERA VEGA",
            "dniCandidato": "06280714",
            "totalVotosValidos": 864,
            "porcentajeVotosValidos": 0.908,
            "porcentajeVotosEmitidos": 0.699
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO APRISTA PERUANO",
            "codigoAgrupacionPolitica": "12",
            "nombreCandidato": "PITTER ENRIQUE VALDERRAMA PEÑA",
            "dniCandidato": "43632186",
            "totalVotosValidos": 797,
            "porcentajeVotosValidos": 0.838,
            "porcentajeVotosEmitidos": 0.645
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO POLÍTICO PERÚ PRIMERO",
            "codigoAgrupacionPolitica": "29",
            "nombreCandidato": "MARIO ENRIQUE VIZCARRA CORNEJO",
            "dniCandidato": "04411300",
            "totalVotosValidos": 661,
            "porcentajeVotosValidos": 0.695,
            "porcentajeVotosEmitidos": 0.535
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO DEMÓCRATA UNIDO PERÚ",
            "codigoAgrupacionPolitica": "17",
            "nombreCandidato": "CHARLIE CARRASCO SALAZAR",
            "dniCandidato": "40799023",
            "totalVotosValidos": 483,
            "porcentajeVotosValidos": 0.508,
            "porcentajeVotosEmitidos": 0.391
        },
        {
            "nombreAgrupacionPolitica": "UN CAMINO DIFERENTE",
            "codigoAgrupacionPolitica": "37",
            "nombreCandidato": "ROSARIO DEL PILAR FERNANDEZ BAZAN",
            "dniCandidato": "18141156",
            "totalVotosValidos": 400,
            "porcentajeVotosValidos": 0.42,
            "porcentajeVotosEmitidos": 0.324
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO DEMÓCRATA VERDE",
            "codigoAgrupacionPolitica": "18",
            "nombreCandidato": "ALEX GONZALES CASTILLO",
            "dniCandidato": "09307547",
            "totalVotosValidos": 384,
            "porcentajeVotosValidos": 0.404,
            "porcentajeVotosEmitidos": 0.311
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO MORADO",
            "codigoAgrupacionPolitica": "22",
            "nombreCandidato": "MESIAS ANTONIO GUEVARA AMASIFUEN",
            "dniCandidato": "09871134",
            "totalVotosValidos": 318,
            "porcentajeVotosValidos": 0.334,
            "porcentajeVotosEmitidos": 0.257
        },
        {
            "nombreAgrupacionPolitica": "UNIDAD NACIONAL",
            "codigoAgrupacionPolitica": "38",
            "nombreCandidato": "ROBERTO ENRIQUE CHIABRA LEON",
            "dniCandidato": "40728264",
            "totalVotosValidos": 271,
            "porcentajeVotosValidos": 0.285,
            "porcentajeVotosEmitidos": 0.219
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO POLÍTICO INTEGRIDAD DEMOCRÁTICA",
            "codigoAgrupacionPolitica": "26",
            "nombreCandidato": "WOLFGANG MARIO GROZO COSTA",
            "dniCandidato": "07260881",
            "totalVotosValidos": 225,
            "porcentajeVotosValidos": 0.236,
            "porcentajeVotosEmitidos": 0.182
        },
        {
            "nombreAgrupacionPolitica": "PROGRESEMOS",
            "codigoAgrupacionPolitica": "34",
            "nombreCandidato": "PAUL DAVIS JAIMES BLANCO",
            "dniCandidato": "40139245",
            "totalVotosValidos": 202,
            "porcentajeVotosValidos": 0.212,
            "porcentajeVotosEmitidos": 0.163
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO POLÍTICO PERÚ ACCIÓN",
            "codigoAgrupacionPolitica": "28",
            "nombreCandidato": "FRANCISCO ERNESTO DIEZ-CANSECO TÁVARA",
            "dniCandidato": "08263758",
            "totalVotosValidos": 196,
            "porcentajeVotosValidos": 0.206,
            "porcentajeVotosEmitidos": 0.159
        },
        {
            "nombreAgrupacionPolitica": "AVANZA PAÍS - PARTIDO DE INTEGRACIÓN SOCIAL",
            "codigoAgrupacionPolitica": "7",
            "nombreCandidato": "JOSE DANIEL WILLIAMS ZAPATA",
            "dniCandidato": "43287528",
            "totalVotosValidos": 187,
            "porcentajeVotosValidos": 0.197,
            "porcentajeVotosEmitidos": 0.151
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO DEMOCRATICO FEDERAL",
            "codigoAgrupacionPolitica": "19",
            "nombreCandidato": "ARMANDO JOAQUIN MASSE FERNANDEZ",
            "dniCandidato": "08255194",
            "totalVotosValidos": 160,
            "porcentajeVotosValidos": 0.168,
            "porcentajeVotosEmitidos": 0.129
        },
        {
            "nombreAgrupacionPolitica": "FUERZA Y LIBERTAD",
            "codigoAgrupacionPolitica": "9",
            "nombreCandidato": "FIORELLA GIANNINA MOLINELLI ARISTONDO",
            "dniCandidato": "25681995",
            "totalVotosValidos": 151,
            "porcentajeVotosValidos": 0.159,
            "porcentajeVotosEmitidos": 0.122
        },
        {
            "nombreAgrupacionPolitica": "SALVEMOS AL PERÚ",
            "codigoAgrupacionPolitica": "36",
            "nombreCandidato": "ANTONIO ORTIZ VILLANO",
            "dniCandidato": "08587486",
            "totalVotosValidos": 141,
            "porcentajeVotosValidos": 0.148,
            "porcentajeVotosEmitidos": 0.114
        },
        {
            "nombreAgrupacionPolitica": "FE EN EL PERÚ",
            "codigoAgrupacionPolitica": "5",
            "nombreCandidato": "ALVARO GONZALO PAZ DE LA BARRA FREIGEIRO",
            "dniCandidato": "41904418",
            "totalVotosValidos": 140,
            "porcentajeVotosValidos": 0.147,
            "porcentajeVotosEmitidos": 0.113
        },
        {
            "nombreAgrupacionPolitica": "LIBERTAD POPULAR",
            "codigoAgrupacionPolitica": "11",
            "nombreCandidato": "RAFAEL JORGE BELAUNDE LLOSA",
            "dniCandidato": "10219647",
            "totalVotosValidos": 132,
            "porcentajeVotosValidos": 0.139,
            "porcentajeVotosEmitidos": 0.107
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO POLÍTICO PRIN",
            "codigoAgrupacionPolitica": "30",
            "nombreCandidato": "WALTER GILMER CHIRINOS PURIZAGA",
            "dniCandidato": "18870364",
            "totalVotosValidos": 101,
            "porcentajeVotosValidos": 0.106,
            "porcentajeVotosEmitidos": 0.082
        },
        {
            "nombreAgrupacionPolitica": "PARTIDO DE LOS TRABAJADORES Y EMPRENDEDORES PTE - PERÚ",
            "codigoAgrupacionPolitica": "15",
            "nombreCandidato": "NAPOLEON BECERRA GARCIA",
            "dniCandidato": "08058852",
            "totalVotosValidos": 55,
            "porcentajeVotosValidos": 0.058,
            "porcentajeVotosEmitidos": 0.044
        },
        {
            "nombreAgrupacionPolitica": "PERÚ MODERNO",
            "codigoAgrupacionPolitica": "4",
            "nombreCandidato": "CARLOS ERNESTO JAICO CARRANZA",
            "dniCandidato": "06529088",
            "totalVotosValidos": 40,
            "porcentajeVotosValidos": 0.042,
            "porcentajeVotosEmitidos": 0.032
        }
    ]
}

### Getting the extra info needed for the region example (010000 is the id for Amazonas)

https://resultadoelectoral.onpe.gob.pe/presentacion-backend/resumen-general/totales?idAmbitoGeografico=1&idEleccion=10&tipoFiltro=ubigeo_nivel_01&idUbigeoDepartamento=010000

### Getting the results example (actas contabilizadas is the key point, it is a percentage)

{
    "success": true,
    "message": "",
    "data": {
        "actasContabilizadas": 52.504,
        "contabilizadas": 671,
        "totalActas": 1278,
        "participacionCiudadana": 35.81,
        "actasEnviadasJee": 1.252,
        "enviadasJee": 16,
        "actasPendientesJee": 46.244,
        "pendientesJee": 591,
        "fechaActualizacion": 1776178442693,
        "idUbigeoDepartamento": 140000,
        "idUbigeoProvincia": 140100,
        "idUbigeoDistrito": 140101,
        "idUbigeoDistritoElectoral": 15,
        "totalVotosEmitidos": 123632,
        "totalVotosValidos": 95145,
        "porcentajeVotosEmitidos": 100,
        "porcentajeVotosValidos": 100
    }
}

## For extranjero things are different (it doesnt use ubigeo)

### Getting votes

https://resultadoelectoral.onpe.gob.pe/presentacion-backend/eleccion-presidencial/participantes-ubicacion-geografica-nombre?tipoFiltro=ambito_geografico&idAmbitoGeografico=2&listRegiones=TODOS,PER%C3%9A,EXTRANJERO&idEleccion=10

### Getting totals
https://resultadoelectoral.onpe.gob.pe/presentacion-backend/resumen-general/totales?idAmbitoGeografico=2&idEleccion=10&tipoFiltro=ambito_geografico