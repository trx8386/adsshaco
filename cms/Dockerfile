# Stage 1: Build
FROM node:22-alpine AS ldp-captcha-cms-builder

WORKDIR /app

# Sao chép package.json và package-lock.json để tận dụng cache của Docker
COPY package*.json ./

# Cài đặt toàn bộ dependencies bao gồm cả devDependencies để build NestJS
RUN npm ci

# Sao chép source code dự án
COPY . .

# Build ứng dụng NestJS (output sẽ nằm ở thư mục dist)
RUN npm run build

# Loại bỏ devDependencies để giảm kích thước node_modules cho stage run
RUN npm prune --production

# Stage 2: Run
FROM node:22-alpine

WORKDIR /app

# Thiết lập môi trường production
ENV NODE_ENV=production

# Sao chép file package.json và thư mục node_modules, dist từ Stage 1
COPY --from=ldp-captcha-cms-builder /app/package*.json ./
COPY --from=ldp-captcha-cms-builder /app/node_modules ./node_modules
COPY --from=ldp-captcha-cms-builder /app/dist ./dist
COPY --from=ldp-captcha-cms-builder /app/.env ./
COPY --from=ldp-captcha-cms-builder /app/public ./public

# Expose port (NestJS mặc định chạy port 4180 hoặc theo PORT env)
EXPOSE 4180

# Khởi chạy ứng dụng bằng Node.js trực tiếp
CMD ["node", "dist/main"]
