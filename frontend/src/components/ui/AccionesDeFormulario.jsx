import Button from './Button'

// Pie común de los formularios: dice si faltan datos, cancela sin guardar y envía con su verbo.
// El botón de enviar NO se deshabilita por datos faltantes: la persona debe poder intentar guardar
// para que la validación marque los obligatorios y lleve el foco al primer error (guía forms).
// Solo se deshabilita mientras la operación está en curso, para evitar envíos dobles.
export default function AccionesDeFormulario({
  faltanDatos,
  mensajeFaltan = 'Aún faltan campos obligatorios; se marcarán al guardar.',
  enviando,
  textoEnviar,
  textoCargando = 'Guardando…',
  onCancelar,
}) {
  const idAyuda = 'ayuda-acciones-formulario'

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p id={idAyuda} className="text-xs leading-relaxed text-texto-suave">
        {faltanDatos ? mensajeFaltan : 'Todos los datos obligatorios están completos.'}
      </p>
      <div className="flex flex-wrap justify-end gap-3">
        <Button variante="secundario" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </Button>
        <Button
          tipo="submit"
          cargando={enviando}
          textoCargando={textoCargando}
          aria-describedby={idAyuda}
        >
          {textoEnviar}
        </Button>
      </div>
    </div>
  )
}
