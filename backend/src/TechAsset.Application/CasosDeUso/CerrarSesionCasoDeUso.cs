namespace TechAsset.Application.CasosDeUso;

// Cierre de sesión (RN-11). La sesión vive en una cookie HttpOnly y no en el servidor, así que el
// caso de uso solo confirma el cierre; la capa web elimina la cookie con SignOutAsync.
public sealed class CerrarSesionCasoDeUso
{
    public string Ejecutar() => "Sesión cerrada.";
}
