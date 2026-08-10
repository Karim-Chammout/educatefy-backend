import {
  CourseSectionItem as CourseSectionItemType,
  CourseSectionItemContentTypeEnumType,
} from '../../../../types/db-generated-types.js';
import { CourseSectionItemBase } from './CourseSectionItem.generated.js';

export class CourseSectionItemReader extends CourseSectionItemBase {
  /**
   * Load all CourseSectionItem records matching both the content id and the
   * content type. The generated `loadByContentId` only filters on `content_id`,
   * which is ambiguous because lesson and quiz rows share independent id
   * sequences and can collide.
   */
  loadByContentIdAndType(
    contentId: number,
    contentType: CourseSectionItemContentTypeEnumType,
  ): Promise<ReadonlyArray<CourseSectionItemType>> {
    return this.db
      .table('course_section_item')
      .where('content_id', contentId)
      .where('content_type', contentType)
      .whereNull('deleted_at')
      .select();
  }
}
