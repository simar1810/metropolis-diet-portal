import { retailHerbalifePriorityProductsx } from "@/config/data/retail"

export function sortByPriority(products, isWhitelabel = false) {
  if (!isWhitelabel) return products
  const filteredProducts = products
    .filter(product => !retailHerbalifePriorityProductsx.has(product.productName))
  const sortedProducts = products
    .filter(product => retailHerbalifePriorityProductsx.has(product.productName))
    .sort((a, b) => {
      const aPriority = retailHerbalifePriorityProductsx.get(a.productName)
      const bPriority = retailHerbalifePriorityProductsx.get(b.productName)
      return bPriority - aPriority > 0 ? -1 : 1
    })
  return [...sortedProducts, ...filteredProducts]
}