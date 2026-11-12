# GradosTrack

## Icono de Android

Los archivos fuente de los iconos están en `assets/`:

- `icon-only.png`: icono clásico y redondo.
- `icon-foreground.png`: capa frontal del icono adaptativo.

Ambos deben ser PNG cuadrados de al menos 1024 × 1024 px. Para generar los iconos en `android/app/src/main/res`, ejecuta desde esta carpeta:

```bash
npm run assets:android
```

Antes de abrir el proyecto en Android Studio o generar el APK, compila la aplicación web, genera los iconos y sincroniza Capacitor con:

```bash
npm run android:prepare
```

Después abre la carpeta `android` en Android Studio y genera el APK desde allí.
