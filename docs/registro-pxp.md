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
| `dotnet test` en `backend/` | 51 pruebas, 51 en verde |
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

---

## Iteración 3 — Equipos e inventario

**Fecha:** 17/11/2026
**Rama:** `feature/iteracion-3-equipos` → `develop`
**Objetivo:** RF-05 a RF-08, RN-07, D-08 y los estados: registrar, actualizar, consultar el inventario
con filtros y cambiar el estado de un equipo, con permisos por rol y pruebas.

### Alcance

- Entidad `Equipo` con código patrimonial, nombre, categoría, marca y estado; objeto de valor
  `CodigoPatrimonial` (sin espacios, en mayúsculas y de hasta 50 caracteres) y enumeraciones
  `CategoriaEquipo` (siete categorías de D-08) y `EstadoEquipo` (D-05).
- Casos de uso de registrar, actualizar, listar, consultar y cambiar estado, con comandos, datos de
  salida y errores de dominio en español.
- `ContextoDeTechAsset`, configuración EF con `HasColumnName` en snake_case, índice único
  `uq_equipos_codigo_patrimonial`, CHECK `ck_equipos_estado`, índices por estado y categoría, y
  migración `CrearEquipos`.
- Repositorio de escritura y consulta de lectura con proyección, `AsNoTracking`, filtros por texto,
  estado, categoría y marca, conteo por estado y paginación.
- WebApi: `EquiposControlador` con los cinco endpoints del SDD; los tres roles consultan y solo el
  Administrador y el Responsable de Tecnología escriben.
- SPA: listado de inventario con filtros, chips de estado con conteo, contador y paginación; alta y
  edición con validaciones y ayudas; detalle con cambio de estado y confirmación; rutas y menú por rol.
- Pruebas xUnit de dominio, casos de uso, permisos y filtros; pruebas Vitest de reglas y formulario.

### Tareas y tiempo aproximado

| Tarea | Tiempo |
|---|---|
| Dominio: entidad, objeto de valor, enums y reglas | 1,0 h |
| Casos de uso, comandos, datos e interfaces | 1,0 h |
| EF Core, configuración, repositorio, consulta y migración | 1,0 h |
| WebApi: contratos, controlador, permisos y mensajes | 1,0 h |
| Pruebas xUnit y ajustes | 1,0 h |
| Frontend: api, catálogos, reglas y componentes | 1,5 h |
| Pantallas de inventario, alta y detalle | 2,5 h |
| Pruebas Vitest, lint y build | 0,5 h |
| Migración, curl y verificación | 0,5 h |

### Decisiones

No cambió ninguna decisión del Anexo A. Se aplicaron D-05 (el estado `Prestado` lo controla el
préstamo; no se da de baja ni se pone en mantenimiento un equipo prestado) y D-08 (siete categorías).
La reincorporación desde `Baja` se trató como un cambio de estado más de RF-08, porque la ERS permite
cambiar entre `Disponible`, `Mantenimiento` y `Baja`; no se creó una decisión nueva.

Decisiones de implementación que no alteran el contrato:

- El código patrimonial se normaliza en el objeto de valor: `  tk-2026-0001 ` y `TK-2026-0001` son el
  mismo código, y la base también lo impide con el índice único.
- `Prestado` no se puede asignar por RF-08. El dominio expone `MarcarComoPrestado()` y
  `MarcarComoDisponible()` para que la iteración 4 los use desde el préstamo y la devolución; así la
  regla queda lista sin abrir un atajo manual.
- La consulta de inventario devuelve `conteo_por_estado` con el resto de filtros aplicados, excepto el
  estado, para que los chips muestren cuántos equipos hay en cada situación.
- `disponible_equipo` es un dato derivado (`estado_equipo == Disponible`); no se guarda una columna.

### Artefactos

- `backend/src/TechAsset.Domain/Entidades/Equipo.cs`, `Comun/CodigoPatrimonial.cs`,
  `Comun/CamposDeEquipo.cs`, `Enumeraciones/CategoriaEquipo.cs` y `Enumeraciones/EstadoEquipo.cs`.
- `backend/src/TechAsset.Application/CasosDeUso/` (registrar, actualizar, listar, obtener y cambiar
  estado), `Comandos/`, `Datos/` e `Interfaces/`.
- `backend/src/TechAsset.Infrastructure/Persistencia/Configuraciones/ConfiguracionDeEquipo.cs`,
  `Repositorios/RepositorioDeEquipos.cs`, `Consultas/ConsultaDeEquipos.cs` y
  `Migraciones/20261117234312_CrearEquipos.cs`.
- `backend/src/TechAsset.WebApi/Controladores/EquiposControlador.cs`, `Contratos/`, `TechAsset.http` y
  `Middleware/ErroresDeModelo.cs` (mensajes de enlace en español).
- `backend/tests/TechAsset.Pruebas/` con `PruebasDeEquipos`, `PruebasDeRegistroDeEquipos`,
  `PruebasDeEstadoDeEquipos`, `PruebasDeInventario`, `PruebasDePermisosDeEquipos` y sus dobles.
- `frontend/src/api/equiposApi.js`, `reglas/validacionEquipos.js`, `reglas/catalogos.js`,
  `components/equipos/` y las páginas `PaginaEquipos`, `PaginaNuevoEquipo` y `PaginaDetalleEquipo`.
- `README.md`, este registro y la migración aplicada en la base local.

### Verificación

| Comprobación | Resultado |
|---|---|
| `dotnet build -warnaserror` en `backend/` | 0 errores, 0 advertencias |
| `dotnet test` en `backend/` | 100 pruebas, 100 en verde |
| `dotnet ef migrations has-pending-model-changes` | «No changes have been made to the model since the last migration.» |
| Migración en PostgreSQL | `20261117234312_CrearEquipos` aplicada; tabla `equipos` con `uq_equipos_codigo_patrimonial`, `ck_equipos_estado`, `ix_equipos_estado` e `ix_equipos_categoria` |
| `pnpm lint` | Sin avisos |
| `pnpm test` | 42 pruebas, 42 en verde (10 archivos) |
| `pnpm build` | 135 módulos transformados; `dist/` generado |
| API con curl | 201 al registrar; 409 con código duplicado aunque cambien mayúsculas y espacios; 200 al listar con filtros; 200 al actualizar y cambiar estado; 409 al intentar dar de baja un equipo prestado; 403 al registrar como Colaborador; 401 sin cookie; 400 con categoría inválida y mensaje en español |

Respuestas resumidas de la verificación con curl (API en `http://localhost:5321`):

```text
POST /api/equipos (Administrador)                 201  Equipo registrado. TK-2026-9001 / Disponible
POST /api/equipos (código repetido con espacios)  409  Ya existe un equipo con ese código patrimonial.
GET  /api/equipos?texto=latitude&estado=Disponible 200  total=1, conteo Disponible=1 (rol Colaborador)
PUT  /api/equipos/{id} (Administrador)            200  Laptop Dell Latitude 5450 / Disponible
PATCH /api/equipos/{id}/estado (Responsable)      200  Mantenimiento, disponible=false
PATCH /api/equipos/{id}/estado a Baja (prestado)  409  El equipo está prestado. Registre primero la devolución…
POST /api/equipos (Colaborador)                   403  Su rol no permite esta operación.
GET  /api/equipos (sin cookie)                     401  Debe iniciar sesión.
GET  /api/equipos/{id} (Colaborador)              200  TK-2026-9001 / Prestado
POST /api/equipos con categoria_equipo=Servidor    400  errors.categoria_equipo: «La categoría debe ser …»
```

Para el caso 409 de equipo prestado se actualizó temporalmente el estado en la base (el préstamo es
la iteración 4) y después se eliminaron los equipos de prueba; la base quedó sin equipos inventados.

### Defectos encontrados y corregidos

1. Las pruebas esperaban la palabra «devuelta» en el mensaje del dominio, que dice «devolución»; se
   corrigieron las aserciones, no el mensaje.
2. La fábrica de pruebas de equipos necesitaba `Microsoft.AspNetCore.TestHost` para
   `ConfigureTestServices`; se agregó la directiva.
3. Los errores de enlace del marco para una categoría o un estado inválidos llegaban en inglés y con
   claves `$.campo`. `ErroresDeModelo` ahora normaliza la clave y traduce los campos conocidos; también
   elimina el error redundante de `solicitud` cuando ya hay un campo concreto.
4. `FiltrosEquipos` reexportaba una constante sin uso; se quitó para dejar el archivo limpio.
5. La primera versión de la consulta de conteo aplicaba el filtro de estado antes del `GROUP BY`, lo
   que dejaba los chips en cero al filtrar; se movió el conteo antes del filtro de estado.

### Retrospectiva

- **Bien:** el SDD y la ERS ya tenían los nombres de columnas, el catálogo, los estados y los
  endpoints, así que el backend se armó sin renombrar el contrato; el objeto de valor del código
  patrimonial resolvió de una vez la normalización y la comparación; el patrón de usuarios se reutilizó
  para permisos, errores y pruebas.
- **Difícil:** el estado `Prestado` todavía no tiene préstamo en esta iteración. Se resolvió dejando la
  transición en el dominio (`MarcarComoPrestado`/`MarcarComoDisponible`) y bloqueando cualquier cambio
  manual desde `Prestado`; así la iteración 4 solo conecta el caso de uso del préstamo.
- **Aprendizaje:** los chips de estado necesitan su propio conteo antes de aplicar el filtro de estado;
  si se calculan después, el usuario pierde la referencia de cuántos equipos hay en cada situación. Las
  validaciones de un enum en el JSON no las escribe el dominio: hay que traducir también los errores de
  enlace del marco.

### Pendiente para la iteración 4

