import {
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';
import { BaseTable } from '@midwayjs/sequelize';

@BaseTable({
  tableName: 'reply',
  freezeTableName: true,
  timestamps: true,
})
export class Reply extends Model {
  @AutoIncrement // 自增
  @PrimaryKey // 主键
  @Column
  id: number;

  @Column({
    type: DataType.INTEGER,
    comment: '父评论id',
  })
  commentId: number;

  @Column({
    type: DataType.STRING,
    comment: '回复者',
  })
  username: string;

  @Column({
    type: DataType.STRING,
    comment: '回复对象',
  })
  toUser: string;

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
    type: DataType.INTEGER,
    comment: '回复类型,区分二级和三级回复',
  })
  type: number;
}
