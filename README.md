# TechAsset

Sistema de gestión de inventario y préstamo de equipos tecnológicos de **Innovatech Solutions S.A.C.**
Caso práctico integrador de la Unidad 3 del curso **Construcción de Software** (Universidad Peruana Los Andes).

## Qué hace

- Gestiona usuarios, equipos e inventario tecnológico.
- Registra solicitudes de préstamo, su aprobación y la devolución del equipo.
- Consulta el historial de préstamos, los préstamos activos y los movimientos.
- Muestra un panel con seis indicadores: total de equipos, disponibles, prestados, en mantenimiento,
  total de préstamos y área con mayor uso.

El alcance completo está en la ERS y el diseño en el SDD, dentro de `../Analisis/`.

## Estructura

```
TechAsset/
  backend/                     API .NET 10 con arquitectura limpia
    src/TechAsset.Domain/            Entidades y reglas del negocio
    src/TechAsset.Application/       Casos de uso e interfaces
    src/TechAsset.Infrastructure/    EF Core, PostgreSQL, repositorios y consultas
    src/TechAsset.WebApi/            Controladores, sesión, errores y Swagger
    tests/TechAsset.Pruebas/         Pruebas unitarias (xUnit)
  frontend/                    SPA React 19 + Vite + Tailwind CSS 4
  docs/registro-pxp.md         Bitácora de las iteraciones
  ESTANDARES.md                Nombres, carpetas, commits, ramas y pruebas
```

## Cómo se ejecuta

Requisitos: .NET SDK 10, Node 20 o superior, pnpm 9 o superior y PostgreSQL 16 o superior.

```bash
# Base local (una vez): rol y base de datos
sudo -u postgres createuser --pwprompt reservaupla
sudo -u postgres createdb -O reservaupla techasset

# API: http://localhost:5321 (Swagger solo en Development)
cd backend
dotnet tool restore
dotnet ef database update --project src/TechAsset.Infrastructure --startup-project src/TechAsset.WebApi
dotnet run --project src/TechAsset.WebApi --launch-profile http

# SPA: http://localhost:5191 (reenvía /api a la API)
cd frontend
pnpm install
pnpm dev
```

La cadena de conexión y la cuenta del primer Administrador van en los **user-secrets** de .NET, nunca en el
repositorio:

```bash
cd backend/src/TechAsset.WebApi
dotnet user-secrets set "ConnectionStrings:TechAsset" "Host=localhost;Database=techasset;Username=reservaupla;Password=..."
dotnet user-secrets set "AdministradorInicial:NombresUsuario" "..."
dotnet user-secrets set "AdministradorInicial:ApellidosUsuario" "..."
dotnet user-secrets set "AdministradorInicial:CorreoUsuario" "admin@innovatech.pe"
dotnet user-secrets set "AdministradorInicial:AreaUsuario" "Gerencia de Tecnología"
dotnet user-secrets set "AdministradorInicial:Contrasena" "..."
```

Al arrancar, la API crea el primer Administrador solo si no existe ninguno activo. Después, las cuentas se
crean desde la pantalla de Usuarios.

## API de la iteración 2

| Método y ruta | Para qué | Roles |
|---|---|---|
| `GET /api/salud` | Comprobar que la API vive | Público |
| `POST /api/autenticacion/ingreso` | Ingreso con correo y contraseña | Público |
| `GET /api/autenticacion/sesion` | Consultar la sesión al abrir la SPA | Sesión |
| `POST /api/autenticacion/salida` | Cerrar sesión | Sesión |
| `GET /api/usuarios` | Listado con filtros y paginación | Administrador y Responsable |
| `GET /api/usuarios/{id}` | Detalle de un usuario | Administrador y Responsable |
| `POST /api/usuarios` | Registrar usuario | Administrador |
| `PUT /api/usuarios/{id}` | Actualizar usuario y reponer contraseña | Administrador |
| `PATCH /api/usuarios/{id}/estado` | Habilitar o deshabilitar | Administrador |

Las respuestas exitosas son `{ success, message, data }`; los errores usan ProblemDetails con `success: false`,
`message` y `errors` por campo. La sesión es una cookie `HttpOnly` y `SameSite=Strict` de 8 horas.

## Verificación

```bash
cd backend && dotnet build -warnaserror && dotnet test
cd frontend && pnpm install && pnpm lint && pnpm test && pnpm build
```

## Ramas y versiones

`main` guarda lo entregado; `develop` integra el trabajo; cada requisito se desarrolla en su rama
`feature/…` y se une con `git merge --no-ff`. Los commits siguen Conventional Commits en español.
El detalle está en `ESTANDARES.md`.

## Estado

**Iteración 1 (17/11/2026):** análisis, ERS 0100, SDD 0100, diagramas, estándares y el esqueleto.
**Iteración 2 (17/11/2026):** usuarios y acceso completos: RF-01 a RF-04, RN-08, RN-09 y RN-11;
ingreso, sesión y salida con cookie; migración `CrearUsuarios`; listado, registro, edición y
deshabilitación en la SPA; 51 pruebas de backend y 28 de frontend. Equipos, préstamos y reportes
llegan en las iteraciones 3 a 5.
