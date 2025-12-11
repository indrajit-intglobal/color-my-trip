import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContentEditor } from '@/components/admin/content-editor'

async function getContent() {
  try {
    const [hero, testimonials, faq] = await Promise.all([
      prisma.homepageContent.findUnique({ where: { key: 'HERO_SECTION' } }),
      prisma.homepageContent.findUnique({ where: { key: 'TESTIMONIALS' } }),
      prisma.homepageContent.findUnique({ where: { key: 'FAQ' } }),
    ])

    return {
      hero: hero?.content || {},
      testimonials: testimonials?.content || {},
      faq: faq?.content || {},
    }
  } catch {
    return {
      hero: {},
      testimonials: {},
      faq: {},
    }
  }
}

export default async function AdminContentPage() {
  const content = await getContent()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Content Management</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
          </CardHeader>
          <CardContent>
            <ContentEditor key="HERO_SECTION" contentKey="HERO_SECTION" initialContent={content.hero} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testimonials</CardTitle>
          </CardHeader>
          <CardContent>
            <ContentEditor key="TESTIMONIALS" contentKey="TESTIMONIALS" initialContent={content.testimonials} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            <ContentEditor key="FAQ" contentKey="FAQ" initialContent={content.faq} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

