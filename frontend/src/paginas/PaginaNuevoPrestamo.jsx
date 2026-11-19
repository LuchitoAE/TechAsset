import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { listarEquipos } from '../api/equiposApi'
import { solicitarPrestamo } from '../api/prestamosApi'
import AlertMessage from '../components/ui/AlertMessage'
import Button from '../components/ui/Button'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import MigasDePan from '../components/ui/MigasDePan'
import FormularioPrestamo from '../components/prestamos/FormularioPrestamo'
import { useAvisos } from '../contextos/contextoDeAvisos'
import { useSesion } from '../contextos/contextoDeSesion'
import { useFormulario } from '../hooks/useFormulario'
import { ETIQUETAS_DE_CAMPO } from '../reglas/campos'
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
  const [intento, setIntento] = useState(0)

  const hoy = fechaDeHoyEnLima()

  const formulario = useFormulario({
    valoresIniciales: {
      id_equipo: parametros.get('equipo') ?? '',
      fecha_devolucion: '',
    },
    validar: (valores) => validarSolicitudPrestamo(valores, { hoy }),
    camposObligatorios: ['id_equipo', 'fecha_devolucion'],
    etiquetas: ETIQUETAS_DE_CAMPO,
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
  }, [intento])

  const responsable = sesion
    ? {
        nombre: `${sesion.nombres_usuario} ${sesion.apellidos_usuario}`.trim(),
        correo: sesion.correo_usuario,
      }
    : null

  return (
    <div className="space-y-6">
      <MigasDePan
        items={[
          { etiqueta: 'Inicio', ruta: '/' },
          { etiqueta: 'Mis préstamos', ruta: '/mis-prestamos' },
          { etiqueta: 'Solicitar préstamo' },
        ]}
      />

      <EncabezadoDePagina
        titulo="Solicitar préstamo"
        descripcion="Elija un equipo disponible y la fecha en que lo devolverá. La solicitud queda pendiente hasta que el Responsable de Tecnología la apruebe."
      />

      {errorEquipos && (
        <AlertMessage tipo="error">
          No se pudo consultar la disponibilidad: {errorEquipos}{' '}
          <Button
            variante="fantasma"
            onClick={() => {
              setCargandoEquipos(true)
              setIntento((actual) => actual + 1)
            }}
          >
            Reintentar
          </Button>
        </AlertMessage>
      )}

      <FormularioPrestamo
        valores={formulario.valores}
        errores={formulario.errores}
        mensaje={formulario.mensaje}
        enviando={formulario.enviando}
        faltanDatos={formulario.faltanDatos}
        intentoEnviado={formulario.intentoEnviado}
        anuncio={formulario.anuncio}
        resumenErrores={formulario.resumenErrores}
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
