# Habits App Backend Documentation

This document provides an overview of the Habits App backend API endpoints.

## Authentication

Most endpoints require authentication via a JSON Web Token (JWT). The token must be included in the `Authorization` header of the request.

## Users

### Register a new user

*   **POST** `/auth/register`

**Request body:**

```json
{
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "password123"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "User registered successfully",
    "user": {
        "name": "John Doe",
        "email": "johndoe@example.com",
        "_id": "60d5f2c5c5b5c5b5c5b5c5b5"
    }
}
```

### Login a user

*   **POST** `/auth/login`

**Request body:**

```json
{
    "email": "johndoe@example.com",
    "password": "password123"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "User logged successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "name": "John Doe",
        "email": "johndoe@example.com",
        "_id": "60d5f2c5c5b5c5b5c5b5c5b5"
    }
}
```

### Get all users

*   **GET** `/auth/users`

**Response:**

```json
{
    "status": "success",
    "users": [
        {
            "name": "John Doe",
            "email": "johndoe@example.com",
            "_id": "60d5f2c5c5b5c5b5c5b5c5b5"
        },
        {
            "name": "Jane Doe",
            "email": "janedoe@example.com",
            "_id": "60d5f2c5c5b5c5b5c5b5c5b6"
        }
    ]
}
```

### Get authenticated user

*   **GET** `/auth/user/me`

**Response:**

```json
{
    "status": "success",
    "user": {
        "name": "John Doe",
        "email": "johndoe@example.com",
        "_id": "60d5f2c5c5b5c5b5c5b5c5b5"
    }
}
```

### Get user by ID

*   **GET** `/auth/user/:id`

**Response:**

```json
{
    "status": "success",
    "user": {
        "name": "John Doe",
        "email": "johndoe@example.com",
        "_id": "60d5f2c5c5b5c5b5c5b5c5b5"
    }
}
```

### Edit user

*   **PUT** `/auth/user`

**Request body:**

```json
{
    "name": "John Doe Jr."
}
```

**Response:**

```json
{
    "status": "success",
    "message": "User updated successfully",
    "user": {
        "name": "John Doe Jr.",
        "email": "johndoe@example.com",
        "_id": "60d5f2c5c5b5c5b5c5b5c5b5"
    }
}
```

### Delete user

*   **DELETE** `/auth/user`

**Response:**

```json
{
    "status": "success",
    "message": "User deleted successfully"
}
```

## Competitions

### Create a new competition

*   **POST** `/competition`

**Request body:**

```json
{
    "name": "My Competition",
    "description": "A competition for my friends"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "Competition created successfully",
    "competition": {
        "name": "My Competition",
        "description": "A competition for my friends",
        "_id": "60d5f2c5c5b5c5b5c5b5c5b7"
    }
}
```

### Get all competitions

*   **GET** `/competition/all`

**Response:**

```json
{
    "status": "success",
    "message": "Competitions fetched successfully",
    "competitions": [
        {
            "name": "My Competition",
            "description": "A competition for my friends",
            "_id": "60d5f2c5c5b5c5b5c5b5c5b7"
        }
    ]
}
```

### Get competition by ID

*   **GET** `/competition/:id`

**Response:**

```json
{
    "status": "success",
    "message": "Competition fetched successfully",
    "competition": {
        "name": "My Competition",
        "description": "A competition for my friends",
        "_id": "60d5f2c5c5b5c5b5c5b5c5b7"
    }
}
```

### Update competition

*   **PUT** `/competition/:id`

**Request body:**

```json
{
    "name": "My Updated Competition"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "Competition updated successfully",
    "competition": {
        "name": "My Updated Competition",
        "description": "A competition for my friends",
        "_id": "60d5f2c5c5b5c5b5c5b5c5b7"
    }
}
```

### Delete competition

*   **DELETE** `/competition/:id`

**Response:**

```json
{
    "status": "success",
    "message": "Competition deleted successfully"
}
```

## Tournaments

### Create a new tournament

*   **POST** `/tournament`

**Request body:**

```json
{
    "name": "My Tournament",
    "competition": "60d5f2c5c5b5c5b5c5b5c5b7"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "Tournament created successfully",
    "tournament": {
        "name": "My Tournament",
        "competition": "60d5f2c5c5b5c5b5c5b5c5b7",
        "_id": "60d5f2c5c5b5c5b5c5b5c5b8"
    }
}
```

### Get all tournaments

*   **GET** `/tournament/all`

**Response:**

```json
{
    "status": "success",
    "message": "Tournaments retrieved succesfully",
    "tournaments": [
        {
            "name": "My Tournament",
            "competition": "60d5f2c5c5b5c5b5c5b5c5b7",
            "_id": "60d5f2c5c5b5c5b5c5b5c5b8"
        }
    ]
}
```

### Get tournament by ID

*   **GET** `/tournament/:id`

**Response:**

```json
{
    "status": "success",
    "message": "Tournament retrieved successfully",
    "tournament": {
        "name": "My Tournament",
        "competition": "60d5f2c5c5b5c5b5c5b5c5b7",
        "_id": "60d5f2c5c5b5c5b5c5b5c5b8"
    }
}
```

