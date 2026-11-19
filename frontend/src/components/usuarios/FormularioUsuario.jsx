import { useState } from 'react'
import AccionesDeFormulario from '../ui/AccionesDeFormulario'
import AlertMessage from '../ui/AlertMessage'
import ResumenDeErrores from '../ui/ResumenDeErrores'
import SeccionNumerada from '../ui/SeccionNumerada'
import SelectInput from '../ui/SelectInput'
import TextInput from '../ui/TextInput'
import { ROLES } from '../../reglas/catalogos'

// Formulario de registro y edición (RF-01, RF-02). Agrupa los campos en dos tarjetas numeradas,
// muestra el error junto a su campo y, al intentar guardar, un resumen que lleva al primer error.
export default function FormularioUsuario({
  esNuevo = true,
  valores,
  errores,
  mensaje,
  enviando,
  faltanDatos,
  intentoEnviado = false,
  anuncio = '',
  resumenErrores = [],
  cambiar,
  salirDelCampo,
  enviar,
  onCancelar,
}) {
  const [verContrasena, setVerContrasena] = useState(false)

  return (
    <form noValidate onSubmit={enviar} className="space-y-6" aria-label="Formulario de usuario">
      <p className="sr-only" aria-live="polite">
        {anuncio}
      </p>

      {mensaje && <AlertMessage tipo={mensaje.tipo}>{mensaje.texto}</AlertMessage>}

      {intentoEnviado && <ResumenDeErrores errores={resumenErrores} />}

      <p className="text-xs text-texto-suave">
        Los campos con <span aria-hidden="true">*</span> son obligatorios.
      </p>

      <SeccionNumerada
        id="titulo-datos-persona"
        numero="1"
        titulo="Datos de la persona"
        descripcion="Nombres, apellidos, correo corporativo y área. El correo será su usuario para ingresar."
      >
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Nombres"
            name="nombres_usuario"
            value={valores.nombres_usuario}
            onChange={cambiar}
            onBlur={salirDelCampo}
            error={errores.nombres_usuario}
            autoComplete="given-name"
            required
          />
          <TextInput
            label="Apellidos"
            name="apellidos_usuario"
            value={valores.apellidos_usuario}
            onChange={cambiar}
            onBlur={salirDelCampo}
            error={errores.apellidos_usuario}
            autoComplete="family-name"
            required
          />
          <div className="sm:col-span-2">
            <TextInput
              label="Correo corporativo"
              name="correo_usuario"
              type="email"
              inputMode="email"
              value={valores.correo_usuario}
              onChange={cambiar}
              onBlur={salirDelCampo}
              error={errores.correo_usuario}
              ayuda="Debe ser único en TechAsset. Ejemplo: nombre.apellido@innovatech.pe"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <TextInput
              label="Área"
              name="area_usuario"
              value={valores.area_usuario}
              onChange={cambiar}
              onBlur={salirDelCampo}
              error={errores.area_usuario}
              ayuda="Área de Innovatech a la que pertenece la persona."
              autoComplete="organization"
              required
            />
          </div>
        </div>
      </SeccionNumerada>

      <SeccionNumerada
        id="titulo-acceso"
        numero="2"
        titulo="Acceso y permisos"
        descripcion="El rol define el menú y las acciones permitidas. La API vuelve a comprobarlo en cada operación."
      >
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="Rol"
            name="rol_usuario"
            value={valores.rol_usuario}
            onChange={cambiar}
            onBlur={salirDelCampo}
            error={errores.rol_usuario}
            opciones={ROLES}
            placeholder="Seleccione un rol"
            required
          />
          <TextInput
            label={esNuevo ? 'Contraseña inicial' : 'Nueva contraseña (opcional)'}
            name="contrasena"
            type={verContrasena ? 'text' : 'password'}
            value={valores.contrasena}
            onChange={cambiar}
            onBlur={salirDelCampo}
            error={errores.contrasena}
            ayuda="De 8 a 64 caracteres, con mayúscula, minúscula y número."
            autoComplete="new-password"
            required={esNuevo}
            sufijo={
              <button
                type="button"
                onClick={() => setVerContrasena((visible) => !visible)}
                aria-pressed={verContrasena}
                className="rounded px-2 py-1 text-xs font-semibold text-marca-700 hover:bg-marca-50"
              >
                {verContrasena ? 'Ocultar' : 'Mostrar'}
              </button>
            }
          />
        </div>
      </SeccionNumerada>

      <AccionesDeFormulario
        faltanDatos={faltanDatos}
        enviando={enviando}
        textoEnviar={esNuevo ? 'Registrar usuario' : 'Guardar cambios'}
        textoCargando={esNuevo ? 'Registrando…' : 'Guardando…'}
        onCancelar={onCancelar}
      />
    </form>
  )
}
