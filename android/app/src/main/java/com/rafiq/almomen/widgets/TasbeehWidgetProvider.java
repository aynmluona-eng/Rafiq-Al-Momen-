package com.rafiq.almomen.widgets;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import com.rafiq.almomen.MainActivity;
import com.rafiq.almomen.R;

public class TasbeehWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_INCREMENT = "com.rafiq.almomen.widgets.ACTION_INCREMENT";
    public static final String ACTION_RESET = "com.rafiq.almomen.widgets.ACTION_RESET";
    public static final String PREFS_NAME = "TasbeehWidgetPrefs";
    public static final String PREF_COUNT_KEY = "tasbeeh_count";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_INCREMENT.equals(intent.getAction())) {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            int count = prefs.getInt(PREF_COUNT_KEY, 0);
            count++;
            prefs.edit().putInt(PREF_COUNT_KEY, count).apply();

            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName thisWidget = new ComponentName(context, TasbeehWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
            for (int appWidgetId : appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId);
            }
        } else if (ACTION_RESET.equals(intent.getAction())) {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putInt(PREF_COUNT_KEY, 0).apply();

            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName thisWidget = new ComponentName(context, TasbeehWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
            for (int appWidgetId : appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId);
            }
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        int count = prefs.getInt(PREF_COUNT_KEY, 0);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_tasbeeh);
        views.setTextViewText(R.id.text_tasbeeh_count, String.valueOf(count));

        // Intent to increment
        Intent incrementIntent = new Intent(context, TasbeehWidgetProvider.class);
        incrementIntent.setAction(ACTION_INCREMENT);
        PendingIntent incrementPendingIntent = PendingIntent.getBroadcast(
            context, 0, incrementIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.btn_tasbeeh_increment, incrementPendingIntent);
        
        // Intent to reset
        Intent resetIntent = new Intent(context, TasbeehWidgetProvider.class);
        resetIntent.setAction(ACTION_RESET);
        PendingIntent resetPendingIntent = PendingIntent.getBroadcast(
            context, 1, resetIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.btn_tasbeeh_reset, resetPendingIntent);

        Intent mainIntent = new Intent(context, MainActivity.class);
        PendingIntent mainPendingIntent = PendingIntent.getActivity(
            context, 2, mainIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_tasbeeh_layout, mainPendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
