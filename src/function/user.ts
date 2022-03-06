import {
  Body,
  Config,
  Controller,
  Get,
  Post,
  Provide,
  Query,
  Queries,
  ALL,
} from '@midwayjs/decorator';
import { User } from '../model/user';
import res_obj from '../utils/res_obj';
import encode from '../utils/encode';
const jwt = require('jsonwebtoken');
import { VerifyMiddleware } from '../middleware/verify';
import { Video } from '../model/video';
import format from '../utils/format';

interface editUser {
  sex: number;
  age: number;
  signature: string;
  avatar?: string;
  background?: string;
}

@Provide()
@Controller('/user')
export class HomeController {
  @Config('jwt')
  jwtConfig;

  @Post('/registry')
  async registry(@Body() user_info) {
    const {
      username,
      password,
      sex = 3,
      age,
      signature,
      avatar = '111',
      background = '222',
    } = user_info;
    // 判断用户是否已经存在
    const exists = await User.findOne({
      attributes: ['username'],
      where: {
        username,
      },
    });
    if (exists) {
      return res_obj('用户已存在');
    }

    // 创建用户，将用户信息写入数据库
    const password_hash = encode(password);
    const create_res = await User.create({
      username,
      password: password_hash,
      sex: sex === '男' ? 0 : 1,
      age,
      signature,
      avatar,
      background,
    });
    if (create_res instanceof Error) {
      return res_obj('创建用户失败');
    }

    // 构造用户信息
    const user = {
      username,
      password,
    };

    // 生成 token
    const token = jwt.sign(user, this.jwtConfig.secret);
    return res_obj('', {
      token,
    });
  }

  @Post('/login')
  async login(@Body() user_info) {
    const { username, password } = user_info;
    // 判断用户是否已经存在
    const exists = await User.findOne({
      attributes: ['username', 'password'],
      where: {
        username,
      },
    });
    if (!exists) {
      return res_obj('用户不存在');
    }

    // 判断密码是否正确
    if (encode(password) !== exists.password) {
      return res_obj('密码错误');
    }

    // 构造用户信息
    const user = {
      username,
      password,
    };

    // 生成 token
    const token = jwt.sign(user, this.jwtConfig.secret);
    return res_obj('', {
      token,
    });
  }

  @Post('/edit', { middleware: [VerifyMiddleware] })
  async editUserInfo(@Body() user_info) {
    const { username, sex = 3, age, signature, avatar, background } = user_info;
    const updateData: editUser = {
      sex: sex === '男' ? 0 : 1,
      age,
      signature,
    };
    if (avatar) {
      updateData.avatar = avatar;
    }
    if (background) {
      updateData.background = background;
    }
    // 创建用户，将用户信息写入数据库
    const update_res = await User.update(updateData, {
      where: {
        username,
      },
    });
    if (update_res instanceof Error) {
      return res_obj('修改用户信息失败');
    }

    return res_obj('', '修改成功');
  }

  @Get('/info')
  async info(@Query('username') username: string) {
    const userInfo = await User.findOne({
      attributes: [
        'username',
        'age',
        'avatar',
        'background',
        'signature',
        'sex',
        'likes',
        'stars',
        'fans',
      ],
      where: {
        username,
      },
      raw: true,
    });

    return res_obj('', userInfo);
  }

  @Get('/works', { middleware: [VerifyMiddleware] })
  async getWork(@Queries(ALL) queries) {
    const { username, pn, limit = 6 } = queries;
    const { works } = await User.findOne({
      attributes: ['works'],
      where: {
        username,
      },
      raw: true,
    });

    const my_work_ids = format(works).slice(pn * limit, pn * limit + limit);
    let my_works = [];
    if (my_work_ids.length) {
      my_works = await Promise.all(
        my_work_ids.map(async id => {
          return await Video.findOne({
            where: {
              id,
            },
          });
        })
      );
    }

    return res_obj('', {
      works: JSON.stringify(my_works),
      pn,
      limit,
    });
  }

  @Get('/like_works', { middleware: [VerifyMiddleware] })
  async getLikeWork(@Queries(ALL) queries) {
    const { username, pn, limit = 6 } = queries;
    const { like_works } = await User.findOne({
      attributes: ['like_works'],
      where: {
        username,
      },
      raw: true,
    });

    const my_work_ids = format(like_works).slice(
      pn * limit,
      pn * limit + limit
    );
    let my_works = [];
    if (my_work_ids.length) {
      my_works = await Promise.all(
        my_work_ids.map(async id => {
          return await Video.findOne({
            where: {
              id,
            },
          });
        })
      );
    }

    return res_obj('', {
      works: JSON.stringify(my_works),
      pn,
      limit,
    });
  }

  @Get('/star_works', { middleware: [VerifyMiddleware] })
  async getStarWork(@Queries(ALL) queries) {
    const { username, pn, limit = 6 } = queries;
    const { star_works } = await User.findOne({
      attributes: ['star_works'],
      where: {
        username,
      },
      raw: true,
    });

    const my_work_ids = format(star_works).slice(
      pn * limit,
      pn * limit + limit
    );
    let my_works = [];
    if (my_work_ids.length) {
      my_works = await Promise.all(
        my_work_ids.map(async id => {
          return await Video.findOne({
            where: {
              id,
            },
          });
        })
      );
    }

    return res_obj('', {
      works: JSON.stringify(my_works),
      pn,
      limit,
    });
  }
}
