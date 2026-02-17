# Configuración de Autenticación con Google en Supabase

He actualizado tu aplicación para soportar inicio de sesión con Google. Ahora necesitas configurar Google OAuth en Supabase.

## Pasos para Configurar Google OAuth

### 1. Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en **Create Credentials** > **OAuth client ID**
5. Si es la primera vez, configura la pantalla de consentimiento OAuth:
   - Selecciona **External** (o Internal si es para tu organización)
   - Completa la información requerida:
     - Nombre de la aplicación
     - Email de soporte
     - Logo (opcional)
     - Dominios autorizados
   - Guarda los cambios
6. Vuelve a **Credentials** y crea el **OAuth client ID**:
   - Tipo de aplicación: **Web application**
   - Nombre: "Bill Manager" (o el que prefieras)
   
### 2. Configurar URLs de Redirección

En tu proyecto de Supabase, necesitas la URL de callback. El formato es:

```
https://[TU-PROYECTO-ID].supabase.co/auth/v1/callback
```

Para encontrar tu URL de callback en Supabase:
1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Authentication** > **Providers**
3. Busca **Google** en la lista de proveedores
4. Verás la **Callback URL** que necesitas

**En Google Cloud Console**, agrega las siguientes URIs de redirección autorizadas:
- `https://[TU-PROYECTO-ID].supabase.co/auth/v1/callback`
- `http://localhost:3000/auth/confirm` (para desarrollo local)

### 3. Obtener Client ID y Client Secret

Después de crear el OAuth client ID en Google Cloud Console:
1. Copia el **Client ID**
2. Copia el **Client Secret**

### 4. Configurar Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Authentication** > **Providers**
3. Busca **Google** y haz clic para expandir
4. Activa el toggle **Enable Sign in with Google**
5. Pega el **Client ID** de Google
6. Pega el **Client Secret** de Google
7. (Opcional) Configura los scopes adicionales si necesitas más información del usuario:
   ```
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/userinfo.profile
   ```
8. Guarda los cambios

### 5. Configurar la Ruta de Confirmación (Ya configurada)

Ya he actualizado el código para redirigir a `/auth/confirm` después del login. Verifica que existe el archivo:
- `app/auth/confirm/route.ts`

Este archivo debe manejar el callback de OAuth y redirigir al usuario a la página correspondiente.

## Cambios Realizados en el Código

He agregado los siguientes cambios a tu aplicación:

### 1. **login-form.tsx**
- Agregado función `handleGoogleLogin()` que usa `signInWithOAuth` de Supabase
- Agregado botón "Sign in with Google" con el logo de Google
- Separador visual "Or continue with"

### 2. **sign-up-form.tsx**
- Agregado función `handleGoogleSignUp()` que usa `signInWithOAuth` de Supabase
- Agregado botón "Sign up with Google" con el logo de Google
- Separador visual "Or continue with"

## Flujo de Autenticación

1. El usuario hace clic en "Sign in with Google"
2. Es redirigido a la página de login de Google
3. Autoriza la aplicación
4. Google redirige al usuario a `/auth/confirm` en tu aplicación
5. El archivo `route.ts` en `/auth/confirm` procesa el token y redirige al dashboard

## Variables de Entorno

No necesitas agregar variables de entorno adicionales en tu aplicación. Las credenciales de Google se almacenan en Supabase y se manejan de forma segura en el backend.

## Testing en Desarrollo Local

Para probar en localhost:
1. Agrega `http://localhost:3000` a los **orígenes JavaScript autorizados** en Google Cloud Console
2. Agrega la URL de callback de Supabase como se mencionó arriba
3. Inicia tu servidor de desarrollo: `npm run dev`
4. Navega a `/auth/login` o `/auth/sign-up`
5. Haz clic en "Sign in with Google"

## Solución de Problemas

### Error: "redirect_uri_mismatch"
- Verifica que la URL de callback de Supabase esté correctamente agregada en Google Cloud Console
- Asegúrate de no tener espacios o caracteres extra en las URLs

### Error: "Access blocked: This app's request is invalid"
- Completa toda la información requerida en la pantalla de consentimiento OAuth
- Asegúrate de haber agregado los scopes correctos

### El botón de Google no aparece
- Revisa la consola del navegador en busca de errores
- Verifica que Supabase esté correctamente configurado

### Usuario no redirigido después del login
- Verifica que el archivo `/app/auth/confirm/route.ts` exista y funcione correctamente
- Revisa los logs de Supabase en el dashboard para ver si hay errores

## Recursos Adicionales

- [Documentación de Supabase sobre Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Dashboard](https://supabase.com/dashboard)

---

## Notas Importantes

- **Producción**: Cuando despliegues a producción, asegúrate de agregar la URL de producción a los orígenes autorizados en Google Cloud Console
- **Seguridad**: Nunca compartas tu Client Secret. Está almacenado de forma segura en Supabase
- **HTTPS**: Google requiere HTTPS para OAuth en producción. En desarrollo puedes usar HTTP
- **Email de usuario**: Cuando un usuario se registra con Google, Supabase automáticamente obtiene su email y nombre (si los permisos lo permiten)

