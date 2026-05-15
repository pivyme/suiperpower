import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export const cnm = (...values: Array<ClassValue>) => twMerge(clsx(values))
