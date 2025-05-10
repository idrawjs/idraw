import { createAssetId, isAssetId } from '@idraw/util';

describe('@idraw/util: createAssetId ', () => {
  test('url', () => {
    const url1 = 'https://example.com/2025/01/01/000001.jpg';
    const assetId1 = createAssetId(url1);
    expect(isAssetId(assetId1)).toBeTruthy();

    const url2 = 'https://example.com/2025/01/01/000002.jpg';
    const assetId2 = createAssetId(url2);
    expect(isAssetId(assetId2)).toBeTruthy();

    expect(url1).not.toBe(url2);
  });
});
