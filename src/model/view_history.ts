import {
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';
import { BaseTable } from '@midwayjs/sequelize';

@BaseTable({
  tableName: 'view_history',
  freezeTableName: true,
  timestamps: true,
})
export class ViewHistory extends Model {
  @AutoIncrement // 自增
  @PrimaryKey // 主键
  @Column
  id: number;

  @Column({
    type: DataType.STRING,
    comment: '用户',
  })
  username: string;

  @Column({
    type: DataType.NUMBER,
    comment: '视频id',
  })
  videoId: number;

  @Column({
    type: DataType.NUMBER,
    comment: '视频观看次数',
  })
  viewCount: number;

  @Column({
    type: DataType.STRING,
    comment: '视频标签',
  })
  tags: string;
}
