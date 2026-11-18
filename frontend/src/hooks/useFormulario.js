import { useCallback, useMemo, useState } from 'react'
import { ErrorDeApi } from '../api/clienteApi'

// Estado y lógica de un formulario: valores, errores por campo, validación al salir del campo,
// envío con estado ocupado y mensaje del servidor. No dibuja nada.
export function useFormulario({
  valoresIniciales,
  validar,
  alEnviar,
  camposObligatorios = [],
}) {
  const [valores, setValores] = useState(valoresIniciales)
  const [errores, setErrores] = useState({})
  const [tocado, setTocado] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const faltanDatos = useMemo(
    () => camposObligatorios.some((campo) => !String(valores[campo] ?? '').trim()),
    [camposObligatorios, valores],
  )

  const establecerValores = useCallback((nuevos) => {
    setValores(nuevos)
    setErrores({})
    setTocado({})
  }, [])

  const cambiar = useCallback(
    (evento) => {
      const { name, type, value, checked } = evento.target
      const nuevoValor = type === 'checkbox' ? checked : value
      const siguientes = { ...valores, [name]: nuevoValor }

      setValores(siguientes)

      // Si el campo ya mostraba un error, se vuelve a validar para avisar mientras escribe.
      if (validar && errores[name]) {
        const nuevosErrores = validar(siguientes)
        setErrores((anteriores) => {
          const resultado = { ...anteriores }
          if (nuevosErrores[name]) resultado[name] = nuevosErrores[name]
          else delete resultado[name]
          return resultado
        })
      }
    },
    [errores, validar, valores],
  )

  const salirDelCampo = useCallback(
    (evento) => {
      const { name } = evento.target
      setTocado((actuales) => ({ ...actuales, [name]: true }))

      if (!validar) return

      const nuevosErrores = validar(valores)
      setErrores((anteriores) => {
        const resultado = { ...anteriores }
        if (nuevosErrores[name]) resultado[name] = nuevosErrores[name]
        else delete resultado[name]
        return resultado
      })
    },
    [validar, valores],
  )

  const enviar = useCallback(
    async (evento) => {
      evento?.preventDefault()
      setMensaje(null)

      const nuevosErrores = validar ? validar(valores) : {}
      setErrores(nuevosErrores)
      setTocado(Object.fromEntries(Object.keys(valores).map((campo) => [campo, true])))

      const primerCampoConError = Object.keys(nuevosErrores)[0]
      if (primerCampoConError) {
        document.querySelector(`[name="${primerCampoConError}"]`)?.focus()
        return
      }

      setEnviando(true)
      try {
        await alEnviar(valores)
      } catch (error) {
        if (error instanceof ErrorDeApi) {
          const erroresDelServidor = Object.fromEntries(
            Object.entries(error.errores).map(([campo, mensajes]) => [campo, mensajes[0] ?? '']),
          )
          setErrores((anteriores) => ({ ...anteriores, ...erroresDelServidor }))
          setMensaje({ tipo: 'error', texto: error.message })
          const primerCampo = Object.keys(erroresDelServidor)[0]
          if (primerCampo) document.querySelector(`[name="${primerCampo}"]`)?.focus()
        } else {
          setMensaje({ tipo: 'error', texto: 'No se pudo completar la operación. Intente nuevamente.' })
        }
      } finally {
        setEnviando(false)
      }
    },
    [alEnviar, validar, valores],
  )

  return {
    valores,
    errores,
    tocado,
    enviando,
    mensaje,
    faltanDatos,
    cambiar,
    salirDelCampo,
    enviar,
    establecerValores,
  }
}
