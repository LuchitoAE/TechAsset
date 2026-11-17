using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Comandos;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.CasosDeUso;

// RN-11: ingreso con correo y contraseña, usuario inactivo y sesión vigente.
public class PruebasDeAcceso
{
    private readonly RepositorioDeUsuariosEnMemoria _repositorio = new();

    private IniciarSesionCasoDeUso IniciarSesion() =>
        new(_repositorio, new ProtectorDeContrasenasDePrueba());

    private ObtenerSesionCasoDeUso ObtenerSesion() => new(_repositorio);

    [Fact]
    public async Task IngresaConElCorreoYLaContrasenaCorrectos()
    {
        var usuario = FabricaDeUsuarios.Crear("ana.perez@innovatech.pe");
        _repositorio.Sembrar(usuario);

        var sesion = await IniciarSesion().EjecutarAsync(
            new IniciarSesionComando("ANA.PEREZ@innovatech.pe", FabricaDeUsuarios.ContrasenaDePrueba));

        Assert.Equal(usuario.IdUsuario, sesion.IdUsuario);
        Assert.Equal(RolUsuario.Colaborador, sesion.RolUsuario);
    }

    [Fact]
    public async Task NoIngresaConUnaContrasenaIncorrecta()
    {
        _repositorio.Sembrar(FabricaDeUsuarios.Crear("ana.perez@innovatech.pe"));

        await Assert.ThrowsAsync<CredencialesInvalidasExcepcion>(() =>
            IniciarSesion().EjecutarAsync(
                new IniciarSesionComando("ana.perez@innovatech.pe", "OtraClave123")));
    }

    [Fact]
    public async Task UnUsuarioDeshabilitadoNoIngresa()
    {
        _repositorio.Sembrar(FabricaDeUsuarios.Crear("ana.perez@innovatech.pe", activo: false));

        await Assert.ThrowsAsync<CredencialesInvalidasExcepcion>(() =>
            IniciarSesion().EjecutarAsync(
                new IniciarSesionComando("ana.perez@innovatech.pe", FabricaDeUsuarios.ContrasenaDePrueba)));
    }

    [Fact]
    public async Task UnCorreoInexistenteRecibeElMismoMensajeGeneral()
    {
        var excepcion = await Assert.ThrowsAsync<CredencialesInvalidasExcepcion>(() =>
            IniciarSesion().EjecutarAsync(
                new IniciarSesionComando("nadie@innovatech.pe", "Clave1234")));

        Assert.Equal("El correo o la contraseña no son correctos.", excepcion.Message);
    }

    [Fact]
    public async Task UnCorreoMalEscritoSeproduceComoErrorDeValidacion()
    {
        var excepcion = await Assert.ThrowsAsync<DatosInvalidosExcepcion>(() =>
            IniciarSesion().EjecutarAsync(new IniciarSesionComando("ana.perez", "Clave1234")));

        Assert.True(excepcion.Errores.ContainsKey("correo_usuario"));
    }

    [Fact]
    public async Task LaSesionDeUnUsuarioDeshabilitadoYaNoEsValida()
    {
        var usuario = FabricaDeUsuarios.Crear("ana.perez@innovatech.pe", activo: false);
        _repositorio.Sembrar(usuario);

        await Assert.ThrowsAsync<NoAutenticadoExcepcion>(() =>
            ObtenerSesion().EjecutarAsync(usuario.IdUsuario));
    }

    [Fact]
    public async Task LaSesionDeUnUsuarioActivoDevuelveSusDatos()
    {
        var usuario = FabricaDeUsuarios.Crear("ana.perez@innovatech.pe");
        _repositorio.Sembrar(usuario);

        var sesion = await ObtenerSesion().EjecutarAsync(usuario.IdUsuario);

        Assert.Equal("ana.perez@innovatech.pe", sesion.CorreoUsuario);
    }
}
