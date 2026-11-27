namespace TechAsset.Domain.Excepciones;

// El correo no existe, la contraseña no coincide o el usuario está deshabilitado. Se usa un solo mensaje
// para no revelar cuál de los tres falló (RN-11); la API responde 401.
public sealed class CredencialesInvalidasExcepcion()
    : Exception("El correo o la contraseña no son correctos.");
