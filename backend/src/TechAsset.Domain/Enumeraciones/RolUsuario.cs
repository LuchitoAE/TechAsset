namespace TechAsset.Domain.Enumeraciones;

// Roles del sistema (RN-11). El Administrador gestiona usuarios; el Responsable aprueba préstamos;
// el Colaborador solicita equipos. Los valores viajan como texto en la API y en la base.
public enum RolUsuario
{
    Administrador,
    ResponsableDeTecnologia,
    Colaborador
}
