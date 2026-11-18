using TechAsset.Domain.Excepciones;

namespace TechAsset.Domain.Comun;

// Objeto de valor del periodo de un préstamo (RN-04). La fecha de préstamo es la de la aprobación
// (D-04), así que mientras el préstamo está Solicitado solo existe la fecha de devolución
// comprometida; al aprobar se fija la fecha de préstamo y se vuelve a comprobar la regla.
public sealed class PeriodoDePrestamo
{
    private PeriodoDePrestamo()
    {
        FechaDevolucionPrestamo = default;
    }

    private PeriodoDePrestamo(DateOnly? fechaPrestamo, DateOnly fechaDevolucionPrestamo)
    {
        FechaPrestamo = fechaPrestamo;
        FechaDevolucionPrestamo = fechaDevolucionPrestamo;
    }

    public DateOnly? FechaPrestamo { get; private set; }

    public DateOnly FechaDevolucionPrestamo { get; private set; }

    // RF-09: al solicitar, la devolución comprometida debe ser posterior a hoy, que es la fecha más
    // temprana posible de la aprobación (RN-04).
    public static PeriodoDePrestamo Solicitar(DateOnly? fechaDevolucionPrestamo, DateOnly hoy)
    {
        if (fechaDevolucionPrestamo is not { } fechaDevolucion)
        {
            throw new DatosInvalidosExcepcion(
                CamposDePrestamo.FechaDevolucionPrestamo,
                "Indique la fecha de devolución comprometida.");
        }

        if (fechaDevolucion <= hoy)
        {
            throw new DatosInvalidosExcepcion(
                CamposDePrestamo.FechaDevolucionPrestamo,
                "La fecha de devolución debe ser posterior a la fecha de hoy.");
        }

        return new PeriodoDePrestamo(null, fechaDevolucion);
    }

    // RF-09 y RN-04: al aprobar se conoce la fecha de préstamo; la devolución sigue siendo posterior.
    public PeriodoDePrestamo ConFechaDePrestamo(DateOnly fechaPrestamo)
    {
        if (FechaDevolucionPrestamo <= fechaPrestamo)
        {
            throw new DatosInvalidosExcepcion(
                CamposDePrestamo.FechaDevolucionPrestamo,
                "La fecha de devolución debe ser posterior a la fecha de préstamo.");
        }

        return new PeriodoDePrestamo(fechaPrestamo, FechaDevolucionPrestamo);
    }
}
