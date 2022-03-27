import {
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';
import { BaseTable } from '@midwayjs/sequelize';

@BaseTable({
  tableName: 'danmu',
  freezeTableName: true,
  timestamps: true,
})
export class Danmu extends Model {
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
    comment: '弹幕内容',
  })
  txt: string;

  @Column({
    type: DataType.INTEGER,
    comment: '视频id',
  })
  videoId: number;

  @Column({
    type: DataType.NUMBER,
    comment: '弹幕开始时间 ms',
  })
  start: number;

  @Column({
    type: DataType.NUMBER,
    comment: '弹幕间隔',
  })
  duration: number;
}
