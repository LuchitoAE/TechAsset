using TechAsset.Domain.Comun;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Domain.Entidades;

// Movimiento del historial (RF-17, D-03): deja constancia de un alta, una actualización, un cambio
// de estado o una decisión sobre un préstamo, con su fecha, el equipo, el usuario que lo hizo y un
// detalle legible. Los casos de uso lo registran en la misma transacción que el hecho, para que el
// historial no muestre hechos que no ocurrieron ni pierda los que sí ocurrieron.
public sealed class Movimiento
{
    public const int LongitudMinimaDetalle = 5;
    public const int LongitudMaximaDetalle = 500;

    private Movimiento()
    {
        DetalleMovimiento = string.Empty;
    }

    private Movimiento(
        Guid idMovimiento,
        TipoMovimiento tipoMovimiento,
        DateTimeOffset fechaMovimiento,
        Guid idEquipo,
        Guid idUsuario,
        Guid? idPrestamo,
        string detalleMovimiento)
    {
        IdMovimiento = idMovimiento;
        TipoMovimiento = tipoMovimiento;
        FechaMovimiento = fechaMovimiento;
        IdEquipo = idEquipo;
        IdUsuario = idUsuario;
        IdPrestamo = idPrestamo;
        DetalleMovimiento = detalleMovimiento;
    }

    public Guid IdMovimiento { get; private set; }

    public TipoMovimiento TipoMovimiento { get; private set; }

    public DateTimeOffset FechaMovimiento { get; private set; }

    public Guid IdEquipo { get; private set; }

    public Equipo Equipo { get; private set; } = null!;

    public Guid IdUsuario { get; private set; }

    public Usuario Usuario { get; private set; } = null!;

    // Un movimiento de equipo no tiene préstamo; uno de préstamo lo referencia para poder seguir el
    // rastro completo del equipo (SDD, vista de información).
    public Guid? IdPrestamo { get; private set; }

    public string DetalleMovimiento { get; private set; }

    public static Movimiento Registrar(
        TipoMovimiento tipoMovimiento,
        DateTimeOffset fechaMovimiento,
        Guid idEquipo,
        Guid idUsuario,
        Guid? idPrestamo,
        string? detalleMovimiento)
    {
        var errores = new Dictionary<string, string[]>();

        if (!Enum.IsDefined(tipoMovimiento))
        {
            errores[CamposDeMovimiento.TipoMovimiento] = ["El tipo de movimiento no es válido."];
        }

        if (idEquipo == Guid.Empty)
        {
            errores[CamposDeMovimiento.IdEquipo] = ["El movimiento debe indicar el equipo."];
        }

        if (idUsuario == Guid.Empty)
        {
            errores[CamposDeMovimiento.IdUsuario] = ["El movimiento debe indicar el usuario que lo hizo."];
        }

        if (fechaMovimiento == default)
        {
            errores[CamposDeMovimiento.FechaMovimiento] = ["El movimiento debe indicar su fecha."];
        }

        var detalle = (detalleMovimiento ?? string.Empty).Trim();

        if (detalle.Length == 0)
        {
            errores[CamposDeMovimiento.DetalleMovimiento] = ["El movimiento debe tener un detalle."];
        }
        else if (detalle.Length < LongitudMinimaDetalle || detalle.Length > LongitudMaximaDetalle)
        {
            errores[CamposDeMovimiento.DetalleMovimiento] =
            [
                $"El detalle del movimiento debe tener entre {LongitudMinimaDetalle} y " +
                $"{LongitudMaximaDetalle} caracteres."
            ];
        }

        if (errores.Count > 0)
        {
            throw new DatosInvalidosExcepcion(errores);
        }

        return new Movimiento(
            Guid.NewGuid(),
            tipoMovimiento,
            fechaMovimiento.ToUniversalTime(),
            idEquipo,
            idUsuario,
            idPrestamo,
            detalle);
    }

    // RF-05: alta de un equipo.
    public static Movimiento DeEquipoRegistrado(
        Equipo equipo,
        Guid idUsuario,
        DateTimeOffset fechaMovimiento) =>
        Registrar(
            TipoMovimiento.EquipoRegistrado,
            fechaMovimiento,
            equipo.IdEquipo,
            idUsuario,
            idPrestamo: null,
            $"Se registró el equipo {equipo.CodigoPatrimonial.Valor} ({equipo.NombreEquipo}) " +
            $"en estado {equipo.EstadoEquipo}.");

