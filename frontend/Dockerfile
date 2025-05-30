# Build stage
FROM node:18-alpine AS build

WORKDIR /app
COPY . .

# Define build arguments
ARG VITE_APP_API_URL

# Set environment variables
ENV VITE_APP_API_URL=$VITE_APP_API_URL

RUN npm install
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
