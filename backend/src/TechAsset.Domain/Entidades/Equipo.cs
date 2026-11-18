using TechAsset.Domain.Comun;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Domain.Entidades;

// Equipo del inventario de Innovatech. El código patrimonial es único (RN-07), el estado Prestado
// solo lo asigna el sistema con un préstamo activo (RN-01) y no se puede prestar un equipo en
// Mantenimiento ni en Baja (RN-02, RN-03, D-05).
public sealed class Equipo
{
    public const int LongitudMinimaNombre = 3;
    public const int LongitudMaximaNombre = 100;
    public const int LongitudMinimaMarca = 2;
    public const int LongitudMaximaMarca = 50;

    private Equipo()
    {
        CodigoPatrimonial = null!;
        NombreEquipo = string.Empty;
        MarcaEquipo = string.Empty;
    }

    private Equipo(
        Guid idEquipo,
        CodigoPatrimonial codigoPatrimonial,
        string nombreEquipo,
        CategoriaEquipo categoriaEquipo,
        string marcaEquipo,
        EstadoEquipo estadoEquipo)
    {
        IdEquipo = idEquipo;
        CodigoPatrimonial = codigoPatrimonial;
        NombreEquipo = nombreEquipo;
        CategoriaEquipo = categoriaEquipo;
        MarcaEquipo = marcaEquipo;
        EstadoEquipo = estadoEquipo;
    }

    public Guid IdEquipo { get; private set; }

    public CodigoPatrimonial CodigoPatrimonial { get; private set; }

    public string NombreEquipo { get; private set; }

    public CategoriaEquipo CategoriaEquipo { get; private set; }

    public string MarcaEquipo { get; private set; }

    public EstadoEquipo EstadoEquipo { get; private set; }

    public bool EstaDisponible => EstadoEquipo == EstadoEquipo.Disponible;

    public bool EstaPrestado => EstadoEquipo == EstadoEquipo.Prestado;

    // RN-02 y RN-03: solo un equipo disponible se puede prestar.
    public bool AdmitePrestamo => EstaDisponible;

    // RF-05: todo equipo nace con sus datos validados. El estado inicial es Disponible, salvo que
    // se registre en Mantenimiento o Baja; nunca Prestado, porque lo asigna el préstamo.
    public static Equipo Registrar(
        CodigoPatrimonial codigoPatrimonial,
        string? nombreEquipo,
        CategoriaEquipo categoriaEquipo,
        string? marcaEquipo,
        EstadoEquipo estadoInicial = EstadoEquipo.Disponible)
    {
        var errores = new Dictionary<string, string[]>();

        ValidarTexto(
            errores, CamposDeEquipo.NombreEquipo, nombreEquipo,
            "El nombre del equipo es obligatorio.",
            $"El nombre del equipo debe tener entre {LongitudMinimaNombre} y {LongitudMaximaNombre} caracteres.",
            LongitudMinimaNombre, LongitudMaximaNombre);
        ValidarTexto(
            errores, CamposDeEquipo.MarcaEquipo, marcaEquipo,
            "La marca es obligatoria.",
            $"La marca debe tener entre {LongitudMinimaMarca} y {LongitudMaximaMarca} caracteres.",
            LongitudMinimaMarca, LongitudMaximaMarca);
        ValidarCategoria(errores, categoriaEquipo);
        ValidarEstadoInicial(errores, estadoInicial);

        if (errores.Count > 0)
        {
            throw new DatosInvalidosExcepcion(errores);
        }

        return new Equipo(
            Guid.NewGuid(),
            codigoPatrimonial,
            nombreEquipo!.Trim(),
            categoriaEquipo,
            marcaEquipo!.Trim(),
            estadoInicial);
    }

    // RF-06: corrige el código, el nombre, la categoría y la marca. El estado no se toca aquí; se
    // cambia con RF-08. El código no se puede mover mientras el equipo tenga un préstamo activo, y
    // eso lo comprueba el caso de uso contra los préstamos, no solo el estado_equipo (iteración 4).
    public void Actualizar(
        CodigoPatrimonial codigoPatrimonial,
        string? nombreEquipo,
        CategoriaEquipo categoriaEquipo,
        string? marcaEquipo,
        bool tienePrestamoActivo = false)
    {
        var errores = new Dictionary<string, string[]>();

        ValidarTexto(
            errores, CamposDeEquipo.NombreEquipo, nombreEquipo,
            "El nombre del equipo es obligatorio.",
            $"El nombre del equipo debe tener entre {LongitudMinimaNombre} y {LongitudMaximaNombre} caracteres.",
            LongitudMinimaNombre, LongitudMaximaNombre);
        ValidarTexto(
            errores, CamposDeEquipo.MarcaEquipo, marcaEquipo,
            "La marca es obligatoria.",
            $"La marca debe tener entre {LongitudMinimaMarca} y {LongitudMaximaMarca} caracteres.",
            LongitudMinimaMarca, LongitudMaximaMarca);
        ValidarCategoria(errores, categoriaEquipo);

        if (errores.Count > 0)
        {
            throw new DatosInvalidosExcepcion(errores);
        }

        if ((EstaPrestado || tienePrestamoActivo) && codigoPatrimonial.Valor != CodigoPatrimonial.Valor)
        {
            throw new ConflictoDeNegocioExcepcion(
                "No se puede cambiar el código patrimonial de un equipo con un préstamo activo. Registre primero la devolución.");
        }

        CodigoPatrimonial = codigoPatrimonial;
        NombreEquipo = nombreEquipo!.Trim();
        CategoriaEquipo = categoriaEquipo;
        MarcaEquipo = marcaEquipo!.Trim();
    }

