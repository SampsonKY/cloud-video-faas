import {
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';
import { BaseTable } from '@midwayjs/sequelize';

@BaseTable({
  tableName: 'video',
  freezeTableName: true,
  timestamps: true,
})
export class Video extends Model {
  @AutoIncrement // 自增
  @PrimaryKey // 主键
  @Column
  id: number;

  @Column({
    type: DataType.STRING,
    comment: '作者',
  })
  author: string;

  @Column({
    type: DataType.STRING,
    comment: '视频链接',
  })
  url: string;

  @Column({
    type: DataType.STRING,
    comment: '视频标题',
  })
  title: string;

  @Column({
    type: DataType.STRING,
    comment: '视频描述',
  })
  description: string;

  @Column({
    type: DataType.STRING,
    comment: '视频封面',
  })
  cover: string;

  @Column({
    type: DataType.INTEGER,
    comment: '视频点赞数',
  })
  likes: number;

  @Column({
    type: DataType.INTEGER,
    comment: '视频收藏数',
  })
  stars: number;

  @Column({
    type: DataType.INTEGER,
    comment: '评论数',
  })
  comments: number;

  @Column({
    type: DataType.STRING,
    comment: '标签',
  })
  tags: string;

  @Column({
    type: DataType.SMALLINT,
    comment: '状态',
  })
  status: number;

  @Column({
    type: DataType.NUMBER,
    comment: '视频被观看次数',
  })
  viewCount: number;
}
