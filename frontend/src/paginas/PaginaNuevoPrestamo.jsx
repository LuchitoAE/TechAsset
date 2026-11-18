import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { listarEquipos } from '../api/equiposApi'
import { solicitarPrestamo } from '../api/prestamosApi'
import AlertMessage from '../components/ui/AlertMessage'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import FormularioPrestamo from '../components/prestamos/FormularioPrestamo'
import { useAvisos } from '../contextos/contextoDeAvisos'
import { useSesion } from '../contextos/contextoDeSesion'
import { useFormulario } from '../hooks/useFormulario'
import { fechaDeHoyEnLima, validarSolicitudPrestamo } from '../reglas/prestamos'
import { sumarDias } from '../utils/fechas'

// RF-09 y D-04: el Colaborador solicita un equipo disponible. La solicitud queda pendiente hasta
// que el Responsable de Tecnología la apruebe; el responsable es el colaborador de la sesión
// (RN-05).
export default function PaginaNuevoPrestamo() {
  const { sesion } = useSesion()
  const navegar = useNavigate()
  const { mostrarAviso } = useAvisos()
  const [parametros] = useSearchParams()

  const [equipos, setEquipos] = useState([])
  const [cargandoEquipos, setCargandoEquipos] = useState(true)
  const [errorEquipos, setErrorEquipos] = useState(null)

  const hoy = fechaDeHoyEnLima()

  const formulario = useFormulario({
    valoresIniciales: {
      id_equipo: parametros.get('equipo') ?? '',
      fecha_devolucion: '',
    },
    validar: (valores) => validarSolicitudPrestamo(valores, { hoy }),
    camposObligatorios: ['id_equipo', 'fecha_devolucion'],
    alEnviar: async (valores) => {
      await solicitarPrestamo({
        id_equipo: valores.id_equipo,
        fecha_devolucion: valores.fecha_devolucion,
      })

      navegar('/mis-prestamos', { replace: true })
      mostrarAviso(
        'Solicitud enviada. El Responsable de Tecnología la revisará y el equipo se le asignará al aprobarla.',
      )
    },
  })

  useEffect(() => {
    const control = new AbortController()

    listarEquipos({ estado: 'Disponible', tamano: 100 }, control.signal)
      .then((datos) => {
        if (control.signal.aborted) return
        setEquipos(datos.equipos)
        setErrorEquipos(null)
      })
      .catch((excepcion) => {
        if (excepcion.name !== 'AbortError') setErrorEquipos(excepcion.message)
      })
      .finally(() => {
        if (!control.signal.aborted) setCargandoEquipos(false)
      })

    return () => control.abort()
  }, [])

  const responsable = sesion
    ? {
        nombre: `${sesion.nombres_usuario} ${sesion.apellidos_usuario}`.trim(),
        correo: sesion.correo_usuario,
      }
    : null

  return (
    <div className="space-y-6">
      <Link
        to="/mis-prestamos"
        className="inline-flex items-center gap-1 text-sm font-semibold text-marca-700"
      >
        <span aria-hidden="true">←</span> Volver a mis préstamos
      </Link>

      <EncabezadoDePagina
        titulo="Solicitar préstamo"
        descripcion="Elija un equipo disponible y la fecha en que lo devolverá. La solicitud queda pendiente hasta que el Responsable de Tecnología la apruebe."
      />

      {errorEquipos && (
        <AlertMessage tipo="error">
          No se pudo consultar la disponibilidad: {errorEquipos}
        </AlertMessage>
      )}

      <FormularioPrestamo
        valores={formulario.valores}
        errores={formulario.errores}
        mensaje={formulario.mensaje}
        enviando={formulario.enviando}
        faltanDatos={formulario.faltanDatos}
        cambiar={formulario.cambiar}
        salirDelCampo={formulario.salirDelCampo}
        enviar={formulario.enviar}
        onCancelar={() => navegar('/mis-prestamos')}
        equipos={equipos}
        cargandoEquipos={cargandoEquipos}
        responsable={responsable}
        fechaMinima={sumarDias(hoy, 1)}
      />
    </div>
  )
}
