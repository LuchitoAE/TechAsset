using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Comandos;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.CasosDeUso;

// RF-04, RN-09 y D-06: solo el Administrador deshabilita y nunca se queda sin Administrador activo.
public class PruebasDeEstadoDeUsuarios
{
    private readonly RepositorioDeUsuariosEnMemoria _repositorio = new();

    private CambiarEstadoUsuarioCasoDeUso CasoDeUso() => new(_repositorio);

    [Fact]
    public async Task UnColaboradorNoPuedeDeshabilitarUsuarios()
    {
        var afectado = FabricaDeUsuarios.Crear("afectado@innovatech.pe");
        _repositorio.Sembrar(afectado);

        await Assert.ThrowsAsync<AccesoDenegadoExcepcion>(() => CasoDeUso().EjecutarAsync(
            new CambiarEstadoUsuarioComando(
                afectado.IdUsuario,
                ActivoUsuario: false,
                IdUsuarioSesion: Guid.NewGuid(),
                RolSesion: RolUsuario.Colaborador)));

        Assert.True(afectado.ActivoUsuario);
    }

    [Fact]
    public async Task UnResponsableTampocoPuedeDeshabilitarUsuarios()
    {
        var afectado = FabricaDeUsuarios.Crear("afectado@innovatech.pe");
        _repositorio.Sembrar(afectado);

        await Assert.ThrowsAsync<AccesoDenegadoExcepcion>(() => CasoDeUso().EjecutarAsync(
            new CambiarEstadoUsuarioComando(
                afectado.IdUsuario,
                ActivoUsuario: false,
                IdUsuarioSesion: Guid.NewGuid(),
                RolSesion: RolUsuario.ResponsableDeTecnologia)));
    }

    [Fact]
    public async Task ElAdministradorNoPuedeDeshabilitarAlUltimoAdministradorActivo()
    {
        var unicoAdministrador = FabricaDeUsuarios.Crear(
            "admin@innovatech.pe",
            RolUsuario.Administrador);

        _repositorio.Sembrar(unicoAdministrador);

        var excepcion = await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new CambiarEstadoUsuarioComando(
                unicoAdministrador.IdUsuario,
                ActivoUsuario: false,
                IdUsuarioSesion: Guid.NewGuid(),
                RolSesion: RolUsuario.Administrador)));

        Assert.Contains("último Administrador", excepcion.Message);
        Assert.True(unicoAdministrador.ActivoUsuario);
    }

    [Fact]
    public async Task ElAdministradorNoPuedeDeshabilitarSuPropiaCuenta()
    {
        var administrador = FabricaDeUsuarios.Crear("admin@innovatech.pe", RolUsuario.Administrador);
        var segundoAdministrador = FabricaDeUsuarios.Crear("admin2@innovatech.pe", RolUsuario.Administrador);
        _repositorio.Sembrar(administrador, segundoAdministrador);

        var excepcion = await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new CambiarEstadoUsuarioComando(
                administrador.IdUsuario,
                ActivoUsuario: false,
                IdUsuarioSesion: administrador.IdUsuario,
                RolSesion: RolUsuario.Administrador)));

        Assert.Contains("propia cuenta", excepcion.Message);
        Assert.True(administrador.ActivoUsuario);
    }

    [Fact]
    public async Task ElUltimoAdministradorNoPuedeDeshabilitarSuCuentaNiConSuPropiaSesion()
    {
        var unicoAdministrador = FabricaDeUsuarios.Crear(
            "admin@innovatech.pe",
            RolUsuario.Administrador);

        _repositorio.Sembrar(unicoAdministrador);

        var excepcion = await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new CambiarEstadoUsuarioComando(
                unicoAdministrador.IdUsuario,
                ActivoUsuario: false,
                IdUsuarioSesion: unicoAdministrador.IdUsuario,
                RolSesion: RolUsuario.Administrador)));

        Assert.Contains("último Administrador activo", excepcion.Message);
        Assert.True(unicoAdministrador.ActivoUsuario);
    }

    [Fact]
    public async Task ElAdministradorDeshabilitaYVuelveAHabilitarAUnColaborador()
    {
        var colaborador = FabricaDeUsuarios.Crear("colaborador@innovatech.pe");
        var administrador = FabricaDeUsuarios.Crear("admin@innovatech.pe", RolUsuario.Administrador);
        _repositorio.Sembrar(colaborador, administrador);

        await CasoDeUso().EjecutarAsync(new CambiarEstadoUsuarioComando(
            colaborador.IdUsuario,
            ActivoUsuario: false,
            IdUsuarioSesion: administrador.IdUsuario,
            RolSesion: RolUsuario.Administrador));

        Assert.False(colaborador.ActivoUsuario);

        await CasoDeUso().EjecutarAsync(new CambiarEstadoUsuarioComando(
            colaborador.IdUsuario,
            ActivoUsuario: true,
            IdUsuarioSesion: administrador.IdUsuario,
            RolSesion: RolUsuario.Administrador));

        Assert.True(colaborador.ActivoUsuario);
    }

    [Fact]
    public async Task NoSePuedeQuitarElRolAlUltimoAdministradorActivo()
    {
        var unicoAdministrador = FabricaDeUsuarios.Crear(
            "admin@innovatech.pe",
            RolUsuario.Administrador);

        _repositorio.Sembrar(unicoAdministrador);

        var casoDeUso = new ActualizarUsuarioCasoDeUso(
            _repositorio,
            new ProtectorDeContrasenasDePrueba());

        await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() => casoDeUso.EjecutarAsync(
            new ActualizarUsuarioComando(
                unicoAdministrador.IdUsuario,
                unicoAdministrador.NombresUsuario,
                unicoAdministrador.ApellidosUsuario,
                unicoAdministrador.CorreoUsuario.Valor,
                unicoAdministrador.AreaUsuario,
                RolUsuario.Colaborador,
                ContrasenaNueva: null)));

        Assert.Equal(RolUsuario.Administrador, unicoAdministrador.RolUsuario);
    }
}
