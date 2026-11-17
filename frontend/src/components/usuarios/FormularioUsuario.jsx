import { useState } from 'react'
import AlertMessage from '../ui/AlertMessage'
import Button from '../ui/Button'
import SelectInput from '../ui/SelectInput'
import TextInput from '../ui/TextInput'
import { ROLES } from '../../reglas/catalogos'

// Formulario de registro y edición (RF-01, RF-02). Agrupa los campos en dos tarjetas numeradas,
// muestra el error junto a su campo y deshabilita Guardar mientras falte un dato obligatorio.
export default function FormularioUsuario({
  esNuevo = true,
  valores,
  errores,
  mensaje,
  enviando,
  faltanDatos,
  cambiar,
  salirDelCampo,
  enviar,
  onCancelar,
}) {
  const [verContrasena, setVerContrasena] = useState(false)

  return (
    <form noValidate onSubmit={enviar} className="space-y-6">
      {mensaje && <AlertMessage tipo={mensaje.tipo}>{mensaje.texto}</AlertMessage>}

      <section
        aria-labelledby="titulo-datos-persona"
        className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-full bg-marca-50 text-sm font-bold text-marca-700"
          >
            1
          </span>
          <div>
            <h2 id="titulo-datos-persona" className="text-base font-bold text-titulo">
              Datos de la persona
            </h2>
            <p className="mt-0.5 text-sm text-texto-suave">
              Nombres, apellidos, correo corporativo y área. El correo será su usuario para ingresar.
            </p>
          </div>
        </div>

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
              required
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="titulo-acceso"
        className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-full bg-marca-50 text-sm font-bold text-marca-700"
          >
            2
          </span>
          <div>
            <h2 id="titulo-acceso" className="text-base font-bold text-titulo">
              Acceso y permisos
            </h2>
            <p className="mt-0.5 text-sm text-texto-suave">
              El rol define el menú y las acciones permitidas. La API vuelve a comprobarlo en cada operación.
            </p>
          </div>
        </div>

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
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-texto-suave">
          {faltanDatos ? 'Complete los campos obligatorios para guardar.' : 'Todos los datos obligatorios están completos.'}
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variante="secundario" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </Button>
          <Button
            tipo="submit"
            cargando={enviando}
            textoCargando={esNuevo ? 'Registrando…' : 'Guardando…'}
            disabled={faltanDatos}
          >
            {esNuevo ? 'Registrar usuario' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </form>
  )
}
