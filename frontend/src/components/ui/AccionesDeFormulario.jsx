import Button from './Button'

// Pie común de los formularios: dice si faltan datos, cancela sin guardar y envía con su verbo.
// El botón queda deshabilitado mientras falte un obligatorio o la operación esté en curso.
export default function AccionesDeFormulario({
  faltanDatos,
  mensajeFaltan = 'Complete los campos obligatorios para guardar.',
  enviando,
  textoEnviar,
  textoCargando = 'Guardando…',
  onCancelar,
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-texto-suave">
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
          disabled={faltanDatos}
        >
          {textoEnviar}
        </Button>
      </div>
    </div>
  )
}
