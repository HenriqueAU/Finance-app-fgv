import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      user: { id: userId },
    });
    return await this.categoryRepository.save(category);
  }

  async findAll(userId: string) {
    return await this.categoryRepository.find({
      where: { user: { id: userId } },
    });
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ) {
    const category = await this.categoryRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!category) {
      throw new NotFoundException(
        'Categoria não encontrada ou não pertence a você.',
      );
    }

    const updatedCategory = this.categoryRepository.merge(
      category,
      updateCategoryDto,
    );
    return await this.categoryRepository.save(updatedCategory);
  }

  async remove(id: string, userId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    await this.categoryRepository.delete(id);
    return { message: 'Categoria removida' };
  }
}
