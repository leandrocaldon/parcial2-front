# Frontend - Quiz de Categorías

Este es el frontend de la aplicación Quiz de Categorías, desarrollado con Next.js.

## Características

- Interfaz de usuario intuitiva para realizar quiz por categorías
- Comunicación con el backend a través de API REST
- Manejo de estados con React Hooks
- Diseño responsive y amigable

## Requisitos

- Node.js 14.x o superior
- npm o yarn

## Instalación

1. Instala las dependencias:
   ```
   npm install
   ```

2. Crea un archivo `.env.local` basado en `.env.local.example`:
   ```
   cp .env.local.example .env.local
   ```

3. Edita el archivo `.env.local` para configurar la URL del backend:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

## Ejecución

Para ejecutar en modo desarrollo:
```
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Despliegue en Vercel

1. Sube el código a GitHub
2. Conecta tu repositorio a Vercel
3. Configura las variables de entorno en Vercel:
   - `NEXT_PUBLIC_API_URL`: URL de tu backend desplegado (por ejemplo: https://tu-backend.herokuapp.com/api)

## Estructura de archivos

- `pages/index.js`: Componente principal de la aplicación
- `next.config.js`: Configuración de Next.js
- `package.json`: Dependencias y scripts

## Solución de problemas

Si encuentras errores al comunicarte con el backend:
1. Verifica que la variable `NEXT_PUBLIC_API_URL` esté correctamente configurada
2. Asegúrate de que el backend esté ejecutándose
3. Revisa la consola del navegador para ver errores específicos
