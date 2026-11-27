using System.Security.Cryptography;
using TechAsset.Infrastructure.Servicios;

namespace TechAsset.Pruebas.Servicios;

// D-14 y RNF-16: PBKDF2-HMACSHA256 con sal de 16 bytes y al menos 100 000 iteraciones.
public class PruebasDeProtectorPbkdf2
{
    private readonly ProtectorPbkdf2 _protector = new();

    [Fact]
    public void GuardaElAlgoritmoLasIteracionesYUnaSalDe16Bytes()
    {
        var protegida = _protector.Proteger("Clave1234");

        var partes = protegida.HashContrasena.Split('$');
        Assert.Equal(3, partes.Length);
        Assert.Equal("PBKDF2-HMACSHA256", partes[0]);
        Assert.True(int.Parse(partes[1]) >= 100_000);
        Assert.Equal(16, Convert.FromBase64String(protegida.SalContrasena).Length);
        Assert.Equal(32, Convert.FromBase64String(partes[2]).Length);
    }

    [Fact]
    public void NuncaGuardaLaContrasenaEnTextoPlano()
    {
        var protegida = _protector.Proteger("Clave1234");

        Assert.DoesNotContain("Clave1234", protegida.HashContrasena, StringComparison.Ordinal);
        Assert.DoesNotContain("Clave1234", protegida.SalContrasena, StringComparison.Ordinal);
    }

    [Fact]
    public void VerificaLaContrasenaCorrectaYRechazaLaIncorrecta()
    {
        var protegida = _protector.Proteger("Clave1234");

        Assert.True(_protector.Verificar(
            "Clave1234",
            protegida.SalContrasena,
            protegida.HashContrasena));

        Assert.False(_protector.Verificar(
            "Clave1235",
            protegida.SalContrasena,
            protegida.HashContrasena));
    }

    [Fact]
    public void UsaUnaSalDistintaEnCadaProteccion()
    {
        var primera = _protector.Proteger("Clave1234");
        var segunda = _protector.Proteger("Clave1234");

        Assert.NotEqual(primera.SalContrasena, segunda.SalContrasena);
        Assert.NotEqual(primera.HashContrasena, segunda.HashContrasena);
    }

    [Fact]
    public void RechazaUnHashManipulado()
    {
        var protegida = _protector.Proteger("Clave1234");
        var hashManipulado = $"PBKDF2-HMACSHA256$100000${Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))}";

        Assert.False(_protector.Verificar(
            "Clave1234",
            protegida.SalContrasena,
            hashManipulado));
    }

    [Fact]
    public void RechazaUnHashConIteracionesMenoresAlMinimo()
    {
        var protegida = _protector.Proteger("Clave1234");
        var partes = protegida.HashContrasena.Split('$');
        var hashDebil = $"PBKDF2-HMACSHA256$1000${partes[2]}";

        Assert.False(_protector.Verificar("Clave1234", protegida.SalContrasena, hashDebil));
    }
}
