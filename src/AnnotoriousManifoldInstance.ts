import { 
  Annotation, 
  Annotator, 
  DrawingStyle, 
  LifecycleEvents 
} from '@annotorious/core';

export interface AnnotoriousManifoldInstance<I extends Annotation = Annotation, E extends unknown = Annotation> {

  annotators: Annotator<I, E>[];

  style: DrawingStyle | ((annotation: I) => DrawingStyle) | undefined;

  clearAnnotations(): void;

  destroy(): void;

  getAnnotationById(id: string): E | undefined;

  getAnnotations(): E[];

  removeAnnotation(arg: E | string): E;

  setAnnotations(annotations: E[]): void;

  updateAnnotation(annotation: E): E;
  
  on<T extends keyof LifecycleEvents<E>>(event: T, callback: LifecycleEvents<E>[T]): void;

  off<T extends keyof LifecycleEvents<E>>(event: T, callback: LifecycleEvents<E>[T]): void;

}

export const createManifoldInstance = <I extends Annotation = Annotation, E extends unknown = Annotation>(
  annotators: Map<string, Annotator<I, E>>
): AnnotoriousManifoldInstance<I, E> => {

  const clearAnnotations = () =>
    Array.from(annotators.values()).forEach(a => a.clearAnnotations());

  const destroy = () =>
    Array.from(annotators.values()).forEach(a => a.destroy());

  const getAnnotationById = (id: string) =>
    Array.from(annotators.values()).reduce((found, annotator) => 
      found ? found : annotator.getAnnotationById(id), undefined as E | undefined);

  // @ts-ignore
  return {
    annotators: [...annotators.values()],
    clearAnnotations,
    destroy,
    getAnnotationById
  }

}