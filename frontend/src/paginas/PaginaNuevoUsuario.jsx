import { Link, useNavigate } from 'react-router'
import { registrarUsuario } from '../api/usuariosApi'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import FormularioUsuario from '../components/usuarios/FormularioUsuario'
import { useFormulario } from '../hooks/useFormulario'
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
    alEnviar: async (valores) => {
      const usuario = await registrarUsuario(valores)
      navegar('/usuarios', {
        replace: true,
        state: {
          aviso: `Se registró a ${usuario.nombres_usuario} ${usuario.apellidos_usuario}. Ya puede ingresar con su correo.`,
        },
      })
    },
  })

  return (
    <div className="space-y-6">
      <Link to="/usuarios" className="inline-flex items-center gap-1 text-sm font-semibold text-marca-700">
        <span aria-hidden="true">←</span> Volver a usuarios
      </Link>

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
        cambiar={formulario.cambiar}
        salirDelCampo={formulario.salirDelCampo}
        enviar={formulario.enviar}
        onCancelar={() => navegar('/usuarios')}
      />
    </div>
  )
}
