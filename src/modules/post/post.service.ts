import { Injectable, Request } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { Category } from '../category/entities/category.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}
  async create(user: any, createPostDto: CreatePostDto) {
    const { title, content, categoryNames } = createPostDto;

    const categories = await Promise.all(
      categoryNames.map(async (name) => {
        let category = await this.categoryRepo.findOne({ where: { name } });
        console.log(category);
        if (!category) {
          category = await this.categoryRepo.save({ name });
        }
        return category;
      }),
    );

    return await this.postRepo.save({
      title,
      content,
      userId: user.id,
      categories,
    });
  }

  findAll() {
    return `This action returns all post`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
