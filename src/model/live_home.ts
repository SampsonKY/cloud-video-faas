import {
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';
import { BaseTable } from '@midwayjs/sequelize';

@BaseTable({
  tableName: 'live_home',
  freezeTableName: true,
  timestamps: true,
})
export class LiveHome extends Model {
  @AutoIncrement // 自增
  @PrimaryKey // 主键
  @Column
  id: number;

  @Column({
    type: DataType.STRING,
    comment: '主播',
  })
  username: string;

  @Column({
    type: DataType.INTEGER,
    comment: '直播间状态',
  })
  active: number;

  @Column({
    type: DataType.STRING,
    comment: '直播间介绍',
  })
  description: string;

  @Column({
    type: DataType.STRING,
    comment: '直播间标题',
  })
  title: string;

  @Column({
    type: DataType.INTEGER,
    comment: '是否生成回放',
  })
  playback: number;

  @Column({
    type: DataType.STRING,
    comment: '直播拉流链接',
  })
  pullUrl: string;

  @Column({
    type: DataType.STRING,
    comment: '直播推流链接',
  })
  pushUrl: string;
}
