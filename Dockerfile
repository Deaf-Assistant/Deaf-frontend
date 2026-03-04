# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# รับ build args
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_CMU_CLIENT_ID
ARG NEXT_PUBLIC_CMU_ENTRAID_URL
ARG NEXT_PUBLIC_CMU_ENTRAID_LOGOUT_URL

# ใส่เข้า ENV ให้ Next.js ตอน build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_CMU_CLIENT_ID=$NEXT_PUBLIC_CMU_CLIENT_ID
ENV NEXT_PUBLIC_CMU_ENTRAID_URL=$NEXT_PUBLIC_CMU_ENTRAID_URL
ENV NEXT_PUBLIC_CMU_ENTRAID_LOGOUT_URL=$NEXT_PUBLIC_CMU_ENTRAID_LOGOUT_URL

RUN npm run build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]