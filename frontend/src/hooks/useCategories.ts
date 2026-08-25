import { useEffect, useState } from 'react'
import { fetchCategories } from '../api/categories'
import type { Category } from '../types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[] | null>(null)

  useEffect(() => {
    let active = true
    fetchCategories().then((res) => {
      if (active) setCategories(res.data)
    })
    return () => {
      active = false
    }
  }, [])

  return { categories, loading: categories === null }
}
