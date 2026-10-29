// ClockDock Phase 3 — Alarm Scheduling & Evaluation Engine
import { AlarmItem } from '../types';

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const FULL_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Calculates the exact Date and time of the next occurrence for an alarm.
 */
export function getNextAlarmOccurrence(alarm: AlarmItem, referenceDate: Date = new Date()): Date | null {
  if (!alarm.enabled) return null;

  // If snoozed, the next occurrence is the snooze expiration
  if (alarm.snoozedUntil && alarm.snoozedUntil > referenceDate.getTime()) {
    return new Date(alarm.snoozedUntil);
  }

  const [hoursStr, minutesStr] = alarm.time.split(':');
  const targetHour = parseInt(hoursStr, 10);
  const targetMinute = parseInt(minutesStr, 10);

  if (isNaN(targetHour) || isNaN(targetMinute)) return null;

  // 1. One-time alarm (no specific recurring days)
  if (alarm.days.length === 0) {
    const candidateToday = new Date(referenceDate);
    candidateToday.setHours(targetHour, targetMinute, 0, 0);

    // If candidate is in the future today, return it
    if (candidateToday.getTime() > referenceDate.getTime()) {
      return candidateToday;
    }

    // Otherwise, it will trigger tomorrow at that time
    const candidateTomorrow = new Date(referenceDate);
    candidateTomorrow.setDate(candidateTomorrow.getDate() + 1);
    candidateTomorrow.setHours(targetHour, targetMinute, 0, 0);
    return candidateTomorrow;
  }

  // 2. Recurring alarm on selected weekdays
  const currentDay = referenceDate.getDay();

  // Check today first if today is in the repeat days
  if (alarm.days.includes(currentDay)) {
    const candidateToday = new Date(referenceDate);
    candidateToday.setHours(targetHour, targetMinute, 0, 0);
    if (candidateToday.getTime() > referenceDate.getTime()) {
      return candidateToday;
    }
  }

  // Check the next 7 days in order
  for (let offset = 1; offset <= 7; offset++) {
    const nextDate = new Date(referenceDate);
    nextDate.setDate(nextDate.getDate() + offset);
    const dayOfWeek = nextDate.getDay();

    if (alarm.days.includes(dayOfWeek)) {
      nextDate.setHours(targetHour, targetMinute, 0, 0);
      return nextDate;
    }
  }

  return null;
}

/**
 * Formats the next scheduled occurrence into natural, human-readable text.
 */
export function formatNextOccurrence(occurrenceDate: Date | null, referenceDate: Date = new Date()): string {
  if (!occurrenceDate) return 'Alarm is off';

  const diffMs = occurrenceDate.getTime() - referenceDate.getTime();
  if (diffMs <= 0) return 'Due now';

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 1) {
    return 'in less than a minute';
  }
  if (diffMinutes < 60) {
    return `in ${diffMinutes} min`;
  }

  const timeFormatted = occurrenceDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  const isToday =
    occurrenceDate.getDate() === referenceDate.getDate() &&
    occurrenceDate.getMonth() === referenceDate.getMonth() &&
    occurrenceDate.getFullYear() === referenceDate.getFullYear();

  const tomorrow = new Date(referenceDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    occurrenceDate.getDate() === tomorrow.getDate() &&
    occurrenceDate.getMonth() === tomorrow.getMonth() &&
    occurrenceDate.getFullYear() === tomorrow.getFullYear();

  if (isToday) {
    return `Today at ${timeFormatted} (in ${diffHours}h ${diffMinutes % 60}m)`;
  }
  if (isTomorrow) {
    return `Tomorrow at ${timeFormatted} (in ${diffHours}h ${diffMinutes % 60}m)`;
  }

  const weekdayName = FULL_DAY_NAMES[occurrenceDate.getDay()];
  return `${weekdayName} at ${timeFormatted}`;
}

/**
 * Finds the earliest upcoming alarm from an array.
 */
export function getEarliestUpcomingAlarm(
  alarms: AlarmItem[],
  referenceDate: Date = new Date()
): { alarm: AlarmItem; nextTime: Date } | null {
  let earliest: { alarm: AlarmItem; nextTime: Date } | null = null;

  for (const alarm of alarms) {
    if (!alarm.enabled) continue;
    const nextTime = getNextAlarmOccurrence(alarm, referenceDate);
    if (!nextTime) continue;

    if (!earliest || nextTime.getTime() < earliest.nextTime.getTime()) {
      earliest = { alarm, nextTime };
    }
  }

  return earliest;
}

export interface AlarmEvaluationResult {
  triggeringAlarms: AlarmItem[];
  missedAlarms: AlarmItem[];
  updatedAlarms: AlarmItem[];
}

/**
 * Evaluates all alarms against the current time.
 * Handles active triggers, snooze expirations, and browser suspension overdue policy.
 */
export function evaluateAlarms(
  alarms: AlarmItem[],
  now: Date = new Date()
): AlarmEvaluationResult {
  const triggeringAlarms: AlarmItem[] = [];
  const missedAlarms: AlarmItem[] = [];
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;

  const updatedAlarms = alarms.map((alarm) => {
    if (!alarm.enabled) return alarm;

    // Check snoozed alarm first
    if (alarm.snoozedUntil) {
      if (now.getTime() >= alarm.snoozedUntil) {
        triggeringAlarms.push(alarm);
        return {
          ...alarm,
          snoozedUntil: null,
          lastTriggeredDate: todayStr,
        };
      }
      return alarm;
    }

    // Check scheduled alarm
    const [hoursStr, minutesStr] = alarm.time.split(':');
    const targetHour = parseInt(hoursStr, 10);
    const targetMinute = parseInt(minutesStr, 10);

    const isTargetDay =
      alarm.days.length === 0 || alarm.days.includes(now.getDay());

    if (!isTargetDay) return alarm;

    // Has it already triggered today?
    if (alarm.lastTriggeredDate === todayStr) {
      return alarm;
    }

    const scheduledTime = new Date(now);
    scheduledTime.setHours(targetHour, targetMinute, 0, 0);

    const diffMs = now.getTime() - scheduledTime.getTime();

    // Within target trigger window: 0 to 15 minutes overdue (e.g. active or brief background)
    if (diffMs >= 0 && diffMs <= 15 * 60 * 1000) {
      triggeringAlarms.push(alarm);
      return {
        ...alarm,
        enabled: alarm.days.length > 0, // Disable one-time alarm, keep recurring
        lastTriggeredDate: todayStr,
      };
    }

    // Long suspension overdue (>15 mins overdue, e.g. laptop closed or device asleep all morning)
    // Documented policy: log missed alarm without replaying ringing backlog
    if (diffMs > 15 * 60 * 1000 && diffMs <= 12 * 60 * 60 * 1000) {
      missedAlarms.push(alarm);
      return {
        ...alarm,
        enabled: alarm.days.length > 0,
        lastTriggeredDate: todayStr,
      };
    }

    return alarm;
  });

  return { triggeringAlarms, missedAlarms, updatedAlarms };
}
