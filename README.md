
# TradePeople 🛠

[![Website](https://img.shields.io/badge/Visit-Website-blue)](https://www.tradepeople.co.uk)
## ⚠ License
This is a *private project*. All rights reserved. Unauthorized use, distribution, or modification of any part of this codebase is strictly prohibited.


Welcome to *TradePeople*, a trusted platform that connects homeowners with skilled, verified tradespeople across the UK. Whether you need an electrician, plumber, painter, or roofer – we help you find reliable professionals for your home improvement projects.


---

## 🌐 Live Website

👉 [Visit TradePeople.co.uk](https://www.tradepeople.co.uk)

---

## 💡 About TradePeople

TradePeople is designed to make hiring local tradespeople simple and secure. We provide a platform where homeowners can post jobs, compare offers, and hire vetted professionals, all with the confidence of trusted reviews and guaranteed satisfaction.

### 🌟 Key Features
- ✅ Verified and vetted tradespeople
- ⭐ Trusted reviews and ratings
- 💬 Seamless job posting and quote comparison
- 🔐 Secure communication and file handling

- ☁ File storage via AWS S3

- 🚀 Scalable infrastructure deployed on AWS

---

## ⚙ Tech Stack

| Technology      | Description                     |
|-----------------|---------------------------------|
| Frontend       | Next.js (React Framework)      |
| Backend        | Node.js                        |
| Database       | PostgreSQL (via Prisma ORM)    |
| Cloud Hosting  | AWS (EC2, RDS, S3)            |
| Storage        | AWS S3 (file uploads)          |
| ORM            | Prisma                         |

---

### Clone the repository and🏗 Getting Started

```bash
git clone https://github.com/yourusername/tradepeople.git
cd tradepeople

npx prisma generate
or
npx prisma migrate dev --name init
or
npm run dev
# or
npm run build
# or
npm start


