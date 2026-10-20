# Portfolio contact backend

The static portfolio, email link, and PDF download do not need Django. Django handles
email verification, sending contact messages to Gmail, and saving successful messages
in Admin > Contact messages.

## Local setup (PowerShell)

```powershell
cd backend
.\venv\Scripts\python.exe -m pip install -r requirements.txt
# Only copy if you do not have a .env yet:
Copy-Item .env.example .env
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py runserver
```

In another terminal, run `npm.cmd run dev` from `frontend`. Vite proxies `/api` to
Django at `http://127.0.0.1:8000`.

## Gmail credentials

Settings load `backend/.env` automatically. This file is ignored by Git.
Use `imariscalado@gmail.com` as `SMTP_USERNAME`, `SMTP_FROM_EMAIL`, and
`CONTACT_RECIPIENT_EMAIL`. Add your **Google App Password** as `SMTP_PASSWORD`.
Do not use your normal Gmail password or put credentials in frontend files.

Enable Google 2-Step Verification and create an App Password:
https://support.google.com/mail/answer/185833?hl=en

The example uses `smtp.gmail.com`, port 587, and TLS. The sender must be an account
you control. Google account or organization policies can restrict App Passwords.

## Contact flow

1. The visitor enters an email and clicks **Send verification code**.
2. Django emails a random six-digit code to that address. Codes expire in 10 minutes,
   are stored as hashes, allow five guesses, and can be used for one message.
3. The visitor enters the code, completes the form, and clicks **Send message**.
4. Django verifies the code and matching email, sends the message to your Gmail,
   and saves it for the admin inbox. SMTP failures return an error and allow retry.

The Gmail notification contains the visitor's name, verified email, topic, and message.
`Reply-To` points to the verified visitor. The actual From address is your configured
SMTP account; the backend cannot send as somebody else's Gmail account.

Email format or SMTP acceptance cannot prove an account exists. Receiving and entering
the code proves access to that inbox at that time. A nonexistent or inaccessible address
cannot complete verification and cannot submit a contact message. Delivery may still go
to spam, and verification does not establish the visitor's real-world identity.

Code requests are limited to one per minute per IP and email; successful submissions
are limited to one per 30 seconds per IP. For a multi-worker production deployment,
configure a shared Django cache (e.g. Redis), a persistent `DJANGO_SECRET_KEY`,
`DJANGO_DEBUG=false`, allowed hosts, trusted CSRF origins, HTTPS, and a production
database. Codes remain in the database across server restarts; periodically remove
expired `ContactVerification` rows. Route `/api/` to Django on the frontend origin.

Optional admin access:

```powershell
.\venv\Scripts\python.exe manage.py createsuperuser
```

Open `http://127.0.0.1:8000/admin/` to read saved messages.

## Resume and email links

Replace `frontend/public/resume.pdf` with your finished resume, keeping the filename.
The **Download Resume** link downloads this file directly. The current file is clearly
marked as a dummy example and contains placeholder qualifications.

The footer email uses `mailto:imariscalado@gmail.com`, opening the visitor's configured
email composer. Whether this opens Gmail depends on their browser/mail-handler settings.

## Checks

```powershell
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe manage.py test api
```

Tests use Django's in-memory email backend and do not send real emails.
