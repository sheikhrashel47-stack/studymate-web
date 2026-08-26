# StudyMate Mobile Interface Plan

## Product Intent

StudyMate is a calm, offline-first study companion for a Class 8 learner. The experience prioritizes rapid comprehension: every primary screen should make its next action clear within five seconds. It uses a portrait 9:16 layout designed for one-handed use, with the most frequent actions placed in the lower half of the screen or in the persistent bottom navigation.

## Screen List and Purpose

| Screen | Primary content | Main actions |
|---|---|---|
| Home | Contextual greeting, compact learning summary, four quick actions, and one recent-test card | Open Questions, Mock Test, Flash Test, or Progress |
| Questions: Subjects | A virtualized list of local subjects with question counts and a quiet import entry point | Open a subject, import questions, or manage subjects |
| Questions: Chapters | Chapters belonging to the chosen subject with local question counts | Open a chapter, add, rename, or remove a chapter |
| Questions: List | Efficient one-question-at-a-time cards plus lightweight controls | Reveal answer and explanation; move through questions; delete a question |
| Import Questions | Text, JSON, and HTML input with a detected-format indicator | Paste or select source content, assign subject/chapter, preview parsed questions |
| Import Preview | Found-question count, validation notice, and a compact error list | Confirm import without deleting existing questions |
| Test Hub | Two focused study modes: Mock Test and Flash Test | Start either mode |
| Mock Setup | Subject, chapter, question count, and time selections | Start a locally generated test |
| Mock Exam | Question position, timer, answer choices, simple grid, and Previous/Next controls | Save selection, navigate, submit, or resume an interrupted test |
| Mock Result | Score, accuracy, summary counts, time used, and modest performance visualization | Review answers or return to Test |
| Flash Test | One question, immediate correctness feedback, and short explanation | Select an answer and advance |
| Progress | Overall statistics, subject and chapter indicators, and recent test history | Review strengths and topics needing practice |
| Management sheets | Small focused sheets for subject/chapter actions and destructive confirmations | Add, rename, or delete only after confirmation |

## Navigation and Interaction Model

The permanent bottom bar has four destinations: **Home**, **Questions**, **Test**, and **Progress**. The Import action is contextual within Questions rather than a fifth destination. Mock setup, flash practice, import preview, examination, results, and management actions use push screens or compact bottom sheets so the bottom navigation never becomes crowded.

Every primary touch target is at least 44 points tall. Primary calls to action use a filled academic-blue button; low-risk secondary actions use a text button or a muted outlined surface. Destructive actions remain separated from normal actions and always require a clear confirmation. During a mock test, no answer correctness or explanation is exposed until submission.

## Key User Flows

| Goal | Flow |
|---|---|
| Import questions | Questions → Import Questions → Paste Plain Text, JSON, or HTML → Choose subject and chapter → Preview parsed items and warnings → Import Questions → Return to Questions list |
| Browse a question | Questions → Subject → Chapter → Question card → Show Answer → Read answer and explanation → Next/Previous question |
| Take a mock test | Test → Mock Test → Select subject/chapter, number, and time → Start Test → Select answers and navigate → Submit confirmation → Result → Review Answers |
| Recover an exam | Reopen app while a draft test exists → “Resume your test?” sheet → Resume restores answers, position, configuration, and remaining time; Exit Test removes the saved draft after confirmation |
| Practice quickly | Test → Flash Test → Select an option → See correct/incorrect status, correct answer, and explanation → Next Question |
| Identify weak topics | Progress → Read overall summary → Inspect subject percentages and chapter labels → Open related Questions or start a Test |

## Visual Language

The app uses a light, paper-like base with soft blue as the academic brand signal. Cards have 16-point corners, thin borders, and restrained elevation. There are no gradients, mascots, ornamental illustrations, confetti, or persistent badges. The visual focus remains on readable question content and clear actions.

| Element | Color | Use |
|---|---|---|
| Canvas | `#F8FAFC` | Main screen background |
| Surface | `#FFFFFF` | Cards, sheets, and answer choices |
| Academic blue | `#2563EB` | Primary controls, active tab, links, and progress emphasis |
| Soft blue | `#EAF2FF` | Quiet highlighted cards and selection backgrounds |
| Ink | `#172033` | Headings and primary question text |
| Secondary ink | `#5E6A7D` | Metadata, labels, and instructions |
| Divider | `#E5EAF1` | Card outlines and dividers |
| Success | `#16805C` | Correct answer and strong performance |
| Caution | `#B7791F` | Average performance and parser attention states |
| Error | `#C43A3A` | Incorrect answer and destructive warnings |

Typography uses the system font for excellent Bangla and English rendering. Question text is at least 18 points with a relaxed 1.4 line height; body text is at least 15 points; labels use 12–13 points with high contrast. Metrics are communicated by short labels and numbers, never color alone.

## Motion, Haptics, and Feedback

Interactions use brief 80–250ms opacity or scale feedback. Cards reduce opacity slightly when pressed; primary actions scale to 0.97. Flash answers use one light success or error haptic on supported devices, with no mandatory sound. Progress bars animate only when their displayed value changes, while score disclosure uses a short count-up motion after test submission.

## Local Domain Model

All records are persisted on-device. Data mutations are performed as immutable state updates and written atomically after meaningful actions. A recoverable active-exam record is written after each answer selection and navigation event, and before the app transitions to the background.

| Entity | Key fields | Relationship / purpose |
|---|---|---|
| Subject | `id`, `name`, `createdAt` | Owns chapters |
| Chapter | `id`, `subjectId`, `name`, `createdAt` | Owns questions |
| Question | `id`, `subjectId`, `chapterId`, `serial`, `prompt`, `options`, `correctOption`, `explanation`, `createdAt` | Single-answer multiple-choice item |
| Import report | `sourceType`, `parsed`, `warnings`, `targetSubject`, `targetChapter` | Validates input before it can mutate question data |
| Test session | `id`, `mode`, `questionIds`, `answers`, `startedAt`, `completedAt`, `durationSeconds`, `configuration` | Stores completed mock tests and flash attempts |
| Attempt | `questionId`, `selectedOption`, `correct`, `answeredAt`, `mode` | Updates question, subject, and chapter performance |
| Active exam | `testId`, `questionIds`, `answers`, `currentIndex`, `remainingSeconds`, `configuration`, `savedAt` | Allows interrupted mock tests to resume safely |

## Empty and Error States

When there are no questions, Questions shows: “No questions yet. Import your first questions to get started.” followed by a clear Import Questions button. Progress shows: “Start your first test to see your progress.” Import failures use plain language, such as “Some questions need attention. Check the marked items and try again.” No raw parsing, JSON, or database error is shown to the learner.
