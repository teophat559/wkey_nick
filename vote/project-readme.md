# Contest User Frontend

A modern React application for contest platform users, built with React 18, Tailwind CSS, and modern best practices.

## 🎯 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with social login (Google/Facebook)
- **Contest Browsing**: Browse and search contests with advanced filtering
- **Contestant Voting**: Vote for favorite contestants and track voting history
- **User Dashboard**: Personal dashboard with activity tracking and statistics
- **Responsive Design**: Mobile-first responsive design with Tailwind CSS
- **Real-time Updates**: Live updates for votes and comments
- **News Section**: Browse articles and contest updates

### Key Components
- 🏠 **Home Page**: Featured contests, contestants, and news
- 🏆 **Contest Pages**: Detailed contest information and participant listings
- 👤 **Contestant Pages**: Individual contestant profiles with voting
- 📰 **News Section**: Articles and updates about contests
- 📊 **User Dashboard**: Personal activity and statistics
- ⚙️ **Profile Management**: Edit profile, change password, view activity

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd contest-user-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.template .env
   ```
   
   Edit `.env` with your actual values:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthModal.js    # Authentication modal
│   ├── Header.js       # Navigation header
│   ├── Footer.js       # Footer component
│   ├── Loading.js      # Loading components
│   └── ErrorBoundary.js # Error handling
├── contexts/           # React contexts
│   └── AuthContext.js  # Authentication context
├── hooks/              # Custom React hooks
│   └── index.js        # Custom hooks collection
├── pages/              # Page components
│   ├── HomePage.js     # Landing page
│   ├── ContestsPage.js # Contest listings
│   ├── ContestantPage.js # Contestant listings
│   ├── NewsPage.js     # News and articles
│   └── UserDashboard.js # User dashboard
├── services/           # API services
│   └── ApiService.js   # API communication layer
├── utils/              # Utility functions
│   └── index.js        # Helper functions
├── App.js              # Main app component
└── index.js            # Entry point
```

## 🔌 API Integration

### Backend Endpoints

The application connects to the following backend endpoints:

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile
- `GET /auth/google` - Google OAuth
- `GET /auth/facebook` - Facebook OAuth

#### Contests & Contestants
- `GET /contests` - List all contests
- `GET /contests/:id` - Get contest details
- `GET /contestants` - List all contestants
- `GET /contestants/:id` - Get contestant details
- `POST /contestants/:id/vote` - Vote for contestant

#### Content
- `GET /articles` - List articles
- `GET /articles/:id` - Get article details
- `POST /articles/:id/comments` - Add comment

### API Configuration

Update the API base URL in `src/config/api.js`:

```javascript
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  // ... other config
};
```

## 🎨 Customization

### Theming

Update Tailwind configuration in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      },
    },
  },
},
```

### Branding

1. **Logo**: Replace logo in `src/components/Header.js`
2. **App Name**: Update `REACT_APP_APP_NAME` in `.env`
3. **Colors**: Modify color palette in `tailwind.config.js`
4. **Fonts**: Import custom fonts in `src/index.css`

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure
- Unit tests for components
- Integration tests for user flows
- API service tests
- Custom hook tests

## 📦 Build & Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options

#### 1. Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables in Netlify dashboard

#### 2. Vercel
```bash
npm install -g vercel
vercel
```

#### 3. Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Development Guidelines

### Code Style
- Use functional components with hooks
- Follow component composition patterns
- Implement error boundaries for error handling
- Use TypeScript for type safety (optional)

### Performance Optimization
- Implement code splitting with React.lazy()
- Use React.memo for expensive components
- Optimize images with lazy loading
- Implement virtual scrolling for large lists

### Security Best Practices
- Sanitize user inputs
- Implement proper CORS handling
- Use HTTPS in production
- Store sensitive data securely

## 🔍 Troubleshooting

### Common Issues

#### CORS Errors
- Ensure backend allows frontend domain
- Check API URL configuration
- Verify proxy settings in package.json

#### OAuth Issues
- Verify redirect URLs in OAuth provider settings
- Check client ID and secret configuration
- Ensure HTTPS in production for OAuth

#### Build Issues
- Clear node_modules and reinstall
- Check for dependency conflicts
- Verify environment variables

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For technical support:
- Email: support@contestapp.vn
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 🗺️ Roadmap

### Upcoming Features
- [ ] Real-time notifications with WebSocket
- [ ] Progressive Web App (PWA) support
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] Advanced analytics dashboard

---

Built with ❤️ using React and modern web technologies.