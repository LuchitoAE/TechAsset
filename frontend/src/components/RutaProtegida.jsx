import { Navigate, Outlet, useLocation } from 'react-router'
import Cargando from './ui/Cargando'
import { useSesion } from '../contextos/contextoDeSesion'

// Toda la aplicación exige sesión salvo el ingreso: si no hay sesión, vuelve a /ingreso y recuerda
// a dónde quería llegar la persona.
export default function RutaProtegida() {
  const { sesion, cargando } = useSesion()
  const ubicacion = useLocation()

  if (cargando) {
    return (
      <div className="grid min-h-dvh place-items-center bg-fondo">
        <Cargando texto="Comprobando su sesión…" />
      </div>
    )
  }

  if (!sesion) {
    return <Navigate to="/ingreso" replace state={{ desde: ubicacion.pathname }} />
  }

  return <Outlet />
}