    // RF-08: cambia entre Disponible, Mantenimiento y Baja. Un equipo con préstamo activo no se mueve
    // a mano: primero vuelve con la devolución (D-05). El caso de uso comprueba el préstamo real y no
    // solo el estado_equipo. Prestado nunca se asigna por esta vía.
    public void CambiarEstado(EstadoEquipo nuevoEstado, bool tienePrestamoActivo = false)
    {
        if (!Enum.IsDefined(nuevoEstado))
        {
            throw new DatosInvalidosExcepcion(
                CamposDeEquipo.EstadoEquipo,
                "El estado debe ser Disponible, Prestado, Mantenimiento o Baja.");
        }

        if (nuevoEstado == EstadoEquipo.Prestado)
        {
            throw new ConflictoDeNegocioExcepcion(
                "El estado Prestado lo asigna el sistema al registrar un préstamo.");
        }

        if (EstaPrestado || tienePrestamoActivo)
        {
            throw new ConflictoDeNegocioExcepcion(
                "El equipo tiene un préstamo activo. Registre primero la devolución para cambiar su estado.");
        }

        EstadoEquipo = nuevoEstado;
    }

    // Iteración 4: el caso de uso del préstamo ocupa un equipo disponible (RN-02, RN-03). No se
    // expone por RF-08 para que el estado Prestado no se pueda asignar a mano.
    public void ValidarPrestable()
    {
        if (!AdmitePrestamo)
        {
            throw new ConflictoDeNegocioExcepcion(
                $"No se puede prestar el equipo: está en estado {EstadoEquipo}. Solo se presta un equipo disponible.");
        }
    }

    public void MarcarComoPrestado()
    {
        ValidarPrestable();
        EstadoEquipo = EstadoEquipo.Prestado;
    }

    // Iteración 4: la devolución devuelve el equipo a Disponible.
    public void MarcarComoDisponible()
    {
        if (!EstaPrestado)
        {
            throw new ConflictoDeNegocioExcepcion("Solo un equipo prestado puede volver con una devolución.");
        }

        EstadoEquipo = EstadoEquipo.Disponible;
    }

    // RN-06: no se elimina un equipo con historial de préstamos. TechAsset no ofrece dar de baja un
    // equipo del inventario; la regla queda en el dominio y en las claves foráneas de la base.
    public void ValidarEliminacion(bool tieneHistorialDePrestamos)
    {
        if (tieneHistorialDePrestamos)
        {
            throw new ConflictoDeNegocioExcepcion(
                "No se puede eliminar un equipo con historial de préstamos. Consérvelo y, si ya no se usa, cámbiele el estado a Baja.");
        }
    }

    private static void ValidarTexto(
        IDictionary<string, string[]> errores,
        string campo,
        string? valor,
        string mensajeObligatorio,
        string mensajeLongitud,
        int longitudMinima,
        int longitudMaxima)
    {
        var texto = (valor ?? string.Empty).Trim();

        if (texto.Length == 0)
        {
            errores[campo] = [mensajeObligatorio];
            return;
        }

        if (texto.Length < longitudMinima || texto.Length > longitudMaxima)
        {
            errores[campo] = [mensajeLongitud];
        }
    }

    private static void ValidarCategoria(
        IDictionary<string, string[]> errores,
        CategoriaEquipo categoriaEquipo)
    {
        if (!Enum.IsDefined(categoriaEquipo))
        {
            errores[CamposDeEquipo.CategoriaEquipo] =
            [
                "La categoría debe ser Laptop, Computadora de escritorio, Monitor, Impresora, Tablet, " +
                "Proyector multimedia o Equipo de red."
            ];
        }
    }

    private static void ValidarEstadoInicial(
        IDictionary<string, string[]> errores,
        EstadoEquipo estadoInicial)
    {
        if (!Enum.IsDefined(estadoInicial))
        {
            errores[CamposDeEquipo.EstadoEquipo] =
                ["El estado inicial debe ser Disponible, Mantenimiento o Baja."];
            return;
        }

        if (estadoInicial == EstadoEquipo.Prestado)
        {
            errores[CamposDeEquipo.EstadoEquipo] =
                ["El estado inicial no puede ser Prestado; lo asigna el sistema con el préstamo."];
        }
    }
}
