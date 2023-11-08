import { ReactNode, createContext, useContext, useState } from 'react';
import type { Annotation, Annotator, StoreChangeEvent } from '@annotorious/core';
import { AnnotoriousManifoldInstance, createManifoldInstance } from './AnnotoriousManifoldInstance';

interface AnnotoriousManifoldContextValue {

  annotators: Map<string, Annotator<any, unknown>>;

  annotations: Map<string, Annotation[]>;

  selection: ManifoldSelection;

  connectAnnotator(source: string, anno: Annotator<any, unknown>): () => void;

}

interface ManifoldSelection {

  source?: string;

  selected: { annotation: Annotation, editable?: boolean }[],

  pointerEvent?: PointerEvent;

}

export const AnnotoriousManifoldContext = createContext<AnnotoriousManifoldContextValue>({

  annotators: undefined,

  annotations: undefined,

  selection: undefined,

  connectAnnotator: undefined

});

export const AnnotoriousManifold = (props: { children: ReactNode }) => {

  const [annotators, setAnnotators] = useState<Map<string, Annotator<any, unknown>>>(new Map());

  const [annotations, setAnnotations] = useState<Map<string, Annotation[]>>(new Map());

  const [selection, setSelection] = useState<ManifoldSelection>({ selected: [] });

  const connectAnnotator = (source: string, anno: Annotator<any, unknown>) => {
    // Add the annotator to the state
    setAnnotators(m => new Map(m.entries()).set(source, anno))

    const { store } = anno.state;
    const selectionState = anno.state.selection;

    // Add the annotations to the state
    setAnnotations(m => new Map(m.entries()).set(source, store.all()));

    const onStoreChange = () =>
      setAnnotations(m => new Map(m.entries()).set(source, store.all()));

    store.observe(onStoreChange);

    // Track selection
    let selectionStoreObserver: (event: StoreChangeEvent<Annotation>) => void;

    const unsubscribeSelection = selectionState.subscribe(({ selected, pointerEvent }) => {
      if (selectionStoreObserver) 
        store.unobserve(selectionStoreObserver);

      const resolved = (selected || [])
        .map(({ id, editable }) => ({ annotation: store.getAnnotation(id), editable }));

      // Set the new selection
      setSelection({ source, selected: resolved, pointerEvent });

      // Track the state of the selected annotations in the store
      selectionStoreObserver = event => {
        const { updated } = event.changes;

        setSelection(({ selected }) => ({
          source,
          selected: selected.map(({ annotation, editable }) => {
            const next = updated.find(u => u.oldValue.id === annotation.id);
            return next ? { annotation: next.newValue, editable } : { annotation, editable };
          })
        }));
      }

      store.observe(selectionStoreObserver, { annotations: selected.map(({ id }) => id) });
    });

    return () => {
      // Remove annotator
      setAnnotators(m => new Map(Array.from(m.entries()).filter(([key, _]) => key !== source)));

      // Remove & untrack annotations
      setAnnotations(m => new Map(Array.from(m.entries()).filter(([key, _]) => key !== source)));
      store.unobserve(onStoreChange);

      // Un-track selection and clear, if necessary
      if (selection.source === source)
        setSelection({ selected: [] });

      unsubscribeSelection();
    }
  }

  return (
    <AnnotoriousManifoldContext.Provider value={{   
      annotators, 
      annotations,
      selection,
      connectAnnotator 
    }}>
      {props.children}
    </AnnotoriousManifoldContext.Provider>
  )

}

export const useAnnotoriousManifold = <I extends Annotation = Annotation, E extends unknown = Annotation>() => {
  const { annotators } = useContext(AnnotoriousManifoldContext);
  return createManifoldInstance(annotators) as AnnotoriousManifoldInstance<I, E>;
}

export const useAnnotations = <T extends Annotation>() => {
  const { annotations } = useContext(AnnotoriousManifoldContext);
  return annotations as Map<string, T[]>;
}

export const useSelection = () => {
  const { selection } = useContext(AnnotoriousManifoldContext);
  return selection;
}
