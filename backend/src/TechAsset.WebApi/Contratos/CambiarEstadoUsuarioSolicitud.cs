namespace TechAsset.WebApi.Contratos;

/// <summary>Estado que se quiere dar al usuario en RF-04: true lo habilita y false lo deshabilita.</summary>
public sealed record CambiarEstadoUsuarioSolicitud(bool? ActivoUsuario);
