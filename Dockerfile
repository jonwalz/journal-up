FROM gcr.io/distroless/base

WORKDIR /app

COPY server server

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3000