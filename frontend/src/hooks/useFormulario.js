import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ErrorDeApi } from '../api/clienteApi'
import { etiquetaDeCampo, mensajeDeResumen } from '../reglas/campos'

// Estado y lógica de un formulario: valores, errores por campo, validación después de interactuar,
// envío con estado ocupado y mensaje del servidor. No dibuja nada.
//
// Validación (guías validate-input-after-interaction, required-field-feedback y
// accessible-error-announcement):
// - al cargar no hay errores;
// - al escribir solo se limpia el error del campo que se está corrigiendo;
// - al salir de un campo se valida ese campo, pero solo si la persona lo modificó o ya tiene valor;
// - al enviar se validan todos, se muestra un resumen, se enfoca el primer error y se anuncia;
// - los errores del servidor se integran igual que los del cliente.
export function useFormulario({
  valoresIniciales,
  validar,
  alEnviar,
  camposObligatorios = [],
  etiquetas = {},
}) {
  const [valores, setValores] = useState(valoresIniciales)
  const [errores, setErrores] = useState({})
  const [tocado, setTocado] = useState({})
  const [modificados, setModificados] = useState({})
  const [intentoEnviado, setIntentoEnviado] = useState(false)
  const [anuncio, setAnuncio] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const temporizadorAnuncio = useRef(null)

  const faltanDatos = useMemo(
    () => camposObligatorios.some((campo) => !String(valores[campo] ?? '').trim()),
    [camposObligatorios, valores],
  )

  const anunciar = useCallback((texto) => {
    clearTimeout(temporizadorAnuncio.current)
    setAnuncio('')
    if (!texto) return

    // Un pequeño retraso evita que el aviso se solape con el nombre del campo que acaba de recibir
    // el foco después de enviar el formulario.
    temporizadorAnuncio.current = setTimeout(() => setAnuncio(texto), 350)
  }, [])

  useEffect(() => () => clearTimeout(temporizadorAnuncio.current), [])

  const nombreDeCampo = useCallback(
    (campo) => etiquetas[campo] ?? etiquetaDeCampo(campo),
    [etiquetas],
  )

  const establecerValores = useCallback((nuevos) => {
    clearTimeout(temporizadorAnuncio.current)
    setValores(nuevos)
    setErrores({})
    setTocado({})
    setModificados({})
    setIntentoEnviado(false)
    setAnuncio('')
    setMensaje(null)
  }, [])

  // Actualiza solo un campo del mapa de errores, sin borrar los errores de los demás.
  const actualizarError = useCallback((campo, mensajeDelCampo) => {
    setErrores((anteriores) => {
      const resultado = { ...anteriores }
      if (mensajeDelCampo) resultado[campo] = mensajeDelCampo
      else delete resultado[campo]
      return resultado
    })
  }, [])

  const cambiar = useCallback(
    (evento) => {
      const { name, type, value, checked } = evento.target
      const nuevoValor = type === 'checkbox' ? checked : value
      const siguientes = { ...valores, [name]: nuevoValor }

      setValores(siguientes)
      setModificados((actuales) => ({ ...actuales, [name]: true }))

      // Mientras escribe no se le muestra un error nuevo. Si el campo ya estaba marcado o el envío
      // ya se intentó, se vuelve a validar para retirar el error en cuanto se corrige.
      if (validar && (tocado[name] || intentoEnviado)) {
        const nuevosErrores = validar(siguientes)
        actualizarError(name, nuevosErrores[name])
        if (nuevosErrores[name]) anunciar('')
      } else if (errores[name]) {
        actualizarError(name, '')
      }
    },
    [actualizarError, anunciar, errores, intentoEnviado, tocado, validar, valores],
  )

  const salirDelCampo = useCallback(
    (evento) => {
      const { name } = evento.target
      setTocado((actuales) => ({ ...actuales, [name]: true }))

      if (!validar) return

      const nuevosErrores = validar(valores)
      const mensajeDelCampo = nuevosErrores[name]
      const huboInteraccion =
        modificados[name] || String(valores[name] ?? '').trim() !== '' || intentoEnviado

      if (huboInteraccion) {
        actualizarError(name, mensajeDelCampo)
        if (mensajeDelCampo) anunciar(`${nombreDeCampo(name)}: ${mensajeDelCampo}`)
      }
    },
    [actualizarError, anunciar, intentoEnviado, modificados, nombreDeCampo, validar, valores],
  )

  const enfocarCampo = useCallback((campo) => {
    const elemento = document.getElementById(campo) ?? document.querySelector(`[name="${campo}"]`)
    elemento?.focus()
  }, [])

  const enviar = useCallback(
    async (evento) => {
      evento?.preventDefault()
      setMensaje(null)

      const nuevosErrores = validar ? validar(valores) : {}
      setErrores(nuevosErrores)
      setTocado(Object.fromEntries(Object.keys(valores).map((campo) => [campo, true])))
      setIntentoEnviado(true)

      const camposConError = Object.keys(nuevosErrores)
      if (camposConError.length > 0) {
        anunciar(mensajeDeResumen(camposConError.length))
        enfocarCampo(camposConError[0])
        return
      }

      setEnviando(true)
      try {
        await alEnviar(valores)
        setIntentoEnviado(false)
        setAnuncio('')
      } catch (error) {
        if (error instanceof ErrorDeApi) {
          const erroresDelServidor = Object.fromEntries(
            Object.entries(error.errores).map(([campo, mensajes]) => [campo, mensajes[0] ?? '']),
          )
          setErrores((anteriores) => ({ ...anteriores, ...erroresDelServidor }))
          setMensaje({ tipo: 'error', texto: error.message })
          const camposDelServidor = Object.keys(erroresDelServidor)
          if (camposDelServidor.length > 0) {
            anunciar(mensajeDeResumen(camposDelServidor.length))
            enfocarCampo(camposDelServidor[0])
          }
        } else {
          setMensaje({ tipo: 'error', texto: 'No se pudo completar la operación. Intente nuevamente.' })
        }
      } finally {
        setEnviando(false)
      }
    },
    [alEnviar, anunciar, enfocarCampo, validar, valores],
  )

  const resumenErrores = useMemo(
    () =>
      Object.entries(errores)
        .filter(([, mensajeDelCampo]) => Boolean(mensajeDelCampo))
        .map(([campo, mensajeDelCampo]) => ({
          campo,
          etiqueta: nombreDeCampo(campo),
          mensaje: mensajeDelCampo,
        })),
    [errores, nombreDeCampo],
  )

  return {
    valores,
    errores,
    tocado,
    intentoEnviado,
    anuncio,
    enviando,
    mensaje,
    faltanDatos,
    resumenErrores,
    cambiar,
    salirDelCampo,
    enviar,
    establecerValores,
  }
}
