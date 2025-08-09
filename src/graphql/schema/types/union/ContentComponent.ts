import { GraphQLUnionType } from 'graphql';

import { ContentComponentTypeEnumType } from '../../../../types/db-generated-types';
import { TextContent } from '../TextContent';
import { VideoContent } from '../VideoContent';
import { YouTubeContent } from '../YouTubeContent';

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
