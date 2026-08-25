import { useEffect, useState } from 'react'
import { fetchMenu, type MenuFilters } from '../api/menu'
import type { Food } from '../types'

export function useMenu(filters: MenuFilters) {
  const [foods, setFoods] = useState<Food[] | null>(null)
  const key = JSON.stringify(filters)

  useEffect(() => {
    let active = true
    setFoods(null)
    fetchMenu(filters).then((res) => {
      if (active) setFoods(res.data)
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { foods, loading: foods === null }
}
