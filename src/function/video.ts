import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Provide,
  Query,
} from '@midwayjs/decorator';
import { User } from '../model/user';
import { Video } from '../model/video';
import res_obj from '../utils/res_obj';
import { VerifyMiddleware } from '../middleware/verify';
import { Comment } from '../model/comment';
import format from '../utils/format';
import { Tag } from '../model/tag';
import { Danmu } from '../model/danmu';
import { Op } from 'sequelize';
import { Review } from '../model/review';
import { ViewHistory } from '../model/view_history';
import { RecommendService } from '../service/recommend';
@Provide()
@Controller('/video')
export class VideoController {
  @Inject()
  recommendService: RecommendService;

  @Get('/recommend')
  async getRecommendVideo(@Query('pn') pn = 0, @Query('username') username) {
    // 查询用户历史记录，若无历史记录，则冷启动，否则使用推荐算法
    const historyCount = await ViewHistory.count({
      where: {
        username,
      },
    });

    console.log('historyCount', historyCount);

    let result = [];

    if (historyCount > 3) {
      // 初始矩阵
      const initData = await this.recommendService.initMatrix(username);
      // 推荐算法
      const percent = await this.recommendService.recommendAlgorism(initData);
      // 获取内容
      result = await this.recommendService.recommendContent(percent);

      // 若推荐内容数量不足，则热门来凑
      const resIds = result.map(item => item.id);
      const extra = await Video.findAll({
        where: {
          status: 1,
          id: {
            [Op.notIn]: [...resIds],
          },
        },
        order: [['viewCount', 'DESC']],
        limit: 10 - resIds.length,
        raw: true,
      });
      result = result.concat(extra);
    } else {
      const limit = 10;
      result = await Video.findAll({
        where: {
          status: 1,
        },
        order: [['viewCount', 'DESC']],
        offset: limit * pn,
        limit: 10,
        raw: true,
      });
      if (result instanceof Error) {
        return res_obj('视频获取失败');
      }
    }

    const ret = [];

    for (let i = 0; i < result.length; i++) {
      const { avatar } = await User.findOne({
        attributes: ['avatar'],
        where: {
          username: result[i].author,
        },
      });

      const tagIds = format(result[i].tags);

      const tagNames = await Promise.all(
        tagIds.map(async id => {
          const { tag } = await Tag.findOne({
            attributes: ['tag'],
            where: {
              id,
            },
            raw: true,
          });
          return tag;
        })
      );

      ret[i] = {
        avatar,
        tagNames,
        tagIds,
        ...result[i],
      };
    }

    return res_obj('', {
      videos: ret,
    });
  }

  @Get('/rank')
  async getVideoRank() {
    const res = await Video.findAll({
      order: [['viewCount', 'DESC']],
      limit: 10,
    });

    if (res instanceof Error) {
      return res_obj('获取排行榜错误');
    }

    return res_obj('', res);
  }

  // 点赞视频
  @Post('/like', { middleware: [VerifyMiddleware] })
  async likeVideo(@Body() p) {
    const { username, videoId, author } = p;

    // 视频获赞数加1
    const update_video = await Video.sequelize.query(
      `UPDATE video SET likes=likes+1 WHERE id=${videoId}`
    );

    if (update_video instanceof Error) {
      return res_obj('点赞失败');
    }

    // 作者获赞数加1
    const res = await User.sequelize.query(
      `UPDATE user SET likes=likes+1 WHERE username='${author}'`
    );
    if (res instanceof Error) {
      return res_obj('点赞异常');
    }

    // 用户喜欢作品增加
    const id = videoId + ',';
    const user_like = await User.sequelize.query(
      `UPDATE user SET like_works=CONCAT('${id}', like_works) WHERE username='${username}'`
    );
    if (user_like instanceof Error) {
      return res_obj('点赞异常');
    }

    return res_obj('', {
      success: true,
    });
  }

  // 收藏视频
  @Post('/star', { middleware: [VerifyMiddleware] })
  async starVideo(@Body() p) {
    const { username, videoId } = p;

    // 视频收藏数加1
    const update_video = await Video.sequelize.query(
      `UPDATE video SET stars=stars+1 WHERE id=${videoId}`
    );

    if (update_video instanceof Error) {
      return res_obj('收藏失败');
    }

    // 用户收藏作品增加
    const id = videoId + ',';
    const user_like = await User.sequelize.query(
      `UPDATE user SET star_works=CONCAT('${id}', star_works) WHERE username='${username}'`
    );
    if (user_like instanceof Error) {
      return res_obj('收藏异常');
    }

    return res_obj('', {
      success: true,
    });
  }

