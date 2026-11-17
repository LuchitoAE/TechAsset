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

---

## Iteración 2 — Usuarios y acceso

**Fecha:** 17/11/2026
**Rama:** `feature/iteracion-2-usuarios` → `develop`
**Objetivo:** RF-01 a RF-04, RN-08, RN-09 y RN-11: cuentas, roles, ingreso, sesión y cierre.

### Alcance

- Entidad `Usuario` con nombres, apellidos, correo único, área, rol, estado, sal y hash; enumeración
  `RolUsuario` (`Administrador`, `ResponsableDeTecnologia`, `Colaborador`), objeto de valor
  `CorreoElectronico` y reglas de contraseña en el dominio.
- Casos de uso de registrar, actualizar, listar, consultar, deshabilitar/habilitar, iniciar sesión,
  obtener sesión, cerrar sesión y crear el primer Administrador, con comandos y errores de dominio en
  español.
- `ContextoDeTechAsset`, configuración EF con `HasColumnName` en snake_case, correo único, migración
  `CrearUsuarios`, repositorio y consulta de lectura con filtros y paginación.
- `ProtectorPbkdf2` (D-14) y creación del primer Administrador desde user-secrets.
- WebApi: controladores `Usuarios` y `Autenticacion`, cookie `HttpOnly`/`SameSite=Strict`, política de
  sesión por defecto, 403 por rol, JSON snake_case y ProblemDetails con `success:false` y `errors`.
- Base local `techasset` en PostgreSQL, rol `reservaupla`, migración aplicada y cuentas de prueba.
- SPA: cliente de API con errores tipados, `useFormulario`, reglas de validación, componentes base,
  ingreso, listado con filtros, registro, edición, deshabilitación con confirmación y salida; menú por
  rol listo para las iteraciones 3 a 5.
- Pruebas xUnit y Vitest.

### Tareas y tiempo aproximado

| Tarea | Tiempo |
|---|---|
| Dominio, objetos de valor y excepciones | 1,0 h |
| Casos de uso, comandos e interfaces | 1,5 h |
| EF Core, configuración, repositorio, consulta y migración | 1,0 h |
| WebApi: sesión, permisos, errores y controladores | 1,5 h |
| Pruebas xUnit y ajustes | 1,0 h |
| Frontend: api, reglas, hooks y componentes base | 1,5 h |
| Pantallas de ingreso, usuarios y layout por rol | 2,5 h |
| Pruebas Vitest, lint y build | 0,5 h |
| Base local, curl y verificación | 0,5 h |

### Decisiones

Las decisiones nuevas quedaron en el Anexo A de la ERS y se regeneró el documento:

| Código | Decisión |
|---|---|
| D-15 | Sesión con la autenticación por cookie de ASP.NET Core: `HttpOnly`, `SameSite=Strict`, 8 horas con renovación deslizante y sin estado en el servidor; el usuario y su rol se leen de la base en cada petición. |
| D-16 | El primer Administrador se crea al arrancar la API desde la configuración segura; si ya existe uno activo no se crea nada y las contraseñas de prueba no se versionan. |

También se aplicaron sin cambios D-06 (no se deshabilita al último Administrador ni la propia cuenta),
D-14 (PBKDF2-HMACSHA256, sal de 16 bytes y 100 000 iteraciones) y D-07 (el Responsable consulta usuarios
solo en lectura). El hash guarda el algoritmo y las iteraciones (`PBKDF2-HMACSHA256$100000$…`) para poder
migrarlo; la sal va en su propia columna.

### Artefactos

- `backend/src/TechAsset.Domain/Entidades/Usuario.cs`, `Comun/CorreoElectronico.cs`, `Comun/Contrasena.cs`
  y `Enumeraciones/RolUsuario.cs`.
- `backend/src/TechAsset.Application/CasosDeUso/`, `Comandos/`, `Datos/` e `Interfaces/`.
- `backend/src/TechAsset.Infrastructure/Persistencia/`, `Repositorios/`, `Consultas/`, `Servicios/` y
  `Migraciones/20261117230510_CrearUsuarios.cs`.
