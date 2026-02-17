# Guía de Despliegue en Vercel con Autenticación OAuth

Esta guía te ayudará a configurar correctamente tu aplicación en Vercel para que la autenticación con Google funcione correctamente en producción.

## El Problema

Cuando despliegas en Vercel y usas Google OAuth, puede que veas que redirige a `http://localhost:3000/?code=...` en lugar de tu URL de producción. Esto sucede porque:

1. Las URLs de redirección no están configuradas correctamente
2. Supabase no conoce tu URL de producción
3. Google Cloud Console no tiene autorizada tu URL de Vercel

## Solución: Configuración Completa

### 1. Obtener tu URL de Vercel

Primero necesitas tu URL de Vercel. Después de desplegar, tendrás algo como:
```
https://tu-app.vercel.app
```

O si tienes un dominio personalizado:
```
https://tudominio.com
```

### 2. Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** → **Environment Variables**
3. Agrega las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ngoyzrqiiwqenznrgyzj.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_azp-XznpHBOfe4NfI2m-qg_49QPW-G7
NEXT_PUBLIC_SITE_URL=https://tu-app.vercel.app
NEXT_PUBLIC_WEB3FORMS_KEY=8ec0fe2f-8f3b-4c9d-939d-ca7cd56bfe00
```

**IMPORTANTE**: 
- Reemplaza `https://tu-app.vercel.app` con tu URL real de Vercel
- Asegúrate de usar **HTTPS** (no HTTP) en producción
- Configura estas variables para **Production**, **Preview** y **Development**

4. Después de agregar las variables, **Redeploy** tu aplicación:
   - Ve a **Deployments**
   - Haz clic en los tres puntos (...) del último deployment
   - Selecciona **Redeploy**

### 3. Configurar Supabase

#### 3.1 Configurar Site URL
1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Settings** → **API**
3. Busca la sección **"Site URL"**
4. Cámbiala a tu URL de Vercel:
   ```
   https://tu-app.vercel.app
   ```
5. Guarda los cambios

#### 3.2 Configurar Redirect URLs
1. En el mismo dashboard de Supabase
2. Ve a **Authentication** → **URL Configuration**
3. En **"Redirect URLs"**, agrega las siguientes URLs (una por línea):
   ```
   http://localhost:3000/auth/confirm
   https://tu-app.vercel.app/auth/confirm
   ```
4. Si tienes preview deployments, también agrega:
   ```
   https://*.vercel.app/auth/confirm
   ```
5. Guarda los cambios

### 4. Configurar Google Cloud Console

#### 4.1 Agregar URL de Vercel a Authorized JavaScript Origins
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Haz clic en tu **OAuth 2.0 Client ID**
5. En **"Authorized JavaScript origins"**, agrega:
   ```
   http://localhost:3000
   https://tu-app.vercel.app
   ```

#### 4.2 Verificar Authorized Redirect URIs
En la misma pantalla, verifica que **"Authorized redirect URIs"** tenga:
```
https://ngoyzrqiiwqenznrgyzj.supabase.co/auth/v1/callback
```

**IMPORTANTE**: Esta es la URL de Supabase, NO tu URL de Vercel.

6. Haz clic en **Save**

### 5. Configurar tu Archivo .env.local (Desarrollo)

Para desarrollo local, tu archivo `.env.local` debe tener:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ngoyzrqiiwqenznrgyzj.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_azp-XznpHBOfe4NfI2m-qg_49QPW-G7
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WEB3FORMS_KEY=8ec0fe2f-8f3b-4c9d-939d-ca7cd56bfe00
```

### 6. Verificar la Configuración

Después de configurar todo:

1. **Espera 2-3 minutos** para que los cambios de Google se propaguen
2. **Redeploy** tu aplicación en Vercel
3. Abre tu aplicación en Vercel: `https://tu-app.vercel.app`
4. Intenta iniciar sesión con Google

