import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class LanguageService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.language.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }
}
