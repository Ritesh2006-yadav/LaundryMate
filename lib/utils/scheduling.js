/**
 * LPU LMS - Indian Standard Time (IST) Laundry Scheduling Engine
 * Timezone: Asia/Kolkata
 */

export const STANDARD_TIME_SLOTS = [
  {
    id: "morning",
    label: "Morning Slot (08:00 AM - 10:00 AM)",
    timeRange: "08:00 AM - 10:00 AM",
    period: "Morning",
    cutoffHour: 8,
    cutoffMinute: 0,
  },
  {
    id: "afternoon",
    label: "Afternoon Slot (01:00 PM - 03:00 PM)",
    timeRange: "01:00 PM - 03:00 PM",
    period: "Afternoon",
    cutoffHour: 13,
    cutoffMinute: 0,
  },
  {
    id: "evening",
    label: "Evening Slot (05:00 PM - 07:00 PM)",
    timeRange: "05:00 PM - 07:00 PM",
    period: "Evening",
    cutoffHour: 17,
    cutoffMinute: 0,
  },
  {
    id: "night",
    label: "Night Slot (08:00 PM - 10:00 PM)",
    timeRange: "08:00 PM - 10:00 PM",
    period: "Night",
    cutoffHour: 20,
    cutoffMinute: 0,
  },
];

/**
 * Returns current date and time components strictly in Asia/Kolkata timezone
 */
export function getISTNow() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const p = {};
  parts.forEach(({ type, value }) => {
    p[type] = value;
  });

  const year = parseInt(p.year, 10);
  const month = parseInt(p.month, 10);
  const day = parseInt(p.day, 10);
  const hour = parseInt(p.hour, 10);
  const minute = parseInt(p.minute, 10);

  const pad = (n) => String(n).padStart(2, "0");
  const todayKey = `${year}-${pad(month)}-${pad(day)}`;

  return {
    year,
    month,
    day,
    hour,
    minute,
    todayKey,
    nowDate: now,
  };
}

/**
 * Generates an array of rolling valid booking dates strictly calculated in IST
 */
export function getValidBookingDates(numDays = 5) {
  const ist = getISTNow();

  // Create a base date using year, month (0-indexed), day
  const baseDate = new Date(Date.UTC(ist.year, ist.month - 1, ist.day, 12, 0, 0));
  const dates = [];

  for (let i = 0; i < numDays; i++) {
    const d = new Date(baseDate);
    d.setUTCDate(baseDate.getUTCDate() + i);

    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const pad = (n) => String(n).padStart(2, "0");
    const dateKey = `${year}-${pad(month)}-${pad(day)}`;

    const weekdayShort = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: "Asia/Kolkata",
    }).format(d);

    const weekdayFull = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    }).format(d);

    const monthShort = new Intl.DateTimeFormat("en-US", {
      month: "short",
      timeZone: "Asia/Kolkata",
    }).format(d);

    const isToday = i === 0;
    const isTomorrow = i === 1;

    let badge = null;
    let label = `${weekdayShort}, ${day} ${monthShort}`;

    if (isToday) {
      badge = "Today";
      label = `Today, ${day} ${monthShort}`;
    } else if (isTomorrow) {
      badge = "Tomorrow";
      label = `Tomorrow, ${day} ${monthShort}`;
    }

    // Check if slots exist for today
    let isAvailable = true;
    let closedReason = null;

    if (isToday) {
      const remainingSlots = STANDARD_TIME_SLOTS.filter((slot) => {
        return !(ist.hour > slot.cutoffHour || (ist.hour === slot.cutoffHour && ist.minute >= slot.cutoffMinute));
      });
      if (remainingSlots.length === 0) {
        isAvailable = false;
        closedReason = "All slots closed for today";
      }
    }

    dates.push({
      dateKey,
      day,
      month: monthShort,
      year,
      weekday: weekdayFull,
      weekdayShort,
      displayLabel: label,
      fullFormatted: `${weekdayFull}, ${day} ${monthShort} ${year}`,
      badge,
      isToday,
      isTomorrow,
      isAvailable,
      closedReason,
    });
  }

  return dates;
}

/**
 * Evaluates which slots are available for a given dateKey
 */
export function getSlotsForDate(dateKey) {
  const ist = getISTNow();
  const isToday = dateKey === ist.todayKey;

  return STANDARD_TIME_SLOTS.map((slot) => {
    let isAvailable = true;
    let statusText = "Available";

    if (isToday) {
      const hasPassed =
        ist.hour > slot.cutoffHour ||
        (ist.hour === slot.cutoffHour && ist.minute >= slot.cutoffMinute);

      if (hasPassed) {
        isAvailable = false;
        statusText = "Closed (Time passed)";
      }
    }

    return {
      ...slot,
      isAvailable,
      statusText,
    };
  });
}

/**
 * Server-side validation to verify a slot selection is legal in IST
 */
export function validateBookingSlot(dateKey, slotLabelOrId) {
  const ist = getISTNow();
  if (dateKey < ist.todayKey) {
    return { valid: false, error: "Cannot schedule collection in the past." };
  }

  const slot = STANDARD_TIME_SLOTS.find(
    (s) => s.id === slotLabelOrId || s.label === slotLabelOrId || slotLabelOrId.includes(s.timeRange)
  );

  if (!slot) {
    return { valid: false, error: "Invalid laundry collection time slot specified." };
  }

  if (dateKey === ist.todayKey) {
    const hasPassed =
      ist.hour > slot.cutoffHour ||
      (ist.hour === slot.cutoffHour && ist.minute >= slot.cutoffMinute);

    if (hasPassed) {
      return {
        valid: false,
        error: `The ${slot.timeRange} collection window for today has already passed. Please select an upcoming slot or tomorrow.`,
      };
    }
  }

  return { valid: true, slot };
}

