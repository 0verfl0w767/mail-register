OS : Ubuntu Server 22.04 LTS

```
            ┌─────────────────────────┐
            │        Internet         │
            │   SMTP / IMAP / HTTPS   │
            └────────────┬────────────┘
                         │
          ┌──────────────┼───────────────┐
          │              │               │
  ┌───────▼───────┐ ┌────▼─────────┐ ┌───▼─────────┐
  │    Postfix    │ │   Dovecot    │ │    Nginx    │
  │  SMTP Server  │ │  IMAP / POP3 │ │  Web Server │
  │ - STARTTLS    │ │ - TLS        │ │ - HTTPS     │
  │ - OpenDKIM    │ │ - Auth       │ │ - PHP 8.5   │
  │ - SPF/DMARC   │ │              │ │ - Roundcube │
  └───────┬───────┘ └───────┬──────┘ └─────┬───────┘
          │                 │              │
          │                 │              │
          └──────┬──────────┴───────┬──────┘
                 │                  │
    ┌────────────▼──────────┐   ┌───▼──────────────────┐
    │ Virtual Mail Store    │   │ Web Mail UI          │
    │ Maildir (vmail user)  │   │ Roundcube (1.7 RC2)  │
    └───────────────────────┘   └──────────────────────┘
                 ▲
                 │  (DB lookup / Auth)
                 │
        ┌────────────────────────────────────┐
        │        GitHub Actions (CI/CD)      │
        │                                    │
        │  - Build                           │
        │  - Deploy                          │
        │  - Secrets                         │
        └───────────────┬────────────────────┘
                        │
                        │ (Deploy)
              ┌─────────▼─────────┐
              │       PM2         │
              │  Process Manager  │
              │ - Start / Log     │
              └─────────┬─────────┘
                        │
     ┌──────────────────▼───────────────────┐
     │    Account / Registration Service    │
     │                                      │
     │  NestJS API                          │
     │  - User Register / Login             │
     │  - Password Hashing                  │
     │                                      │
     │  TypeORM                             │
     │  MariaDB                             │
     └──────────────────────────────────────┘


```
