import { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Annotation, Annotator, StoreChangeEvent } from '@annotorious/core';
import { AnnotoriousManifoldInstance, createManifoldInstance } from './AnnotoriousManifoldInstance';

interface AnnotoriousManifoldContextValue {

  annotators: Map<string, Annotator<any, unknown>>;

  annotations: Map<string, Annotation[]>;

  selection: ManifoldSelection;

  connectAnnotator(source: string, anno: Annotator<any, unknown>): () => void;

}

interface ManifoldSelection<T extends Annotation = Annotation> {

  source?: string;

  selected: { annotation: T, editable?: boolean }[],

  pointerEvent?: PointerEvent;

}

// @ts-ignore
export const AnnotoriousManifoldContext = createContext<AnnotoriousManifoldContextValue>();

export const AnnotoriousManifold = (props: { children: ReactNode }) => {

  const [annotators, setAnnotators] = useState<Map<string, Annotator<any, unknown>>>(new Map());

  const [annotations, setAnnotations] = useState<Map<string, Annotation[]>>(new Map());

  const [selection, setSelection] = 
    useState<ManifoldSelection>({ selected: [] });

  // To prevent selection state updates when de-selecting other annotators
  const muteSelectionEvents = useRef<boolean>(false);

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
      if (!muteSelectionEvents.current)
        setSelection({ source, selected: resolved, pointerEvent });

      // Track the state of the selected annotations in the store
      selectionStoreObserver = event => {
        const { updated } = event.changes;

        setSelection(({ source, selected }) => ({
          source,
          selected: selected.map(({ annotation, editable }) => {
            const next = updated.find(u => u.oldValue.id === annotation.id);
            return next ? { annotation: next.newValue, editable } : { annotation, editable };
          }),
          pointerEvent
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

      // Un-track selection
      unsubscribeSelection();
    }
  }

  useEffect(() => {
    if (selection.source) {
      muteSelectionEvents.current = true;

      Array.from(annotators.entries()).forEach(([source, anno]) => {
        if (source !== selection.source)
          anno.setSelected();
      });

      muteSelectionEvents.current = false;
    }
  }, [selection, annotators]);

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

export const useSelection = <T extends Annotation>() => {
  const { selection } = useContext(AnnotoriousManifoldContext);
  return selection as ManifoldSelection<T>;
}
