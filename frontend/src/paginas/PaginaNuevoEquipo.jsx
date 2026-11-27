import { useNavigate } from 'react-router'
import { registrarEquipo } from '../api/equiposApi'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import MigasDePan from '../components/ui/MigasDePan'
import FormularioEquipo from '../components/equipos/FormularioEquipo'
import { useAvisos } from '../contextos/contextoDeAvisos'
import { useFormulario } from '../hooks/useFormulario'
import { ETIQUETAS_DE_CAMPO } from '../reglas/campos'
import { normalizarCodigoPatrimonial, validarEquipo } from '../reglas/validacionEquipos'

const VALORES_INICIALES = {
  codigo_patrimonial_equipo: '',
  nombre_equipo: '',
  categoria_equipo: '',
  marca_equipo: '',
  estado_equipo: 'Disponible',
}

// RF-05: registrar un equipo con código patrimonial único y estado inicial válido.
export default function PaginaNuevoEquipo() {
  const navegar = useNavigate()
  const { mostrarAviso } = useAvisos()

  const formulario = useFormulario({
    valoresIniciales: VALORES_INICIALES,
    validar: (valores) => validarEquipo(valores, { esNuevo: true }),
    camposObligatorios: [
      'codigo_patrimonial_equipo',
      'nombre_equipo',
      'categoria_equipo',
      'marca_equipo',
      'estado_equipo',
    ],
    etiquetas: ETIQUETAS_DE_CAMPO,
    alEnviar: async (valores) => {
      const equipo = await registrarEquipo({
        codigo_patrimonial_equipo: normalizarCodigoPatrimonial(valores.codigo_patrimonial_equipo),
        nombre_equipo: valores.nombre_equipo,
        categoria_equipo: valores.categoria_equipo,
        marca_equipo: valores.marca_equipo,
        estado_equipo: valores.estado_equipo,
      })

      navegar('/equipos', { replace: true })
      mostrarAviso(
        `Se registró el equipo ${equipo.codigo_patrimonial_equipo} (${equipo.nombre_equipo}).`,
      )
    },
  })

  return (
    <div className="space-y-6">
      <MigasDePan
        items={[
          { etiqueta: 'Inicio', ruta: '/' },
          { etiqueta: 'Equipos', ruta: '/equipos' },
          { etiqueta: 'Nuevo equipo' },
        ]}
      />

      <EncabezadoDePagina
        titulo="Nuevo equipo"
        descripcion="Registre el equipo con el código de su etiqueta. El código es único y el equipo queda disponible para préstamos, salvo que lo registre en mantenimiento o de baja."
      />

      <FormularioEquipo
        esNuevo
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
        onCancelar={() => navegar('/equipos')}
      />
    </div>
  )
}
