FROM nginx:alpine

# Copy dashboard files with correct permissions
COPY --chmod=644 index.html /usr/share/nginx/html/
COPY --chmod=644 app.js /usr/share/nginx/html/
COPY --chmod=644 style.css /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ensure correct ownership and permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 644 /usr/share/nginx/html/*

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

EXPOSE 80
