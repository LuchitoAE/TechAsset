import { Navigate, Route, Routes } from 'react-router'
import RutaPorRol from './components/RutaPorRol'
import RutaProtegida from './components/RutaProtegida'
import ProveedorDeSesion from './contextos/ProveedorDeSesion'
import LayoutPrincipal from './layouts/LayoutPrincipal'
import PaginaDetalleEquipo from './paginas/PaginaDetalleEquipo'
import PaginaDetallePrestamo from './paginas/PaginaDetallePrestamo'
import PaginaDetalleUsuario from './paginas/PaginaDetalleUsuario'
import PaginaDisponibilidad from './paginas/PaginaDisponibilidad'
import PaginaEnConstruccion from './paginas/PaginaEnConstruccion'
import PaginaEquipos from './paginas/PaginaEquipos'
import PaginaIngreso from './paginas/PaginaIngreso'
import PaginaInicio from './paginas/PaginaInicio'
import PaginaNoEncontrada from './paginas/PaginaNoEncontrada'
import PaginaNuevoEquipo from './paginas/PaginaNuevoEquipo'
import PaginaNuevoPrestamo from './paginas/PaginaNuevoPrestamo'
import PaginaNuevoUsuario from './paginas/PaginaNuevoUsuario'
import PaginaPrestamos from './paginas/PaginaPrestamos'
import PaginaPrestamosActivos from './paginas/PaginaPrestamosActivos'
import PaginaUsuarios from './paginas/PaginaUsuarios'

// Mapa de rutas de la SPA. Todo exige sesión salvo /ingreso; cada módulo declara los roles que
// pueden entrar y la API vuelve a comprobarlos (RNF-18).
export default function App() {
  return (
    <ProveedorDeSesion>
      <Routes>
        <Route path="/ingreso" element={<PaginaIngreso />} />

        <Route element={<RutaProtegida />}>
          <Route element={<LayoutPrincipal />}>
            <Route index element={<PaginaInicio />} />

            <Route element={<RutaPorRol roles={['Administrador', 'ResponsableDeTecnologia']} />}>
              <Route path="usuarios" element={<PaginaUsuarios />} />
              <Route path="usuarios/:id" element={<PaginaDetalleUsuario />} />
            </Route>

            <Route element={<RutaPorRol roles={['Administrador']} />}>
              <Route path="usuarios/nuevo" element={<PaginaNuevoUsuario />} />
            </Route>

            {/* RF-07: el inventario lo consultan los tres roles; el Colaborador en solo lectura. */}
            <Route path="equipos" element={<PaginaEquipos />} />
            <Route path="inventario" element={<Navigate to="/equipos" replace />} />

            <Route element={<RutaPorRol roles={['Administrador', 'ResponsableDeTecnologia']} />}>
              <Route path="equipos/nuevo" element={<PaginaNuevoEquipo />} />
              <Route path="equipos/:id" element={<PaginaDetalleEquipo />} />
            </Route>

            {/* RF-09 a RF-12: historial y activos para el Responsable y el Administrador; el
                Colaborador ve sus préstamos y la disponibilidad. */}
            <Route path="prestamos" element={<PaginaPrestamos />} />
            <Route path="mis-prestamos" element={<PaginaPrestamos soloMisPrestamos />} />
            <Route path="disponibilidad" element={<PaginaDisponibilidad />} />
            <Route path="prestamos/:id" element={<PaginaDetallePrestamo />} />

            <Route element={<RutaPorRol roles={['Administrador', 'ResponsableDeTecnologia']} />}>
              <Route path="prestamos/activos" element={<PaginaPrestamosActivos />} />
            </Route>

            <Route element={<RutaPorRol roles={['Colaborador']} />}>
              <Route path="prestamos/nuevo" element={<PaginaNuevoPrestamo />} />
            </Route>

            <Route
              path="reportes"
              element={
                <PaginaEnConstruccion
                  titulo="Reportes"
                  descripcion="Indicadores del panel, equipos por estado, más utilizados, préstamos por área y movimientos."
                  iteracion={5}
                />
              }
            />

            <Route path="*" element={<PaginaNoEncontrada />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProveedorDeSesion>
  )
}
