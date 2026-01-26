import { PrismaClient } from '@prisma/client'
const p = new PrismaClient({ accelerateUrl: 'test' } as any)
console.log('Success')
