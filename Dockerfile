FROM node:latest

WORKDIR /app

# লোকাল pnpm ভার্সনের সাথে মিলিয়ে ইনস্টল (Corepack লাগবে না)
RUN npm install -g pnpm@10.26.2

# lockfile সহ manifest কপি — cache সঠিকভাবে কাজ করবে
COPY package*.json pnpm-lock.yaml ./

# lockfile-অনুযায়ী হুবহু dependency ইনস্টল
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 5000

# প্রিজমা ক্লায়েন্ট জেনারেট করে dev সার্ভার চালু
CMD [ "sh", "-c", "pnpm run generate && pnpm run dev" ]