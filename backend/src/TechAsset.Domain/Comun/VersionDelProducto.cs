namespace TechAsset.Domain.Comun;

// Versión del producto que se muestra en /api/salud y en el pie de la SPA; se sube al cerrar cada
// versión entregada. La SPA repite el valor en src/reglas/version.js: cambie los dos juntos.
public static class VersionDelProducto
{
    public const string Valor = "1.0.0";
}
