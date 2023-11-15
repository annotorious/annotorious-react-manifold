import { Origin } from '@annotorious/react';
import type { 
  Annotation, 
  AnnotationBody, 
  Annotator
} from '@annotorious/react';

export interface AnnotoriousManifoldInstance<I extends Annotation = Annotation, E extends { id: string } = Annotation> {

  annotators: Annotator<I, E>[];

  sources: string[];

  addBody(body: AnnotationBody, origin?: Origin): void;

  clear(origin: Origin): void;

  deleteAnnotation(id: string, origin?: Origin): I | undefined;

  deleteBody(body: AnnotationBody, origin?: Origin): void;

  destroy(): void;

  findAnnotator(annotationId: string): Annotator<I, E> | undefined;

  findSource(annotationId: string): string | undefined;

  getAnnotation(id: string): I | undefined;

  getAnnotations(): I[];
  
  setSelected(annotationId: string): void;

  updateAnnotation(arg1: string | I, arg2?: I | Origin, arg3?: Origin): void;

}

export const createManifoldInstance = <I extends Annotation = Annotation, E extends { id: string } = Annotation>(
  annotators: Map<string, Annotator<I, E>>
): AnnotoriousManifoldInstance<I, E> => {

  const find = (annotationId: string): { annotation?: I, source?: string, annotator?: Annotator<I, E> } =>
    Array.from(annotators.entries()).reduce((found, [source, annotator]) => {
      if (found)
        return found;

      const annotation = annotator.state.store.getAnnotation(annotationId);
      if (annotation) 
        return { annotation, annotator, source };
    }, undefined as { annotation: I, annotator: Annotator<I, E> } | undefined ) || 

    { annotation: undefined, annotator: undefined, source: undefined };

  /*********/
  /** API **/
  /*********/

  const addBody = (body: AnnotationBody, origin = Origin.LOCAL) => {
    const { annotator } = find(body.annotation);
    if (annotator)
      annotator.state.store.addBody(body, origin);
  }

  const clear = (origin = Origin.LOCAL) =>
    Array.from(annotators.values()).forEach(a => a.state.store.clear(origin));

  const deleteAnnotation = (id: string, origin = Origin.LOCAL) => {
    const { annotation, annotator } = find(id);

    if (annotator) {
      annotator.state.store.deleteAnnotation(id, origin);
      return annotation;
    }
  }

  const deleteBody = (body: AnnotationBody, origin = Origin.LOCAL) => {
    const { annotator } = find(body.annotation);
    if (annotator)
      annotator.state.store.deleteBody(body, origin);
  }

  const destroy = () =>
    Array.from(annotators.values()).forEach(a => a.destroy());

  const findAnnotator = (annotationId: string) => {
    const { annotator } = find(annotationId);
    return annotator;
  }

  const findSource = (annotationId: string) => {
    const { source } = find(annotationId);
    return source;
  }

  const getAnnotation = (id: string) => 
    find(id).annotation;

  const getAnnotations = () => 
    Array.from(annotators.values()).reduce((all, annotator) =>
      [...all, ...annotator.state.store.all()], [] as I[]);

  const updateAnnotation = (arg1: string | I, arg2?: I | Origin, arg3?: Origin) => {
    const oldId: string = typeof arg1 === 'string' ? arg1 : arg1.id;

    const { annotator } = find(oldId);
    if (annotator)
      annotator.state.store.updateAnnotation(arg1, arg2, arg3);
  }

  const setSelected = (id: string) => {
    // Note: keeping this for later - but needs handling in the 
    // context provider, because we need to mute selection events!
    /*
    if (Array.isArray(idOrIds)) {
      const resolved = idOrIds.map(find).filter(t => t.annotator);

      const groupedByAnnotator = resolved.reduce((grouped, { annotator, annotation }) => {
        const existing = grouped.find(t => t.annotator === annotator);
        if (existing) {
          // Append this annotation
          return grouped.map(t => t.annotator === existing.annotator ? 
            { 
              annotator, 
              annotations: [...t.annotations, annotation ] 
            } : t);
        } else {
          // New entry
          return [...grouped, {
            annotator,
            annotations: [ annotation ]
          }];
        }  
      }, [] as { annotator: Annotator<I, E>, annotations: I[] }[]);

      groupedByAnnotator.forEach(({ annotator, annotations }) => {
        
      })
    } else { 
    */
      const { annotator } = find(id);
      if (annotator)
        annotator.setSelected(id);
    // }
  }

  return {
    annotators: [...annotators.values()],
    sources: [...annotators.keys()],
    addBody,
    clear,
    deleteAnnotation,
    deleteBody,
    destroy,
    findAnnotator,
    findSource,
    getAnnotation,
    getAnnotations,
    setSelected,
    updateAnnotation
  }

}