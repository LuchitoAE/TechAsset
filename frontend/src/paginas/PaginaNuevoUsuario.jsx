import { useNavigate } from 'react-router'
import { registrarUsuario } from '../api/usuariosApi'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import MigasDePan from '../components/ui/MigasDePan'
import FormularioUsuario from '../components/usuarios/FormularioUsuario'
import { useAvisos } from '../contextos/contextoDeAvisos'
import { useFormulario } from '../hooks/useFormulario'
import { ETIQUETAS_DE_CAMPO } from '../reglas/campos'
import { validarUsuario } from '../reglas/validacionUsuarios'

const VALORES_INICIALES = {
  nombres_usuario: '',
  apellidos_usuario: '',
  correo_usuario: '',
  area_usuario: '',
  rol_usuario: '',
  contrasena: '',
}

// RF-01: registrar un usuario activo con correo único y contraseña inicial.
export default function PaginaNuevoUsuario() {
  const navegar = useNavigate()
  const { mostrarAviso } = useAvisos()

  const formulario = useFormulario({
    valoresIniciales: VALORES_INICIALES,
    validar: (valores) => validarUsuario(valores, { esNuevo: true }),
    camposObligatorios: [
      'nombres_usuario',
      'apellidos_usuario',
      'correo_usuario',
      'area_usuario',
      'rol_usuario',
      'contrasena',
    ],
    etiquetas: ETIQUETAS_DE_CAMPO,
    alEnviar: async (valores) => {
      const usuario = await registrarUsuario(valores)
      mostrarAviso(
        `Se registró a ${usuario.nombres_usuario} ${usuario.apellidos_usuario}. Ya puede ingresar con su correo.`,
      )
      navegar('/usuarios', { replace: true })
    },
  })

  return (
    <div className="space-y-6">
      <MigasDePan
        items={[
          { etiqueta: 'Inicio', ruta: '/' },
          { etiqueta: 'Usuarios', ruta: '/usuarios' },
          { etiqueta: 'Nuevo usuario' },
        ]}
      />

      <EncabezadoDePagina
        titulo="Nuevo usuario"
        descripcion="Complete los datos de la persona y entregue la contraseña inicial. El usuario queda activo y puede ingresar de inmediato."
      />

      <FormularioUsuario
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
        onCancelar={() => navegar('/usuarios')}
      />
    </div>
  )
}
