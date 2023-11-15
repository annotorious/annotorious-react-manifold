import { Origin } from '@annotorious/react';
import type { 
  Annotation, 
  AnnotationBody, 
  Annotator
} from '@annotorious/react';

export interface AnnotoriousManifoldInstance<I extends Annotation = Annotation, E extends unknown = Annotation> {

  annotators: Annotator<I, E>[];

  sources: string[];

  addBody(body: AnnotationBody, origin?: Origin): void;

  clear(origin: Origin): void;

  deleteAnnotation(id: string, origin?: Origin): E | undefined;

  deleteBody(body: AnnotationBody, origin?: Origin): void;

  destroy(): void;

  getAnnotation(id: string): E | undefined;

  getAnnotations(): E[];

  updateAnnotation(arg1: string | I, arg2: I | Origin, arg3: Origin): void;

}

export const createManifoldInstance = <I extends Annotation = Annotation, E extends unknown = Annotation>(
  annotators: Map<string, Annotator<I, E>>
): AnnotoriousManifoldInstance<I, E> => {

  const find = (annotationId: string): { annotation?: E, annotator?: Annotator<I, E> } =>
    Array.from(annotators.values()).reduce((found, annotator) => {
      if (found)
        return found;

      const annotation = annotator.getAnnotationById(annotationId);
      if (annotation) 
        return { annotation, annotator };
    }, undefined as { annotation: E, annotator: Annotator<I, E> } | undefined ) || 

    { annotation: undefined, annotator: undefined };

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

  const getAnnotation = (id: string) => 
    find(id).annotation;

  const getAnnotations = () => 
    Array.from(annotators.values()).reduce((all, annotator) =>
      [...all, ...annotator.getAnnotations()], [] as E[]);

  const updateAnnotation = (arg1: string | I, arg2: I | Origin, arg3: Origin) => {
    const oldId: string = typeof arg1 === 'string' ? arg1 : arg1.id;
    const { annotator } = find(oldId);
    if (annotator)
      annotator.state.store.updateAnnotation(arg1, arg2, arg3);
  }

  return {
    annotators: [...annotators.values()],
    sources: [...annotators.keys()],
    addBody,
    clear,
    deleteAnnotation,
    deleteBody,
    destroy,
    getAnnotation,
    getAnnotations,
    updateAnnotation
  }

}