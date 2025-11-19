# Studio Pilz

A creative technology and design studio website showcasing work in web design, development, festival installations, and photography.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **3D Graphics**: Three.js with React Three Fiber
- **CMS**: Sanity Studio v3
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Features

- ✨ Minimalistic, futuristic design aesthetic
- 🎨 Interactive Three.js background animations
- 📝 Headless CMS with Sanity for easy project management
- 🚀 Optimized performance with Next.js 16
- 📱 Fully responsive design
- 🌙 Dark mode support
- ⚡ Smooth page transitions with Framer Motion

## Getting Started

### Prerequisites

- Node.js 20.17.0 or higher
- npm or yarn
- A Sanity.io account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/str1ck0/studiopilz.git
cd studiopilz
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Create a new Sanity project at [sanity.io/manage](https://www.sanity.io/manage)

5. Update `.env.local` with your Sanity credentials:
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_token
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Accessing Sanity Studio

Visit [http://localhost:3000/studio](http://localhost:3000/studio) to access the Sanity Studio interface and start adding projects.

## Project Structure

```
studiopilz/
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── work/              # Work gallery and project pages
│   ├── studio/            # Sanity Studio route
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── Navigation.tsx     # Main navigation
│   ├── ProjectCard.tsx    # Project card component
│   └── ThreeBackground.tsx # Three.js animated background
├── lib/                   # Utility functions
│   ├── sanity.client.ts   # Sanity client config
│   └── sanity.image.ts    # Image URL builder
├── sanity/                # Sanity configuration
│   └── schemas/           # Content schemas
└── public/                # Static assets
```

## Deployment to Vercel

1. Push your code to GitHub (already done!)

2. Visit [vercel.com](https://vercel.com) and sign in

3. Click "New Project"

4. Import your `studiopilz` repository

5. Add environment variables:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_TOKEN`

6. Deploy!

Vercel will automatically set up CI/CD, so every push to the main branch will trigger a new deployment.

## Adding Projects

1. Navigate to `/studio` on your deployed site or locally
2. Click "Create" → "Project"
3. Fill in project details:
   - Title
   - Slug (URL-friendly name)
   - Category
   - Description
   - Images
   - Year
   - Tags
4. Publish!

Your projects will appear on the work page automatically.

## Customization

### Changing Colors

Edit `app/globals.css` to customize the color scheme.

### Modifying the Three.js Scene

Edit `components/ThreeBackground.tsx` to change the 3D background animation.

### Adding New Content Types

1. Create a new schema in `sanity/schemas/`
2. Add it to `sanity/schemas/index.ts`
3. Create corresponding pages/components in the app

## License

MIT

## Credits

Built with [Claude Code](https://claude.com/claude-code)
