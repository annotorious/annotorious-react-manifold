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

  getAnnotation(id: string): I | undefined;

  getAnnotations(): I[];

  updateAnnotation(arg1: string | I, arg2?: I | Origin, arg3?: Origin): void;

}

export const createManifoldInstance = <I extends Annotation = Annotation, E extends { id: string } = Annotation>(
  annotators: Map<string, Annotator<I, E>>
): AnnotoriousManifoldInstance<I, E> => {

  const find = (annotationId: string): { annotation?: I, annotator?: Annotator<I, E> } =>
    Array.from(annotators.values()).reduce((found, annotator) => {
      if (found)
        return found;

      const annotation = annotator.state.store.getAnnotation(annotationId);
      if (annotation) 
        return { annotation, annotator };
    }, undefined as { annotation: I, annotator: Annotator<I, E> } | undefined ) || 

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
      [...all, ...annotator.state.store.all()], [] as I[]);

  const updateAnnotation = (arg1: string | I, arg2?: I | Origin, arg3?: Origin) => {
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