FROM nginx:alpine

# Установка дополнительных инструментов
RUN apk add --no-cache \
    curl \
    wget \
    nodejs \
    npm

# Создание структуры папок
RUN mkdir -p /usr/share/nginx/html/blockly

WORKDIR /usr/share/nginx/html

COPY . .

# Настройка прав
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
