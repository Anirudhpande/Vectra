
# Vectra

**Bring your own API keys. Chat with any model. Keep your context.**

Vectra is a BYOK (Bring Your Own Key) AI chat application that brings multiple AI providers under one roof.

Connect your own API keys from OpenAI, Anthropic, Gemini, and Groq, choose the model you want, and start chatting. Vectra handles conversation history, context management, and model-specific token budgeting so you can focus on the conversation rather than the infrastructure behind it.

Your keys. Your bill. No markup.

> **Status:** Pre-launch, under active development.
>
> **Target Launch:** January 1, 2027.

<!-- Add a screenshot or short demo GIF here. -->
<!-- ![Vectra Demo](docs/demo.gif) -->

---

## Features

### Multi-Provider Support
- OpenAI, Anthropic, Gemini, and Groq behind a common provider interface.
- Switch between different providers and models.
- Retrieve models accessible through your registered API keys.
- Provider-specific integrations abstracted behind a unified chat architecture.

### Bring Your Own Key (BYOK)
- Connect your own API keys.
- Manage credentials independently for each provider.
- Select which registered key and model to use.
- Pay AI providers directly without additional API markups.

### Conversation Management
- Create and manage multiple conversations.
- Persistent chat history.
- Messages and conversations scoped to their respective owners.
- Retrieve previous conversations and continue where you left off.

### Automatic Context Management
- Model-specific context window management.
- Token estimation and context budgeting.
- Automatic conversation summarization (compaction).
- Older conversation turns are summarized while recent messages are preserved.
- Designed to maintain conversation continuity across different models.

### Authentication and Security
- Google and GitHub OAuth authentication.
- Cookie-based session management.
- CSRF protection for state-changing requests.
- User-scoped resource access.
- Dedicated API credential management and encryption layer.

---

## Roadmap

Vectra is actively evolving. The following features are planned for upcoming releases.

- [ ] **Automatic Provider Fallback:** Automatically switch to another available key or model when a provider encounters quota limits or rate restrictions.
- [ ] **Conversation Import:** Import shared ChatGPT or Claude conversation links and continue those conversations using any supported model.
- [ ] **Multimodal Chat:** Support images, documents, audio, and other file attachments.
- [ ] **Free-Tier Onboarding:** Guides for obtaining free Gemini and Groq API keys, along with a capped trial experience.
- [ ] **Usage and Cost Tracking:** Track token consumption and estimated costs across providers.
- [ ] **Pro Subscription:** Introduce paid plans and payment integration.
- [ ] **Improved Context Management:** Further optimize context preservation, summarization, and cross-model conversation continuity.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 4 |
| Security | Spring Security, OAuth2 Client |
| Frontend | React 19, Vite, React Router |
| Database | MongoDB |
| Data Access | Spring Data MongoDB |
| Authentication | Google and GitHub OAuth2 |
| Session Management | Cookie-based sessions, CSRF protection |
| Build Tool | Maven |
| Package Management | npm |

---

## Architecture

Vectra follows a modular provider architecture designed to make integrating new AI providers straightforward.

The application consists of four major components:

1. **Authentication Layer:** Handles user identity, OAuth authentication, and session management.
2. **Credential Management Layer:** Manages user-provided API keys and provider-specific credentials.
3. **Provider Integration Layer:** Provides a unified interface for communicating with different AI providers.
4. **Chat and Context Layer:** Handles conversations, message persistence, token estimation, context budgeting, and conversation compaction.

### Request Lifecycle

```text
                  USER
                    |
                    v
              React Frontend
                    |
                    v
              Spring Boot API
                    |
          +---------+---------+
          |                   |
          v                   v
    Authentication      Authorization
          |                   |
          +---------+---------+
                    |
                    v
            Conversation Service
                    |
                    v
              Context Manager
                    |
          +---------+---------+
          |         |         |
          v         v         v
      Token     Context   Conversation
    Estimation  Budgeting  Compaction
                    |
                    v
           Provider Integration
                    |
          +---------+---------+---------+
          |         |         |         |
          v         v         v         v
        OpenAI  Anthropic  Gemini     Groq
          |         |         |         |
          +---------+---------+---------+
                    |
                    v
              AI Provider API
                    |
                    v
             Response Processing
                    |
                    v
             MongoDB Persistence
                    |
                    v
              React Frontend
```

The provider integration layer abstracts provider-specific API communication, allowing the chat system to work with multiple providers through a common interface.

---

## How Context Management Works

Every AI model has a different context window and token limit.

Vectra manages this by estimating the number of tokens used in a conversation and comparing it against the context budget of the selected model.

When a conversation approaches its context limit:

1. The context manager calculates the available token budget.
2. Older conversation turns are selected for compaction.
3. A summary is generated to preserve important information from those turns.
4. Recent messages are retained verbatim.
5. The updated context is prepared for the next model request.

This allows conversations to continue beyond the practical limits of a model's context window.

It also makes switching between models with different context capacities more practical.

---

## Security Philosophy

Vectra follows a BYOK model: users bring their own API credentials and maintain their own relationships with AI providers.

The application is designed around the following principles:

- **User Isolation:** Credentials and conversations are scoped to their respective owners.
- **Credential Protection:** API keys are handled through a dedicated credential-management and encryption layer.
- **Session Security:** Authentication uses cookie-based sessions with CSRF protection.
- **No Shared API Billing:** Users connect their own provider accounts and pay providers directly.
- **Minimal Exposure:** Provider credentials should never be exposed to the frontend or included in application logs.

