using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Comandos;

// RF-09: aprobación de una solicitud por el Responsable de Tecnología o el Administrador (D-04).
public sealed record AprobarPrestamoComando(Guid IdPrestamo, RolUsuario RolSesion);
