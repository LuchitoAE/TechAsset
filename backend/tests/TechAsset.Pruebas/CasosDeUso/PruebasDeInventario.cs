using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Datos;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.CasosDeUso;

// RF-07: filtros del inventario, conteo por estado y consulta del detalle.
public class PruebasDeInventario
{
    private readonly ConsultaDeEquiposDePrueba _consulta = new();

    [Fact]
    public async Task ElListadoEntregaElFiltroNormalizadoYLaPagina()
    {
        var filtro = FiltroDeEquipos.Normalizar(
            "  dell ",
            EstadoEquipo.Disponible,
            CategoriaEquipo.Laptop,
            "  Dell ",
            pagina: 2,
            tamano: 5);

        var pagina = await new ListarEquiposCasoDeUso(_consulta).EjecutarAsync(filtro);

        Assert.Same(filtro, _consulta.UltimoFiltro);
        Assert.Equal("dell", _consulta.UltimoFiltro!.Texto);
        Assert.Equal("Dell", _consulta.UltimoFiltro.Marca);
        Assert.Equal(EstadoEquipo.Disponible, _consulta.UltimoFiltro.Estado);
        Assert.Equal(CategoriaEquipo.Laptop, _consulta.UltimoFiltro.Categoria);
        Assert.Equal(1, pagina.Total);
        Assert.Equal(2, pagina.Pagina);
        Assert.Equal(5, pagina.Tamano);
        Assert.Single(pagina.Equipos);
        Assert.Single(pagina.ConteoPorEstado);
    }

    [Fact]
    public async Task LaConsultaDelDetalleDevuelveElEquipo()
    {
        var equipo = await new ObtenerEquipoCasoDeUso(_consulta)
            .EjecutarAsync(ConsultaDeEquiposDePrueba.IdEquipo);

        Assert.Equal("TK-2026-0001", equipo.CodigoPatrimonialEquipo);
        Assert.True(equipo.DisponibleEquipo);
    }

    [Fact]
    public async Task LaConsultaDelDetalleRespondeNoEncontrado()
    {
        await Assert.ThrowsAsync<RecursoNoEncontradoExcepcion>(() =>
            new ObtenerEquipoCasoDeUso(_consulta).EjecutarAsync(Guid.NewGuid()));
    }

    [Fact]
    public void NormalizaPaginaYTamanoFueraDeRango()
    {
        var filtro = FiltroDeEquipos.Normalizar(
            texto: "   ",
            estado: null,
            categoria: null,
            marca: "   ",
            pagina: 0,
            tamano: 500);

        Assert.Null(filtro.Texto);
        Assert.Null(filtro.Marca);
        Assert.Equal(1, filtro.Pagina);
        Assert.Equal(FiltroDeEquipos.TamanoPredeterminado, filtro.Tamano);
    }

    [Fact]
    public void LaDisponibilidadSeDerivaDelEstado()
    {
        var disponible = DatosDeEquipo.Desde(FabricaDeEquipos.Crear());
        var deBaja = DatosDeEquipo.Desde(FabricaDeEquipos.Crear(estado: EstadoEquipo.Baja));

        Assert.True(disponible.DisponibleEquipo);
        Assert.False(deBaja.DisponibleEquipo);
    }
}
