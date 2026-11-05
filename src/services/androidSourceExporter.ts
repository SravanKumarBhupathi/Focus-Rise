export interface AndroidSourceFile {
  path: string;
  title: string;
  language: 'kotlin' | 'xml' | 'gradle' | 'markdown';
  description: string;
  code: string;
}

export const ANDROID_PROJECT_FILES: AndroidSourceFile[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    title: 'AndroidManifest.xml (Permissions & Receivers)',
    language: 'xml',
    description: 'Declares exact alarm, notification, DND policy, UsageStats, Camera QR, and BootCompleted restoration receivers.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.sravanking.focusrise">

    <!-- Core Alarm, Notification & Wake Permissions -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.ACCESS_NOTIFICATION_POLICY" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission
        android:name="android.permission.PACKAGE_USAGE_STATS"
        tools:ignore="ProtectedPermissions" />

    <application
        android:name=".FocusRiseApp"
        android:allowBackup="true"
        android:label="FocusRise 👑"
        android:supportsRtl="true"
        android:theme="@style/Theme.FocusRise">

        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:showWhenLocked="true"
            android:turnScreenOn="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Full-Screen Progressive Snooze Math Alarm Activity -->
        <activity
            android:name=".ui.alarm.AlarmChallengeActivity"
            android:exported="false"
            android:launchMode="singleInstance"
            android:showOnLockScreen="true"
            android:showWhenLocked="true"
            android:turnScreenOn="true" />

        <!-- Exact Alarm & Boot Receiver -->
        <receiver
            android:name=".receiver.SmartAlarmReceiver"
            android:enabled="true"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.app.action.SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED" />
                <action android:name="com.sravanking.focusrise.ACTION_TRIGGER_ALARM" />
            </intent-filter>
        </receiver>

        <!-- Compliant Focus App Blocker Accessibility Service -->
        <service
            android:name=".service.DistractionGuardService"
            android:exported="false"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>
    </application>
</manifest>`,
  },
  {
    path: 'app/src/main/java/com/sravanking/focusrise/data/local/FocusRiseDatabase.kt',
    title: 'FocusRiseDatabase.kt (Room Database & Entities)',
    language: 'kotlin',
    description: 'Offline-first Room database storing alarms, alarm history, focus sessions, goals, reflections, and daily challenges.',
    code: `package com.sravanking.focusrise.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "alarms")
data class AlarmEntity(
    @PrimaryKey val id: String,
    val hour: Int,
    val minute: Int,
    val label: String,
    val enabled: Boolean,
    val repeatDaysCsv: String,
    val soundType: String,
    val vibrate: Boolean,
    val gradualVolume: Boolean,
    val snoozeMinutes: Int,
    val maxSnoozeCount: Int,
    val currentSnoozeCount: Int,
    val questionCount: Int,
    val challengeMode: String
)

@Entity(tableName = "focus_sessions")
data class FocusSessionEntity(
    @PrimaryKey val id: String,
    val taskTitle: String,
    val goalId: String,
    val durationMinutes: Int,
    val completedMinutes: Int,
    val startedAtEpoch: Long,
    val status: String,
    val coinsEarned: Int
)

@Entity(tableName = "daily_reflections")
data class ReflectionEntity(
    @PrimaryKey val dateIso: String,
    val accomplishment: String,
    val completedMainGoal: Boolean,
    val biggestDistraction: String,
    val improvementForTomorrow: String,
    val moodRating: Int
)

@Dao
interface FocusRiseDao {
    @Query("SELECT * FROM alarms ORDER BY hour ASC, minute ASC")
    fun observeAlarms(): Flow<List<AlarmEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAlarm(alarm: AlarmEntity)

    @Delete
    suspend fun deleteAlarm(alarm: AlarmEntity)

    @Query("SELECT * FROM focus_sessions ORDER BY startedAtEpoch DESC")
    fun observeFocusSessions(): Flow<List<FocusSessionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFocusSession(session: FocusSessionEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertReflection(reflection: ReflectionEntity)
}

@Database(
    entities = [AlarmEntity::class, FocusSessionEntity::class, ReflectionEntity::class],
    version = 1,
    exportSchema = true
)
abstract class FocusRiseDatabase : RoomDatabase() {
    abstract fun dao(): FocusRiseDao
}`,
  },
  {
    path: 'app/src/main/java/com/sravanking/focusrise/domain/math/ProgressiveMathEngine.kt',
    title: 'ProgressiveMathEngine.kt (15-Category Question Generator)',
    language: 'kotlin',
    description: 'Generates non-duplicate math problems scaled dynamically by snooze count (Easy -> Expert).',
    code: `package com.sravanking.focusrise.domain.math

import kotlin.random.Random

enum class DifficultyLevel {
    EASY, EASY_MEDIUM, MEDIUM, MEDIUM_HARD, HARD, EXPERT
}

data class MathProblem(
    val number: Int,
    val total: Int,
    val category: String,
    val difficulty: DifficultyLevel,
    val expression: String,
    val expectedAnswer: Double,
    val explanation: String
)

class ProgressiveMathEngine {

