import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import * as faas from '@midwayjs/faas';
import * as defaultConfig from './config/config.default';
import * as prodConfig from './config/config.prod';
import * as sequelize from '@midwayjs/sequelize';
import * as upload from '@midwayjs/upload';
import * as oss from '@midwayjs/oss';

@Configuration({
  imports: [faas, sequelize, upload, oss],
  importConfigs: [
    {
      default: defaultConfig,
      prod: prodConfig,
    },
  ],
  conflictCheck: true,
})
export class ContainerLifeCycle implements ILifeCycle {
  async onReady() {}
}