- Entidad `Prestamo`, tabla `prestamos` y tabla `movimientos`; índice único parcial de préstamo activo
  por equipo (RN-01) y claves foráneas.
- Conectar `MarcarComoPrestado` y `MarcarComoDisponible` a los casos de uso de préstamo y devolución;
  el cambio de estado seguirá bloqueado mientras haya préstamo activo.
- Comprobar el préstamo activo en `PUT /api/equipos/{id}` antes de permitir cambiar el código (hoy se
  usa el estado `Prestado` como señal).
- Pantallas de préstamo, devolución, préstamos activos e historial con los mismos componentes.
- E2E de los escenarios de la Actividad 6 y los indicadores de la iteración 5.

---

## Iteración 4 — Préstamos y devoluciones

**Fecha:** 17/11/2026
**Rama:** `feature/iteracion-4-prestamos` → `develop`
**Objetivo:** RF-09 a RF-12 y RN-01 a RN-06 y RN-10: solicitar, aprobar o rechazar, devolver, consultar
los préstamos activos y el historial, con las reglas del PDF y el cambio de estado del equipo en la
misma transacción.

### Alcance

- Entidad `Prestamo` con equipo, responsable, periodo, estado, observación de la devolución, motivo del
  rechazo y fecha real; enumeración `EstadoPrestamo` (`Solicitado`, `Activo`, `Devuelto`, `Rechazado`,
  D-05) y objeto de valor `PeriodoDePrestamo` (RN-04).
- Casos de uso de solicitar, aprobar, rechazar, devolver, listar el historial, listar los activos y
  consultar el detalle, con comandos, datos de salida, unidad de trabajo y errores en español.
- `ContextoDeTechAsset`, configuración EF con `HasColumnName` en snake_case, índice único parcial
  `uq_prestamos_equipo_activo`, CHECK de estado, de fechas y de observaciones, claves foráneas con
  `ON DELETE RESTRICT` y migración `CrearPrestamos`.
- Repositorio de escritura con bloqueo `SELECT … FOR UPDATE`, unidad de trabajo transaccional y consulta
  de lectura con filtros, vencimiento calculado y proyección sin cargar entidades.
- WebApi: `PrestamosControlador` con los seis endpoints del SDD y permisos por rol; el Colaborador
  solicita y ve solo lo suyo, el Responsable aprueba, rechaza y devuelve, el Administrador supervisa y
  también aprueba.
- Bloqueo de edición de equipos contra el préstamo activo **real**, no solo contra `estado_equipo`.
- SPA: historial con filtros, solicitud, préstamos activos con vencidos resaltados, detalle con
  aprobación, rechazo y devolución con observación obligatoria, y disponibilidad con acceso directo a la
  solicitud; rutas y menú por rol.
- Pruebas xUnit de dominio, casos de uso, permisos, alcance por rol y RN-06, y pruebas Vitest de reglas y
  del formulario de solicitud.

### Tareas y tiempo aproximado

| Tarea | Tiempo |
|---|---|
| Dominio: entidad, periodo, estados y reglas | 1,0 h |
| Casos de uso, comandos, datos e interfaces | 1,5 h |
| EF Core, configuración, repositorio, unidad de trabajo, consulta y migración | 1,5 h |
| WebApi: contratos, controlador, permisos y mensajes | 1,0 h |
| Pruebas xUnit y ajustes | 1,5 h |
| Frontend: api, reglas, componentes base y de préstamos | 1,5 h |
| Pantallas de historial, solicitud, activos, detalle y disponibilidad | 2,5 h |
| Pruebas Vitest, lint y build | 0,5 h |
| Migración, flujo con curl y verificación | 0,5 h |

### Decisiones

No cambió ninguna decisión del Anexo A. Se aplicaron D-04 (el Colaborador solicita y el Responsable
aprueba; la fecha de préstamo es la de la aprobación), D-05 (`estado_prestamo` y
`fecha_devolucion_real`; el equipo pasa a `Prestado` al aprobar y vuelve a `Disponible` al devolver) y
D-09 (el vencimiento se calcula, no se guarda).

Decisiones de implementación que no alteran el contrato:

- **Solo el Colaborador solicita** y el responsable es siempre el colaborador de la sesión. El cuerpo de
  `POST /api/prestamos` no lleva `id_usuario`: así no se puede registrar un préstamo a nombre de otro y
  RN-05 se cumple por construcción. El frontend muestra al responsable como dato fijo del formulario.
- **`fecha_prestamo` es nula mientras el préstamo está Solicitado** y se fija el día de la aprobación
  (D-04). El CHECK `fecha_devolucion > fecha_prestamo` se cumple con nulo y se vuelve a validar al
  aprobar. Por eso los filtros por rango de fechas usan la fecha de préstamo y dejan fuera las
  solicitudes pendientes, que se buscan por estado.
- Se agregó **`motivo_rechazo_prestamo`** (5 a 500 caracteres): el SDD pide que el rechazo guarde el
  motivo y el modelo del PDF no tenía dónde. Se agregó **`fecha_solicitud_prestamo`** para ordenar las
  solicitudes pendientes y auditar cuándo se pidieron.
- El **patrón State** del SDD se implementó como transiciones explícitas en `Prestamo` (Aprobar, Rechazar
  y RegistrarDevolucion con sus guardas) y un enum para la columna y el JSON. Se prefirió una sola
  fuente de verdad frente a una jerarquía de estados duplicada con la base; queda anotado por si la
  iteración 6 quiere extraerlo.
- **RN-06 sin endpoint de borrado:** TechAsset no elimina equipos. La regla vive en
  `Equipo.ValidarEliminacion`, está probada, y la base la refuerza con `ON DELETE RESTRICT` en
  `fk_prestamos_equipo`. Si algún día se agrega un borrado, no podrá pasar por alto el historial.
- **Nombres JSON de las fechas:** `fecha_devolucion` y `fecha_devolucion_real` se fijan con
  `JsonPropertyName` para que coincidan con el SDD; sin eso, la regla de nombres del proyecto generaba
  `fecha_devolucion_prestamo` y el campo del contrato se ignoraba en silencio.
- **`PATCH /api/prestamos/{id}/aprobacion`** recibe `aprobado_prestamo` (verdadero aprueba; falso rechaza
  y exige `motivo_rechazo_prestamo`), de modo que un solo endpoint cubre la decisión como en el SDD.
- El **código `PRE-AAAA-NNNN`** que menciona la vista de algoritmo del SDD no se implementó: no es un
  requisito del PDF ni de RF-09 a RF-12 y habría exigido una secuencia en la base. Queda como pendiente
  documentado para la iteración 6.

### Artefactos

- `backend/src/TechAsset.Domain/Entidades/Prestamo.cs`, `Comun/PeriodoDePrestamo.cs`,
  `Comun/CamposDePrestamo.cs` y `Enumeraciones/EstadoPrestamo.cs`.
- `backend/src/TechAsset.Domain/Entidades/Equipo.cs`: `ValidarPrestable`, `ValidarEliminacion` y las
  comprobaciones de préstamo activo en `Actualizar` y `CambiarEstado`.
- `backend/src/TechAsset.Application/CasosDeUso/` (solicitar, aprobar, rechazar, devolver, listar,
  listar activos y obtener), `Comandos/`, `Datos/` e `Interfaces/`.
- `backend/src/TechAsset.Infrastructure/Persistencia/Configuraciones/ConfiguracionDePrestamo.cs`,
  `Repositorios/RepositorioDePrestamos.cs`, `Repositorios/UnidadDeTrabajo.cs`,
  `Consultas/ConsultaDePrestamos.cs` y `Migraciones/20261118003449_CrearPrestamos.cs`.
- `backend/src/TechAsset.WebApi/Controladores/PrestamosControlador.cs`, `Contratos/` y
  `TechAsset.http`.
- `backend/tests/TechAsset.Pruebas/`: `PruebasDePrestamos`, `PruebasDeSolicitudDePrestamos`,
  `PruebasDeAprobacionYDevolucion`, `PruebasDeConsultaDePrestamos`, `PruebasDePermisosDePrestamos` y
  los dobles `RepositorioDePrestamosEnMemoria`, `ConsultaDePrestamosDePrueba`, `RelojDePrueba`,
  `UnidadDeTrabajoDePrueba` y `FabricaDePrestamos`.
- `frontend/src/api/prestamosApi.js`, `reglas/prestamos.js`, `components/prestamos/`,
  `components/ui/DateInput.jsx`, `components/ui/TextAreaInput.jsx` y las páginas `PaginaPrestamos`,
  `PaginaNuevoPrestamo`, `PaginaPrestamosActivos`, `PaginaDetallePrestamo` y `PaginaDisponibilidad`.
- `README.md`, la ERS y el SDD regenerados con los estados de implementación, y este registro.

### Verificación

| Comprobación | Resultado |
|---|---|
| `dotnet build -warnaserror` en `backend/` | 0 errores, 0 advertencias |
| `dotnet test` en `backend/` | 175 pruebas, 175 en verde |
| `dotnet ef migrations has-pending-model-changes` | «No changes have been made to the model since the last migration.» |
| Migración en PostgreSQL | `20261118003449_CrearPrestamos` aplicada; tabla `prestamos` con `uq_prestamos_equipo_activo` (parcial), `ck_prestamos_estado`, `ck_prestamos_fechas`, `ck_devolucion_observacion`, `fk_prestamos_equipo`, `fk_prestamos_usuario` e índices de consulta |
| `pnpm lint` | Sin avisos |
| `pnpm test` | 68 pruebas, 68 en verde (12 archivos) |
| `pnpm build` | 362,84 kB de JavaScript; `dist/` generado |
| Flujo con curl | solicitar 201; aprobar 200 con el equipo en `Prestado`; segundo préstamo 409; devolución sin observación 400; devolución 200 con el equipo en `Disponible`; fecha no posterior 400; Colaborador aprobando 403; sin cookie 401; equipo en Mantenimiento y en Baja 409; historial con alcance por rol 200 |
| Limpieza | El equipo y el préstamo de prueba se eliminaron; la base quedó con 0 equipos, 0 préstamos y los 3 usuarios de las iteraciones anteriores |

