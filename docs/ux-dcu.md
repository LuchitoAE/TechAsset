# UX y diseño centrado en el usuario — TechAsset

> Registro de la aplicación de DCU, usabilidad y accesibilidad al rediseño visual de 2026.
> Se trabaja **por partes**; cada parte cierra con hallazgos, correcciones y evidencia.
> Referencias: ISO 9241-11:2019, ISO 9241-112:2018, WCAG 2.2, Nielsen (1994),
> Shneiderman (8 reglas, 2016) y las guías de modern-web-guidance usadas en la iteración 7.

## 1. Usuarios, tareas y contexto

Del caso del PDF, los tres actores y sus tareas principales:

| Actor | Tareas principales | Necesita |
| --- | --- | --- |
| Administrador | Cuentas, inventario, supervisión de préstamos y reportes | Ver el panorama completo y detectar excepciones |
| Responsable de Tecnología | Altas de equipos, aprobaciones, devoluciones, inventario | Decidir rápido con la información a la vista |
| Colaborador | Consultar disponibilidad, solicitar préstamos y ver su historial | Entender qué puede pedir y cuándo devolverlo |

**Contexto de uso:** escritorio de oficina y teléfono en el laboratorio; sesiones cortas y repetidas,
a menudo con el equipo en la mano. Se prioriza reconocer sobre recordar y evitar errores irreversibles.

## 2. Cómo se evalúa

| Instrumento | Qué aporta | Dónde se aplica |
| --- | --- | --- |
| ISO 9241-11 | Eficacia, eficiencia y satisfacción | Métricas de tarea por pantalla |
| ISO 9241-112 | Detectabilidad, diferenciación, concisión, consistencia, interpretabilidad | Presentación de datos y mensajes |
| Nielsen (10 heurísticas) | Evaluación heurística | Revisión de cada pantalla |
| Shneiderman (8 reglas) | Consistencia, feedback, cierre, prevención, control, memoria | Flujos de formularios y tablas |
| WCAG 2.2 AA | Contraste, foco, teclado, etiquetas, errores, tamaño de objetivo | Verificación con navegador |

## 3. Partes del trabajo

1. **Fundamentos transversales:** foco, movimiento, avisos, objetivos táctiles y consistencia visual.
2. **Primer contacto:** landing e ingreso.
3. **Trabajo diario:** panel e inventario.
4. **Tareas críticas:** detalle de equipo y préstamos.
5. **Salidas:** reportes y móvil.
6. **Evaluación:** teclado, contraste medido, lector de pantalla y lista WCAG.
7. **Cierre:** métricas, hallazgos y su reflejo en el SDD y el informe.

## Parte 1 — Fundamentos transversales (26/11/2026)

### Hallazgos

| # | Hallazgo | Heurística / regla | Norma |
| --- | --- | --- | --- |
| 1 | El foco de teclado no era uniforme: algunos enlaces de tabla y del menú solo cambiaban de color | Nielsen 1 y 4 · Shneiderman 7 | WCAG 2.4.7 |
| 2 | Las animaciones y transiciones no respetaban «reducir movimiento» | Shneiderman 7 | WCAG 2.3.3 |
| 3 | El aviso flotante tenía el aspecto de la versión anterior (claro, con borde) y no coincidía con el resto | Nielsen 4 · Shneiderman 1 | ISO 9241-112 §6.6 |
| 4 | Los objetivos táctiles pequeños (enlaces «Editar · ⋯») quedaban por debajo de 24 px de alto | Shneiderman 2 | WCAG 2.5.8 |
| 5 | La jerarquía se apoyaba en sombras en algunas tarjetas heredadas | Nielsen 8 | ISO 9241-112 §6.5 |

### Correcciones

1. **Foco visible global** con `:where(a, button, [role='tab'], summary, [tabindex]):focus-visible`
   (contorno de 2 px, separación de 2 px). No suma especificidad: cada componente puede ajustarlo.
