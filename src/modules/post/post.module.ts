import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { CategoryModule } from '../category/category.module';
@Module({
  imports: [TypeOrmModule.forFeature([Post]), CategoryModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
