import { createAssetId, isAssetId } from '@idraw/util';

describe('@idraw/util: createAssetId ', () => {
  test('url', () => {
    const url1 = 'https://example.com/2025/01/01/000001.jpg';
    const assetId1 = createAssetId(url1, '001');
    expect(isAssetId(assetId1)).toBeTruthy();
    expect(assetId1).toBe('@assets/01d801ff-0200-023c-019c-015a0150251');

    const url2 = 'https://example.com/2025/01/01/000002.jpg';
    const assetId2 = createAssetId(url2, '002');
    expect(isAssetId(assetId2)).toBeTruthy();
    expect(assetId2).toBe('@assets/01d90200-0201-023d-019d-015b0151252');

    expect(url1).not.toBe(url2);
    expect(assetId1).not.toBe(assetId2);
  });
});
