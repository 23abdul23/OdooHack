# QuickDesk - Help Desk Solution

A simple, easy-to-use help desk solution where users can raise support tickets, and support staff can manage and resolve them efficiently.

## Features

### User Management
- User registration and authentication
- Role-based access control (End Users, Support Agents, Admin)
- User profile management

### Ticket Management
- Create tickets with subject, description, category, and attachments
- Ticket status tracking (Open → In Progress → Resolved → Closed)
- Priority levels (Low, Medium, High, Urgent)
- File attachments support
- Upvote/downvote functionality
- Comments and threaded conversations

### Search & Filtering
- Filter by status (open/closed tickets)
- Filter by category
- Search functionality
- Sort by most replied tickets/recently modified
- View own tickets only

### Admin Features
- User management (roles, permissions)
- Category management
- System administration

## Tech Stack

### Frontend
- React.js (without TypeScript)
- CSS (separate files, no Tailwind)
- React Router for navigation
- Axios for API calls

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication
- Multer for file uploads
- bcryptjs for password hashing

## Project Structure

\`\`\`
quickdesk/
├── src/                    # Frontend React app
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   ├── styles/            # CSS files
│   └── utils/             # Utility functions
├── backend/               # Backend Express app
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   └── uploads/           # File uploads directory
└── public/                # Static files
\`\`\`

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Backend Setup
1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env` file with the following variables:
   \`\`\`
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/quickdesk
   JWT_SECRET=your_jwt_secret_key_here
   \`\`\`

4. Create uploads directory:
   \`\`\`bash
   mkdir uploads
   \`\`\`

5. Start the backend server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Frontend Setup
1. In the root directory, install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the React development server:
   \`\`\`bash
   npm start
   \`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default User Roles

### End Users
- Create and track their own tickets
- Add comments to their tickets
- Vote on tickets
- View ticket status and history

### Support Agents
- View and manage all tickets
- Update ticket status
- Assign tickets
- Add internal and public comments
- Create tickets on behalf of users

### Admin
- All agent permissions
- User management (create, modify roles, deactivate)
- Category management
- System configuration

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tickets
- `GET /api/tickets` - Get tickets with filtering
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get ticket details
- `PATCH /api/tickets/:id/status` - Update ticket status
- `POST /api/tickets/:id/comments` - Add comment
- `POST /api/tickets/:id/vote` - Vote on ticket

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `PATCH /api/users/:id/role` - Update user role (admin only)
- `PATCH /api/users/:id/deactivate` - Deactivate user (admin only)

## File Upload Support

The system supports file attachments with the following specifications:
- Maximum file size: 10MB per file
- Maximum files per ticket/comment: 5 files
- Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, TXT
- Files are stored in the `backend/uploads/` directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.