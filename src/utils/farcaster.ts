import { NeynarAPIClient } from "@neynar/nodejs-sdk";

export const getFarcasterUserCasts = async (
  neynar: NeynarAPIClient,
  fid: number
) => {
  const casts: any[] = [];

  let feedResponse = await neynar.fetchCastsForUser(fid);

  if (feedResponse.casts.length > 0) {
    casts.push(...feedResponse.casts);
  }

  while (feedResponse.next.cursor) {
    feedResponse = await neynar.fetchCastsForUser(fid, {
      cursor: feedResponse.next.cursor,
    });

    if (feedResponse.casts.length === 0) {
      break;
    }

    casts.push(...feedResponse.casts);
  }

  return casts;
};
