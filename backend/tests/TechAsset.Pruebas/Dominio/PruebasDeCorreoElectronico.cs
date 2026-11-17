using TechAsset.Domain.Comun;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Pruebas.Dominio;

// El correo se normaliza a minúsculas y se rechaza si no tiene forma de correo (RN-08).
public class PruebasDeCorreoElectronico
{
    [Fact]
    public void NormalizaElCorreoAminusculasYSinEspacios()
    {
        var correo = CorreoElectronico.Crear("  Ana.Perez@Innovatech.pe  ");

        Assert.Equal("ana.perez@innovatech.pe", correo.Valor);
    }

    [Theory]
    [InlineData("", "obligatorio")]
    [InlineData("ana.perez", "válido")]
    [InlineData("ana@innovatech", "válido")]
    [InlineData("ana perez@innovatech.pe", "válido")]
    public void RechazaUnCorreoInvalido(string correo, string motivo)
    {
        var excepcion = Assert.Throws<DatosInvalidosExcepcion>(() =>
            CorreoElectronico.Crear(correo));

        Assert.True(excepcion.Errores.ContainsKey("correo_usuario"));
        Assert.Contains(motivo, excepcion.Errores["correo_usuario"][0], StringComparison.OrdinalIgnoreCase);
    }
}
