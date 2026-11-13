# HerdPulse AI

Koyun ve keçi çiftlikleri için hassas hayvancılık arayüzü. Sürü sağlığı, dijital çiftçi ve sürü defteri ekranlarını tek bir web uygulamasında toplar.

## Sayfalar

| Yol | İçerik |
| --- | --- |
| `/` | Ürün tanıtımı |
| `/digital-farmer` | Dijital çiftçi |
| `/digital-herd-book` | Dijital sürü defteri |
| `/contact` | İletişim |
| `/login` | Giriş |
| `/app/farmer` | Çiftçi paneli (giriş gerekir) |
| `/app/herdbook` | Sürü paneli (giriş gerekir) |

## Geliştirme

Node.js ve [pnpm](https://pnpm.io) gerekir (`packageManager`: pnpm 10).

```bash
pnpm install
pnpm dev
```

Üretim derlemesi ve önizleme:

```bash
pnpm build
pnpm preview
```

Arayüz React 19, Vite, Tailwind CSS 4 ve React Router ile yazılmıştır. Grafikler için Recharts kullanılır. `vercel.json` Vercel yayını içindir.
