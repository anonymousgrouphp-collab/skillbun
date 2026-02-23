# 🐰 SkillBun – Hop into the Right Career

SkillBun is an AI-powered career counseling platform specifically engineered for BCA, BSc, and B.Tech tech students in India. It aims to cut through the noise of the vast tech landscape by providing personalized, actionable career roadmaps through an adaptive, gamified quiz interface.

This project was built as a capstone by Team SkillBun—a passionate team of five IITians: **Harsh, Rainee, Ravi, Harshit, and Aiman**.

---

## ✨ Key Features

*   **Master AI Counselor (Powered by Gemini):** Instead of a generic buzzfeed quiz, SkillBun utilizes a highly advanced system prompt that acts as an expert diagnostician. It actively probes the "6 Pillars of Tech" (Logic, Math, Empathy, Business, Infrastructure, Protection) to ensure a perfectly tailored match.
*   **Dynamic Adaptive Quizzing:** The AI dynamically asks between 10 and 18 questions based on the student's previous answers, only concluding the quiz when it reaches 95%+ confidence in its career recommendations.
*   **Actionable Roadmaps (via Roadmap.sh):** Every AI-recommended career generates a "🗺️ Dive Deeper" link that directly routes the student to the corresponding, verified curriculum on [roadmap.sh](https://roadmap.sh), turning counseling immediately into actionable learning.
*   **Extremely Fast Vanilla Frontend:** Built with blazing-fast Vanilla JavaScript and a beautiful, bespoke dark-theme CSS design system without heavy framework bloat.
*   **Secure Backend:** The Node/Express backend utilizes `helmet` for HTTP headers and strict `express-rate-limit` configurations to protect the Gemini API key from abuse.

---

## 🛠️ Tech Stack

*   **Frontend:** HTML5, Vanilla JavaScript, Custom CSS (Dark Theme, Glassmorphism)
*   **Backend:** Node.js, Express.js
*   **Artificial Intelligence:** Google Gemini Pro API
*   **Security:** Helmet, Express Rate Limit, CORS
*   **External Integration:** Roadmap.sh

---

## 🚀 Getting Started (Local Development)

To run the SkillBun project locally on your machine, follow these steps:

### Prerequisites
*   [Node.js](https://nodejs.org/) installed on your machine.
*   A valid [Google Gemini API Key](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/anonymousgrouphp-collab/skillbun.git
    cd skillbun
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    PORT=3000
    ```

4.  **Start the server:**
    To run the standard server:
    ```bash
    npm start
    ```
    *(Optional: If you have `nodemon` installed globally, you can run `npm run dev` for auto-reloading during active development).*

5.  **View the App:**
    Open your browser and navigate to `http://localhost:3000` to start hopping into your next career!

---

## 🛡️ Security & Performance Notes

The application includes pre-configured rate limiters to prevent API exhaustion:
*   **Global Traffic Limit:** 60 requests per minute per IP.
*   **Gemini API Limit (`/api/gemini`):** 25 requests per minute per IP (calibrated to perfectly allow a fast user to complete the 18-question quiz without being artificially blocked, while deterring actual bots).
