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

**Note:** Passwords are hashed using bcryptjs and cannot be decrypted.

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

## .gitignore

`users.json` should NOT be committed to Git.
Add to `.gitignore` if not already present.