  // 关注作者
  @Post('/star_author', { middleware: [VerifyMiddleware] })
  async starAuthor(@Body() p) {
    const { username, author } = p;

    // 用户关注人数增加
    const f_author = author + ',';
    const u_star = await User.sequelize.query(
      `UPDATE user SET stars=CONCAT('${f_author}', stars) WHERE username='${username}'`
    );
    if (u_star instanceof Error) {
      return res_obj('关注失败');
    }

    // 作者粉丝增加
    const f_username = username + ',';
    const a_fans = await User.sequelize.query(
      `UPDATE user SET fans=CONCAT('${f_username}', fans) WHERE username='${author}'`
    );
    if (a_fans instanceof Error) {
      return res_obj('关注异常');
    }
    return res_obj('', {
      success: true,
    });
  }

  // 获取视频评论
  @Get('/:videoId/comment')
  async getVideoComment(
    @Param('videoId') videoId: number,
    @Query('pn') pn: number,
    @Query('username') username: string
  ) {
    // const limit = 10;
    const comment = await Comment.findAll({
      where: {
        videoId,
      },
      // offset: pn * limit,
      // limit,
      raw: true,
      order: [['id', 'DESC']],
    });
    if (comment instanceof Error) {
      return res_obj('获取视频评论失败');
    }

    const { like_comment } = await User.findOne({
      attributes: ['like_comment'],
      where: {
        username,
      },
    });

    const result = [];

    for (let i = 0; i < comment.length; i++) {
      const item = comment[i];
      const { avatar } = await User.findOne({
        attributes: ['avatar'],
        where: {
          username: item.username,
        },
      });
      result[i] = {
        avatar,
        userLike: format(like_comment).includes(`${item.id}`),
        ...comment[i],
      };
    }

    return res_obj('', {
      comments: result,
    });
  }

  // 对视频进行评论
  @Post('/:videoId/make_comment', { middleware: [VerifyMiddleware] })
  async makeComment(@Param('videoId') videoId, @Body() p) {
    const { username, content } = p;
    const ret = await Comment.create({
      videoId,
      username,
      content,
    });
    if (ret instanceof Error) {
      return res_obj('评论失败');
    }
    return res_obj('', {
      success: true,
    });
  }

  // 获取用户对视频的点赞情况
  @Get('/:videoId/video_msg')
  async getVideoMsg(
    @Param('videoId') videoId,
    @Query('author') author,
    @Query('username') username
  ) {
    const ret = await User.findOne({
      attributes: ['stars', 'like_works', 'star_works'],
      where: {
        username,
      },
    });
    if (ret instanceof Error) {
      return res_obj('获取点赞信息失败');
    }

    const { likes, stars, comments } = await Video.findOne({
      attributes: ['likes', 'stars', 'comments'],
      where: {
        status: 1,
        id: videoId,
      },
    });

    return res_obj('', {
      isStarAuthor: format(ret.stars).includes(author),
      isLikeVideo: format(ret.like_works).includes(videoId),
      isStarVideo: format(ret.star_works).includes(videoId),
      likes,
      stars,
      comments,
    });
  }

  // 根据视频id获取视频
  @Get('/:videoId/detail')
  async getVideoById(@Param('videoId') videoId) {
    const ret = await Video.findOne({
      where: {
        status: 1,
        id: videoId,
      },
    });

    if (ret instanceof Error) {
      return res_obj('获取视频失败');
    }

    const { avatar } = await User.findOne({
      attributes: ['avatar'],
      where: {
        username: ret.author,
      },
    });

    const tagIds = format(ret.tags);

    const tagNames = await Promise.all(
      tagIds.map(async id => {
        const { tag } = await Tag.findOne({
          attributes: ['tag'],
          where: {
            id,
          },
          raw: true,
        });
        return tag;
      })
    );

    return res_obj('', {
      avatar,
      tagNames,
      tagIds,
      ...ret.toJSON(),
    });
  }

