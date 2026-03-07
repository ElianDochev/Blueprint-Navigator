FROM oven/bun:1.2

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY . .

RUN mkdir -p /app/tmp

EXPOSE 5173

CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
