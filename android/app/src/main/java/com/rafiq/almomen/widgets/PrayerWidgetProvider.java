package com.rafiq.almomen.widgets;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import com.rafiq.almomen.MainActivity;
import com.rafiq.almomen.R;

public class PrayerWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onEnabled(Context context) {
    }

    @Override
    public void onDisabled(Context context) {
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_prayer);
        
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        views.setOnClickPendingIntent(R.id.widget_main_layout, pendingIntent);

        views.setTextViewText(R.id.text_next_prayer_name, "صلاة العصر");
        views.setTextViewText(R.id.text_countdown, "بقي 01:20:00");
        views.setTextViewText(R.id.text_date, "14 رمضان 1446");

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
