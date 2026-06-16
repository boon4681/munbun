# Munbun
<p align="center" style="margin-top: 20px">
  <img src="https://sharex.boon4681.com/u/LBIRVf.png" align="center"/>
</p>
<p align="center" style="margin-top: 20px">
  <p align="center">
    The Open Source email template manager.
  </p>
</p>

### Master Your Emails, Effortlessly
Say goodbye to email headaches! With Munbun, Email Template Manager, you can design, customize, and send stunning emails using your favorite providers all in one place.

## Todo
- [x] Logging system
- [x] Account management
- [x] Edit project and template details

## Features

- [x] Version control
- [x] Rest API
- [x] Dashboard
- [x] Gmail SMTP support
- [x] Resend support

## Tech Stack

- [Sveltekit](https://svelte.dev/docs/kit/) - Framework
- [Drizzle](https://orm.drizzle.team/) - ORM
- [Tailwind](https://tailwindcss.com/) - CSS
- [shadcn-svelte](https://www.shadcn-svelte.com/) - Component Library
- [hono](https://hono.dev/) - API

## Self-hosting

### Using Docker (Recommended)

1. **Clone the repo**

    ```bash
    git clone https://github.com/boon4681/munbun.git
    cd munbun
    ```

2. **Setup environment variables**

    ```bash
    cp .env.example .env
    # Edit .env with your Google OAuth credentials and other settings
    ```

3. **Build and run**
    
    ```bash
    docker build -t munbun .
    docker run -d -p 3000:3000 -v munbun-data:/app/_munbun_ --env-file .env --name munbun munbun
    ```
    
    Alternatively, if you prefer Docker Compose:
    
    Create a `docker-compose.yml`:
    ```yaml
    version: '3.8'
    services:
      munbun:
        build: .
        ports:
          - "3000:3000"
        volumes:
          - munbun-data:/app/_munbun_
        env_file:
          - .env
        restart: unless-stopped
    
    volumes:
      munbun-data:
    ```
    And run:
    ```bash
    docker-compose up -d
    ```

### From Repo
1. **Clone the repo**

    Clone it on your local machine using:
    ```bash
    git clone https://github.com/boon4681/munbun.git
    ```

2. **Install Dependencies**
   
    ```bash
    yarn
    # or
    npm install
    ```


3. **Copy the env.example file into .env**
   
    ```bash
    cp .env.example .env
    ```

4. **Run it**

    ```bash
    yarn dev --host
    ```

## Maintainer

- boon4681
