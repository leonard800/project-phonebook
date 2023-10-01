import { atom } from 'jotai'

export const textAtom = atom('hello')
const uppercaseAtom = atom(
  (get) => get(textAtom).toUpperCase()
)

export const isFavoriteAtom = atom([]);