2. **Movimiento reducido:** con `prefers-reduced-motion` se anulan animaciones, transiciones y
   desplazamiento suave.
3. **Aviso flotante oscuro**, como las franjas de la landing: icono en caja de color, título
   («Listo» o «No se pudo completar»), texto secundario y cierre. Se conserva la región
   `role="status"`, la pausa al pasar el puntero o enfocar y el traspaso de foco al cerrar.
4. **Objetivos táctiles:** los enlaces de acción de las tablas se ajustan a 24 px como mínimo; los
   botones y píldoras mantienen 44 px.
5. **Sin sombras:** las tarjetas que aún las usaban pasan a borde de 1 px y radio 14–16; la jerarquía
   es color y borde.

### Evidencia

- `Evidencias/iteracion-8/ux/01-foco.png`: foco de teclado en el menú lateral.
- `Evidencias/iteracion-8/ux/02-aviso.png`: aviso flotante con el estilo nuevo.

### Pendiente de esta parte

- Medir contraste de todos los pares texto/fondo del tema claro y oscuro (parte 6).
- Revisar el orden de tabulación en cada pantalla (parte 6).

## Parte 2 — Primer contacto: landing e ingreso (26/11/2026)

### Lo que ya cumplía

- Un solo `h1` por pantalla, regiones `header`, `nav`, `main` y `footer`, enlace «Ir al contenido» y
  foco visible uniforme desde la parte 1.
- La maqueta del panel va oculta al lector de pantalla y descrita una sola vez; las ilustraciones son
  decorativas y el texto de la tarjeta explica lo mismo.
- Los botones dicen qué hacen («Ingresar al sistema», «Conocer más») y mantienen 48 px de alto.
- El ingreso conserva validación tras interacción, resumen de errores, ayuda junto al campo y
  mostrar/ocultar contraseña.

### Hallazgos

| # | Hallazgo | Heurística / regla | Norma |
| --- | --- | --- | --- |
| 1 | Desde el ingreso no había forma de volver a la landing | Nielsen 3 · Shneiderman 7 | — |
| 2 | El correo recibía el foco al abrir: en el teléfono abría el teclado sin que la persona lo pidiera | Nielsen 3 · Shneiderman 7 | WCAG 3.2.1 |
| 3 | Cian 700 sobre fondo y sobre `marca-50` daba 4,33 y 4,17; el error sobre su fondo, 4,22 | Nielsen 9 | WCAG 1.4.3 (4,5:1) |
| 4 | Las anclas de la landing saltaban de golpe | Shneiderman 3 | — |

### Correcciones

1. **«← Volver al inicio»** en la esquina del ingreso, tanto en escritorio como en el teléfono.
2. **Foco inicial solo con puntero fino:** en pantallas táctiles el formulario no abre el teclado; en
   escritorio se mantiene el ahorro del clic.
3. **Tokens de color ajustados:** `marca-700` y `enlace` pasan a `#0070BE` (4,77 sobre fondo, 4,59
   sobre `marca-50`) y `error` a `#C92A1E` (4,79 sobre su fondo). Los tonos «vivo» de gráficos no
   cambian.
4. **Desplazamiento suave** para las anclas, anulado cuando se pide reducir movimiento.

### Contraste medido (WCAG 2.2)

| Par | Antes | Después |
| --- | --- | --- |
| Cian 700 sobre fondo | 4,33 | **4,77** |
| Cian 700 sobre `marca-50` | 4,17 | **4,59** |
| Error sobre `error-fondo` | 4,22 | **4,79** |
| Texto suave sobre fondo | 5,30 | 5,30 |
| Blanco sobre cian 700 | 4,70 | 5,17 |
| Tinta suave sobre tinta | 7,50 | 7,50 |

### Evidencia

- `Evidencias/iteracion-8/ux/03-ingreso.png`: «Volver al inicio» y botón con el cian ajustado.
- `Evidencias/iteracion-8/ux/04-ingreso-movil.png`: sin teclado automático y con el enlace de vuelta.
- `Evidencias/iteracion-8/ux/05-foco-landing.png`: foco visible en «Conocer más».

