# Registro PXP — TechAsset

Bitácora de las iteraciones de Personal Extreme Programming. Cada iteración anota qué se hizo, qué se decidió,
qué se probó y qué queda para la siguiente.

## Iteración 1 — Análisis, planificación y repositorio inicial

**Fecha:** 17/11/2026
**Rama:** `feature/iteracion-1-analisis` → `develop`
**Objetivo:** dejar el punto de partida documental y técnico del caso TechAsset, sin lógica de negocio.

### Alcance

- Análisis del PDF del caso y de las decisiones del `CONTEXTO`.
- ERS 0100 con RF-01 a RF-17, RN-01 a RN-11, RNF, interfaces, modelo de datos y trazabilidad.
- SDD 0100 con las vistas IEEE 1016, el contrato de la API, los estados, la interfaz y los algoritmos.
- Diagramas de contexto, casos de uso, componentes, clases, datos, secuencias de préstamo y devolución, estados y
  mapa de pantallas (PNG y `.drawio`).
- `ESTANDARES.md`, `README.md`, `.gitignore`, `.gitattributes`, `.editorconfig` y repositorio git.
- Esqueleto del backend (.NET 10, arquitectura limpia, `/api/salud`, Swagger en Development) y del frontend
  (React 19 + Vite + Tailwind, pantalla de bienvenida).

### Tareas y tiempo aproximado

| Tarea | Tiempo |
|---|---|
| Lectura del PDF, del CONTEXTO y de las guías | 0,5 h |
| ERS: requisitos, reglas, RNF, modelo y trazabilidad | 3,0 h |
| SDD: vistas, API, estados, interfaz y algoritmos | 2,5 h |
| Diagramas y ajustes de legibilidad | 1,5 h |
| Repositorio, estándares y esqueletos | 1,5 h |
| Verificación (compilación, pruebas, documentos, PDF) | 1,0 h |

### Decisiones

Las decisiones completas están en el Anexo A de la ERS. Las que cambian el punto de partida técnico son:

| Código | Decisión |
|---|---|
| D-01 | .NET 10 en lugar de .NET 8: es la versión instalada y soportada del equipo. |
| D-02 | Ciclo PXP con seis iteraciones; este registro es la bitácora. |
| D-03 | Tabla `movimientos` para RF-17; no altera las tres tablas del PDF. |
| D-04 | El Colaborador solicita y el Responsable de Tecnología aprueba; la fecha de préstamo es la de la aprobación. |
| D-05 | `estado_prestamo` y `fecha_devolucion_real` distinguen el préstamo activo; no se da de baja un equipo prestado. |
| D-06 | Los usuarios se deshabilitan, no se borran; no se puede deshabilitar al último Administrador. |
| D-07 | El Responsable consulta usuarios (solo lectura) para elegir al responsable de un préstamo. |
| D-08 | Catálogo de siete categorías tomado de la presentación del caso. |
| D-09 | Reportes y «Total de préstamos» cuentan Activos y Devueltos; el área es la del responsable; empate de área se muestra completo. |
| D-10 | El dashboard muestra los seis indicadores del PDF; los adicionales no los reemplazan. |
| D-11 | Inventario inicial manual, sin importación ni integración con sistemas de Innovatech. |
| D-14 | PBKDF2-HMACSHA256 con sal de 16 bytes y al menos 100 000 iteraciones. |

Otras decisiones de esta iteración: los puertos locales son **5191** (SPA) y **5321** (API); los documentos y
diagramas viven fuera del repositorio, en `../Analisis/`; el repositorio usa `main` para lo entregado y `develop`
para la integración.

### Artefactos

- `TechAsset/` con el repositorio, `ESTANDARES.md`, `README.md` y la configuración de editor.
- `../Analisis/ERS/ERS TechAsset - Versionar.docx` (0100).
- `../Analisis/SDD/SDD TechAsset - Versionar.docx` (0100).
- `../Analisis/Diagramas/` con nueve PNG y `Diagramas de la ERS y el SDD.drawio`.
- `Semanas/.herramientas/caso_unidad3_2/` con `ers.py`, `sdd.py`, `diagramas_analisis.py` y `utilidades.py`.

### Verificación

| Comprobación | Resultado |
|---|---|
| `dotnet build -warnaserror` en `backend/` | 0 errores, 0 advertencias |
| `dotnet test` en `backend/` | 1 prueba de humo de `/api/salud` en verde |
| `pnpm install --offline --frozen-lockfile` | 62 paquetes reutilizados, sin descargas |
| `pnpm build` en `frontend/` | compila; `dist/` generado |
| `pnpm lint` | sin avisos |
| Render de la ERS | 49 hojas, sin títulos sin página, 1 salto automático |
| Render del SDD | 23 hojas, sin títulos sin página, sin saltos automáticos |
| Revisión visual | encabezado y viñeta de la plantilla corregidos; tablas de reglas y API en una sola hoja |

### Defectos encontrados y corregidos

1. El encabezado de la plantilla conservaba «ÁREA DE DESARROLLO» y se partía con guion; se reemplazó por «DESARROLLO».
2. La celda «Dependencias» de las fichas traía una viñeta de la plantilla; se quitó la numeración.
3. La tabla de reglas de negocio se partía entre dos hojas; ahora empieza en una hoja nueva con su título.
4. La tabla de operaciones de la API se partía; ahora ocupa una hoja completa.
5. El diagrama de casos de uso tapaba CU-20 con la nota; se amplió la página y se movió la nota.
6. Las relaciones del diagrama de clases cruzaban cajas; se reorganizaron las clases y las rutas.

### Retrospectiva

- **Bien:** el PDF y el CONTEXTO fueron suficientes para fijar el alcance sin inventar requisitos; la plantilla del
  docente y los generadores del caso anterior ahorraron el formato; el esqueleto compila y prueba desde el primer día.
- **Difícil:** el modelo del PDF no distingue un préstamo activo de uno devuelto; hubo que decidir los campos
  adicionales y documentarlos (D-05). Las tablas largas de la plantilla se parten con facilidad; se resolvió con
  saltos explícitos y con la comprobación de tablas partidas del generador.
- **Aprendizaje:** las decisiones ambiguas deben quedar en la ERS y en este registro antes de programar; si no, cada
  iteración las reinterpreta.

### Pendiente para la iteración 2

- Entidad `Usuario` con rol y contraseña cifrada; `DbContext`, primera migración y `IReloj`.
- Casos de uso RF-01 a RF-04, RN-08, RN-09 y RN-11; ingreso, sesión y salida con cookie.
- Formularios y listado de usuarios; pruebas xUnit y Vitest.
- Cuenta inicial del Administrador desde los user-secrets (sin secretos en el repositorio).
- Actualizar la ERS/SDD si cambia alguna decisión y anotarlo aquí.
