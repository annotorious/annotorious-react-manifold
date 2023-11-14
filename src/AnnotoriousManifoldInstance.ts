import { Origin } from '@annotorious/react';
import type { 
  Annotation, 
  AnnotationBody, 
  Annotator, 
  LifecycleEvents
} from '@annotorious/core/src';

export interface AnnotoriousManifoldInstance<I extends Annotation = Annotation, E extends unknown = Annotation> {

  annotators: Annotator<I, E>[];

  sources: string[];

  // style: DrawingStyle | ((annotation: I) => DrawingStyle) | undefined;

  addBody(body: AnnotationBody, origin?: Origin): void;

  clear(origin: Origin): void;

  deleteAnnotation(id: string, origin?: Origin): E | undefined;

  destroy(): void;

  getAnnotationById(id: string): E | undefined;

  getAnnotations(): E[];
  
  on<T extends keyof LifecycleEvents<E>>(event: T, callback: LifecycleEvents<E>[T]): void;

  off<T extends keyof LifecycleEvents<E>>(event: T, callback: LifecycleEvents<E>[T]): void;

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

  const destroy = () =>
    Array.from(annotators.values()).forEach(a => a.destroy());

  const getAnnotationById = (id: string) => 
    find(id).annotation;

  const getAnnotations = () => 
    Array.from(annotators.values()).reduce((all, annotator) =>
      [...all, ...annotator.getAnnotations()], [] as E[])

  // @ts-ignore
  return {
    annotators: [...annotators.values()],
    sources: [...annotators.keys()],
    addBody,
    clear,
    deleteAnnotation,
    destroy,
    getAnnotationById,
    getAnnotations
  }

}