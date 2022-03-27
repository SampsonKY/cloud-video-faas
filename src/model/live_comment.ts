import {
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';
import { BaseTable } from '@midwayjs/sequelize';

@BaseTable({
  tableName: 'live_comment',
  freezeTableName: true,
  timestamps: true,
})
export class LiveComment extends Model {
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
    type: DataType.STRING,
    comment: '评论内容',
  })
  content: string;

  @Column({
    type: DataType.INTEGER,
    comment: '直播间id',
  })
  liveId: number;
}
