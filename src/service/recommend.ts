// src/service/recommend.ts
import { Inject, Provide } from '@midwayjs/decorator';
import { User } from '../model/user';
import { Op } from 'sequelize';
import { HistoryService } from './history';
import array from '../utils/array';
import matrixToArray from '../utils/matrix-to-array';
import { VideoService } from './video';
const math = require('mathjs');

@Provide()
export class RecommendService {
  @Inject()
  historyService: HistoryService;

  @Inject()
  videoService: VideoService;

  // 构建初始矩阵
  async initMatrix(username) {
    // 用户量巨大的情况下，显然不可能求与所有用户的相似度
    // 此处基于用户年龄和性别进行分桶
    // 1. 获取当前用户性别，年龄
    const { age, sex } = await User.findOne({
      attributes: ['age', 'sex'],
      where: {
        username,
      },
    });

    // 2. 基于当前用户获取用户组
    const users: { username: string }[] = await User.findAll({
      attributes: ['username'],
      where: {
        username: {
          [Op.not]: username,
        },
        sex,
        age: { [Op.between]: [age - 5, age + 5] },
      },
      limit: 19,
      raw: true,
    });

    users.unshift({ username });

    // 3. 构建初始矩阵
    const res = await Promise.all(
      users.map(async ({ username }) => {
        return await this.historyService.getVideoAnalysis(username);
      })
    );

    const evalRes = res.map(item => {
      return item.map(i => {
        return (
          Math.floor(
            (i.rate * 0.5 + i.likeRate * 0.25 + i.starRate * 0.25) * 100
          ) / 100
        );
      });
    });

    console.log('=======> evalRes', evalRes);

    return evalRes;
  }

  // 推荐算法
  async recommendAlgorism(initData) {
    //0. 初始数组转化为矩阵
    const X = math.matrix(initData); // 3*4
    console.log('X', X);
    // 1. 转置X
    const X2 = math.transpose(X); // 4 * 3
    console.log('X2', X2);

    // 2. X * X'，矩阵 Y 中第 i 行第 j 列表示用户i，j行向量之积
    const Y = math.multiply(X, X2); // 3 * 3
    console.log('Y', Y);

    // 3. US
    // 3.1 获取矩阵行列数
    const size = math.size(X); // m行 n列
    const m = size.subset(math.index(0));
    const n = size.subset(math.index(1));
    console.log('m, n', size, m, n);

    // 3.2 构建用户相似度矩阵
    const arr = array(m, m);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        if (i === j) {
          arr[i][j] = 1;
        } else if (
          Y.subset(math.index(i, i)) === 0 ||
          Y.subset(math.index(j, j)) === 0
        ) {
          arr[i][j] = 0;
        } else {
          arr[i][j] =
            Y.subset(math.index(i, j)) /
            (math.sqrt(Y.subset(math.index(i, i))) *
              math.sqrt(Y.subset(math.index(j, j))));
        }
      }
    }
    const US = math.matrix(arr); // 3 * 3
    console.log('US', US);

    // 4. USP = US · X，用户相似度矩阵与用户初始喜爱度矩阵之积即为新的用户喜爱度矩阵
    const USP = math.multiply(US, X); // 3* 3 3*4 => 3*4
    console.log('USP', USP);

    // 5. USR = US 按行求和
    const tmp = array(m, n);
    const USArray = matrixToArray(US);
    USArray.forEach((value, i) => {
      console.log(value, i);
      for (let j = 0; j < n; j++) {
        tmp[i][j] = math.sum(...value);
      }
    });
    const USR = math.matrix(tmp); // 3*4
    console.log('USR', USR);

    // 6. 归一化处理，第i行即表示用户i对不同物品的喜爱度
    const USPArray = matrixToArray(USP);
    const USRArray = matrixToArray(USR);

    const P = array(m, n);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (USRArray[i][j] === 0) {
          P[i][j] = 0;
        } else {
          P[i][j] = Math.floor((USPArray[i][j] / USRArray[i][j]) * 1000) / 1000;
        }
      }
    }

    console.log(P, '============================> PPPP');

    return P[0];
  }

  // 具体推荐内容
  async recommendContent(percentArray) {
    const total = math.sum(...percentArray);
    // 按照 percent 降序排列
    const res = percentArray
      .map((percent, index) => ({
        tag: index + 1,
        count: Math.floor((percent / total) * 10),
      }))
      .filter(i => i.count > 0)
      .sort((a, b) => b.count - a.count);

    // 获取对应count数量的tag类型的热门视频
    let result = await Promise.all(
      res.map(async ({ tag, count }) => {
        return await this.videoService.getHotVideoByTag(tag, count);
      })
    );

    // 去重
    const set = new Set();
    result = result.flat(Infinity).filter(item => {
      if (set.has(item.id)) {
        return false;
      } else {
        set.add(item.id);
        return true;
      }
    });

    return result.sort(() => Math.random() - 0.5);
  }
}
