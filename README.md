# Sutradhaar - Smart Unit Converter & Calculator

Sutradhaar is a modern, feature-rich web application that provides a seamless experience for unit conversions and calculations. Built with Next.js, TypeScript, and Tailwind CSS, it offers a clean, responsive, and user-friendly interface. The app includes a dashboard to track activity, a powerful unit converter with a wide range of categories, a scientific calculator, and persistent history tracking.

## ✨ Features

- **📊 Interactive Dashboard:** A central hub to view your usage statistics, including all-time conversions, today's conversions, and your activity streak.
- **⚡ Quick Access:** Easily navigate to the app's main features like the Converter, Calculator, History, and more, right from the dashboard.
- **🔄 Smart Unit Converter:**
  - Convert between a wide variety of units across categories like Length, Weight, Temperature, Area, and more.
  - Support for both International and local Indian units.
  - Swap "From" and "To" units with a single click.
  - View conversion comparisons across all units in a category.
- **🧮 Scientific Calculator:** A powerful calculator that supports basic arithmetic, scientific functions (sin, cos, tan, log), and keeps a record of your recent calculations.
- **📜 Persistent History:** Your conversion and calculation history is automatically saved to your browser's local storage, so you never lose track of your work.
- **👤 User Profile:** A dedicated profile page to view your stats, achievements, and manage personal information.
- **🎨 Modern & Responsive UI:** Built with ShadCN UI and Tailwind CSS for a beautiful, consistent, and responsive experience on any device.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **AI/Generative:** [Genkit](https://firebase.google.com/docs/genkit)
- **Icons:** [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **State Management:** React Context API

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <YOUR_REPOSITORY_URL>
    cd <YOUR_PROJECT_DIRECTORY>
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```sh
    npm run dev
    # or
    yarn dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## 📂 Project Structure

The project follows a standard Next.js App Router structure:

-   `src/app/`: Contains all the pages and routes for the application.
-   `src/components/`: Contains all the reusable React components, including UI components from ShadCN.
-   `src/context/`: Contains React context providers for managing global state (e.g., `HistoryContext`, `ProfileContext`).
-   `src/lib/`: Contains utility functions, constants, and library configurations (e.g., `units.ts`, `utils.ts`).
-   `src/ai/`: Contains AI-related logic, including Genkit flows.
-   `public/`: Contains static assets like images and fonts.

## ✍️ Author

-   **Aman Yadav** - *Developer*
