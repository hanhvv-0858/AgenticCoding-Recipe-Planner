import { getTrendingRecipes, getRecipeTags } from '@/lib/actions/recipes'
import { NextMealCard } from '@/components/planner/next-meal-card'
import { HomeClient } from '@/components/recipes/home-client'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
    const [trendingResult, tagsResult] = await Promise.all([
        getTrendingRecipes(6),
        getRecipeTags(),
    ])

    const trending = trendingResult.success ? trendingResult.data : []
    const tags = tagsResult.success ? tagsResult.data : []

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Hero Section */}
            <section className="mb-4">
                <h1 className="mb-1 text-2xl font-bold text-foreground xs:text-3xl">
                    Khám phá công thức 🍳
                </h1>
                <p className="text-sm text-muted-foreground">
                    Tìm kiếm và khám phá những món ăn ngon mỗi ngày
                </p>
            </section>

            {/* Next Meal (placeholder) */}
            <section className="mb-4" data-testid="next-meal-section">
                <NextMealCard />
            </section>

            {/* Client interactive area: search + tags + results */}
            <HomeClient initialTrending={trending} tags={tags} />
        </div>
    )
}
