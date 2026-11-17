using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Comandos;
using TechAsset.Domain.Excepciones;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.CasosDeUso;

// RF-01 y RN-08: registro de usuarios y correo único.
public class PruebasDeRegistroDeUsuarios
{
    private readonly RepositorioDeUsuariosEnMemoria _repositorio = new();

    private RegistrarUsuarioCasoDeUso CasoDeUso() =>
        new(_repositorio, new ProtectorDeContrasenasDePrueba());

    [Fact]
    public async Task RegistraUnUsuarioActivoConLaContrasenaProtegida()
    {
        var usuario = await CasoDeUso().EjecutarAsync(new RegistrarUsuarioComando(
            "Ana",
            "Pérez",
            "Ana.Perez@Innovatech.pe",
            "Tecnología",
            TechAsset.Domain.Enumeraciones.RolUsuario.Colaborador,
            "Clave1234"));

        Assert.True(usuario.ActivoUsuario);
        Assert.Equal("ana.perez@innovatech.pe", usuario.CorreoUsuario);
        Assert.Single(_repositorio.Usuarios);
        Assert.False(string.IsNullOrWhiteSpace(_repositorio.Usuarios[0].HashContrasenaUsuario));
    }

    [Fact]
    public async Task RechazaUnCorreoDuplicadoSinImportarLasMayusculas()
    {
        _repositorio.Sembrar(FabricaDeUsuarios.Crear("ana.perez@innovatech.pe"));

        var excepcion = await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new RegistrarUsuarioComando(
                "Otra",
                "Persona",
                "ANA.PEREZ@innovatech.pe",
                "Tecnología",
                TechAsset.Domain.Enumeraciones.RolUsuario.Colaborador,
                "Clave1234")));

        Assert.Contains("correo", excepcion.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Single(_repositorio.Usuarios);
    }

    [Theory]
    [InlineData("corta1", "una mayúscula")]
    [InlineData("SOLOMINUSCULAS1", "una minúscula")]
    [InlineData("SinNumeros", "un número")]
    public async Task RechazaUnaContrasenaQueNoCumpleLaRegla(string contrasena, string motivo)
    {
        var excepcion = await Assert.ThrowsAsync<DatosInvalidosExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new RegistrarUsuarioComando(
                "Ana",
                "Pérez",
                "ana.perez@innovatech.pe",
                "Tecnología",
                TechAsset.Domain.Enumeraciones.RolUsuario.Colaborador,
                contrasena)));

        Assert.True(excepcion.Errores.ContainsKey("contrasena"));
        Assert.Contains(motivo, string.Join(" ", excepcion.Errores["contrasena"]), StringComparison.OrdinalIgnoreCase);
        Assert.Empty(_repositorio.Usuarios);
    }

    [Fact]
    public async Task RechazaUnCorreoConFormatoInvalido()
    {
        var excepcion = await Assert.ThrowsAsync<DatosInvalidosExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new RegistrarUsuarioComando(
                "Ana",
                "Pérez",
                "ana.perez",
                "Tecnología",
                TechAsset.Domain.Enumeraciones.RolUsuario.Colaborador,
                "Clave1234")));

        Assert.True(excepcion.Errores.ContainsKey("correo_usuario"));
    }
}
