import { ReactNode, useContext, useEffect } from 'react';
import { Annotation, Annotator, useAnnotator } from '@annotorious/react';
import { Annotorious as AnnotoriousInstance } from '@annotorious/react';
import { AnnotoriousManifoldContext } from './AnnotoriousManifold';

/**
 * Consumes the standard Annotorious context, and passes the Annotator
 * upwards to the manifold.
 */
const AnnotoriousInstanceShim = <I extends Annotation = Annotation, E extends unknown = Annotation>(props: { children: ReactNode }) => {

  const anno = useAnnotator<Annotator<I, E>>();

  const { setAnnotators } = useContext(AnnotoriousManifoldContext);

  useEffect(() => {
    if (anno) {
      setAnnotators(annotators => 
        annotators.indexOf(anno) >= 0 ? annotators : [...annotators, anno]);

      return () => {
        setAnnotators(annotators => annotators.filter(a => a !== anno));
      }
    }
  }, [anno]);

  return props.children;

}

/**
 * An alternative <Annotorious /> component that mimicks the original
 * from @annotorious/react, but injects the shim component, which connects
 * the Annotator to the Manifold.
 */
export const Annotorious = (props: { children: ReactNode }) => {

  return (
    <AnnotoriousInstance>
      <AnnotoriousInstanceShim>
        {props.children}
      </AnnotoriousInstanceShim>
    </AnnotoriousInstance>
  )

}