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
# API: http://localhost:5321 (Swagger solo en Development)
cd backend
dotnet run --project src/TechAsset.WebApi --launch-profile http

# SPA: http://localhost:5191 (reenvía /api a la API)
cd frontend
pnpm install
pnpm dev
```

La cadena de conexión de PostgreSQL va en los **user-secrets** de .NET, nunca en el repositorio:

```bash
cd backend/src/TechAsset.WebApi
dotnet user-secrets set "ConnectionStrings:TechAsset" "Host=localhost;Database=techasset;Username=techasset"
```

Mientras la base de datos no esté conectada, `GET /api/salud` responde sin consultarla.

## Verificación

```bash
cd backend && dotnet build -warnaserror && dotnet test
cd frontend && pnpm install && pnpm build && pnpm lint
```

## Ramas y versiones

`main` guarda lo entregado; `develop` integra el trabajo; cada requisito se desarrolla en su rama
`feature/…` y se une con `git merge --no-ff`. Los commits siguen Conventional Commits en español.
El detalle está en `ESTANDARES.md`.

## Estado

**Iteración 1 (17/11/2026):** análisis, ERS 0100, SDD 0100, diagramas, estándares y este esqueleto.
La API solo expone `/api/salud`; la SPA muestra la pantalla de bienvenida. Sin lógica de negocio.
