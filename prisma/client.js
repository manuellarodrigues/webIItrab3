// prisma/client.js
import { PrismaClient } from '@prisma/client';

// Criação da instância do Prisma Client
const prisma = new PrismaClient();

// Exportação da instância para ser utilizada em outros lugares
export default prisma;
