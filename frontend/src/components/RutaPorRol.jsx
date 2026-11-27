import { Link, Navigate, Outlet } from 'react-router'
import { useSesion } from '../contextos/contextoDeSesion'
import AlertMessage from './ui/AlertMessage'
import { useTituloDePagina } from '../utils/titulo'

// Deja pasar solo a los roles indicados. La API vuelve a comprobar el rol (RNF-18): esto solo evita
// que la persona llegue a una pantalla que no puede usar. El aviso vive dentro del <main> del layout,
// así que no se anida otro landmark main.
function AccesoDenegado() {
  useTituloDePagina('Acceso no permitido')

  return (
    <section aria-labelledby="titulo-acceso-denegado" className="mx-auto w-full max-w-3xl space-y-4">
      <h1 id="titulo-acceso-denegado" className="text-2xl font-bold text-titulo">
        Acceso no permitido
      </h1>
      <AlertMessage tipo="error">
        Su rol no permite entrar a esta sección. Vuelva al inicio para continuar con sus tareas.
      </AlertMessage>
      <Link
        to="/panel"
        className="inline-flex min-h-11 items-center rounded-lg bg-marca-700 px-4 text-sm font-semibold text-sobre-marca hover:bg-marca-800"
      >
        Volver al inicio
      </Link>
    </section>
  )
}

export default function RutaPorRol({ roles }) {
  const { sesion } = useSesion()

  if (!sesion) {
    return <Navigate to="/ingreso" replace />
  }

  if (!roles.includes(sesion.rol_usuario)) {
    return <AccesoDenegado />
  }

  return <Outlet />
}
