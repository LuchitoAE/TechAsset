using TechAsset.Application.Datos;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Pruebas.Dobles;

// Crea usuarios válidos para las pruebas sin repetir el registro completo.
public static class FabricaDeUsuarios
{
    public const string ContrasenaDePrueba = "Clave1234";

    public static Usuario Crear(
        string correoUsuario,
        RolUsuario rol = RolUsuario.Colaborador,
        bool activo = true,
        string nombres = "Ana",
        string apellidos = "Pérez",
        string area = "Tecnología")
    {
        var protegida = new ProtectorDeContrasenasDePrueba().Proteger(ContrasenaDePrueba);

        var usuario = Usuario.Registrar(
            nombres,
            apellidos,
            CorreoElectronico.Crear(correoUsuario),
            area,
            rol,
            protegida.SalContrasena,
            protegida.HashContrasena);

        usuario.CambiarEstado(activo);
        return usuario;
    }
}
