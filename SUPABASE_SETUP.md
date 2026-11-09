# Supabase setup

The site remains a static GitHub Pages app. Supabase Auth, Postgres RLS, and Edge Functions provide the trust boundary; GitHub Pages does not protect static files.

## 1. Configure Supabase Auth

1. Create a Supabase project and open **Authentication → Sign In / Providers**.
2. Keep email/password authentication enabled, but turn off public sign-ups (the dashboard may label this **Allow new users to sign up**).
3. Use the project's default password policy or stronger. Student passwords must be at least 12 characters in the StemChem admin workflow.
4. Copy the project URL and the **publishable/anon key** into `supabase-config.js`. This key is designed to be public. Never put the `service_role` key in this file or any browser code.
5. In **SQL Editor**, run `supabase/schema.sql`.

The schema keeps the RLS helper in a non-exposed `private` schema and revokes direct client execution of internal trigger and award functions. The `question_bank`, quiz-session, answer, and award tables intentionally have no client policies or grants; only the trusted Edge Functions can access them.

The login maps a student ID to an internal address of the form `studentid@students.chemgame.invalid`. This is not a real mailbox and is only an Auth login identifier. Auth users are created as confirmed accounts by the protected administrator Edge Function.

## What changed

| File | Purpose |
|---|---|
| `index.html` | Removes public registration, adds student login, profile password change, admin roster, and leaderboard surfaces. |
| `supabase-config.js` | Holds only the public Supabase URL and publishable/anon key. |
| `secure-app.js` | Configures Supabase Auth persistence, loads the signed-in student's own RLS-protected profile/progress, calls trusted functions, and subscribes to leaderboard changes. |
| `script.js` | Keeps the existing lessons/games UI, but loads progress from Supabase and submits quiz answers for server verification instead of writing XP to browser storage. |
| `supabase/schema.sql` | Creates profiles, progress, question bank, quiz sessions, protected XP-award RPCs, RLS policies, leaderboard synchronization, and Realtime publication. |
| `supabase/functions/admin/index.ts` | Provides server-authorized account creation, roster/progress listing, activation, password reset, and question-bank import. |
| `supabase/functions/quiz/index.ts` | Creates server-side quiz sessions, checks answers, enforces unit unlocks, awards each correct question at most once per student, and records completion. |
| `secure-app.css` | Styles the admin, password, and live leaderboard UI to match the existing interface. |

No Supabase Storage bucket is needed for the current app: it stores no student-uploaded files.

## 2. Create the first administrator

Use the Supabase Dashboard's Auth user-management screen to manually create one confirmed user with a unique ID such as `researcher01@students.chemgame.invalid` and a strong password. Copy that Auth user's UUID, then run this once in SQL Editor, replacing the UUID and ID:

```sql
insert into public.profiles (id, student_id, display_name, role, is_active)
values ('AUTH_USER_UUID', 'researcher01', 'Researcher', 'admin', true);
```

Do not create this account through a public sign-up flow. The application has no student sign-up control. The administrator's student ID follows the same 3–32 character format as student IDs.

## 3. Deploy trusted functions

Install the Supabase CLI and link this folder to the project. From the project root:

```text
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy admin
supabase functions deploy quiz
```

The functions use Supabase's server-side `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` environment values supplied to Edge Functions by Supabase. Never copy the service-role key into this repository, GitHub Pages, or `supabase-config.js`.

The `admin` function verifies the signed-in user's `profiles.role` and active status before every operation. It creates users, lists the roster and progress, activates/deactivates students (updating both the profile authorization flag and Auth ban), resets passwords, and imports the public chemistry word bank. The `quiz` function issues server-created quiz sessions and validates answers against the server-side question bank. RLS denies direct client writes to profiles, XP, and progress.

Sign in once as the administrator, open **Admin**, and click **Initialize / refresh game question bank**. Games will not award XP until this one-time import completes.

## 4. Hosting warning and deployment

**Do not use GitHub Pages to collect real participant passwords without first resolving GitHub's published restriction.** The [GitHub Pages usage limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) say Pages sites should not be used for sensitive transactions such as sending passwords. The code technically runs from Pages and sends credentials to Supabase over HTTPS, but this login flow handles passwords in a Pages-hosted site. For real research accounts, use a free static host whose current terms permit authentication, or get written approval before using Pages. The database and functions remain on Supabase either way.

If GitHub Pages is approved for the project, commit the static assets and deploy the repository root. Add only the Supabase project URL and public anon/publishable key to `supabase-config.js`. Configure the Supabase Auth URL allow-list for the Pages URL (including the repository subpath if applicable), then test a student login and administrator action after deployment.

Sessions persist across browser restarts and refresh their access tokens automatically. They are not permanent: students can log out, password resets affect access, and browser storage can be cleared. Students should log out on shared devices. The browser stores Supabase's refresh token, so protect the site from injected scripts and do not add untrusted third-party scripts.

## Security boundaries and limitations

- GitHub Pages is public static hosting. Visitors can download the HTML, JavaScript, game assets, and public chemistry word bank even if the login screen is shown. Student records and protected operations must remain behind Supabase Auth, RLS, and the Edge Functions; the interface alone is not access control.
- The project uses pseudonymous student IDs and assigned display names. Avoid collecting real email addresses or other personal data unless approved for the research and school privacy requirements.
- Students can read only their own profile and progress. XP, quiz answers, unit completions, and account roles are never accepted as authoritative browser writes. The leaderboard exposes only assigned display names and XP to active authenticated participants.
- The game word bank is public site content. Server-side validation prevents direct XP/score writes and repeat awards, but it cannot prevent students from inspecting the public chemistry answers.
- Administrator and quiz Edge Function CORS allow browser calls from a static site; CORS is not authorization. Each operation independently verifies the signed-in user and role.
- Static hosting has no private environment variables. The Supabase anon/publishable key is public by design; RLS must stay enabled. The service-role key is server-only.
- At the time this setup was checked, Supabase's [Free plan pricing page](https://supabase.com/pricing) listed a 500 MB database, 50,000 monthly active users, 5 GB egress, 5 GB cached egress, 1 GB file storage, up to 2 active projects, and pausing after 1 week of inactivity; automatic backups are not included. The [Edge Function limits](https://supabase.com/docs/guides/functions/limits) page lists 256 MB memory, 150 seconds wall-clock duration, and 2 seconds CPU time per request on Free. These values can change, so re-check before recruiting participants. Keep an independent research backup plan and export approved study data securely.
- Supabase's [Realtime limits](https://supabase.com/docs/guides/realtime/limits) currently list 200 concurrent connections and 100 messages/second for Free. This app opens one live leaderboard channel per signed-in browser; a sudden class-wide reconnect or burst can still hit limits.
- GitHub Pages documents a 1 GB published-site limit, a soft 100 GB/month bandwidth limit, and a soft 10 builds/hour limit; rate limiting may also apply. See the [GitHub Pages usage limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).
- Supabase free-tier service availability is not a guaranteed production SLA. For real student research, follow school/guardian consent, retention, incident-response, and applicable privacy rules before collecting participant data.
