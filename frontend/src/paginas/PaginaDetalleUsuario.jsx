import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { actualizarUsuario, cambiarEstadoUsuario, obtenerUsuario } from '../api/usuariosApi'
import AlertMessage from '../components/ui/AlertMessage'
import Button from '../components/ui/Button'
import Cargando from '../components/ui/Cargando'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import MigasDePan from '../components/ui/MigasDePan'
import ModalConfirmacion from '../components/ui/ModalConfirmacion'
import EtiquetaDeEstado from '../components/usuarios/EtiquetaDeEstado'
import EtiquetaDeRol from '../components/usuarios/EtiquetaDeRol'
import FormularioUsuario from '../components/usuarios/FormularioUsuario'
import { useAvisos } from '../contextos/contextoDeAvisos'
import { useSesion } from '../contextos/contextoDeSesion'
import { useFormulario } from '../hooks/useFormulario'
import { ETIQUETAS_DE_CAMPO } from '../reglas/campos'
import { etiquetaDeRol } from '../reglas/catalogos'
import { puedeGestionarUsuarios } from '../reglas/permisos'
import { validarEdicionUsuario } from '../reglas/validacionUsuarios'

// RF-02 y RF-04: detalle del usuario. El Administrador edita, repone la contraseña y deshabilita;
// el Responsable de Tecnología solo consulta (D-07).
export default function PaginaDetalleUsuario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { sesion } = useSesion()
  const { mostrarAviso, mostrarError } = useAvisos()
  const administrador = puedeGestionarUsuarios(sesion?.rol_usuario)

  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

  const formulario = useFormulario({
    valoresIniciales: {
      nombres_usuario: '',
      apellidos_usuario: '',
      correo_usuario: '',
      area_usuario: '',
      rol_usuario: '',
      contrasena: '',
    },
    validar: validarEdicionUsuario,
    camposObligatorios: [
      'nombres_usuario',
      'apellidos_usuario',
      'correo_usuario',
      'area_usuario',
      'rol_usuario',
    ],
    etiquetas: ETIQUETAS_DE_CAMPO,
    alEnviar: async (valores) => {
      const datos = await actualizarUsuario(usuario.id_usuario, {
        nombres_usuario: valores.nombres_usuario,
        apellidos_usuario: valores.apellidos_usuario,
        correo_usuario: valores.correo_usuario,
        area_usuario: valores.area_usuario,
        rol_usuario: valores.rol_usuario,
        contrasena_nueva: valores.contrasena || null,
      })

      setUsuario(datos)
      formulario.establecerValores({ ...datos, contrasena: '' })
      mostrarAviso('Los cambios se guardaron.')
    },
  })

  const establecerValoresDelFormulario = formulario.establecerValores

  useEffect(() => {
    let vigente = true

    obtenerUsuario(id)
      .then((datos) => {
        if (!vigente) return
        setUsuario(datos)
        setError(null)
        establecerValoresDelFormulario({ ...datos, contrasena: '' })
      })
      .catch((excepcion) => {
        if (vigente) setError(excepcion.message)
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [establecerValoresDelFormulario, id])

  async function confirmarCambioDeEstado() {
    setCambiandoEstado(true)
    setError(null)

    try {
      const datos = await cambiarEstadoUsuario(usuario.id_usuario, !usuario.activo_usuario)
      setUsuario(datos)
      formulario.establecerValores({ ...datos, contrasena: '' })
      mostrarAviso(datos.activo_usuario ? 'El usuario quedó habilitado.' : 'El usuario quedó deshabilitado.')
      setConfirmacionAbierta(false)
    } catch (excepcion) {
      setError(excepcion.message)
      mostrarError(excepcion.message)
      setConfirmacionAbierta(false)
    } finally {
      setCambiandoEstado(false)
    }
  }

  if (cargando) {
    return <Cargando texto="Consultando el usuario…" />
  }

  if (!usuario) {
    return (
      <div className="space-y-4">
        <AlertMessage tipo="error">{error ?? 'No se encontró el usuario.'}</AlertMessage>
        <Link to="/usuarios" className="text-sm font-semibold text-marca-700">
          ← Volver a usuarios
        </Link>
      </div>
    )
  }

  const esMiCuenta = sesion?.id_usuario === usuario.id_usuario

  return (
    <div className="space-y-6">
      <MigasDePan
        items={[
          { etiqueta: 'Inicio', ruta: '/' },
          { etiqueta: 'Usuarios', ruta: '/usuarios' },
          {
            etiqueta: `${usuario.nombres_usuario} ${usuario.apellidos_usuario}`,
          },
        ]}
      />

      <EncabezadoDePagina
        titulo={`${usuario.nombres_usuario} ${usuario.apellidos_usuario}`}
        descripcion={`${usuario.correo_usuario} · ${usuario.area_usuario}`}
      >
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <EtiquetaDeRol rol={usuario.rol_usuario} />
          <EtiquetaDeEstado activo={usuario.activo_usuario} />
        </div>
      </EncabezadoDePagina>

      {error && <AlertMessage tipo="error">{error}</AlertMessage>}

      {administrador ? (
        <>
          <FormularioUsuario
            esNuevo={false}
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

          <section
            aria-labelledby="titulo-estado-cuenta"
            className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta sm:p-6"
          >
            <h2 id="titulo-estado-cuenta" className="text-base font-bold text-titulo">
              Estado de la cuenta
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-texto-suave">
              Deshabilitar conserva el historial del usuario y le impide ingresar o recibir préstamos
              nuevos. La operación se puede revertir habilitándolo de nuevo.
            </p>

            {esMiCuenta && (
              <p className="mt-3 rounded-lg bg-aviso-fondo px-3 py-2 text-xs font-semibold text-aviso">
                No puede deshabilitar su propia cuenta.
              </p>
            )}

            <div className="mt-5">
              <Button
                variante={usuario.activo_usuario ? 'peligro' : 'primario'}
                onClick={() => setConfirmacionAbierta(true)}
                disabled={esMiCuenta}
              >
                {usuario.activo_usuario ? 'Deshabilitar usuario' : 'Habilitar usuario'}
              </Button>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta sm:p-6">
          <h2 className="text-base font-bold text-titulo">Datos de la cuenta</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold tracking-wide text-texto-suave uppercase">Nombres</dt>
              <dd className="mt-1 text-sm text-texto">{usuario.nombres_usuario}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-texto-suave uppercase">Apellidos</dt>
              <dd className="mt-1 text-sm text-texto">{usuario.apellidos_usuario}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-texto-suave uppercase">Correo</dt>
              <dd className="mt-1 text-sm break-all text-texto">{usuario.correo_usuario}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-texto-suave uppercase">Área</dt>
              <dd className="mt-1 text-sm text-texto">{usuario.area_usuario}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-texto-suave uppercase">Rol</dt>
              <dd className="mt-1 text-sm text-texto">{etiquetaDeRol(usuario.rol_usuario)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-texto-suave uppercase">Estado</dt>
              <dd className="mt-1 text-sm text-texto">{usuario.activo_usuario ? 'Activo' : 'Deshabilitado'}</dd>
            </div>
          </dl>
          <p className="mt-5 rounded-lg bg-superficie-tenue px-3 py-2 text-xs text-texto-suave">
            Su rol permite consultar usuarios, no modificarlos.
          </p>
        </section>
      )}

      <ModalConfirmacion
        abierto={confirmacionAbierta}
        titulo={usuario.activo_usuario ? 'Deshabilitar usuario' : 'Habilitar usuario'}
        mensaje={
          usuario.activo_usuario
            ? `${usuario.nombres_usuario} ${usuario.apellidos_usuario} no podrá ingresar ni recibir préstamos nuevos. Su historial se conserva y puede volver a habilitarlo.`
            : `${usuario.nombres_usuario} ${usuario.apellidos_usuario} podrá volver a ingresar con su correo y contraseña.`
        }
        textoConfirmar={usuario.activo_usuario ? 'Deshabilitar' : 'Habilitar'}
        peligro={usuario.activo_usuario}
        cargando={cambiandoEstado}
        onConfirmar={confirmarCambioDeEstado}
        onCancelar={() => setConfirmacionAbierta(false)}
      />
    </div>
  )
}