Respuestas resumidas del flujo con curl (API en `http://localhost:5321`, hoy en Lima 2026-11-17):

```text
POST /api/equipos (Responsable)                       201  Equipo registrado. TK-2026-9101 / Disponible
POST /api/prestamos (Colaborador)                     201  Préstamo solicitado. Solicitado / 2026-11-24 / Carlos Mendoza
GET  /api/equipos/{id} tras la solicitud              200  Disponible (todavía no ocupa el equipo)
PATCH /api/prestamos/{id}/aprobacion (Responsable)    200  Préstamo aprobado. Activo / fecha_prestamo 2026-11-17
GET  /api/equipos/{id} tras la aprobación             200  Prestado
POST /api/prestamos del mismo equipo                  409  El equipo ya tiene un préstamo activo. Elija otro equipo disponible.
GET  /api/prestamos/activos (Responsable)             200  total=1, Activo, vencido=false
PATCH .../devolucion sin observación                  400  errors.observacion_prestamo: «Registre las observaciones de la devolución.»
PATCH .../devolucion con observación                  200  Devuelto / 2026-11-17 / «Devuelto con el cargador, sin golpes.»
GET  /api/equipos/{id} tras la devolución             200  Disponible
POST /api/prestamos con fecha_devolucion=hoy          400  errors.fecha_devolucion: «…debe ser posterior a la fecha de hoy.»
PATCH .../aprobacion como Colaborador                 403  Su rol no permite esta operación.
POST /api/prestamos sin cookie                        401  Debe iniciar sesión.
POST /api/prestamos de un equipo en Mantenimiento     409  No se puede prestar el equipo: está en estado Mantenimiento…
POST /api/prestamos de un equipo en Baja              409  No se puede prestar el equipo: está en estado Baja…
GET  /api/prestamos (Responsable)                     200  total=1, Devuelto
GET  /api/prestamos (Colaborador)                     200  total=1, solo «Carlos Mendoza»
```

### Defectos encontrados y corregidos

1. El contrato JSON de la fecha de devolución no coincidía: la regla de nombres del proyecto generaba
   `fecha_devolucion_prestamo`, así que un cuerpo con `fecha_devolucion` se deserializaba en nulo y la
   solicitud llegaba sin fecha. Se fijó con `JsonPropertyName("fecha_devolucion")` en la solicitud y en
   las respuestas, y se agregó una prueba del error 400 con el campo correcto.
2. La prueba de historial del Colaborador daba 0 filas porque el usuario del esquema de autenticación de
   prueba era un `Guid` nuevo en cada petición; se fijó un identificador de prueba y se siembra un
   préstamo propio antes de cada caso.
3. El segundo préstamo del mismo equipo respondía con el mensaje del estado (`Prestado`) y no con el de
   RN-01. Se cambió el orden en el caso de uso: primero el préstamo activo real y después el estado.
4. La prueba que esperaba «prestado» en el mensaje del cambio de código de un equipo prestado se actualizó
   al mensaje nuevo, que ahora habla de «préstamo activo» porque la comprobación es contra los préstamos.
5. `EjecutarSqlAsync` con `SELECT … FOR UPDATE` se ejecuta dentro de la transacción de la unidad de
   trabajo; se comprobó que una aprobación sin fecha válida deja el préstamo y el equipo como estaban.

### Retrospectiva

- **Bien:** el SDD ya traía los estados, los endpoints, el índice parcial y las columnas, así que el
  backend se armó sin renombrar el contrato; la unidad de trabajo de una sola operación dejó la
  aprobación y la devolución atómicas sin ensuciar los casos de uso; reutilizar el patrón de permisos,
  errores y pruebas de las iteraciones 2 y 3 ahorró la mitad del trabajo.
- **Difícil:** el modelo del PDF no distingue solicitud de préstamo ni guarda la fecha real; hubo que
  decidir dónde vive la fecha de préstamo (nula hasta la aprobación) y cómo afecta a los filtros. El
  estado `Prestado` del equipo tiene ahora dos caminos (estado y préstamo real) y hay que comprobar
  siempre el préstamo para no dejar equipos bloqueados o liberados de más.
- **Aprendizaje:** las reglas que cruzan dos entidades (RN-01, RN-06) necesitan tres capas —pantalla,
  caso de uso y base— porque cada una falla de una forma distinta; y un nombre de campo mal derivado en
  JSON es un defecto silencioso que solo aparece al probar el flujo completo.

### Pendiente para la iteración 5

- Salidas de RF-13 a RF-17: panel con los seis indicadores, equipos por estado, equipos más utilizados,
  préstamos por área y movimientos.
- Tabla `movimientos` (D-03) y su registro en la misma transacción de cada operación, si la iteración 5
  la necesita para RF-17; hoy la operación de préstamo no la escribe.
- Revisión de interfaz: modo oscuro completo, 390 px, contraste y teclado en las pantallas nuevas.
- Código `PRE-AAAA-NNNN` del SDD y posible extracción del patrón State, si el cierre lo pide.
- E2E de los escenarios E-01 a E-15 del Anexo B del SDD.

---

## Iteración 5 — Salidas, dashboard e interfaz

**Fecha:** 18/11/2026
**Rama:** `feature/iteracion-5-salidas` → `develop`
**Objetivo:** RF-13 a RF-17: los seis indicadores del panel, equipos por estado, equipos más utilizados,
préstamos por área e historial de movimientos; interfaz coherente, modo oscuro y teléfono de 390 px.

### Alcance

- Entidad `Movimiento` con tipo, fecha, equipo, usuario, préstamo (cuando corresponde) y detalle;
  enumeración `TipoMovimiento` con siete tipos: alta, actualización y cambio de estado de equipos, y
  solicitud, aprobación, rechazo y devolución de préstamos.
- Registro automático del movimiento en la misma operación que el hecho: alta, actualización y cambio
  de estado de equipos; solicitud, aprobación, rechazo y devolución de préstamos. El movimiento se
  agrega al mismo contexto y se confirma con el `SaveChanges` de la operación; en aprobación y
  devolución queda dentro de la transacción y del bloqueo `SELECT … FOR UPDATE` que ya existían.
- Migración `20261118010811_CrearMovimientos`: tabla `movimientos`, CHECK del tipo, claves foráneas
  `fk_movimientos_equipo`, `fk_movimientos_usuario` y `fk_movimientos_prestamo` con
  `ON DELETE RESTRICT`, e índices por fecha, tipo, equipo, usuario y préstamo. La misma migración
  agrega `ix_equipos_marca` e `ix_prestamos_fecha_prestamo` para los filtros de los reportes.
- Consultas de salida separadas de los repositorios: `ConsultaDeIndicadores`,
  `ConsultaDeEquiposPorEstado`, `ConsultaDeEquiposMasUtilizados`, `ConsultaDePrestamosPorArea` y
  `ConsultaDeMovimientos`, todas con proyección y `AsNoTracking`.
- Casos de uso de salida y endpoints: `GET /api/reportes/panel`,
  `/equipos-por-estado`, `/equipos-mas-utilizados`, `/prestamos-por-area` y `/movimientos`; el
  historial también responde en `/api/movimientos`. El panel lo consulta cualquier sesión; los
  cuatro reportes, el Responsable de Tecnología y el Administrador. Sin cookie, 401; con rol
  insuficiente, 403.
- SPA: panel con los seis indicadores y una distribución simple en CSS; reportes en cuatro pestañas con
  filtros, tablas accesibles, estados vacíos y paginación; menú por rol con Reportes para el
  Responsable. Modo claro/oscuro, foco visible, tablas apiladas como tarjetas desde 390 px y aviso de
  alcance para el Colaborador.
- Pruebas xUnit de indicadores, ranking, áreas (incluido el empate), movimientos, alcance del panel y
  permisos; pruebas Vitest de las reglas de formato y de los componentes nuevos.

### Tareas y tiempo aproximado

| Tarea | Tiempo |
|---|---|
| Dominio del movimiento, tipos y fábricas de detalle | 0,75 h |
| Registro en los siete casos de uso y ajuste de comandos | 1,0 h |
| Consultas de salida, reglas puras y migración | 1,5 h |
| Controlador de reportes, permisos y errores | 0,75 h |
| Pruebas xUnit y ajustes | 1,5 h |
| Frontend: API, reglas, tarjetas, tablas y pestañas | 2,0 h |
| Panel, reportes, modo oscuro y responsive | 2,0 h |
| Pruebas Vitest, lint y build | 0,75 h |
| Datos de prueba, curl, capturas y limpieza | 1,25 h |

### Decisiones

No cambió ninguna decisión del Anexo A. Se aplicaron D-03 (tabla `movimientos`), D-09 (cuentan Activos
y Devueltos; el área es la del responsable; los empates se muestran completos) y D-10 (los seis
indicadores del PDF no se reemplazan).

Se agregó **D-17**: el panel lo consultan los tres roles. Para el Colaborador, los contadores del
inventario son de toda la empresa (él ya consulta el inventario completo) y «Total de préstamos» y
«Área con mayor uso» se calculan solo con sus préstamos. Los cuatro reportes quedan para el Responsable
y el Administrador, como fija el SDD.

Decisiones de implementación que no alteran el contrato:

