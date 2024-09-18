# user-registration in JavaScript

## Task description

Creation of REST API enabling:

- 👉 user registration in the system

- 👉 user login (using JWT token)

- 👉 user editing

- 👉 user deletion

- 👉 activation link sent by email after registration

This task solution creates the so-called **CRUD** and secures the application (**authentication** + **authorization**).

This task solution translates **the business description** into **a technical solution**.

## Application architecture

1. Frontend (React with TypeScript and Tailwind CSS):

- Components:

  - Register: Handles user registration
  - Login: Handles user login
  - Profile: Displays and allows editing of user profile
  - ActivateAccount: Handles account activation

- Uses React Router for navigation
- Axios for API calls
- JWT token stored in localStorage for authentication

2. Backend (Node.js with Express):

- RESTful API endpoints:

  - POST /api/register: User registration
  - POST /api/login: User login
  - POST /api/activate: Account activation
  - PUT /api/user: User profile update (protected route)
  - DELETE /api/user: User account deletion (protected route)

- MongoDB for data storage
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for sending activation emails

3. Database (MongoDB):

- User model:

  - email: String
  - password: String (hashed)
  - isActive: Boolean
  - activationToken: String
