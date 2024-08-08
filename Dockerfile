# Gunakan image Node.js resmi
FROM node:16

# Set direktori kerja
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Instal dependencies
RUN npm install

# Salin seluruh kode aplikasi ke direktori kerja
COPY . .

# Ekspose port aplikasi
EXPOSE 8090

# Jalankan aplikasi
CMD ["node", "index.js"]
