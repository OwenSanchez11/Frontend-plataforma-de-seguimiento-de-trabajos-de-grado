package com.owen.gradostrack;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.IOException;
import java.io.OutputStream;

@CapacitorPlugin(name = "GuardarReporte")
public class GuardarReportePlugin extends Plugin {
    @PluginMethod
    public void guardar(PluginCall call) {
        Intent selector = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        selector.addCategory(Intent.CATEGORY_OPENABLE);
        selector.setType("application/pdf");
        selector.putExtra(Intent.EXTRA_TITLE, "trabajos-de-grado.pdf");
        try {
            startActivityForResult(call, selector, "guardarDocumento");
        } catch (ActivityNotFoundException excepcion) {
            call.reject("No se pudo abrir el selector de archivos de Android.", excepcion);
        }
    }

    @ActivityCallback
    private void guardarDocumento(PluginCall call, ActivityResult resultado) {
        if (call == null) return;
        if (resultado.getResultCode() == Activity.RESULT_CANCELED) {
            call.resolve(new JSObject().put("guardado", false));
            return;
        }

        Intent datos = resultado.getData();
        Uri destino = datos == null ? null : datos.getData();
        if (resultado.getResultCode() != Activity.RESULT_OK || destino == null) {
            call.reject("No se pudo obtener la ubicación del PDF.");
            return;
        }

        bridge.execute(() -> escribirPdf(call, destino));
    }

    private void escribirPdf(PluginCall call, Uri destino) {
        try (OutputStream salida = getContext().getContentResolver().openOutputStream(destino)) {
            if (salida == null) {
                call.reject("No se pudo abrir el archivo seleccionado.");
                return;
            }
            salida.write(Base64.decode(call.getString("contenido", ""), Base64.DEFAULT));
        } catch (IOException | IllegalArgumentException | SecurityException excepcion) {
            call.reject("No se pudo guardar el PDF en la ubicación seleccionada.", excepcion);
            return;
        }
        call.resolve(new JSObject().put("guardado", true));
    }
}
