# Manual de estándares de TechAsset

Reglas de construcción del proyecto: cómo se nombra, dónde va cada cosa, cómo se prueba y cómo se registra
cada cambio. Se aplican a todo el código; si una regla cambia, se cambia aquí primero y se anota en
`docs/registro-pxp.md`.

## 1. Nombres

| Elemento | Regla | Ejemplo |
|---|---|---|
| Atributos de las entidades | Nombre del dato en PascalCase; si el dato no nombra su entidad, se agrega el nombre de la entidad, sin abreviaturas | `CodigoPatrimonialEquipo`, `FechaDevolucionPrestamo`, `CorreoUsuario` |
| Columnas de la base | El nombre del atributo en snake_case | `codigo_patrimonial_equipo` (`HasColumnName`) |
| Campos del JSON | El mismo nombre de la columna, en snake_case | `"codigo_patrimonial_equipo": "TK-2026-0001"` (`JsonNamingPolicy.SnakeCaseLower`) |
| Tablas | Plural, en minúsculas | `usuarios`, `equipos`, `prestamos`, `movimientos` |
| Clases de C# | PascalCase, sustantivo | `Equipo`, `ContextoDeTechAsset` |
| Casos de uso y sus datos de entrada | Verbo + `CasoDeUso`; verbo + `Comando` | `RegistrarPrestamoCasoDeUso`, `RegistrarPrestamoComando` |
| Datos de salida | `DatosDe` + nombre; `DetalleDe` o `ResumenDe` si es una vista de la entidad | `DatosDeEquipo`, `DetalleDePrestamo` |
| Repositorios | `RepositorioDe` + entidad en plural | `RepositorioDeEquipos` |
| Consultas de lectura | `ConsultaDe` + entidad en plural | `ConsultaDePrestamos` |
| Controladores | Recurso + `Controlador`, con el atributo `[Controller]` y la ruta escrita | `EquiposControlador`, `PrestamosControlador` |
| Excepciones | Motivo + `Excepcion` | `ConflictoDeNegocioExcepcion` |
| Interfaces | `I` + nombre del rol | `IRepositorioDeEquipos`, `IConsultaDePrestamos` |
| Enumeraciones | Singular + entidad, en PascalCase | `EstadoEquipo`, `EstadoPrestamo`, `RolUsuario`, `CategoriaEquipo` |
| Variables y parámetros de C# | camelCase, palabras completas | `idEquipo`, `fechaDevolucion` |
| Campos privados de C# | `_` + camelCase | `_repositorioDeEquipos` |
| Componentes de React | PascalCase; los reutilizables con sus nombres del proyecto | `TextInput`, `ContenedorDeTabla`, `CardIndicador` |
| Funciones, hooks y variables de JavaScript | camelCase; los hooks empiezan con `use` | `useFormulario`, `listarEquipos` |
| Archivos | Igual que lo que exportan | `Equipo.cs`, `ContenedorDeTabla.jsx`, `equiposApi.js` |

**Idioma:** todo el código va en español —clases, carpetas, variables, mensajes e interfaz—. Se conservan en
inglés solo:

- Los **componentes reutilizables** que el equipo acordó nombrar así para reconocerlos: `TextInput`,
  `SelectInput`, `DateInput`, `TextAreaInput`, `Button`, `AlertMessage`, `ModalConfirmacion`,
  `ContenedorDeTabla` y `CardIndicador`.
- Lo que **impone el marco de trabajo o su convención**: `Program.cs`, las clases base y lo que se hereda o se
  llama de ellas (`DbContext`, `ControllerBase`, `ModelSnapshot`), el prefijo `I` de las interfaces, el sufijo
  `Async` de los métodos asíncronos, los nombres de los proyectos (`TechAsset.Domain`, `.Application`,
  `.Infrastructure`, `.WebApi`) y las carpetas habituales de React (`components/`, `hooks/`, `layouts/`, `api/`,
  `utils/`).

