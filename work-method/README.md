# work-method

A Claude Code mod. Three parts: a register of locked facts, a check that runs on
output before it is written, and a set of working rules that enter every system
prompt.

## The essence

An assistant forgets. Not the conversation — the *standing* of what it was told.
A figure you measured yourself and a figure the assistant estimated look the same
once they are both in a document. From there the estimate gets defended and the
measurement gets questioned. This mod makes the difference structural instead of
remembered.

## Why

It was built from an audit of a long collaboration that went wrong in specific,
repeatable ways. Six independent agents were given the raw record of what
happened — facts only, no diagnosis — and asked to dissent from the framing.
Five of the six rejected the frame they were handed. What survived is here.

The finding they converged on: **the failure is not too much caution, it is
caution aimed the wrong way.** Overconfidence in the domain where the assistant
is weak, overcaution in the domain that belongs to the user.

## What

| | |
|---|---|
| **Fact register** | Every fact carries a source: *you measured it* · *you agreed it* · *someone told you* · *Claude computed it* · *estimate*. Locked facts enter every system prompt, so they survive a long session and a compaction. |
| **Output check** | A hook on every write to a permanent destination — a file, a project doc, memory. It reports hedged language that was never verified, and numbers with no row in the register. It reports; it does not block. |
| **Working rules** | A system-prompt section: calibration, the person-in-between test, the threshold for raising a risk, the authority map, run/stop behaviour, source admissibility, and what may be written to a permanent document. |

## How

```
/facts                      open the pane
/fact <value> | <source>    record and lock a fact
/check                      the six-point output check
```

`/fact 82 niche width | measured` · `/fact delivery 2500 | agreed`

Install the folder as a plugin, or drop it in your dev-mods directory and let
the session load it.

## Make it yours

The `RULES` constant in `hooks/register.tsx` is a starting point, not a
prescription. It is marked `EDIT THIS`. The architecture is the contribution —
source-tagged facts, a check before persistence, rules in the prompt rather than
in memory. The specific rules should be the ones your own work keeps needing.

MIT.

---

# work-method (עברית)

מוד ל-Claude Code. שלושה חלקים: רגיסטר של עובדות נעולות, בדיקה שרצה על הפלט לפני
שהוא נכתב, וכללי עבודה שנכנסים לכל system prompt.

## המהות

עוזר שוכח. לא את השיחה — את **המעמד** של מה שנמסר לו. מידה שמדדת בעצמך ומספר
שהעוזר העריך נראים זהים ברגע ששניהם במסמך. מכאן האומדן מקבל הגנה והמדידה מקבלת
פקפוק. המוד הופך את ההבחנה הזו למבנית במקום לזכורה.

## הלמה

הוא נבנה מתוך תחקיר על שיתוף פעולה ארוך שהשתבש בדרכים ספציפיות וחוזרות. שישה
סוכנים עצמאיים קיבלו את הרישום הגולמי — עובדות בלבד, בלי אבחנה — והונחו לחלוק על
המסגור. חמישה מתוך השישה דחו את המסגור שקיבלו. מה ששרד נמצא כאן.

הממצא שאליו התכנסו: **הכשל אינו עודף זהירות, אלא זהירות שמכוונת לכיוון הלא נכון.**
ביטחון עודף בתחום שבו העוזר חלש, זהירות עודפת בתחום ששייך למשתמש.

## המה

| | |
|---|---|
| **רגיסטר עובדות** | לכל עובדה מקור: *מדדת* · *סגרת* · *מישהו אמר לך* · *העוזר חישב* · *אומדן*. העובדות הנעולות נכנסות לכל system prompt, ולכן שורדות שיחה ארוכה ודחיסת הקשר. |
| **בדיקת פלט** | hook על כל כתיבה ליעד קבוע — קובץ, מסמך פרויקט, זיכרון. מדווח על ניסוח מהוסס שלא אומת, ועל מספרים שאין להם שורה ברגיסטר. מדווח, לא חוסם. |
| **כללי עבודה** | סעיף ב-system prompt: כיול, מבחן האדם שבאמצע, סף העלאת סיכון, מפת סמכות, ריצה ועצירה, קבילות מקור, ומה מותר לכתוב למסמך קבוע. |

## האיך

```
/facts                      פותח את הפאנל
/fact <ערך> | <מקור>         רושם ונועל עובדה
/check                      בדיקת הפלט, שש נקודות
```

## להתאים לעצמך

הקבוע `RULES` בקובץ `hooks/register.tsx` הוא נקודת מוצא, לא מרשם. הוא מסומן
`EDIT THIS`. התרומה היא הארכיטקטורה — עובדות עם תג מקור, בדיקה לפני התמדה, וכללים
בתוך הפרומפט במקום בזיכרון. הכללים עצמם צריכים להיות אלה שהעבודה שלך צריכה.
