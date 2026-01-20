FROM ubuntu:22.04
RUN apt-get update && apt-get install -y curl python3 python3-pip nodejs npm
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
RUN arduino-cli config init && \
    arduino-cli config set board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json && \
    arduino-cli core update-index && \
    arduino-cli core install esp32:esp32
WORKDIR /app
COPY package.json . 
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
