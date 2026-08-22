OS : Ubuntu Server 22.04 LTS

```
                         ┌─────────────────────────┐
                         │        Internet         │
                         │   SMTP / IMAP / HTTPS   │
                         └────────────┬────────────┘
                                      │
             ┌────────────────────────┼────────────────────────┐
             │                        │                        │
     ┌───────▼────────┐      ┌────────▼────────┐      ┌────────▼────────┐
     │    Postfix     │      │     Dovecot     │      │      Nginx      │
     │  SMTP Server   │      │  IMAP / POP3    │      │  Reverse Proxy  │
     │                │      │                 │      │                 │
     │ - STARTTLS     │      │ - TLS / Auth    │      │ - HTTPS         │
     │ - OpenDKIM     │      │ - IMAP IDLE     │      │ - Gzip / Cache  │
     │ - Rspamd Milter│      │ - Quota 1G/User │      │ - Rate Limit    │
     └───────┬────────┘      └────────┬────────┘      └────────┬────────┘
             │                        │                        │
     ┌───────▼────────────────┐       │            ┌───────────┴───────────┐
     │ Mail Authentication    │       │            │                       │
     │                        │       │            │                       │
     │ OpenDKIM               │       │     ┌──────▼────────┐     ┌────────▼────────┐
     │ - Outgoing DKIM sign   │       │     │ Account/Admin │     │   Relay Mail    │
     │                        │       │     │ Service       │     │   Webmail UI    │
     │ Rspamd                 │       │     │               │     │                 │
     │ - SPF verification     │       │     │               │     │                 │
     │ - DKIM verification    │       │     └──────┬────────┘     └────────┬────────┘
     │ - DMARC verification   │       │            │                       │
     │ - Spam scoring         │       │            │                       │
     └────────┬───────────────┘       │            │                       │
              │                       │            │                       │
              └───────────┬───────────┘            │                       │
                          │                        │                       │
              ┌───────────▼───────────┐            │             ┌────────▼─────────┐
              │ Virtual Mail Store    │            │             │ Redis            │
              │ Maildir               │            │             │                  │
              │ vmail user            │            │             │ - Login Session  │
              └───────────▲───────────┘            │             │ - AES-256-GCM    │
                          │                        │             │   Credentials    │
                          │ DB lookup / Auth       │             └──────────────────┘
                          │                        │
                  ┌───────┴────────────────────────▼───────┐
                  │     Account / Registration Service    │
                  │                                        │
                  │ NestJS API                             │
                  │ - User Register / Login                │
                  │ - Admin User Management                │
                  │ - JWT Authentication                   │
                  │ - Dovecot-compatible Password Hashing  │
                  │                                        │
                  │ TypeORM                                │
                  │ MariaDB / SQLite (local)               │
                  └────────────────▲───────────────────────┘
                                   │
                         ┌─────────┴─────────┐
                         │       PM2         │
                         │ Process Manager   │
                         │                   │
                         │ - NestJS Start    │
                         │ - Restart / Log   │
                         └─────────▲─────────┘
                                   │
                    ┌──────────────┴─────────────────┐
                    │       GitHub Actions CI/CD     │
                    │                                │
                    │ - Test                         │
                    │ - Build                        │
                    │ - Deploy                       │
                    │ - Secrets                      │
                    └────────────────────────────────┘


```
