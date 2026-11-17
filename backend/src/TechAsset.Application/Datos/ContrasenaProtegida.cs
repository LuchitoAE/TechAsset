namespace TechAsset.Application.Datos;

// Resultado de proteger una contraseña: solo se guardan la sal y el hash, nunca el texto plano (RNF-16).
public sealed record ContrasenaProtegida(string SalContrasena, string HashContrasena);
