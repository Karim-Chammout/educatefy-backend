import { ContentComponent, ContentComponentTypeEnumType } from '../../types/db-generated-types';
import { ContextType } from '../../types/types';

const componentLoaders = {
  [ContentComponentTypeEnumType.Text]: (loaders: ContextType['loaders'], id: number) =>
    loaders.TextContent.loadByComponentId(id),
  [ContentComponentTypeEnumType.Video]: (loaders: ContextType['loaders'], id: number) =>
    loaders.VideoContent.loadByComponentId(id),
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
    console.error(`Error loading component ${id} of type ${type}: `, error);
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