- `backend/src/TechAsset.WebApi/Controladores/`, `Middleware/`, `Seguridad/`, `Respuestas/`, `Contratos/`,
  `Arranque/` y `TechAsset.http`.
- `backend/tests/TechAsset.Pruebas/` con dominio, casos de uso, protector, WebApi y dobles.
- `frontend/src/api/`, `reglas/`, `hooks/useFormulario.js`, `components/ui/`, `components/usuarios/`,
  `contextos/`, `layouts/LayoutPrincipal.jsx` y `paginas/`.
- `README.md` y este registro.

### Verificación

| Comprobación | Resultado |
|---|---|
| `dotnet build -warnaserror` en `backend/` | 0 errores, 0 advertencias |
| `dotnet test` en `backend/` | 50 pruebas, 50 en verde |
| `dotnet ef migrations has-pending-model-changes` | Sin cambios pendientes |
| `pnpm install --offline --frozen-lockfile` | Lockfile al día, sin descargas |
| `pnpm lint` | Sin avisos |
| `pnpm test` | 28 pruebas, 28 en verde |
| `pnpm build` | Compila; `dist/` generado |
| Migración en PostgreSQL | `CrearUsuarios` aplicada; tabla `usuarios` con `uq_usuarios_correo` y `ck_usuarios_rol` |
| API con curl | 200 al ingresar, 401 con contraseña mala y sin cookie, 201 al registrar, 409 con correo duplicado, 403 al deshabilitar como Colaborador, 409 al intentar deshabilitar o degradar al último Administrador, 401 con un usuario deshabilitado |
| Cookie de sesión | `path=/; samesite=strict; httponly` |
| SPA en desarrollo | `pnpm dev` responde 200 y el proxy `/api` llega a la API |

### Defectos encontrados y corregidos

1. La fábrica de pruebas no alcanzaba a inyectar la cadena de conexión antes de que `Program.cs` la leyera;
   se añadió una cadena inalcanzable solo para el entorno `Testing`, porque esas pruebas no consultan la base.
2. El manejador de errores necesitaba `Microsoft.AspNetCore.Diagnostics` y el helper de respuestas chocaba
   con el espacio de nombres `Respuestas`; se renombró a `RespuestasDeLaApi`.
3. `WriteAsJsonAsync` cambiaba el contenido a `application/json`; se usa la sobrecarga con
   `application/problem+json` para conservar RFC 9457.
4. Las pruebas de contraseña tenían dos datos mal elegidos (una cadena sin mayúscula descrita como falta de
   minúscula y una longitud de 63 en vez de más de 64); se corrigieron los casos, no la regla.
5. Oxlint advertía `set-state-in-effect` en las pantallas que cargan datos; el estado de carga se mueve a
   los eventos que originan la consulta y el efecto solo lo apaga al terminar.
6. El layout importaba `./ui/Button` desde `layouts/`; la ruta correcta es `../components/ui/Button`.

### Retrospectiva

- **Bien:** el SDD fijó nombres, rutas y códigos, así que el backend se armó sin renombrar el contrato; los
  objetos de valor y las excepciones de dominio dejaron los controladores sin `try/catch`; las pruebas de
  permisos con un esquema de autenticación falso permiten comprobar 401/403 sin base de datos.
- **Difícil:** la sesión sin estado en el servidor obliga a releer el usuario en cada petición, pero es lo
  que permite que un usuario deshabilitado pierda el acceso de inmediato; el arranque no debe crear el
  Administrador en las pruebas, y eso exigió separar la configuración de pruebas.
- **Aprendizaje:** las reglas que parecen «solo de interfaz» (último Administrador, correo único, 403) deben
  estar también en el dominio y en la base; la interfaz solo evita el viaje cuando puede.

### Pendiente para la iteración 3

- Entidad `Equipo`, catálogo de categorías, código patrimonial único (RN-07), estados y migración.
- Casos de uso RF-05 a RF-08, filtros de inventario y consulta por estado/categoría/texto.
- Pantallas de equipos e inventario con los mismos componentes base.
- Reutilizar el patrón de sesión, errores y pruebas para los nuevos recursos.