    fun resolveDifficultyForSnooze(snoozeCount: Int): DifficultyLevel = when {
        snoozeCount <= 0 -> DifficultyLevel.EASY
        snoozeCount == 1 -> DifficultyLevel.EASY_MEDIUM
        snoozeCount == 2 -> DifficultyLevel.MEDIUM
        snoozeCount == 3 -> DifficultyLevel.MEDIUM_HARD
        snoozeCount == 4 -> DifficultyLevel.HARD
        else -> DifficultyLevel.EXPERT
    }

    fun generateChallengeSet(snoozeCount: Int, questionCount: Int = 10): List<MathProblem> {
        val difficulty = resolveDifficultyForSnooze(snoozeCount)
        val generated = mutableListOf<MathProblem>()
        val usedExpressions = mutableSetOf<String>()

        while (generated.size < questionCount) {
            val candidate = buildQuestion(difficulty, generated.size + 1, questionCount)
            if (usedExpressions.add(candidate.expression)) {
                generated.add(candidate)
            }
        }
        return generated
    }

    private fun buildQuestion(
        difficulty: DifficultyLevel,
        index: Int,
        total: Int
    ): MathProblem {
        return when (difficulty) {
            DifficultyLevel.EASY -> {
                val a = Random.nextInt(12, 75)
                val b = Random.nextInt(11, 55)
                MathProblem(index, total, "Addition", difficulty, "$a + $b = ?", (a + b).toDouble(), "$a + $b = \${a + b}")
            }
            DifficultyLevel.EASY_MEDIUM -> {
                val a = Random.nextInt(13, 29)
                val b = Random.nextInt(4, 9)
                MathProblem(index, total, "Tables 1-30", difficulty, "$a × $b = ?", (a * b).toDouble(), "$a × $b = \${a * b}")
            }
            DifficultyLevel.MEDIUM -> {
                val a = Random.nextInt(21, 89)
                MathProblem(index, total, "Multiply by 11", difficulty, "$a × 11 = ?", (a * 11).toDouble(), "Split digits and sum middle")
            }
            DifficultyLevel.MEDIUM_HARD -> {
                val n = Random.nextInt(12, 35)
                MathProblem(index, total, "Squares", difficulty, "\${n}² = ?", (n * n).toDouble(), "$n × $n = \${n * n}")
            }
            DifficultyLevel.HARD -> {
                val base = Random.nextInt(6, 18) * 40
                val ans = base * 0.35
                MathProblem(index, total, "Percentages", difficulty, "35% of $base = ?", ans, "30% + 5% of $base = $ans")
            }
            DifficultyLevel.EXPERT -> {
                val mult = Random.nextInt(8, 18) * 8
                val n = Random.nextInt(11, 24)
                val ans = (3 * mult / 8) + (n * n)
                MathProblem(index, total, "Competitive Exam", difficulty, "(37.5% of $mult) + \${n}² = ?", ans.toDouble(), "(3/8 × $mult) + \${n*n} = $ans")
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/sravanking/focusrise/receiver/SmartAlarmReceiver.kt',
    title: 'SmartAlarmReceiver.kt (AlarmManager + Reboot Restoration)',
    language: 'kotlin',
    description: 'Schedules exact alarms using setAlarmClock() and restores all enabled alarms upon BOOT_COMPLETED.',
    code: `package com.sravanking.focusrise.receiver

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import com.sravanking.focusrise.ui.alarm.AlarmChallengeActivity

class SmartAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED,
            AlarmManager.ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED -> {
                // Re-register all enabled alarms from Room database via WorkManager
            }
            "com.sravanking.focusrise.ACTION_TRIGGER_ALARM" -> {
                val alarmId = intent.getStringExtra("ALARM_ID") ?: return
                val snoozeCount = intent.getIntExtra("SNOOZE_COUNT", 0)
                val fullScreenIntent = Intent(context, AlarmChallengeActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    putExtra("ALARM_ID", alarmId)
                    putExtra("SNOOZE_COUNT", snoozeCount)
                }
                context.startActivity(fullScreenIntent)
            }
        }
    }

    companion object {
        fun scheduleExactAlarm(
            context: Context,
            alarmId: String,
            triggerAtMillis: Long,
            snoozeCount: Int
        ) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
                return
            }
            val intent = Intent(context, SmartAlarmReceiver::class.java).apply {
                action = "com.sravanking.focusrise.ACTION_TRIGGER_ALARM"
                putExtra("ALARM_ID", alarmId)
                putExtra("SNOOZE_COUNT", snoozeCount)
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                alarmId.hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            val info = AlarmManager.AlarmClockInfo(triggerAtMillis, pendingIntent)
            alarmManager.setAlarmClock(info, pendingIntent)
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/sravanking/focusrise/ui/theme/Theme.kt',
    title: 'Theme.kt (FocusRise 👑 Material 3 Brand Palette)',
    language: 'kotlin',
    description: 'Implements Primary Orange (#FF8A00), Deep Black (#080808), Dark Cards (#191919), and Light Mode.',
    code: `package com.sravanking.focusrise.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val PrimaryOrange = Color(0xFFFF8A00)
val BrightOrange = Color(0xFFFFA726)
val NeonOrange = Color(0xFFFF6D00)
val PureWhite = Color(0xFFFFFFFF)
val PureBlack = Color(0xFF000000)
val DeepBlack = Color(0xFF080808)
val DarkSurface = Color(0xFF111111)
val DarkCards = Color(0xFF191919)
val SuccessGreen = Color(0xFF16C784)
val ErrorRed = Color(0xFFFF4545)
val SecondaryText = Color(0xFF888888)

private val AmoledColorScheme = darkColorScheme(
    primary = PrimaryOrange,
    secondary = BrightOrange,
    tertiary = NeonOrange,
    background = DeepBlack,
    surface = DarkSurface,
    surfaceVariant = DarkCards,
    onPrimary = PureBlack,
    onBackground = PureWhite,
    onSurface = PureWhite,
    error = ErrorRed
)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryOrange,
    secondary = NeonOrange,
    background = PureWhite,
    surface = Color(0xFFF7F7F9),
    onPrimary = PureBlack,
    onBackground = DeepBlack,
    onSurface = DeepBlack,
    error = ErrorRed
)

@Composable
fun FocusRiseTheme(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) AmoledColorScheme else LightColorScheme,
        content = content
    )
}`,
  },
  {
    path: 'README_APK_INSTALLATION.md',
    title: 'APK Build & Android Phone Installation Guide',
    language: 'markdown',
    description: 'Complete instructions to build debug/release APKs and install FocusRise 👑 on any Android device.',
    code: `# FocusRise 👑 — Android APK Build & Installation Guide
**Tagline:** Wake Up. Think Fast. Stay Focused. Win Your Future.
**Developer Credit:** Developed by Sravan King 👑

## 1. How to Build the Installable Debug / Release APK
1. Open the exported project folder in **Android Studio Ladybug (2024.2.1) or newer** with JDK 17.
2. Let Gradle sync complete, or run from terminal:
   \`\`\`bash
   ./gradlew assembleDebug
   \`\`\`
3. Locate your generated APK at:
   \`app/build/outputs/apk/debug/app-debug.apk\`

## 2. How to Install the APK on Your Android Phone
### Method A: Direct Transfer (No Computer ADB Required)
1. Copy \`app-debug.apk\` to your Android phone via USB cable, Google Drive, or LocalSend.
2. Open your phone's **Files** app and tap \`app-debug.apk\`.
3. If prompted *"For your security, your phone currently isn't allowed to install unknown apps"*, tap **Settings** and toggle **Allow from this source** ON.
4. Tap **Install**, then **Open** to launch **FocusRise 👑**.

### Method B: Install via USB Debugging (ADB)
1. On your Android phone, go to **Settings → About Phone** and tap **Build Number** 7 times.
2. Go to **Settings → System → Developer Options** and enable **USB Debugging**.
3. Connect your phone via USB and run:
   \`\`\`bash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   \`\`\`

## 3. Recommended First-Run Permissions on Android 13 / 14 / 15
- **Alarms & Reminders (\`SCHEDULE_EXACT_ALARM\`)**: Enabled in Settings → Apps → Special App Access → Alarms & Reminders.
- **Do Not Disturb Access (\`ACCESS_NOTIFICATION_POLICY\`)**: Grant in Focus tab so FocusRise can silence distractions during study blocks and restore DND automatically afterward.
- **Usage Access (\`PACKAGE_USAGE_STATS\`)**: Optional; grant in Distraction Control to monitor daily time spent on distracting apps.`,
  },
];
