# Gunakan image Node.js resmi
FROM node:16

# Set direktori kerja
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Instal dependencies
RUN npm install
RUN npm install -g nodemon

# Salin seluruh kode aplikasi ke direktori kerja
COPY . .

# Ekspose port aplikasi
EXPOSE 8090

# Jalankan aplikasi
CMD ["nodemon", "--watch", ".", "--legacy-watch", "index.js"]
