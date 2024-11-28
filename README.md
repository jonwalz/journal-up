# Journal Up - Growth Mindset Journal API

A REST API backend service for a journaling application that incorporates growth mindset coaching techniques and leverages AI for personalized insights.

## Tech Stack

- Runtime: Bun
- Framework: ElysiaJS
- Database: Neon (Serverless PostgreSQL)
- Memory Store: Zep.ai

## Features

- User Authentication (signup/login)
- Journal Management
- Entry Creation and Retrieval
- Growth Mindset Metrics
- AI-Powered Insights
- User Settings Management

## Getting Started

1. Clone the repository
2. Install dependencies:

   ```bash
   bun install
   ```

3. Configure environment variables:

   - Update the values in `.env` file

4. Run database migrations:

   ```bash
   bun run migrate
   ```

5. Start the development server:
   ```bash
   bun run dev
   ```

The API will be available at http://localhost:3000. Swagger documentation is available at http://localhost:3000/swagger.

## Project Structure

```
src/
├── config/           # Configuration files and environment variables
├── controllers/      # Route handlers
├── services/        # Business logic
├── repositories/    # Database interactions
├── middleware/      # Custom middleware
├── utils/          # Helper functions and utilities
├── types/          # TypeScript type definitions
├── validators/     # Request validation schemas
└── index.ts        # Application entry point
```

## API Documentation

The API documentation is available through Swagger UI when the server is running. Visit `/swagger` to view the complete API documentation.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
