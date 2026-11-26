// Marca de TechAsset: etiqueta de activo (esquina cortada, perforación y check) más el wordmark.
// El dibujo va en SVG y el texto es real, para que se lea «TechAsset» una sola vez y escale nítido.
const ETIQUETA =
  'M112 50 H222 Q270 50 270 98 V222 Q270 270 222 270 H98 Q50 270 50 222 V112 Z'
const HUECO = 'M113 102 A11 11 0 1 1 91 102 A11 11 0 1 1 113 102 Z'
const CHECK = 'M120 170 L150 200 L210 124'

export default function MarcaTechAsset({ alto = 40, tema = 'claro', conTexto = true, className = '' }) {
  const relleno = tema === 'oscuro' ? '#00A3FF' : '#0C1524'
  const trazo = tema === 'oscuro' ? '#0C1524' : '#00A3FF'
  const colorTech = tema === 'oscuro' ? 'text-white' : 'text-titulo'
  const colorAsset = tema === 'oscuro' ? 'text-marca-600' : 'text-marca-700'

  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: alto * 0.29 }}>
      <svg
        width={alto}
        height={alto}
        viewBox="0 0 320 320"
        aria-hidden="true"
        focusable="false"
        className="shrink-0"
      >
        <path d={`${ETIQUETA} ${HUECO}`} fill={relleno} fillRule="evenodd" />
        <path
          d={CHECK}
          fill="none"
          stroke={trazo}
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {conTexto && (
        <span
          className={`leading-none font-bold tracking-tight ${colorTech}`}
          style={{ fontSize: Math.round(alto * 0.54) }}
        >
          Tech<span className={colorAsset}>Asset</span>
        </span>
      )}
    </span>
  )
}
