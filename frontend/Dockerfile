FROM nginx:alpine

# Копирование конфигурации nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Создание структуры папок
RUN mkdir -p /usr/share/nginx/html/blockly

# Копирование статических файлов
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY blockly_generators.js /usr/share/nginx/html/
COPY workspace_manager.js /usr/share/nginx/html/

# Настройка прав
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
