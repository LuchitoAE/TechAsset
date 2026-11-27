using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Pruebas.Dobles;

// Crea equipos válidos para las pruebas sin repetir el registro completo. Para simular un equipo
// prestado usa la vía del sistema (MarcarComoPrestado), no RF-08.
public static class FabricaDeEquipos
{
    public static Equipo Crear(
        string codigoPatrimonial = "TK-2026-0001",
        string nombre = "Laptop Dell Latitude 5440",
        CategoriaEquipo categoria = CategoriaEquipo.Laptop,
        string marca = "Dell",
        EstadoEquipo estado = EstadoEquipo.Disponible)
    {
        var equipo = Equipo.Registrar(
            CodigoPatrimonial.Crear(codigoPatrimonial),
            nombre,
            categoria,
            marca,
            EstadoEquipo.Disponible);

        if (estado == EstadoEquipo.Prestado)
        {
            equipo.MarcarComoPrestado();
        }
        else if (estado != EstadoEquipo.Disponible)
        {
            equipo.CambiarEstado(estado);
        }

        return equipo;
    }
}
