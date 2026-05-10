# User Data Storage

This directory stores user data for the authentication system.

## users.json

Auto-generated when the first user registers.

**Example:**
```json
[
  {
    "id": "1715388923456",
    "email": "user@example.com",
    "username": "john_doe",
    "password": "$2a$10$...",
    "createdAt": "2024-05-10T12:15:23.456Z"
  }
]
```

**Note:** Passwords are hashed using Node's built-in PBKDF2 password hashing and cannot be decrypted.

## For Production

Replace file-based storage with:
- **MongoDB** - NoSQL database
- **PostgreSQL** - Relational database
- **Firebase** - Cloud database
- **DynamoDB** - AWS serverless database

Each provides better scalability, security, and backup features.

## Development

In development, this JSON file stores users locally for testing.
It's safe to delete and regenerate by registering new users.

On Vercel, serverless functions cannot write to this repository folder. The app writes demo data to Vercel's temporary `/tmp` storage instead, which avoids deployment errors but is not a permanent production database.

## posts.json

Auto-generated when signed-in users create posts or comments. It stores post text, optional image data, comment text, author metadata, and timestamps for the local demo feed.

## .gitignore

`users.json` should NOT be committed to Git.
Add to `.gitignore` if not already present.
