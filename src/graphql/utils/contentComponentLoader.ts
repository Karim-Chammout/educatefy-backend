import { ContentComponent } from '../../types/db-generated-types.js';
import { ContextType } from '../../types/types.js';
import logger from '../../utils/logger.js';
import { getComponentConfig } from './contentComponentRegistry.js';

export const loadComponent = async (
  loaders: ContextType['loaders'],
  componentData: ContentComponent,
) => {
  const { id, type, denomination, is_published, is_required, rank } = componentData;

  const config = getComponentConfig(type);

  if (!config) {
    logger.warn({ componentId: id, type }, 'Unknown content component type');
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
    const content = await config.loadByComponentId(loaders, id);

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
