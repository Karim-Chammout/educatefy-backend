import { ContentComponent, ContentComponentTypeEnumType } from '../../types/db-generated-types.js';
import { ContextType } from '../../types/types.js';
import logger from '../../utils/logger.js';

const componentLoaders = {
  [ContentComponentTypeEnumType.Text]: (loaders: ContextType['loaders'], id: number) =>
    loaders.TextContent.loadByComponentId(id),
  [ContentComponentTypeEnumType.Video]: (loaders: ContextType['loaders'], id: number) =>
    loaders.VideoContent.loadByComponentId(id),
  [ContentComponentTypeEnumType.Youtube]: (loaders: ContextType['loaders'], id: number) =>
    loaders.YoutubeContent.loadByComponentId(id),
};

export const loadComponent = async (
  loaders: ContextType['loaders'],
  componentData: ContentComponent,
) => {
  const { id, type, denomination, is_published, is_required, rank } = componentData;

  const loader = componentLoaders[type];

  if (!loader) {
    return null;
  }

  const componentValuesToInject = {
    type,
    denomination,
    is_published,
    is_required,
    rank,
  };

  try {
    const content = await loader(loaders, id);

    return content ? { ...content, ...componentValuesToInject } : null;
  } catch (error) {
    logger.error({ err: error, componentId: id, type }, 'Error loading content component');
    return null;
  }
};

export const loadComponents = async (
  loaders: ContextType['loaders'],
  componentsData: ReadonlyArray<ContentComponent>,
) => {
  const loadedComponents = await Promise.all(
    componentsData.map((componentData) => loadComponent(loaders, componentData)),
  );

  return loadedComponents;
};