**Flujo esperado:**
1. Haces clic en "Sign in with Google"
2. Te redirige a Google para autorizar
3. Después de autorizar, Google redirige a Supabase
4. Supabase procesa la autenticación y redirige a `https://tu-app.vercel.app/auth/confirm`
5. Tu aplicación procesa el código y te redirige al dashboard

## Checklist de Verificación

Antes de intentar iniciar sesión, verifica que:

- [ ] `NEXT_PUBLIC_SITE_URL` está configurado en Vercel con tu URL de producción
- [ ] Site URL en Supabase apunta a tu URL de Vercel
- [ ] Redirect URLs en Supabase incluyen tu URL de Vercel
- [ ] Google Cloud Console tiene tu URL de Vercel en Authorized JavaScript origins
- [ ] Google Cloud Console tiene la URL de Supabase en Authorized redirect URIs
- [ ] Esperaste 2-3 minutos después de cambiar la configuración de Google
- [ ] Redeployaste tu aplicación en Vercel después de cambiar las variables de entorno

## Solución de Problemas

### Error: "redirect_uri_mismatch"
**Causa**: La URL de callback no está autorizada en Google Cloud Console.

**Solución**: 
- Verifica que `https://ngoyzrqiiwqenznrgyzj.supabase.co/auth/v1/callback` esté en Authorized redirect URIs
- Espera 2-3 minutos para que se propaguen los cambios

### Sigue redirigiendo a localhost
**Causa**: La variable de entorno `NEXT_PUBLIC_SITE_URL` no está configurada correctamente o no se redeployó.

**Solución**:
1. Verifica que `NEXT_PUBLIC_SITE_URL` esté en Vercel con la URL correcta
2. Redeploy tu aplicación
3. Limpia el caché del navegador (Ctrl + Shift + R)

### Error: "Invalid redirect URL"
**Causa**: La URL no está en la lista de Redirect URLs de Supabase.

**Solución**:
- Agrega tu URL de Vercel en Supabase → Authentication → URL Configuration → Redirect URLs

### La autenticación funciona en localhost pero no en producción
**Causa**: Las configuraciones son diferentes entre desarrollo y producción.

**Solución**:
1. Verifica que todas las URLs estén configuradas en ambos ambientes
2. Asegúrate de usar HTTPS en producción (no HTTP)
3. Limpia las cookies y el caché del navegador

## Configuración para Múltiples Entornos

### Preview Deployments (Opcional)
Si usas preview deployments de Vercel (por ejemplo, branches de git):

1. **En Supabase**, agrega el wildcard:
   ```
   https://*.vercel.app/auth/confirm
   ```

2. **En Vercel**, la variable `NEXT_PUBLIC_SITE_URL` se auto-detectará mediante `window.location.origin` si no está configurada

### Dominio Personalizado (Opcional)
Si tienes un dominio personalizado en Vercel:

1. Actualiza `NEXT_PUBLIC_SITE_URL` en Vercel a tu dominio personalizado
2. Actualiza **Site URL** en Supabase a tu dominio personalizado
3. Agrega tu dominio personalizado a **Redirect URLs** en Supabase
4. Agrega tu dominio personalizado a **Authorized JavaScript origins** en Google Cloud Console

## Notas Importantes

- **HTTPS es obligatorio en producción**. Google no permite OAuth sobre HTTP excepto para localhost
- **Las variables de entorno con prefijo `NEXT_PUBLIC_`** están disponibles en el navegador
- **Redeploy después de cambiar variables de entorno** en Vercel
- **Los cambios en Google Cloud Console** pueden tomar 1-5 minutos en propagarse
- **Limpia el caché del navegador** si sigues viendo problemas después de configurar todo

## Recursos Adicionales

- [Documentación de Vercel sobre Variables de Entorno](https://vercel.com/docs/environment-variables)
- [Documentación de Supabase sobre OAuth](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

---

**¿Necesitas ayuda?** Verifica los logs en:
- Vercel Dashboard → Functions → Logs
- Supabase Dashboard → Logs
- Consola del navegador (F12 → Console)