    // RF-06: corrección de los datos del equipo.
    public static Movimiento DeEquipoActualizado(
        Equipo equipo,
        Guid idUsuario,
        DateTimeOffset fechaMovimiento) =>
        Registrar(
            TipoMovimiento.EquipoActualizado,
            fechaMovimiento,
            equipo.IdEquipo,
            idUsuario,
            idPrestamo: null,
            $"Se actualizaron los datos del equipo {equipo.CodigoPatrimonial.Valor} " +
            $"({equipo.NombreEquipo}).");

    // RF-08: cambio de estado manual, con el estado anterior y el nuevo.
    public static Movimiento DeCambioDeEstado(
        Equipo equipo,
        EstadoEquipo estadoAnterior,
        Guid idUsuario,
        DateTimeOffset fechaMovimiento) =>
        Registrar(
            TipoMovimiento.EquipoEstadoCambiado,
            fechaMovimiento,
            equipo.IdEquipo,
            idUsuario,
            idPrestamo: null,
            $"El equipo {equipo.CodigoPatrimonial.Valor} pasó de {estadoAnterior} a {equipo.EstadoEquipo}.");

    // RF-09: el Colaborador solicita el equipo; el usuario del movimiento es quien solicita.
    public static Movimiento DePrestamoSolicitado(Prestamo prestamo, DateTimeOffset fechaMovimiento) =>
        Registrar(
            TipoMovimiento.PrestamoSolicitado,
            fechaMovimiento,
            prestamo.IdEquipo,
            prestamo.IdUsuario,
            prestamo.IdPrestamo,
            $"Se solicitó el préstamo del equipo {prestamo.Equipo.CodigoPatrimonial.Valor} para " +
            $"{prestamo.Responsable.NombreCompleto}, con devolución comprometida para el " +
            $"{prestamo.Periodo.FechaDevolucionPrestamo:yyyy-MM-dd}.");

    // RF-09 y D-04: la aprobación la hace el Responsable o el Administrador de la sesión.
    public static Movimiento DePrestamoAprobado(
        Prestamo prestamo,
        Guid idUsuarioSesion,
        DateTimeOffset fechaMovimiento) =>
        Registrar(
            TipoMovimiento.PrestamoAprobado,
            fechaMovimiento,
            prestamo.IdEquipo,
            idUsuarioSesion,
            prestamo.IdPrestamo,
            $"Se aprobó el préstamo del equipo {prestamo.Equipo.CodigoPatrimonial.Valor} para " +
            $"{prestamo.Responsable.NombreCompleto}.");

    // RF-09: el rechazo guarda su motivo en el detalle.
    public static Movimiento DePrestamoRechazado(
        Prestamo prestamo,
        Guid idUsuarioSesion,
        DateTimeOffset fechaMovimiento) =>
        Registrar(
            TipoMovimiento.PrestamoRechazado,
            fechaMovimiento,
            prestamo.IdEquipo,
            idUsuarioSesion,
            prestamo.IdPrestamo,
            Recortar(
                $"Se rechazó el préstamo del equipo {prestamo.Equipo.CodigoPatrimonial.Valor} para " +
                $"{prestamo.Responsable.NombreCompleto}. Motivo: {prestamo.MotivoRechazoPrestamo}"));

    // RF-10: la devolución la registra el Responsable o el Administrador de la sesión.
    public static Movimiento DePrestamoDevuelto(
        Prestamo prestamo,
        Guid idUsuarioSesion,
        DateTimeOffset fechaMovimiento) =>
        Registrar(
            TipoMovimiento.PrestamoDevuelto,
            fechaMovimiento,
            prestamo.IdEquipo,
            idUsuarioSesion,
            prestamo.IdPrestamo,
            $"Se registró la devolución del equipo {prestamo.Equipo.CodigoPatrimonial.Valor} de " +
            $"{prestamo.Responsable.NombreCompleto}.");

    private static string Recortar(string detalle) =>
        detalle.Length <= LongitudMaximaDetalle ? detalle : detalle[..LongitudMaximaDetalle];
}
