namespace TechAsset.Domain.Enumeraciones;

// Catálogo de categorías del caso (D-08). Los valores viajan como texto en la API y en la base;
// la interfaz muestra la etiqueta con espacios («Computadora de escritorio»).
public enum CategoriaEquipo
{
    Laptop,
    ComputadoraDeEscritorio,
    Monitor,
    Impresora,
    Tablet,
    ProyectorMultimedia,
    EquipoDeRed
}
