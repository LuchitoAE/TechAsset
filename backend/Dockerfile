# API de TechAsset en un contenedor (Render). Compila con el SDK de .NET 10 y publica en la imagen de ejecución.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS compilar
WORKDIR /origen
COPY src/TechAsset.Domain/TechAsset.Domain.csproj src/TechAsset.Domain/
COPY src/TechAsset.Application/TechAsset.Application.csproj src/TechAsset.Application/
COPY src/TechAsset.Infrastructure/TechAsset.Infrastructure.csproj src/TechAsset.Infrastructure/
COPY src/TechAsset.WebApi/TechAsset.WebApi.csproj src/TechAsset.WebApi/
RUN dotnet restore src/TechAsset.WebApi/TechAsset.WebApi.csproj
COPY . .
RUN dotnet publish src/TechAsset.WebApi/TechAsset.WebApi.csproj -c Release -o /aplicacion --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS ejecutar
WORKDIR /aplicacion
COPY --from=compilar /aplicacion .
# Render entrega el puerto en PORT; en local se usa 8080.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} exec dotnet TechAsset.WebApi.dll"]
