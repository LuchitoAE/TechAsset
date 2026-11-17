using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Comandos;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.CasosDeUso;

// La cuenta inicial del Administrador se crea una sola vez y desde la configuración segura.
public class PruebasDePrimerAdministrador
{
    private readonly RepositorioDeUsuariosEnMemoria _repositorio = new();

    private CrearPrimerAdministradorCasoDeUso CasoDeUso() =>
        new(_repositorio, new ProtectorDeContrasenasDePrueba());

    private static CrearPrimerAdministradorComando Comando(string contrasena = "ClaveSegura2026") =>
        new("Luis Walter", "Aquino Espinoza", "admin@innovatech.pe", "Gerencia de Tecnología", contrasena);

    [Fact]
    public async Task CreaElPrimerAdministradorCuandoNoHayNinguno()
    {
        var creado = await CasoDeUso().EjecutarAsync(Comando());

        Assert.True(creado);
        var administrador = Assert.Single(_repositorio.Usuarios);
        Assert.Equal(RolUsuario.Administrador, administrador.RolUsuario);
        Assert.True(administrador.ActivoUsuario);
    }

    [Fact]
    public async Task NoCreaOtroAdministradorSiYaExisteUnoActivo()
    {
        _repositorio.Sembrar(FabricaDeUsuarios.Crear("admin@innovatech.pe", RolUsuario.Administrador));

        var creado = await CasoDeUso().EjecutarAsync(Comando());

        Assert.False(creado);
        Assert.Single(_repositorio.Usuarios);
    }

    [Fact]
    public async Task RechazaUnaContrasenaInicialQueNoCumpleLaRegla()
    {
        await Assert.ThrowsAsync<DatosInvalidosExcepcion>(() =>
            CasoDeUso().EjecutarAsync(Comando("debil")));

        Assert.Empty(_repositorio.Usuarios);
    }
}
