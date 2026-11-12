FROM node:latest

WORKDIR /app

# লোকাল pnpm ভার্সন (10.26.2) — Corepack এড়িয়ে সরাসরি npm দিয়ে
RUN npm install -g pnpm@10.26.2

# lockfile সহ manifest কপি (cache সঠিকভাবে কাজ করবে)
COPY package*.json pnpm-lock.yaml ./

# lockfile-অনুযায়ী হুবহু dependency ইনস্টল
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 5000

# generate → migrate deploy (non-interactive) → dev
CMD [ "sh", "-c", "CI=true pnpm generate && pnpm prisma migrate deploy && pnpm dev" ]