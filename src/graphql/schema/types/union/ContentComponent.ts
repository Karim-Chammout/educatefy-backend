import { GraphQLUnionType } from 'graphql';

import { ContentComponentTypeEnumType } from '../../../../types/db-generated-types.js';
import { TextContent } from '../TextContent.js';
import { VideoContent } from '../VideoContent.js';
import { YouTubeContent } from '../YouTubeContent.js';

export const ContentComponent = new GraphQLUnionType({
  name: 'ContentComponent',
  description: 'A content component which can be of various types.',
  types: [TextContent, VideoContent, YouTubeContent],
  resolveType(value) {
    switch (value.type) {
      case ContentComponentTypeEnumType.Text:
        return 'TextContent';
      case ContentComponentTypeEnumType.Video:
        return 'VideoContent';
      case ContentComponentTypeEnumType.Youtube:
        return 'YouTubeContent';
      default:
        return 'UNKNOWN_CONTENT_TYPE';
    }
  },
});