**Regla de entidad:** el atributo repite el nombre de su entidad para que no haya dudas al leer una consulta
(`NombreEquipo`, `CorreoUsuario`). Los nombres del PDF se conservan en la documentación y en la API pública;
en el código se aplican esta regla y la de `snake_case`.

## 2. Carpetas

```
TechAsset/
  backend/                          API .NET 10 — arquitectura limpia en 4 proyectos
    src/TechAsset.Domain/                Entidades/, Enumeraciones/, Comun/ (objetos de valor) y Excepciones/
    src/TechAsset.Application/           CasosDeUso/ (con sus comandos), Datos/ e Interfaces/
    src/TechAsset.Infrastructure/        Persistencia/ (contexto y Configuraciones/), Migraciones/,
                                         Repositorios/, Consultas/ y Servicios/
    src/TechAsset.WebApi/                Controladores/, Middleware/, Seguridad/, Respuestas/, Json/, Arranque/
    tests/TechAsset.Pruebas/             Pruebas unitarias (xUnit): Dominio/, CasosDeUso/ y Dobles/
  frontend/                         SPA React + Vite + Tailwind
    src/api/                             Un archivo por recurso sobre clienteApi.js
    src/components/ui/                   Componentes reutilizables
    src/components/<módulo>/             Componentes de un módulo (equipos, préstamos, usuarios)
    src/hooks/                           Estado y lógica reutilizable
    src/reglas/                          Validaciones del frontend, sin interfaz
    src/paginas/                         Una página por ruta
    src/layouts/                         Estructura común (menú, encabezado, pie)
```

**Dependencias permitidas:** `Application` → `Domain`; `Infrastructure` → `Application` y `Domain`;
`WebApi` → `Application` e `Infrastructure` (esta última solo en `Program.cs`, para registrar los servicios).
En el frontend, las páginas usan componentes y hooks; solo `src/api/` llama a la API.

## 3. Codificación

1. **Una clase o componente por archivo**, con un comentario arriba que dice su responsabilidad.
2. **Las reglas de negocio viven en el dominio.** El frontend repite las validaciones solo para avisar antes de
   enviar; la API es la que decide.
3. **Sin `try/catch` en los controladores:** los errores se convierten en respuestas HTTP en un solo lugar
   (`ManejadorDeErrores`).
