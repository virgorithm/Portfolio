# Contact messages

The form posts to Django and saves messages in **Admin → Contact messages**.
Visitors do not need an email app. SMTP notifications are optional; a failed
notification does not discard a saved message.

From the backend directory in PowerShell:

```powershell
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py createsuperuser
.\venv\Scripts\python.exe manage.py runserver
```

Run the frontend with `npm.cmd run dev`. Vite proxies `/api` to port 8000.
Open `http://127.0.0.1:8000/admin/` to read messages with your admin account.

For email notifications, set the following environment variables **in the same
backend terminal before starting Django** (these are examples, not credentials):

```powershell
$env:SMTP_HOST = 'smtp.gmail.com'
$env:SMTP_PORT = '587'
$env:SMTP_USERNAME = 'your-sender@gmail.com'
$env:SMTP_PASSWORD = '<your-provider-SMTP-credential>'
$env:SMTP_FROM_EMAIL = 'your-sender@gmail.com'
$env:CONTACT_RECIPIENT_EMAIL = 'imariscalado@gmail.com'
```

`SMTP_USE_TLS` defaults to `true`; `SMTP_USE_SSL` defaults to `false`.
Keep credentials on the backend; never put them in frontend code or commit them.
Settings read environment variables, not `.env` files.
SMTP configuration follows [Django's mailer settings](https://docs.djangoproject.com/en/6.1/ref/settings/#mailers).

Set a persistent `DJANGO_SECRET_KEY` environment variable for deployed servers;
local development generates a temporary key when it is unset.

For production, route `/api/` to Django on the frontend's origin (Vite's proxy
only runs in development), configure the deployment's allowed hosts, trusted
CSRF origins, database, and SMTP environment. The default rate limit uses a
process-local cache; use a shared cache when running multiple server workers.
