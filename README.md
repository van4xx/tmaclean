# BotClean - Telegram Mini App for Cleaning Service

A modern web application integrated with Telegram Mini App API for a subscription-based apartment cleaning service.

## Features

- **Telegram Authentication**: Automatic authentication using Telegram user data
- **Subscription Management**: Choose a plan, view current subscription information
- **Cleaning Scheduling**: Interactive date and time selection for cleaning
- **Cleaning Management**: View, reschedule, and cancel scheduled cleanings
- **User Profile**: View and edit personal information
- **Responsive Design**: Optimized for mobile devices and Telegram Mini App

## Technologies

- **React**: User interface library
- **TypeScript**: Strong typing for reliable code
- **React Router**: Routing in the application
- **Axios**: HTTP client for working with API
- **Framer Motion**: Animations for improved UX
- **SCSS**: Styling using a preprocessor
- **Telegram Mini App SDK**: Integration with Telegram API
- **Date-fns**: Easy date manipulation

## Installation and Running

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with environment variables:
   ```
   REACT_APP_API_URL=https://api.botclean.example/api
   ```
4. Run the application in development mode:
   ```
   npm start
   ```
5. To build the production version:
   ```
   npm run build
   ```

## Integration with Telegram

The application integrates with Telegram Bot and uses Telegram Mini App for displaying in the Telegram client. 

### Setup in BotFather

1. Create a bot through [@BotFather](https://t.me/botfather)
2. Enable Web App support:
   - `/mybots` → Select the bot → Bot Settings → Menu Button → Configure Menu Button
   - Use the URL of your published application for configuration

### Data Transfer

The application sends data to the bot through the `sendData` method, which sends a serialized JSON string with actions and parameters.

## Project Structure

```
src/
  ├── components/       # Reusable components
  ├── context/          # React contexts (authentication, Telegram)
  ├── hooks/            # Custom hooks
  ├── pages/            # Main application pages
  ├── services/         # API clients and services
  ├── styles/           # SCSS styles
  ├── utils/            # Helper functions
  ├── App.tsx           # Root component
  └── index.tsx         # Entry point
```

## Deployment

For deployment, it is recommended to use:

1. **Netlify**: Easy deployment through GitHub with automatic updates support
2. **Vercel**: Great integration with React and support for previews for each PR
3. **GitHub Pages**: Free hosting for static sites

## Contributing to the Project

1. Fork the repository
2. Create a branch with the new feature
3. Submit a pull request

## License

MIT

---

Developed with 💙 for BotClean