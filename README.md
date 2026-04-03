# AI-Powered Finance Tracker

A personal finance management application built with React that helps users track expenses, manage budgets, and gain AI-driven insights into their spending habits.

## Features

- **Transaction Management**: Add, edit, delete, and search transactions with category tagging and recurring expense support.
- **Budget Tracking**: Set monthly budgets and monitor spending against your targets in real time.
- **Analytics Dashboard**: Visualize spending patterns through interactive charts powered by Recharts.
- **AI Financial Advisor**: Get personalized spending insights and chat with an AI advisor using the Google Gemini API.
- **Authentication**: Secure user accounts with Firebase Authentication.
- **Cloud Sync**: All data is stored and synced via Firebase Firestore.

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 19, React Router, Framer Motion |
| Styling     | Vanilla CSS (glassmorphism design)  |
| State       | React Context API, Custom Hooks     |
| Forms       | React Hook Form, Yup validation     |
| Charts      | Recharts                           |
| Backend     | Firebase (Auth + Firestore)         |
| AI          | Google Gemini API                   |
| Build Tool  | Vite                               |

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Firebase project with Authentication and Firestore enabled
- A Google Gemini API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/snowhiteohno/Ai_Powered_Budget_Tracker-.git
   cd Ai_Powered_Budget_Tracker-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. Update Firebase configuration in `src/firebase/config.js` with your project credentials.

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
  components/       # Reusable UI components
    AIInsights/     # AI insights panel and chat interface
    BudgetCard/     # Budget display and progress
    Charts/         # Spending analytics charts
    Filters/        # Transaction filter controls
    Navbar/         # Navigation bar
    SearchBar/      # Transaction search
    TransactionCard/ # Individual transaction display
  context/          # React Context providers
  firebase/         # Firebase configuration
  hooks/            # Custom React hooks
  pages/            # Route-level page components
  services/         # API and Gemini service layer
  utils/            # Utility functions
```

## License

This project is open source and available under the MIT License.
