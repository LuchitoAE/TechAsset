using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.Dominio;

// RF-05, RF-06, RF-08 y RN-07: reglas del equipo en el dominio.
public class PruebasDeEquipos
{
    [Fact]
    public void NormalizaElCodigoPatrimonialConEspaciosYMayusculas()
    {
        var codigo = CodigoPatrimonial.Crear("  tk-2026-0001  ");

        Assert.Equal("TK-2026-0001", codigo.Valor);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void RechazaUnCodigoPatrimonialVacio(string? codigo)
    {
        var excepcion = Assert.Throws<DatosInvalidosExcepcion>(() => CodigoPatrimonial.Crear(codigo));

        Assert.True(excepcion.Errores.ContainsKey(CamposDeEquipo.CodigoPatrimonialEquipo));
    }

    [Fact]
    public void RechazaUnCodigoPatrimonialDeMasDeCincuentaCaracteres()
    {
        var excepcion = Assert.Throws<DatosInvalidosExcepcion>(() =>
            CodigoPatrimonial.Crear(new string('X', 51)));

        Assert.True(excepcion.Errores.ContainsKey(CamposDeEquipo.CodigoPatrimonialEquipo));
    }

    [Fact]
    public void RechazaUnaCategoriaFueraDelCatalogo()
    {
        var excepcion = Assert.Throws<DatosInvalidosExcepcion>(() => Equipo.Registrar(
            CodigoPatrimonial.Crear("TK-2026-0001"),
            "Laptop Dell",
            (CategoriaEquipo)99,
            "Dell"));

        Assert.True(excepcion.Errores.ContainsKey(CamposDeEquipo.CategoriaEquipo));
        Assert.Contains("categoría", excepcion.Errores[CamposDeEquipo.CategoriaEquipo][0]);
    }

    [Fact]
    public void NoPermiteRegistrarUnEquipoPrestado()
    {
        var excepcion = Assert.Throws<DatosInvalidosExcepcion>(() => Equipo.Registrar(
            CodigoPatrimonial.Crear("TK-2026-0001"),
            "Laptop Dell",
            CategoriaEquipo.Laptop,
            "Dell",
            EstadoEquipo.Prestado));

        Assert.True(excepcion.Errores.ContainsKey(CamposDeEquipo.EstadoEquipo));
    }

    [Fact]
    public void ValidaElNombreYLaMarca()
    {
        var excepcion = Assert.Throws<DatosInvalidosExcepcion>(() => Equipo.Registrar(
            CodigoPatrimonial.Crear("TK-2026-0001"),
            " XY ",
            CategoriaEquipo.Laptop,
            "D"));

        Assert.True(excepcion.Errores.ContainsKey(CamposDeEquipo.NombreEquipo));
        Assert.True(excepcion.Errores.ContainsKey(CamposDeEquipo.MarcaEquipo));
    }

    [Fact]
    public void NoPermiteCambiarElCodigoDeUnEquipoPrestado()
    {
        var equipo = FabricaDeEquipos.Crear(estado: EstadoEquipo.Prestado);

        var excepcion = Assert.Throws<ConflictoDeNegocioExcepcion>(() => equipo.Actualizar(
            CodigoPatrimonial.Crear("TK-2026-0099"),
            equipo.NombreEquipo,
            equipo.CategoriaEquipo,
            equipo.MarcaEquipo));

        Assert.Contains("código patrimonial", excepcion.Message);
        Assert.Equal("TK-2026-0001", equipo.CodigoPatrimonial.Valor);
    }

    [Theory]
    [InlineData(EstadoEquipo.Disponible)]
    [InlineData(EstadoEquipo.Mantenimiento)]
    [InlineData(EstadoEquipo.Baja)]
    public void NoPermiteMoverAManoUnEquipoPrestado(EstadoEquipo nuevoEstado)
    {
        var equipo = FabricaDeEquipos.Crear(estado: EstadoEquipo.Prestado);

        var excepcion = Assert.Throws<ConflictoDeNegocioExcepcion>(() => equipo.CambiarEstado(nuevoEstado));

        Assert.Contains("devolución", excepcion.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(EstadoEquipo.Prestado, equipo.EstadoEquipo);
    }

    [Fact]
    public void NoPermiteAsignarPrestadoConElCambioDeEstado()
    {
        var equipo = FabricaDeEquipos.Crear();

        var excepcion = Assert.Throws<ConflictoDeNegocioExcepcion>(() =>
            equipo.CambiarEstado(EstadoEquipo.Prestado));

        Assert.Contains("sistema", excepcion.Message);
        Assert.Equal(EstadoEquipo.Disponible, equipo.EstadoEquipo);
    }

    [Theory]
    [InlineData(EstadoEquipo.Mantenimiento)]
    [InlineData(EstadoEquipo.Baja)]
    public void NoSePrestaUnEquipoEnMantenimientoNiEnBaja(EstadoEquipo estado)
    {
        var equipo = FabricaDeEquipos.Crear(estado: estado);

        var excepcion = Assert.Throws<ConflictoDeNegocioExcepcion>(() => equipo.MarcarComoPrestado());

        Assert.Contains(estado.ToString(), excepcion.Message);
        Assert.Equal(estado, equipo.EstadoEquipo);
    }

    [Fact]
    public void SePrestaUnEquipoDisponible()
    {
        var equipo = FabricaDeEquipos.Crear();

        equipo.MarcarComoPrestado();

        Assert.Equal(EstadoEquipo.Prestado, equipo.EstadoEquipo);
    }

    [Fact]
    public void LaDevolucionSoloDevuelveUnEquipoPrestado()
    {
        var equipo = FabricaDeEquipos.Crear(estado: EstadoEquipo.Prestado);

        equipo.MarcarComoDisponible();

        Assert.Equal(EstadoEquipo.Disponible, equipo.EstadoEquipo);
        Assert.Throws<ConflictoDeNegocioExcepcion>(() => equipo.MarcarComoDisponible());
    }

    [Fact]
    public void PermiteCambiarEntreDisponibleMantenimientoYBaja()
    {
        var equipo = FabricaDeEquipos.Crear();

        equipo.CambiarEstado(EstadoEquipo.Mantenimiento);
        Assert.Equal(EstadoEquipo.Mantenimiento, equipo.EstadoEquipo);

        equipo.CambiarEstado(EstadoEquipo.Baja);
        Assert.Equal(EstadoEquipo.Baja, equipo.EstadoEquipo);

        equipo.CambiarEstado(EstadoEquipo.Disponible);
        Assert.Equal(EstadoEquipo.Disponible, equipo.EstadoEquipo);
    }
}
