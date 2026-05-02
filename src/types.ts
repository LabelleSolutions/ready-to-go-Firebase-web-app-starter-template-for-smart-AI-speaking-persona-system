// ─────────────────────────────────────────────────────────────────────────────
// Upventure Foundations Course — Type Definitions
// Vietnamese → English Speaking Skills (Accent Reduction)
// ─────────────────────────────────────────────────────────────────────────────

export type GoalCategory = 'Sound Mechanics' | 'Mastery & Control';

export type OnlineCheckInType = 'mid-week' | 'end-of-week';

// ── Daily Plan ────────────────────────────────────────────────────────────────

export interface DailyPlan {
  day: number;
  theme: string;
  objectives: string[];
  /** The specific Vietnamese → English transfer issue addressed today */
  vietnameseFocus: string;
  /** True on days 4 and 7 — the 2× required online sessions */
  isOnlineSession: boolean;
  offlineDuration: number; // estimated minutes of offline work
  tip: string; // quick coach tip for the learner
}

// ── Daily Activity ────────────────────────────────────────────────────────────

export interface ActivityStep {
  stepNumber: number;
  instruction: string;
  /** Optional Vietnamese-specific coaching note */
  vietnameseNote?: string;
}

export interface DailyActivity {
  day: number;
  title: string;
  description: string;
  /** Primary articulatory / motor-skill muscle group being trained */
  motorSkillFocus: string;
  durationMinutes: number;
  materials: string[];
  steps: ActivityStep[];
}

// ── Daily Practice ────────────────────────────────────────────────────────────

export interface PracticeDrill {
  name: string;
  instruction: string;
  repetitions: number;
  targetPhonemes?: string[];
  /** Why this is especially hard for Vietnamese speakers */
  vietnameseNote?: string;
}

export interface ListeningExercise {
  title: string;
  instruction: string;
  /** What the learner listens for / discriminates */
  focusCue: string;
}

export interface SpeakingExercise {
  title: string;
  prompt: string;
  targetSounds: string[];
  successHint: string;
}

export interface DailyPractice {
  day: number;
  title: string;
  drills: PracticeDrill[];
  listeningExercise: ListeningExercise;
  speakingExercise: SpeakingExercise;
  totalDurationMinutes: number;
}

// ── Daily Quest (Gamified Upventure) ─────────────────────────────────────────

export interface DailyQuest {
  day: number;
  questName: string;
  /** In-world narrative flavour text */
  questNarrative: string;
  challenge: string;
  /** Specific articulator / motor-skill challenge within the quest */
  motorSkillComponent: string;
  xpReward: number;
  bonusXP?: number;
  bonusCondition?: string;
  badge?: string;
  successCriteria: string;
  failureRecovery: string; // what to do if the learner struggles
}

// ── Online Check-In ───────────────────────────────────────────────────────────

export interface OnlineCheckIn {
  /** Which day of the lesson week this check-in occurs (day 4 or day 7) */
  day: number;
  type: OnlineCheckInType;
  title: string;
  description: string;
  assessmentCriteria: string[];
  progressMarkers: string[];
  /** Estimated minutes for the online session */
  durationMinutes: number;
}

// ── Full Lesson Week ──────────────────────────────────────────────────────────

export interface LessonDay {
  plan: DailyPlan;
  activity: DailyActivity;
  practice: DailyPractice;
  quest: DailyQuest;
}

export interface LessonWeek {
  lessonNumber: number;
  title: string;
  goal: string;
  goalCategory: GoalCategory;
  /** Core Vietnamese phonology / prosody challenges this lesson targets */
  vietnameseChallenges: string[];
  weekOverview: string;
  days: Record<number, LessonDay>; // keys 1–7
  onlineCheckIns: OnlineCheckIn[]; // always exactly 2 per lesson
  weeklyXPCap: number;
  weeklyBadge: string;
  completionMessage: string;
}

// ── User Progress ─────────────────────────────────────────────────────────────

export interface DayProgress {
  completed: boolean;
  xpEarned: number;
  questCompleted: boolean;
  completedAt?: string; // ISO timestamp, set when completed
  notes?: string;
}

export interface LessonProgress {
  lessonNumber: number;
  startedAt: string; // ISO timestamp
  days: Record<number, DayProgress>;
  xpEarned: number;
  onlineCheckInsCompleted: OnlineCheckInType[];
  completedAt?: string;
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  currentLesson: number;
  currentDay: number;
  xpTotal: number;
  badges: string[];
  lessons: LessonProgress[];
  lastOnlineSync: string | null;
  syncPending: boolean; // true when offline changes await upload
}

// ── Scheduler Output ──────────────────────────────────────────────────────────

export interface ScheduledDay {
  lesson: LessonWeek;
  day: LessonDay;
  lessonNumber: number;
  dayNumber: number;
  /** Absolute day within the full course (1–70) */
  courseDay: number;
  requiresOnlineSession: boolean;
  checkIn?: OnlineCheckIn;
}
