import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticadedRequest extends Request {
  user: { id: string; email: string };
}

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req: AuthenticadedRequest) {
    return this.categoriesService.create(createCategoryDto, req.user.id);
  }

  @Get()
  findAll(@Request() req: AuthenticadedRequest) {
    return this.categoriesService.findAll(req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateCategoryDto: UpdateCategoryDto, 
    @Request() req: AuthenticadedRequest) {
    return this.categoriesService.update(id, updateCategoryDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticadedRequest) {
    return this.categoriesService.remove(id, req.user.id);
  }
}