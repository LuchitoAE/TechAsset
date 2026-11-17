using TechAsset.Domain.Comun;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Domain.Entidades;

// Usuario de TechAsset: persona que ingresa con su correo y contraseña y recibe uno de los tres roles.
// El correo es único (RN-08), los usuarios se deshabilitan en lugar de borrarse (D-06) y la contraseña
// solo se guarda como sal y hash (RN-11, RNF-16).
public sealed class Usuario
{
    public const int LongitudMinimaNombre = 2;
    public const int LongitudMaximaNombre = 100;
    public const int LongitudMinimaArea = 2;
    public const int LongitudMaximaArea = 100;

    private Usuario()
    {
        NombresUsuario = string.Empty;
        ApellidosUsuario = string.Empty;
        CorreoUsuario = null!;
        AreaUsuario = string.Empty;
        SalContrasenaUsuario = string.Empty;
        HashContrasenaUsuario = string.Empty;
    }

    private Usuario(
        Guid idUsuario,
        string nombresUsuario,
        string apellidosUsuario,
        CorreoElectronico correoUsuario,
        string areaUsuario,
        RolUsuario rolUsuario,
        string salContrasenaUsuario,
        string hashContrasenaUsuario)
    {
        IdUsuario = idUsuario;
        NombresUsuario = nombresUsuario;
        ApellidosUsuario = apellidosUsuario;
        CorreoUsuario = correoUsuario;
        AreaUsuario = areaUsuario;
        RolUsuario = rolUsuario;
        ActivoUsuario = true;
        SalContrasenaUsuario = salContrasenaUsuario;
        HashContrasenaUsuario = hashContrasenaUsuario;
    }

    public Guid IdUsuario { get; private set; }

    public string NombresUsuario { get; private set; }

    public string ApellidosUsuario { get; private set; }

    public CorreoElectronico CorreoUsuario { get; private set; }

    public string AreaUsuario { get; private set; }

    public RolUsuario RolUsuario { get; private set; }

    public bool ActivoUsuario { get; private set; }

    public string SalContrasenaUsuario { get; private set; }

    public string HashContrasenaUsuario { get; private set; }

    public string NombreCompleto => $"{NombresUsuario} {ApellidosUsuario}".Trim();

    public bool EsAdministradorActivo =>
        ActivoUsuario && RolUsuario == Enumeraciones.RolUsuario.Administrador;

    // Todo usuario nuevo nace activo y con la contraseña ya protegida (RF-01).
    public static Usuario Registrar(
        string? nombresUsuario,
        string? apellidosUsuario,
        CorreoElectronico correoUsuario,
        string? areaUsuario,
        RolUsuario rolUsuario,
        string salContrasenaUsuario,
        string hashContrasenaUsuario)
    {
        var errores = new Dictionary<string, string[]>();

        ValidarTexto(
            errores, CamposDeUsuario.NombresUsuario, nombresUsuario,
            "Los nombres son obligatorios.",
            $"Los nombres deben tener entre {LongitudMinimaNombre} y {LongitudMaximaNombre} caracteres.");
        ValidarTexto(
            errores, CamposDeUsuario.ApellidosUsuario, apellidosUsuario,
            "Los apellidos son obligatorios.",
            $"Los apellidos deben tener entre {LongitudMinimaNombre} y {LongitudMaximaNombre} caracteres.");
        ValidarTexto(
            errores, CamposDeUsuario.AreaUsuario, areaUsuario,
            "El área es obligatoria.",
            $"El área debe tener entre {LongitudMinimaArea} y {LongitudMaximaArea} caracteres.");
        ValidarRol(errores, rolUsuario);
        ValidarProteccion(errores, salContrasenaUsuario, hashContrasenaUsuario);

        if (errores.Count > 0)
        {
            throw new DatosInvalidosExcepcion(errores);
        }

        return new Usuario(
            Guid.NewGuid(),
            nombresUsuario!.Trim(),
            apellidosUsuario!.Trim(),
            correoUsuario,
            areaUsuario!.Trim(),
            rolUsuario,
            salContrasenaUsuario,
            hashContrasenaUsuario);
    }