4. **Formato:** `.editorconfig` en la raíz (UTF-8, LF, 4 espacios en C#, 2 en JavaScript). El backend compila sin
   advertencias (`-warnaserror`) y el frontend pasa `pnpm lint` (oxlint) sin avisos.
5. **Sin secretos en el repositorio:** la cadena de conexión va en los user-secrets de .NET; las variables de
   entorno se usan al publicar. `.env` está ignorado.
6. **Respuestas de la API:** éxito `{ success, message, data }`; error en ProblemDetails (RFC 9457) con
   `success: false`, `message` y, si son datos, `errors` por campo.
7. **Códigos HTTP:** 200 para consultas y cambios, 201 al crear, 204 solo si no se devuelve cuerpo, 400 por datos
   inválidos, 401 sin sesión, 403 por rol, 404 si no existe, 409 por conflicto de negocio (código o correo
   duplicado, equipo ya prestado, préstamo ya devuelto).
8. **Interfaz:** etiquetas visibles, errores junto a su campo, foco visible, controles de 44 px de alto,
   contraste AA (WCAG 2.2) y modo oscuro por tokens de color.
9. **Diseño centrado en el usuario** (reglas de oro de Shneiderman y principios de Norman):
   - Los campos se agrupan en tarjetas numeradas, en el orden en que el usuario piensa la tarea.
   - El botón de enviar queda deshabilitado mientras falte un dato obligatorio o haya un impedimento, y dice qué
     falta.
   - Los mensajes dicen qué corregir con palabras del usuario: nunca códigos de reglas, nombres técnicos ni
     códigos de rastreo.
   - Toda acción tiene respuesta visible (al pasar, al pulsar, mientras carga) y un final claro.
   - Toda acción se puede revertir antes de confirmarla: Cancelar, Volver, confirmar antes de salir con datos sin
     guardar.
10. **Fechas:** las fechas de negocio son `DateOnly` y se guardan como `date`; las marcas de tiempo son
    `DateTimeOffset` en UTC. Las reglas de «hoy» usan la zona `America/Lima`.

## 4. API

- Rutas en plural y en minúsculas: `/api/usuarios`, `/api/equipos`, `/api/prestamos`, `/api/reportes`.
- Toda operación exige sesión salvo `POST /api/autenticacion/ingreso` y `GET /api/salud`.
- El rol se comprueba en la API, no solo en la interfaz: Administrador, ResponsableDeTecnologia y Colaborador.
- Filtros por consulta: `estado`, `categoria`, `texto`, `pagina`, `tamano`; los reportes aceptan `desde` y `hasta`.
- Los cuerpos y las respuestas usan `snake_case`. Los enums viajan como texto.
- Swagger se publica **solo** en Development, en `/swagger`.

## 5. Pruebas

| Nivel | Herramienta | Qué cubre |
|---|---|---|
| Dominio y casos de uso | xUnit (`backend/tests/TechAsset.Pruebas`) | Reglas RN-01 a RN-11, validaciones y transiciones de estado |
| Componentes y reglas del frontend | Vitest (`frontend`) | Validaciones de formulario, formateo y estados de la interfaz |
| Sistema | Pruebas de punta a punta con el navegador | Los escenarios de la Actividad 6 del caso |

- Cada requisito entra con al menos una prueba que falla antes y pasa después.
- No se prueba lo trivial (getters) ni se depende de la hora real: el reloj se inyecta (`IReloj`).
- Las pruebas no comparten base de datos entre sí y no dejan datos en la base de desarrollo.
- Antes de cerrar una iteración: `dotnet build -warnaserror`, `dotnet test`, `pnpm lint`, `pnpm test` y
  `pnpm build`, todo en verde.

## 6. Commits

Formato **Conventional Commits**, en español y en imperativo:

```
<tipo>(<ámbito>): <qué hace, en minúsculas y sin punto final>

<por qué, si no es obvio; requisitos que atiende (RF-09, RN-01)>
```

| Tipo | Cuándo |
|---|---|
| `feat` | Funcionalidad nueva (un requisito) |
| `fix` | Corrección de un error |
| `refactor` | Cambio de estructura que no cambia el comportamiento |
| `docs` | Solo documentación |
| `chore` | Configuración, dependencias, estructura |
| `style` | Formato, sin cambio de lógica |
| `test` | Pruebas |

Ámbitos: `usuarios`, `equipos`, `prestamos`, `devoluciones`, `reportes`, `acceso`, `api`, `frontend`,
`base-de-datos`, `documentos`.

Ejemplo: `feat(prestamos): impedir dos préstamos activos del mismo equipo (RF-09, RN-01)`.

## 7. Ramas

| Rama | Para qué | Nace de | Se une a |
|---|---|---|---|
| `main` | Versiones entregadas; siempre compila y funciona | — | — |
| `develop` | Integración del trabajo en curso | `main` | `main` al cerrar una versión |
| `feature/<requisito>-<descripción>` | Un requisito o grupo de requisitos | `develop` | `develop` |
| `refactor/<descripción>` | Reorganizar código sin cambiar su comportamiento | `develop` | `develop` |
| `fix/<descripción>` | Corregir un error | `develop` | `develop` |

Las uniones se hacen con `git merge --no-ff`, para que el historial muestre cada rama. Cada versión entregada
lleva una etiqueta (`v1.0.0`).

## 8. Documentos

- La ERS y el SDD se generan con los scripts de `Semanas/.herramientas/caso_unidad3_2/`; **no se editan a mano**.
- Toda decisión que el caso no fije se anota en la ERS (Anexo A) y en `docs/registro-pxp.md`.
- No se cambian los RF-01 a RF-17, las RN-01 a RN-10, el modelo de datos referencial ni el dashboard mínimo del
  PDF del caso. La única regla propia es la RN-11 (ingreso con correo y contraseña, con roles).
