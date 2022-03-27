import {
  Controller,
  Get,
  Post,
  Provide,
  Query,
  Body,
  ALL,
  Inject,
} from '@midwayjs/decorator';
import { Video } from '../model/video';
import { ViewHistory } from '../model/view_history';
import res_obj from '../utils/res_obj';
import { HistoryService } from '../service/history';
import { RecommendService } from '../service/recommend';

@Provide()
@Controller('/history')
export class HistoryController {
  @Inject()
  historyService: HistoryService;

  @Inject()
  recommendService: RecommendService;

  // 增加历史记录
  @Post('/add')
  async createHistory(@Body(ALL) body) {
    const { username, videoId, tags } = body;

    // 判断该视频是否已经在历史记录中
    const ret = await ViewHistory.findOne({
      where: {
        username,
        videoId,
      },
    });

    let res;
    if (ret) {
      res = await ViewHistory.increment(
        { viewCount: 1 },
        {
          where: {
            username,
            videoId,
          },
        }
      );
    } else {
      res = await ViewHistory.create({
        username,
        videoId,
        viewCount: 1,
        tags,
      });
    }
    if (res instanceof Error) {
      return res_obj('历史记录增加失败');
    }

    // 视频播放数加1
    await Video.increment({ viewCount: 1 }, { where: { id: videoId } });

    return res_obj('');
  }

  // 查询历史记录
  @Get('/list')
  async getHistoryList(@Query('username') username) {
    const ret = await ViewHistory.findAll({
      where: {
        username,
      },
      limit: 30,
    });
    if (ret instanceof Error) {
      return res_obj('获取历史记录失败');
    }
    return res_obj('', ret);
  }

  // 获取一段时间内某用户对某类型视频观看率，点赞率，收藏率
  @Get('/analysis')
  async getVideoAnalysis(@Query('username') username) {
    const initData = await this.recommendService.initMatrix(username);
    const re = await this.recommendService.recommendAlgorism(initData);
    const res = await this.recommendService.recommendContent(re);
    return res_obj('', res);
    // return res_obj(await this.historyService.getVideoAnalysis(username));
  }
}