  // 上传视频
  @Post('/create')
  async createVideo(@Body(ALL) body) {
    const { author, url, title, description, cover, tags } = body;
    const res = await Video.create({
      author,
      url,
      title,
      description,
      cover,
      tags: tags.toString(),
      status: 0,
    });
    if (res instanceof Error) {
      return res_obj('视频新建失败');
    }

    const videoId = res.id + ',';
    const ret = await User.sequelize.query(
      `UPDATE user SET works=CONCAT('${videoId}', works) where username='${author}'`
    );
    if (ret instanceof Error) {
      return res_obj('视频新建异常');
    }

    // 生成审核记录
    const ress = await Review.create({
      videoId: res.id,
      result: 0,
    });
    if (ress instanceof Error) {
      return res_obj('生成审核记录失败');
    }

    return res_obj('');
  }

  // 获取视频弹幕
  @Get('/:videoId/danmu')
  async getDanmu(@Param('videoId') videoId) {
    const ret = await Danmu.findAll({
      where: {
        videoId,
      },
    });
    if (ret instanceof Error) {
      return res_obj('获取视频弹幕失败');
    }
    return res_obj('', ret);
  }

  // 生成视频弹幕
  @Post('/:videoId/send_danmu')
  async sendDanmu(@Param('videoId') videoId, @Body(ALL) body) {
    const { txt, start, username, duration = 5000 } = body;
    const ret = await Danmu.create({
      txt,
      start,
      username,
      videoId,
      duration,
    });

    if (ret instanceof Error) {
      return res_obj('发送弹幕失败');
    }
    return res_obj('');
  }

  // 根据 tag 获取视频列表
  @Get('/sort')
  async getVideoByTag(@Query('tag') tag: number) {
    const result = await Video.findAll({
      where: {
        status: 1,
        tags: {
          [Op.like]: `%${tag.toString()}%`,
        },
      },
      order: [['viewCount', 'DESC']],
      raw: true,
    });
    if (result instanceof Error) {
      return res_obj('获取视频列表失败');
    }

    const ret = [];

    for (let i = 0; i < result.length; i++) {
      const { avatar } = await User.findOne({
        attributes: ['avatar'],
        where: {
          username: result[i].author,
        },
      });

      const tagIds = format(result[i].tags);

      const tagNames = await Promise.all(
        tagIds.map(async id => {
          const { tag } = await Tag.findOne({
            attributes: ['tag'],
            where: {
              id,
            },
            raw: true,
          });
          return tag;
        })
      );

      ret[i] = {
        avatar,
        tagNames,
        tagIds,
        ...result[i],
      };
    }

    return res_obj('', ret);
  }

  // 获取关注作者视频
  @Get('/star')
  async getVideoByStarAuthor(@Query('username') username: string) {
    const ret = await User.findOne({
      attributes: ['stars'],
      where: {
        username,
      },
      raw: true,
    });
    if (ret instanceof Error) {
      return res_obj('获取关注作者信息失败');
    }
    const users = ret.stars.split(',').filter(i => i);

    if (users.length) {
      const res = await Promise.all(
        users.map(
          async user =>
            await Video.findAll({
              where: {
                author: user,
                status: 1,
              },
              raw: true,
            })
        )
      );
      // 按时间排序
      const result: any[] = res
        .flat(+Infinity)
        .sort(
          (a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt)
        );

      const ress = [];

      for (let i = 0; i < result.length; i++) {
        const { avatar } = await User.findOne({
          attributes: ['avatar'],
          where: {
            username: result[i].author,
          },
        });

        const tagIds = format(result[i].tags);

        const tagNames = await Promise.all(
          tagIds.map(async id => {
            const { tag } = await Tag.findOne({
              attributes: ['tag'],
              where: {
                id,
              },
              raw: true,
            });
            return tag;
          })
        );

        ress[i] = {
          avatar,
          tagNames,
          tagIds,
          ...result[i],
        };
      }
      return res_obj('', ress);
    }

    return res_obj('', []);
  }

  // 视频重新发起审核
  @Post('/review')
  async doVideoReview(@Body('videoId') videoId: number) {
    // 更新视频状态
    const res = await Video.update(
      { status: 0 },
      {
        where: {
          id: videoId,
        },
      }
    );
    if (res instanceof Error) {
      return res_obj('发起审核异常');
    }

    // 新建审核记录
    const ret = await Review.create({
      videoId,
      result: 0,
    });
    if (ret instanceof Error) {
      return res_obj('发起审核异常');
    }

    return res_obj('');
  }
}
