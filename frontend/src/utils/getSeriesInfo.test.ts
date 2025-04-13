

import getSeriesInfo from '@/utils/getSeriesInfo';
import {expect,describe,it} from '@jest/globals';

describe('getSeriesInfo', () => {
  it('should return correct series info for valid input', async () => {
    const params = { page: 0, skipPage: 16, take: 16 };
    const data = await getSeriesInfo(params);
    expect(data).toBeDefined();
  });

  it('should handle error cases gracefully', async () => {
    await expect(getSeriesInfo({ page: -1, skipPage: 16, take: 16 })).resolves.toBeInstanceOf(Array);
  });
});
