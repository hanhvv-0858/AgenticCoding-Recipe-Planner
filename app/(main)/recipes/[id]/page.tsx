import { notFound } from 'next/navigation'
import { getRecipeDetail } from '@/lib/actions/recipes'
import { RecipeDetailWrapper } from '@/components/recipes/recipe-detail-wrapper'

interface RecipeDetailPageProps {
    params: Promise<{ id: string }>
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
    const { id } = await params

    const result = await getRecipeDetail(id)

    if (!result.success || !result.data) {
        notFound()
    }

    return <RecipeDetailWrapper recipe={result.data} />
}
