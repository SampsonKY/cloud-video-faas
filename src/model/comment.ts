import {
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';
import { BaseTable } from '@midwayjs/sequelize';

@BaseTable({
  tableName: 'comment',
  freezeTableName: true,
  timestamps: true,
})
export class Comment extends Model {
  @AutoIncrement // 自增
  @PrimaryKey // 主键
  @Column
  id: number;

  @Column({
    type: DataType.STRING,
    comment: '评论人',
  })
  username: string;

  @Column({
    type: DataType.INTEGER,
    comment: '评论视频ID',
  })
  videoId: number;

  @Column({
    type: DataType.STRING,
    comment: '评论内容',
  })
  content: string;

  @Column({
    type: DataType.INTEGER,
    comment: '评论获赞数',
  })
  likes: string;

  @Column({
    type: DataType.STRING,
    comment: '评论回复列表',
  })
  replys: string;
}
