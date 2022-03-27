import {
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';
import { BaseTable } from '@midwayjs/sequelize';

@BaseTable({
  tableName: 'review',
  freezeTableName: true,
  timestamps: true,
})
export class Review extends Model {
  @AutoIncrement // 自增
  @PrimaryKey // 主键
  @Column
  id: number;

  @Column({
    type: DataType.INTEGER,
    comment: '视频id',
  })
  videoId: number;

  @Column({
    type: DataType.SMALLINT,
    comment: '审核结果',
  })
  result: number;

  @Column({
    type: DataType.STRING,
    comment: '回复',
  })
  recall: string;
}
