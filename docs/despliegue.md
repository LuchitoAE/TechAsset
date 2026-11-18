# Despliegue de TechAsset

La publicación quedó **preparada, no ejecutada**. El destino previsto son tres servicios gratuitos:
**Vercel** sirve la SPA, **Render** ejecuta la API de .NET en un contenedor y **Supabase** aloja la
base PostgreSQL. El navegador ve un solo origen (`https://<proyecto>.vercel.app`): Vercel reenvía
`/api/*` a Render, así la cookie de sesión sigue siendo de primera parte y no hace falta CORS.

```
Navegador → Vercel (SPA + rewrite /api) → Render (API .NET en Docker) → Supabase (PostgreSQL)
```

> **Importante:** el nombre `techasset-api.onrender.com` de `frontend/vercel.json` es un marcador.
> Cuando se cree el servicio en Render, se reemplaza por la URL real y se vuelve a desplegar Vercel.

## 1. Supabase (PostgreSQL)

1. Crear el proyecto y anotar la región y la cadena de conexión del **pooler de sesión** (IPv4).
2. Crear un rol propio para la aplicación (sin superusuario) con `USAGE, CREATE` en `public`.
3. Aplicar el esquema idempotente:

   ```bash
   psql "$CADENA_DE_SUPABASE" -v ON_ERROR_STOP=1 \
     -f Entrega/02-base-de-datos/esquema.sql
   ```

   o, desde el repositorio:

   ```bash
   cd TechAsset/backend
   dotnet ef database update --project src/TechAsset.Infrastructure \
     --startup-project src/TechAsset.WebApi --connection "$CADENA_DE_SUPABASE"
   ```

4. Comprobar `__EFMigrationsHistory`: deben aparecer las cuatro migraciones (`CrearUsuarios`,
   `CrearEquipos`, `CrearPrestamos` y `CrearMovimientos`). No hay extensiones obligatorias.
5. La API es la única que escribe: no se expone la clave anónima de Supabase al navegador. Si se
   activa RLS, se deja sin políticas para que PostgREST no lea nada; la API entra como dueña de las
   tablas.

## 2. Render (API)

- Crear un **Web Service** con Docker, rama `develop`, directorio raíz `backend` y Dockerfile
  `./Dockerfile`. El puerto lo entrega Render en `PORT`; el `ENTRYPOINT` del Dockerfile lo respeta.
- Variables de entorno (nunca en el repositorio):

| Variable | Valor |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ASPNETCORE_FORWARDEDHEADERS_ENABLED` | `true` |
| `ConnectionStrings__TechAsset` | cadena del pooler de Supabase, con `SSL Mode=Require` |
| `AdministradorInicial__NombresUsuario` | nombres del administrador |
| `AdministradorInicial__ApellidosUsuario` | apellidos del administrador |
| `AdministradorInicial__CorreoUsuario` | correo del administrador |
| `AdministradorInicial__AreaUsuario` | área del administrador |
| `AdministradorInicial__Contrasena` | contraseña inicial, guardada como secreto |

`ASPNETCORE_FORWARDEDHEADERS_ENABLED=true` hace que ASP.NET Core lea `X-Forwarded-Proto` y marque la
cookie como `Secure` cuando el proxy termina TLS. Sin esa variable, la cookie funciona pero no se
marca como segura.

La API crea el primer Administrador al arrancar solo si no existe ninguno activo; es idempotente.

## 3. Vercel (SPA)

- Importar el repositorio, directorio raíz `frontend`, framework **Vite**, comando `pnpm build` y
  salida `dist`. La rama de producción es `main`; `develop` se usa para la vista previa.
- `frontend/vercel.json` ya reenvía `/api/:ruta*` a Render y manda el resto a `index.html` para que
  las rutas del SPA no den 404. Actualizar la URL de destino cuando Render asigne el dominio.
- No se configuró ninguna cuenta ni se ejecutó un despliegue en esta entrega.

## 4. Comprobaciones después de publicar

```bash
# La API vive y no filtra datos
curl -s https://<api>.onrender.com/api/salud

# Sin cookie, la API responde 401
curl -i https://<api>.onrender.com/api/equipos

# La SPA responde y el proxy conserva el 401
curl -s -o /dev/null -w "%{http_code}\n" https://<proyecto>.vercel.app/
curl -s -o /dev/null -w "%{http_code}\n" https://<proyecto>.vercel.app/api/equipos

# Ingreso y cookie (usar una cuenta real, no la de pruebas)
curl -i -c cookies.txt -X POST https://<proyecto>.vercel.app/api/autenticacion/ingreso \
  -H 'Content-Type: application/json' \
  -d '{"correo_usuario":"...","contrasena":"..."}'
```

El plan gratuito de Render suspende la API tras unos minutos sin uso: la primera petición puede
tardar cerca de un minuto.

## 5. Riesgos y pendientes

- **Límite de intentos en memoria:** `LimiteDeIntentosDeIngreso` es un singleton por instancia. Con
  varias réplicas habría que llevarlo a un almacén compartido (Redis o la base).
- **Migraciones:** no se aplican solas al arrancar. Se ejecutan a mano antes del primer despliegue o
  en el paso de build; el esquema idempotente está en `Entrega/02-base-de-datos/esquema.sql`.
- **Swagger:** solo se publica en `Development`; en `Production` no queda expuesto.
- **Secretos:** viven en el panel de Render y en los user-secrets de desarrollo. No hay cadenas ni
  contraseñas en `git`.
- **Costo:** los tres servicios tienen plan gratuito; Render duerme la API y Supabase limita el
  almacenamiento. Para una entrega académica es suficiente.
- **Rollback:** Vercel conserva los despliegues anteriores; en Render se puede volver a un deploy
  anterior desde el panel. La base se restaura desde un respaldo de Supabase.
