# work-method

A Claude Code mod: a register of facts with their sources, a check on output
before it is written, and a short set of working rules that enter every prompt.

## Why you want it

You tell Claude a figure you measured yourself. Later Claude estimates a
different one. In a document the two look identical — same font, same
confidence, no mark saying which is which. From there the estimate gets
defended and your measurement gets questioned. Nothing in a long conversation
keeps track of the difference, and the longer the work runs the more an
assistant drifts toward its own earlier guesses.

## What it does

- Records each fact with where it came from, and keeps the locked ones in front
  of Claude on every single turn — through a long session and past a compaction.
- Inspects anything headed for a file, a project document or memory, and flags
  hedged claims that were never verified, and numbers with no source.
- Holds Claude to a short set of working rules without you having to repeat
  them: who is the authority on what, when to ask instead of warning, and what
  may be written down as settled.

## How it does it

| | |
|---|---|
| `/fact <value> \| <source>` | writes a row — *measured* / *agreed* / *told to you* / *computed* / *estimate* |
| `/facts` | opens the register beside the chat |
| `/check` | the six-point check to run before output is presented |

Under it: a `prompt.compose` hook appends the rules and the locked facts to
every system prompt, so neither depends on memory. A `tool.call` hook inspects
writes to permanent destinations and reports. It never blocks — a mod that
blocks gets switched off within a day.

## Make it yours

The `RULES` constant in `hooks/register.tsx` is marked `EDIT THIS`. The
architecture is the contribution — source-tagged facts, a check before
persistence, rules in the prompt rather than in memory. The rules themselves
should be the ones your own work keeps needing.

Built from an audit of a long collaboration, by six independent agents given the
raw record and instructed to dissent. MIT.

---

# work-method (עברית)

מוד ל-Claude Code: רגיסטר של עובדות עם המקור שלהן, בדיקה על הפלט לפני שהוא נכתב,
וכללי עבודה קצרים שנכנסים לכל פרומפט.

## למה אתה צריך את זה

אתה מוסר לקלוד מידה שמדדת בעצמך. מאוחר יותר קלוד מעריך מספר אחר. במסמך השניים
נראים זהים — אותו גופן, אותו ביטחון, בלי שום סימן מי מהם מה. מכאן האומדן מקבל
הגנה והמדידה שלך מקבלת פקפוק. שום דבר בשיחה ארוכה לא עוקב אחרי ההבדל, וככל
שהעבודה נמשכת העוזר נוטה יותר לכיוון הניחושים הקודמים של עצמו.

## מה זה עושה

- רושם כל עובדה עם המקור שלה, ומחזיק את הנעולות מול העיניים של קלוד **בכל תור** —
  לאורך שיחה ארוכה וגם אחרי דחיסת הקשר.
- בודק כל דבר שבדרכו לקובץ, למסמך פרויקט או לזיכרון, ומסמן טענות מהוססות שלא
  אומתו ומספרים שאין להם מקור.
- מחזיק את קלוד בכללי עבודה קצרים בלי שתצטרך לחזור עליהם: מי הסמכות על מה, מתי
  לשאול במקום להזהיר, ומה מותר לכתוב כעובדה סגורה.

## איך זה עושה את זה

| | |
|---|---|
| `/fact <ערך> \| <מקור>` | רושם שורה — *מדדת* / *סגרת* / *אמרו לך* / *חושב* / *אומדן* |
| `/facts` | פותח את הרגיסטר לצד השיחה |
| `/check` | שש הבדיקות להרצה לפני שפלט מוצג |

מתחת: hook על `prompt.compose` מוסיף את הכללים ואת העובדות הנעולות לכל system
prompt, כך ששניהם אינם תלויים בזיכרון. hook על `tool.call` בודק כתיבות ליעדים
קבועים ומדווח. הוא אף פעם לא חוסם — מוד שחוסם מכובה תוך יום.

## להתאים לעצמך

הקבוע `RULES` בקובץ `hooks/register.tsx` מסומן `EDIT THIS`. התרומה היא
הארכיטקטורה — עובדות עם תג מקור, בדיקה לפני התמדה, וכללים בתוך הפרומפט במקום
בזיכרון. הכללים עצמם צריכים להיות אלה שהעבודה שלך צריכה.
