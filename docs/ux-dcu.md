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
