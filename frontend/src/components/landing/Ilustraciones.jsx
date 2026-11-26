// Ilustraciones de las tres tarjetas de características. Son decorativas (aria-hidden): el texto de
// la tarjeta ya explica lo mismo, así que no se anuncian dos veces.
const TINTA = '#0c1524'
const SUAVE = '#5b6779'
const BORDE = '#dce3ee'
const CIAN = '#0077c8'
const CIAN_CLARO = '#bfe6ff'
const CIAN_VIVO = '#00a3ff'
const EXITO = '#0fa36b'
const AVISO = '#e58a00'

function Marco({ children, vista = '0 0 376 168' }) {
  return (
    <svg viewBox={vista} role="presentation" focusable="false" className="h-auto w-full">
      <rect x="0.5" y="0.5" width="375" height="167" rx="12" fill="#ffffff" stroke={BORDE} />
      {children}
    </svg>
  )
}

export function IlustracionInventario() {
  return (
    <Marco>
      <text x="20" y="28" fill={SUAVE} fontSize="8.5" fontWeight="600" letterSpacing="0.6">
        CÓDIGO
      </text>
      <text x="96" y="28" fill={SUAVE} fontSize="8.5" fontWeight="600" letterSpacing="0.6">
        EQUIPO
      </text>
      <text x="242" y="28" fill={SUAVE} fontSize="8.5" fontWeight="600" letterSpacing="0.6">
        ESTADO
      </text>

      {[
        ['TK-9005', 'Laptop Dell', 'Disponible', EXITO],
        ['TK-9006', 'Proyector', 'Prestado', CIAN_VIVO],
        ['TK-9011', 'Impresora', 'Mantenimiento', AVISO],
      ].map(([codigo, equipo, estado, color], indice) => {
        const y = 44 + indice * 40
        return (
          <g key={codigo}>
            <line x1="12" y1={y + 28} x2="364" y2={y + 28} stroke={BORDE} />
            <text x="20" y={y + 18} fill={TINTA} fontSize="9.5" fontWeight="600">
              {codigo}
            </text>
            <text x="96" y={y + 18} fill={TINTA} fontSize="9.5" fontWeight="600">
              {equipo}
            </text>
            <circle cx="248" cy={y + 14} r="3" fill={color} />
            <text x="256" y={y + 18} fill={TINTA} fontSize="9" fontWeight="600">
              {estado}
            </text>
          </g>
        )
      })}
    </Marco>
  )
}

export function IlustracionPrestamos() {
  return (
    <Marco>
      <text x="18" y="26" fill={SUAVE} fontSize="7.5" fontWeight="600" letterSpacing="0.5">
        PRÉSTAMO #TK-9005
      </text>
      <text x="18" y="42" fill={TINTA} fontSize="11" fontWeight="600">
        Laptop Dell 5450
      </text>

      <text x="18" y="70" fill={SUAVE} fontSize="7" fontWeight="600" letterSpacing="0.4">
        PRESTADO
      </text>
      <text x="18" y="84" fill={TINTA} fontSize="9" fontWeight="600">
        17/11/2026
      </text>

      <text x="92" y="70" fill={SUAVE} fontSize="7" fontWeight="600" letterSpacing="0.4">
        DEVUELVE
      </text>
      <text x="92" y="84" fill={AVISO} fontSize="9" fontWeight="600">
        24/11/2026
      </text>

      <rect x="18" y="98" width="72" height="20" rx="10" fill="#e3f4ff" />
      <text x="30" y="111" fill={CIAN} fontSize="9" fontWeight="600">
        En curso
      </text>

      <line x1="186" y1="14" x2="186" y2="154" stroke={BORDE} />

      <text x="202" y="26" fill={SUAVE} fontSize="7.5" fontWeight="600" letterSpacing="0.5">
        APROBACIÓN
      </text>

      {['Solicita', 'Aprueba', 'Devuelve'].map((paso, indice) => {
        const y = 40 + indice * 36
        const activo = indice === 1
        return (
          <g key={paso}>
            {indice < 2 && <line x1="207" y1={y + 18} x2="207" y2={y + 34} stroke={BORDE} />}
            <circle cx="207" cy={y + 10} r="5" fill={activo ? CIAN_VIVO : CIAN_CLARO} />
            {activo && <circle cx="207" cy={y + 10} r="2" fill="#ffffff" />}
            <text x="220" y={y + 14} fill={TINTA} fontSize="9" fontWeight="600">
              {paso}
            </text>
            {activo && <rect x="216" y={y + 2} width="136" height="18" rx="9" fill="none" stroke={CIAN_VIVO} />}
          </g>
        )
      })}
    </Marco>
  )
}

export function IlustracionReportes() {
  const barras = [
    ['ENE', 46],
    ['FEB', 74],
    ['MAR', 96],
    ['ABR', 128],
    ['MAY', 70],
    ['JUN', 88],
  ]

  return (
    <Marco>
      <text x="18" y="24" fill={SUAVE} fontSize="7.5" fontWeight="600" letterSpacing="0.5">
        PRÉSTAMOS POR MES
      </text>
      <text x="338" y="24" fill={CIAN} fontSize="7.5" fontWeight="600" letterSpacing="0.5">
        2026
      </text>

      {barras.map(([mes, alto], indice) => {
        const x = 26 + indice * 52
        const destacada = indice === 3
        return (
          <g key={mes}>
            <rect
              x={x}
              y={138 - alto}
              width="40"
              height={alto}
              rx="5"
              fill={destacada ? CIAN_VIVO : CIAN_CLARO}
            />
            <text x={x + 6} y="154" fill={SUAVE} fontSize="7" fontWeight="600" letterSpacing="0.4">
              {mes}
            </text>
          </g>
        )
      })}
    </Marco>
  )
}
