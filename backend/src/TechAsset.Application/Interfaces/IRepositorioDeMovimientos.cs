using TechAsset.Domain.Entidades;

namespace TechAsset.Application.Interfaces;

// Contrato de escritura del historial (RF-17, D-03). El movimiento se agrega al mismo contexto y se
// confirma con el GuardarCambios de la operación, dentro de su transacción.
public interface IRepositorioDeMovimientos
{
    Task AgregarAsync(Movimiento movimiento, CancellationToken cancellationToken = default);
}