- **El movimiento referencia el préstamo cuando existe** (`id_prestamo`), además del equipo y del
  usuario que hizo el hecho; así el historial permite seguir el rastro completo sin deducirlo. El
  usuario del movimiento es el actor de la sesión: en la solicitud es el Colaborador; en la aprobación,
  el rechazo y la devolución, quien decide.
- **El total de equipos suma los cuatro estados, incluido Baja.** El PDF no pide un indicador de Bajas,
  pero sí que el total no pierda equipos; el panel muestra los seis indicadores y la distribución
  incluye solo Disponibles, Prestados y Mantenimiento, sin reemplazar ninguno.
- **El ranking se limita a 10 por defecto y 100 como máximo**, con `limite` en la consulta. El orden
  es cantidad descendente y, en empate, código patrimonial ascendente; las áreas de cada equipo se
  muestran completas si empatan.
- **El filtro de fechas de movimientos usa el día de America/Lima convertido a UTC** (intervalo
  semiabierto), para que el día «hasta» entre completo. Los reportes de área usan `fecha_prestamo`,
  igual que el historial de préstamos.
- **Las áreas sin préstamos aparecen en cero** tomando las áreas del catálogo de usuarios; el
  porcentaje se redondea a un decimal.
- **No se exporta a PDF ni Excel** (D-13): las salidas se consultan dentro del sistema.
- **Se conserva la confirmación en línea** de las pantallas anteriores; el aviso flotante global de
  RNF-04 se completa en la iteración 6 para no rehacer los formularios dos veces.

### Artefactos

- `backend/src/TechAsset.Domain/Entidades/Movimiento.cs`, `Enumeraciones/TipoMovimiento.cs` y
  `Comun/CamposDeMovimiento.cs`.
- `backend/src/TechAsset.Application/Datos/` con los indicadores, las filas de reportes, las páginas de
  movimientos y sus filtros; `ReglasDeReportes.cs`, `RangoDeFechas.cs`,
  `CasosDeUso/ObtenerIndicadoresDelPanelCasoDeUso.cs` y los cuatro casos de uso de reportes;
  `Interfaces/IConsultaDe…` e `IRepositorioDeMovimientos.cs`.
- `backend/src/TechAsset.Infrastructure/Persistencia/Configuraciones/ConfiguracionDeMovimiento.cs`,
  `Repositorios/RepositorioDeMovimientos.cs`, las cinco consultas nuevas en `Consultas/` y
  `Migraciones/20261118010811_CrearMovimientos.cs`.
- `backend/src/TechAsset.WebApi/Controladores/ReportesControlador.cs` y los comandos de equipos y
  préstamos con el usuario de la sesión.
- `backend/tests/TechAsset.Pruebas/`: `PruebasDeMovimientos`, `PruebasDeMovimientosDeOperaciones`,
  `PruebasDeReportes`, `PruebasDePermisosDeReportes`, `ConsultaDeSalidasDePrueba`,
  `RepositorioDeMovimientosEnMemoria` y `FabricaDePruebasDeReportes`.
- `frontend/src/api/reportesApi.js`, `reglas/reportes.js`, `components/ui/CardIndicador.jsx`,
  `components/reportes/` (contenedor de tabla, etiqueta de movimiento y los cuatro reportes),
  `paginas/PaginaInicio.jsx` y `paginas/PaginaReportes.jsx`.
- `frontend/src/index.css` con los tokens de modo oscuro corregidos, `prefers-reduced-motion` y las
  tablas apiladas del teléfono; `index.html` con `color-scheme`.
- `../Evidencias/iteracion-5/` con diez capturas: panel y reportes en escritorio, modo oscuro y
  teléfono de 390 × 844.
- ERS y SDD regenerados (49 y 23 hojas), `README.md` y este registro.

### Verificación

| Comprobación | Resultado |
|---|---|
| `dotnet build -warnaserror` en `backend/` | 0 errores, 0 advertencias |
| `dotnet test` en `backend/` | 215 pruebas, 215 en verde |
| `dotnet ef migrations has-pending-model-changes` | «No changes have been made to the model since the last migration.» |
| Migración en PostgreSQL | `20261118010811_CrearMovimientos` aplicada; tabla `movimientos` con `ck_movimientos_tipo`, tres claves foráneas `RESTRICT` y cinco índices; `ix_equipos_marca` e `ix_prestamos_fecha_prestamo` |
| `pnpm lint` | Sin avisos |
| `pnpm test` | 87 pruebas, 87 en verde (18 archivos) |
| `pnpm build` | 157 módulos; 385,74 kB de JavaScript y 30,73 kB de CSS; `dist/` generado |
| Panel con curl | 6 equipos, 3 disponibles, 1 prestado, 1 en mantenimiento, 6 préstamos; áreas «Recursos Humanos» y «Soporte» empatadas y completas |
| Reportes con curl | Equipos por estado: 3/1/1/1 y total 6; ranking: TK-9005 y TK-9006 con 2, luego TK-9001 y TK-9004 con 1; áreas: 3 y 3 (50 % cada una) más dos áreas en cero; movimientos: 25, paginados y filtrados por tipo, equipo, usuario y fechas |
| Permisos con curl | Panel sin cookie 401; Colaborador en los cuatro reportes 403; Administrador y Responsable 200; `/api/movimientos` 200 |
| Errores con curl | Rango invertido 400 con `errors.desde`; tipo de movimiento inválido 400 con `errors.tipo` en español |
| Limpieza | Se borraron 25 movimientos, 7 préstamos, 6 equipos y la cuenta de prueba; la base quedó con 3 usuarios, 0 equipos, 0 préstamos y 0 movimientos |
| Capturas | `01-panel-escritorio.png` a `10-movimientos-telefono.png`; el panel y las tablas no desbordan la página a 390 px |
| Contraste | Tokens medidos en claro y oscuro: texto 15,06:1 y 16,14:1; texto suave 6,40:1 y 8,12:1; estados entre 4,85:1 y 9,23:1; se corrigieron `marca-50` y el texto de los botones en oscuro |

Respuestas resumidas de la verificación con curl (API en `http://localhost:5321`):

```text
GET  /api/reportes/panel (Administrador)       200  total=6, disponibles=3, prestados=1, mantenimiento=1,
                                                    préstamos=6, áreas=[Recursos Humanos, Soporte]
GET  /api/reportes/panel (Colaborador)         200  total=6, disponibles=3, préstamos=3, área=Recursos Humanos
GET  /api/reportes/equipos-por-estado          200  Disponible=3, Prestado=1, Mantenimiento=1, Baja=1, total=6
GET  /api/reportes/equipos-mas-utilizados      200  TK-9005=2, TK-9006=2, TK-9001=1, TK-9004=1
GET  /api/reportes/prestamos-por-area          200  total=6: Recursos Humanos=3 (50 %), Soporte=3 (50 %),
                                                    Gerencia de Tecnología=0, Tecnología=0
GET  /api/reportes/movimientos?tamano=3        200  total=25; los tres últimos son devolución, aprobación y solicitud
GET  /api/movimientos?tipo=PrestamoDevuelto…   200  filtra por tipo, equipo y fechas
GET  /api/reportes/panel (sin cookie)          401  Debe iniciar sesión.
GET  /api/reportes/* (Colaborador)             403  Su rol no permite esta operación.
GET  /api/reportes/prestamos-por-area rango    400  errors.desde: «La fecha inicial no puede ser posterior…»
GET  /api/reportes/movimientos?tipo=Nada       400  errors.tipo: «El tipo de movimiento debe ser …»
```

### Defectos encontrados y corregidos

