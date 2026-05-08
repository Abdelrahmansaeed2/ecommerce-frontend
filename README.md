# LUXE - E-commerce Platform


LUXE is a modern and sophisticated e-commerce frontend application built with Angular. It features a dedicated Node.js backend for payment processing and an innovative AI-powered shopping assistant to deliver a premium user experience. The project is designed with a decoupled architecture, making it scalable and easy to maintain.

##  Features

-   ** AI Shopping Assistant**: An intelligent chatbot powered by the Groq LLaMA 3.3 model that provides product recommendations, styling advice, and can interact with the UI to add items to the cart.
-   ** User Authentication**: A complete authentication system with signup and login. For development, it uses a client-side JWT and hashing approach with a mock API.
-   ** Profile Management**: Authenticated users can view their order history and manage their personal information.
-   ** Payment Integration**: A dedicated Node.js/Express server handles payment initiation with the **Paymob** payment gateway.
-   ** Mock API Backend**: Utilizes `json-server` to serve a fully functional mock REST API for products, users, and cart data from a simple `db.json` file.
-   ** Dynamic & Responsive UI**: A modern interface built with Angular 21, Signals, and RxJS for a reactive and seamless user experience, styled with Bootstrap.

##  Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Angular | A powerful framework for building dynamic single-page applications. |
| | TypeScript | Superset of JavaScript that adds static types. |
| | Bootstrap | CSS framework for responsive, mobile-first front-end development. |
| | RxJS | Library for reactive programming using Observables. |
| **Backend** | Node.js | JavaScript runtime for the payment processing server. |
| | Express.js | Minimalist web framework for the Node.js backend. |
| **Database** | JSON Server | A full fake REST API for rapid prototyping, using a `db.json` file. |
| **APIs** | Groq API | Powers the AI chatbot with high-speed LLM inference. |
| | Paymob API | Used for payment gateway integration. |
| **Testing** | Vitest | A blazing fast unit-test framework powered by Vite. |
| **Dev Tools** | Angular CLI | Command-line interface for Angular. |
| | Prettier | An opinionated code formatter. |
| | Concurrently | Runs multiple commands concurrently. |

##  Project Structure

The project is organized into a clean and logical structure. Here are the key directories and files:

```
ecommerce-frontend/
├── Backend/
│   └── server.js         # Node.js/Express server for Paymob payment integration
├── public/               # Static assets for the Angular app
├── src/
│   ├── app/
│   │   ├── components/   # Reusable Angular components (Profile, Chatbot, etc.)
│   │   ├── models/       # TypeScript models (User, Product)
│   │   ├── services/     # Angular services (Auth, AI, Cart, Product)
│   │   └── app.routes.ts # Main application routing
│   ├── main.ts           # Main entry point for the Angular application
│   └── styles.css        # Global styles
├── .env                  # (You need to create this) Environment variables
├── angular.json          # Angular CLI configuration
├── db.json               # Database file for json-server
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript compiler configuration
```

##  Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

-   Node.js (v18 or later recommended)
-   Yarn package manager

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Abdelrahmansaeed2/ecommerce-frontend.git
    cd ecommerce-frontend
    ```

2.  **Install dependencies:**
    ```bash
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following variables. These are required for the payment backend to function.

    ```env
    # Paymob API Credentials
    PAYMOB_API_KEY="YOUR_PAYMOB_API_KEY"
    PAYMOB_INTEGRATION_ID="YOUR_PAYMOB_INTEGRATION_ID"
    PAYMOB_IFRAME_ID="YOUR_PAYMOB_IFRAME_ID"

    # Groq API Key (for the AI Chatbot)
    GROQ_API_KEY="YOUR_GROQ_API_KEY"

    # Optional: Port for the backend server
    PORT=3001
    ```

    > **Security Note:** You also need to replace the placeholder API key in `src/app/services/ai.service.ts` with your actual Groq key or implement a build process to inject it securely.

### Running the Application

This project requires three separate processes to run: the Angular frontend, the `json-server` mock API, and the Express payment server.

A `dev` script has been configured to run all three concurrently with a single command:

```bash
yarn dev
```

Once running, you can access the application at `http://localhost:4200`.

##  Available Scripts

The following scripts are available in `package.json`:

| Script | Description |
| :--- | :--- |
| `yarn start` | Starts the Angular development server on `http://localhost:4200`. |
| `yarn dev` | Starts all required services concurrently (Angular, JSON Server, Payment Backend). |
| `yarn build` | Compiles the Angular application for production. |
| `yarn test` | Runs the unit tests using Vitest. |
| `yarn json-server` | Starts the mock REST API on `http://localhost:3000`. |

##  Authentication

The authentication flow is designed for development and demonstration purposes using the mock `json-server` backend.

1.  **Signup/Login**: The user provides their credentials.
2.  **Client-Side Hashing**: The password is hashed on the client using `bcryptjs` before being sent to the mock API.
3.  **Client-Side JWT**: Upon successful authentication, a JWT is generated on the client using `jsonwebtoken`.
4.  **Token Storage**: The generated token is stored in `localStorage` and used for subsequent requests.

> **Important**: In a production environment, password hashing and JWT generation **must** be handled on a secure backend server, not on the client.

##  API Documentation

### Mock Data API (`json-server`)

The `json-server` provides a full RESTful API based on the `db.json` file.

-   `GET /products`: Get all products.
-   `GET /products/:id`: Get a single product.
-   `GET /users`: Get all users.
-   `POST /users`: Create a new user.
-   `GET /cart?email=<user_email>`: Get the cart for a specific user.
-   `GET /payments?email=<user_email>`: Get payment history for a user.

### Payment API (`Backend/server.js`)

This is a microservice that handles payment gateway logic.

#### `POST /payment/initiate`

Initiates a payment with Paymob and returns a checkout URL.

-   **Request Body:**
    ```json
    {
      "amountEGP": 150.50,
      "billing": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+201000000000"
      }
    }
    ```
-   **Success Response:**
    ```json
    {
      "checkoutUrl": "https://accept.paymob.com/api/acceptance/iframes/..."
    }
    ```

##  Architecture

The project follows a decoupled, three-part architecture:

1.  **Angular Frontend**: A Single-Page Application (SPA) that handles all user interactions and presentation logic. It communicates with the two backend services via HTTP requests.
2.  **`json-server` Mock API**: Acts as the primary data source during development, providing a quick and easy way to manage products, users, and cart data without needing a real database.
3.  **Node.js Payment Service**: An independent microservice responsible for securely communicating with the external Paymob payment gateway, keeping sensitive API keys off the frontend.

This separation of concerns makes the application easier to develop, test, and scale.

##  Testing

Unit tests are written with Vitest. To execute the test suite, run the following command:

```bash
yarn test
```

##  Security Considerations

While this project is functional, several security practices should be implemented before considering a production deployment:

-   **API Keys**: The Groq API key is currently a placeholder in `ai.service.ts`. It should be loaded securely from environment variables and never exposed on the client-side. Ideally, the frontend should call a dedicated backend endpoint that then calls the Groq API.
-   **Authentication Logic**: As mentioned, all authentication logic (password hashing, JWT generation/validation) must be moved to a secure, dedicated backend server.
-   **Environment Variables**: Ensure the `.env` file is included in `.gitignore` and never committed to version control.

##  Contributing

Contributions are welcome! If you have suggestions for improvements, please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
