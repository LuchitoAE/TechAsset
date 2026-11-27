import { useEffect } from 'react'

// Título del documento por pantalla (WCAG 2.4.2). La pestaña del navegador y el primer anuncio del
// lector de pantalla dicen en qué pantalla está la persona, no solo el nombre del producto.
export function useTituloDePagina(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · TechAsset` : 'TechAsset'
  }, [titulo])
}