    // RF-02: corregir nombres, apellidos, correo, área y rol; la contraseña solo cambia si se repone.
    public void Actualizar(
        string? nombresUsuario,
        string? apellidosUsuario,
        CorreoElectronico correoUsuario,
        string? areaUsuario,
        RolUsuario rolUsuario,
        string? salContrasenaUsuario,
        string? hashContrasenaUsuario)
    {
        var errores = new Dictionary<string, string[]>();

        ValidarTexto(
            errores, CamposDeUsuario.NombresUsuario, nombresUsuario,
            "Los nombres son obligatorios.",
            $"Los nombres deben tener entre {LongitudMinimaNombre} y {LongitudMaximaNombre} caracteres.");
        ValidarTexto(
            errores, CamposDeUsuario.ApellidosUsuario, apellidosUsuario,
            "Los apellidos son obligatorios.",
            $"Los apellidos deben tener entre {LongitudMinimaNombre} y {LongitudMaximaNombre} caracteres.");
        ValidarTexto(
            errores, CamposDeUsuario.AreaUsuario, areaUsuario,
            "El área es obligatoria.",
            $"El área debe tener entre {LongitudMinimaArea} y {LongitudMaximaArea} caracteres.");
        ValidarRol(errores, rolUsuario);

        var reponeContrasena = !string.IsNullOrWhiteSpace(salContrasenaUsuario)
            || !string.IsNullOrWhiteSpace(hashContrasenaUsuario);
        if (reponeContrasena)
        {
            ValidarProteccion(errores, salContrasenaUsuario, hashContrasenaUsuario);
        }

        if (errores.Count > 0)
        {
            throw new DatosInvalidosExcepcion(errores);
        }

        NombresUsuario = nombresUsuario!.Trim();
        ApellidosUsuario = apellidosUsuario!.Trim();
        CorreoUsuario = correoUsuario;
        AreaUsuario = areaUsuario!.Trim();
        RolUsuario = rolUsuario;

        if (reponeContrasena)
        {
            SalContrasenaUsuario = salContrasenaUsuario!;
            HashContrasenaUsuario = hashContrasenaUsuario!;
        }
    }

    // D-06: no se borra; se deshabilita y se puede volver a habilitar.
    public void CambiarEstado(bool activoUsuario)
    {
        ActivoUsuario = activoUsuario;
    }

    public bool PuedeIngresar => ActivoUsuario;

    private static void ValidarTexto(
        IDictionary<string, string[]> errores,
        string campo,
        string? valor,
        string mensajeObligatorio,
        string mensajeLongitud)
    {
        var texto = (valor ?? string.Empty).Trim();

        if (texto.Length == 0)
        {
            errores[campo] = [mensajeObligatorio];
            return;
        }

        if (texto.Length < LongitudMinimaNombre || texto.Length > LongitudMaximaNombre)
        {
            errores[campo] = [mensajeLongitud];
        }
    }

    private static void ValidarRol(IDictionary<string, string[]> errores, RolUsuario rolUsuario)
    {
        if (!Enum.IsDefined(rolUsuario))
        {
            errores[CamposDeUsuario.RolUsuario] = ["El rol debe ser Administrador, ResponsableDeTecnologia o Colaborador."];
        }
    }

    private static void ValidarProteccion(
        IDictionary<string, string[]> errores,
        string? salContrasenaUsuario,
        string? hashContrasenaUsuario)
    {
        if (string.IsNullOrWhiteSpace(salContrasenaUsuario) || string.IsNullOrWhiteSpace(hashContrasenaUsuario))
        {
            errores[CamposDeUsuario.Contrasena] = ["La contraseña es obligatoria."];
        }
    }
}