Security is an ongoing development priority, particularly around credential storage, encryption, key handling, and provider request execution.

---

## Project Structure

```text
Vectra/
│
├── demo/                          # Spring Boot Backend
│   └── src/main/java/com/example/demo/
│       │
│       ├── Auth/                  # Authentication and user resolution
│       │
│       ├── Chat/                  # Chat service and context management
│       │   ├── Context Manager
│       │   ├── Compaction
│       │   └── Token Estimation
│       │
│       ├── Control/               # REST API controllers
│       │
│       ├── Model/                 # Entities and DTOs
│       │
│       ├── Repository/            # MongoDB repositories
│       │
│       ├── Security/              # Security configuration and encryption
│       │
│       └── Service/               # Business logic and provider services
│           └── Providers/
│               ├── OpenAI
│               ├── Anthropic
│               ├── Gemini
│               └── Groq
│
└── frontend/                      # React + Vite Frontend
    └── src/
        │
        ├── Pages/                 # Application pages
        │   ├── Home
        │   ├── Login
        │   ├── Chat
        │   ├── Credentials
        │   ├── Models
        │   └── Account
        │
        ├── Components/            # Reusable UI components
        │
        └── context/               # Authentication context
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Java 21
- Node.js 18+ and npm
- MongoDB (local installation or MongoDB Atlas)
- Maven (optional, Maven Wrapper is included)
- Google and/or GitHub OAuth application credentials

### 1. Clone the Repository

```bash
git clone https://github.com/Anirudhpande/Vectra.git
cd Vectra
```

### 2. Configure the Backend

The backend reads its configuration and secrets from environment variables.

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |

For local development, you can alternatively configure overrides in:

```text
demo/src/main/resources/application-local.properties
```

This file is gitignored and should not be committed.

Configure your OAuth redirect URIs:

**Google:**
```text
http://localhost:8080/login/oauth2/code/google
```

**GitHub:**
```text
http://localhost:8080/login/oauth2/code/github
```

> Never commit `.env` files, `application-local.properties`, real API keys, or other secrets. Use placeholder values in example configuration files.

### 3. Run the Backend

```bash
cd demo
./mvnw spring-boot:run
```

The backend starts at:

```text
http://localhost:8080
```

### 4. Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at:

```text
http://localhost:5173
```

To configure a different backend URL, set:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 5. Run Tests

```bash
cd demo
./mvnw test
```

---

## API Overview

All endpoints require an authenticated session except public routes.

State-changing requests require a CSRF token obtained from `GET /api/csrf`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/me` | Retrieve current user |
| `GET` | `/api/me/account` | Retrieve account details |
| `GET` | `/api/csrf` | Retrieve CSRF token |
| `POST` | `/api/credentials` | Register provider API key |
| `GET` | `/api/credentials` | List registered credentials |
| `GET` | `/api/credentials/{id}/models` | List models available for a key |
| `DELETE` | `/api/credentials/{id}` | Delete a credential |
| `POST` | `/api/chats` | Send a message or create a conversation |
| `GET` | `/api/chats` | List conversations |
| `GET` | `/api/chats/{conversationId}/messages` | Retrieve conversation messages |
| `DELETE` | `/api/chats/{conversationId}` | Delete a conversation |

Resources are always retrieved using both the resource ID and its owner.

This ensures that one user cannot access another user's credentials or conversations.

---

## Design Principles

Vectra is being built around five fundamental ideas:

- **Provider Independence:** Switching between AI providers should not require switching applications.
- **User Ownership:** Users control their API credentials and provider selection.
- **Context Continuity:** Conversations should remain useful even when context windows differ between models.
- **Extensibility:** Adding another provider should require minimal changes to the existing architecture.
- **Transparency:** Users should have visibility into their API usage and costs.

---

## Current Development Status

Vectra is under active development.

| Component | Status |
|---|---|
| Google OAuth | Implemented |
| GitHub OAuth | Implemented |
| Authentication and Authorization | Implemented |
| Provider Credential Management | Implemented |
| Multi-Provider Integration | Implemented |
| Model Selection | Implemented |
| Conversation History | Implemented |
| Context Management | Implemented |
| Automatic Conversation Compaction | Implemented |
| Multimodal Chat | Planned |
| Conversation Import | Planned |
| Automatic Provider Fallback | Planned |
| Usage and Cost Analytics | Planned |
| Subscription and Billing | Planned |

*Development status is subject to change as new features are implemented and tested.*

---

## Launch

Vectra is targeting **January 1, 2027** for its public launch.

The primary focus before launch is:

- Completing the remaining core chat functionality.
- Improving reliability across provider integrations.
- Strengthening credential security.
- Implementing automatic provider fallback.
- Introducing multimodal capabilities.
- Improving onboarding and user experience.
- Introducing usage visibility and cost analytics.

---

## Contributing

Vectra is currently an early-stage solo project.

Feedback, bug reports, and feature suggestions are welcome.

If you find a bug or have an improvement in mind, feel free to open an issue.

For security vulnerabilities, please report them privately instead of disclosing them through public issues.

---

## License

TBD.

A license will be added before the public release.

---

<p align="center">
  **Vectra**
  <br/>
  Bring your own keys. Keep your context.
  <br/><br/>
  Built with curiosity, Java, React, and a lot of coffee.
</p>
