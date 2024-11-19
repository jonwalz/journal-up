# Build stage
FROM oven/bun:latest as builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .
RUN bun build --compile --minify-whitespace --minify-syntax --target bun --outfile server ./src/index.ts

# Run stage
FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=builder /app/server .

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3000