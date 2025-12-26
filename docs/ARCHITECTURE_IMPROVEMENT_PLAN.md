# תוכנית שיפור ארכיטקטורה - Home Assistant Dashboard

## סקירת בעיות שזוהו

### בעיות מרכזיות שנמצאו:
1. **Retry חוסם** - בקשות נכשלות (503) עושות 5 retries עם exponential backoff, מה שחוסם את כל הסינק
2. **אין graceful degradation** - כשל בסנסור אחד מונע הצגת כל הנתונים
3. **חוסר אחידות באנימציות** - כל קומפוננטה משתמשת באנימציות שונות
4. **חוסר בדיקות** - אין כיסוי בדיקות לתרחישי קצה

---

## שלב 1: שיפורי Resilience (עמידות)

### 1.1 HTTP Client שיפורים ✅ (בוצע)
```typescript
// שינויים שבוצעו:
- הוספת timeout של 8 שניות לכל בקשה
- אי-עשיית retry על 503 (entity offline)
- הורדת delay בין retries (מקסימום 4 שניות)
- תפיסת שגיאות timeout
```

### 1.2 Batch Requests עם Graceful Degradation ✅ (בוצע)
```typescript
// getMultipleStates - עכשיו תופס שגיאות בודדות
async getMultipleStates(entityIds: string[]): Promise<Record<string, Entity | null>> {
  // כל בקשה עטופה ב-try/catch
  // שגיאה בודדת לא מפילה את כל הbatch
}
```

### 1.3 Loading States מציאותיים
- הצגת skeleton loaders במקום hidden content
- סימון ויזואלי של סנסורים שלא זמינים
- הצגת נתונים חלקיים כשאפשר

---

## שלב 2: ארכיטקטורת State Management

### 2.1 עקרון Single Source of Truth
```
HAConnectionContext (Root)
    ├── config (baseUrl, accessToken)
    ├── entityMapping (מיפוי סנסורים)
    └── connectionStatus

ClimateContext (Derived)
    └── climateData (temperature, humidity, airQuality)

LightingContext (Derived)
    └── lightStates (desk, monitor, spotlight)

MediaPlayerContext (Derived)
    └── mediaState (playing, track, volume)
```

### 2.2 Optimistic Updates
```typescript
// עדכון UI מיידי, ואז סינכרון עם השרת
const toggleLight = async (entityId: string) => {
  // 1. עדכון מקומי מיידי
  setLightState(prev => ({ ...prev, [entityId]: !prev[entityId] }));
  
  // 2. שליחה לשרת
  try {
    await haClient.callService('light', 'toggle', { entity_id: entityId });
  } catch {
    // 3. Rollback במקרה של כשל
    setLightState(prev => ({ ...prev, [entityId]: !prev[entityId] }));
  }
};
```

---

## שלב 3: אנימציות אחידות

### 3.1 Animation Constants (קובץ מרכזי)
```typescript
// src/constants/animations.ts
export const TRANSITIONS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: [0.22, 0.03, 0.26, 1] }
  },
  scaleUp: {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.4, ease: [0.22, 0.03, 0.26, 1] }
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: [0.22, 0.03, 0.26, 1] }
  }
};
```

### 3.2 כללים לשימוש באנימציות
| מצב | אנימציה מומלצת |
|-----|----------------|
| כניסה לדף | fade בלבד |
| החלפת טאב | fade בלבד |
| הופעת אלמנט | scaleUp או fade |
| tooltip/popover | fade מהיר (150ms) |
| loading states | skeleton pulse |

---

## שלב 4: Error Handling מקיף

### 4.1 Error Boundaries
```typescript
// עטיפת כל feature בנפרד
<ErrorBoundary fallback={<ClimateErrorState />}>
  <ClimateIndicators />
</ErrorBoundary>

<ErrorBoundary fallback={<LightingErrorState />}>
  <LightControlCard />
</ErrorBoundary>
```

### 4.2 Retry Strategies לפי סוג שגיאה
| Status Code | אסטרטגיה |
|-------------|----------|
| 401/403 | אל תנסה שוב, בקש re-auth |
| 404 | אל תנסה שוב, entity לא קיים |
| 500 | נסה שוב עם backoff |
| 503 | אל תנסה שוב, entity offline |
| Network Error | נסה שוב עם backoff |
| Timeout | נסה שוב פעם אחת |

### 4.3 User Feedback
```typescript
// הצגת הודעות מתאימות
toast.error('הסנסור לא זמין כרגע');
toast.warning('חלק מהנתונים לא נטענו');
toast.success('ההגדרות נשמרו');
```

---

## שלב 5: בדיקות מקיפות

### 5.1 Unit Tests
- [ ] `haClient.request` - timeout, retry logic, error handling
- [ ] `sensors.getMultipleStates` - partial failures
- [ ] `useClimateSync` - loading states, error states
- [ ] `useLightSync` - optimistic updates, rollback

### 5.2 Integration Tests
- [ ] Climate flow - מטעינה ועד הצגה
- [ ] Light control flow - מלחיצה ועד עדכון
- [ ] Settings flow - שמירה וטעינה מחדש
- [ ] Connection flow - התחברות, ניתוק, התחברות מחדש

### 5.3 E2E Tests
- [ ] כניסה ראשונה ללא חיבור
- [ ] חיבור והצגת נתונים
- [ ] שליטה באורות
- [ ] שינוי הגדרות

---

## שלב 6: Performance Monitoring

### 6.1 מטריקות לעקוב
- Time to First Data (TTFD) - זמן עד הצגת נתוני אקלים ראשונים
- Request Success Rate - אחוז הבקשות שמצליחות
- Retry Rate - כמה פעמים יש retry
- Render Performance - FPS בזמן אנימציות

### 6.2 Logging Strategy
```typescript
// לוגים מובנים לדיבאג
logger.connection('Connected', { version, latency });
logger.sync('Climate synced', { temperature, humidity });
logger.error('Request failed', { entityId, status, attempts });
```

---

## יישום מיידי (Priority)

### P0 - קריטי (היום)
1. ✅ תיקון retry logic ב-HTTP client
2. ✅ Graceful degradation ב-getMultipleStates
3. תיקון הצגת אינדיקטורי אקלים

### P1 - חשוב (השבוע)
1. הוספת timeout לכל הבקשות
2. Error boundaries לכל feature
3. בדיקות ל-critical paths

### P2 - שיפור (החודש)
1. Animation constants מרכזיים
2. Performance monitoring
3. כיסוי בדיקות מלא

---

## קובצי מפתח לעדכון

| קובץ | שינוי נדרש |
|------|-----------|
| `src/api/homeAssistant/client.ts` | ✅ Timeout, skip 503 retry |
| `src/api/homeAssistant/entities/sensors.ts` | ✅ Graceful batch failures |
| `src/features/climate/hooks/useClimateSync.ts` | בדיקת isLoaded logic |
| `src/features/climate/components/ClimateIndicators.tsx` | Loading skeleton |
| `src/constants/animations.ts` | Animation presets |
| `src/components/ui/tabs.tsx` | CSS-based transitions |
