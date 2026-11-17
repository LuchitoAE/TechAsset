import { Navigate, Outlet } from 'react-router'
import { useSesion } from '../contextos/contextoDeSesion'
import AlertMessage from './ui/AlertMessage'

// Deja pasar solo a los roles indicados. La API vuelve a comprobar el rol (RNF-18): esto solo evita
// que la persona llegue a una pantalla que no puede usar.
export default function RutaPorRol({ roles }) {
  const { sesion } = useSesion()

  if (!sesion) {
    return <Navigate to="/ingreso" replace />
  }

  if (!roles.includes(sesion.rol_usuario)) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <AlertMessage tipo="error">
          Su rol no permite entrar a esta sección. Vuelva al inicio para continuar con sus tareas.
        </AlertMessage>
      </main>
    )
  }

  return <Outlet />
}
