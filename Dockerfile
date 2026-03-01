FROM node:20-alpine AS base

# Step 1: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Step 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- ประกาศรับตัวแปร NEXT_PUBLIC_ เพื่อฝังลงไปตอน Build ---
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_CMU_CLIENT_ID
ARG NEXT_PUBLIC_CMU_ENTRAID_URL
ARG NEXT_PUBLIC_CMU_ENTRAID_LOGOUT_URL
ARG NEXT_PUBLIC_BASE_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_CMU_CLIENT_ID=$NEXT_PUBLIC_CMU_CLIENT_ID
ENV NEXT_PUBLIC_CMU_ENTRAID_URL=$NEXT_PUBLIC_CMU_ENTRAID_URL
ENV NEXT_PUBLIC_CMU_ENTRAID_LOGOUT_URL=$NEXT_PUBLIC_CMU_ENTRAID_LOGOUT_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
# --------------------------------------------------------

RUN npm run build

# Step 3: Production environment
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# สร้าง User ใหม่เพื่อความปลอดภัย ไม่รันด้วย Root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# คัดลอกไฟล์ที่จำเป็นสำหรับการรัน
COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]