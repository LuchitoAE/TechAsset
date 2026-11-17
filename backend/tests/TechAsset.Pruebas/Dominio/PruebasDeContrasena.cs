using TechAsset.Domain.Comun;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Pruebas.Dominio;

// Reglas de la contraseña (RN-11): longitud y composición.
public class PruebasDeContrasena
{
    [Theory]
    [InlineData("Clave1234")]
    [InlineData("ClaveSegura2026")]
    [InlineData("Abcdefg1")]
    public void AceptaUnaContrasenaQueCumpleLaRegla(string contrasena)
    {
        Assert.Empty(Contrasena.Validar(contrasena));
    }

    [Theory]
    [InlineData("", "obligatoria")]
    [InlineData("Ab1", "entre 8 y 64")]
    [InlineData("clave1234", "mayúscula")]
    [InlineData("CLAVE1234", "minúscula")]
    [InlineData("ClaveSinNumero", "número")]
    [InlineData("Clave1234" + "Clave1234" + "Clave1234" + "Clave1234" + "Clave1234" + "Clave1234" + "Clave1234" + "Clave1234", "entre 8 y 64")]
    public void RechazaUnaContrasenaQueNoCumpleLaRegla(string contrasena, string motivo)
    {
        var errores = Contrasena.Validar(contrasena);

        Assert.True(errores.ContainsKey("contrasena"));
        Assert.Contains(motivo, string.Join(" ", errores["contrasena"]), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void ExigirValidaLanzaElErrorPorCampo()
    {
        var excepcion = Assert.Throws<DatosInvalidosExcepcion>(() => Contrasena.ExigirValida("debil"));

        Assert.True(excepcion.Errores.ContainsKey("contrasena"));
    }
}