1. En modo oscuro, `marca-50` conservaba el azul claro del modo claro y los textos `marca-800` de las
   pestañas y etiquetas quedaban con 1,62:1. Se definió `marca-50` oscuro (#0f2f42) y el contraste subió
   a 7,86:1.
2. Los botones primarios usaban `text-white` sobre `marca-700`, que en oscuro es un azul claro (2,22:1).
   Se agregaron los tokens `sobre-marca` y `sobre-error`, con texto azul profundo en modo oscuro
   (6,58:1 y 7,8:1), y se aplicaron a botones, chips y marca.
3. Las tablas de reportes se desplazaban en horizontal dentro de su contenedor, pero a 390 px la
   lectura era incómoda. Se apilaron como tarjetas con `data-etiqueta` y CSS, siguiendo la guía
   `responsive-table`; el encabezado se oculta y cada celda muestra su etiqueta.
4. La prueba del menú del Responsable esperaba dos accesos; al agregar Reportes son tres. Se actualizó
   la prueba, no el menú.
5. El índice de la clave foránea `id_prestamo` salía con nombre PascalCase por convención de EF Core.
   Se nombró `ix_movimientos_prestamo` en la configuración y se regeneró la migración.
6. El doble de pruebas de salidas necesitó `using TechAsset.Application;` para resolver
   `ReglasDeReportes`; se corrigió el alcance del nombre, no la regla.

### Retrospectiva

- **Bien:** separar las reglas puras (`ReglasDeReportes`, `IndicadoresDelPanel.Desde`, `RangoDeFechas`)
  de las consultas de EF Core permitió probar empates, porcentajes y sumas sin base de datos; las
  consultas quedaron cortas y con proyección. El movimiento dentro de la misma transacción no obligó a
  reabrir los casos de uso: solo se agregó al contexto antes del `SaveChanges`.
- **Difícil:** el alcance del panel para el Colaborador no estaba fijado por el PDF; se resolvió con
  D-17 y se probó en la API y en el componente. El modo oscuro reveló dos problemas de contraste que
  no se ven en claro: los tokens de fondo y el texto de los botones deben revisarse por separado.
- **Aprendizaje:** una tabla «responsive» no es solo `overflow-x-auto`: a 390 px hay que cambiar el
  formato. Los datos de prueba deben cubrir empates y áreas en cero, porque son los casos que el
  usuario usa para decidir y los que un reporte suele romper.

### Pendiente para la iteración 6

- RNF-04: aviso flotante global de confirmación (role=`status`, cierre a los 8 s) y revisión de los
  mensajes en línea de las pantallas anteriores.
- E2E de los escenarios E-01 a E-15 del Anexo B, ahora con el panel y los reportes.
- Código `PRE-AAAA-NNNN` del SDD y posible extracción del patrón State.
- Copia de la versión anterior de la ERS/SDD en `Historico/` al regenerar (en esta iteración se
  regeneraron directamente; el histórico conserva la versión previa a la iteración 4).
- Publicación (Vercel + Render + Supabase) y los diez productos de la entrega.

---

## Iteración 6 — Integración, endurecimiento y pruebas de punta a punta (primera parte)

**Fecha:** 18/11/2026
**Rama:** `feature/iteracion-6-endurecimiento` → `develop`
**Objetivo:** dejar el código listo y probado de punta a punta: corregir la distribución del panel,
completar el aviso flotante global (RNF-04), unificar la versión del pie, ejecutar los escenarios
E-01 a E-15 del Anexo B y endurecer el ingreso. La publicación y los documentos quedan para la
segunda parte.

### Alcance

- **Panel:** la distribución del inventario ahora incluye la barra de `Baja` con su color y su
  porcentaje; las cuatro barras suman el total de equipos que ya contaba la tarjeta.
- **RNF-04:** aviso flotante global de éxito y error, abajo a la derecha, con `role="status"`,
  cierre automático a los 8 s y botón de cerrar con nombre accesible. Está conectado a las altas,
  ediciones y cambios de estado de usuarios y equipos, a la solicitud, aprobación, rechazo y
  devolución de préstamos, y al cierre de sesión. Los mensajes de error y de validación siguen en
  línea, junto a su campo o junto al botón de enviar.
- **Versión:** el pie muestra `TechAsset · versión 1.0.0 · 2026` desde una sola constante en el
  frontend (`src/reglas/version.js`), coherente con `VersionDelProducto` de la API y con
  `/api/salud`.
- **Pruebas de punta a punta:** `Semanas/.herramientas/caso_unidad3_2/pruebas.py` arranca la API
  (5321) y la SPA (5191) si no están en marcha, usa Brave sin interfaz mediante
  `Semanas/.herramientas/comun/navegador.py`, recorre los escenarios E-01 a E-15, toma capturas en
  `../Evidencias/iteracion-6/`, limpia lo que crea y detiene lo que arrancó.
- **Refactor Clean Code:** se extrajeron `SeccionNumerada` y `AccionesDeFormulario` para los tres
  formularios; se unificaron las validaciones repetidas de `Equipo` y `Usuario`; la traducción de
  errores de modelo pasó de una cadena de `if` a una tabla; se eliminó la página
  `PaginaEnConstruccion` y el retorno sin uso `establecerMensaje` del hook de formulario.
- **Endurecimiento:** límite de cinco ingresos fallidos por minuto para la misma combinación de
  correo y dirección de origen, con respuesta 429, `Retry-After: 60` y mensaje en español. El
  ingreso correcto limpia el contador. Se revisó que los errores no devuelvan correo, documentos,
  contraseñas ni detalles técnicos (RNF-02, RNF-19) y se agregaron pruebas.

### Tareas y tiempo aproximado

| Tarea | Tiempo |
|---|---|
| Barra de Baja, versión única y pruebas del panel | 0,5 h |
| Aviso flotante global, contexto y conexión con las acciones | 1,5 h |
| Refactor de formularios, validaciones y errores de modelo | 1,0 h |
| Límite de intentos, 429 y pruebas de errores sin datos personales | 1,0 h |
| Suite E2E: arranque, escenarios, capturas y limpieza | 2,5 h |
| Ajustes de la suite y revisión de capturas | 1,0 h |
| Verificación completa y este registro | 0,5 h |

### Decisiones

No cambió ninguna decisión del Anexo A. Se aplicaron D-05 (el estado `Baja` cuenta en el total y
ahora también se dibuja), D-10 (los seis indicadores se conservan) y D-17 (el alcance del panel por
rol no cambia).

Decisiones de implementación que no alteran el contrato:

- **La barra de Baja se deriva del total** (`total − disponibles − prestados − mantenimiento`) en
  lugar de agregar un campo al JSON del panel. El contrato de la API y las columnas no cambian y
  las cuatro barras cuadran con el total, que ya incluía `Baja`.
- **El aviso reemplaza las confirmaciones de éxito que viajaban por el estado de navegación.** Los
  errores de formulario, los errores de campo y los avisos de alcance por rol siguen en línea: no
  se perdió ningún mensaje, solo se movió la confirmación de éxito al aviso flotante.
- **La región `role="status"` está siempre montada** y su contenido cambia cuando hay un aviso,
  para que el lector de pantalla anuncie el texto sin depender de insertar la región en el mismo
  instante. El error usa el mismo anuncio amable y su color e ícono propios; los errores de campo
  conservan `role="alert"` en su lugar.
- **La versión se repite en dos constantes de dos lenguajes** (`VersionDelProducto.Valor` y
  `VERSION_DEL_PRODUCTO`) porque no hay compilación compartida; ambas quedan documentadas para
  subirlas juntas. La prueba del pie y la de `/api/salud` las vigilan.
- **El límite de intentos vive en memoria de la API** (singleton) y cuenta solo los rechazos por
  credenciales, no los ingresos correctos ni los cuerpos inválidos. Al reiniciar se libera. Para
  una sola instancia es suficiente; si se publica con varias réplicas habría que llevarlo a un
  almacén compartido (queda como riesgo).
- **La suite E2E usa las cuentas locales del CONTEXTO** y crea sus propios datos con prefijos
  `TK-E2E-` y `e2e.prueba@`; no depende de datos de iteraciones anteriores y borra lo suyo al
  empezar y al terminar.
- **No se regeneraron la ERS ni el SDD en esta parte**, por pedido explícito de no generar
  documentos todavía. El estado de RNF-04 y los conteos se actualizarán en la segunda parte.

### Artefactos

- `backend/src/TechAsset.WebApi/Seguridad/LimiteDeIntentosDeIngreso.cs` y
  `FiltroDeIntentosDeIngreso.cs`.
- `backend/src/TechAsset.WebApi/Respuestas/RespuestasDeError.cs` (constructor único del
  ProblemDetails) y `Middleware/ErroresDeModelo.cs` (tabla de traducciones).
- `backend/src/TechAsset.Domain/Entidades/Equipo.cs` y `Usuario.cs` (validaciones compartidas);
  `Comun/VersionDelProducto.cs`.
- `backend/tests/TechAsset.Pruebas/WebApi/PruebasDeLimiteDeIntentosDeIngreso.cs`,
  `PruebasDeIngresoEndurecido.cs`, `PruebasDeErrores.cs`, `FabricaDePruebasDeAcceso.cs` y
  `Dobles/RelojAvanzable.cs`.
- `frontend/src/contextos/contextoDeAvisos.js`, `ProveedorDeAvisos.jsx` y
  `components/ui/AvisoFlotante.jsx`.
- `frontend/src/components/ui/SeccionNumerada.jsx` y `AccionesDeFormulario.jsx`; los tres
  formularios adaptados.
- `frontend/src/reglas/version.js` y `reglas/reportes.js` con `distribucionDelInventario`.
- `frontend/src/paginas/` y `layouts/LayoutPrincipal.jsx` con el aviso conectado y sin los avisos
  de éxito duplicados.
- `Semanas/.herramientas/caso_unidad3_2/pruebas.py` con la suite E2E.
- `../Evidencias/iteracion-6/` con las capturas: ingreso, ingreso con error, panel, aviso
  flotante, inventario con filtros, solicitud, aprobación, devolución, reportes de estados y
  movimientos, y panel en teléfono de 390 px.

### Verificación

| Comprobación | Resultado |
|---|---|
| `dotnet build -warnaserror` en `backend/` | 0 errores, 0 advertencias |
| `dotnet test` en `backend/` | 225 pruebas, 225 en verde |
| `dotnet ef migrations has-pending-model-changes` | «No changes have been made to the model since the last migration.» |
| `pnpm lint` | Sin avisos |
| `pnpm test` | 95 pruebas, 95 en verde (20 archivos) |
| `pnpm build` | 163 módulos; 384,73 kB de JavaScript y 31,68 kB de CSS; `dist/` generado |
| Suite E2E completa | 50 de 50 pruebas correctas (E-01 a E-15, RNF-04, endurecimiento del ingreso, reportes y teléfono) |
| Limpieza de la base | 3 usuarios, 0 equipos, 0 préstamos y 0 movimientos |
| Capturas | Revisadas: el panel muestra las cuatro barras (Baja en rojo), el aviso no tapa el contenido, los reportes y el teléfono no desbordan |
| Secretos | `git status` sin cadenas de conexión ni contraseñas; la suite lee la cadena de user-secrets y no la imprime |

Resumen de la suite E2E (API en 5321 y SPA en 5191, Brave sin interfaz):

```text
✓ Sin sesión, una pantalla del sistema lleva al ingreso
✓ Ingreso: credenciales incorrectas con mensaje general, sin decir qué falló
✓ Ingreso: el Administrador entra y su nombre aparece en la barra
✓ Pie: la versión sale de una sola constante y dice 1.0.0
✓ E-01 Registrar usuario: aparece en el listado
✓ RNF-04: el éxito se anuncia en el aviso flotante role=status
✓ RNF-04: el aviso se cierra solo a los 8 s
✓ E-02 Registrar equipo: aparece Disponible en el inventario
✓ E-03 Registrar préstamo: el Colaborador envía la solicitud
✓ E-03: al aprobar, el préstamo queda Activo y el equipo Prestado
✓ E-04 Registrar devolución: el préstamo queda Devuelto y el equipo Disponible
✓ E-05 Consultar inventario: estado y categoría dejan solo la laptop disponible
✓ E-06 Historial: el Colaborador ve solo sus préstamos
✓ E-07 Dashboard: los seis indicadores coinciden con la base
✓ E-07: la distribución incluye la barra de Baja con su porcentaje
✓ E-08: prestar un equipo en Mantenimiento responde 409 y no lo cambia
✓ E-09: prestar un equipo en Baja responde 409 y no lo cambia
✓ E-10: la fecha de devolución anterior responde 400 en fecha_devolucion
✓ E-11: devolver sin observación responde 400 y el préstamo sigue Activo
✓ E-12: un segundo préstamo del mismo equipo responde 409
✓ E-14: dar de baja un equipo prestado responde 409 y no lo cambia
✓ E-13: deshabilitar usuarios sin ser Administrador responde 403
✓ E-15: un usuario deshabilitado recibe 401 con el mensaje general
✓ Endurecimiento: seis intentos fallidos responden 429 en el sexto, con espera de un minuto
✓ Endurecimiento: el mensaje del 429 está en español y no revela datos
✓ Reportes: la pestaña de equipos por estado carga su tabla
✓ Reportes: el historial de movimientos muestra los hechos de la prueba
✓ Teléfono: el panel no desborda a 390 px
✓ Teléfono: la distribución sigue mostrando la barra de Baja
✓ Limpieza: la base queda con 3 usuarios, 0 equipos, 0 préstamos y 0 movimientos

50 de 50 pruebas correctas
```

### Defectos encontrados y corregidos

1. La barra de `Baja` no se dibujaba aunque el total la contaba. Se agregó a partir del total y se
   probó la suma de las cuatro barras con datos donde `Baja` no era cero.
2. El aviso flotante se ocultaba con `empty:hidden` cuando no había mensaje; una región
   `display:none` no se anuncia al insertar el texto. Se dejó siempre montada y sin contenido.
3. Las pruebas de la E2E comparaban el estado del equipo con el texto exacto de la celda, que
   incluye el ícono; se cambió a comprobar el nombre dentro del texto, no el formato.
4. El filtro por texto de la E2E navegaba con `?texto=`, pero la pantalla de inventario guarda los
   filtros en estado y no lee la cadena de consulta; la prueba ahora usa el formulario como el
   usuario. (El comportamiento de la pantalla es el acordado; el defecto era de la prueba.)
5. La comprobación de credenciales incorrectas buscaba «no existe» en toda la página y la propia
   ayuda del ingreso dice «No existe registro propio». Se limitó la comprobación al mensaje de
   error.
6. Los nombres de las tarjetas del panel se leen en mayúsculas por el estilo `uppercase`; la
   prueba comparaba contra el texto del código. Se normalizó a minúsculas en la prueba.
7. El primer intento de la E2E era sensible al momento en que React tomaba los valores del
   formulario de ingreso; se agregó una comprobación de que el correo, la contraseña y el botón
   están listos antes de enviar, con reintento acotado.
8. `ErroresDeModelo` tenía una cadena de `if` que crecía con cada enum; se reemplazó por una tabla
   con el mismo orden y los mismos mensajes.

### Retrospectiva

- **Bien:** el contrato del SDD y los escenarios del Anexo B permitieron escribir la suite sin
  decidir requisitos nuevos; el aviso global se conectó sin tocar los formularios, porque el hook
  de formulario ya separaba los errores de campo del mensaje general; derivar `Baja` del total
  evitó cambiar el JSON y la base.
- **Difícil:** la prueba de punta a punta reveló diferencias entre lo que la pantalla hace y lo que
  un lector del código supone (los filtros no viven en la URL, el estado lleva ícono). El límite de
  intentos debía contar solo fallos y, a la vez, no meter `try/catch` en el controlador; el filtro
  de acción resolvió las dos cosas.
- **Aprendizaje:** una suite E2E debe comprobar la base y limpiar sus datos, no solo mirar la
  pantalla; y toda confirmación de éxito necesita un solo camino para no duplicar mensajes.

### Pendiente para la segunda parte de la iteración 6

- Publicación (Vercel + Render + Supabase) si el alumno la pide, con variables de entorno y sin
  secretos en el repositorio.
- Regenerar la ERS y el SDD con los estados «Implementado en la iteración 6», el conteo real de
  pruebas y las capturas; actualizar el `CONTEXTO` y el `README` final.
- Informe técnico, presentación de sustentación y `Entrega/` con los diez productos.
- Riesgos abiertos: el límite de intentos es por instancia; el patrón State formal y el código
  `PRE-AAAA-NNNN` del SDD siguen anotados como no requisito; la suite E2E necesita Brave, `psql` y
  las cuentas locales.

---

## Iteración 6 — Segunda parte: documentos, entrega y publicación preparada

**Fecha:** 18/11/2026
**Rama:** `feature/iteracion-6-documentos` → `develop`
**Objetivo:** cerrar los documentos y la entrega con datos reales, preparar la sustentación y dejar la
publicación lista sin desplegar.

### Alcance

- ERS 0100 y SDD 0100 regenerados con los estados de implementación al cierre de la iteración 6;
  las versiones anteriores se guardaron en `Analisis/ERS/Historico/` y `Analisis/SDD/Historico/`.
- Informe técnico breve en el formato del informe de ReservaUPLA: carátula, trece secciones y
  galería apaisada, con capturas reales de `Evidencias/iteracion-5` y `iteracion-6`.
- `Entrega/` con los diez productos del punto 12 del caso y un `00-LEEME.md` que los relaciona.
- Presentación de sustentación de 13 diapositivas y guion de 10 a 12 minutos.
- `docs/despliegue.md`, `backend/Dockerfile`, `backend/.dockerignore` y `frontend/vercel.json`.
- README, estándares y este registro actualizados con la segunda parte.

### Tareas y tiempo aproximado

| Tarea | Tiempo |
|---|---|
| Revisar estados de la ERS y del SDD | 0,5 h |
| Regenerar ERS y SDD, archivar versiones y revisar hojas | 1,0 h |
| Informe técnico breve: contenido, formato y capturas | 2,0 h |
| Documentos de la entrega: backend, frontend, componentes, validaciones, consultas y dashboard | 2,0 h |
| Presentación de 13 diapositivas y guion | 1,5 h |
| Publicación preparada: Dockerfile, vercel.json y guía | 1,0 h |
| Verificación completa, revisión visual y este registro | 1,0 h |

### Decisiones

- **La versión sigue siendo 0100.** La ERS y el SDD mantienen la línea base de requisitos y diseño;
  lo que cambió es el estado de implementación, que se anota en cada ficha y en la historia del
  documento. Así se conservan las referencias `[2]` y `[10]` y el nombre del archivo entregable.
- **Se documentan las migraciones reales: cuatro.** El encargo mencionaba siete; el repositorio, la
  base y `dotnet ef migrations list` muestran cuatro (`CrearUsuarios`, `CrearEquipos`,
  `CrearPrestamos` y `CrearMovimientos`). No se inventaron migraciones para cuadrar el número.
- **Se corrigieron dos imprecisiones del SDD.** La tabla de componentes nombraba `NumberInput` y
  `TableList`, que no existen; ahora lista `TextAreaInput` y `ContenedorDeTabla`. La tabla de
  patrones presentaba un State y un Factory formales que no se implementaron; ahora dice
  «transiciones de estado en la entidad» y aclara que el State formal quedó fuera por no ser
  requisito. También se corrigió el código `PRE-AAAA-NNNN`: no se implementó.
- **El informe usa una portada con una captura real** del ingreso, recortada a 16:9; no se generó una
  ilustración artificial ni se copió la foto de ReservaUPLA.
- **La captura del teléfono se recorta** a la parte superior para que quepa en el informe y en la
  presentación; el original completo queda en `Evidencias/iteracion-6/`.
- **La publicación no se ejecuta.** `frontend/vercel.json` usa
  `https://techasset-api.onrender.com` como marcador; al crear el servicio en Render se reemplaza por
  la URL real. No se crearon cuentas ni se subieron secretos.
- **La API se publica con `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`** para que la cookie se marque
  `Secure` cuando el proxy termina TLS.

### Artefactos

- `Semanas/.herramientas/caso_unidad3_2/informe_corto.py`, `entrega.py` y `presentacion.py`.
- `Documentacion/Informe tecnico breve - TechAsset.docx` (8 hojas) y su copia en
  `Entrega/09-informe/`.
- `Entrega/00-LEEME.md`, `01-codigo/LEEME.md`, `02-base-de-datos/` (`esquema.sql`,
  `modelo-de-datos.png` y `LEEME.md`), `03-backend/` (documento, captura de Swagger y 21 respuestas
  JSON), `04-frontend/`, `05-componentes/`, `06-formularios/`, `07-consultas/`, `08-dashboard/` y
  `10-sustentacion/` (`Sustentacion - TechAsset.pptx` y `guion.md`).
- `TechAsset/docs/despliegue.md`, `TechAsset/backend/Dockerfile`,
  `TechAsset/backend/.dockerignore` y `TechAsset/frontend/vercel.json`.
- ERS 0100 (50 hojas), SDD 0100 (23 hojas) y las versiones «antes de la iteración 6» en los
  históricos.

### Verificación

| Comprobación | Resultado |
|---|---|
| `dotnet build -warnaserror` | 0 errores, 0 advertencias |
| `dotnet test` | 225 de 225 |
| `dotnet ef migrations list` | 4 migraciones aplicadas |
| `pnpm lint` | sin avisos |
| `pnpm test` | 95 de 95 (20 archivos) |
| `pnpm build` | 163 módulos; 384,73 kB de JS y 31,68 kB de CSS |
| Suite E2E | 50 de 50 |
| ERS renderizada | 50 hojas, 1 salto automático, 0 títulos sin página, 0 tablas partidas |
| SDD renderizado | 23 hojas, 0 saltos, 0 títulos sin página, 0 tablas partidas |
| Informe renderizado | 8 hojas A4; revisadas carátula, secciones 6–9 y galería apaisada |
| Presentación | 13 diapositivas 16:9; renderizada a PDF y revisadas portada, flujo y cierre |
| `Entrega/` | 10 productos y 0 rutas roscas; `00-LEEME.md` los relaciona |
| Base local | 3 usuarios, 0 equipos, 0 préstamos, 0 movimientos |
| Secretos | `git status` sin cadenas, contraseñas ni claves |

### Defectos encontrados y corregidos

1. El SDD listaba `NumberInput` y `TableList`, que nunca existieron; se reemplazaron por los
   componentes reales.
2. El SDD atribuía al código un patrón State y un Factory formales; se corrigió para describir las
   transiciones en la entidad y se anotó que el State formal no es requisito.
3. La galería del informe usaba la captura completa del teléfono (390 × 2505) y desbordaba la hoja
   apaisada; se recortó y se limitó a cuatro capturas 4:3.
4. La tabla de componentes del informe y el documento de entrega citaban 24 endpoints; el conteo real
   es 25 rutas y 26 operaciones con el alias `/api/movimientos`.
5. Las tablas del informe ignoraban el ancho de columna porque faltaba `tblLayout fixed` y el
   `gridCol`; se corrigió en el generador.
6. Los bloques de código se partían entre páginas; se les puso `keep_together`.
7. La captura de Swagger requería la cookie de sesión; se tomó con `Network.setCookie` y se recortó
   para que no ocupara seis hojas.

### Retrospectiva

- **Bien:** los datos reales de las pruebas y de `curl` permitieron escribir el informe y los
  documentos sin inventar cifras; el generador del informe de ReservaUPLA se adaptó sin copiar su
  contenido. La suite E2E y las capturas ya existían, así que el cierre fue de selección y redacción.
- **Difícil:** el encargo y la realidad no coincidían en el número de migraciones (7 frente a 4); se
  documentó la realidad. Las capturas de teléfono son tiras muy altas y obligan a recortar; los
  generadores deben limitar el alto, no solo el ancho.
- **Aprendizaje:** los documentos también se prueban: hay que renderizarlos, contar hojas, revisar
  tablas partidas y mirar las páginas clave. Un dato falso en el SDD (un componente que no existe)
  se detecta antes leyendo el código que confiando en el documento anterior.

### Pendiente y riesgos

- Desplegar de verdad en Render, Vercel y Supabase cuando el alumno lo pida; reemplazar la URL
  marcador de `vercel.json`.
- El límite de intentos vive en memoria de una instancia; con varias réplicas necesita un almacén
  compartido.
- El State formal y el código `PRE-AAAA-NNNN` siguen fuera de alcance y anotados como no requisito.
- No hay pruebas en Windows; el servidor se verificó en Linux y el navegador en Brave.

## Iteración 7 — Pasada completa de DCU, patrones de interfaz y accesibilidad

**Fecha:** 19/11/2026
**Rama:** `feature/iteracion-7-ux` → `develop`
**Objetivo:** aplicar de forma sistemática el diseño centrado en el usuario sobre la interfaz ya construida, sin
cambiar requisitos, reglas de negocio ni textos de negocio. La iteración 5 solo había usado tres guías
(`responsive-table`, `dark-mode` y `color`); esta pasada recorre todas las pantallas y usa la skill
`modern-web-guidance` como fuente de patrones.

### Alcance

- Auditoría heurística de ingreso, panel, usuarios, equipos, préstamos (solicitud, activos y detalle), reportes y
  páginas de error.
- Formularios con validación después de la interacción, obligatorios con feedback tras el intento, resumen
  accesible, foco en el primer error, `aria-invalid`/`aria-describedby` sincronizados y autocompletado.
- Diálogo de confirmación con el elemento nativo `<dialog>` y `showModal()`.
- Tablas con `caption`, `scope`, encabezado fijo, ordenación accesible donde el conjunto está completo y estados
  vacíos con acción.
- Estados de carga, vacío y error anunciados; aviso flotante con cola, pausa y límite.
- Tema del sistema, claro y oscuro; navegación con enlace de salto, migas de pan, foco visible y objetivos
  táctiles; fechas civiles en America/Lima.
- Pruebas de componente y de punta a punta; capturas antes/después.

### Hallazgos por pantalla

| Pantalla | Hallazgo (heurística) | Corrección |
|---|---|---|
| Ingreso | El botón se deshabilitaba con campos vacíos, así que no se podía provocar el feedback de obligatorios (prevención de errores, ayuda); no había resumen ni autocompletado completo (reconocer antes que recordar). | Botón siempre activo hasta que hay un envío; al intentar entrar se marca lo que falta, se enfoca el primer error y se anuncia el resumen. `autocomplete`, `autocapitalize` y `spellcheck` en el correo. |
| Panel | La carga no se anunciaba como región ocupada y el vacío de inventario no ofrecía acción (visibilidad del estado, flexibilidad). | `aria-busy` en el bloque de indicadores y enlace «Registrar el primer equipo» cuando no hay equipos y el rol puede hacerlo. Título de página «Panel». |
| Usuarios | La tabla no tenía estados vacíos distintos de «sin filtros»; el conteo no se anunciaba; los enlaces de acción tenían un objetivo táctil pequeño (consistencia, accesibilidad). | Estado vacío con «Registrar el primer usuario», conteo con `role=status`, enlaces de 44 px, `aria-busy` y migas de pan en alta y detalle. |
| Equipos | Igual que usuarios; el inventario vacío no distinguía «sin datos» de «sin resultados» (reconocer antes que recordar). | Estado vacío con «Registrar el primer equipo», conteo anunciado, acciones de 44 px y chips de estado de 44 px. |
| Solicitud de préstamo | La fecha no se explicaba como fecha civil y el selector no tenía un estado de error tras interacción (prevención de errores, ayuda). | Fecha con `min` calculado en America/Lima, validación al salir del campo, resumen accesible, reintento de la consulta de disponibilidad y migas de pan. |
| Préstamos activos y detalle | El rechazo y la devolución no anunciaban sus errores; el botón de confirmar era un `div` con rol, sin foco atrapado ni retorno (recuperación de errores, accesibilidad). | `aria-live` en los formularios cortos, `aria-required` visual, diálogo nativo con foco en Cancelar, Escape y retorno de foco. |
| Reportes | Las tablas no se podían ordenar y el encabezado fijo no tenía un contenedor con alto máximo; los filtros no eran una región de búsqueda (flexibilidad, accesibilidad). | `<search>` en los filtros, ordenación con `aria-sort` y anuncio en «Préstamos por área» y «Más utilizados», contenedor con `max-height` y encabezado fijo, estados vacíos con acción. |
| Páginas de error | La 404 y el aviso de rol se dibujaban con un `<main>` dentro del `<main>` del layout; la 404 no tenía salida clara (consistencia, recuperación). | Se cambiaron a `<section>` con un solo `h1`, enlace al inicio y título de documento. |
| Todas | El aviso flotante reemplazaba el anterior; no se podía pausar; el botón de tema solo alternaba claro/oscuro; no había migas ni título por pantalla (visibilidad, control del usuario, accesibilidad). | Cola de hasta tres avisos con pausa al pasar el puntero o enfocar, cierre accesible, tema sistema/claro/oscuro persistido, migas de pan, `<title>` por pantalla, enlace «Ir al contenido» con foco y fechas es-PE. |

### Guía aplicada → cambio

| Guía de `modern-web-guidance` | Cambio en TechAsset |
|---|---|
| `forms` | `<form>` con nombre accesible, `<search>` en los filtros, botón de envío sin deshabilitar por datos faltantes, `autocomplete` en ingreso y alta de usuario, textos de ayuda persistentes y `required` nativo. |
| `validate-input-after-interaction` | `useFormulario` no valida al cargar; al escribir solo limpia el error del campo; al salir valida si hubo edición o valor; al enviar valida todo. |
| `required-field-feedback` | Aviso «Los campos con * son obligatorios» y errores de obligatorios solo después de salir del campo editado o intentar enviar. |
| `accessible-error-announcement` | `aria-invalid` siempre presente (`false`/`true`), `aria-describedby` con ayuda y error a la vez, resumen `role=alert`, aviso `aria-live` y foco en el primer error. |
| `accessibility` | Un solo `main`, enlace de salto, `caption`/`scope` en tablas, títulos de página, nombres accesibles, foco visible, objetivos táctiles de 44 px y `lang="es"`. |
| `dialog` | `ModalConfirmacion` usa `<dialog>` nativo con `showModal()`, `aria-labelledby`, foco inicial en la acción segura, Escape, `::backdrop` y retorno de foco; en jsdom se usa el atributo `open`. |
| `responsive-table` | Tablas de reportes con contenedor `role=region` enfocable, encabezado fijo, alto máximo y apilado en el teléfono con etiquetas `data-etiqueta`. |
| `sortable-table` | Botón dentro del `<th>`, `aria-sort` solo en la columna activa, orden por texto/número con `Intl.Collator`, anuncio único en `role=status` y orden limitado a los reportes que traen todos sus datos. |
| `dark-mode` | `color-scheme` en `:root`, `meta[name=color-scheme]`, tokens para los dos modos y `::backdrop` oscuro. |
| `dark-mode-toggle` | `BotonTema` alterna sistema → oscuro → claro, guarda solo los modos explícitos, sigue el cambio del sistema y anuncia el estado en su nombre accesible. |
| `persistent-toast-notifications` | `ProveedorDeAvisos` mantiene una cola de hasta tres avisos, pausa el cierre con puntero o foco, tiene cierre con nombre y región `aria-label="Notificaciones"`. |
| `form-factor-adaptation` | Objetivos de 44 px en pantallas táctiles, controles que no se solapan, `text-wrap` en títulos y párrafos, tablas y tarjetas sin desbordar a 390 px. |
| `content-first-noise-reduction` | Se quitaron los enlaces «Volver» duplicados en favor de migas de pan; los avisos no empujan el contenido; los estados vacíos explican y ofrecen una acción. |
| `capture-location-agnostic-data` | Las fechas de negocio se tratan como fechas civiles (`AAAA-MM-DD`) y se formatean sin pasar por la zona del navegador; las marcas de tiempo se muestran en `America/Lima` con `Intl.DateTimeFormat('es-PE')`. |
| `color` | Tokens de contraste revisados en tema claro y oscuro; los estados siguen usando color, ícono y texto. |

### Artefactos

- `frontend/src/hooks/useFormulario.js`, `components/ui/CampoBase.jsx`, `TextInput`, `SelectInput`, `DateInput`,
  `TextAreaInput`, `AccionesDeFormulario`, `ResumenDeErrores`, `ModalConfirmacion`, `AvisoFlotante`, `BotonTema`,
  `MigasDePan`, `EncabezadoDePagina`, `ContenedorDeTabla`.
- `frontend/src/contextos/ProveedorDeAvisos.jsx`, `frontend/src/reglas/campos.js`, `frontend/src/reglas/reportes.js`,
  `frontend/src/utils/descripcion.js`, `frontend/src/utils/titulo.js`.
- Páginas de ingreso, inicio, usuarios, equipos, préstamos, reportes y error; `LayoutPrincipal` y `RutaPorRol`.
- Pruebas nuevas o actualizadas en `useFormulario`, `Campos`, `ModalConfirmacion`, `ProveedorDeAvisos`, `BotonTema`,
  `MigasDePan`, `fechas` y `reportes`; pruebas de formularios ajustadas al envío sin bloqueo.
- `Semanas/.herramientas/caso_unidad3_2/pruebas.py`: los selectores del aviso se acotan a `#notificaciones` y el
  diálogo a `dialog[open]`, porque ahora conviven con regiones `role=status` y con el `<dialog>` nativo.
- `Semanas/.herramientas/caso_unidad3_2/sdd.py` y SDD 0100 regenerado (24 hojas); la versión anterior quedó en
  `Analisis/SDD/Historico/SDD TechAsset - 0100 antes de la iteracion 7.docx`.
- Capturas `Evidencias/iteracion-7/antes/` (7) y `Evidencias/iteracion-7/despues/` (8).

### Verificación

| Comprobación | Resultado |
|---|---|
| `dotnet build -warnaserror` | 0 errores, 0 advertencias |
| `dotnet test` | 225 de 225 |
| `pnpm lint` | sin avisos |
| `pnpm test` | 114 de 114 (23 archivos) |
| `pnpm build` | 168 módulos; 400,01 kB de JS y 32,73 kB de CSS |
| Suite E2E | 50 de 50 |
| SDD renderizado | 24 hojas, 0 saltos, 0 títulos sin página |
| Base local | 3 usuarios, 0 equipos, 0 préstamos, 0 movimientos |
| Capturas | ingreso, panel, formulario con errores, diálogo, móvil y modo oscuro revisadas |

### Defectos encontrados y corregidos

1. El botón de enviar se deshabilitaba con datos faltantes, de modo que el feedback de obligatorios nunca aparecía
   al pulsar Guardar; se cambió por validación al enviar y foco en el primer error.
2. El error de un campo reemplazaba a su texto de ayuda y `aria-describedby` apuntaba solo a uno de los dos; ahora
   se muestran y se enlazan ambos.
3. El diálogo de confirmación era un `div` con `role="dialog"`: no atrapaba el foco ni lo devolvía. Se reemplazó por
   `<dialog>` nativo y se conservó un camino operable para jsdom.
4. El aviso flotante reemplazaba el mensaje anterior y no se podía pausar; ahora hay cola, pausa y límite.
5. La página 404 y el aviso de rol anidaban un `<main>` dentro del `<main>` del layout; se corrigió el landmark.
6. El tema solo alternaba claro/oscuro y no permitía volver al sistema; ahora hay tres estados y persistencia.
7. La tabla de reportes declaraba un encabezado fijo dentro de un contenedor sin alto máximo; se le dio altura y
   desplazamiento propios sin mover la página.
8. El conteo de resultados con `role=status` competía con el aviso flotante; las pruebas E2E se acotaron por ID en
   lugar de por rol genérico.

### Retrospectiva

- **Bien:** la skill permitió convertir una revisión difusa en cambios verificables; las guías de formularios y de
  diálogo resolvieron dos defectos reales de accesibilidad. Las 50 pruebas E2E siguieron pasando tras ajustar solo
  los selectores que ahora son más específicos.
- **Difícil:** jsdom no implementa `showModal()`, así que el diálogo necesita un camino alternativo para las pruebas
  sin renunciar al elemento nativo en el navegador. Ordenar tablas paginadas por la API sería engañoso; por eso la
  ordenación se limitó a los reportes con el conjunto completo.
- **Aprendizaje:** deshabilitar el botón de guardar «para prevenir errores» impide que la persona aprenda qué falta;
  es mejor aceptar el intento, marcar los campos y llevar el foco. También conviene que los estados de resultado no
  usen roles genéricos que compitan con las notificaciones globales.

### Pendiente y riesgos

- La revisión con lector de pantalla real (NVDA/VoiceOver) y con usuarios sigue pendiente; las pruebas automáticas
  no sustituyen esa validación.
- La ordenación de las listas paginadas (usuarios, equipos, préstamos, movimientos) requeriría ordenar en la API;
  hoy solo se ordenan los reportes que traen todos sus datos.
- El límite de avisos y el de intentos de ingreso viven en memoria de una instancia; con varias réplicas necesitan
  un almacén compartido.
- Publicar en Vercel/Render/Supabase sigue siendo opcional y no se ejecutó.

## Iteración 8 — Rediseño visual y auditoría de experiencia (26/11/2026)

**Objetivo:** reemplazar la interfaz anterior por el rediseño completo del archivo de Penpot y revisarlo
con diseño centrado en el usuario antes de cerrar la entrega.

### Qué se hizo

- **Identidad y sistema visual:** Source Sans Pro (400/600/700), tinta, cian y naranja; sin sombras; barra
  lateral de 240 px, barra superior de 76 px y contenido de 272 a 1408 px. Marca propia (etiqueta de activo)
  en SVG con el wordmark trazado a curvas.
- **Pantallas:** landing pública en `/`, panel en `/panel`, ingreso con panel oscuro, panel general con seis
  KPI y tres préstamos recientes, inventario con filtros y píldoras de conteo, detalle con préstamos y
  movimientos, solicitud en dos columnas, activos con cola de aprobación y reportes con pestañas en la URL.
- **Auditoría UX por partes:** foco visible global, movimiento reducido, aviso flotante oscuro, búsqueda con
  retardo de 400 ms, píldora activa con «×», cola de solicitudes por aprobar, ciclo honesto del préstamo
  rechazado, contraste corregido (cian 700 a `#0070BE` y error a `#C92A1E`), objetivos táctiles de 24 px y
  encabezados sin saltos. El registro completo está en `docs/ux-dcu.md`.
- **Documentos:** SDD de 26 hojas con la subsección de rediseño y auditoría, informe de 9 hojas, PPTX de 13
  diapositivas y `Entrega/` regenerada con las capturas nuevas y un documento de evidencias de los siete
  escenarios mínimos.

### Defectos encontrados y corregidos

1. El token `--color-error-vivo` faltaba en el tema claro y la barra de «Baja» quedaba sin color.
2. El cian 700 sobre `marca-50` daba 4,17 y el error sobre su fondo 4,22; se ajustaron los tokens.
3. La búsqueda del inventario no daba respuesta hasta pulsar Enter; ahora espera 400 ms y aplica sola.
4. «Editar · ⋯» prometía un menú inexistente; quedó «Editar →».
5. Cancelar la edición de un equipo llevaba al inventario; ahora cierra la edición.
6. El ciclo de un préstamo rechazado mostraba una devolución que nunca ocurriría.
7. La suite E2E quedó desalineada con el rediseño (panel en `/`, nombre en la barra lateral, filtros sin
   `id`, conteos fijos) y daba 40/50; se actualizó a 50/50 sin tocar los datos de demostración.

### Retrospectiva

- **Bien:** el rediseño se pudo auditar por partes con evidencia real (capturas, contraste medido, teclado y
  auditoría automática) y la suite E2E detectó la deuda de selectores antes de cerrar.
- **Difícil:** la exportación del tablero de Penpot seguía en blanco; se resolvió exportando grupos. El
  lector de pantalla real no está disponible en el equipo.
- **Aprendizaje:** una interfaz más limpia no basta si las pruebas dependen de textos y rutas; conviene que
  los filtros tengan `id` y que la suite compare contra la base.

### Pendiente y riesgos

- Revisión con lector de pantalla real y prueba con usuarios; las métricas de ISO 9241-11 quedaron definidas.
- Publicación opcional, no ejecutada por decisión del alumno.
