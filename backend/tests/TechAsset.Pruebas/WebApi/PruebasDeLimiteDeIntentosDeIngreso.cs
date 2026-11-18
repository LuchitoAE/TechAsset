using TechAsset.Pruebas.Dobles;
using TechAsset.WebApi.Seguridad;

namespace TechAsset.Pruebas.WebApi;

// RNF-19: cinco fallos por minuto para el mismo correo y origen; el ingreso correcto limpia la
// cuenta y la ventana se renueva sola.
public class PruebasDeLimiteDeIntentosDeIngreso
{
    private const string Correo = "ana.perez@innovatech.pe";
    private const string Origen = "127.0.0.1";

    private readonly RelojAvanzable _reloj = new();
    private readonly LimiteDeIntentosDeIngreso _limite;

    public PruebasDeLimiteDeIntentosDeIngreso() => _limite = new(_reloj);

    [Fact]
    public void ConCuatroFallosTodaviaSePuedeIntentar()
    {
        for (var intento = 0; intento < 4; intento++)
        {
            _limite.RegistrarFallo(Correo, Origen);
        }

        Assert.False(_limite.EstaBloqueado(Correo, Origen));
    }

    [Fact]
    public void ConCincoFallosElSextoIntentoQuedaBloqueado()
    {
        for (var intento = 0; intento < LimiteDeIntentosDeIngreso.FallosPermitidos; intento++)
        {
            _limite.RegistrarFallo(Correo, Origen);
        }

        Assert.True(_limite.EstaBloqueado(Correo, Origen));
    }

    [Fact]
    public void ElCorreoNoDistingueMayusculasNiEspacios()
    {
        for (var intento = 0; intento < LimiteDeIntentosDeIngreso.FallosPermitidos; intento++)
        {
            _limite.RegistrarFallo("  ANA.PEREZ@innovatech.pe ", Origen);
        }

        Assert.True(_limite.EstaBloqueado(Correo, Origen));
    }

    [Fact]
    public void LaVentanaSeRenuevaAlPasarElMinuto()
    {
        for (var intento = 0; intento < LimiteDeIntentosDeIngreso.FallosPermitidos; intento++)
        {
            _limite.RegistrarFallo(Correo, Origen);
        }

        _reloj.Avanzar(LimiteDeIntentosDeIngreso.Ventana + TimeSpan.FromSeconds(1));

        Assert.False(_limite.EstaBloqueado(Correo, Origen));
    }

    [Fact]
    public void ElIngresoCorrectoLimpiaLosFallos()
    {
        for (var intento = 0; intento < LimiteDeIntentosDeIngreso.FallosPermitidos - 1; intento++)
        {
            _limite.RegistrarFallo(Correo, Origen);
        }

        _limite.RegistrarExito(Correo, Origen);

        Assert.False(_limite.EstaBloqueado(Correo, Origen));
    }

    [Fact]
    public void OtroOrigenNoHeredaElBloqueo()
    {
        for (var intento = 0; intento < LimiteDeIntentosDeIngreso.FallosPermitidos; intento++)
        {
            _limite.RegistrarFallo(Correo, Origen);
        }

        Assert.False(_limite.EstaBloqueado(Correo, "10.0.0.8"));
        Assert.False(_limite.EstaBloqueado("otra.persona@innovatech.pe", Origen));
    }
}
