import {
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';
import { BaseTable } from '@midwayjs/sequelize';

@BaseTable({
  tableName: 'live_playback',
  freezeTableName: true,
  timestamps: true,
})
export class LivePlayback extends Model {
  @AutoIncrement // 自增
  @PrimaryKey // 主键
  @Column
  id: number;

  @Column({
    type: DataType.STRING,
    comment: '主播名',
  })
  username: string;

  @Column({
    type: DataType.STRING,
    comment: '直播间回放url',
  })
  url: string;

  @Column({
    type: DataType.STRING,
    comment: '直播间介绍',
  })
  announcement: string;

  @Column({
    type: DataType.STRING,
    comment: '直播间标题',
  })
  title: string;
}
