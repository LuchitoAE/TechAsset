using TechAsset.Domain.Comun;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Domain.Entidades;

// Préstamo de un equipo a un colaborador. Nace Solicitado (D-04), el Responsable de Tecnología lo
// aprueba o lo rechaza, y la devolución exige observaciones (RN-10). Un equipo solo puede tener un
// préstamo Activo (RN-01) y la devolución se compromete para una fecha posterior a la del préstamo
// (RN-04). El responsable es obligatorio (RN-05).
public sealed class Prestamo
{
    public const int LongitudMinimaObservacion = 5;
    public const int LongitudMaximaObservacion = 500;
    public const int LongitudMinimaMotivo = 5;
    public const int LongitudMaximaMotivo = 500;

    private Prestamo()
    {
        Periodo = null!;
        Equipo = null!;
        Responsable = null!;
    }

    private Prestamo(
        Guid idPrestamo,
        Equipo equipo,
        Usuario responsable,
        PeriodoDePrestamo periodo,
        DateTimeOffset fechaSolicitudPrestamo)
    {
        IdPrestamo = idPrestamo;
        IdEquipo = equipo.IdEquipo;
        IdUsuario = responsable.IdUsuario;
        Equipo = equipo;
        Responsable = responsable;
        Periodo = periodo;
        EstadoPrestamo = EstadoPrestamo.Solicitado;
        FechaSolicitudPrestamo = fechaSolicitudPrestamo;
    }

    public Guid IdPrestamo { get; private set; }

    public Guid IdEquipo { get; private set; }

    public Guid IdUsuario { get; private set; }

    public Equipo Equipo { get; private set; }

    public Usuario Responsable { get; private set; }

    public PeriodoDePrestamo Periodo { get; private set; }

    public EstadoPrestamo EstadoPrestamo { get; private set; }

    public DateOnly? FechaDevolucionRealPrestamo { get; private set; }

    public string? ObservacionPrestamo { get; private set; }

    public string? MotivoRechazoPrestamo { get; private set; }

    public DateTimeOffset FechaSolicitudPrestamo { get; private set; }

    public bool EstaPendiente => EstadoPrestamo == EstadoPrestamo.Solicitado;

    public bool EstaActivo => EstadoPrestamo == EstadoPrestamo.Activo;

    public bool EstaDevuelto => EstadoPrestamo == EstadoPrestamo.Devuelto;

    public bool EstaRechazado => EstadoPrestamo == EstadoPrestamo.Rechazado;

    // RF-12: un préstamo vence cuando sigue activo y la fecha de hoy ya pasó la comprometida. Se
    // calcula al consultar; no se guarda un estado «Vencido».
    public bool EstaVencido(DateOnly hoy) => EstaActivo && hoy > Periodo.FechaDevolucionPrestamo;

    // RF-09 y RN-02 a RN-05: el Colaborador solicita un equipo que se pueda prestar, para una fecha
    // posterior a hoy, y el préstamo queda registrado a su nombre como responsable.
    public static Prestamo Solicitar(
        Equipo? equipo,
        Usuario? responsable,
        DateOnly? fechaDevolucionPrestamo,
        DateOnly hoy,
        DateTimeOffset ahoraEnUtc)
    {
        var errores = new Dictionary<string, string[]>();

        if (equipo is null)
        {
            errores[CamposDePrestamo.IdEquipo] = ["Seleccione el equipo que se presta."];
        }

        if (responsable is null)
        {
            errores[CamposDePrestamo.IdUsuario] = ["El préstamo debe registrar un responsable."];
        }
        else if (!responsable.ActivoUsuario)
        {
            errores[CamposDePrestamo.IdUsuario] = ["El responsable del préstamo debe estar activo."];
        }

        if (errores.Count > 0)
        {
            throw new DatosInvalidosExcepcion(errores);
        }

        // RN-02 y RN-03: no se presta un equipo en Mantenimiento ni en Baja.
        equipo!.ValidarPrestable();

        var periodo = PeriodoDePrestamo.Solicitar(fechaDevolucionPrestamo, hoy);

        return new Prestamo(Guid.NewGuid(), equipo, responsable!, periodo, ahoraEnUtc);
    }

    // RF-09 y D-04: la aprobación fija la fecha de préstamo en el día y deja el préstamo Activo; el
    // equipo pasa a Prestado en el mismo caso de uso y la misma transacción (D-05).
    public void Aprobar(DateOnly fechaPrestamo)
    {
        if (!EstaPendiente)
        {
            throw new ConflictoDeNegocioExcepcion(
                "Solo se puede aprobar un préstamo que esté pendiente de aprobación.");
        }

        // Se valida antes de asignar: si la fecha no sirve, el préstamo queda como estaba.
        var periodo = Periodo.ConFechaDePrestamo(fechaPrestamo);

        Periodo = periodo;
        EstadoPrestamo = EstadoPrestamo.Activo;
    }

    // RF-09: el rechazo guarda el motivo y deja el equipo como estaba.
    public void Rechazar(string? motivoRechazoPrestamo)
    {
        if (!EstaPendiente)
        {
            throw new ConflictoDeNegocioExcepcion(
                "Solo se puede rechazar un préstamo que esté pendiente de aprobación.");
        }

        MotivoRechazoPrestamo = ValidarTexto(
            CamposDePrestamo.MotivoRechazoPrestamo,
            motivoRechazoPrestamo,
            "Registre el motivo del rechazo.",
            "El motivo del rechazo",
            LongitudMinimaMotivo,
            LongitudMaximaMotivo);

        EstadoPrestamo = EstadoPrestamo.Rechazado;
    }

    // RF-10 y RN-10: solo un préstamo activo se devuelve, con la fecha real y observaciones
    // obligatorias sobre el estado en que vuelve el equipo.
    public void RegistrarDevolucion(string? observacionPrestamo, DateOnly fechaDevolucionReal)
    {
        if (EstaDevuelto)
        {
            throw new ConflictoDeNegocioExcepcion("El préstamo ya fue devuelto.");
        }

        if (!EstaActivo)
        {
            throw new ConflictoDeNegocioExcepcion("Solo se puede devolver un préstamo activo.");
        }

        ObservacionPrestamo = ValidarTexto(
            CamposDePrestamo.ObservacionPrestamo,
            observacionPrestamo,
            "Registre las observaciones de la devolución.",
            "Las observaciones de la devolución",
            LongitudMinimaObservacion,
            LongitudMaximaObservacion);

        FechaDevolucionRealPrestamo = fechaDevolucionReal;
        EstadoPrestamo = EstadoPrestamo.Devuelto;
    }

    private static string ValidarTexto(
        string campo,
        string? valor,
        string mensajeObligatorio,
        string nombreDelDato,
        int longitudMinima,
        int longitudMaxima)
    {
        var texto = (valor ?? string.Empty).Trim();

        if (texto.Length == 0)
        {
            throw new DatosInvalidosExcepcion(campo, mensajeObligatorio);
        }

        if (texto.Length < longitudMinima || texto.Length > longitudMaxima)
        {
            throw new DatosInvalidosExcepcion(
                campo,
                $"{nombreDelDato} debe tener entre {longitudMinima} y {longitudMaxima} caracteres.");
        }

        return texto;
    }
}
