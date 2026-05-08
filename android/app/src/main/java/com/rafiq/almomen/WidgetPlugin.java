package com.rafiq.almomen;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetPlugin")
public class WidgetPlugin extends Plugin {

    @PluginMethod
    public void addWidget(PluginCall call) {
        String type = call.getString("type", "prayer");
        
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(getContext());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (appWidgetManager.isRequestPinAppWidgetSupported()) {
                ComponentName componentName;
                if ("tasbeeh".equals(type)) {
                    componentName = new ComponentName(getContext(), com.rafiq.almomen.widgets.TasbeehWidgetProvider.class);
                } else {
                    componentName = new ComponentName(getContext(), com.rafiq.almomen.widgets.PrayerWidgetProvider.class);
                }

                Intent pinnedWidgetCallbackIntent = new Intent(getContext(), MainActivity.class);
                PendingIntent successCallback = PendingIntent.getActivity(
                    getContext(),
                    0,
                    pinnedWidgetCallbackIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );

                boolean success = appWidgetManager.requestPinAppWidget(componentName, null, successCallback);
                if (success) {
                    call.resolve();
                } else {
                    call.reject("Failed to request pin app widget");
                }
            } else {
                call.reject("Pinning widgets is not supported on this device/launcher");
            }
        } else {
            call.reject("Widget pinning requires Android Oreo (API 26) or higher. Please add it manually from your home screen.");
        }
    }
}
