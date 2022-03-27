import { Provide } from '@midwayjs/decorator';
import { Op } from 'sequelize';
import { Video } from '../model/video';

@Provide()
export class VideoService {
  async getHotVideoByTag(tag, limit) {
    return await Video.findAll({
      where: {
        status: 1,
        tags: {
          [Op.like]: `%${tag.toString()}%`,
        },
      },
      order: [['viewCount', 'DESC']],
      raw: true,
      limit,
    });
  }
}