### Update tournament

*   **PUT** `/tournament/:id`

**Request body:**

```json
{
    "name": "My Updated Tournament"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "Tournament updated successfully",
    "tournament": {
        "name": "My Updated Tournament",
        "competition": "60d5f2c5c5b5c5b5c5b5c5b7",
        "_id": "60d5f2c5c5b5c5b5c5b5c5b8"
    }
}
```

### Delete tournament

*   **DELETE** `/tournament/:id`

**Response:**

```json
{
    "status": "success",
    "message": "Tournament deleted successfully"
}
```

## Participants

### Add a participant to a tournament

*   **POST** `/participante`

**Request body:**

```json
{
    "user": "60d5f2c5c5b5c5b5c5b5c5b5",
    "tournament": "60d5f2c5c5b5c5b5c5b5c5b8"
}
```

**Response:**

```json
{
    "participante": {
        "user": "60d5f2c5c5b5c5b5c5b5c5b5",
        "tournament": "60d5f2c5c5b5c5b5c5b5c5b8",
        "_id": "60d5f2c5c5b5c5b5c5b5c5b9"
    },
    "message": "Participante created successfully",
    "status": "success"
}
```

### Get all participants

*   **GET** `/participante/all`

**Response:**

```json
{
    "participantes": [
        {
            "user": "60d5f2c5c5b5c5b5c5b5c5b5",
            "tournament": "60d5f2c5c5b5c5b5c5b5c5b8",
            "_id": "60d5f2c5c5b5c5b5c5b5c5b9"
        }
    ],
    "message": "Participantes fetched successfully",
    "status": "success"
}
```

### Get participant by ID

*   **GET** `/participante/:id`

**Response:**

```json
{
    "participante": {
        "user": "60d5f2c5c5b5c5b5c5b5c5b5",
        "tournament": "60d5f2c5c5b5c5b5c5b5c5b8",
        "_id": "60d5f2c5c5b5c5b5c5b5c5b9"
    },
    "message": "Participante fetched successfully",
    "status": "success"
}
```

### Remove a participant from a tournament

*   **DELETE** `/participante/:participantId/:tournamentId`

**Response:**

```json
{
    "deletedParticipante": {
        "user": "60d5f2c5c5b5c5b5c5b5c5b5",
        "tournament": "60d5f2c5c5b5c5b5c5b5c5b8",
        "_id": "60d5f2c5c5b5c5b5c5b5c5b9"
    },
    "message": "Participante deleted successfully",
    "status": "success"
}
```

## Partidos

### Create a new partido

*   **POST** `/partido`

**Request body:**

```json
{
    "tournament": "60d5f2c5c5b5c5b5c5b5c5b8",
    "participant1": "60d5f2c5c5b5c5b5c5b5c5b9",
    "participant2": "60d5f2c5c5b5c5b5c5b5c5ba"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "Partido created successfully",
    "partido": {
        "tournament": "60d5f2c5c5b5c5b5c5b5c5b8",
        "participant1": "60d5f2c5c5b5c5b5c5b5c5b9",
        "participant2": "60d5f2c5c5b5c5b5c5b5c5ba",
        "_id": "60d5f2c5c5b5c5b5c5b5c5bb"
    }
}
```

### Get all partidos

*   **GET** `/partido/all`

**Response:**

```json
{
    "status": "success",
    "message": "Partidos retrieved successfully",
    "partidos": [
        {
            "tournament": "60d5f2c5c5b5c5b5c5b5c5b8",
            "participant1": "60d5f2c5c5b5c5b5c5b5c5b9",
            "participant2": "60d5f2c5c5b5c5b5c5b5c5ba",
            "_id": "60d5f2c5c5b5c5b5c5b5c5bb"
        }
    ]
}
```

### Get partido by ID

*   **GET** `/partido/:id`

**Response:**

```json
{
    "status": "success",
    "message": "Partido retrieved successfully",
    "partido": {
        "tournament": "60d5f2c5c5b5c5b5c5b5c5b8",
        "participant1": "60d5f2c5c5b5c5b5c5b5c5b9",
        "participant2": "60d5f2c5c5b5c5b5c5b5c5ba",
        "_id": "60d5f2c5c5b5c5b5c5b5c5bb"
    }
}
```

### Update partido

*   **PUT** `/partido/:id`

**Request body:**

```json
{
    "score1": 1,
    "score2": 0
}
```

**Response:**

```json
{
    "status": "success",
    "message": "Partido updated successfully",
    "partido": {
        "tournament": "60d5f2c5c5b5c5b5c5b5c5b8",
        "participant1": "60d5f2c5c5b5c5b5c5b5c5b9",
        "participant2": "60d5f2c5c5b5c5b5c5b5c5ba",
        "score1": 1,
        "score2": 0,
        "_id": "60d5f2c5c5b5c5b5c5b5c5bb"
    }
}
```

### Delete partido

*   **DELETE** `/partido/:id`

**Response:**

```json
{
    "status": "success",
    "message": "Partido deleted successfully"
}
```