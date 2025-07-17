# StudyForge: AI-Powered Personal Study Assistant

StudyForge is an all-in-one platform designed to elevate your learning experience. Built with Next.js, React, and Genkit, it combines essential study tools with cutting-edge AI to help you study smarter, not harder. From smart note-taking to AI-powered summaries, StudyForge provides everything you need to organize your studies, boost your focus, and track your progress.

## Core Features

-   **Landing Page**: A clean and modern landing page that introduces the app and its features.
-   **User Authentication**: Secure signup and login functionality for personalized user accounts.
-   **Study Zone Dashboard**: A central hub providing quick access to all study tools via a modern card-based layout.
-   **Note-Taking**: An intuitive rich-text editor for creating, editing, and managing study notes.
-   **To-Do Lists**: A tool to manage daily tasks and a weekly planner to keep your schedule organized.
-   **Pomodoro Timer**: An integrated Pomodoro timer to enhance focus with structured study sessions and breaks.
-   **AI Summarizer**: A powerful tool powered by the Gemini API to summarize long texts or PDF documents.
-   **Analytics Dashboard**: A visual representation of your study habits, tracking notes created, tasks completed, and Pomodoro sessions.

## Tech Stack

-   **Framework**: Next.js (App Router)
-   **UI**: React, Tailwind CSS, ShadCN UI
-   **AI**: Google AI (Gemini) via Genkit
-   **Database**: MongoDB
-   **Authentication**: JWT-based sessions

## Getting Started

To run the project locally:

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:9002](http://localhost:9002) in your browser.

## File Structure

Here is an overview of the project structure:

```
/
├── src/
│   ├── app/
│   │   ├── (app)/                # Authenticated routes
│   │   │   ├── study-zone/       # Main dashboard and feature pages
│   │   │   └── ...
│   │   ├── (auth)/               # Login and signup pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Landing page
│   ├── components/
│   │   ├── ui/                   # ShadCN UI components
│   │   ├── auth/                 # Auth-related components (forms)
│   │   └── study-zone/           # Components for different study features
│   ├── lib/
│   │   ├── actions/              # Server Actions for backend logic
│   │   ├── models/               # Mongoose schemas for the database
│   │   ├── db.ts                 # Database connection logic
│   │   └── session.ts            # Session management (JWT)
│   └── ai/
│       ├── flows/                # Genkit AI flows
│       └── genkit.ts             # Genkit configuration
├── public/                       # Static assets
└── ...                           # Configuration files
```