## Parte 3 — Trabajo diario: panel e inventario (26/11/2026)

### Lo que ya cumplía

- Los KPI llevan glifo, valor, nota y nombre; el estado de la barra va acompañado de leyenda con
  nombre y porcentaje, así que el color no es el único canal.
- El inventario conserva los conteos por estado, el estado vacío con acción y el error con
  «Reintentar»; en el teléfono la tabla se vuelve tarjetas y se oculta la columna de colaborador.
- La paginación anuncia el total y la página, y los botones tienen nombre accesible.

### Hallazgos

| # | Hallazgo | Heurística / regla | Norma |
| --- | --- | --- | --- |
| 1 | Al escribir en «Buscar» no pasaba nada hasta pulsar Enter: no había botón visible ni aviso | Nielsen 1 · Shneiderman 3 | ISO 9241-112 §6.1 |
| 2 | La píldora activa no mostraba cómo quitar el filtro; solo se descubría volviendo a pulsarla | Nielsen 3 y 6 | — |
| 3 | «Editar · ⋯» prometía un menú que no existe | Nielsen 4 · Shneiderman 1 | — |
| 4 | Los totales de la leyenda decían «6» sin unidad | Nielsen 2 | ISO 9241-112 §6.4 |
| 5 | La descripción del panel repetía el rol en dos frases | Nielsen 8 | ISO 9241-112 §6.5 |

### Correcciones

1. **Búsqueda con retardo de 400 ms:** el resultado aparece mientras se escribe; Enter lo aplica al
   instante. El formulario conserva un botón de envío oculto para el teclado.
2. **Píldora activa con «×»** y título «Quitar el filtro de …»; sigue funcionando con `aria-pressed`.
3. **«Editar →»** en lugar de «Editar · ⋯», sin prometer un menú.
4. **Unidades en la leyenda:** «6 equipos», «1 equipo».
5. **Descripción breve del panel:** «Hola, Luis Walter · Administrador · datos al …».

### Evidencia

- `Evidencias/iteracion-8/ux/06-panel.png`: leyendas con unidad y descripción breve.
- `Evidencias/iteracion-8/ux/07-inventario-filtro.png`: filtro activo con «×», «Limpiar» y acción
  «Editar →».

## Parte 4 — Tareas críticas: detalle y préstamos (26/11/2026)

### Lo que ya cumplía

- El detalle confirma los cambios de estado con un diálogo y avisa al terminar; el préstamo pide
  observaciones antes de devolver y motivo antes de rechazar.
- La solicitud muestra solo equipos disponibles, con el código y el nombre a la vista, y la fecha
  mínima la calcula el formulario.
- Aprobar, rechazar y devolver tienen confirmación y cierre con aviso.

### Hallazgos

| # | Hallazgo | Heurística / regla | Norma |
| --- | --- | --- | --- |
| 1 | «Cancelar» al editar un equipo llevaba al inventario en vez de cerrar la edición | Nielsen 3 · Shneiderman 6 y 7 | — |
| 2 | El formulario de edición aparecía después del panel de estado y lejos del botón que lo abría | Nielsen 1 y 6 | ISO 9241-112 §6.1 |
| 3 | Las solicitudes pendientes no se veían en «Préstamos activos»: había que ir al historial y filtrar | Nielsen 6 · Shneiderman 8 | — |
| 4 | El ciclo de un préstamo rechazado mostraba «Aprobación pendiente» y una devolución que nunca ocurrirá | Nielsen 2 | ISO 9241-112 §6.4 |
| 5 | En una solicitud sin aprobar, «Prestado el» mostraba un guion | Nielsen 2 | ISO 9241-112 §6.5 |
| 6 | «Comprometido al» es más técnico que «Devolución comprometida» | Nielsen 2 | — |

