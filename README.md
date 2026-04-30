# Project prerequisits
Node [v20.9+](https://nodejs.org/)

MySql [Community server 8.0.46+](https://dev.mysql.com/downloads/mysql/8.0.html)


# Running the project

1. Install packages and dependencies:
```
npm install
```

2. Configure environment variables using the `.env.example` file

3. Run migrations to build the database
```
npx drizzle-kit migrate
```

4. Start the development server
```
npm run dev
```