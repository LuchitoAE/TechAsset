using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-17: historial de movimientos con filtros y paginación, del más reciente al más antiguo.
public sealed class ConsultarMovimientosCasoDeUso(IConsultaDeMovimientos consultaDeMovimientos)
{
    public Task<PaginaDeMovimientos> EjecutarAsync(
        FiltroDeMovimientos filtro,
        CancellationToken cancellationToken = default)
    {
        if (filtro.Desde is { } desde && filtro.Hasta is { } hasta && desde > hasta)
        {
            throw new DatosInvalidosExcepcion(
                "desde",
                "La fecha inicial no puede ser posterior a la fecha final.");
        }

        return consultaDeMovimientos.ListarAsync(filtro, cancellationToken);
    }
}
