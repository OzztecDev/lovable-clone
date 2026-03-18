# Deployment Guide for ai.ozztec.site

## Option 1: Vercel (Recommended)

1. **GitHub'a Yükle**
```bash
cd /app
git init
git add .
git commit -m "Lovable Clone SaaS"
git remote add origin https://github.com/YOUR_USERNAME/lovable-clone.git
git push -u origin main
```

2. **Vercel'e Deploy**
- https://vercel.com/new adresine gidin
- GitHub reposunu bağlayın
- `ai.ozztec.site` domainini ekleyin
- Deploy butonuna tıklayın

## Option 2: Railway

1. **Railway'e Deploy**
- https://railway.app/new adresine gidin
- GitHub reposunu bağlayın
- Environment variables ekleyin
- Deploy butonuna tıklayın

## Option 3: Docker + VPS

1. **VPS'e SSH ile bağlanın**
2. **Docker ve Docker Compose kurun**
3. **Docker Compose dosyası oluşturun:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@host:5432/db
      - JWT_SECRET=your-secret-key
      - GEMINI_API_KEY=your-key
      - OPENROUTER_API_KEY=your-key
    restart: always
```

4. **Çalıştırın:**
```bash
docker-compose up -d
```

## DNS Ayarları (ai.ozztec.site)

Domain sağlayıcınızda (GoDaddy, Namecheap, vb.):

1. **A Record:**
   - Name: @ (veya boş)
   - Value: SERVER_IP (Vercel/Railway IP adresi)
   - TTL: Automatic

2. **CNAME Record:**
   - Name: www
   - Value: cname.vercel-dns.com

## Environment Variables (.env.production)

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=complex-secret-key-min-32-chars
JWT_REFRESH_SECRET=another-complex-secret
GEMINI_API_KEY=your-gemini-key
OPENROUTER_API_KEY=your-openrouter-key
IYZICO_API_KEY=your-iyzico-key
IYZICO_SECRET_KEY=your-iyzico-secret
NEXT_PUBLIC_APP_URL=https://ai.ozztec.site
```

## Post-Deployment

1. **Database Migration:**
```bash
npx prisma migrate deploy
```

2. **Seed Data (opsiyonel):**
```bash
npx prisma db seed
```

3. **SSL Certificate:**
- Vercel/Railway otomatik SSL sağlar
- VPS için: Let's Encrypt kullanın

## Troubleshooting

**Build Errors:**
```bash
npm run build
```

**Database Connection:**
- DATABASE_URL kontrol edin
- PostgreSQL'in çalıştığından emin olun

**API Keys:**
- Tüm API key'lerin doğru olduğunu kontrol edin
- Rate limit'leri kontrol edin
