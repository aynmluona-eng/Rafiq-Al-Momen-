package com.rafiq.almomen.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.rafiq.almomen.MainActivity
import com.rafiq.almomen.R

class TasbeehWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_INCREMENT) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            var count = prefs.getInt(PREF_COUNT_KEY, 0)
            count++
            prefs.edit().putInt(PREF_COUNT_KEY, count).apply()

            val appWidgetManager = AppWidgetManager.getInstance(context)
            val thisWidget = ComponentName(context, TasbeehWidgetProvider::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget)
            for (appWidgetId in appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId)
            }
        } else if (intent.action == ACTION_RESET) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putInt(PREF_COUNT_KEY, 0).apply()

            val appWidgetManager = AppWidgetManager.getInstance(context)
            val thisWidget = ComponentName(context, TasbeehWidgetProvider::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget)
            for (appWidgetId in appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId)
            }
        }
    }

    companion object {
        const val ACTION_INCREMENT = "com.rafiq.almomen.widgets.ACTION_INCREMENT"
        const val ACTION_RESET = "com.rafiq.almomen.widgets.ACTION_RESET"
        const val PREFS_NAME = "TasbeehWidgetPrefs"
        const val PREF_COUNT_KEY = "tasbeeh_count"

        internal fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val count = prefs.getInt(PREF_COUNT_KEY, 0)

            val views = RemoteViews(context.packageName, R.layout.widget_tasbeeh)
            views.setTextViewText(R.id.text_tasbeeh_count, count.toString())

            // Intent to increment
            val incrementIntent = Intent(context, TasbeehWidgetProvider::class.java)
            incrementIntent.action = ACTION_INCREMENT
            val incrementPendingIntent = PendingIntent.getBroadcast(
                context, 0, incrementIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_tasbeeh_increment, incrementPendingIntent)
            
            // Intent to reset
            val resetIntent = Intent(context, TasbeehWidgetProvider::class.java)
            resetIntent.action = ACTION_RESET
            val resetPendingIntent = PendingIntent.getBroadcast(
                context, 1, resetIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_tasbeeh_reset, resetPendingIntent)

            val mainIntent = Intent(context, MainActivity::class.java)
            val mainPendingIntent = PendingIntent.getActivity(
                context, 2, mainIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_tasbeeh_layout, mainPendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
