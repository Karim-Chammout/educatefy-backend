import { GraphQLUnionType } from 'graphql';

import { ContentComponentTypeEnumType } from '../../../../types/db-generated-types';
import { TextContent } from '../TextContent';
import { VideoContent } from '../VideoContent';

export const ContentComponent = new GraphQLUnionType({
  name: 'ContentComponent',
  description: 'A content component which can be of various types.',
  types: [TextContent, VideoContent],
  resolveType(value) {
    switch (value.type) {
      case ContentComponentTypeEnumType.Text:
        return 'TextContent';
      case ContentComponentTypeEnumType.Video:
        return 'VideoContent';
      default:
        return 'UNKNOWN_CONTENT_TYPE';
    }
  },
});
