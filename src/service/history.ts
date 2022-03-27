// src/service/user.ts
import { Provide } from '@midwayjs/decorator';
import { Op } from 'sequelize';
import { Tag } from '../model/tag';
import { User } from '../model/user';
import { ViewHistory } from '../model/view_history';
import format from '../utils/format';

@Provide()
export class HistoryService {
  // 获取一段时间(7天)内各标签被观看次数
  async getTagViewCount(username) {
    const tags = await Tag.findAll({
      attributes: ['id'],
      raw: true,
    });

    const res = await Promise.all(
      tags.map(async ({ id }) => {
        const lists = await ViewHistory.findAll({
          attributes: ['viewCount'],
          where: {
            username,
            tags: {
              [Op.like]: `%,${id},%`,
            },
            updatedAt: {
              [Op.gt]: Date.now() - 7 * 24 * 60 * 60 * 1000,
            },
          },
        });

        const count = lists.reduce((pre, cur) => {
          pre += cur.viewCount;
          return pre;
        }, 0);

        return {
          tag: id,
          count,
        };
      })
    );

    return res;
  }

  // 获取一段时间（7天）内各标签观看视频个数
  async getTagVideoCount(username) {
    const tags = await Tag.findAll({
      attributes: ['id'],
      raw: true,
    });

    const user = await User.findOne({
      attributes: ['like_works', 'star_works'],
      where: {
        username,
      },
    });

    const like_works = format(user.like_works);
    const star_works = format(user.star_works);

    const res = await Promise.all(
      tags.map(async ({ id }) => {
        const lists = await ViewHistory.findAll({
          attributes: ['videoId'],
          where: {
            username,
            tags: {
              [Op.like]: `%,${id},%`,
            },
            updatedAt: {
              [Op.gt]: Date.now() - 7 * 24 * 60 * 60 * 1000,
            },
          },
        });

        const videoIds = lists.map(i => i.videoId);

        const likeIds = videoIds.filter(i => like_works.includes(i.toString()));
        const starIds = videoIds.filter(i => star_works.includes(i.toString()));

        const videoViewCount = videoIds.length;
        return {
          tag: id,
          videoCount: videoViewCount, // 该标签对应的视频个数
          likeRate:
            videoViewCount > 0
              ? Math.floor((likeIds.length / videoViewCount) * 100) / 100
              : 0,
          starRate:
            videoViewCount > 0
              ? Math.floor((starIds.length / videoViewCount) * 100) / 100
              : 0,
        };
      })
    );

    return res;
  }

  async getVideoAnalysis(username) {
    // 计算 7 天内用户观看视频总次数
    const lists = await ViewHistory.findAll({
      attributes: ['viewCount'],
      where: {
        username,
        createdAt: {
          [Op.gt]: Date.now() - 7 * 24 * 60 * 60 * 1000,
        },
      },
    });

    const totalCount = lists.reduce((pre, cur) => {
      pre += cur.viewCount;
      return pre;
    }, 0);

    // 各类型视频观看次数
    const tagCount = await this.getTagViewCount(username);

    // 各类型视频观看个数、点赞率、收藏率
    const tagVideoCount = await this.getTagVideoCount(username);

    const tagRate = tagCount.map(i => {
      const rate = totalCount
        ? Math.floor((i.count / totalCount) * 100) / 100
        : 0;
      const info = tagVideoCount.find(j => j.tag === i.tag);

      return {
        rate,
        ...info,
        ...i,
      };
    });

    return tagRate;
  }
}
