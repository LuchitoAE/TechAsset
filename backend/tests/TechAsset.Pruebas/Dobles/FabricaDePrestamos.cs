using TechAsset.Domain.Entidades;

namespace TechAsset.Pruebas.Dobles;

// Crea préstamos válidos para las pruebas. Para un préstamo activo se usa la vía del sistema
// (Solicitar y Aprobar), nunca un estado asignado a mano.
public static class FabricaDePrestamos
{
    public static Prestamo Solicitar(
        Equipo equipo,
        Usuario responsable,
        DateOnly fechaDevolucion,
        DateOnly hoy) =>
        Prestamo.Solicitar(equipo, responsable, fechaDevolucion, hoy, new DateTimeOffset(
            hoy.ToDateTime(new TimeOnly(9, 0)),
            TimeSpan.Zero));

    public static Prestamo Activo(
        Equipo equipo,
        Usuario responsable,
        DateOnly hoy,
        int diasDePrestamo = 7)
    {
        var prestamo = Solicitar(equipo, responsable, hoy.AddDays(diasDePrestamo), hoy);
        prestamo.Aprobar(hoy);
        equipo.MarcarComoPrestado();
        return prestamo;
    }

    public static Prestamo Devuelto(
        Equipo equipo,
        Usuario responsable,
        DateOnly hoy,
        int diasDePrestamo = 7)
    {
        var prestamo = Activo(equipo, responsable, hoy, diasDePrestamo);
        prestamo.RegistrarDevolucion("Devuelto en buen estado, con su cargador.", hoy);
        equipo.MarcarComoDisponible();
        return prestamo;
    }
}