### Correcciones

1. **Cancelar cierra la edición** y conserva los valores originales; ya no saca de la pantalla.
2. **Formulario junto al resumen** y botón con `aria-expanded` y `aria-controls` al panel de edición.
3. **«Solicitudes por aprobar»** en Préstamos activos: equipo, colaborador, área y fecha, con «Revisar».
   El Responsable ya no tiene que buscar las pendientes en el historial.
4. **Ciclo honesto:** un rechazo muestra «Solicitud rechazada · No se aprobó» y termina ahí; la
   devolución solo aparece cuando el préstamo se aprobó.
5. **«Aún no aprobado»** en lugar del guion, y los campos de devolución real se ocultan en un rechazo.
6. **«Devolución comprometida»** en lugar de «Comprometido al».

### Evidencia

- `Evidencias/iteracion-8/ux/08-solicitudes.png`: cola de aprobación en Préstamos activos.
- `Evidencias/iteracion-8/ux/09-prestamo-rechazado.png`: ciclo de dos pasos y motivo a la vista.
- `Evidencias/iteracion-8/ux/10-prestamo-pendiente.png`: «Aún no aprobado» y decisión disponible.

## Parte 5 — Salidas y móvil (26/11/2026)

### Lo que ya cumplía

- Las pestañas de reportes se recorren con flechas, Inicio y Fin, y cada panel tiene su descripción,
  filtros, estados vacíos y error con reintento.
- Las tablas de reportes se desplazan dentro de su región, con encabezado fijo y `aria-sort` cuando se
  ordenan; el pie explica la zona horaria.
- En el teléfono, el menú es un cajón con Escape y retorno de foco, y las tablas de inventario y
  préstamos se apilan.

### Hallazgos

| # | Hallazgo | Heurística / regla | Norma |
| --- | --- | --- | --- |
| 1 | La pestaña abierta no se podía compartir ni conservar al recargar | Nielsen 6 · Shneiderman 7 | — |
| 2 | En el teléfono, cada equipo mostraba cuatro campos etiquetados aunque Categoría y Marca ya están en su ficha | Nielsen 8 | ISO 9241-112 §6.5 |
| 3 | La etiqueta «Equipo:» se repetía en cada fila cuando era el único dato visible | Nielsen 8 | ISO 9241-112 §6.5 |

### Correcciones

1. **La pestaña vive en la URL** (`/reportes?reporte=movimientos`): recargar o compartir mantiene el
   reporte abierto y permite enlazarlo desde otro sitio.
2. **Columnas secundarias ocultas en el teléfono** (Categoría y Marca) y sin la etiqueta redundante:
   el reporte de equipos por estado pasó de 3060 a 1868 px de alto a 390 px de ancho.
3. **Sin desbordes horizontales:** se midió `scrollWidth` en nueve rutas a 390 px (landing, ingreso,
   panel, inventario, préstamos, activos, reportes, detalle de equipo y detalle de préstamo) y todas
   coinciden con el ancho de la ventana.

### Evidencia

- `Evidencias/iteracion-8/ux/11-reportes-enlace.png`: pestaña «Movimientos» abierta por URL.
- `Evidencias/iteracion-8/ux/12-reportes-movil.png`: reporte compacto en 390 px.

## Parte 6 — Evaluación de accesibilidad (26/11/2026)

### Lo que se comprobó

| Comprobación | Método | Resultado |
| --- | --- | --- |
| Un solo `h1`, un solo `main`, `lang="es"` | Recorrido automatizado en 9 rutas | Cumple |
| Jerarquía de encabezados | Se detectaron saltos h1→h3 en panel y reportes | **Corregido** con `h2` de sección |
| Controles de formulario con nombre accesible | Etiqueta, `aria-label` o `aria-labelledby` | 0 sin nombre |
| Enlaces y botones sin nombre | Texto o `aria-label` | 0 vacíos |
| Imágenes sin alternativa | `alt` o `aria-hidden` | 0 |
| Identificadores duplicados | Recorrido de `id` | 0 |
| Objetivos táctiles | Rectángulos de enlaces y botones | Enlaces de nav y tabla ajustados a 24 px; el enlace de salto es `sr-only` |
| Orden de tabulación | 16 pulsaciones de Tab en el panel | Salto → marca → menú → Salir → tema → contenido; sin trampas |
| Contraste | 26 pares texto/fondo, temas claro y oscuro | Todos ≥ 4,5 salvo el cian 600, reservado para gráficos |

