import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { AnnotoriousManifoldInstance, createManifoldInstance } from './AnnotoriousManifoldInstance';
import { Annotation, Annotator } from '@annotorious/core';

interface AnnotoriousManifoldContextValue {

  annotators: Annotator<any, unknown>[];

  setAnnotators: React.Dispatch<React.SetStateAction<Annotator<any, unknown>[]>>;

}

export const AnnotoriousManifoldContext = createContext<AnnotoriousManifoldContextValue>({

  annotators: undefined,

  setAnnotators: undefined

});

export const AnnotoriousManifold = (props: { children: ReactNode }) => {

  const [annotators, setAnnotators] = useState<Annotator<any, unknown>[]>([]);

  useEffect(() =>{
    // ... destroy all annotators on unmount
    return () => {
      setAnnotators(annotators => {
        annotators.forEach(a => a.destroy());
        return [];
      })
    }
  }, []);

  return (
    <AnnotoriousManifoldContext.Provider value={{ annotators, setAnnotators }}>
      {props.children}
    </AnnotoriousManifoldContext.Provider>
  )

}

export const useAnnotoriousManifold = <I extends Annotation = Annotation, E extends unknown = Annotation>() => {
  const { annotators } = useContext(AnnotoriousManifoldContext);
  return createManifoldInstance(annotators) as AnnotoriousManifoldInstance<I, E>;
}
