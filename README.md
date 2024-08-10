## Dinamika E-Catalog

### Decription

Website ini adalah proyek pembelajaran pribadi saya untuk menguasai penggunaan Express.js dan MongoDB dalam pengembangan web. Ini juga project pertama saya menggunakan Docker. Proyek ini dirancang untuk memberikan pemahaman yang lebih dalam tentang bagaimana membangun aplikasi web dengan fitur CRUD (Create, Read, Update, Delete) yang lengkap, dalam databasenya terdapat 3 collection `users`, `products`, `transactions`,

### Tech Stack

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![Bootstrap](https://img.shields.io/badge/bootstrap-%238511FA.svg?style=for-the-badge&logo=bootstrap&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

### How To Use

#### • Docker

Pastikan memiliki `docker` pada environment

1. Setelah clone, pindah ke folder project

```bash
cd dinamika-e-catalog
```

2. Build docker compose

```bash
docker-compose up --build
```

3. Import data ke mongodb

```bash
docker exec dinamika-e-catalog-mongo-1 mongodump --out /dump

docker cp dump/ <container-id>:/dump

docker exec -it <container-id> mongorestore /dump
```

Untuk mengakses websitenya pergi ke `http://localhost:8090`

#### • Manual

Pastikan anda memiliki `node js`, `npm` dan `mongodb` pada environment

1. Setelah clone, pindah ke folder project

```bash
cd dinamika-e-catalog
```

2. Import data ke mongodb

```bash
mongorestore --db nama_database /dump/uas-204160
```

3. Install package npm yang diperlukan

```bash
npm install
```

4. Jalankan website dengan `node` atau `nodemon`

```bash
node index.js
# or
nodemon index.js
```