### Correcciones

1. **`h2` de sección** en el panel («Indicadores del panel») y en cada reporte (su nombre), para que los
   `h3` de las tarjetas no salten un nivel.
2. **Objetivos de 24 px** en los enlaces de navegación de la landing, el pie y los enlaces de equipo de
   las tablas.

### Límites de esta parte

- La revisión con lector de pantalla real (NVDA o VoiceOver) sigue pendiente: no hay uno instalado en
  este equipo. Queda anotada como deuda en el `CONTEXTO`.
- La prueba con usuarios del PDF también queda pendiente; las métricas de ISO 9241-11 (eficacia,
  eficiencia y satisfacción) se proponen en el informe.

### Evidencia

- `Evidencias/iteracion-8/ux/13-auditoria.txt`: salida del recorrido por las nueve rutas.
- `Evidencias/iteracion-8/ux/14-contraste.txt`: los 26 pares medidos.
- `Evidencias/iteracion-8/ux/15-teclado.txt`: orden de tabulación del panel.

## Parte 7 — Cierre: métricas y documentación (26/11/2026)

### Métricas propuestas (ISO 9241-11)

| Dimensión | Indicador | Cómo se mide | Meta |
| --- | --- | --- | --- |
| Eficacia | Tareas completadas sin error | Registro de 5 tareas: alta de equipo, solicitud, aprobación, devolución y consulta de reporte | ≥ 95 % |
| Eficiencia | Tiempo por tarea | Cronómetro desde que se abre la pantalla hasta el aviso de éxito | Alta de equipo < 2 min; solicitud y devolución < 1 min |
| Satisfacción | Escala de 1 a 5 | Cuestionario breve al final de la prueba (claridad, confianza, esfuerzo) | ≥ 4,0 |
| Accesibilidad | Barreras detectadas | Recorrido con teclado y lector de pantalla | 0 bloqueos |

La prueba con usuarios del PDF sigue pendiente; las métricas quedan listas para aplicarla.

### Dónde quedó documentado

- **SDD 0100 (26 hojas):** nueva subsección «Rediseño visual y diseño centrado en el usuario (iteración
  8)», con la identidad, la tabla de auditoría por partes, los componentes nuevos y la evaluación
  actualizada. Se agregó la revisión de la iteración 8 al historial.
- **Informe técnico breve (9 hojas):** estándares de interfaz, párrafo del rediseño en reutilización y en
  salidas, capturas nuevas en formularios, panel y galería; pruebas actualizadas a 225 xUnit y 123 Vitest.
- **Sustentación (13 diapositivas):** capturas nuevas en las diapositivas 7 y 9, cifra de 123 pruebas y
  mención de la auditoría UX en la diapositiva 9; el guion acompaña el cambio.
- **`Entrega/`:** capturas de frontend, formularios, consultas y dashboard regeneradas con el rediseño;
  `00-LEEME.md` con 123 pruebas y el SDD de 26 hojas.

### Resultado de la auditoría

- 9 rutas revisadas: un `h1` y un `main`, 0 controles sin nombre, 0 enlaces vacíos, 0 imágenes sin
  alternativa, 0 identificadores duplicados.
- 26 pares de contraste AA en claro y oscuro; el cian 600 queda reservado para gráficos.
- Orden de tabulación sin trampas y sin desbordes a 390 px.
- Deuda declarada: lector de pantalla real y prueba con usuarios.






