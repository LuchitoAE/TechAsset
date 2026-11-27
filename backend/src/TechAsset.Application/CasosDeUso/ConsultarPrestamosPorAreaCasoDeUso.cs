using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-16: préstamos por área del responsable en un periodo. Un rango al revés se rechaza con el
// mismo mensaje por campo que el resto de la API.
public sealed class ConsultarPrestamosPorAreaCasoDeUso(
    IConsultaDePrestamosPorArea consultaDePrestamosPorArea)
{
    public Task<ReporteDePrestamosPorArea> EjecutarAsync(
        FiltroDePrestamosPorArea filtro,
        CancellationToken cancellationToken = default)
    {
        if (filtro.Desde is { } desde && filtro.Hasta is { } hasta && desde > hasta)
        {
            throw new DatosInvalidosExcepcion(
                "desde",
                "La fecha inicial no puede ser posterior a la fecha final.");
        }

        return consultaDePrestamosPorArea.ObtenerAsync(filtro, cancellationToken);
    }
}
