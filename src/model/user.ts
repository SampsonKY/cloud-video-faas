import {
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';
import { BaseTable } from '@midwayjs/sequelize';

@BaseTable({
  tableName: 'user',
  freezeTableName: true,
  timestamps: true,
})
export class User extends Model {
  @AutoIncrement // 自增
  @PrimaryKey // 主键
  @Column
  id: number;

  @Column({
    type: DataType.STRING,
    comment: '用户名',
  })
  username: string;

  @Column({
    type: DataType.TINYINT,
    comment: '年龄',
  })
  age: number;

  @Column({
    type: DataType.STRING,
    comment: '密码',
  })
  password: string;

  @Column({
    type: DataType.STRING,
    comment: '头像',
  })
  avatar: string;

  @Column({
    type: DataType.STRING,
    comment: '背景图',
  })
  background: string;

  @Column({
    type: DataType.SMALLINT,
    comment: '性别',
  })
  sex: number;

  @Column({
    type: DataType.STRING,
    comment: '个性签名',
  })
  signature: string;

  @Column({
    type: DataType.INTEGER,
    comment: '获赞数',
  })
  likes: number;

  @Column({
    type: DataType.STRING,
    comment: '关注',
  })
  stars: string;

  @Column({
    type: DataType.STRING,
    comment: '粉丝',
  })
  fans: string;

  @Column({
    type: DataType.STRING,
    comment: '作品',
  })
  works: string;

  @Column({
    type: DataType.STRING,
    comment: '喜欢',
  })
  like_works: string;

  @Column({
    type: DataType.STRING,
    comment: '收藏',
  })
  star_works: string;

  @Column({
    type: DataType.STRING,
    comment: '点赞过的评论',
  })
  like_comment: string;

  @Column({
    type: DataType.STRING,
    comment: '点赞过的回复',
  })
  like_reply: string;

  @Column({
    type: DataType.SMALLINT,
    comment: '是否是管理员',
  })
  is_admin: number;
}
